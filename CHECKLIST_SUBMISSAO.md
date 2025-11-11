# ✅ Checklist Final - Submissão App Store

Use este checklist para garantir que tudo está pronto antes de submeter o app YO à Apple App Store.

## 📋 Pré-Requisitos

### Contas e Acesso
- [ ] Conta Apple Developer ativa ($99/ano)
- [ ] Acesso ao App Store Connect
- [ ] Mac com macOS atualizado
- [ ] Xcode instalado (última versão estável)
- [ ] CocoaPods instalado (`sudo gem install cocoapods`)

### Configuração Local
- [ ] Repositório clonado localmente
- [ ] Dependências instaladas (`npm install`)
- [ ] Build funcionando (`npm run build`)
- [ ] iOS project gerado (`ios/` folder existe)

## 🔧 Configuração do Projeto

### Arquivos de Configuração
- [x] `capacitor.config.ts` - App ID válido: `com.yoapp.mobile`
- [x] `package.json` - Versão: 1.0.0
- [x] `ios/App/App/Info.plist` - Permissões configuradas
- [x] `.gitignore` - Arquivos iOS excluídos

### Permissões iOS (Info.plist)
- [x] `NSLocationWhenInUseUsageDescription` - "YO precisa da sua localização..."
- [x] `NSCameraUsageDescription` - "YO precisa acessar sua câmera..."
- [x] `NSPhotoLibraryUsageDescription` - "YO precisa acessar suas fotos..."
- [x] `NSPhotoLibraryAddUsageDescription` - "YO precisa salvar fotos..."

### Assets
- [x] Ícone do app (1024x1024) - Presente em `ios/App/App/Assets.xcassets/AppIcon.appiconset/`
- [x] Splash screens - Presentes em `ios/App/App/Assets.xcassets/Splash.imageset/`

## 🏗️ Build e Teste

### Build Local
- [ ] Executar: `npm run build:prod`
- [ ] Verificar pasta `dist/` gerada sem erros
- [ ] Abrir Xcode: `npm run ios:open`

### Configuração no Xcode
- [ ] Abrir `ios/App/App.xcworkspace` (NÃO .xcodeproj)
- [ ] Selecionar target "App"
- [ ] Em "Signing & Capabilities":
  - [ ] Selecionar seu Team (Apple Developer)
  - [ ] Verificar Bundle ID: `com.yoapp.mobile`
  - [ ] Provisioning Profile gerado automaticamente
- [ ] Em "General":
  - [ ] Display Name: YO
  - [ ] Version: 1.0.0
  - [ ] Build: 1

### Teste em Dispositivo
- [ ] Conectar iPhone físico via USB
- [ ] Confiar no computador no iPhone
- [ ] Selecionar iPhone como target no Xcode
- [ ] Clicar em "Build and Run" (⌘+R)
- [ ] App abre sem crashes
- [ ] Testar fluxo completo:
  - [ ] Login/Signup
  - [ ] Permissões de localização aceitas
  - [ ] Permissões de câmera/fotos aceitas
  - [ ] Check-in funciona
  - [ ] Discovery mostra usuários
  - [ ] Match funciona
  - [ ] Chat funciona
  - [ ] Perfil carrega

## 📸 Screenshots e Marketing

### Screenshots Obrigatórios
Capturar screenshots em simulador iPhone:

**iPhone 6.7" (iPhone 14/15 Pro Max)** - 1290 x 2796
- [ ] Tela de Welcome/Login
- [ ] Tela de Map com locais
- [ ] Tela de Discovery com usuários
- [ ] Tela de Match (celebração)
- [ ] Tela de Chat
- [ ] Tela de Profile

**iPhone 6.5" (iPhone 11 Pro Max, XS Max)** - 1242 x 2688
- [ ] Mesmas 6 telas acima

### Como Capturar Screenshots
```bash
# 1. Abrir simulador no Xcode
# 2. Escolher iPhone 15 Pro Max ou 11 Pro Max
# 3. Rodar o app (⌘+R)
# 4. Navegar para cada tela
# 5. Capturar: File → New Screen Shot (⌘+S)
# 6. Screenshots salvos na Desktop
```

### Textos de Marketing Preparados
- [ ] Nome do App: **YO**
- [ ] Subtítulo (30 chars): Exemplo: "Conecte-se com quem está perto"
- [ ] Descrição completa (ver APP_STORE_PREPARACAO.md)
- [ ] Keywords: "social,encontros,proximidade,chat,amigos"
- [ ] Promotional Text (170 chars)
- [ ] What's New text

## 🌐 Conteúdo Web Necessário

### URLs Obrigatórias
- [ ] **Privacy Policy URL**
  - Já existe: `/privacy` na app
  - Precisa estar acessível via web pública
  - Opção 1: Hospedar em `yoapp.com/privacy`
  - Opção 2: GitHub Pages
  - Opção 3: Plataforma atual (Lovable)
  
- [ ] **Terms of Service URL** (opcional mas recomendado)
  - Já existe: `/terms` na app
  - Precisa estar acessível via web pública
  
- [ ] **Support URL** (opcional)
  - Email: suporte@yoapp.com
  - Ou página web de suporte

### Ação Necessária
⚠️ **IMPORTANTE**: As páginas de Privacy e Terms precisam estar acessíveis publicamente via URL web antes de submeter à App Store. A Apple verifica essas URLs.

**Opções:**
1. Deploy do app web em produção (já disponível via Lovable)
2. Criar páginas estáticas em GitHub Pages
3. Usar serviço de hospedagem (Vercel, Netlify, etc)

## 🔒 Configuração Backend (Supabase)

### Segurança - Alta Prioridade
- [ ] Desabilitar "auto-confirm email" no Supabase Auth
- [ ] Configurar SMTP para emails transacionais
- [ ] Habilitar "Leaked Password Protection"
- [ ] Configurar rate limiting
- [ ] Adicionar domínio de produção nas Redirect URLs

### Verificar RLS (Row Level Security)
- [ ] Todas as tabelas têm RLS habilitado
- [ ] Políticas RLS testadas
- [ ] Sem exposição de dados sensíveis

## 📦 App Store Connect

### Criar App
- [ ] Login em [App Store Connect](https://appstoreconnect.apple.com)
- [ ] My Apps → "+" → New App
- [ ] Preencher:
  - Platform: iOS
  - Name: YO
  - Primary Language: Portuguese (Brazil)
  - Bundle ID: com.yoapp.mobile
  - SKU: YO-APP-001 (ou único)

### App Information
- [ ] Categoria Principal: Social Networking
- [ ] Categoria Secundária: (opcional)
- [ ] Privacy Policy URL: (URL pública)
- [ ] Terms of Service URL: (URL pública, opcional)

### Pricing and Availability
- [ ] Price: Free
- [ ] Availability: Countries/regions selecionados
- [ ] Disponibilidade futura: (opcional)

### App Privacy
- [ ] Completar questionário de privacidade
- [ ] Declarar tipos de dados coletados:
  - [x] Location (para matches próximos)
  - [x] Photos (para perfil)
  - [x] Name and Profile Info
  - [x] Messages (chat)
  - [x] User ID
- [ ] Indicar como os dados são usados
- [ ] Confirmar compartilhamento de dados com terceiros (se aplicável)

### Version Information (1.0.0)
- [ ] Upload dos screenshots (6.7" e 6.5")
- [ ] Descrição em Português
- [ ] Keywords
- [ ] Support URL
- [ ] Marketing URL (opcional)
- [ ] What's New text

### Build Upload
- [ ] Preparar Archive no Xcode:
  1. [ ] Selecionar "Any iOS Device (arm64)"
  2. [ ] Product → Clean Build Folder (⇧⌘K)
  3. [ ] Product → Archive (⌃⌘A)
  4. [ ] Aguardar archive completar (5-10 min)
  5. [ ] Window → Organizer → Archives
  6. [ ] Selecionar o archive
  7. [ ] "Distribute App"
  8. [ ] Escolher "App Store Connect"
  9. [ ] "Upload"
  10. [ ] Aguardar validação e upload (10-20 min)

- [ ] Aguardar processamento no App Store Connect (30-60 min)
- [ ] Selecionar o build na versão do app
- [ ] Responder sobre Export Compliance (geralmente "No" para apps sem criptografia)

### App Review Information
- [ ] First Name: (seu nome)
- [ ] Last Name: (seu sobrenome)
- [ ] Phone: (número de contato válido)
- [ ] Email: (email de contato)
- [ ] Demo Account:
  - Username: (criar usuário de teste funcional)
  - Password: (senha do teste)
  - [ ] Conta de teste criada e validada
- [ ] Notes: (instruções claras para o revisor)
- [ ] Attachment: (opcional - vídeo ou documento)

## 🚀 Submissão Final

### Antes de Submeter
- [ ] Todos os campos preenchidos no App Store Connect
- [ ] Build selecionado e processado
- [ ] Screenshots verificados
- [ ] URLs de Privacy/Terms funcionando
- [ ] Conta demo testada e funcionando
- [ ] Informações de review completas

### Submeter para Review
- [ ] Clicar em "Add for Review" ou "Submit for Review"
- [ ] Confirmar informações
- [ ] Aceitar termos da Apple
- [ ] **SUBMIT!** 🎉

### Após Submissão
- [ ] Confirmar email da Apple recebido
- [ ] Status muda para "Waiting for Review"
- [ ] Monitorar emails da Apple (24-72h geralmente)

## 📊 Monitoramento Pós-Submissão

### Se Aprovado ✅
- [ ] Status muda para "Ready for Sale"
- [ ] App disponível na App Store (até 24h)
- [ ] Testar download da App Store
- [ ] Compartilhar link do app
- [ ] Monitorar reviews e ratings
- [ ] Preparar resposta para reviews

### Se Rejeitado ❌
- [ ] Ler cuidadosamente o motivo da rejeição
- [ ] Corrigir os problemas apontados
- [ ] Fazer novo build se necessário
- [ ] Responder no Resolution Center (se aplicável)
- [ ] Submeter novamente

## 🔄 Próximas Atualizações

Para futuras versões:
- [ ] Incrementar versão no package.json (1.0.1, 1.1.0, etc)
- [ ] Incrementar Build Number no Xcode
- [ ] Atualizar "What's New" com mudanças
- [ ] Fazer novo Archive e Upload
- [ ] Submeter para review

## 📚 Documentos de Referência

- [x] `APP_STORE_PREPARACAO.md` - Guia completo detalhado
- [x] `IOS_BUILD_GUIDE.md` - Comandos rápidos de build
- [x] `PRODUCAO_CHECKLIST.md` - Checklist de segurança e produção

## 💡 Dicas Finais

1. **Tempo de Review**: Geralmente 24-72 horas, mas pode variar
2. **Rejeições Comuns**:
   - URLs de privacy não funcionando
   - Conta demo não funciona
   - Crashes na review
   - Falta de informações claras
   - Violação de guidelines
3. **Primeira Submissão**: Seja paciente, pode ter correções
4. **Comunicação**: Responda rápido a qualquer pergunta da Apple

## ✅ Status Final

Marque quando TUDO estiver completo:
- [ ] **App submetido para review na App Store** 🎉

---

**Data de criação do checklist:** 2025-11-11  
**Versão do app:** 1.0.0  
**Build:** 1

**Boa sorte com a submissão! 🚀**
