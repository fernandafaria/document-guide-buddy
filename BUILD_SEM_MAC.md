# 🌐 Build iOS na Nuvem sem Mac

Como você não tem acesso a um Mac com Xcode, existem várias alternativas para fazer o build do app iOS na nuvem.

## ✅ Opção Recomendada: Ionic Appflow

**Vantagens:**
- ✅ Feito especificamente para apps Capacitor
- ✅ Interface visual fácil de usar
- ✅ Não precisa de Mac ou Xcode
- ✅ 1 build grátis por mês

**Como Usar:**

1. **Criar conta no Appflow**
   ```bash
   npm install -g @ionic/cli
   ionic login
   ionic link
   ```

2. **Configurar no Dashboard**
   - Acesse: https://dashboard.ionicframework.com
   - Conecte GitHub
   - Configure certificados iOS (wizard automático)

3. **Fazer Build**
   - Clique em "New Build"
   - Aguarde ~15 minutos
   - Download do .ipa

**Preços:**
- **Starter**: GRÁTIS (1 build/mês)
- **Launch**: $49/mês (10 builds/mês)

## 🔄 Alternativas

### Codemagic
- 500 minutos grátis por mês
- Configuração via YAML (incluída: `codemagic.yaml`)
- Site: https://codemagic.io
- **Nota**: O projeto usa Xcode 14.3 (versão LTS estável)
- Para verificar versões disponíveis: https://docs.codemagic.io/specs/versions-macos/

### Bitrise
- 200 builds grátis por mês
- Site: https://bitrise.io

## 💡 Recomendação

**Use Ionic Appflow** - mais fácil e específico para Capacitor.

---

**Última atualização:** 2025-11-11
**Recomendação:** Ionic Appflow para builds sem Mac 🎯
