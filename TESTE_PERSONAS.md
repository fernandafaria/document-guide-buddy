# 🧪 Plano de Teste - Três Personas Fictícias

## 👥 Personas

### 1. Ana Silva (25 anos)
- **Email**: `ana.silva.test@gmail.com`
- **Senha**: `Ana@Test123`
- **Perfil**:
  - Gênero: Feminino
  - Profissão: Designer
  - Educação: Superior Completo
  - Cidade: Rio de Janeiro, RJ
  - Intenções: Amizade, Relacionamento
  - Estilos Musicais: Pop, Indie, MPB
  - Sobre: "Adoro arte, café e boas conversas. Sempre em busca de novas experiências!"

### 2. Bruno Costa (28 anos)
- **Email**: `bruno.costa.test@gmail.com`
- **Senha**: `Bruno@Test123`
- **Perfil**:
  - Gênero: Masculino
  - Profissão: Desenvolvedor
  - Educação: Superior Completo
  - Cidade: Rio de Janeiro, RJ
  - Intenções: Amizade, Networking
  - Estilos Musicais: Rock, Eletrônica, Jazz
  - Sobre: "Dev apaixonado por tecnologia e música. Sempre explorando novos lugares pela cidade."

### 3. Carla Mendes (30 anos)
- **Email**: `carla.mendes.test@gmail.com`
- **Senha**: `Carla@Test123`
- **Perfil**:
  - Gênero: Feminino
  - Profissão: Fotógrafa
  - Educação: Superior Completo
  - Cidade: Rio de Janeiro, RJ
  - Intenções: Relacionamento, Networking
  - Estilos Musicais: MPB, Samba, Bossa Nova
  - Sobre: "Fotógrafa freelancer que ama capturar momentos únicos. Vamos tomar um café?"

---

## 📋 Roteiro de Teste

### Fase 1: Cadastro e Configuração (15 min)

#### 1.1 Criar as três contas
1. Acesse a página de cadastro
2. Crie cada usuário com os dados acima
3. Complete o onboarding de cada perfil (fotos, informações, etc.)
4. Use fotos de teste do Unsplash ou qualquer imagem placeholder

**✅ Verificar:**
- Todos os campos do perfil foram preenchidos
- Fotos foram adicionadas
- Perfis estão visíveis após criação

---

### Fase 2: Check-in e Descoberta Local (20 min)

#### 2.1 Ana faz check-in
1. **Login como Ana Silva**
2. Vá para o Mapa
3. Permita acesso à localização
4. Faça check-in em um local próximo (ex: "Café do Centro")
5. Verifique a página de sucesso do check-in

**✅ Verificar:**
- Check-in foi realizado com sucesso
- Animação de confetti apareceu
- Localização correta está sendo exibida
- Mensagem "Você é o primeiro aqui!" aparece

#### 2.2 Bruno faz check-in no MESMO local
1. **Abra uma aba anônima e faça login como Bruno Costa**
2. Vá para o Mapa
3. Faça check-in no MESMO local que Ana ("Café do Centro")
4. Verifique se Ana aparece na lista de "Pessoas por perto"

**✅ Verificar:**
- Bruno vê Ana na lista de pessoas no local
- Contador mostra "2 pessoas aqui agora"
- Cards dos usuários exibem foto, nome, idade e profissão
- É possível clicar para ver o perfil completo

#### 2.3 Voltar para Ana e verificar atualização
1. **Volte para a aba de Ana**
2. Recarregue ou verifique se a lista atualizou automaticamente
3. Ana deve ver Bruno na lista agora

**✅ Verificar:**
- Lista atualiza em tempo real (ou após refresh)
- Ambos os usuários se veem mutuamente

---

### Fase 3: Sistema de "YO" e Matches (25 min)

#### 3.1 Ana envia YO para Bruno (mesmo local)
1. **Como Ana**, na página de check-in sucesso ou Discovery
2. Encontre o perfil de Bruno
3. Clique em "YO!" ou "❤️"
4. Verifique feedback visual

**✅ Verificar:**
- Botão muda para "✓ YO enviado"
- Não há erro no console
- Bruno não recebe notificação ainda (sem match)

#### 3.2 Bruno envia YO para Ana (criando MATCH)
1. **Como Bruno**
2. Na página Discovery ou Check-in, encontre Ana
3. Clique em "YO!" para Ana
4. Deve acontecer um MATCH!

**✅ Verificar:**
- Redirecionamento para tela de Match (`/match`)
- Animação de celebração (confetti, corações)
- Informações de ambos os perfis aparecem
- Opção de "Enviar mensagem" está disponível
- Match aparece na página de Matches para ambos

#### 3.3 Verificar página de Matches
1. **Como Ana**: Vá para página de Matches (BottomNav)
2. **Como Bruno**: Vá para página de Matches
3. Ambos devem ver o match criado

**✅ Verificar:**
- Match aparece na lista
- Foto, nome e local do match são exibidos
- É possível clicar para ver detalhes ou conversar

---

### Fase 4: Discovery e YO sem Match (15 min)

#### 4.1 Carla faz check-in em local DIFERENTE
1. **Abra terceira aba anônima e faça login como Carla Mendes**
2. Faça check-in em um local diferente (ex: "Bar da Lapa")
3. Verifique que está sozinha no local

**✅ Verificar:**
- Check-in funciona normalmente
- "Você é o primeiro aqui!" aparece

#### 4.2 Carla descobre Bruno via Discovery
1. **Como Carla**, vá para a página Discovery
2. Deve ver perfis de outros usuários (Ana e Bruno)
3. Envie YO para Bruno
4. Verifique status do botão

**✅ Verificar:**
- Discovery mostra usuários de outros locais
- Botão muda para "✓ YO enviado" após clicar
- Carla continua vendo Bruno (apenas status muda)
- NÃO há match (Bruno não retribuiu)

#### 4.3 Bruno verifica YOs recebidos
1. **Como Bruno**, vá para página de Likes/YOs recebidos
2. Deve ver o YO de Carla

**✅ Verificar:**
- YO de Carla aparece na lista
- Opção de retribuir ou passar está disponível
- Informações de Carla são exibidas

---

### Fase 5: Check-out e Persistência (10 min)

#### 5.1 Ana faz check-out
1. **Como Ana**, na página de Check-in Success
2. Clique em "Fazer Check-out"
3. Verifique redirecionamento para o Mapa

**✅ Verificar:**
- Check-out bem-sucedido
- Toast de confirmação aparece
- Ana não aparece mais no local para Bruno
- Contador de pessoas no local diminui

#### 5.2 Verificar impacto no Bruno
1. **Como Bruno**, atualize a página Check-in Success
2. Ana não deve mais aparecer na lista

**✅ Verificar:**
- Contador mostra "1 pessoa aqui agora"
- Ana foi removida da lista de pessoas no local
- Match entre Ana e Bruno persiste na página Matches

---

### Fase 6: Histórico e Navegação (10 min)

#### 6.1 Verificar Check-in History
1. **Como Ana**, vá para "Check-in History" (Settings ou Profile)
2. Deve ver histórico de check-ins anteriores

**✅ Verificar:**
- Histórico de check-ins é exibido
- Informações de local e horário estão corretas

#### 6.2 Navegação entre páginas
1. Teste navegação usando o BottomNav em todas as personas:
   - Map
   - Discovery
   - Matches
   - Profile
   - Settings

**✅ Verificar:**
- Todas as páginas carregam corretamente
- BottomNav destaca a página ativa
- Não há erros no console

---

## 🐛 Checklist de Bugs Comuns

Durante os testes, verifique se NENHUM destes bugs ocorre:

- [ ] Botão "YO!" não muda para "YO enviado" após clicar
- [ ] Match não redireciona para tela de Match
- [ ] Usuários não aparecem na lista após check-in no mesmo local
- [ ] Check-out não remove usuário da contagem do local
- [ ] Página Discovery mostra usuários já matchados/com YO enviado sem indicação
- [ ] Erros de console relacionados a realtime ou websockets
- [ ] Lentidão excessiva no carregamento de páginas
- [ ] Animações não funcionam ou causam lag

---

## 📊 Resultados Esperados

Ao final dos testes, você deve ter:

1. ✅ 3 usuários criados e configurados
2. ✅ 2 check-ins ativos (Bruno e Carla em locais diferentes)
3. ✅ 1 match criado (Ana ↔ Bruno)
4. ✅ 1 YO pendente (Carla → Bruno)
5. ✅ 1 check-out registrado (Ana)
6. ✅ Histórico de check-ins para todos

---

## 💡 Dicas

- Use abas anônimas ou diferentes navegadores para simular múltiplos usuários
- Mantenha as abas abertas para testar interações em tempo real
- Anote qualquer comportamento inesperado
- Teste em dispositivo móvel também se possível
- Verifique o console do navegador para erros

---

## 📝 Relatório de Bugs

Se encontrar problemas, anote:

1. **O que você estava fazendo?**
2. **O que era esperado?**
3. **O que aconteceu?**
4. **Como reproduzir?**
5. **Mensagens de erro (se houver)**

---

**Boa sorte com os testes! 🚀**
