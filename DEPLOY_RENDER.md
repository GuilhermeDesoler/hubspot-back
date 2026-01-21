# 🚀 Deploy no Render - Guia Completo

## 📋 Pré-requisitos

- Conta no Render (https://render.com) - Gratuita
- Repositório Git (GitHub, GitLab ou Bitbucket)
- MongoDB connection string (já temos!)

---

## ⚡ Quick Start (5 minutos)

### 1. Preparar o Repositório

```bash
# Certifique-se de estar na pasta do projeto
cd /home/gui/hubspot-apps

# Inicializar git (se ainda não tiver)
git init

# Adicionar arquivos
git add .
git commit -m "feat: POC MongoDB + HubSpot integration ready for deploy"

# Conectar com seu repositório remoto
git remote add origin https://github.com/seu-usuario/seu-repo.git
git push -u origin main
```

### 2. Criar Web Service no Render

1. Acesse https://dashboard.render.com
2. Clique em **"New +"** → **"Web Service"**
3. Conecte seu repositório GitHub/GitLab
4. Configure:

```
Name: hubspot-integration-poc
Region: Oregon (US West) ou mais próximo
Branch: main
Root Directory: back
Runtime: Node
Build Command: npm install && npm run build
Start Command: npm run start:prod
```

### 3. Adicionar Variáveis de Ambiente

No Render Dashboard, vá em **Environment** e adicione:

```
NODE_ENV=production
PORT=3000

# MongoDB
MONGODB_URI=mongodb+srv://guilhermedesoler_db_user:30271859@db.j9ec1wz.mongodb.net/
MONGODB_DB_NAME=hubspot-integration-poc

# HubSpot (adicione seu token)
HUBSPOT_ACCESS_TOKEN=seu-token-aqui
DEFAULT_OBJECT_TYPE=contacts
DEFAULT_PROPERTY_NAME=sua_propriedade_customizada
```

### 4. Deploy!

Clique em **"Create Web Service"**

Render vai:
1. Clonar seu repositório
2. Instalar dependências
3. Compilar TypeScript
4. Iniciar o servidor
5. Gerar uma URL pública

---

## 📁 Arquivos Necessários (Já Criados)

### ✅ package.json

Scripts corretos já configurados:
```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/main.js",
    "start:prod": "node dist/main.js"
  }
}
```

### ✅ tsconfig.json

Configuração TypeScript já pronta.

### ✅ .gitignore

```
node_modules/
dist/
.env
*.log
.DS_Store
```

---

## 🔧 Configurações Adicionais

### Health Check Endpoint

Render usa `/api/health` para verificar se o app está rodando.

**Já implementado!** ✅

```typescript
GET /api/health
// Retorna: { success: true, mongodb: { connected: true } }
```

### CORS

Adicione o domínio do Render ao CORS no `src/main.ts`:

```typescript
app.enableCors({
  origin: [
    'https://app.hubspot.com',
    'https://app-eu1.hubspot.com',
    'https://seu-app.onrender.com',  // Adicione sua URL do Render
    '*' // Para testes iniciais
  ],
  credentials: true
});
```

---

## 🌐 Após o Deploy

### 1. Obter URL do Render

Depois do deploy, você terá uma URL como:
```
https://hubspot-integration-poc.onrender.com
```

### 2. Testar o Health Check

```bash
curl https://hubspot-integration-poc.onrender.com/api/health
```

Deve retornar:
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

### 3. Testar Adicionar Opção

```bash
curl -X POST https://hubspot-integration-poc.onrender.com/api/add-option \
  -H "Content-Type: application/json" \
  -d '{"name":"Cliente Teste Deploy","value":"cliente_teste_deploy"}'
```

### 4. Atualizar HubSpot App

Edite `external-card-data/src/app/app.functions/crm-card.js`:

```javascript
const BACKEND_URL = process.env.BACKEND_URL || 'https://hubspot-integration-poc.onrender.com';
```

Edite `external-card-data/src/app/extensions/crm-card.json`:

```json
{
  "actions": {
    "primary": {
      "uri": "https://hubspot-integration-poc.onrender.com/iframe/add-option"
    }
  }
}
```

---

## 🔍 Monitoramento

### Logs do Render

1. Dashboard do Render
2. Clique no seu serviço
3. Aba **"Logs"**
4. Veja logs em tempo real

### Métricas

No Dashboard:
- CPU usage
- Memory usage
- Request count
- Response time

---

## 💰 Plano Gratuito do Render

### Limites:
- ✅ 750 horas/mês (suficiente!)
- ✅ Sleep após 15 min de inatividade
- ✅ Wake-up em ~30 segundos
- ✅ Build time: 500 min/mês
- ✅ SSL automático

### Dicas:
- Use um "keep alive" para evitar sleep
- Upgrade para Starter ($7/mês) se precisar 24/7

---

## 🎯 Checklist de Deploy

### Antes do Deploy
- [ ] Código commitado no Git
- [ ] Repositório no GitHub/GitLab
- [ ] package.json com scripts corretos
- [ ] .gitignore configurado
- [ ] .env.example atualizado

### Configuração no Render
- [ ] Web Service criado
- [ ] Root Directory: `back`
- [ ] Build Command: `npm install && npm run build`
- [ ] Start Command: `npm run start:prod`
- [ ] Variáveis de ambiente adicionadas

### Após Deploy
- [ ] Health check funcionando
- [ ] Endpoints testados
- [ ] MongoDB conectado
- [ ] HubSpot App atualizado com nova URL

---

## 🐛 Troubleshooting

### Deploy falha no build

**Erro:** `Cannot find module`

**Solução:**
```bash
# Certifique-se que todas as dependências estão no package.json
npm install
git add package.json package-lock.json
git commit -m "fix: update dependencies"
git push
```

### App não inicia

**Erro:** `EADDRINUSE: address already in use`

**Solução:** Render cuida disso automaticamente. Verifique se `process.env.PORT` está sendo usado:
```typescript
const port = process.env.PORT || 3000;
await app.listen(port);
```

### MongoDB não conecta

**Erro:** `MongooseError: Could not connect`

**Solução:**
1. Verifique variáveis de ambiente no Render
2. Teste connection string localmente
3. Verifique IP whitelist no MongoDB Atlas (0.0.0.0/0 para permitir todos)

### CORS error

**Erro:** `No 'Access-Control-Allow-Origin' header`

**Solução:** Adicione domínio do Render no CORS:
```typescript
app.enableCors({
  origin: ['https://seu-app.onrender.com', '*'],
  credentials: true
});
```

---

## 🔄 Atualizar Deploy

Qualquer push para o branch `main` vai fazer redeploy automático:

```bash
git add .
git commit -m "feat: nova funcionalidade"
git push
```

Render vai:
1. Detectar o push
2. Fazer rebuild automático
3. Deploy da nova versão

---

## 🎨 URLs Importantes

Depois do deploy, você terá:

| Endpoint | URL |
|----------|-----|
| API Base | `https://seu-app.onrender.com/api` |
| Health Check | `https://seu-app.onrender.com/api/health` |
| Add Option | `https://seu-app.onrender.com/api/add-option` |
| Iframe | `https://seu-app.onrender.com/iframe/add-option.html` |

---

## 📊 Script de Teste Pós-Deploy

Salve como `test-deploy.sh`:

```bash
#!/bin/bash

RENDER_URL="https://seu-app.onrender.com"  # Atualize com sua URL

echo "🧪 Testando deploy no Render..."
echo ""

# Health Check
echo "1️⃣  Health Check..."
curl -s $RENDER_URL/api/health | json_pp
echo ""

# Adicionar opção
echo "2️⃣  Adicionando opção de teste..."
curl -s -X POST $RENDER_URL/api/add-option \
  -H "Content-Type: application/json" \
  -d '{"name":"Teste Deploy","value":"teste_deploy"}' | json_pp
echo ""

# Listar opções
echo "3️⃣  Listando opções..."
curl -s $RENDER_URL/api/external-options | json_pp
echo ""

echo "✅ Testes concluídos!"
```

---

## 🎉 Deploy Concluído!

Depois do deploy bem-sucedido:

1. ✅ Backend rodando 24/7 (plano pago) ou com sleep (gratuito)
2. ✅ MongoDB conectado
3. ✅ SSL automático (HTTPS)
4. ✅ URL pública acessível
5. ✅ Logs em tempo real
6. ✅ Auto-deploy no git push

### Próximos Passos:

1. **Testar API:** Use `test-deploy.sh`
2. **Atualizar HubSpot App:** Com nova URL
3. **Configurar HubSpot:** Adicione token se ainda não tiver
4. **Monitorar:** Veja logs no Render Dashboard

---

## 🔗 Links Úteis

- **Render Dashboard:** https://dashboard.render.com
- **Render Docs:** https://render.com/docs
- **Render Status:** https://status.render.com

---

**🚀 Pronto para deploy! Boa sorte!**
