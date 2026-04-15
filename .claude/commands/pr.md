---
description: Ouvrir une PR GitHub avec résumé structuré
allowed-tools: Bash(git:*), Bash(gh pr:*), Bash(gh api:*)
---

Ouvre une pull request pour la branche courante.

## Contexte

!`git branch --show-current`

!`git log main..HEAD --oneline`

!`git diff main...HEAD --stat`

## Instructions

1. Si la branche est `main` ou `master`, refuse et demande une branche dédiée.
2. Si la branche n'est pas pushée, push avec `-u origin <branche>`.
3. Construis le titre : même format que les commits, ≤70 chars.
4. Construis le body avec ce template :

```markdown
## Summary

- bullet 1
- bullet 2

## Changes par scope

- **api** : ...
- **ui** : ...

## Test plan

- [ ] `pnpm turbo type-check` passe
- [ ] `pnpm turbo build` passe
- [ ] (si UI) testé dans le browser
- [ ] (si API) route testée manuellement (curl/Postman)

## Notes

(optionnel : décisions, follow-ups, limites connues)
```

5. Crée la PR via `gh pr create` avec un HEREDOC pour préserver le formatage.
6. Retourne l'URL de la PR.

Arguments : $ARGUMENTS (ex: `draft` → créer en draft, `base develop` → changer la base).
