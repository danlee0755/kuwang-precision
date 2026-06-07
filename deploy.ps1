# ============================================================
# 打对了 - 网站一键部署脚本
# 用于更新 config.json 后快速部署到 GitHub Pages
# ============================================================

param(
    [string]$Message = "Update website content"
)

$ErrorActionPreference = "Stop"
$SiteFolder = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Kuwang Precision - Deploy to GitHub" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查 Git
$git = Get-Command git -ErrorAction SilentlyContinue
if (-not $git) {
    Write-Host "ERROR: Git not installed!" -ForegroundColor Red
    Write-Host "Download: https://git-scm.com/download/win" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Or use Netlify drag-and-drop instead:"
    Write-Host "  1. Go to https://app.netlify.com/drop"
    Write-Host "  2. Drag this folder: $SiteFolder"
    Write-Host "  3. Done!"
    pause
    exit 1
}

Push-Location $SiteFolder

# 确保我们在正确的仓库中
$isRepo = git rev-parse --git-dir 2>$null
if (-not $isRepo) {
    Write-Host "Not a git repository. Initializing..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "You need a GitHub repository first. Steps:"
    Write-Host "  1. Go to https://github.com/new"
    Write-Host "  2. Create a repo named: kuwang-precision"
    Write-Host "  3. Run this script again after setup"
    Write-Host ""
    Write-Host "For now, use Netlify drag-and-drop:"
    Write-Host "  https://app.netlify.com/drop"
    Pop-Location
    pause
    exit 1
}

# 添加所有更改
Write-Host "[1/3] Adding changes..." -ForegroundColor Green
git add .

# 提交
Write-Host "[2/3] Committing: $Message" -ForegroundColor Green
git commit -m "$Message" 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "  No changes to commit." -ForegroundColor Yellow
}

# 推送
Write-Host "[3/3] Pushing to GitHub..." -ForegroundColor Green
git push origin main 2>$null
if ($LASTEXITCODE -ne 0) {
    git push origin master 2>$null
}

Write-Host ""
Write-Host "Done! Site will update in ~1 minute." -ForegroundColor Green

Pop-Location
pause
