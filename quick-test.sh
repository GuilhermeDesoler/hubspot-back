#!/bin/bash

# Quick test - Teste rápido da API
echo "🚀 Teste Rápido da API"
echo ""

BASE_URL="http://localhost:3000"

# Health check
echo "1️⃣  Health Check..."
curl -s $BASE_URL/api/health | json_pp 2>/dev/null || curl -s $BASE_URL/api/health
echo ""
echo ""

# Adicionar opção
echo "2️⃣  Adicionando opção de teste..."
curl -s -X POST $BASE_URL/api/add-option \
  -H "Content-Type: application/json" \
  -d '{"name":"Teste Quick","value":"teste_quick"}' | json_pp 2>/dev/null || curl -s -X POST $BASE_URL/api/add-option -H "Content-Type: application/json" -d '{"name":"Teste Quick","value":"teste_quick"}'
echo ""
echo ""

# Listar opções
echo "3️⃣  Listando opções..."
curl -s $BASE_URL/api/external-options | json_pp 2>/dev/null || curl -s $BASE_URL/api/external-options
echo ""
