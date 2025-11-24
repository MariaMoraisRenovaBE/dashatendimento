#!/bin/bash

echo "========================================"
echo "  Iniciando Frontend do Dashboard"
echo "========================================"
cd frontend
echo ""
echo "Instalando dependências (se necessário)..."
npm install
echo ""
echo "Iniciando servidor de desenvolvimento..."
echo ""
echo "Dashboard disponível em: http://localhost:3000"
echo ""
npm run dev

