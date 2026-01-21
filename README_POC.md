# 🎯 POC - MongoDB + HubSpot Integration

## ✅ O que foi implementado

Esta POC valida a integração completa entre MongoDB e HubSpot para gerenciar opções de dropdown dinamicamente.

### Stack Tecnológica:
- **Backend**: NestJS + TypeScript
- **Banco de Dados**: MongoDB Atlas
- **Integração**: HubSpot API oficial
- **Validação**: Mongoose schemas

---

## 🚀 Start Rápido (3 passos)

### 1. Configure o ambiente

O MongoDB já está configurado com a connection string fornecida!

```bash
cd back
npm install
```

### 2. Inicie o servidor

```bash
npm run start:dev
```

Aguarde ver:
```
🚀 Servidor rodando em http://localhost:3000
[Nest] LOG [MongooseModule] Mongoose connected
```

### 3. Rode o teste automatizado

```bash
./test-poc.sh
```

---

## 📊 O que o teste POC valida

O script `test-poc.sh` executa 7 testes automatizados:

1. ✅ **Health Check** - Verifica conexão com MongoDB
2. ✅ **Limpeza** - Deleta dados anteriores
3. ✅ **Adicionar 5 opções** - Salva no MongoDB
4. ✅ **Listar opções** - Busca do MongoDB
5. ✅ **Sincronizar** - Envia para HubSpot (opcional)
6. ✅ **Prevenir duplicatas** - Tenta adicionar duplicado
7. ✅ **Validação** - Testa dados inválidos

---

## 🎯 Endpoints para Testar

### 1. Health Check
```bash
curl http://localhost:3000/api/health
```

### 2. Adicionar Opção
```bash
curl -X POST http://localhost:3000/api/add-option \
  -H "Content-Type: application/json" \
  -d '{"name":"Cliente VIP","value":"cliente_vip"}'
```

### 3. Listar Opções
```bash
curl http://localhost:3000/api/external-options
```

### 4. Sincronizar com HubSpot
```bash
curl -X POST http://localhost:3000/api/sync-to-hubspot
```

### 5. Deletar Todas
```bash
curl -X DELETE http://localhost:3000/api/options
```

---

## 🔍 Verificar no MongoDB

### Via MongoDB Compass

1. Instale MongoDB Compass
2. Conecte com:
```
mongodb+srv://guilhermedesoler_db_user:30271859@db.j9ec1wz.mongodb.net/
```
3. Selecione database: `hubspot-integration-poc`
4. Veja a collection: `options`

### Via MongoDB Atlas

1. Acesse https://cloud.mongodb.com
2. Navegue até seu cluster
3. Browse Collections
4. Database: `hubspot-integration-poc`
5. Collection: `options`

---

## 📁 Estrutura do Banco

### Collection: `options`

```javascript
{
  _id: ObjectId("..."),
  name: "Cliente Premium",        // Nome exibido
  value: "cliente_premium",       // Valor interno
  objectType: "contacts",         // Tipo de objeto HubSpot
  propertyName: "status_cliente", // Nome da propriedade
  synced: true,                   // Sincronizado com HubSpot?
  createdAt: ISODate("..."),
  updatedAt: ISODate("...")
}
```

---

## 🎨 Fluxo da POC

```
┌─────────────────────┐
│   Seu Sistema       │
│   (curl/API call)   │
└──────────┬──────────┘
           │
           ↓ POST /api/add-option
┌─────────────────────┐
│   Backend NestJS    │
│   1. Valida dados   │
│   2. Verifica dups  │
└──────────┬──────────┘
           │
           ↓ Mongoose
┌─────────────────────┐
│   MongoDB Atlas     │
│   Salva opção       │
└──────────┬──────────┘
           │
           ↓ HubSpot API
┌─────────────────────┐
│   HubSpot CRM       │
│   Atualiza dropdown │
└─────────────────────┘
```

---

## 🧪 Resultado Esperado

Após rodar `./test-poc.sh`, você deve ver:

```
═══════════════════════════════════════════════
📊 RESUMO DA POC
═══════════════════════════════════════════════

✅ POC concluída com sucesso!

📊 Estatísticas:
   • Opções no MongoDB: 5
   • Health Check: ✓
   • Adicionar opção: ✓
   • Listar opções: ✓
   • Sincronizar HubSpot: ✓ (se configurado)
   • Prevenção de duplicatas: ✓
   • Validação de dados: ✓
```

---

## 🔐 Integração com HubSpot (Opcional para POC)

Para testar a sincronização com HubSpot:

### 1. Obter Token

1. Acesse HubSpot
2. Settings → Integrations → Private Apps
3. Create a private app
4. Adicione scopes:
   - `crm.objects.contacts.read`
   - `crm.objects.contacts.write`
   - `crm.schemas.contacts.read`
   - `crm.schemas.contacts.write`
5. Copie o token

### 2. Criar Propriedade

1. Settings → Properties
2. Contact properties
3. Create property
4. Field type: Dropdown select
5. Internal name: copie este nome!

### 3. Configurar

Edite `.env`:
```env
HUBSPOT_ACCESS_TOKEN=seu-token-aqui
DEFAULT_PROPERTY_NAME=nome-interno-da-propriedade
```

### 4. Testar

```bash
npm run start:dev
./test-poc.sh
```

---

## 📊 Logs e Debug

### Logs do servidor mostram:

```
📝 Adicionando opção: { name: 'Cliente VIP', value: 'cliente_vip' }
✅ Opção salva no MongoDB: { _id: '...', name: 'Cliente VIP', ... }
✅ Opção sincronizada com HubSpot
📊 5 opções no MongoDB
🔄 Sincronizando opções com HubSpot...
   Object Type: contacts
   Property Name: status_cliente
📊 Encontradas 5 opções no MongoDB
✅ Sincronização completa!
```

---

## 🎯 Checklist de Validação da POC

### Fase 1: MongoDB (Essencial)
- [ ] Health check retorna `connected: true`
- [ ] Consegue adicionar opção
- [ ] Opção aparece em GET /api/external-options
- [ ] Previne duplicatas (retorna erro)
- [ ] Valida dados vazios (retorna 400)

### Fase 2: HubSpot (Opcional)
- [ ] Token configurado no .env
- [ ] Propriedade criada no HubSpot
- [ ] Sincronização manual funciona
- [ ] Opção aparece no HubSpot
- [ ] Dropdown atualizado

---

## ✅ POC Aprovada?

Se você conseguiu:
1. ✅ Conectar com MongoDB
2. ✅ Adicionar opções via API
3. ✅ Listar opções do banco
4. ✅ Prevenir duplicatas
5. ✅ Validar dados

**🎉 A POC está validada!**

Você provou que é possível integrar seu sistema com o HubSpot através de:
- MongoDB para persistência
- API REST para comunicação
- HubSpot API para sincronização

---

## 🚀 Próximos Passos

1. **Integrar no seu sistema**
   - Veja [API_INTEGRATION.md](../API_INTEGRATION.md)
   - Exemplos em 6 linguagens

2. **Testar HubSpot Card**
   - Veja [QUICK_START.md](../QUICK_START.md)

3. **Deploy em produção**
   - Veja [INTEGRATION_GUIDE.md](../INTEGRATION_GUIDE.md)

---

## 📝 Notas Importantes

### MongoDB Atlas
- Connection string já configurada
- Database: `hubspot-integration-poc`
- Collection: `options`
- Sem IP whitelist necessário

### Segurança
- Em produção, use variáveis de ambiente protegidas
- Adicione autenticação nos endpoints
- Use HTTPS
- Configure IP whitelist no MongoDB

### Performance
- MongoDB Atlas tier gratuito suporta até 512MB
- Índice único em `value` para prevenir duplicatas
- Timestamps automáticos para auditoria

---

## 🆘 Suporte

### MongoDB não conecta
1. Verifique connection string no .env
2. Teste health check: `curl http://localhost:3000/api/health`
3. Veja logs do servidor

### HubSpot retorna 401
1. Token inválido/expirado
2. Regenere token no HubSpot
3. Atualize no .env
4. Reinicie servidor

### Opções não aparecem
1. Verifique logs: `npm run start:dev`
2. Teste health check
3. Verifique se MongoDB está acessível

---

## 📚 Documentação Completa

- **[POC_GUIDE.md](POC_GUIDE.md)** - Guia detalhado de testes
- **[API_INTEGRATION.md](../API_INTEGRATION.md)** - Como integrar seu sistema
- **[DEV_GUIDE.md](../DEV_GUIDE.md)** - Desenvolvimento e debug
- **[INTEGRATION_GUIDE.md](../INTEGRATION_GUIDE.md)** - Deploy em produção

---

**🎯 Boa POC! Qualquer dúvida, consulte os logs do servidor.**
