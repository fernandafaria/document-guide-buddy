# 🚀 Comandos Rápidos para Build iOS

Este documento contém os comandos mais comuns para trabalhar com o build iOS do app YO.

## 📦 Instalação Inicial

```bash
# Instalar dependências
npm install

# Build inicial
npm run build

# Adicionar plataforma iOS (já feito)
npx cap add ios
```

## 🔨 Desenvolvimento

### Build e Sincronização

```bash
# Build completo + sincronizar com iOS + abrir Xcode
npm run ios:build

# Apenas build da aplicação web
npm run build

# Sincronizar código web com iOS
npm run ios:sync

# Copiar apenas os arquivos web (sem atualizar plugins)
npm run ios:copy

# Abrir projeto no Xcode
npm run ios:open
```

### Workflow Típico

1. **Fazer mudanças no código**
   ```bash
   # Editar arquivos em src/
   ```

2. **Testar localmente no navegador**
   ```bash
   npm run dev
   ```

3. **Build e sincronizar com iOS**
   ```bash
   npm run build
   npm run ios:sync
   ```

4. **Testar no simulador/dispositivo**
   ```bash
   npm run ios:open
   # No Xcode: Cmd+R para rodar
   ```

## 📱 Build de Produção

### Para App Store

1. **Build de produção**
   ```bash
   npm run build:prod
   ```

2. **Abrir Xcode**
   ```bash
   npx cap open ios
   ```

3. **No Xcode:**
   - Selecione "Any iOS Device (arm64)"
   - Product → Archive
   - Distribute App → App Store Connect

### Versionamento

Sempre que fizer um novo build para App Store:

1. **Atualizar versão no package.json**
   ```json
   "version": "1.0.1"  // ou próxima versão
   ```

2. **No Xcode:**
   - Marketing Version: 1.0.1
   - Current Project Version: 2 (sempre incrementar)

## 🔧 Troubleshooting

### Problema: Mudanças não aparecem no app

```bash
# Limpar e reconstruir
rm -rf dist/
npm run build
npm run ios:sync
```

### Problema: Erro ao sincronizar

```bash
# Limpar cache do Capacitor
npx cap sync ios --force
```

### Problema: Ícone ou splash não atualiza

```bash
# Limpar build do iOS
cd ios/App
rm -rf DerivedData/
cd ../..
npm run ios:sync
```

### Problema: Pods não instalados

```bash
cd ios/App
pod install
cd ../..
```

## 📝 Checklist Pré-Build

Antes de cada build para produção:

- [ ] Código testado localmente (`npm run dev`)
- [ ] Build sem erros (`npm run build`)
- [ ] Versão atualizada em package.json
- [ ] Mudanças no CHANGELOG (se houver)
- [ ] Testes manuais em dispositivo físico
- [ ] Verificar permissões no Info.plist
- [ ] Verificar ícones e splash screens

## 🔍 Logs e Debug

### Ver logs do iOS

```bash
# No Xcode: View → Debug Area → Show Debug Area
# Ou use: Cmd+Shift+Y
```

### Ver logs do Safari (Web Inspector)

1. No dispositivo iOS: Settings → Safari → Advanced → Web Inspector
2. No Mac Safari: Develop → [Seu Dispositivo] → [App]

### Console logs do Capacitor

```bash
# Terminal logs enquanto roda
# Aparecem automaticamente no Xcode console
```

## 🎯 Comandos Úteis do Capacitor

```bash
# Ver todas as plataformas
npx cap ls

# Atualizar Capacitor
npm install @capacitor/cli@latest @capacitor/core@latest @capacitor/ios@latest

# Ver versão do Capacitor
npx cap --version

# Doctor (verificar configuração)
npx cap doctor

# Migrar para nova versão
npx cap migrate
```

## 📚 Estrutura de Diretórios iOS

```
ios/
├── App/
│   ├── App/
│   │   ├── Assets.xcassets/     # Ícones e imagens
│   │   ├── Info.plist           # Configurações e permissões
│   │   ├── capacitor.config.json
│   │   └── public/              # Arquivos web (gerados)
│   ├── App.xcodeproj/
│   ├── App.xcworkspace/         # ← USAR ESTE NO XCODE
│   └── Podfile
└── capacitor-cordova-ios-plugins/
```

## 🌐 URLs de Desenvolvimento

Durante desenvolvimento, você pode testar:

```bash
# Web local
npm run dev
# Acesse: http://localhost:5173

# Preview do build
npm run build
npm run preview
# Acesse: http://localhost:4173
```

## 🔐 Configuração de Ambiente

Certifique-se de ter o arquivo `.env` configurado:

```env
VITE_SUPABASE_URL=sua-url-aqui
VITE_SUPABASE_PUBLISHABLE_KEY=sua-chave-aqui
```

**IMPORTANTE:** Não commitar o arquivo `.env` com chaves reais!

## 💡 Dicas

1. **Sempre use o .xcworkspace**, não o .xcodeproj
2. **Incremente o build number** para cada envio à App Store
3. **Teste em dispositivo físico** antes de submeter
4. **Mantenha o Xcode atualizado** para última versão
5. **Use "Any iOS Device"** ao fazer Archive

---

**Última atualização:** 2025-11-11
