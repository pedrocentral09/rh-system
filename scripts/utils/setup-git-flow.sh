#!/bin/bash
# Setup inicial do Git Flow para o projeto

echo "🚀 Configurando Git Flow para Sistema RH..."

# 1. Criar e ir para main
echo "\n📌 Criando branch main..."
git checkout -b main 2>/dev/null || git checkout main

# 2. Criar tag V1.0
echo "\n🏷️  Criando tag v1.0.0..."
git tag -a v1.0.0 -m "Release V1.0 - Sistema pronto para produção" 2>/dev/null

# 3. Criar branch develop
echo "\n🌿 Criando branch develop..."
git checkout -b develop 2>/dev/null || git checkout develop

# 4. Voltar para main
echo "\n↩️  Voltando para main..."
git checkout main

# 5. Push tudo
echo "\n☁️  Fazendo push para GitHub..."
git push -u origin main develop --tags

echo "\n✅ Git Flow configurado com sucesso!"
echo "\nBranches criadas:"
echo "  • main (produção)"
echo "  • develop (V2.0)"
echo "\nTag criada:"
echo "  • v1.0.0"

echo "\n📚 Próximos passos:"
echo "  • Hotfixes: git checkout -b hotfix/nome-do-fix"
echo "  • Features: git checkout develop && git checkout -b feature/nome-da-feature"
echo "\n🎯 Ver guia completo: git_strategy.md"
