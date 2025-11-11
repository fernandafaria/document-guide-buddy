# 🌐 Publicar Privacy Policy e Terms of Service

A Apple exige que a Privacy Policy esteja acessível publicamente via URL web. Este guia mostra como fazer isso.

## ✅ Status Atual

O app já possui as páginas:
- ✅ Privacy Policy em `/src/pages/PrivacyPolicy.tsx`
- ✅ Terms of Service em `/src/pages/TermsOfService.tsx`

**Problema:** Essas páginas só funcionam dentro do app mobile, mas a Apple precisa de URLs web públicas.

## 🎯 Soluções Rápidas

### Opção 1: Deploy do App Web (RECOMENDADO)

O app já está configurado para web. Você pode deployá-lo em produção e usar as URLs:

**Via Lovable (já configurado):**
```
Privacy Policy: https://[seu-dominio]/privacy
Terms of Service: https://[seu-dominio]/terms
```

**Passos:**
1. No Lovable, vá para o projeto
2. Clique em "Share" → "Publish"
3. O app será publicado
4. URLs estarão disponíveis publicamente
5. Use essas URLs no App Store Connect

**Vantagens:**
- ✅ Rápido e fácil
- ✅ Sem necessidade de código adicional
- ✅ As páginas já estão prontas e traduzidas
- ✅ Atualizações automáticas quando mudar o código

### Opção 2: GitHub Pages

Crie páginas estáticas HTML com o mesmo conteúdo.

**Passos:**

1. **Criar pasta docs/ no projeto:**
```bash
mkdir docs
```

2. **Criar arquivo docs/privacy.html:**
```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Política de Privacidade - YO</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 40px auto;
            padding: 0 20px;
            color: #333;
        }
        h1 { color: #000; font-size: 32px; margin-bottom: 30px; }
        h2 { color: #000; font-size: 24px; margin-top: 30px; }
        h3 { color: #333; font-size: 18px; margin-top: 20px; }
        ul { padding-left: 30px; }
        li { margin: 10px 0; }
        a { color: #007AFF; text-decoration: none; }
        a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <h1>Política de Privacidade</h1>
    
    <p><strong>Última atualização:</strong> 11 de novembro de 2025</p>
    
    <h2>1. Introdução</h2>
    <p>
        O YO está comprometido em proteger sua privacidade. Esta Política de Privacidade 
        explica como coletamos, usamos, divulgamos e protegemos suas informações quando 
        você usa nosso aplicativo.
    </p>
    
    <h2>2. Informações que Coletamos</h2>
    
    <h3>2.1 Informações Fornecidas por Você</h3>
    <ul>
        <li>Nome, email e número de telefone</li>
        <li>Data de nascimento e gênero</li>
        <li>Fotos de perfil</li>
        <li>Preferências e interesses</li>
        <li>Mensagens e interações com outros usuários</li>
    </ul>
    
    <h3>2.2 Informações Coletadas Automaticamente</h3>
    <ul>
        <li><strong>Localização:</strong> Coletamos sua localização em tempo real quando você faz check-in</li>
        <li><strong>Dados de uso:</strong> Como você interage com o app</li>
        <li><strong>Dispositivo:</strong> Tipo de dispositivo, sistema operacional, identificadores únicos</li>
    </ul>
    
    <h2>3. Como Usamos Suas Informações</h2>
    <ul>
        <li>Fornecer e melhorar nossos serviços</li>
        <li>Conectar você com outros usuários próximos</li>
        <li>Personalizar sua experiência</li>
        <li>Enviar notificações sobre matches e mensagens</li>
        <li>Garantir segurança e prevenir fraudes</li>
        <li>Cumprir obrigações legais</li>
    </ul>
    
    <h2>4. Compartilhamento de Informações</h2>
    <p>Não vendemos suas informações pessoais. Podemos compartilhar informações:</p>
    <ul>
        <li>Com outros usuários quando você faz match</li>
        <li>Com prestadores de serviços (servidores, analytics)</li>
        <li>Quando exigido por lei</li>
        <li>Em caso de fusão ou aquisição da empresa</li>
    </ul>
    
    <h2>5. Seus Direitos</h2>
    <p>Você tem o direito de:</p>
    <ul>
        <li>Acessar suas informações pessoais</li>
        <li>Corrigir informações incorretas</li>
        <li>Excluir sua conta</li>
        <li>Optar por não receber comunicações de marketing</li>
        <li>Revogar permissões de localização a qualquer momento</li>
    </ul>
    
    <h2>6. Segurança</h2>
    <p>
        Implementamos medidas de segurança para proteger suas informações, incluindo 
        criptografia, firewalls e acesso restrito aos dados.
    </p>
    
    <h2>7. Retenção de Dados</h2>
    <p>
        Mantemos suas informações enquanto sua conta estiver ativa ou conforme necessário 
        para fornecer serviços. Você pode solicitar exclusão a qualquer momento.
    </p>
    
    <h2>8. Crianças</h2>
    <p>
        Nosso serviço não é destinado a menores de 18 anos. Não coletamos intencionalmente 
        informações de crianças.
    </p>
    
    <h2>9. Alterações nesta Política</h2>
    <p>
        Podemos atualizar esta política periodicamente. Notificaremos você sobre mudanças 
        significativas através do app ou por email.
    </p>
    
    <h2>10. Contato</h2>
    <p>
        Para questões sobre privacidade, entre em contato:
    </p>
    <ul>
        <li>Email: privacidade@yoapp.com</li>
        <li>Através das configurações do app</li>
    </ul>
    
    <hr style="margin: 40px 0; border: none; border-top: 1px solid #ddd;">
    
    <p style="text-align: center; color: #666; font-size: 14px;">
        © 2025 YO App. Todos os direitos reservados.
    </p>
</body>
</html>
```

3. **Criar arquivo docs/terms.html:**
```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Termos de Serviço - YO</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 40px auto;
            padding: 0 20px;
            color: #333;
        }
        h1 { color: #000; font-size: 32px; margin-bottom: 30px; }
        h2 { color: #000; font-size: 24px; margin-top: 30px; }
        h3 { color: #333; font-size: 18px; margin-top: 20px; }
        ul { padding-left: 30px; }
        li { margin: 10px 0; }
        p { margin: 15px 0; }
    </style>
</head>
<body>
    <h1>Termos de Serviço</h1>
    
    <p><strong>Última atualização:</strong> 11 de novembro de 2025</p>
    
    <h2>1. Aceitação dos Termos</h2>
    <p>
        Ao acessar e usar o aplicativo YO, você concorda em cumprir e estar vinculado aos 
        seguintes termos e condições de uso. Se você não concordar com qualquer parte destes 
        termos, não use nosso aplicativo.
    </p>
    
    <h2>2. Descrição do Serviço</h2>
    <p>
        O YO é uma plataforma social baseada em localização que permite aos usuários fazer 
        check-in em locais, descobrir outros usuários próximos e interagir através de 
        funcionalidades de matching e chat.
    </p>
    
    <h2>3. Elegibilidade</h2>
    <ul>
        <li>Você deve ter pelo menos 18 anos de idade</li>
        <li>Você não pode ter sido banido anteriormente do serviço</li>
        <li>Você deve fornecer informações verdadeiras e precisas</li>
    </ul>
    
    <h2>4. Conta de Usuário</h2>
    <ul>
        <li>Você é responsável por manter a confidencialidade de sua senha</li>
        <li>Você é responsável por todas as atividades em sua conta</li>
        <li>Você não pode compartilhar sua conta com terceiros</li>
        <li>Notifique-nos imediatamente sobre qualquer uso não autorizado</li>
    </ul>
    
    <h2>5. Conduta do Usuário</h2>
    <p>Você concorda em NÃO:</p>
    <ul>
        <li>Assediar, intimidar ou ameaçar outros usuários</li>
        <li>Publicar conteúdo ofensivo, ilegal ou inadequado</li>
        <li>Usar o serviço para fins comerciais não autorizados</li>
        <li>Coletar informações de outros usuários sem consentimento</li>
        <li>Fazer-se passar por outra pessoa</li>
        <li>Interferir no funcionamento do serviço</li>
    </ul>
    
    <h2>6. Conteúdo do Usuário</h2>
    <ul>
        <li>Você mantém os direitos sobre seu conteúdo</li>
        <li>Você nos concede licença para usar, exibir e distribuir seu conteúdo</li>
        <li>Você é responsável pelo conteúdo que publica</li>
        <li>Podemos remover conteúdo que viole estes termos</li>
    </ul>
    
    <h2>7. Privacidade</h2>
    <p>
        O uso de suas informações é regido por nossa 
        <a href="privacy.html">Política de Privacidade</a>, 
        que é incorporada a estes Termos por referência.
    </p>
    
    <h2>8. Rescisão</h2>
    <ul>
        <li>Você pode cancelar sua conta a qualquer momento</li>
        <li>Podemos suspender ou encerrar sua conta por violação destes termos</li>
        <li>Podemos encerrar o serviço a qualquer momento</li>
    </ul>
    
    <h2>9. Isenção de Garantias</h2>
    <p>
        O serviço é fornecido "como está" sem garantias de qualquer tipo. Não garantimos 
        que o serviço será ininterrupto, seguro ou livre de erros.
    </p>
    
    <h2>10. Limitação de Responsabilidade</h2>
    <p>
        Não seremos responsáveis por danos indiretos, incidentais, especiais ou consequentes 
        resultantes do uso ou incapacidade de usar o serviço.
    </p>
    
    <h2>11. Alterações nos Termos</h2>
    <p>
        Podemos modificar estes termos a qualquer momento. Continuando a usar o serviço 
        após mudanças, você aceita os novos termos.
    </p>
    
    <h2>12. Lei Aplicável</h2>
    <p>
        Estes termos são regidos pelas leis do Brasil. Quaisquer disputas serão resolvidas 
        nos tribunais brasileiros.
    </p>
    
    <h2>13. Contato</h2>
    <p>Para questões sobre estes termos:</p>
    <ul>
        <li>Email: suporte@yoapp.com</li>
        <li>Através das configurações do app</li>
    </ul>
    
    <hr style="margin: 40px 0; border: none; border-top: 1px solid #ddd;">
    
    <p style="text-align: center; color: #666; font-size: 14px;">
        © 2025 YO App. Todos os direitos reservados.
    </p>
</body>
</html>
```

4. **Habilitar GitHub Pages:**
```bash
# 1. Commit os arquivos
git add docs/
git commit -m "Add privacy and terms static pages"
git push

# 2. No GitHub:
# - Vá para Settings → Pages
# - Source: Deploy from a branch
# - Branch: main → /docs
# - Save
```

5. **URLs Resultantes:**
```
https://[seu-usuario].github.io/[repo-name]/privacy.html
https://[seu-usuario].github.io/[repo-name]/terms.html
```

**Vantagens:**
- ✅ Gratuito
- ✅ Sempre disponível
- ✅ Fácil de atualizar

**Desvantagens:**
- ⚠️ URLs longas
- ⚠️ Precisa manter HTML sincronizado com app

### Opção 3: Vercel/Netlify (Deploy Rápido)

**Via Vercel:**
```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Deploy
vercel

# 3. Seguir prompts
# 4. URLs: https://seu-projeto.vercel.app/privacy
```

**Via Netlify:**
```bash
# 1. Build do projeto
npm run build

# 2. Instalar Netlify CLI
npm i -g netlify-cli

# 3. Deploy
netlify deploy --prod --dir=dist

# 4. URLs: https://seu-projeto.netlify.app/privacy
```

**Vantagens:**
- ✅ Deployment automático
- ✅ URLs profissionais
- ✅ Fácil de atualizar
- ✅ HTTPS incluído

## 📝 Checklist

Escolha uma opção e complete:

### Se usar Lovable (Opção 1):
- [ ] Deploy do projeto no Lovable
- [ ] Testar URL pública: `https://[seu-dominio]/privacy`
- [ ] Testar URL pública: `https://[seu-dominio]/terms`
- [ ] Copiar URLs para usar no App Store Connect

### Se usar GitHub Pages (Opção 2):
- [ ] Criar pasta `docs/`
- [ ] Criar `docs/privacy.html`
- [ ] Criar `docs/terms.html`
- [ ] Commit e push
- [ ] Habilitar GitHub Pages
- [ ] Verificar URLs funcionando
- [ ] Copiar URLs para usar no App Store Connect

### Se usar Vercel/Netlify (Opção 3):
- [ ] Deploy do projeto
- [ ] Verificar `/privacy` funcionando
- [ ] Verificar `/terms` funcionando
- [ ] Copiar URLs para usar no App Store Connect

## 🎯 Próximo Passo

Após publicar as páginas:

1. **Testar as URLs** em um navegador anônimo
2. **Adicionar no App Store Connect:**
   - App Information → Privacy Policy URL
   - App Information → Terms of Service URL (opcional)
3. **Guardar as URLs** para referência futura

## ⚠️ Importante

- **A Apple verifica essas URLs** durante a review
- As páginas **devem estar acessíveis publicamente**
- **Não use** URLs que requerem login
- **Mantenha** as páginas atualizadas

## 💡 Recomendação

**Use a Opção 1 (Lovable)** se o projeto já está lá configurado. É a mais rápida e mantém tudo sincronizado automaticamente.

---

**Última atualização:** 2025-11-11
