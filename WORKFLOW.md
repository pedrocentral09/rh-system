# Quick Reference - Git Workflow

## 🚀 COMANDOS ESSENCIAIS

### Desenvolvimento (V2.0)
```bash
git checkout develop
npm run dev  # Roda local (SQLite)
git add .
git commit -m "feat: nova funcionalidade"
git push origin develop  # Salva no GitHub, NÃO deploya
```

### Hotfix Urgente (V1.01)
```bash
git checkout main
git checkout -b hotfix/corrigir-bug
# ... corrigir ...
git checkout main
git merge hotfix/corrigir-bug
git push origin main  # DEPLOYA no Railway!
```

### Deploy V2.0 (Quando pronto)
```bash
git checkout main
git merge develop
git push origin main  # DEPLOYA!
```

---

## 🎯 REGRA DE OURO

```
develop → Trabalha localmente ✅
main → Deploya Railway 🚀
```

**Você NÃO precisa fazer deploy toda hora!** 🎉

---

## 📊 AMBIENTES

| Ambiente | Branch | Comando | Deploy? |
|----------|--------|---------|---------|
| **Local** | develop | `npm run dev` | ❌ |
| **GitHub** | develop | `git push` | ❌ |
| **Produção** | main | `git push` | ✅ |

---

## ✅ PODE FAZER

- ✅ Push no develop quantas vezes quiser
- ✅ Rodar local em qualquer branch
- ✅ Testar à vontade
- ✅ Commitar work-in-progress

## ❌ EVITAR

- ❌ Push direto no main sem testar
- ❌ Esquecer de merge hotfix no develop
- ❌ Commits gigantes (preferir pequenos)

---

**Ver guia completo:** `local_workflow.md`
