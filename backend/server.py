from fastapi import FastAPI, APIRouter, HTTPException, Query
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import re


ROOT_DIR = Path(__file__).parent
from notion_client import Client
import json

# Load environment variables
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Notion client
notion_token = os.environ.get('NOTION_TOKEN')
notion = Client(auth=notion_token) if notion_token else None

# Create the main app without a prefix
app = FastAPI(title="English-Portuguese Dictionary API", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class HistoryEntry(BaseModel):
    timestamp: datetime
    field: Optional[str] = None
    old_value: Optional[str] = None
    new_value: Optional[str] = None
    action: str  # 'created', 'updated', 'deleted'

class DictionaryEntry(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    english_term: str
    portuguese_translation: str
    category: Optional[str] = None
    publisher: Optional[str] = None  # Editora (Marvel, DC, etc.)
    comic_universe: Optional[str] = None  # Universo (MCU, DC Universe, etc.)
    secret_identity: Optional[str] = None  # Identidade secreta/versão (ex: "Hank Pym", "Scott Lang")
    character_version: Optional[str] = None  # Versão do personagem (ex: "Primeira encarnação", "Versão Ultimate")
    definition: Optional[str] = None
    examples: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    history: List[HistoryEntry] = Field(default_factory=list)
    version: int = Field(default=1)

class DictionaryEntryCreate(BaseModel):
    english_term: str
    portuguese_translation: str
    category: Optional[str] = None
    publisher: Optional[str] = None
    comic_universe: Optional[str] = None
    secret_identity: Optional[str] = None
    character_version: Optional[str] = None
    definition: Optional[str] = None
    examples: Optional[str] = None

class DictionaryEntryUpdate(BaseModel):
    english_term: Optional[str] = None
    portuguese_translation: Optional[str] = None
    category: Optional[str] = None
    publisher: Optional[str] = None
    comic_universe: Optional[str] = None
    secret_identity: Optional[str] = None
    character_version: Optional[str] = None
    definition: Optional[str] = None
    examples: Optional[str] = None

class HistoryResponse(BaseModel):
    entry_id: str
    english_term: str
    history: List[HistoryEntry]

class SearchResponse(BaseModel):
    entries: List[DictionaryEntry]
    total: int
    page: int
    per_page: int

# Helper functions
def create_history_entry(action: str, field: str = None, old_value: str = None, new_value: str = None):
    """Create a history entry for tracking changes"""
    return {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "field": field,
        "old_value": old_value,
        "new_value": new_value,
        "action": action
    }

def prepare_for_mongo(data):
    """Prepare data for MongoDB storage"""
    if isinstance(data.get('created_at'), datetime):
        data['created_at'] = data['created_at'].isoformat()
    if isinstance(data.get('updated_at'), datetime):
        data['updated_at'] = data['updated_at'].isoformat()
    return data

def parse_from_mongo(item):
    """Parse data retrieved from MongoDB"""
    if isinstance(item.get('created_at'), str):
        item['created_at'] = datetime.fromisoformat(item['created_at'])
    if isinstance(item.get('updated_at'), str):
        item['updated_at'] = datetime.fromisoformat(item['updated_at'])
    return item

# Dictionary routes
@api_router.get("/")
async def root():
    return {"message": "English-Portuguese Dictionary API", "version": "1.0.0"}

@api_router.post("/dictionary", response_model=DictionaryEntry)
async def create_entry(entry: DictionaryEntryCreate):
    """Create a new dictionary entry"""
    try:
        entry_dict = entry.dict()
        
        # Add initial history and version
        entry_dict["history"] = [create_history_entry("created")]
        entry_dict["version"] = 1
        
        entry_obj = DictionaryEntry(**entry_dict)
        entry_data = prepare_for_mongo(entry_obj.dict())
        
        # Check if term already exists with same publisher AND universe
        existing = await db.dictionary_entries.find_one({
            "english_term": {"$regex": f"^{re.escape(entry.english_term)}$", "$options": "i"},
            "publisher": entry_dict.get("publisher"),
            "comic_universe": entry_dict.get("comic_universe")
        })
        if existing:
            publisher_text = f" da {entry_dict.get('publisher')}" if entry_dict.get('publisher') else ""
            universe_text = f" do universo {entry_dict.get('comic_universe')}" if entry_dict.get('comic_universe') else ""
            raise HTTPException(status_code=400, detail=f"Termo '{entry.english_term}'{publisher_text}{universe_text} já existe no dicionário")
        
        result = await db.dictionary_entries.insert_one(entry_data)
        return entry_obj
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/dictionary/search", response_model=SearchResponse)
async def search_entries(
    q: Optional[str] = Query(None, description="Search term"),
    category: Optional[str] = Query(None, description="Filter by category"),
    publisher: Optional[str] = Query(None, description="Filter by publisher/editora"),
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page")
):
    """Search dictionary entries"""
    try:
        # Build search query
        search_query = {}
        
        if q:
            # Search in both English term and Portuguese translation
            search_pattern = {"$regex": re.escape(q), "$options": "i"}
            search_query["$or"] = [
                {"english_term": search_pattern},
                {"portuguese_translation": search_pattern}
            ]
        
        if category:
            search_query["category"] = {"$regex": re.escape(category), "$options": "i"}
            
        if publisher:
            search_query["publisher"] = {"$regex": re.escape(publisher), "$options": "i"}
        
        # Get total count
        total = await db.dictionary_entries.count_documents(search_query)
        
        # Get paginated results
        skip = (page - 1) * per_page
        cursor = db.dictionary_entries.find(search_query).sort("english_term", 1).skip(skip).limit(per_page)
        entries_data = await cursor.to_list(length=per_page)
        
        # Parse entries
        entries = []
        for entry_data in entries_data:
            parsed_entry = parse_from_mongo(entry_data)
            entries.append(DictionaryEntry(**parsed_entry))
        
        return SearchResponse(
            entries=entries,
            total=total,
            page=page,
            per_page=per_page
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/dictionary", response_model=List[DictionaryEntry])
async def get_all_entries(limit: int = Query(100, ge=1, le=1000)):
    """Get all dictionary entries"""
    try:
        cursor = db.dictionary_entries.find().sort("english_term", 1).limit(limit)
        entries_data = await cursor.to_list(length=limit)
        
        entries = []
        for entry_data in entries_data:
            parsed_entry = parse_from_mongo(entry_data)
            entries.append(DictionaryEntry(**parsed_entry))
        
        return entries
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/dictionary/{entry_id}", response_model=DictionaryEntry)
async def get_entry(entry_id: str):
    """Get a specific dictionary entry by ID"""
    try:
        entry_data = await db.dictionary_entries.find_one({"id": entry_id})
        if not entry_data:
            raise HTTPException(status_code=404, detail="Entry not found")
        
        parsed_entry = parse_from_mongo(entry_data)
        return DictionaryEntry(**parsed_entry)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.put("/dictionary/{entry_id}", response_model=DictionaryEntry)
async def update_entry(entry_id: str, entry_update: DictionaryEntryUpdate):
    """Update a dictionary entry with history tracking"""
    try:
        # Check if entry exists
        existing_entry = await db.dictionary_entries.find_one({"id": entry_id})
        if not existing_entry:
            raise HTTPException(status_code=404, detail="Entry not found")
        
        # Prepare update data and track changes
        update_data = {k: v for k, v in entry_update.dict().items() if v is not None}
        history_entries = []
        
        if update_data:
            # Track changes in history
            for field, new_value in update_data.items():
                old_value = existing_entry.get(field)
                if old_value != new_value:
                    history_entries.append(create_history_entry(
                        action="updated",
                        field=field,
                        old_value=str(old_value) if old_value is not None else None,
                        new_value=str(new_value) if new_value is not None else None
                    ))
            
            # Update timestamp and version
            update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
            update_data["version"] = existing_entry.get("version", 1) + 1
            
            # Add new history entries
            current_history = existing_entry.get("history", [])
            update_data["history"] = current_history + history_entries
            
            # Update in database
            await db.dictionary_entries.update_one(
                {"id": entry_id},
                {"$set": update_data}
            )
        
        # Get updated entry
        updated_entry_data = await db.dictionary_entries.find_one({"id": entry_id})
        parsed_entry = parse_from_mongo(updated_entry_data)
        return DictionaryEntry(**parsed_entry)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/dictionary/{entry_id}/history")
async def get_entry_history(entry_id: str):
    """Get the edit history of a dictionary entry"""
    try:
        entry_data = await db.dictionary_entries.find_one({"id": entry_id})
        if not entry_data:
            raise HTTPException(status_code=404, detail="Entry not found")
        
        return {
            "entry_id": entry_id,
            "english_term": entry_data.get("english_term"),
            "version": entry_data.get("version", 1),
            "history": entry_data.get("history", [])
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.delete("/dictionary/{entry_id}")
async def delete_entry(entry_id: str):
    """Delete a dictionary entry"""
    try:
        # Add deletion to history before deleting
        existing_entry = await db.dictionary_entries.find_one({"id": entry_id})
        if not existing_entry:
            raise HTTPException(status_code=404, detail="Entry not found")
        
        # Update with deletion history
        deletion_history = create_history_entry("deleted")
        current_history = existing_entry.get("history", [])
        
        await db.dictionary_entries.update_one(
            {"id": entry_id},
            {"$set": {
                "history": current_history + [deletion_history],
                "deleted_at": datetime.now(timezone.utc).isoformat(),
                "is_deleted": True
            }}
        )
        
        return {"message": "Entry marked as deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/dictionary/stats/publishers")
async def get_publishers():
    """Get all available publishers/editoras"""
    try:
        pipeline = [
            {"$match": {"publisher": {"$ne": None, "$ne": ""}}},
            {"$group": {"_id": "$publisher", "count": {"$sum": 1}}},
            {"$sort": {"_id": 1}}
        ]
        
        publishers = await db.dictionary_entries.aggregate(pipeline).to_list(length=None)
        return [{"publisher": pub["_id"], "count": pub["count"]} for pub in publishers]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/dictionary/stats/comic-universes")
async def get_comic_universes():
    """Get all available comic universes"""
    try:
        pipeline = [
            {"$match": {"comic_universe": {"$ne": None, "$ne": ""}}},
            {"$group": {"_id": "$comic_universe", "count": {"$sum": 1}}},
            {"$sort": {"_id": 1}}
        ]
        
        universes = await db.dictionary_entries.aggregate(pipeline).to_list(length=None)
        return [{"universe": univ["_id"], "count": univ["count"]} for univ in universes]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def get_categories():
    """Helper function to get categories for stats"""
    try:
        pipeline = [
            {"$match": {"category": {"$ne": None, "$ne": ""}}},
            {"$group": {"_id": "$category", "count": {"$sum": 1}}},
            {"$sort": {"_id": 1}}
        ]
        
        categories = await db.dictionary_entries.aggregate(pipeline).to_list(length=None)
        return [{"category": cat["_id"], "count": cat["count"]} for cat in categories]
    except Exception as e:
        return []

@api_router.get("/notion/databases")
async def list_notion_databases():
    """List available Notion databases"""
    try:
        if not notion:
            raise HTTPException(status_code=400, detail="Notion integration not configured")
        
        response = notion.search(
            filter={"object": "database"}
        )
        
        databases = []
        for db in response.get("results", []):
            databases.append({
                "id": db["id"],
                "title": db.get("title", [{}])[0].get("plain_text", "Untitled") if db.get("title") else "Untitled",
                "url": db.get("url", ""),
                "created_time": db.get("created_time", ""),
                "last_edited_time": db.get("last_edited_time", "")
            })
        
        return {"databases": databases}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error accessing Notion: {str(e)}")

@api_router.post("/notion/sync-from/{database_id}")
async def sync_from_notion(database_id: str):
    """Sync terms from a Notion database to our dictionary"""
    try:
        if not notion:
            raise HTTPException(status_code=400, detail="Notion integration not configured")
        
        # Query the Notion database
        response = notion.databases.query(database_id=database_id)
        
        synced_count = 0
        errors = []
        
        for page in response.get("results", []):
            try:
                properties = page.get("properties", {})
                
                # Extract data from Notion page properties
                english_term = ""
                portuguese_translation = "" 
                category = ""
                publisher = ""
                comic_universe = ""
                definition = ""
                examples = ""
                
                # Try to extract English term (common field names)
                for field_name in ["English", "English Term", "Term", "Name", "Title"]:
                    if field_name in properties:
                        prop = properties[field_name]
                        if prop["type"] == "title":
                            english_term = prop["title"][0]["plain_text"] if prop["title"] else ""
                        elif prop["type"] == "rich_text":
                            english_term = prop["rich_text"][0]["plain_text"] if prop["rich_text"] else ""
                        break
                
                # Try to extract Portuguese translation
                for field_name in ["Portuguese", "Portuguese Translation", "Tradução", "Translation"]:
                    if field_name in properties:
                        prop = properties[field_name]
                        if prop["type"] == "rich_text":
                            portuguese_translation = prop["rich_text"][0]["plain_text"] if prop["rich_text"] else ""
                        break
                
                # Try to extract category
                for field_name in ["Category", "Categoria", "Type", "Tipo"]:
                    if field_name in properties:
                        prop = properties[field_name]
                        if prop["type"] == "select" and prop["select"]:
                            category = prop["select"]["name"]
                        elif prop["type"] == "rich_text":
                            category = prop["rich_text"][0]["plain_text"] if prop["rich_text"] else ""
                        break
                
                # Try to extract publisher
                for field_name in ["Publisher", "Editora", "Company"]:
                    if field_name in properties:
                        prop = properties[field_name]
                        if prop["type"] == "select" and prop["select"]:
                            publisher = prop["select"]["name"]
                        elif prop["type"] == "rich_text":
                            publisher = prop["rich_text"][0]["plain_text"] if prop["rich_text"] else ""
                        break
                
                # Try to extract comic universe
                for field_name in ["Universe", "Universo", "Comic Universe"]:
                    if field_name in properties:
                        prop = properties[field_name]
                        if prop["type"] == "rich_text":
                            comic_universe = prop["rich_text"][0]["plain_text"] if prop["rich_text"] else ""
                        break
                
                # Try to extract definition
                for field_name in ["Definition", "Definição", "Description", "Descrição"]:
                    if field_name in properties:
                        prop = properties[field_name]
                        if prop["type"] == "rich_text":
                            definition = prop["rich_text"][0]["plain_text"] if prop["rich_text"] else ""
                        break
                
                # Try to extract examples
                for field_name in ["Examples", "Exemplos", "Example", "Exemplo"]:
                    if field_name in properties:
                        prop = properties[field_name]
                        if prop["type"] == "rich_text":
                            examples = prop["rich_text"][0]["plain_text"] if prop["rich_text"] else ""
                        break
                
                # Only create entry if we have both English and Portuguese terms
                if english_term and portuguese_translation:
                    # Check if term already exists
                    existing = await db.dictionary_entries.find_one({
                        "english_term": {"$regex": f"^{re.escape(english_term)}$", "$options": "i"}
                    })
                    
                    if not existing:
                        entry_data = {
                            "english_term": english_term,
                            "portuguese_translation": portuguese_translation,
                            "category": category or None,
                            "publisher": publisher or None,
                            "comic_universe": comic_universe or None,
                            "definition": definition or None,
                            "examples": examples or None,
                            "history": [create_history_entry("created", field="notion_sync")],
                            "version": 1,
                            "notion_page_id": page["id"]
                        }
                        
                        entry_obj = DictionaryEntry(**entry_data)
                        entry_dict = prepare_for_mongo(entry_obj.dict())
                        
                        await db.dictionary_entries.insert_one(entry_dict)
                        synced_count += 1
                
                else:
                    errors.append(f"Page {page['id']}: Missing English term or Portuguese translation")
                    
            except Exception as e:
                errors.append(f"Page {page.get('id', 'unknown')}: {str(e)}")
        
        return {
            "synced_count": synced_count,
            "total_pages": len(response.get("results", [])),
            "errors": errors[:10] if errors else []  # Limit to first 10 errors
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error syncing from Notion: {str(e)}")

@api_router.post("/notion/sync-to/{database_id}")
async def sync_to_notion(database_id: str):
    """Sync our dictionary terms to a Notion database"""
    try:
        if not notion:
            raise HTTPException(status_code=400, detail="Notion integration not configured")
        
        # Get all dictionary entries
        cursor = db.dictionary_entries.find()
        entries_data = await cursor.to_list(length=None)
        
        synced_count = 0
        errors = []
        
        for entry_data in entries_data:
            try:
                parsed_entry = parse_from_mongo(entry_data)
                entry = DictionaryEntry(**parsed_entry)
                
                # Skip if already synced to Notion
                if hasattr(entry, 'notion_page_id') and entry.notion_page_id:
                    continue
                
                # Create page in Notion
                page_data = {
                    "parent": {"database_id": database_id},
                    "properties": {
                        "English": {
                            "title": [{"text": {"content": entry.english_term}}]
                        },
                        "Portuguese": {
                            "rich_text": [{"text": {"content": entry.portuguese_translation}}]
                        }
                    }
                }
                
                # Add optional fields if they exist
                if entry.category:
                    page_data["properties"]["Category"] = {
                        "rich_text": [{"text": {"content": entry.category}}]
                    }
                
                if entry.publisher:
                    page_data["properties"]["Publisher"] = {
                        "rich_text": [{"text": {"content": entry.publisher}}]
                    }
                
                if entry.comic_universe:
                    page_data["properties"]["Universe"] = {
                        "rich_text": [{"text": {"content": entry.comic_universe}}]
                    }
                
                if entry.definition:
                    page_data["properties"]["Definition"] = {
                        "rich_text": [{"text": {"content": entry.definition}}]
                    }
                
                if entry.examples:
                    page_data["properties"]["Examples"] = {
                        "rich_text": [{"text": {"content": entry.examples}}]
                    }
                
                # Create the page
                created_page = notion.pages.create(**page_data)
                
                # Update our entry with the Notion page ID
                await db.dictionary_entries.update_one(
                    {"id": entry.id},
                    {"$set": {"notion_page_id": created_page["id"]}}
                )
                
                synced_count += 1
                
            except Exception as e:
                errors.append(f"Entry {entry_data.get('english_term', 'unknown')}: {str(e)}")
        
        return {
            "synced_count": synced_count,
            "total_entries": len(entries_data),
            "errors": errors[:10] if errors else []  # Limit to first 10 errors
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error syncing to Notion: {str(e)}")

@api_router.get("/dictionary/stats/overview")
async def get_stats():
    """Get dictionary statistics"""
    try:
        total_entries = await db.dictionary_entries.count_documents({})
        total_categories = len(await get_categories())
        
        # Get recent entries (last 7 days)
        week_ago = datetime.now(timezone.utc) - timedelta(days=7)
        recent_entries = await db.dictionary_entries.count_documents({
            "created_at": {"$gte": week_ago.isoformat()}
        })
        
        return {
            "total_entries": total_entries,
            "total_categories": total_categories,
            "recent_entries": recent_entries
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()