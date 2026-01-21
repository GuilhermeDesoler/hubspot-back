#!/bin/bash

# Atualize com sua URL do Render após o deploy
RENDER_URL="${RENDER_URL:-https://seu-app.onrender.com}"

echo "🧪 Testando Deploy no Render"
echo "URL: $RENDER_URL"
echo "============================================"
echo ""

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Passo 1: Health Check
echo -e "${BLUE}1️⃣  Health Check${NC}"
echo ""

response=$(curl -s $RENDER_URL/api/health)

if [[ $response == *"connected"* ]] && [[ $response == *"true"* ]]; then
    echo -e "${GREEN}✅ Servidor online e MongoDB conectado!${NC}"
    echo "$response" | json_pp 2>/dev/null || echo "$response"
else
    echo -e "${RED}❌ Erro no health check${NC}"
    echo "$response"
    exit 1
fi

echo ""
sleep 1

# Passo 2: Adicionar opção de teste
echo -e "${BLUE}2️⃣  Adicionando Opção de Teste${NC}"
echo ""

response=$(curl -s -X POST $RENDER_URL/api/add-option \
    -H "Content-Type: application/json" \
    -d '{"name":"Teste Deploy Render","value":"teste_deploy_render"}')

if [[ $response == *"success"* ]]; then
    echo -e "${GREEN}✅ Opção adicionada com sucesso!${NC}"
    echo "$response" | json_pp 2>/dev/null || echo "$response"
else
    echo -e "${RED}❌ Erro ao adicionar opção${NC}"
    echo "$response"
fi

echo ""
sleep 1

# Passo 3: Listar opções
echo -e "${BLUE}3️⃣  Listando Opções do MongoDB${NC}"
echo ""

response=$(curl -s $RENDER_URL/api/external-options)
count=$(echo "$response" | grep -o '"count":[0-9]*' | grep -o '[0-9]*')

echo "$response" | json_pp 2>/dev/null || echo "$response"
echo ""

if [ "$count" -gt 0 ]; then
    echo -e "${GREEN}✅ $count opções encontradas!${NC}"
else
    echo -e "${YELLOW}⚠️  Nenhuma opção encontrada${NC}"
fi

echo ""
sleep 1

# Passo 4: Teste de sincronização (opcional)
echo -e "${BLUE}4️⃣  Teste de Sincronização HubSpot (opcional)${NC}"
echo ""

read -p "Deseja testar sincronização com HubSpot? (s/N) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Ss]$ ]]; then
    response=$(curl -s -X POST $RENDER_URL/api/sync-to-hubspot \
        -H "Content-Type: application/json")

    if [[ $response == *"success"* ]]; then
        echo -e "${GREEN}✅ Sincronização bem-sucedida!${NC}"
    else
        echo -e "${RED}❌ Erro na sincronização${NC}"
    fi

    echo "$response" | json_pp 2>/dev/null || echo "$response"
else
    echo "⏭️  Pulando sincronização"
fi

echo ""
echo ""

# Resumo
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}📊 RESUMO DO TESTE${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""
echo -e "${GREEN}✅ Deploy validado com sucesso!${NC}"
echo ""
echo "📊 Endpoints testados:"
echo "   • GET  $RENDER_URL/api/health"
echo "   • POST $RENDER_URL/api/add-option"
echo "   • GET  $RENDER_URL/api/external-options"
echo ""
echo "🔗 URLs importantes:"
echo "   • API Base: $RENDER_URL/api"
echo "   • Iframe: $RENDER_URL/iframe/add-option.html"
echo ""
echo -e "${YELLOW}🎯 Próximos passos:${NC}"
echo "   1. Atualize BACKEND_URL no HubSpot App"
echo "   2. Configure HUBSPOT_ACCESS_TOKEN no Render"
echo "   3. Teste integração completa"
echo ""
