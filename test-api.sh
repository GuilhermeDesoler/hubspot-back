#!/bin/bash

echo "🧪 Testando API do Backend..."
echo ""

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3000"

echo -e "${YELLOW}Base URL: $BASE_URL${NC}"
echo ""

# Teste 1: Health Check
echo "1️⃣  Teste: GET /api/external-options"
response=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/api/external-options)
if [ $response -eq 200 ]; then
    echo -e "${GREEN}✓ Passou (HTTP $response)${NC}"
else
    echo -e "${RED}✗ Falhou (HTTP $response)${NC}"
fi
echo ""

# Teste 2: Adicionar Opção
echo "2️⃣  Teste: POST /api/add-option"
add_response=$(curl -s -X POST $BASE_URL/api/add-option \
    -H "Content-Type: application/json" \
    -d '{"name":"Teste Auto","value":"teste_auto"}')

if [[ $add_response == *"success"* ]]; then
    echo -e "${GREEN}✓ Passou${NC}"
    echo "   Resposta: $add_response"
else
    echo -e "${RED}✗ Falhou${NC}"
    echo "   Resposta: $add_response"
fi
echo ""

# Teste 3: Listar Opções Novamente
echo "3️⃣  Teste: GET /api/external-options (verificar nova opção)"
list_response=$(curl -s $BASE_URL/api/external-options)
if [[ $list_response == *"Teste Auto"* ]]; then
    echo -e "${GREEN}✓ Passou - Opção encontrada${NC}"
else
    echo -e "${RED}✗ Falhou - Opção não encontrada${NC}"
fi
echo "   Resposta: $list_response"
echo ""

# Teste 4: Teste do Iframe
echo "4️⃣  Teste: GET /iframe/add-option.html"
iframe_response=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/iframe/add-option.html)
if [ $iframe_response -eq 200 ]; then
    echo -e "${GREEN}✓ Passou - Iframe acessível (HTTP $iframe_response)${NC}"
    echo -e "   Acesse: ${YELLOW}http://localhost:3000/iframe/add-option.html${NC}"
else
    echo -e "${RED}✗ Falhou (HTTP $iframe_response)${NC}"
fi
echo ""

echo "✅ Testes concluídos!"
echo ""
echo -e "${YELLOW}💡 Dicas:${NC}"
echo "   - Backend rodando? npm run start:dev"
echo "   - Ver todos os dados: curl http://localhost:3000/api/external-options"
echo "   - Testar iframe no navegador: http://localhost:3000/iframe/add-option.html"
