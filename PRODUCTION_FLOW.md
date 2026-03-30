# 🚀 Fluxo de Produção de Excelência (RH System)

Este guia define o processo para evitar retrabalho, bugs em produção e "voltas em círculo" durante o desenvolvimento.

## 1. 🛡️ Verificação Pré-Push (Local)

Antes de fazer `git push origin main`, você **DEVE** garantir que o sistema compila. 
Muitos erros (como os de TypeScript que vimos antes) só aparecem no build.

**Execute estes comandos em ordem:**
1. `npx prisma generate` (Garante que os tipos do banco estão atualizados)
2. `npm run lint` (Corrige erros de faturamento e tipos soltos)
3. `npm run build` (O teste definitivo: se passar aqui, o Railway vai aceitar)

---

## 2. 🧱 Desenvolvimento Modular "One-at-a-Time"

Para não perdermos o foco, seguiremos a regra de **um módulo por vez**.

| Módulo | Status | Responsável |
| :--- | :--- | :--- |
| **WhatsApp Assistant** | ✅ Refatorado / Estável | Antigravity |
| **Dashboard de Férias** | ✅ UI Refatorada | Antigravity |
| **Gestão de Cargos/Permissões** | ⚠️ Revisando Tipos | Em andamento |
| **Folha de Pagamento** | ⏳ Aguardando | - |

---

## 3. 🚦 Ciclo de Vida de uma Task

Para cada nova ideia ou bug:

1. **Definição**: O que exatamente precisa ser feito? (Ex: "Adicionar botão de editar no WhatsApp")
2. **Implementação**: Código limpo, seguindo os padrões estabelecidos (Aesthetics, Framer Motion).
3. **Refatoração Interna**: Antes de terminar, ajustar os nomes de variáveis e imports.
4. **Validação**: Abrir o sistema localmente e clicar em tudo.
5. **Merge & Deploy**: Push para o GitHub.

---

## 4. 📝 Log de Decisões e Mudanças

Manteremos um arquivo `CHANGELOG.md` ou atualizaremos o `README.md` com as decisões técnicas.
Isso evita que esqueçamos *por que* algo foi feito de tal forma (ex: a limitação do Node v22.11).

### Regras de Ouro para Hoje:
- **Estética é Prioridade**: Nenhuma tela nova entra sem `framer-motion` e design premium.
- **Não ignore Lints**: Se o editor sublinhar em vermelho, corrija na hora.
- **Banco de Dados**: Sempre que mudar o `schema.prisma`, rode `npx prisma generate` IMEDIATAMENTE.

---

## 5. 🛠️ Ferramentas de Suporte

- **`scripts/`**: Use apenas para automação. Não importe arquivos de `src` para `scripts` a menos que use caminhos absolutos ou alias configurado.
- **`.env`**: Mantenha sincronizado com o Railway sempre que adicionar uma variável nova.
