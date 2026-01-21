# ⚡ Comandos Rápidos - Copy & Paste

## 🚀 Iniciar POC (Copie e cole no terminal)

```bash
cd back
npm install
npm run start:dev
```

Aguarde ver: `[Nest] LOG [MongooseModule] Mongoose connected`

---

## 🧪 Rodar Testes (Novo terminal)

### Teste Completo (Recomendado)
```bash
cd back
./test-poc.sh
```

### Teste Rápido
```bash
cd back
./quick-test.sh
```

---

## 📡 Testar Endpoints Manualmente

### Health Check
```bash
curl http://localhost:3000/api/health
```

### Adicionar Opção
```bash
curl -X POST http://localhost:3000/api/add-option \
  -H "Content-Type: application/json" \
  -d '{"name":"Cliente VIP","value":"cliente_vip"}'
```

### Listar Opções
```bash
curl http://localhost:3000/api/external-options
```

### Sincronizar com HubSpot
```bash
curl -X POST http://localhost:3000/api/sync-to-hubspot
```

### Deletar Todas as Opções
```bash
curl -X DELETE http://localhost:3000/api/options
```

---

## 🗄️ Ver Dados no MongoDB

### MongoDB Compass (Desktop App)

Connection String:
```
mongodb+srv://guilhermedesoler_db_user:30271859@db.j9ec1wz.mongodb.net/
```

Database: `hubspot-integration-poc`
Collection: `options`

### MongoDB Atlas (Web)
```
https://cloud.mongodb.com
→ Browse Collections
→ Database: hubspot-integration-poc
→ Collection: options
```

---

## 🔧 Popular Banco com Dados de Teste

```bash
cd back
./seed-data.sh
```

---

## 🧹 Limpar e Recomeçar

```bash
cd back

# Deletar todas as opções
curl -X DELETE http://localhost:3000/api/options

# Popular novamente
./seed-data.sh
```

---

## 📊 Ver Logs em Tempo Real

```bash
cd back
npm run start:dev
# Logs aparecem automaticamente
```

---

## 🎯 Integração do Seu Sistema

### Node.js
```javascript
const axios = require('axios');

await axios.post('http://localhost:3000/api/add-option', {
  name: 'Cliente Premium',
  value: 'cliente_premium'
});
```

### Python
```python
import requests

requests.post('http://localhost:3000/api/add-option', json={
    'name': 'Cliente Premium',
    'value': 'cliente_premium'
})
```

### cURL
```bash
curl -X POST http://localhost:3000/api/add-option \
  -H "Content-Type: application/json" \
  -d '{"name":"Cliente Premium","value":"cliente_premium"}'
```

---

## 🔑 Configurar HubSpot (Opcional)

1. Obter token:
```
HubSpot → Settings → Integrations → Private Apps → Create
```

2. Editar .env:
```bash
cd back
nano .env
```

3. Adicionar:
```env
HUBSPOT_ACCESS_TOKEN=seu-token-aqui
DEFAULT_PROPERTY_NAME=nome-da-propriedade
```

4. Reiniciar:
```bash
npm run start:dev
```

---

## 📝 Abrir Documentação

```bash
# README da POC
cat back/README_POC.md

# Guia de testes
cat back/POC_GUIDE.md

# Setup completo
cat SETUP_COMPLETO.md
```

---

## 🎉 Sequência Completa de Teste

Copie e cole tudo de uma vez:

```bash
# 1. Setup
cd back
npm install

# 2. Iniciar servidor (deixa rodando)
npm run start:dev &

# 3. Aguardar 5 segundos
sleep 5

# 4. Rodar teste
./test-poc.sh

# 5. Ver dados no MongoDB Compass ou Atlas
echo "Veja: mongodb+srv://guilhermedesoler_db_user:30271859@db.j9ec1wz.mongodb.net/"
```

---

## 🆘 Comandos de Troubleshooting

### Verificar se servidor está rodando
```bash
curl http://localhost:3000/api/health
```

### Verificar logs
```bash
cd back
npm run start:dev
# Veja os logs no terminal
```

### Reinstalar dependências
```bash
cd back
rm -rf node_modules package-lock.json
npm install
```

### Verificar conexão MongoDB
```bash
curl http://localhost:3000/api/health | grep "connected"
```

---

## 📞 Ajuda Rápida

- **MongoDB não conecta**: Veja `.env` e verifique MONGODB_URI
- **HubSpot 401**: Token inválido, regenere no HubSpot
- **Porta 3000 em uso**: Mate o processo: `pkill -f "node.*3000"`
- **Teste falha**: Reinicie: `npm run start:dev`

---

**🎯 Comandos mais usados:**

```bash
# Iniciar
cd back && npm run start:dev

# Testar
cd back && ./test-poc.sh

# Limpar
curl -X DELETE http://localhost:3000/api/options
```
