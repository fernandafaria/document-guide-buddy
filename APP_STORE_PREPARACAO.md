# 📱 Guia de Preparação para App Store

Este documento contém todos os passos necessários para preparar e publicar o app YO na Apple App Store.

## ✅ Status Atual

### Configurações Concluídas
- [x] App ID corrigido para formato válido iOS: `com.yoapp.mobile`
- [x] Nome do app configurado: `YO`
- [x] Versão do app atualizada: `1.0.0`
- [x] Plataforma iOS adicionada ao projeto
- [x] Permissões iOS configuradas no Info.plist
- [x] Ícones do app (1024x1024) presentes
- [x] Splash screens configurados

## 🔧 Próximos Passos Necessários

### 1. Build iOS na Nuvem

Recomendamos usar **Ionic Appflow** para builds sem precisar de Mac:

```bash
npm install -g @ionic/cli
ionic login
ionic link
```

📖 Ver guia completo: [APPFLOW_QUICKSTART.md](./APPFLOW_QUICKSTART.md)

### 2. App Store Connect

1. **Criar o App**
   - Acesse: https://appstoreconnect.apple.com
   - My Apps → "+" → "New App"
   - Bundle ID: `com.yoapp.mobile`

2. **Preencher Informações**
   - Nome: YO
   - Categoria: Social Networking
   - Privacy Policy URL: (necessário)
   - Screenshots (mínimo 3)

3. **Upload do Build**
   - Via Appflow (automático) ou
   - Via Xcode → Archive → Upload

### 3. Checklist de Submissão

📋 Usar checklist completo: [CHECKLIST_SUBMISSAO.md](./CHECKLIST_SUBMISSAO.md)

---

**Última atualização:** 2025-11-11
**Versão do Documento:** 1.0
