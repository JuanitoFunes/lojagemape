# Cursor hook wrapper: commit + push after edits (Windows).
$null = [Console]::In.ReadToEnd()
$root = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
Set-Location $root
node scripts/git-sync.js
Write-Output "{}"
