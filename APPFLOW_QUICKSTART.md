# 🚀 Guia Rápido: Build iOS com Ionic Appflow

Este é o guia mais rápido para fazer build do app YO para iOS usando Ionic Appflow, **SEM precisar de Mac ou Xcode**.

## ⚡ Início Rápido (5 Passos)

### 1. Criar Conta no Appflow

```bash
# Acesse: https://ionic.io/appflow
# Clique em "Start Free Trial"
# Ou "Sign Up" para conta gratuita
```

**O que você ganha:**
- 1 build iOS grátis por mês (plano Starter)
- Interface visual amigável
- Certificados iOS automáticos
- Deploy direto para App Store

---

### 2. Instalar Ionic CLI e Conectar Projeto

```bash
# No seu terminal/computador:

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
5. Selecione o repositório: fernandafaria/document-guide-buddy
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
   - Provisioning profile gerado
4. Done! 🎉
```

**IMPORTANTE:** Você precisa ter Apple Developer account ($99/ano).

---

### 4. Fazer o Build

```
1. No Appflow, vá para "Builds"
2. Clique em "New Build"
3. Preencha:
   ┌─────────────────────────────────┐
   │ Platform: iOS                   │
   │ Build Type: App Store           │
   │ Commit: latest (main branch)    │
   │ Certificate: (auto-selecionado) │
   └─────────────────────────────────┘
4. Clique em "START BUILD"
5. Aguarde ~10-15 minutos ⏱️
```

**O build faz automaticamente:**
- ✅ npm install
- ✅ npm run build
- ✅ npx cap sync ios
- ✅ Xcode build (na nuvem)
- ✅ Gera arquivo .ipa

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
2. Configure App Store Connect API Key:
   - No App Store Connect:
     Users and Access → Keys → App Store Connect API
   - Crie uma chave
   - Download do arquivo .p8
   - Copie Key ID e Issuer ID
3. No Appflow, cole:
   - Issuer ID
   - Key ID
   - Upload do arquivo .p8
4. Save
5. Próximos builds: checkbox "Deploy to App Store"
```

---

## 🎯 Resumo Visual

```
┌─────────────────────────────────────────────────────────┐
│  Você (Seu Computador)                                  │
│  ├─ git push                                            │
│  └─ ionic link                                          │
│         │                                               │
│         ▼                                               │
│  ┌──────────────────────────────────────────┐          │
│  │  Ionic Appflow (Nuvem)                   │          │
│  │  ├─ Detecta commit                       │          │
│  │  ├─ npm install + build                  │          │
│  │  ├─ Capacitor sync                       │          │
│  │  ├─ Xcode build (na nuvem macOS)         │          │
│  │  └─ Gera .ipa                            │          │
│  └──────────────────────────────────────────┘          │
│         │                                               │
│         ▼                                               │
│  ┌──────────────────────────────────────────┐          │
│  │  App Store Connect                       │          │
│  │  └─ App disponível para review           │          │
│  └──────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────┘
```

---

## 💰 Preços do Appflow

| Plano | Preço | Builds/mês | Recomendado Para |
|-------|-------|------------|------------------|
| **Starter** | GRÁTIS | 1 iOS | Teste inicial |
| **Launch** | $49/mês | 10 iOS | Desenvolvimento |
| **Growth** | $149/mês | 25 iOS | Produção |

**DICA:** Comece com Starter (grátis) para fazer o primeiro build e testar!

---

## 🔧 Variáveis de Ambiente

Se seu app usa variáveis de ambiente (como chaves do Supabase):

```
1. No Appflow: Settings → Secrets
2. Adicione cada variável:
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_PUBLISHABLE_KEY
   - Outras necessárias
3. Elas serão injetadas automaticamente no build
```

---

## ⚠️ Pré-Requisitos

Você ainda precisa ter:
- ✅ **Apple Developer Account** ($99/ano) - OBRIGATÓRIO
- ✅ **Acesso ao GitHub** (repositório conectado)
- ✅ **Conta Ionic Appflow** (grátis)

Você NÃO precisa:
- ❌ Mac
- ❌ Xcode instalado
- ❌ CocoaPods
- ❌ Conhecimento de iOS

---

## 🐛 Troubleshooting

### Build falhou?

1. **Verifique logs do build:**
   - Clique no build
   - Aba "Logs"
   - Procure por erros em vermelho

2. **Erros comuns:**
   
   **"npm install failed"**
   ```bash
   # Solução: Verificar package.json
   # Garantir que todas deps estão corretas
   ```
   
   **"Capacitor sync failed"**
   ```bash
   # Solução: Garantir que ios/ folder existe no repo
   # Fazer commit da pasta ios/
   ```
   
   **"Code signing error"**
   ```
   # Solução: Regenerar certificados
   # Settings → Certificates → Regenerate
   ```

3. **Ainda com problemas?**
   - Suporte do Appflow: https://ionic.io/support
   - Documentação: https://ionic.io/docs/appflow

---

## 📱 Testar o App

Depois do build:

1. **Via TestFlight:**
   ```
   1. Upload do .ipa para App Store Connect
   2. Configurar TestFlight
   3. Adicionar testadores
   4. Instalar no iPhone via TestFlight app
   ```

2. **Via Adhoc (dispositivos específicos):**
   ```
   1. Build Type: Ad-Hoc (não App Store)
   2. Registrar UDIDs dos dispositivos
   3. Download .ipa
   4. Instalar via Xcode Devices ou iTunes
   ```

---

## 🎉 Próximo Build

Para builds futuros:

```bash
# Fazer mudanças no código
git add .
git commit -m "Nova funcionalidade"
git push

# No Appflow:
# 1. Vai para Builds
# 2. New Build (ou trigger automático se configurado)
# 3. Aguarda
# 4. Done!
```

---

## 🔗 Links Úteis

- [Appflow Dashboard](https://dashboard.ionicframework.com)
- [Appflow Docs](https://ionic.io/docs/appflow)
- [Package Plans](https://ionic.io/appflow/pricing)
- [Suporte](https://ionic.zendesk.com)

---

## ✅ Checklist Final

Antes do primeiro build:
- [ ] Conta Appflow criada
- [ ] Ionic CLI instalado
- [ ] Projeto conectado (`ionic link`)
- [ ] Repositório GitHub conectado
- [ ] Certificados iOS configurados
- [ ] Apple Developer account ativa
- [ ] Variáveis de ambiente configuradas (se necessário)

**Tudo pronto? Clique em "New Build"! 🚀**

---

**Última atualização:** 2025-11-11  
**Tempo estimado:** 30 minutos (primeira vez)  
**Dificuldade:** ⭐⭐ (Fácil)
