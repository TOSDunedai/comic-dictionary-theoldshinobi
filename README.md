# 🥷 Comic Terms Dictionary - Dicionário de Quadrinhos TheOldShinobi

Um dicionário colaborativo de termos de quadrinhos inglês-português, desenvolvido especialmente para apoiar a comunidade **[theoldshinobi.site](https://theoldshinobi.site)**.

![Logo TheOldShinobi](https://www.theoldshinobi.site/storage/2021/04/newOldShinobi.png)

## ✨ Funcionalidades Principais

### 📚 **Gestão Avançada de Termos**
- ✅ Adicionar termos de quadrinhos com tradução português
- ✅ **Sistema de versões de personagens** - Permite múltiplas encarnações do mesmo personagem
- ✅ **Identidades secretas** - Rastreamento de nomes reais dos personagens
- ✅ Edição colaborativa com **histórico completo** (estilo Wikipedia)
- ✅ Categorização por: Personagens, Poderes, Locais, Equipamentos, Organizações, etc.

### 🏷️ **Sistema de Organização Triplo**
- 📚 **Abas por Editora**: DC Comics, Marvel, Outras
- 🔤 **Índice Alfabético**: Navegação A-Z inteligente  
- 📋 **Seções por Categoria**: Agrupamento por tipo de termo

### 🔍 **Busca Avançada**
- Busca simultânea em inglês e português
- Filtros combinados (categoria + editora + universo)
- Busca contextual dentro de cada aba

### 🎭 **Suporte a Múltiplas Versões**
Permite personagens com nomes iguais em contextos diferentes:
- **Destiny (DC Comics)** - Personagem místico do universo DC
- **Destiny (Marvel Comics)** - Mutante com poderes de precognição
- **Ant-Man (Hank Pym)** - Primeira encarnação, cientista inventor
- **Ant-Man (Scott Lang)** - Segunda encarnação, ex-ladrão

### 📝 **Histórico Colaborativo**
- Versionamento automático (v1, v2, v3...)
- Tracking completo de alterações
- Visualização de diferenças (antes/depois) com cores
- Timestamps de todas as modificações

## 🚀 Tecnologias Utilizadas

### Backend
- **FastAPI** - API REST moderna e rápida
- **MongoDB** - Banco de dados NoSQL
- **Pydantic** - Validação de dados
- **Python 3.8+**

### Frontend
- **React** - Interface de usuário reativa
- **Tailwind CSS** - Estilização moderna
- **Axios** - Comunicação com API
- **JavaScript ES6+**

## 📋 Instalação e Configuração

### Pré-requisitos
- Python 3.8+
- Node.js 16+
- MongoDB

### 1. Clone o Repositório
```bash
git clone https://github.com/SEU_USUARIO/comic-dictionary-theoldshinobi.git
cd comic-dictionary-theoldshinobi
```

### 2. Backend Setup
```bash
cd backend
pip install -r requirements.txt
# Configure as variáveis de ambiente no .env
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

### 3. Frontend Setup  
```bash
cd frontend
yarn install
# Configure REACT_APP_BACKEND_URL no .env
yarn start
```

### 4. Variáveis de Ambiente

#### Backend (.env)
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=comic_dictionary
CORS_ORIGINS=*
NOTION_TOKEN=seu_token_notion_opcional
```

#### Frontend (.env)
```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

## 📖 Como Usar

### 1. **Adicionar Personagem com Versões**
```
Termo: Ant-Man
Tradução: Homem-Formiga
Identidade: Hank Pym
Versão: Primeira encarnação
Editora: Marvel Comics
Universo: Marvel Universe
```

### 2. **Navegação por Abas**
- **Todos**: Visualizar todos os termos
- **DC Comics**: Apenas termos DC, Vertigo, Wildstorm  
- **Marvel**: Apenas termos Marvel Comics
- **Outras**: Editoras independentes

### 3. **Índice Alfabético**
- Clique nas letras A-Z para filtrar
- Letras sem conteúdo ficam desabilitadas
- Clique em "Todos" para limpar filtro

### 4. **Busca Avançada**
- Digite em inglês ou português
- Combine com filtros de categoria e editora
- Resultados destacam termo pesquisado

## 🎯 Exemplos de Uso

### **Múltiplas Versões do Mesmo Personagem**
```json
// Primeira versão
{
  "english_term": "Flash",
  "portuguese_translation": "Flash", 
  "secret_identity": "Barry Allen",
  "character_version": "Segunda encarnação",
  "publisher": "DC Comics"
}

// Versão alternativa
{
  "english_term": "Flash",
  "portuguese_translation": "Flash",
  "secret_identity": "Wally West", 
  "character_version": "Terceira encarnação",
  "publisher": "DC Comics"
}
```

### **Personagens com Nomes Iguais em Editoras Diferentes**
```json
// Versão Marvel
{
  "english_term": "Captain Marvel",
  "secret_identity": "Carol Danvers",
  "publisher": "Marvel Comics"
}

// Versão DC  
{
  "english_term": "Captain Marvel",
  "secret_identity": "Billy Batson", 
  "publisher": "DC Comics"
}
```

## 📊 Estrutura do Banco de Dados

```javascript
{
  "id": "uuid",
  "english_term": "Spider-Man",
  "portuguese_translation": "Homem-Aranha", 
  "category": "Personagens",
  "publisher": "Marvel Comics",
  "comic_universe": "Marvel Universe",
  "secret_identity": "Peter Parker",
  "character_version": "Primeira encarnação",
  "definition": "Jovem que ganhou poderes após picada de aranha radioativa...",
  "examples": "Peter Parker é um fotógrafo do Clarim Diário...",
  "created_at": "2023-12-01T10:00:00Z",
  "updated_at": "2023-12-01T10:00:00Z", 
  "history": [...],
  "version": 1
}
```

## 🔗 API Endpoints

### Termos do Dicionário
- `GET /api/dictionary` - Listar termos
- `POST /api/dictionary` - Criar termo
- `PUT /api/dictionary/{id}` - Editar termo  
- `DELETE /api/dictionary/{id}` - Excluir termo
- `GET /api/dictionary/{id}/history` - Histórico do termo

### Busca e Filtros
- `GET /api/dictionary/search` - Buscar termos
- `GET /api/dictionary/stats/categories` - Listar categorias
- `GET /api/dictionary/stats/publishers` - Listar editoras
- `GET /api/dictionary/stats/overview` - Estatísticas gerais

### Integração Notion
- `GET /api/notion/databases` - Listar bancos Notion
- `POST /api/notion/sync-from/{db_id}` - Importar do Notion
- `POST /api/notion/sync-to/{db_id}` - Exportar para Notion

## 🎨 Design e Branding

O dicionário utiliza a identidade visual do **theoldshinobi.site**:
- Logo oficial integrado no header
- Paleta de cores profissional (cinza/preto)
- Emoji ninja 🥷 como símbolo
- Interface totalmente em português
- Design responsivo moderno

## 🤝 Contribuição

Para contribuir com o projeto:

1. Fork o repositório
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas alterações (`git commit -am 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

### Padrões de Contribuição
- Mantenha o código em português nos comentários
- Siga os padrões de nomenclatura existentes
- Teste suas alterações antes do commit
- Documente novas funcionalidades

## 📝 Changelog

### v2.0.0 - Latest
- ✅ Interface 100% em português
- ✅ Sistema de versões de personagens
- ✅ Campos de identidade secreta
- ✅ Índice alfabético A-Z
- ✅ Seções por categoria
- ✅ Validação inteligente de duplicatas

### v1.0.0 - Initial Release
- ✅ CRUD básico de termos
- ✅ Busca em inglês/português
- ✅ Sistema de abas por editora
- ✅ Histórico colaborativo
- ✅ Integração Notion preparada

## 📄 Licença

Este projeto foi desenvolvido especialmente para a comunidade **theoldshinobi.site**.

## 🙋 Suporte

Para dúvidas, sugestões ou suporte:
- 🌐 Visite: [theoldshinobi.site](https://theoldshinobi.site)
- 📧 Entre em contato através do site oficial

## 🏆 Agradecimentos

Desenvolvido com ❤️ para a comunidade brasileira de quadrinhos, especialmente para apoiar o incrível trabalho do **The Old Shinobi** em democratizar o acesso aos quadrinhos através de scanlations de qualidade.

---

**🇧🇷 Feito no Brasil para os fãs de quadrinhos brasileiros! 🇧🇷**