# 🔐 Configuração do GitHub

## ⚠️ IMPORTANTE: GitHub não aceita mais senhas!

O GitHub desabilitou a autenticação por senha desde agosto de 2021. Você precisa usar um **Personal Access Token (PAT)**.

## 📝 Como criar um Personal Access Token:

1. Acesse: https://github.com/settings/tokens
2. Clique em **"Generate new token"** → **"Generate new token (classic)"**
3. Dê um nome para o token (ex: "Dashboard Token")
4. Selecione as permissões:
   - ✅ **repo** (acesso completo aos repositórios)
5. Clique em **"Generate token"**
6. **COPIE O TOKEN** (você só verá ele uma vez!)

## 🚀 Como fazer o push:

### Opção 1: Usar o token como senha

Quando o Git pedir a senha, use o **token** em vez da senha:

```bash
git push -u origin main
# Username: MariaMoraisRenovaBE
# Password: [COLE SEU TOKEN AQUI]
```

### Opção 2: Configurar o token na URL (temporário)

```bash
git remote set-url origin https://SEU_TOKEN@github.com/MariaMoraisRenovaBE/dashatendimento.git
git push -u origin main
```

### Opção 3: Usar GitHub CLI (recomendado)

```bash
# Instalar GitHub CLI
# Depois:
gh auth login
git push -u origin main
```

---

**Nota de Segurança:** Nunca compartilhe seu token ou o coloque em arquivos públicos!

