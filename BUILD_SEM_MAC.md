# 🌐 Build iOS na Nuvem sem Mac (Alternativas ao Xcode)

Como você não tem acesso a um Mac com Xcode, existem várias alternativas para fazer o build do app iOS na nuvem.

## ✅ Nova Abordagem Recomendada

### Opção 1: Ionic Appflow (RECOMENDADO para Capacitor)

**Vantagens:**
- ✅ Feito especificamente para apps Capacitor
- ✅ Interface visual fácil de usar
- ✅ Builds iOS e Android na nuvem
- ✅ Integração com Git
- ✅ Deploy automático para App Store
- ✅ Não precisa de Mac ou Xcode

**Como Usar:**

1. **Criar conta no Appflow**
   - Acesse: https://ionic.io/appflow
   - Crie uma conta (tem plano gratuito para teste)

2. **Conectar o Repositório**
   ```bash
   # Instalar Ionic CLI
   npm install -g @ionic/cli
   
   # Login no Ionic
   ionic login
   
   # Conectar o app ao Appflow
   ionic link
   ```

3. **Configurar Build iOS**
   - No dashboard do Appflow, vá para "Builds"
   - Clique em "New Build"
   - Escolha "iOS" como plataforma
   - Configure certificados iOS (explicado abaixo)
   - Clique em "Build"

4. **Certificados iOS**
   
   Você precisará apenas:
   - **Apple Developer Account** ($99/ano)
   - **App Store Connect** acesso
   
   O Appflow guia você na criação de:
   - Certificado de distribuição
   - Provisioning profile
   
   **Processo:**
   ```
   1. No Appflow: Settings → Certificates
   2. Clique em "Add Certificate"
   3. Siga o assistente automático
   4. Appflow cria os certificados via Apple Developer Portal
   ```

**Preços:**
- **Starter Plan**: Gratuito (1 build por mês)
- **Launch Plan**: $49/mês (10 builds/mês)
- **Growth Plan**: $149/mês (25 builds/mês)

---

### Opção 2: Codemagic (Build CI/CD)

**Vantagens:**
- ✅ Suporta Capacitor nativamente
- ✅ 500 minutos grátis por mês
- ✅ Builds iOS e Android
- ✅ Integração com GitHub
- ✅ Configuração via arquivo YAML

**Como Usar:**

1. **Criar conta no Codemagic**
   - Acesse: https://codemagic.io
   - Conecte com GitHub

2. **Adicionar o Projeto**
   - "Add application"
   - Selecione o repositório
   - Escolha "Capacitor App"

3. **Configurar iOS Build**
   
   Criar arquivo `codemagic.yaml` na raiz:
   ```yaml
   workflows:
     ios-workflow:
       name: iOS Build
       environment:
         groups:
           - app_store_credentials
         node: 18
         xcode: 15.0
       scripts:
         - name: Install dependencies
           script: npm install
         - name: Build web
           script: npm run build
         - name: Update Capacitor
           script: npx cap sync ios
         - name: Build iOS
           script: |
             xcode-project build-ipa \
               --workspace ios/App/App.xcworkspace \
               --scheme App
       artifacts:
         - build/ios/ipa/*.ipa
       publishing:
         app_store_connect:
           api_key: $APP_STORE_CONNECT_KEY_ID
           key_id: $APP_STORE_CONNECT_ISSUER_ID
           certificate: $CERTIFICATE
   ```

4. **Adicionar Certificados**
   - No Codemagic: Application → Settings → Code signing
   - Upload certificados iOS ou use automatic signing

**Preços:**
- **Free**: 500 minutos/mês
- **Professional**: $95/mês (unlimited builds)

---

### Opção 3: Bitrise

**Vantagens:**
- ✅ Free tier generoso
- ✅ Suporta Capacitor
- ✅ Builds iOS e Android

**Como Usar:**

1. Acesse: https://bitrise.io
2. Conecte repositório GitHub
3. Selecione "Other" como tipo de projeto
4. Configure workflow iOS com steps:
   - Git Clone
   - npm install
   - npm run build
   - Capacitor sync
   - Xcode build

**Preços:**
- **Hobby**: Grátis (200 builds/mês)
- **Developer**: $40/mês

---

### Opção 4: Capgo (Alternativa Simples)

**Vantagens:**
- ✅ Específico para Capacitor
- ✅ Simples de configurar
- ✅ Live updates OTA

**Como Usar:**

```bash
# Instalar CLI
npm install -g @capgo/cli

# Login
npx @capgo/cli login

# Configurar
npx @capgo/cli init

# Build e deploy
npx @capgo/cli build ios
```

Site: https://capgo.app

---

## 📋 Comparação Rápida

| Serviço | Free Tier | Preço | Facilidade | Recomendado Para |
|---------|-----------|-------|------------|------------------|
| **Ionic Appflow** | 1 build/mês | $49/mês | ⭐⭐⭐⭐⭐ | Apps Capacitor |
| **Codemagic** | 500 min/mês | $95/mês | ⭐⭐⭐⭐ | CI/CD completo |
| **Bitrise** | 200 builds/mês | $40/mês | ⭐⭐⭐ | Times maiores |
| **Capgo** | Trial | $15/mês | ⭐⭐⭐⭐ | Deploy contínuo |

---

## 🎯 Recomendação

**Use Ionic Appflow** porque:
1. ✅ Feito especificamente para Capacitor
2. ✅ Interface mais simples
3. ✅ Gerenciamento de certificados automático
4. ✅ Deploy direto para App Store
5. ✅ Você pode começar com plano grátis

---

## 📝 Passo a Passo Completo com Appflow

### 1. Preparar o Projeto

```bash
# Instalar Ionic CLI
npm install -g @ionic/cli

# Na pasta do projeto
cd document-guide-buddy

# Login no Ionic
ionic login

# Conectar ao Appflow
ionic link
```

### 2. No Dashboard Appflow

1. **Conectar Repositório**
   - Vá para https://dashboard.ionicframework.com
   - Apps → New App
   - Conecte seu repositório GitHub

2. **Configurar Git**
   - Settings → Git
   - Escolha a branch principal (main/master)

3. **Adicionar Certificados iOS**
   - Settings → Certificates → iOS
   - "Generate Signing Certificate"
   - Siga o wizard para conectar com Apple Developer

### 3. Fazer o Build

1. **Trigger Build**
   - Builds → New Build
   - Target Platform: iOS
   - Build Type: App Store (ou Ad-Hoc para teste)
   - Commit: latest
   - START BUILD

2. **Aguardar**
   - Build leva ~10-15 minutos
   - Você receberá email quando completar

3. **Download IPA**
   - Após build completo
   - Download do arquivo .ipa
   - Ou deploy automático para App Store Connect

### 4. Configurações Adicionais no Projeto

Criar arquivo `ionic.config.json` na raiz:

```json
{
  "name": "YO",
  "integrations": {
    "capacitor": {}
  },
  "type": "custom"
}
```

### 5. Variáveis de Ambiente no Appflow

Se seu app usa variáveis de ambiente:

1. Settings → Secrets
2. Adicione:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - Outras necessárias

---

## 🔐 Obtendo Certificados iOS sem Mac

### Via Apple Developer Portal

1. **Login em Apple Developer**
   - https://developer.apple.com/account

2. **Criar App ID**
   - Certificates, IDs & Profiles → Identifiers
   - App IDs → "+"
   - Bundle ID: `com.yoapp.mobile`

3. **Certificado de Distribuição**
   - O Appflow pode criar automaticamente
   - Ou criar manualmente no portal

4. **Provisioning Profile**
   - Também criado automaticamente pelo Appflow
   - Liga o certificado ao App ID

**DICA:** O Appflow tem um wizard que faz tudo isso automaticamente!

---

## ⚠️ Importante

### Você Ainda Precisa:
- ✅ **Apple Developer Account** ($99/ano) - obrigatório
- ✅ **App Store Connect** acesso - para publicar
- ✅ **Conta Appflow** (ou alternativa escolhida)

### Você NÃO Precisa:
- ❌ Mac
- ❌ Xcode
- ❌ Conhecimento de iOS development

---

## 🚀 Próximos Passos

1. **Escolher serviço** (Recomendo Appflow)
2. **Criar conta** no serviço escolhido
3. **Conectar repositório**
4. **Configurar certificados iOS**
5. **Fazer primeiro build**
6. **Testar IPA** (via TestFlight)
7. **Submeter à App Store**

---

## 💡 Dica Extra: TestFlight

Após o build:
1. Upload para App Store Connect
2. Configurar TestFlight
3. Adicionar testadores internos
4. Testar o app em dispositivos iOS reais
5. Só depois submeter para review

---

## 📚 Documentação

- [Ionic Appflow](https://ionic.io/docs/appflow)
- [Codemagic Capacitor](https://docs.codemagic.io/yaml-quick-start/building-a-capacitor-app/)
- [Bitrise Capacitor](https://devcenter.bitrise.io/en/getting-started/getting-started-with-capacitor-apps.html)

---

**Última atualização:** 2025-11-11  
**Recomendação:** Ionic Appflow para builds sem Mac 🎯
