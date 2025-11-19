# 🚀 Guia Rápido: Build iOS com Ionic Appflow

Este é o guia mais rápido para fazer build do app YO para iOS usando Ionic Appflow, **SEM precisar de Mac ou Xcode**.

## ⚡ Início Rápido (5 Passos)

### 1. Criar Conta no Appflow

```bash
# Acesse: https://ionic.io/appflow
# Clique em "Start Free Trial" ou "Sign Up"
```

**O que você ganha:**
- 1 build iOS grátis por mês (plano Starter)
- Interface visual amigável
- Certificados iOS automáticos
- Deploy direto para App Store

---

### 2. Instalar Ionic CLI e Conectar Projeto

```bash
# No seu terminal:

# Instalar Ionic CLI globalmente
npm install -g @ionic/cli

# Navegar até a pasta do projeto
cd document-guide-buddy

# Fazer login no Ionic
ionic login
# Digite seu email e senha do Appflow

# Conectar este projeto ao Appflow
ionic link
# Escolha: Create a new app
# Nome: YO
# Confirme
```

**Resultado:** Projeto agora conectado ao Appflow!

---

### 3. Configurar no Dashboard do Appflow

Acesse: https://dashboard.ionicframework.com

#### A. Conectar GitHub
```
1. No Appflow, vá para seu app "YO"
2. Settings → Git
3. Clique em "Connect to GitHub"
4. Autorize o Ionic
5. Selecione o repositório
6. Branch padrão: main
7. Save
```

#### B. Configurar Certificados iOS (AUTOMÁTICO)
```
1. Settings → Certificates → iOS
2. Clique em "Generate Signing Certificate"
3. Siga o wizard:
   - Login com Apple Developer account
   - Appflow cria certificados automaticamente
4. Done! 🎉
```

**IMPORTANTE:** Você precisa ter Apple Developer account ($99/ano).

---

### 4. Fazer o Build

```
1. No Appflow, vá para "Builds"
2. Clique em "New Build"
3. Preencha:
   - Platform: iOS
   - Build Type: App Store
   - Commit: latest (main branch)
4. Clique em "START BUILD"
5. Aguarde ~10-15 minutos ⏱️
```

---

### 5. Download ou Deploy

Quando o build completar:

**Opção A: Download do IPA**
```
1. Build completo → Download icon
2. Baixe o arquivo .ipa
3. Upload manual no App Store Connect
```

**Opção B: Deploy Automático** (recomendado)
```
1. Settings → Deploy → App Store Connect
2. Configure App Store Connect API Key
3. Próximos builds: checkbox "Deploy to App Store"
```

---

## 💰 Preços do Appflow

| Plano | Preço | Builds/mês |
|-------|-------|------------|
| **Starter** | GRÁTIS | 1 iOS |
| **Launch** | $49/mês | 10 iOS |
| **Growth** | $149/mês | 25 iOS |

**DICA:** Comece com Starter (grátis) para fazer o primeiro build e testar!

---

## ⚠️ Pré-Requisitos

Você precisa ter:
- ✅ **Apple Developer Account** ($99/ano) - OBRIGATÓRIO
- ✅ **Acesso ao GitHub**
- ✅ **Conta Ionic Appflow** (grátis)

Você NÃO precisa:
- ❌ Mac
- ❌ Xcode instalado
- ❌ CocoaPods
- ❌ Conhecimento de iOS

---

## 🎉 Próximo Build

Para builds futuros:

```bash
# Fazer mudanças no código
git add .
git commit -m "Nova funcionalidade"
git push

# No Appflow: New Build ou trigger automático
```

---

**Última atualização:** 2025-11-11  
**Tempo estimado:** 30 minutos (primeira vez)  
**Dificuldade:** ⭐⭐ (Fácil)
