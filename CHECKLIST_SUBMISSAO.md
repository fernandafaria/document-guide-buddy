# Checklist Final - Submissao App Store e Google Play

Use este checklist para garantir que tudo esta pronto antes de submeter o app YO.

---

## Pre-Requisitos

### Contas e Acesso

#### Apple (iOS)
- [ ] Conta Apple Developer ativa ($99/ano) - https://developer.apple.com
- [ ] Acesso ao App Store Connect - https://appstoreconnect.apple.com

#### Google (Android)
- [ ] Conta Google Play Developer ($25 unico) - https://play.google.com/console
- [ ] Aceitar termos e pagar taxa

#### CI/CD
- [ ] Conta Codemagic configurada - https://codemagic.io
- [ ] Repositorio conectado ao Codemagic

---

## Configuracao do Projeto (JA FEITO)

### Arquivos de Configuracao
- [x] `capacitor.config.ts` - App ID: `com.fernandafaria.yoappsocial`
- [x] `package.json` - Versao: 1.0.0
- [x] `codemagic.yaml` - iOS + Android configurados
- [x] `ionic.config.json` - Configurado

### iOS
- [x] Plataforma iOS adicionada (`ios/`)
- [x] Info.plist com permissoes de privacidade
- [x] Bundle ID: `com.fernandafaria.yoappsocial`

### Android
- [x] Plataforma Android adicionada (`android/`)
- [x] AndroidManifest.xml com permissoes
- [x] Package name: `com.fernandafaria.yoappsocial`

---

## Configuracao no Codemagic

### iOS - App Store Connect Integration
1. [ ] Acessar Codemagic > Team settings > Integrations
2. [ ] Adicionar "App Store Connect" integration
3. [ ] Criar API Key no App Store Connect:
   - App Store Connect > Users and Access > Keys
   - Tipo: App Store Connect API
   - Acesso: Admin ou App Manager
4. [ ] Inserir no Codemagic: Issuer ID, Key ID, arquivo .p8

### Android - Keystore (Signing)
1. [ ] Gerar keystore para assinatura:
   ```bash
   keytool -genkey -v -keystore yoapp.keystore \
     -alias yoapp -keyalg RSA -keysize 2048 -validity 10000 \
     -storepass [SUA_SENHA] -keypass [SUA_SENHA]
   ```
2. [ ] Codemagic > Team settings > Code signing identities
3. [ ] Adicionar Android keystore:
   - Reference name: `yoapp_keystore`
   - Upload arquivo .keystore
   - Inserir senhas e alias

### Google Play - Service Account (Opcional para auto-publish)
1. [ ] Google Cloud Console > Create Service Account
2. [ ] Baixar JSON de credenciais
3. [ ] Google Play Console > API Access > Link Service Account
4. [ ] Adicionar credenciais no Codemagic

---

## Build e Teste

### Executar Build no Codemagic
- [ ] Push para o repositorio
- [ ] Acessar Codemagic e iniciar build:
  - `ios-testflight` para iOS
  - `android-release` para Android (APK)
  - `android-playstore` para Android (AAB)
- [ ] Verificar se builds completaram com sucesso

### Teste em Dispositivo
- [ ] Testar fluxo completo:
  - [ ] Login/Signup
  - [ ] Permissoes aceitas (localizacao, camera)
  - [ ] Check-in funciona
  - [ ] Discovery mostra usuarios
  - [ ] Match funciona
  - [ ] Chat funciona
  - [ ] Perfil carrega

---

## Screenshots e Marketing

### Screenshots Obrigatorios

#### iOS (App Store)
**iPhone 6.7" (1290 x 2796)** - Obrigatorio
- [ ] Tela de Welcome/Login
- [ ] Tela de Map
- [ ] Tela de Discovery
- [ ] Tela de Match
- [ ] Tela de Chat
- [ ] Tela de Profile

**iPad 12.9"** - Se suportar iPad

#### Android (Google Play)
**Phone (1080 x 1920 ou maior)**
- [ ] Mesmas 6 telas do iOS
- [ ] Feature Graphic (1024 x 500) - obrigatorio

### Textos de Marketing
- [ ] Nome do App: **YO**
- [ ] Subtitulo/Short description (80 chars): "Encontre pessoas onde voce esta"
- [ ] Descricao completa (4000 chars)
- [ ] Keywords (iOS apenas)
- [ ] What's New / Release notes

---

## URLs Obrigatorias

### Paginas Web Necessarias
- [ ] **Privacy Policy URL** (OBRIGATORIO para ambas as lojas)
- [ ] **Terms of Service URL** (recomendado)
- [ ] **Support URL** (recomendado)

**IMPORTANTE**: As paginas precisam estar acessiveis publicamente antes de submeter!

---

## App Store Connect (iOS)

### Criar App
1. [ ] Login em https://appstoreconnect.apple.com
2. [ ] My Apps > "+" > New App
3. [ ] Preencher:
   - Platform: iOS
   - Name: YO
   - Bundle ID: com.fernandafaria.yoappsocial
   - SKU: YO-APP-001

### App Information
- [ ] Categoria primaria: Social Networking
- [ ] Privacy Policy URL
- [ ] Age Rating questionario

### Pricing and Availability
- [ ] Price: Free
- [ ] Paises/regioes selecionados

### App Privacy
- [ ] Declarar dados coletados:
  - Location (Linked to user)
  - Photos (Not linked)
  - Contact Info (Name, email - Linked)
  - User Content (Messages - Linked)

### Version Information (1.0.0)
- [ ] Upload screenshots
- [ ] Promotional text
- [ ] Description
- [ ] Keywords
- [ ] What's New

### Build Upload
- [ ] Build enviado pelo Codemagic (automatico se configurado)
- [ ] Build selecionado na versao
- [ ] Export Compliance: No encryption

### App Review Information
- [ ] Nome e contato do revisor
- [ ] Demo account (email/senha de teste)
- [ ] Notes para revisor explicando o app

---

## Google Play Console (Android)

### Criar App
1. [ ] Login em https://play.google.com/console
2. [ ] Create app
3. [ ] Preencher:
   - App name: YO
   - Default language: Portuguese (Brazil)
   - App or game: App
   - Free or paid: Free

### Store Listing
- [ ] Short description (80 chars)
- [ ] Full description (4000 chars)
- [ ] Screenshots (minimo 2, maximo 8)
- [ ] Feature graphic (1024 x 500)
- [ ] App icon (512 x 512)

### App Content
- [ ] Privacy policy URL
- [ ] App access: Restricted (precisa login)
- [ ] Ads: No ads
- [ ] Content rating questionnaire
- [ ] Target audience: 18+ (social/dating)
- [ ] Data safety questionnaire

### Release
- [ ] Internal testing track (primeiro)
- [ ] Upload AAB (do Codemagic)
- [ ] Criar release notes
- [ ] Promover para Production quando pronto

---

## Submissao Final

### iOS - Antes de Submeter
- [ ] Todos os campos preenchidos
- [ ] Build selecionado e processado
- [ ] Screenshots em todos os tamanhos
- [ ] URLs funcionando
- [ ] Conta demo testada
- [ ] Clicar em "Submit for Review"

### Android - Antes de Submeter
- [ ] Todos os campos preenchidos
- [ ] AAB uploaded
- [ ] Screenshots e feature graphic
- [ ] Data safety completo
- [ ] Content rating completo
- [ ] Promover para Production

---

## Apos Submissao

### iOS
- [ ] Status: "Waiting for Review" (24-48h geralmente)
- [ ] Se rejeitado: ler motivo e corrigir
- [ ] Se aprovado: Status "Ready for Sale"

### Android
- [ ] Review automatico (algumas horas a alguns dias)
- [ ] Se rejeitado: ler email e corrigir
- [ ] Se aprovado: aparece na Play Store

---

## Comandos Uteis

```bash
# Build local
npm run build

# Sync todas as plataformas
npx cap sync

# iOS
npm run ios:build    # Build + abrir Xcode
npm run ios:sync     # Apenas sync

# Android
npm run android:build    # Build + abrir Android Studio
npm run android:sync     # Apenas sync
```

---

## Workflows do Codemagic

| Workflow | Descricao | Saida |
|----------|-----------|-------|
| `ios-testflight` | iOS para TestFlight | .ipa |
| `android-release` | Android APK | .apk |
| `android-playstore` | Android para Play Store | .aab |

---

**Data de atualizacao:** 2026-01-09
**Versao do app:** 1.0.0
**Bundle ID:** com.fernandafaria.yoappsocial

**Boa sorte com a submissao!**
