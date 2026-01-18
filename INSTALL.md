# 📋 INSTRUÇÕES DE INSTALAÇÃO - COMIC DICTIONARY THEOLDSHINOBI

## 🚀 INSTALAÇÃO RÁPIDA

### 1. **Pré-requisitos**
- Node.js 16+ ([Download](https://nodejs.org/))
- Python 3.8+ ([Download](https://python.org/))
- MongoDB ([Download](https://www.mongodb.com/try/download/community))

### 2. **Extrair e Instalar**
```bash
# Extrair o arquivo
tar -xzf comic-dictionary-theoldshinobi-clean.tar.gz
cd comic-dictionary-clean

# Executar script de instalação automática
chmod +x install.sh
./install.sh
```

### 3. **Configuração Manual (Alternativa)**

#### Backend:
```bash
cd backend
pip install -r requirements.txt
```

#### Frontend:
```bash
cd frontend
npm install
# ou
yarn install
```

### 4. **Executar Aplicação**

#### Terminal 1 - Backend:
```bash
cd backend
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

#### Terminal 2 - Frontend:
```bash
cd frontend
npm start
```

### 5. **Acessar**
- **Frontend:** http://localhost:3000
- **API:** http://localhost:8001
- **Docs da API:** http://localhost:8001/docs

## 🔧 CONFIGURAÇÃO

### Variáveis de Ambiente

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

## ⚡ FUNCIONALIDADES

- ✅ **Navegação Alfabética** com menu A-Z
- ✅ **Sistema de Abas** por editora (Marvel, DC, Outras)
- ✅ **Versões de Personagens** (identidade secreta + versão)
- ✅ **Interface 100% Português**
- ✅ **Histórico Colaborativo** estilo Wikipedia
- ✅ **Busca Avançada** inglês/português

## 📊 DADOS DE EXEMPLO

O sistema permite adicionar personagens como:
- **Ant-Man (Hank Pym)** - Primeira encarnação
- **Ant-Man (Scott Lang)** - Segunda encarnação
- **Flash (Barry Allen)** - Velocista da DC
- **Hulk (Bruce Banner)** - Gigante Verde da Marvel

## 🐛 SOLUÇÃO DE PROBLEMAS

### MongoDB não conecta:
```bash
# Iniciar MongoDB
mongod
```

### Porta em uso:
```bash
# Backend em porta diferente
uvicorn server:app --port 8002

# Frontend em porta diferente
PORT=3001 npm start
```

### Dependências faltando:
```bash
# Limpar cache e reinstalar
rm -rf frontend/node_modules
cd frontend && npm install

# Python
pip install --upgrade pip
pip install -r backend/requirements.txt
```

## 🌐 DEPLOY

### Frontend (Vercel):
```bash
cd frontend
npm run build
# Deploy pasta /build
```

### Backend (Railway/Render):
```bash
cd backend
# Configure variáveis de ambiente na plataforma
```

## 🤝 CONTRIBUIÇÃO

1. Fork o repositório
2. Crie uma branch: `git checkout -b nova-funcionalidade`
3. Commit: `git commit -am 'Adiciona nova funcionalidade'`
4. Push: `git push origin nova-funcionalidade`
5. Pull Request

## 📞 SUPORTE

- 🌐 **Site:** [theoldshinobi.site](https://theoldshinobi.site)
- 📚 **Documentação:** README.md
- 🐛 **Issues:** GitHub Issues

---

**🥷 Desenvolvido para a comunidade theoldshinobi.site**