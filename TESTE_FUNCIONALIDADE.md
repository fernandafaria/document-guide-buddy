# Plano de Teste - Três Personas

## 📋 Personas Fictícias

### Persona 1: Ana Silva
- **Email**: ana.silva@testeapp.com
- **Senha**: Teste123!
- **Nome**: Ana Silva
- **Idade**: 25 anos
- **Gênero**: Feminino
- **Profissão**: Designer
- **Educação**: Superior Completo
- **Cidade**: Rio de Janeiro, RJ
- **Intenções**: Amizade, Relacionamento
- **Estilos Musicais**: Pop, Indie, MPB
- **Sobre**: Adoro arte, café e boas conversas. Sempre em busca de novas experiências!
- **Foto**: https://images.unsplash.com/photo-1494790108377-be9c29b29330

### Persona 2: Bruno Costa
- **Email**: bruno.costa@testeapp.com
- **Senha**: Teste123!
- **Nome**: Bruno Costa
- **Idade**: 28 anos
- **Gênero**: Masculino
- **Profissão**: Desenvolvedor
- **Educação**: Superior Completo
- **Cidade**: Rio de Janeiro, RJ
- **Intenções**: Amizade, Networking
- **Estilos Musicais**: Rock, Eletrônica, Jazz
- **Sobre**: Dev apaixonado por tecnologia e música. Sempre explorando novos lugares pela cidade.
- **Foto**: https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d

### Persona 3: Carla Mendes
- **Email**: carla.mendes@testeapp.com
- **Senha**: Teste123!
- **Nome**: Carla Mendes
- **Idade**: 30 anos
- **Gênero**: Feminino
- **Profissão**: Fotógrafa
- **Educação**: Superior Completo
- **Cidade**: Rio de Janeiro, RJ
- **Intenções**: Relacionamento, Networking
- **Estilos Musicais**: MPB, Samba, Bossa Nova
- **Sobre**: Fotógrafa freelancer que ama capturar momentos únicos. Vamos tomar um café?
- **Foto**: https://images.unsplash.com/photo-1438761681033-6461ffad8d80

---

## 🎯 Cenários de Teste

### Cenário 1: Cadastro e Perfil
**Objetivo**: Testar fluxo de cadastro e edição de perfil

1. Abra o app em três abas diferentes do navegador
2. Em cada aba, crie uma conta com os dados de cada persona
3. Complete o onboarding com as informações especificadas
4. Adicione as fotos de perfil (pode usar as URLs fornecidas)
5. **Verificar**: Todos os dados foram salvos corretamente

### Cenário 2: Check-in no Mesmo Local
**Objetivo**: Testar funcionalidade de check-in e visualização de usuários próximos

**Aba 1 (Ana)**:
1. Faça login como Ana Silva
2. Vá para o mapa
3. Faça check-in em um local (ex: Copacabana, RJ)
4. Vá para a página de Check-in Success
5. **Verificar**: Deve mostrar "Você é o primeiro aqui!"

**Aba 2 (Bruno)**:
1. Faça login como Bruno Costa
2. Vá para o mapa
3. Faça check-in no MESMO local que Ana
4. **Verificar**: A página deve mostrar "1 pessoa aqui agora"
5. **Verificar**: O card de Ana deve aparecer na lista

**Aba 3 (Carla)**:
1. Faça login como Carla Mendes
2. Faça check-in no MESMO local
3. **Verificar**: Deve mostrar "2 pessoas aqui agora"
4. **Verificar**: Cards de Ana e Bruno devem aparecer

### Cenário 3: Discovery e YO!
**Objetivo**: Testar página de descoberta e envio de YO

**Como Bruno (Aba 2)**:
1. Clique em "Descobrir Mais Perfis"
2. **Verificar**: Ana e Carla devem aparecer na lista
3. Clique em "YO!" no card da Ana
4. **Verificar**: O botão deve mudar para "✓ YO enviado"
5. **Verificar**: O card de Ana permanece na lista, mas com status diferente
6. Recarregue a página
7. **Verificar**: O status "YO enviado" deve persistir

### Cenário 4: Match Bilateral
**Objetivo**: Testar sistema de match quando ambos dão YO

**Como Ana (Aba 1)**:
1. Vá para "Descobrir"
2. **Verificar**: Bruno e Carla devem aparecer
3. **Verificar**: Deve haver indicação que Bruno enviou YO (se implementado)
4. Clique em "YO!" no card do Bruno
5. **Verificar**: Deve redirecionar para tela de Match
6. **Verificar**: Informações do Bruno devem aparecer na tela de match

**Como Bruno (Aba 2)**:
1. Vá para "Matches"
2. **Verificar**: Match com Ana deve aparecer na lista
3. Clique no match
4. **Verificar**: Deve abrir o chat

### Cenário 5: Chat entre Matches
**Objetivo**: Testar funcionalidade de mensagens

**Como Ana (Aba 1)**:
1. Vá para "Matches"
2. Clique no match com Bruno
3. Envie uma mensagem: "Oi Bruno! Vi que você é dev também!"
4. **Verificar**: Mensagem aparece no chat

**Como Bruno (Aba 2)**:
1. No chat com Ana, verifique se a mensagem chegou
2. Envie resposta: "Oi Ana! Legal te conhecer!"
3. **Verificar**: Mensagem aparece instantaneamente para ambos (realtime)

**Volte para Ana (Aba 1)**:
1. **Verificar**: Mensagem do Bruno apareceu automaticamente

### Cenário 6: Unlike/Descurtir
**Objetivo**: Testar funcionalidade de desfazer match

**Como Bruno (Aba 2)**:
1. Vá para o perfil da Ana (através do match)
2. Procure opção de "Descurtir" ou "Unlike"
3. Clique em descurtir
4. **Verificar**: Match deve ser removido da lista
5. **Verificar**: Chat deve desaparecer ou ficar inacessível

**Como Ana (Aba 1)**:
1. Atualize a página de matches
2. **Verificar**: Match com Bruno foi removido
3. **Verificar**: Deve ter recebido notificação (se implementado)

### Cenário 7: Check-out
**Objetivo**: Testar funcionalidade de check-out

**Como Carla (Aba 3)**:
1. Na página de Check-in Success
2. Clique em "Fazer Check-out"
3. **Verificar**: Deve voltar para o mapa
4. **Verificar**: Não deve mais aparecer como "checked-in"

**Como Ana (Aba 1)**:
1. Recarregue a página de Check-in Success
2. **Verificar**: Contador deve atualizar para "1 pessoa aqui agora"
3. **Verificar**: Carla não deve mais aparecer na lista

### Cenário 8: Notificações
**Objetivo**: Testar sistema de notificações

**Como Carla (Aba 3)**:
1. Faça check-in novamente no local
2. Envie YO para Ana

**Como Ana (Aba 1)**:
1. Clique no sino de notificações (se visível)
2. **Verificar**: Deve aparecer notificação de YO recebido
3. Clique na notificação
4. **Verificar**: Deve ir para o perfil de Carla ou Discovery

### Cenário 9: Filtros e Busca
**Objetivo**: Testar funcionalidades de filtro

**Como Bruno (Aba 2)**:
1. Vá para Discovery
2. Abra filtros avançados
3. Filtre por:
   - Gênero: Feminino
   - Idade: 25-30
   - Intenções: Relacionamento
4. **Verificar**: Apenas Ana e Carla devem aparecer
5. Remova filtro de Relacionamento
6. **Verificar**: Lista se atualiza corretamente

### Cenário 10: Histórico de Check-ins
**Objetivo**: Testar visualização de histórico

**Como Ana (Aba 1)**:
1. Vá para "Configurações" ou "Perfil"
2. Procure "Histórico de Check-ins"
3. **Verificar**: Deve mostrar todos os check-ins anteriores
4. **Verificar**: Deve mostrar data/hora e local
5. **Verificar**: Deve mostrar quantas pessoas estavam no local

---

## ✅ Checklist de Funcionalidades

### Autenticação
- [ ] Cadastro de novo usuário
- [ ] Login com email/senha
- [ ] Logout
- [ ] Redirecionamento automático quando autenticado

### Perfil
- [ ] Edição de informações pessoais
- [ ] Upload de fotos
- [ ] Visualização do próprio perfil
- [ ] Visualização de perfil de outros usuários

### Mapa e Check-in
- [ ] Visualização do mapa
- [ ] Busca de locais
- [ ] Check-in em local
- [ ] Visualização de usuários no mesmo local
- [ ] Check-out
- [ ] Atualização em tempo real de usuários

### Discovery
- [ ] Listagem de usuários disponíveis
- [ ] Envio de YO
- [ ] Marcação visual de YO enviado
- [ ] Persistência do estado de YO
- [ ] Visualização de perfil completo

### Matches
- [ ] Criação automática de match
- [ ] Tela de celebração de match
- [ ] Listagem de matches
- [ ] Remoção de match (unlike)

### Chat
- [ ] Envio de mensagens
- [ ] Recebimento em tempo real
- [ ] Marcação de leitura
- [ ] Histórico de conversas

### Notificações
- [ ] Notificação de YO recebido
- [ ] Notificação de match
- [ ] Notificação de mensagem
- [ ] Notificação de unlike
- [ ] Badge com contador

### Outros
- [ ] Filtros avançados
- [ ] Busca de usuários
- [ ] Histórico de check-ins
- [ ] Configurações
- [ ] Responsividade mobile

---

## 🐛 Bugs Encontrados

*Durante os testes, documente aqui qualquer bug encontrado:*

| Cenário | Comportamento Esperado | Comportamento Atual | Severidade |
|---------|----------------------|-------------------|-----------|
|         |                      |                   |           |

---

## 💡 Sugestões de Melhoria

*Anote aqui ideias de melhoria identificadas durante os testes:*

- 
- 
- 

---

## 📊 Resultado Final

- **Data do Teste**: _______
- **Funcionalidades Testadas**: ___/___
- **Bugs Críticos**: ___
- **Bugs Médios**: ___
- **Bugs Menores**: ___
- **Status Geral**: ⬜ Aprovado | ⬜ Aprovado com ressalvas | ⬜ Reprovado
