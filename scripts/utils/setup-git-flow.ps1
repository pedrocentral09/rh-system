# Setup Git Flow - PowerShell Version
# Para Windows

Write-Host "🚀 Configurando Git Flow para Sistema RH..." -ForegroundColor Cyan

# 1. Criar e ir para main
Write-Host "`n📌 Criando branch main..." -ForegroundColor Yellow
git checkout -b main 2>$null
if ($LASTEXITCODE -ne 0) { git checkout main }

# 2. Criar tag V1.0
Write-Host "`n🏷️  Criando tag v1.0.0..." -ForegroundColor Yellow
git tag -a v1.0.0 -m "Release V1.0 - Sistema pronto para produção" 2>$null

# 3. Criar branch develop
Write-Host "`n🌿 Criando branch develop..." -ForegroundColor Yellow
git checkout -b develop 2>$null
if ($LASTEXITCODE -ne 0) { git checkout develop }

# 4. Voltar para main
Write-Host "`n↩️  Voltando para main..." -ForegroundColor Yellow
git checkout main

# 5. Push tudo
Write-Host "`n☁️  Fazendo push para GitHub..." -ForegroundColor Yellow
git push -u origin main develop --tags

Write-Host "`n✅ Git Flow configurado com sucesso!" -ForegroundColor Green
Write-Host "`nBranches criadas:" -ForegroundColor White
Write-Host "  • main (produção)" -ForegroundColor Gray
Write-Host "  • develop (V2.0)" -ForegroundColor Gray
Write-Host "`nTag criada:" -ForegroundColor White
Write-Host "  • v1.0.0" -ForegroundColor Gray

Write-Host "`n📚 Próximos passos:" -ForegroundColor Cyan
Write-Host "  • Hotfixes: git checkout -b hotfix/nome-do-fix" -ForegroundColor White
Write-Host "  • Features: git checkout develop && git checkout -b feature/nome-da-feature" -ForegroundColor White
Write-Host "`n🎯 Ver guia completo: git_strategy.md" -ForegroundColor Cyan
