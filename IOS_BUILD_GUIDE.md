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

# Copiar apenas os arquivos web
npm run ios:copy

# Abrir projeto no Xcode
npm run ios:open
```

## 📱 Build de Produção

### Para App Store (com Mac)

1. **Build de produção**
   ```bash
   npm run build:prod
   ```

2. **Abrir Xcode**
   ```bash
   npx cap open ios
   ```

3. **No Xcode:**
   - Product → Archive
   - Distribute App → App Store Connect

### Para App Store (sem Mac)

Use Ionic Appflow - ver [BUILD_SEM_MAC.md](./BUILD_SEM_MAC.md)

---

**Última atualização:** 2025-11-11
