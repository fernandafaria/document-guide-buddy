# YO App - Social Location-Based Platform

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/fernandafaria/document-guide-buddy)
[![iOS](https://img.shields.io/badge/platform-iOS-lightgrey.svg)](https://www.apple.com/ios)
[![React](https://img.shields.io/badge/React-18.3.1-61dafb.svg)](https://reactjs.org/)
[![Capacitor](https://img.shields.io/badge/Capacitor-7.4.4-119eff.svg)](https://capacitorjs.com/)

YO é uma plataforma social baseada em localização que permite aos usuários fazer check-in em locais, descobrir pessoas próximas e interagir através de matches e chat em tempo real.

## 📱 Características Principais

- 🎯 **Check-in Inteligente** - Faça check-in em locais e descubra quem está por perto
- 🗺️ **Mapa Interativo** - Visualize locais interessantes ao seu redor
- 💬 **Chat em Tempo Real** - Converse com seus matches
- ⭐ **Sistema de Matches** - Envie "YO" e conecte-se quando houver match mútuo
- 🔒 **Privacidade e Segurança** - RLS habilitado, autenticação segura
- 📸 **Perfis Personalizáveis** - Até 6 fotos, interesses e preferências

## 🚀 Tecnologias

- **Frontend:** React 18 + TypeScript + Vite
- **UI:** shadcn/ui + Tailwind CSS
- **Mobile:** Capacitor 7 (iOS/Android)
- **Backend:** Supabase (Auth, Database, Realtime)
- **Maps:** Google Maps API
- **State:** TanStack Query

## 📦 Instalação e Setup

### Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- Para iOS: macOS + Xcode + CocoaPods

### Instalação

```bash
# Clone o repositório
git clone https://github.com/fernandafaria/document-guide-buddy.git
cd document-guide-buddy

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite .env com suas chaves do Supabase e Google Maps

# Build da aplicação web
npm run build
```

## 🏗️ Desenvolvimento

### Web Development

```bash
# Servidor de desenvolvimento
npm run dev

# Build de produção
npm run build

# Preview do build
npm run preview

# Linting
npm run lint
```

### iOS Development

```bash
# Build completo + abrir no Xcode
npm run ios:build

# Sincronizar código web com iOS
npm run ios:sync

# Abrir projeto no Xcode
npm run ios:open
```

Para mais detalhes sobre desenvolvimento iOS, consulte [IOS_BUILD_GUIDE.md](./IOS_BUILD_GUIDE.md).

## 📱 Preparação para App Store

O projeto está **pronto para submissão à Apple App Store** usando **build na nuvem** (não requer Mac ou Xcode).

### 🌐 Build iOS sem Mac

Este projeto suporta builds iOS na nuvem usando:
- **Ionic Appflow** (Recomendado) - Interface visual, fácil de usar
- **Codemagic** - CI/CD completo, 500 min/mês grátis
- **Bitrise** - Alternativa com free tier generoso

Para detalhes completos, consulte [BUILD_SEM_MAC.md](./BUILD_SEM_MAC.md).

### 📚 Documentação Completa

- **[BUILD_SEM_MAC.md](./BUILD_SEM_MAC.md)** - ⭐ Build iOS na nuvem (sem Mac)
- **[APP_STORE_PREPARACAO.md](./APP_STORE_PREPARACAO.md)** - Guia completo passo a passo
- **[CHECKLIST_SUBMISSAO.md](./CHECKLIST_SUBMISSAO.md)** - Checklist completo de submissão
- **[IOS_BUILD_GUIDE.md](./IOS_BUILD_GUIDE.md)** - Comandos de build local (se tiver Mac)
- **[PRIVACY_TERMS_DEPLOY.md](./PRIVACY_TERMS_DEPLOY.md)** - Deploy de Privacy Policy e Terms

### Status de Preparação

- ✅ App ID válido para iOS: `com.yoapp.mobile`
- ✅ Versão 1.0.0 configurada
- ✅ Plataforma iOS adicionada
- ✅ Permissões iOS configuradas (Location, Camera, Photos)
- ✅ Ícones e splash screens presentes
- ✅ Documentação completa em português
- ✅ Configuração Ionic Appflow pronta
- ✅ Configuração Codemagic pronta (codemagic.yaml)

## 📄 Estrutura do Projeto

```
document-guide-buddy/
├── src/
│   ├── components/       # Componentes React reutilizáveis
│   ├── pages/           # Páginas da aplicação
│   ├── hooks/           # Custom hooks (useAuth, useChat, etc)
│   └── integrations/    # Integrações (Supabase, etc)
├── ios/
│   └── App/             # Projeto iOS nativo (Xcode)
├── supabase/
│   └── functions/       # Edge Functions do Supabase
├── public/              # Assets estáticos
└── docs/                # Documentação

## Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/260e6cc7-058d-4121-a84b-0764e2f6caba
```

## 🔒 Segurança

- RLS (Row Level Security) habilitado em todas as tabelas
- Políticas de acesso implementadas
- Validação de inputs com Zod
- Autenticação JWT via Supabase
- CORS configurado adequadamente

Para detalhes completos de segurança, veja [PRODUCAO_CHECKLIST.md](./PRODUCAO_CHECKLIST.md).

## 🧪 Testes

O projeto inclui documentação de testes:
- [TESTE_FUNCIONALIDADE.md](./TESTE_FUNCIONALIDADE.md) - Testes funcionais
- [TESTE_PERSONAS.md](./TESTE_PERSONAS.md) - Testes com personas

## 📝 Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Inicia servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run build:prod` | Build + sincronização iOS |
| `npm run lint` | Executa ESLint |
| `npm run ios:build` | Build completo + abre Xcode |
| `npm run ios:sync` | Sincroniza código com iOS |
| `npm run ios:copy` | Copia arquivos web para iOS |
| `npm run ios:open` | Abre projeto no Xcode |

## 🔗 Links Úteis

- [Documentação do Capacitor](https://capacitorjs.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [Apple Developer](https://developer.apple.com)
- [App Store Connect](https://appstoreconnect.apple.com)

## 🤝 Contribuindo

Este é um projeto privado. Para mudanças:

1. Crie uma branch: `git checkout -b feature/nova-funcionalidade`
2. Commit suas mudanças: `git commit -m 'Adiciona nova funcionalidade'`
3. Push para a branch: `git push origin feature/nova-funcionalidade`
4. Abra um Pull Request

## 📄 Licença

Copyright © 2025 YO App. Todos os direitos reservados.

## 📞 Suporte

Para questões ou suporte:
- Email: suporte@yoapp.com
- Através das configurações do app

---

**Versão Atual:** 1.0.0  
**Última Atualização:** 2025-11-11  
**Status:** Pronto para App Store 🚀

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/260e6cc7-058d-4121-a84b-0764e2f6caba) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/260e6cc7-058d-4121-a84b-0764e2f6caba) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
