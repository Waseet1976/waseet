@echo off
chcp 65001 >nul
title Waseet — Sauvegarde + Mise à jour contexte
color 0B

echo.
echo  ╔══════════════════════════════════════╗
echo  ║   Waseet — Save ^& Context Update    ║
echo  ╚══════════════════════════════════════╝
echo.

:: ── 1. Mise à jour CONTEXT.md ────────────────────────────────
echo  [1/4] Mise à jour CONTEXT.md...
node scripts/update-context.js
if errorlevel 1 (
  echo  ❌  Erreur lors de la mise à jour du contexte.
  pause
  exit /b 1
)

:: ── 2. Git status ─────────────────────────────────────────────
echo.
echo  [2/4] Fichiers modifiés :
git status --short

:: ── 3. Staging ────────────────────────────────────────────────
echo.
echo  [3/4] Ajout au staging...
git add .

:: ── 4. Commit ─────────────────────────────────────────────────
echo.
set /p MSG="  Message de commit (Entrée = auto-save) : "

if "%MSG%"=="" (
  for /f "usebackq tokens=2 delims==" %%I in (`wmic os get localdatetime /value 2^>nul`) do set DT=%%I
  set "TIMESTAMP=%DT:~0,4%-%DT:~4,2%-%DT:~6,2% %DT:~8,2%:%DT:~10,2%"
  git commit -m "💾 Auto-save: %TIMESTAMP%"
) else (
  git commit -m "%MSG%"
)

if errorlevel 1 (
  echo  ⚠️   Rien à committer ou erreur git.
  goto end
)

:: ── 5. Push ───────────────────────────────────────────────────
echo.
echo  [4/4] Push vers GitHub...
git push origin main

if errorlevel 1 (
  echo  ⚠️   Push échoué. Vérifiez votre connexion ou la remote.
) else (
  echo.
  echo  ✅  Tout est sauvegardé et à jour !
)

:end
echo.
pause
