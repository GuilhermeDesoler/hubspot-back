#!/bin/bash

echo "🌱 Populando banco de dados com dados de teste..."
echo ""

BASE_URL="http://localhost:3000"

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Array de opções para adicionar
declare -a options=(
  '{"name":"Cliente Ativo","value":"cliente_ativo"}'
  '{"name":"Cliente Inativo","value":"cliente_inativo"}'
  '{"name":"Lead Qualificado","value":"lead_qualificado"}'
  '{"name":"Prospect","value":"prospect"}'
  '{"name":"Cliente Premium","value":"cliente_premium"}'
)

echo -e "${YELLOW}Adicionando ${#options[@]} opções...${NC}"
echo ""

for option in "${options[@]}"
do
  # Extrai o nome para exibir
  name=$(echo $option | grep -o '"name":"[^"]*"' | cut -d'"' -f4)
  echo "📝 Adicionando: $name"

  response=$(curl -s -X POST $BASE_URL/api/add-option \
    -H "Content-Type: application/json" \
    -d "$option")

  if [[ $response == *"success"* ]]; then
    echo -e "${GREEN}   ✓ Sucesso${NC}"
  else
    echo "   ✗ Erro: $response"
  fi
  echo ""
done

echo -e "${GREEN}✅ Dados populados com sucesso!${NC}"
echo ""
echo "📊 Verificando opções adicionadas:"
echo ""
curl -s $BASE_URL/api/external-options | grep -o '"name":"[^"]*"' | cut -d'"' -f4 | while read line; do
  echo "   • $line"
done
echo ""
echo -e "${YELLOW}💡 Ver todas as opções:${NC}"
echo "   curl http://localhost:3000/api/external-options"
