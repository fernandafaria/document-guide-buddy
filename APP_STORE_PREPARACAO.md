# 📱 Guia de Preparação para App Store

Este documento contém todos os passos necessários para preparar e publicar o app YO na Apple App Store.

## ✅ Status Atual

### Configurações Concluídas
- [x] App ID corrigido para formato válido iOS: `com.yoapp.mobile`
- [x] Nome do app configurado: `YO`
- [x] Versão do app atualizada: `1.0.0`
- [x] Plataforma iOS adicionada ao projeto
- [x] Permissões iOS configuradas no Info.plist:
  - Localização quando em uso
  - Câmera para fotos de perfil
  - Biblioteca de fotos para upload
- [x] Ícones do app (1024x1024) presentes
- [x] Splash screens configurados
- [x] Configuração de servidor de desenvolvimento removida

## 🔧 Próximos Passos Necessários

### 1. Configuração do Xcode

Para abrir o projeto no Xcode:
```bash
cd ios/App
open App.xcworkspace
```

**No Xcode, você precisa:**

1. **Configurar Team e Signing**
   - Abra o projeto no Xcode
   - Selecione o target "App"
   - Vá para "Signing & Capabilities"
   - Selecione seu Apple Developer Team
   - O Xcode gerará automaticamente o provisioning profile

2. **Verificar Bundle Identifier**
   - Confirme que o Bundle ID é: `com.yoapp.mobile`
   - Se quiser mudar, atualize também no `capacitor.config.ts`

3. **Configurar Versão e Build Number**
   - Marketing Version: 1.0.0
   - Current Project Version: 1 (incrementar para cada build)

### 2. Preparação de Assets

#### Ícone do App
O ícone já está presente, mas verifique:
- Tamanho: 1024x1024 pixels
- Formato: PNG sem transparência
- Localização: `ios/App/App/Assets.xcassets/AppIcon.appiconset/`

#### Splash Screen
Splash screens já configurados em:
- `ios/App/App/Assets.xcassets/Splash.imageset/`

### 3. Configuração de Capacidades no Xcode

Vá em "Signing & Capabilities" e adicione:

- [ ] **Background Modes** (se necessário para notificações)
  - Remote notifications
  
- [ ] **Push Notifications** (se implementado)

- [ ] **Maps** (se usar mapas nativos)
  - Já está usando Google Maps via web

### 4. Configurações de Privacidade

✅ Já configuradas no Info.plist:
- `NSLocationWhenInUseUsageDescription`
- `NSCameraUsageDescription`
- `NSPhotoLibraryUsageDescription`
- `NSPhotoLibraryAddUsageDescription`

Verifique se as descrições estão apropriadas para a revisão da Apple.

### 5. Build de Produção

#### Sincronizar o código web com iOS:
```bash
# Build da aplicação web
npm run build

# Sincronizar com iOS
npx cap sync ios

# Copiar arquivos web para iOS
npx cap copy ios
```

#### Abrir no Xcode:
```bash
npx cap open ios
```

#### No Xcode:
1. Selecione "Any iOS Device (arm64)" como destino
2. Product → Archive
3. Após o archive, clique em "Distribute App"
4. Escolha "App Store Connect"
5. Siga o assistente para upload

### 6. App Store Connect

Acesse [App Store Connect](https://appstoreconnect.apple.com):

1. **Criar o App**
   - Clique em "My Apps" → "+" → "New App"
   - Platform: iOS
   - Name: YO
   - Primary Language: Portuguese (Brazil)
   - Bundle ID: com.yoapp.mobile
   - SKU: Um identificador único (ex: YO-APP-001)

2. **Preencher Informações do App**

   **App Information:**
   - Nome: YO
   - Subtitle: (até 30 caracteres, descrição curta)
   - Privacy Policy URL: (necessário criar)
   - Category: Social Networking (ou similar)
   
   **Pricing and Availability:**
   - Price: Free (ou conforme desejado)
   - Availability: Select territories
   
   **App Privacy:**
   - Preencher o questionário sobre coleta de dados
   - Tipos de dados coletados:
     * Localização (para encontrar pessoas próximas)
     * Fotos (para perfil)
     * Nome e informações de perfil
     * Mensagens (chat)

3. **Screenshots Necessários**
   
   Você precisa de screenshots para:
   - iPhone 6.7" (iPhone 14 Pro Max, 15 Pro Max)
     * 1290 x 2796 pixels
     * Mínimo 3, máximo 10
   
   - iPhone 6.5" (iPhone 11 Pro Max, XS Max)
     * 1242 x 2688 pixels
     * Mínimo 3, máximo 10

   **Dicas para Screenshots:**
   - Capture as principais telas: Login, Map, Discovery, Matches, Chat, Profile
   - Use um simulador iOS no Xcode
   - Capture em Device → Screenshot no Simulator

4. **Texto de Marketing**

   **Description (até 4000 caracteres):**
   ```
   YO é o app que conecta você com pessoas próximas em tempo real!
   
   🎯 Encontre pessoas no mesmo local que você
   🗺️ Descubra lugares interessantes ao seu redor
   💬 Converse com seus matches
   ⭐ Sistema inteligente de compatibilidade
   
   Como funciona:
   1. Faça check-in em um local
   2. Veja quem está por perto
   3. Envie um YO para quem te interessar
   4. Converse quando der match!
   
   Recursos principais:
   • Check-in em tempo real
   • Descoberta de pessoas próximas
   • Sistema de matches
   • Chat privado
   • Perfis personalizáveis
   • Mapa de locais
   • Filtros avançados
   ```

   **Keywords (até 100 caracteres, separados por vírgula):**
   ```
   social,encontros,proximidade,chat,amigos,conhecer,pessoas,local,mapa
   ```

   **Promotional Text (até 170 caracteres):**
   ```
   Conecte-se com pessoas próximas! Faça check-in, encontre matches e converse em tempo real. Baixe YO agora!
   ```

5. **What's New in This Version**
   ```
   Primeira versão do YO!
   • Sistema de check-in inteligente
   • Descubra pessoas próximas
   • Matches em tempo real
   • Chat privado e seguro
   • Perfis personalizáveis
   ```

### 7. Review Information

No App Store Connect, seção "App Review Information":

**Contact Information:**
- First Name: (seu nome)
- Last Name: (seu sobrenome)
- Phone Number: (número válido)
- Email: (email válido)

**Demo Account (para revisão da Apple):**
- Username: (criar um usuário de teste)
- Password: (senha do usuário de teste)
- Sign-in required: Yes

**Notes:**
```
YO é um app de descoberta social baseado em localização.

Para testar completamente:
1. Faça login com a conta de teste
2. Permita acesso à localização
3. Faça check-in em qualquer local
4. O sistema mostrará usuários próximos (podem ser perfis de teste)

O app requer:
- Localização para mostrar pessoas próximas
- Câmera/Fotos para adicionar fotos ao perfil
- Conexão com internet para funcionar

Backend: Supabase (configurado e funcional)
```

### 8. Checklist Antes de Submeter

- [ ] Build de produção testado no dispositivo físico
- [ ] Todas as funcionalidades testadas
- [ ] Ícone e splash screen corretos
- [ ] Permissões funcionando corretamente
- [ ] Login/Signup funcionando
- [ ] Screenshots capturados
- [ ] Descrição e textos revisados
- [ ] Privacy Policy criada e publicada
- [ ] Terms of Service criados e publicados
- [ ] Conta de teste criada e validada
- [ ] Informações de contato preenchidas

### 9. Configurações Backend (Supabase)

Antes de submeter à produção, complete os itens do PRODUCAO_CHECKLIST.md:

**Alta Prioridade:**
- [ ] Habilitar Leaked Password Protection no Supabase
- [ ] Desabilitar auto-confirm email (produção)
- [ ] Configurar SMTP para emails transacionais
- [ ] Adicionar domínio de produção nas Redirect URLs
- [ ] Configurar rate limiting no Supabase

### 10. Após Aprovação

Quando o app for aprovado:

1. **Monitoramento:**
   - Configure analytics (se ainda não tem)
   - Monitore crashes no Xcode Organizer
   - Acompanhe reviews na App Store

2. **Atualizações:**
   - Para cada atualização, incremente o build number
   - Atualize o "What's New" com as mudanças
   - Repita o processo de build e upload

## 🔗 Links Úteis

- [Apple Developer](https://developer.apple.com)
- [App Store Connect](https://appstoreconnect.apple.com)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Capacitor iOS Documentation](https://capacitorjs.com/docs/ios)
- [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs no Xcode (Console)
2. Teste em dispositivo físico, não apenas simulador
3. Consulte a documentação do Capacitor
4. Revise as diretrizes da App Store

## 🎉 Boa Sorte!

O app está bem estruturado e pronto para ser publicado. Siga este guia passo a passo e você terá seu app na App Store em breve!

---

**Última atualização:** 2025-11-11
**Versão do Documento:** 1.0
