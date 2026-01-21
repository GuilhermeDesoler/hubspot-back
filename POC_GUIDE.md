# 🧪 POC - Guia de Teste Completo

Este guia mostra como testar toda a solução MongoDB + HubSpot.

---

## 🎯 Objetivo da POC

Validar que é possível:
1. ✅ Conectar com MongoDB
2. ✅ Salvar opções no banco de dados
3. ✅ Sincronizar com HubSpot via API
4. ✅ Prevenir duplicatas
5. ✅ Validar dados de entrada

---

## 🚀 Setup Rápido (2 minutos)

### 1. Configure as variáveis de ambiente

```bash
cd back
nano .env
```

Adicione/edite:

```env
# MongoDB (já configurado)
MONGODB_URI=mongodb+srv://guilhermedesoler_db_user:30271859@db.j9ec1wz.mongodb.net/
MONGODB_DB_NAME=hubspot-integration-poc

# HubSpot (opcional para testes iniciais)
HUBSPOT_ACCESS_TOKEN=seu-token-aqui
DEFAULT_PROPERTY_NAME=sua_propriedade_customizada
DEFAULT_OBJECT_TYPE=contacts
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Inicie o servidor

```bash
npm run start:dev
```

Aguarde ver:
```
🚀 Servidor rodando em http://localhost:3000
📡 API disponível em http://localhost:3000/api
🖼️  Iframe disponível em http://localhost:3000/iframe/add-option.html
[Nest] LOG [MongooseModule] Mongoose connected
```

---

## 🧪 Teste Automatizado

```bash
cd back
./test-poc.sh
```

Este script testa automaticamente:
- ✅ Conexão com MongoDB
- ✅ Limpeza do banco
- ✅ Adição de 5 opções
- ✅ Listagem de opções
- ✅ Sincronização com HubSpot (se configurado)
- ✅ Prevenção de duplicatas
- ✅ Validação de dados

---

## 📝 Testes Manuais

### Teste 1: Health Check

```bash
curl http://localhost:3000/api/health
```

**Resposta esperada:**
```json
{
  "success": true,
  "message": "Servidor rodando e conectado ao MongoDB",
  "mongodb": {
    "connected": true,
    "optionsCount": 0
  }
}
```

### Teste 2: Adicionar Opção

```bash
curl -X POST http://localhost:3000/api/add-option \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Cliente Teste",
    "value": "cliente_teste"
  }'
```

**Resposta esperada:**
```json
{
  "success": true,
  "message": "Opção adicionada e sincronizada com sucesso",
  "data": {
    "mongodb": {
      "_id": "...",
      "name": "Cliente Teste",
      "value": "cliente_teste",
      "objectType": "contacts",
      "propertyName": "sua_propriedade_customizada",
      "synced": true,
      "createdAt": "...",
      "updatedAt": "..."
    },
    "hubspot": {
      "success": true,
      "message": "Opção adicionada com sucesso ao HubSpot"
    }
  }
}
```

### Teste 3: Listar Opções do MongoDB

```bash
curl http://localhost:3000/api/external-options
```

**Resposta esperada:**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "...",
      "name": "Cliente Teste",
      "value": "cliente_teste",
      "objectType": "contacts",
      "propertyName": "sua_propriedade_customizada",
      "synced": true,
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

### Teste 4: Sincronizar com HubSpot

```bash
curl -X POST http://localhost:3000/api/sync-to-hubspot \
  -H "Content-Type: application/json"
```

**Resposta esperada:**
```json
{
  "success": true,
  "message": "1 opções sincronizadas com sucesso",
  "data": {
    "count": 1,
    "options": [
      {
        "name": "Cliente Teste",
        "value": "cliente_teste"
      }
    ],
    "hubspotResult": {
      "success": true,
      "message": "Opções atualizadas com sucesso no HubSpot"
    }
  }
}
```

### Teste 5: Testar Duplicata

```bash
curl -X POST http://localhost:3000/api/add-option \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Cliente Teste",
    "value": "cliente_teste"
  }'
```

**Resposta esperada:**
```json
{
  "success": false,
  "message": "Opção já existe no banco de dados",
  "data": {
    "_id": "...",
    "name": "Cliente Teste",
    "value": "cliente_teste",
    ...
  }
}
```

### Teste 6: Validação de Dados

```bash
curl -X POST http://localhost:3000/api/add-option \
  -H "Content-Type: application/json" \
  -d '{
    "name": "",
    "value": ""
  }'
```

**Resposta esperada:**
```json
{
  "statusCode": 400,
  "message": "Nome e valor são obrigatórios"
}
```

### Teste 7: Deletar Opção

Primeiro, pegue o ID de uma opção:
```bash
curl http://localhost:3000/api/external-options
```

Depois delete:
```bash
curl -X DELETE http://localhost:3000/api/options/ID_AQUI
```

### Teste 8: Limpar Todas as Opções

```bash
curl -X DELETE http://localhost:3000/api/options
```

---

## 📊 Endpoints Disponíveis

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/health` | Health check + conexão MongoDB |
| POST | `/api/add-option` | Adiciona opção ao MongoDB e HubSpot |
| GET | `/api/external-options` | Lista opções do MongoDB |
| GET | `/api/hubspot-options` | Lista opções do HubSpot |
| POST | `/api/sync-to-hubspot` | Sincroniza MongoDB → HubSpot |
| DELETE | `/api/options/:id` | Deleta opção específica |
| DELETE | `/api/options` | Deleta todas as opções |

---

## 🔬 Teste do Fluxo Completo

### Cenário: Sistema Externo → MongoDB → HubSpot

```bash
# 1. Sistema externo adiciona nova opção
curl -X POST http://localhost:3000/api/add-option \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Cliente VIP",
    "value": "cliente_vip"
  }'

# 2. Verificar se foi salvo no MongoDB
curl http://localhost:3000/api/external-options

# 3. Verificar se foi para o HubSpot (requer token)
curl http://localhost:3000/api/hubspot-options

# 4. Adicionar mais opções
curl -X POST http://localhost:3000/api/add-option \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Cliente Gold",
    "value": "cliente_gold"
  }'

# 5. Sincronizar tudo
curl -X POST http://localhost:3000/api/sync-to-hubspot
```

---

## 🎯 Checklist da POC

### Sem HubSpot (somente MongoDB)

- [ ] Health check retorna sucesso
- [ ] Consegue adicionar opção
- [ ] Opção aparece no MongoDB
- [ ] Consegue listar opções
- [ ] Previne duplicatas
- [ ] Valida dados vazios
- [ ] Consegue deletar opção
- [ ] Consegue limpar todas

### Com HubSpot (integração completa)

- [ ] Token do HubSpot configurado
- [ ] Propriedade customizada criada
- [ ] Adicionar opção sincroniza com HubSpot
- [ ] Opção aparece no HubSpot
- [ ] Sincronização manual funciona
- [ ] Opções aparecem no dropdown do HubSpot

---

## 📱 Teste no HubSpot Card

Se você configurou o HubSpot App:

1. Inicie o backend: `npm run start:dev`
2. Em outro terminal: `cd ../external-card-data && hs project dev`
3. Abra um contato no HubSpot
4. Veja o card "Opções Externas"
5. Clique "Adicionar Nova Opção"
6. Preencha e envie
7. Verifique que aparece no card

---

## 🐛 Troubleshooting

### Erro: "Cannot connect to MongoDB"

**Solução:**
1. Verifique se a connection string está correta no `.env`
2. Teste a conexão:
```bash
curl http://localhost:3000/api/health
```

### Erro: "401 Unauthorized" do HubSpot

**Solução:**
1. Token inválido ou expirado
2. Regenere em: HubSpot → Settings → Private Apps
3. Atualize no `.env`
4. Reinicie o servidor

### Opções não aparecem no HubSpot

**Soluções:**
1. Verifique se `DEFAULT_PROPERTY_NAME` está correto
2. Vá para Settings → Properties e copie o "Internal name"
3. Atualize no `.env`
4. Reinicie e tente novamente

### MongoDB timeout

**Solução:**
1. Verifique se o IP está na whitelist do MongoDB Atlas
2. Teste a connection string direto no MongoDB Compass
3. Verifique firewall local

---

## 📈 Próximos Passos

Depois de validar a POC:

1. ✅ Integre no seu sistema pessoal (veja [API_INTEGRATION.md](../API_INTEGRATION.md))
2. ✅ Configure token do HubSpot de produção
3. ✅ Faça deploy do backend (veja [INTEGRATION_GUIDE.md](../INTEGRATION_GUIDE.md))
4. ✅ Configure webhooks no seu sistema
5. ✅ Monitore logs e erros

---

## 🎉 POC Validada!

Se todos os testes passaram, sua POC está validada! ✨

Você confirmou que:
- ✅ MongoDB funciona corretamente
- ✅ API REST está operacional
- ✅ Integração com HubSpot funciona
- ✅ Sistema previne duplicatas
- ✅ Validações estão ativas

**Agora é só integrar no seu sistema pessoal!**

---

## 📞 Suporte

- Logs do servidor: Veja o terminal onde rodou `npm run start:dev`
- Logs do MongoDB: MongoDB Atlas Dashboard
- Logs do HubSpot: Developer Console no site do HubSpot

**Documentação relacionada:**
- [API_INTEGRATION.md](../API_INTEGRATION.md) - Integração com seu sistema
- [DEV_GUIDE.md](../DEV_GUIDE.md) - Guia de desenvolvimento
- [INTEGRATION_GUIDE.md](../INTEGRATION_GUIDE.md) - Deploy em produção
