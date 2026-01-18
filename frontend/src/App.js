import { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Components
const Header = () => (
  <header className="bg-gradient-to-r from-gray-900 via-gray-800 to-black text-white shadow-lg">
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center overflow-hidden">
            <img 
              src="https://www.theoldshinobi.site/storage/2021/04/newOldShinobi.png"
              alt="The Old Shinobi Logo"
              className="w-10 h-10 object-contain"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <span className="text-2xl hidden">🥷</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold">Dicionário de Termos de Quadrinhos</h1>
            <p className="text-gray-300 text-sm">Dicionário de Quadrinhos • Supporting theoldshinobi.site</p>
          </div>
        </div>
        <div className="hidden md:flex items-center space-x-4 text-sm">
          <span className="bg-white/20 px-3 py-1 rounded-full">🦸 Heróis</span>
          <span className="bg-white/20 px-3 py-1 rounded-full">⚡ Poderes</span>
          <span className="bg-white/20 px-3 py-1 rounded-full">📚 Quadrinhos</span>
          <button className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-colors">
            🔗 Notion Sync
          </button>
        </div>
      </div>
    </div>
  </header>
);

const SearchBar = ({ 
  searchTerm, 
  setSearchTerm, 
  onSearch, 
  selectedCategory, 
  setSelectedCategory, 
  selectedPublisher,
  setSelectedPublisher,
  categories, 
  publishers 
}) => (
  <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
    <div className="flex flex-col gap-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar termos de quadrinhos em inglês ou português..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && onSearch()}
              className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
        <button
          onClick={onSearch}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Buscar
        </button>
      </div>
      
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="">Todas as Categorias</option>
            {categories.map((cat) => (
              <option key={cat.category} value={cat.category}>
                {cat.category} ({cat.count})
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Publisher/Editora</label>
          <select
            value={selectedPublisher}
            onChange={(e) => setSelectedPublisher(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="">Todas as Editoras</option>
            {publishers.map((pub) => (
              <option key={pub.publisher} value={pub.publisher}>
                {pub.publisher} ({pub.count})
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  </div>
);

const AddEntryForm = ({ showForm, setShowForm, onAddEntry, categories, publishers }) => {
  const [formData, setFormData] = useState({
    english_term: '',
    portuguese_translation: '',
    category: '',
    publisher: '',
    comic_universe: '',
    secret_identity: '',
    character_version: '',
    definition: '',
    examples: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Predefined comic categories
  const comicCategories = [
    'Personagens', 'Poderes', 'Locais', 'Equipamentos', 'Organizações',
    'Terminologia', 'Elementos da História', 'Termos de Arte', 'Gêneros', 'Outros'
  ];
  
  // Predefined publishers
  const comicPublishers = [
    'Marvel Comics', 'DC Comics', 'Image Comics', 'Dark Horse Comics',
    'IDW Publishing', 'Vertigo', 'Wildstorm', 'Mangá', 'Quadrinhos Brasileiros',
    'Independente', 'Outros'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.english_term.trim() || !formData.portuguese_translation.trim()) {
      alert('Por favor, preencha pelo menos o termo em inglês e a tradução.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddEntry(formData);
      setFormData({
        english_term: '',
        portuguese_translation: '',
        category: '',
        publisher: '',
        comic_universe: '',
        secret_identity: '',
        character_version: '',
        definition: '',
        examples: ''
      });
      setShowForm(false);
    } catch (error) {
      console.error('Error adding entry:', error);
      alert(error.response?.data?.detail || 'Erro ao adicionar entrada. Tente novamente.');
    }
    setIsSubmitting(false);
  };

  if (!showForm) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            🥷 Adicionar Termo
          </h3>
          <button
            onClick={() => setShowForm(false)}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              English Term *
            </label>
            <input
              type="text"
              value={formData.english_term}
              onChange={(e) => setFormData({...formData, english_term: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="ex: Spider-Man, Super-herói, Kriptonita..."
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tradução em Português *  
            </label>
            <input
              type="text"
              value={formData.portuguese_translation}
              onChange={(e) => setFormData({...formData, portuguese_translation: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="ex: Homem-Aranha, Super-herói, Kriptonita..."
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="">Selecione uma categoria...</option>
              {comicCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Publisher/Editora
            </label>
            <select
              value={formData.publisher}
              onChange={(e) => setFormData({...formData, publisher: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="">Selecione uma editora...</option>
              {comicPublishers.map(pub => (
                <option key={pub} value={pub}>{pub}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Universo dos Quadrinhos
            </label>
            <input
              type="text"
              value={formData.comic_universe}
              onChange={(e) => setFormData({...formData, comic_universe: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="e.g., Marvel Universe, DC Universe, MCU..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Identidade Secreta / Nome Real
            </label>
            <input
              type="text"
              value={formData.secret_identity}
              onChange={(e) => setFormData({...formData, secret_identity: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="ex: Peter Parker, Bruce Wayne, Hank Pym..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Versão do Personagem
            </label>
            <input
              type="text"
              value={formData.character_version}
              onChange={(e) => setFormData({...formData, character_version: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="ex: Primeira encarnação, Versão Ultimate, Anos 90..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Definição (em Português)
            </label>
            <textarea
              value={formData.definition}
              onChange={(e) => setFormData({...formData, definition: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Descreva o termo ou personagem em português..."
              rows="2"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Exemplos (em Português)
            </label>
            <textarea
              value={formData.examples}
              onChange={(e) => setFormData({...formData, examples: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Exemplos de uso no contexto de quadrinhos..."
              rows="2"
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Adicionando...' : 'Adicionar Termo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const HistoryModal = ({ showHistory, setShowHistory, entry, history }) => {
  if (!showHistory || !entry) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'created': return '✨';
      case 'updated': return '✏️';
      case 'deleted': return '🗑️';
      default: return '📝';
    }
  };

  const getActionText = (action) => {
    switch (action) {
      case 'created': return 'Criado';
      case 'updated': return 'Atualizado';
      case 'deleted': return 'Excluído';
      default: return 'Alterado';
    }
  };

  const getFieldLabel = (field) => {
    const labels = {
      english_term: 'Termo em Inglês',
      portuguese_translation: 'Tradução em Português',
      category: 'Categoria',
      publisher: 'Editora',
      comic_universe: 'Universo',
      secret_identity: 'Identidade Secreta',
      character_version: 'Versão do Personagem',
      definition: 'Definição',
      examples: 'Exemplos'
    };
    return labels[field] || field;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            📝 Histórico de Alterações
          </h3>
          <button
            onClick={() => setShowHistory(false)}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>
        
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-2">{entry.english_term}</h4>
          <p className="text-gray-600 text-sm">Versão atual: {entry.version || 1}</p>
        </div>

        <div className="space-y-4">
          {history && history.length > 0 ? (
            history.slice().reverse().map((historyItem, index) => (
              <div key={index} className="border-l-4 border-blue-300 pl-4 py-2">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{getActionIcon(historyItem.action)}</span>
                  <span className="font-medium text-gray-800">
                    {getActionText(historyItem.action)}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDate(historyItem.timestamp)}
                  </span>
                </div>
                
                {historyItem.field && historyItem.action === 'updated' && (
                  <div className="ml-6 text-sm">
                    <p className="text-gray-600 mb-1">
                      <strong>{getFieldLabel(historyItem.field)}:</strong>
                    </p>
                    {historyItem.old_value && (
                      <p className="text-red-600 mb-1">
                        <span className="bg-red-100 px-2 py-1 rounded">
                          - {historyItem.old_value}
                        </span>
                      </p>
                    )}
                    {historyItem.new_value && (
                      <p className="text-green-600">
                        <span className="bg-green-100 px-2 py-1 rounded">
                          + {historyItem.new_value}
                        </span>
                      </p>
                    )}
                  </div>
                )}
                
                {historyItem.action === 'created' && (
                  <div className="ml-6 text-sm text-gray-600">
                    Termo criado no dicionário
                  </div>
                )}
                
                {historyItem.action === 'deleted' && (
                  <div className="ml-6 text-sm text-gray-600">
                    Termo removido do dicionário
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>Nenhum histórico disponível para este termo.</p>
            </div>
          )}
        </div>
        
        <div className="mt-6 pt-4 border-t">
          <button
            onClick={() => setShowHistory(false)}
            className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

const EditEntryForm = ({ showForm, setShowForm, entry, onUpdateEntry }) => {
  const [formData, setFormData] = useState({
    english_term: '',
    portuguese_translation: '',
    category: '',
    publisher: '',
    comic_universe: '',
    secret_identity: '',
    character_version: '',
    definition: '',
    examples: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Predefined comic categories
  const comicCategories = [
    'Personagens', 'Poderes', 'Locais', 'Equipamentos', 'Organizações',
    'Terminologia', 'Elementos da História', 'Termos de Arte', 'Gêneros', 'Outros'
  ];
  
  // Predefined publishers
  const comicPublishers = [
    'Marvel Comics', 'DC Comics', 'Image Comics', 'Dark Horse Comics',
    'IDW Publishing', 'Vertigo', 'Wildstorm', 'Mangá', 'Quadrinhos Brasileiros',
    'Independente', 'Outros'
  ];

  // Load entry data when form opens
  useEffect(() => {
    if (entry && showForm) {
      setFormData({
        english_term: entry.english_term || '',
        portuguese_translation: entry.portuguese_translation || '',
        category: entry.category || '',
        publisher: entry.publisher || '',
        comic_universe: entry.comic_universe || '',
        secret_identity: entry.secret_identity || '',
        character_version: entry.character_version || '',
        definition: entry.definition || '',
        examples: entry.examples || ''
      });
    }
  }, [entry, showForm]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.english_term.trim() || !formData.portuguese_translation.trim()) {
      alert('Por favor, preencha pelo menos o termo em inglês e a tradução.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onUpdateEntry(entry.id, formData);
      setShowForm(false);
    } catch (error) {
      console.error('Error updating entry:', error);
      alert(error.response?.data?.detail || 'Erro ao atualizar entrada. Tente novamente.');
    }
    setIsSubmitting(false);
  };

  if (!showForm || !entry) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            ✏️ Editar Termo
          </h3>
          <button
            onClick={() => setShowForm(false)}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              English Term *
            </label>
            <input
              type="text"
              value={formData.english_term}
              onChange={(e) => setFormData({...formData, english_term: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tradução em Português *  
            </label>
            <input
              type="text"
              value={formData.portuguese_translation}
              onChange={(e) => setFormData({...formData, portuguese_translation: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="">Selecione uma categoria...</option>
              {comicCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Publisher/Editora
            </label>
            <select
              value={formData.publisher}
              onChange={(e) => setFormData({...formData, publisher: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="">Selecione uma editora...</option>
              {comicPublishers.map(pub => (
                <option key={pub} value={pub}>{pub}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Universo dos Quadrinhos
            </label>
            <input
              type="text"
              value={formData.comic_universe}
              onChange={(e) => setFormData({...formData, comic_universe: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="e.g., Marvel Universe, DC Universe, MCU..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Identidade Secreta / Nome Real
            </label>
            <input
              type="text"
              value={formData.secret_identity}
              onChange={(e) => setFormData({...formData, secret_identity: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="ex: Peter Parker, Bruce Wayne, Hank Pym..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Versão do Personagem
            </label>
            <input
              type="text"
              value={formData.character_version}
              onChange={(e) => setFormData({...formData, character_version: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="ex: Primeira encarnação, Versão Ultimate, Anos 90..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Definição (em Português)
            </label>
            <textarea
              value={formData.definition}
              onChange={(e) => setFormData({...formData, definition: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Descreva o termo ou personagem em português..."
              rows="2"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Exemplos (em Português)
            </label>
            <textarea
              value={formData.examples}
              onChange={(e) => setFormData({...formData, examples: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Exemplos de uso no contexto de quadrinhos..."
              rows="2"
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const PublisherTabs = ({ activeTab, setActiveTab, tabCounts, isSearchActive }) => (
  <div className="bg-white rounded-lg shadow-md mb-6 overflow-hidden">
    <div className="flex border-b">
      <button
        onClick={() => setActiveTab('all')}
        className={`flex-1 px-6 py-4 font-medium transition-colors ${
          activeTab === 'all'
            ? 'bg-gray-800 text-white border-b-2 border-gray-800'
            : 'text-gray-600 hover:bg-gray-50'
        }`}
      >
        <div className="flex items-center justify-center gap-2">
          <span>📚 Todos</span>
          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
            {tabCounts.all}
          </span>
        </div>
      </button>
      
      <button
        onClick={() => setActiveTab('dc')}
        className={`flex-1 px-6 py-4 font-medium transition-colors ${
          activeTab === 'dc'
            ? 'bg-blue-600 text-white border-b-2 border-blue-600'
            : 'text-gray-600 hover:bg-gray-50'
        }`}
      >
        <div className="flex items-center justify-center gap-2">
          <span>🦸 DC Comics</span>
          <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs">
            {tabCounts.dc}
          </span>
        </div>
      </button>
      
      <button
        onClick={() => setActiveTab('marvel')}
        className={`flex-1 px-6 py-4 font-medium transition-colors ${
          activeTab === 'marvel'
            ? 'bg-red-600 text-white border-b-2 border-red-600'
            : 'text-gray-600 hover:bg-gray-50'
        }`}
      >
        <div className="flex items-center justify-center gap-2">
          <span>🕷️ Marvel</span>
          <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs">
            {tabCounts.marvel}
          </span>
        </div>
      </button>
      
      <button
        onClick={() => setActiveTab('others')}
        className={`flex-1 px-6 py-4 font-medium transition-colors ${
          activeTab === 'others'
            ? 'bg-green-600 text-white border-b-2 border-green-600'
            : 'text-gray-600 hover:bg-gray-50'
        }`}
      >
        <div className="flex items-center justify-center gap-2">
          <span>🌟 Outras</span>
          <span className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs">
            {tabCounts.others}
          </span>
        </div>
      </button>
    </div>
    
    {!isSearchActive && (
      <div className="p-4 bg-gray-50 text-center text-sm text-gray-600">
        {activeTab === 'all' && 'Mostrando todos os termos do dicionário'}
        {activeTab === 'dc' && 'Mostrando termos da DC Comics, Vertigo e Wildstorm'}
        {activeTab === 'marvel' && 'Mostrando termos da Marvel Comics'}
        {activeTab === 'others' && 'Mostrando termos de outras editoras e independentes'}
      </div>
    )}
  </div>
);

const AlphabeticalNavigation = ({ entries, activeLetter, setActiveLetter }) => {
  // Get all first letters from entries
  const getAvailableLetters = () => {
    const letters = new Set();
    entries.forEach(entry => {
      const firstLetter = entry.english_term.charAt(0).toUpperCase();
      if (firstLetter.match(/[A-Z]/)) {
        letters.add(firstLetter);
      }
    });
    return Array.from(letters).sort();
  };

  const availableLetters = getAvailableLetters();
  const allLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-xl font-bold text-gray-700 mb-4">Navegação Alfabética</h3>
      
      <div className="grid grid-cols-10 gap-2 max-w-4xl">
        {/* Botão Todos */}
        <div className="col-span-2 md:col-span-1">
          <button
            onClick={() => setActiveLetter(null)}
            className={`w-full px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
              !activeLetter 
                ? 'bg-blue-500 text-white shadow-md' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
            }`}
          >
            Todos
          </button>
        </div>
        
        {/* Letras A-I (primeira linha) */}
        {allLetters.slice(0, 9).map(letter => (
          <button
            key={letter}
            onClick={() => setActiveLetter(letter)}
            disabled={!availableLetters.includes(letter)}
            className={`px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
              activeLetter === letter
                ? 'bg-blue-500 text-white shadow-md'
                : availableLetters.includes(letter)
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                  : 'bg-gray-50 text-gray-300 cursor-not-allowed border border-gray-100'
            }`}
          >
            {letter}
          </button>
        ))}
      </div>
      
      <div className="grid grid-cols-10 gap-2 max-w-4xl mt-2">
        {/* Letras J-S (segunda linha) */}
        {allLetters.slice(9, 19).map(letter => (
          <button
            key={letter}
            onClick={() => setActiveLetter(letter)}
            disabled={!availableLetters.includes(letter)}
            className={`px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
              activeLetter === letter
                ? 'bg-blue-500 text-white shadow-md'
                : availableLetters.includes(letter)
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                  : 'bg-gray-50 text-gray-300 cursor-not-allowed border border-gray-100'
            }`}
          >
            {letter}
          </button>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-2 max-w-4xl mt-2">
        {/* Letras T-Z (terceira linha) */}
        {allLetters.slice(19, 26).map(letter => (
          <button
            key={letter}
            onClick={() => setActiveLetter(letter)}
            disabled={!availableLetters.includes(letter)}
            className={`px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
              activeLetter === letter
                ? 'bg-blue-500 text-white shadow-md'
                : availableLetters.includes(letter)
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                  : 'bg-gray-50 text-gray-300 cursor-not-allowed border border-gray-100'
            }`}
          >
            {letter}
          </button>
        ))}
      </div>
      
      {activeLetter && (
        <div className="mt-4 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
          📖 Mostrando termos que começam com "<strong>{activeLetter}</strong>"
        </div>
      )}
    </div>
  );
};

const CategorySection = ({ title, entries, onEdit, onViewHistory }) => (
  <div className="mb-8">
    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
      <span className="w-1 h-6 bg-blue-600 rounded"></span>
      {title} ({entries.length})
    </h3>
    <div className="grid gap-4">
      {entries.map((entry) => (
        <EntryCard 
          key={entry.id} 
          entry={entry}
          onEdit={onEdit}
          onViewHistory={onViewHistory}
        />
      ))}
    </div>
  </div>
);

const EntryCard = ({ entry, onEdit, onViewHistory }) => (
  <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border-l-4 border-gray-800">
    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
      <div className="flex-1">
        <div className="mb-3">
          <h3 className="text-xl font-semibold text-gray-900 mb-1">{entry.english_term}</h3>
          <p className="text-lg text-gray-700 font-medium">{entry.portuguese_translation}</p>
          {entry.secret_identity && (
            <p className="text-sm text-blue-600 mt-1">
              <strong>Identidade:</strong> {entry.secret_identity}
            </p>
          )}
          {entry.character_version && (
            <p className="text-sm text-purple-600 mt-1">
              <strong>Versão:</strong> {entry.character_version}
            </p>
          )}
        </div>
        
        {entry.definition && (
          <div className="mb-3">
            <h4 className="text-sm font-medium text-gray-600 mb-1">Definição:</h4>
            <p className="text-gray-700 text-sm">{entry.definition}</p>
          </div>
        )}
        
        {entry.examples && (
          <div className="mb-3">
            <h4 className="text-sm font-medium text-gray-600 mb-1">Exemplos:</h4>
            <p className="text-gray-700 text-sm italic">{entry.examples}</p>
          </div>
        )}
        
        {entry.comic_universe && (
          <div className="mb-2">
            <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded font-medium">
              🌟 {entry.comic_universe}
            </span>
          </div>
        )}
      </div>
      
      <div className="flex flex-col items-end space-y-2">
        <div className="flex flex-wrap gap-1 justify-end">
          {entry.category && (
            <span className="px-3 py-1 bg-gray-800 text-white text-xs rounded-full font-medium">
              {entry.category}
            </span>
          )}
          {entry.publisher && (
            <span className="px-3 py-1 bg-gray-600 text-white text-xs rounded-full font-medium">
              📚 {entry.publisher}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => onViewHistory(entry)}
            className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
            title="Ver histórico"
          >
            📝 v{entry.version || 1}
          </button>
          <button
            onClick={() => onEdit(entry)}
            className="px-2 py-1 text-xs bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors"
            title="Editar termo"
          >
            ✏️ Editar
          </button>
        </div>
        
        <span className="text-xs text-gray-500">
          {new Date(entry.created_at).toLocaleDateString('pt-BR')}
        </span>
      </div>
    </div>
  </div>
);

const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-12">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

const EmptyState = ({ searchTerm }) => (
  <div className="text-center py-12">
    <div className="text-6xl mb-4">🦸</div>
    <h3 className="text-xl font-semibold text-gray-700 mb-2">
      {searchTerm ? 'No comic terms found' : 'No comic terms yet'}
    </h3>
    <p className="text-gray-500 mb-6">
      {searchTerm 
        ? `No entries found for "${searchTerm}". Try searching for heroes, powers, or comic terminology.`
        : 'Start building your comics dictionary! Add terms like characters, powers, locations, and more.'
      }
    </p>
  </div>
);

const StatsBar = ({ stats }) => (
  <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 mb-6">
    <div className="flex flex-wrap justify-center gap-6 text-center">
      <div>
        <div className="text-2xl font-bold text-green-600">{stats.total_entries}</div>
        <div className="text-sm text-gray-600">Total Terms</div>
      </div>
      <div>
        <div className="text-2xl font-bold text-blue-600">{stats.total_categories}</div>
        <div className="text-sm text-gray-600">Categories</div>
      </div>
      <div>
        <div className="text-2xl font-bold text-purple-600">{stats.recent_entries}</div>
        <div className="text-sm text-gray-600">Added This Week</div>
      </div>
    </div>
  </div>
);

function App() {
  const [entries, setEntries] = useState([]);
  const [categories, setCategories] = useState([]);
  const [publishers, setPublishers] = useState([]);
  const [stats, setStats] = useState({ total_entries: 0, total_categories: 0, recent_entries: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPublisher, setSelectedPublisher] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'dc', 'marvel', 'others'
  const [activeLetter, setActiveLetter] = useState(null); // For alphabetical filtering
  const [viewMode, setViewMode] = useState('tabs'); // 'tabs', 'alphabet', 'categories'
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [entryHistory, setEntryHistory] = useState([]);
  const [searchResults, setSearchResults] = useState(null);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [entriesRes, categoriesRes, publishersRes, statsRes] = await Promise.all([
        axios.get(`${API}/dictionary?limit=50`),
        axios.get(`${API}/dictionary/stats/categories`).catch(() => ({ data: [] })),
        axios.get(`${API}/dictionary/stats/publishers`).catch(() => ({ data: [] })),
        axios.get(`${API}/dictionary/stats/overview`)
      ]);
      
      setEntries(entriesRes.data);
      setCategories(categoriesRes.data);
      setPublishers(publishersRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setLoading(false);
  };

  const handleSearch = async () => {
    if (!searchTerm.trim() && !selectedCategory && !selectedPublisher) {
      setSearchResults(null);
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm.trim()) params.append('q', searchTerm.trim());
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedPublisher) params.append('publisher', selectedPublisher);
      
      const response = await axios.get(`${API}/dictionary/search?${params}`);
      setSearchResults(response.data);
    } catch (error) {
      console.error('Error searching:', error);
      setSearchResults({ entries: [], total: 0 });
    }
    setLoading(false);
  };

  const handleAddEntry = async (entryData) => {
    try {
      const response = await axios.post(`${API}/dictionary`, entryData);
      
      // Refresh data
      await loadInitialData();
      
      // Clear search if active
      if (searchResults) {
        setSearchResults(null);
        setSearchTerm('');
        setSelectedCategory('');
        setSelectedPublisher('');
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const handleEditEntry = (entry) => {
    setSelectedEntry(entry);
    setShowEditForm(true);
  };

  const handleUpdateEntry = async (entryId, entryData) => {
    try {
      const response = await axios.put(`${API}/dictionary/${entryId}`, entryData);
      
      // Refresh data
      await loadInitialData();
      
      // Clear search if active
      if (searchResults) {
        setSearchResults(null);
        setSearchTerm('');
        setSelectedCategory('');
        setSelectedPublisher('');
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const handleViewHistory = async (entry) => {
    try {
      setSelectedEntry(entry);
      const response = await axios.get(`${API}/dictionary/${entry.id}/history`);
      setEntryHistory(response.data.history || []);
      setShowHistory(true);
    } catch (error) {
      console.error('Error loading history:', error);
      alert('Erro ao carregar histórico. Tente novamente.');
    }
  };

  const clearSearch = () => {
    setSearchResults(null);
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedPublisher('');
    // Reset to all tab when clearing search
    setActiveTab('all');
  };

  // Filter entries by active tab
  const filterEntriesByTab = (entries) => {
    if (activeTab === 'all') return entries;
    
    return entries.filter(entry => {
      const publisher = entry.publisher?.toLowerCase() || '';
      
      switch (activeTab) {
        case 'dc':
          return publisher.includes('dc') || publisher.includes('vertigo') || publisher.includes('wildstorm');
        case 'marvel':
          return publisher.includes('marvel');
        case 'others':
          return !publisher.includes('dc') && !publisher.includes('marvel') && 
                 !publisher.includes('vertigo') && !publisher.includes('wildstorm');
        default:
          return true;
      }
    });
  };

  // Filter entries by letter
  const filterEntriesByLetter = (entries) => {
    if (!activeLetter) return entries;
    return entries.filter(entry => 
      entry.english_term.charAt(0).toUpperCase() === activeLetter
    );
  };

  // Group entries by category
  const groupEntriesByCategory = (entries) => {
    const grouped = {};
    entries.forEach(entry => {
      const category = entry.category || 'Sem Categoria';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(entry);
    });
    
    // Sort entries within each category alphabetically
    Object.keys(grouped).forEach(category => {
      grouped[category].sort((a, b) => a.english_term.localeCompare(b.english_term));
    });
    
    return grouped;
  };

  // Apply filters based on view mode
  const getFilteredEntries = () => {
    let filteredEntries = searchResults ? searchResults.entries : filterEntriesByTab(entries);
    
    if (viewMode === 'alphabet') {
      filteredEntries = filterEntriesByLetter(filteredEntries);
    }
    
    return filteredEntries;
  };

  const displayEntries = getFilteredEntries();
  const isSearchActive = searchResults !== null;

  // Count entries for each tab
  const getTabCounts = () => {
    const allEntries = searchResults ? searchResults.entries : entries;
    return {
      all: allEntries.length,
      dc: filterEntriesByTab(allEntries.filter(() => true)).filter(entry => {
        const publisher = entry.publisher?.toLowerCase() || '';
        return publisher.includes('dc') || publisher.includes('vertigo') || publisher.includes('wildstorm');
      }).length,
      marvel: allEntries.filter(entry => {
        const publisher = entry.publisher?.toLowerCase() || '';
        return publisher.includes('marvel');
      }).length,
      others: allEntries.filter(entry => {
        const publisher = entry.publisher?.toLowerCase() || '';
        return !publisher.includes('dc') && !publisher.includes('marvel') && 
               !publisher.includes('vertigo') && !publisher.includes('wildstorm');
      }).length
    };
  };

  const tabCounts = getTabCounts();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <StatsBar stats={stats} />
        
        <SearchBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onSearch={handleSearch}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedPublisher={selectedPublisher}
          setSelectedPublisher={setSelectedPublisher}
          categories={categories}
          publishers={publishers}
        />

        {!isSearchActive && viewMode === 'tabs' && (
          <PublisherTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            tabCounts={tabCounts}
            isSearchActive={isSearchActive}
          />
        )}

        {!isSearchActive && viewMode === 'alphabetical' && (
          <AlphabeticalNavigation
            entries={entries}
            activeLetter={activeLetter}
            setActiveLetter={setActiveLetter}
          />
        )}

        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              {isSearchActive ? (
                <>🔍 Resultados da Busca</>
              ) : viewMode === 'alphabetical' ? (
                <>🔤 {activeLetter ? `Letra ${activeLetter}` : 'Todos os Termos'}</>
              ) : (
                <>
                  {activeTab === 'all' && '🥷 Todos os Termos'}
                  {activeTab === 'dc' && '🦸 Termos DC Comics'}
                  {activeTab === 'marvel' && '🕷️ Termos Marvel'}
                  {activeTab === 'others' && '🌟 Outras Editoras'}
                </>
              )}
            </h2>
            {isSearchActive && (
              <button
                onClick={clearSearch}
                className="text-gray-600 hover:text-gray-800 text-sm underline"
              >
                Limpar busca
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            {!isSearchActive && (
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => {
                    setViewMode('tabs');
                    setActiveLetter(null);
                  }}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'tabs'
                      ? 'bg-white text-gray-800 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  📚 Editoras
                </button>
                <button
                  onClick={() => {
                    setViewMode('alphabetical');
                    setActiveTab('all');
                  }}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'alphabetical'
                      ? 'bg-white text-gray-800 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  🔤 A-Z
                </button>
              </div>
            )}
            
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Adicionar Termo
            </button>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : displayEntries.length === 0 ? (
          <EmptyState searchTerm={isSearchActive ? searchTerm : ''} />
        ) : (
          <>
            {isSearchActive && (
              <div className="mb-4 text-sm text-gray-600">
                Encontrados {searchResults.total} resultado(s)
              </div>
            )}
            <div className="grid gap-4">
              {displayEntries.map((entry) => (
                <EntryCard 
                  key={entry.id} 
                  entry={entry}
                  onEdit={handleEditEntry}
                  onViewHistory={handleViewHistory}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <AddEntryForm
        showForm={showAddForm}
        setShowForm={setShowAddForm}
        onAddEntry={handleAddEntry}
        categories={categories}
        publishers={publishers}
      />

      <EditEntryForm
        showForm={showEditForm}
        setShowForm={setShowEditForm}
        entry={selectedEntry}
        onUpdateEntry={handleUpdateEntry}
      />

      <HistoryModal
        showHistory={showHistory}
        setShowHistory={setShowHistory}
        entry={selectedEntry}
        history={entryHistory}
      />
    </div>
  );
}

const NotionSyncModal = ({ showSync, setShowSync }) => {
  const [databases, setDatabases] = useState([]);
  const [selectedDatabase, setSelectedDatabase] = useState('');
  const [syncStatus, setSyncStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const loadDatabases = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API}/notion/databases`);
      setDatabases(response.data.databases || []);
    } catch (error) {
      console.error('Error loading databases:', error);
      setSyncStatus('Erro ao carregar bancos de dados do Notion');
    }
    setIsLoading(false);
  };

  const handleSyncFromNotion = async () => {
    if (!selectedDatabase) {
      alert('Selecione um banco de dados primeiro');
      return;
    }

    try {
      setIsLoading(true);
      setSyncStatus('Sincronizando do Notion...');
      
      const response = await axios.post(`${API}/notion/sync-from/${selectedDatabase}`);
      setSyncStatus(`✅ Sincronização concluída! ${response.data.synced_count} termos importados de ${response.data.total_pages} páginas.`);
      
      if (response.data.errors && response.data.errors.length > 0) {
        setSyncStatus(prev => prev + `\n⚠️ Alguns erros: ${response.data.errors.slice(0, 3).join(', ')}`);
      }
    } catch (error) {
      console.error('Error syncing from Notion:', error);
      setSyncStatus('❌ Erro na sincronização: ' + (error.response?.data?.detail || error.message));
    }
    setIsLoading(false);
  };

  const handleSyncToNotion = async () => {
    if (!selectedDatabase) {
      alert('Selecione um banco de dados primeiro');
      return;
    }

    try {
      setIsLoading(true);
      setSyncStatus('Enviando termos para o Notion...');
      
      const response = await axios.post(`${API}/notion/sync-to/${selectedDatabase}`);
      setSyncStatus(`✅ Envio concluído! ${response.data.synced_count} termos enviados de ${response.data.total_entries} total.`);
      
      if (response.data.errors && response.data.errors.length > 0) {
        setSyncStatus(prev => prev + `\n⚠️ Alguns erros: ${response.data.errors.slice(0, 3).join(', ')}`);
      }
    } catch (error) {
      console.error('Error syncing to Notion:', error);
      setSyncStatus('❌ Erro no envio: ' + (error.response?.data?.detail || error.message));
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (showSync) {
      loadDatabases();
    }
  }, [showSync]);

  if (!showSync) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            🔗 Sincronização com Notion
          </h3>
          <button
            onClick={() => setShowSync(false)}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Banco de Dados do Notion:
            </label>
            {isLoading && databases.length === 0 ? (
              <div className="text-center py-4">Carregando bancos de dados...</div>
            ) : (
              <select
                value={selectedDatabase}
                onChange={(e) => setSelectedDatabase(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none"
              >
                <option value="">Selecione um banco de dados...</option>
                {databases.map((db) => (
                  <option key={db.id} value={db.id}>
                    {db.title}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSyncFromNotion}
              disabled={isLoading || !selectedDatabase}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              ⬇️ Importar do Notion
            </button>
            <button
              onClick={handleSyncToNotion}
              disabled={isLoading || !selectedDatabase}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              ⬆️ Enviar para Notion
            </button>
          </div>

          {syncStatus && (
            <div className="mt-4 p-3 bg-gray-100 rounded-lg">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap">{syncStatus}</pre>
            </div>
          )}

          <div className="text-xs text-gray-500 mt-4">
            <p><strong>Importar do Notion:</strong> Traz termos do seu banco de dados Notion para o dicionário</p>
            <p><strong>Enviar para Notion:</strong> Envia os termos do dicionário para o seu banco de dados Notion</p>
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t">
          <button
            onClick={() => setShowSync(false)}
            className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;