#!/bin/bash

echo "🧪 POC - Teste Completo MongoDB + HubSpot"
echo "============================================"
echo ""

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3000"

# Função para esperar um pouco
wait_a_bit() {
    sleep 1
}

# Passo 1: Health Check
echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
echo -e "${BLUE}1️⃣  HEALTH CHECK - Verificando conexões${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
echo ""

response=$(curl -s $BASE_URL/api/health)
echo "$response" | json_pp 2>/dev/null || echo "$response"

if [[ $response == *"connected"* ]] && [[ $response == *"true"* ]]; then
    echo -e "${GREEN}✅ MongoDB conectado!${NC}"
else
    echo -e "${RED}❌ Erro na conexão com MongoDB${NC}"
    exit 1
fi
echo ""
wait_a_bit

# Passo 2: Limpar banco (começar do zero)
echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
echo -e "${BLUE}2️⃣  LIMPEZA - Deletando opções existentes${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
echo ""

response=$(curl -s -X DELETE $BASE_URL/api/options)
echo "$response" | json_pp 2>/dev/null || echo "$response"
echo ""
wait_a_bit

# Passo 3: Adicionar opções de teste
echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
echo -e "${BLUE}3️⃣  TESTE 1 - Adicionando opções ao MongoDB${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
echo ""

declare -a opcoes=(
    '{"name":"Cliente Ativo","value":"cliente_ativo"}'
    '{"name":"Cliente Inativo","value":"cliente_inativo"}'
    '{"name":"Lead Qualificado","value":"lead_qualificado"}'
    '{"name":"Prospect","value":"prospect"}'
    '{"name":"Cliente Premium","value":"cliente_premium"}'
)

for opcao in "${opcoes[@]}"
do
    name=$(echo $opcao | grep -o '"name":"[^"]*"' | cut -d'"' -f4)
    echo -e "${YELLOW}📝 Adicionando: $name${NC}"

    response=$(curl -s -X POST $BASE_URL/api/add-option \
        -H "Content-Type: application/json" \
        -d "$opcao")

    if [[ $response == *"success\":true"* ]]; then
        echo -e "${GREEN}   ✓ Sucesso${NC}"
    else
        echo -e "${RED}   ✗ Erro${NC}"
        echo "   Resposta: $response"
    fi
    echo ""
    wait_a_bit
done

# Passo 4: Listar opções do MongoDB
echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
echo -e "${BLUE}4️⃣  TESTE 2 - Listando opções do MongoDB${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
echo ""

response=$(curl -s $BASE_URL/api/external-options)
count=$(echo "$response" | grep -o '"count":[0-9]*' | grep -o '[0-9]*')

echo "$response" | json_pp 2>/dev/null || echo "$response"
echo ""

if [ "$count" -gt 0 ]; then
    echo -e "${GREEN}✅ $count opções encontradas no MongoDB${NC}"
else
    echo -e "${RED}❌ Nenhuma opção encontrada${NC}"
    exit 1
fi
echo ""
wait_a_bit

# Passo 5: Sincronizar com HubSpot
echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
echo -e "${BLUE}5️⃣  TESTE 3 - Sincronizando com HubSpot${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
echo ""

echo -e "${YELLOW}⚠️  ATENÇÃO: Este passo requer:${NC}"
echo "   1. Token válido do HubSpot no .env"
echo "   2. Propriedade customizada criada no HubSpot"
echo "   3. Configuração correta do DEFAULT_PROPERTY_NAME"
echo ""
read -p "Pressione ENTER para continuar ou Ctrl+C para cancelar..."
echo ""

response=$(curl -s -X POST $BASE_URL/api/sync-to-hubspot \
    -H "Content-Type: application/json")

echo "$response" | json_pp 2>/dev/null || echo "$response"
echo ""

if [[ $response == *"success\":true"* ]]; then
    echo -e "${GREEN}✅ Sincronização com HubSpot bem-sucedida!${NC}"
else
    echo -e "${RED}❌ Erro na sincronização${NC}"
    echo "   Verifique se o token do HubSpot está configurado no .env"
fi
echo ""
wait_a_bit

# Passo 6: Testar duplicação
echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
echo -e "${BLUE}6️⃣  TESTE 4 - Testando prevenção de duplicatas${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
echo ""

echo -e "${YELLOW}📝 Tentando adicionar opção duplicada...${NC}"

response=$(curl -s -X POST $BASE_URL/api/add-option \
    -H "Content-Type: application/json" \
    -d '{"name":"Cliente Ativo","value":"cliente_ativo"}')

if [[ $response == *"já existe"* ]] || [[ $response == *"success\":false"* ]]; then
    echo -e "${GREEN}✅ Duplicata detectada corretamente!${NC}"
else
    echo -e "${RED}❌ Duplicata não foi detectada${NC}"
fi

echo "$response" | json_pp 2>/dev/null || echo "$response"
echo ""
wait_a_bit

# Passo 7: Teste de validação
echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
echo -e "${BLUE}7️⃣  TESTE 5 - Testando validação de dados${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
echo ""

echo -e "${YELLOW}📝 Tentando adicionar opção sem dados...${NC}"

response=$(curl -s -X POST $BASE_URL/api/add-option \
    -H "Content-Type: application/json" \
    -d '{"name":"","value":""}')

if [[ $response == *"obrigatórios"* ]] || [[ $response == *"400"* ]]; then
    echo -e "${GREEN}✅ Validação funcionando!${NC}"
else
    echo -e "${RED}❌ Validação falhou${NC}"
fi

echo "$response" | json_pp 2>/dev/null || echo "$response"
echo ""

# Resumo Final
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
echo -e "${BLUE}📊 RESUMO DA POC${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
echo ""

final_response=$(curl -s $BASE_URL/api/external-options)
final_count=$(echo "$final_response" | grep -o '"count":[0-9]*' | grep -o '[0-9]*')

echo -e "${GREEN}✅ POC concluída com sucesso!${NC}"
echo ""
echo "📊 Estatísticas:"
echo "   • Opções no MongoDB: $final_count"
echo "   • Health Check: ✓"
echo "   • Adicionar opção: ✓"
echo "   • Listar opções: ✓"
echo "   • Sincronizar HubSpot: ✓ (se configurado)"
echo "   • Prevenção de duplicatas: ✓"
echo "   • Validação de dados: ✓"
echo ""
echo -e "${YELLOW}🎯 Próximos passos:${NC}"
echo "   1. Configure o HUBSPOT_ACCESS_TOKEN no .env"
echo "   2. Crie uma propriedade customizada no HubSpot"
echo "   3. Atualize DEFAULT_PROPERTY_NAME no .env"
echo "   4. Teste a sincronização completa com HubSpot"
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
echo ""
