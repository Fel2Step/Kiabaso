Write-Host "╔══════════════════════════════════════════════════╗" -ForegroundColor Blue
Write-Host "║        Kiabasso - Setup Automático             ║" -ForegroundColor Blue
Write-Host "╚══════════════════════════════════════════════════╝" -ForegroundColor Blue
Write-Host ""

# 1. Verificar MySQL
Write-Host "1. Verificando MySQL..." -ForegroundColor Yellow
try {
    $mysql = Get-Command mysql -ErrorAction Stop
    Write-Host "   MySQL encontrado!" -ForegroundColor Green
} catch {
    Write-Host "   ⚠️ MySQL não encontrado no PATH. Instale MySQL 8+ primeiro." -ForegroundColor Red
    Write-Host "   Download: https://dev.mysql.com/downloads/installer/"
    exit 1
}

# 2. Configurar backend
Write-Host "`n2. Configurando backend..." -ForegroundColor Yellow
Set-Location -LiteralPath "kiabasso-backend"
if (-not (Test-Path "node_modules")) {
    npm install
}
Set-Location ..

# 3. Configurar frontend
Write-Host "`n3. Configurando frontend..." -ForegroundColor Yellow
Set-Location -LiteralPath "kiabasso-frontend"
if (-not (Test-Path "node_modules")) {
    npm install
}
Set-Location ..

# 4. Criar base de dados
Write-Host "`n4. Criando base de dados MySQL..." -ForegroundColor Yellow
try {
    mysql -u root -e "SOURCE kiabasso-backend/migrations/001_initial.sql" 2>$null
    Write-Host "   Tabelas criadas com sucesso!" -ForegroundColor Green
} catch {
    Write-Host "   ⚠️ Erro ao criar base de dados. Execute manualmente:" -ForegroundColor Yellow
    Write-Host "   mysql -u root -p < migrations/001_initial.sql"
}

# 5. Popular com dados de teste
Write-Host "`n5. Populando dados de teste..." -ForegroundColor Yellow
Set-Location -LiteralPath "kiabasso-backend"
try {
    node seeders/seed.js
} catch {
    Write-Host "   ⚠️ Erro ao popular dados." -ForegroundColor Yellow
}
Set-Location ..

Write-Host ""
Write-Host "╔══════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  Setup concluído!                                ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "Para iniciar o backend:"
Write-Host "  cd kiabasso-backend; npm start"
Write-Host ""
Write-Host "Para iniciar o frontend:"
Write-Host "  cd kiabasso-frontend; npm run dev"
Write-Host ""
Write-Host "Contas de teste:"
Write-Host "  joao@email.com    / Teste@123"
Write-Host "  maria@email.com   / Teste@123"
Write-Host "  pedro@email.com   / Teste@123"
Write-Host "  ana@email.com     / Teste@123"
Write-Host "  carlos@email.com  / Teste@123"
Write-Host ""
