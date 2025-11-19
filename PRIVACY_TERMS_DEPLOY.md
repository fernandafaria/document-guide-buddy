# 🌐 Publicar Privacy Policy e Terms of Service

A Apple exige que a Privacy Policy esteja acessível publicamente via URL web.

## ✅ Status Atual

O app já possui as páginas:
- ✅ Privacy Policy em `/src/pages/PrivacyPolicy.tsx`
- ✅ Terms of Service em `/src/pages/TermsOfService.tsx`

**Problema:** Essas páginas só funcionam dentro do app, mas a Apple precisa de URLs web públicas.

## 🎯 Soluções

### Opção 1: Deploy do App Web (RECOMENDADO)

**Via Lovable:**
```
Privacy Policy: https://[seu-dominio]/privacy
Terms of Service: https://[seu-dominio]/terms
```

**Vantagens:**
- ✅ Rápido e fácil
- ✅ Páginas já prontas
- ✅ Atualizações automáticas

### Opção 2: GitHub Pages

Criar páginas HTML estáticas e hospedar no GitHub Pages.

### Opção 3: Vercel/Netlify

Deploy rápido da aplicação web.

## 📝 Checklist

- [ ] Escolher uma opção
- [ ] Deploy das páginas
- [ ] Verificar URLs funcionando
- [ ] Adicionar URLs no App Store Connect

## ⚠️ Importante

- A Apple verifica essas URLs durante a review
- As páginas devem estar acessíveis publicamente
- Não use URLs que requerem login

---

**Última atualização:** 2025-11-11
