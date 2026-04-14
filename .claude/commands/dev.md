---
description: Lancer pnpm dev (web + api) en tâche de fond
allowed-tools: Bash(pnpm dev:*), Bash(pnpm turbo dev:*), Bash(lsof:*)
---

Démarre le stack en dev.

## Instructions

1. Vérifie d'abord qu'aucun process n'écoute déjà sur les ports 3000 (web) et 3001 (api) : `lsof -i :3000 -i :3001 -P -n | grep LISTEN || echo "ports libres"`.
2. Si un port est occupé, affiche le PID et demande à l'utilisateur s'il veut le tuer.
3. Lance `pnpm turbo dev` en `run_in_background: true` (longue durée).
4. Affiche à l'utilisateur :
   - L'ID du process de fond
   - Les URLs : web `http://localhost:3000`, api `http://localhost:3001`
   - Comment voir les logs : utiliser Monitor/Read sur la sortie
5. Ne bloque pas ta propre conversation — rends la main.

Arguments : $ARGUMENTS (ex: `--filter=web` pour ne lancer que le front).
