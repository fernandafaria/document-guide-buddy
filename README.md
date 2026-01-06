# YO! Mobile App

Aplicativo mobile para iOS e Android do YO! - uma plataforma social baseada em localizacao para conhecer pessoas proximas.

Este projeto usa [Capacitor](https://capacitorjs.com/) para empacotar o app web existente (https://document-guide-buddy.lovable.app) como um aplicativo nativo.

## Pre-requisitos

### Para iOS
- macOS com Xcode 15+ instalado
- Conta de desenvolvedor Apple ($99/ano)
- CocoaPods instalado (`sudo gem install cocoapods`)

### Para Android
- Android Studio instalado
- Conta de desenvolvedor Google Play ($25 unica vez)
- Java JDK 17+

### Geral
- Node.js 18+
- npm ou yarn

## Instalacao

```bash
# Clone o repositorio
git clone <repo-url>
cd yo-app-mobile

# Instale as dependencias
npm install

# Sincronize os projetos nativos
npx cap sync
```

## Desenvolvimento

### iOS

```bash
# Abrir no Xcode
npm run ios
# ou
npx cap open ios
```

No Xcode:
1. Selecione seu dispositivo ou simulador
2. Clique em "Run" (botao play)

### Android

```bash
# Abrir no Android Studio
npm run android
# ou
npx cap open android
```

No Android Studio:
1. Aguarde o Gradle sincronizar
2. Selecione seu dispositivo ou emulador
3. Clique em "Run"

## Configuracao de Icones e Splash Screen

### Gerando Icones

Recomendamos usar o [capacitor-assets](https://github.com/ionic-team/capacitor-assets) para gerar icones automaticamente:

```bash
npm install -g @capacitor/assets

# Crie uma pasta resources com:
# - icon.png (1024x1024)
# - splash.png (2732x2732)

npx capacitor-assets generate
```

### Manualmente

**iOS:** Substitua os arquivos em `ios/App/App/Assets.xcassets/AppIcon.appiconset/`

**Android:** Substitua os arquivos em `android/app/src/main/res/mipmap-*/`

## Deploy para App Store (iOS)

### 1. Configurar o Projeto no Xcode

1. Abra `ios/App/App.xcworkspace` no Xcode
2. Selecione o target "App"
3. Na aba "Signing & Capabilities":
   - Selecione seu Team (conta Apple Developer)
   - O Bundle Identifier ja esta configurado como `app.yo.mobile`
4. Atualize a versao em "General" > "Version" e "Build"

### 2. Criar Archive

1. Selecione "Any iOS Device" como destino
2. Menu: Product > Archive
3. Aguarde o build completar

### 3. Enviar para App Store Connect

1. No Organizer (Window > Organizer), selecione o archive
2. Clique em "Distribute App"
3. Selecione "App Store Connect"
4. Siga os passos para upload

### 4. Configurar no App Store Connect

1. Acesse https://appstoreconnect.apple.com
2. Crie um novo app com Bundle ID `app.yo.mobile`
3. Preencha as informacoes:
   - Nome: YO!
   - Descricao
   - Screenshots (obrigatorio)
   - Categoria: Social Networking
   - Classificacao etaria: 17+ (por ser app de encontros)
4. Selecione o build enviado
5. Envie para revisao

## Deploy para Google Play Store (Android)

### 1. Gerar Keystore (primeira vez)

```bash
keytool -genkey -v -keystore yo-release-key.keystore -alias yo-key -keyalg RSA -keysize 2048 -validity 10000
```

Guarde este arquivo e a senha em local seguro!

### 2. Configurar Signing no Android Studio

1. Abra o projeto Android
2. Menu: Build > Generate Signed Bundle / APK
3. Selecione "Android App Bundle"
4. Selecione seu keystore e preencha as senhas
5. Selecione "release" como build variant
6. Clique em "Create"

### 3. Enviar para Google Play Console

1. Acesse https://play.google.com/console
2. Crie um novo app
3. Preencha as informacoes:
   - Nome: YO!
   - Descricao
   - Screenshots (obrigatorio)
   - Categoria: Social
   - Classificacao etaria
4. Va em "Release" > "Production"
5. Faca upload do arquivo .aab gerado
6. Envie para revisao

## Permissoes do App

O app solicita as seguintes permissoes:

| Permissao | Motivo |
|-----------|--------|
| Localizacao | Check-in em locais e descobrir pessoas proximas |
| Camera | Tirar fotos para o perfil |
| Fotos | Selecionar imagens da galeria |
| Notificacoes | Receber alertas de matches e mensagens |

## Estrutura do Projeto

```
yo-app-mobile/
├── android/          # Projeto Android nativo
├── ios/              # Projeto iOS nativo
├── www/              # Assets web (fallback offline)
├── capacitor.config.json  # Configuracao do Capacitor
└── package.json
```

## Atualizando o App

Quando o app web (Lovable) for atualizado, o app mobile carregara automaticamente a nova versao, pois ele aponta para a URL remota.

Para atualizar as configuracoes nativas:

```bash
npx cap sync
```

## Troubleshooting

### iOS: "No signing certificate"
- Verifique se sua conta Apple Developer esta configurada no Xcode
- Va em Xcode > Preferences > Accounts e adicione sua conta

### Android: "SDK location not found"
- Configure a variavel ANDROID_HOME
- Ou crie um arquivo `local.properties` em `android/` com:
  ```
  sdk.dir=/path/to/Android/sdk
  ```

### App nao carrega
- Verifique sua conexao com a internet
- O app requer conexao para carregar o conteudo

## Suporte

Para duvidas sobre o app, entre em contato atraves do Lovable ou abra uma issue neste repositorio.
