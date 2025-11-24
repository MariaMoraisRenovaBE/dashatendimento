#!/bin/bash

echo "========================================"
echo "  Iniciando Backend do Dashboard"
echo "========================================"
cd backend
echo ""
echo "Instalando dependências (se necessário)..."
npm install
echo ""
echo "Iniciando servidor na porta 3001..."
echo ""
npm start

