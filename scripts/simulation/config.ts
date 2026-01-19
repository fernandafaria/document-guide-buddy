/**
 * Configuracao da Simulacao de Usuarios Concorrentes
 * YO App - Teste de Carga com 100 usuarios
 */

export const SUPABASE_URL = 'https://miaifxqtqpuxogpgjwty.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pYWlmeHF0cXB1eG9ncGdqd3R5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0ODA5MTYsImV4cCI6MjA3NjA1NjkxNn0.G5CDR8yesVwchHDMFazqdcQzInsl9r7qkgPQJUVOQck';

// Configuracoes da simulacao
export const SIMULATION_CONFIG = {
  // Numero total de usuarios simulados
  totalUsers: 100,

  // Numero de locais para check-in
  totalLocations: 10,

  // Concorrencia maxima (quantos usuarios ativos ao mesmo tempo)
  maxConcurrency: 20,

  // Delay entre acoes (ms) - simula comportamento humano
  actionDelay: {
    min: 100,
    max: 500
  },

  // Probabilidade de acoes
  probabilities: {
    likeUser: 0.6,        // 60% chance de dar like
    sendMessage: 0.8,     // 80% chance de enviar mensagem apos match
    checkOut: 0.3,        // 30% chance de fazer checkout
  },

  // Metricas de timeout
  timeouts: {
    request: 30000,       // 30 segundos por request
    checkIn: 60000,       // 1 minuto para check-in
    total: 600000,        // 10 minutos total de simulacao
  }
};

// Locais simulados (Sao Paulo)
export const SIMULATED_LOCATIONS = [
  { name: 'Bar do Luiz', address: 'Rua Augusta, 2000', latitude: -23.5505, longitude: -46.6333 },
  { name: 'Cafe Central', address: 'Av. Paulista, 1000', latitude: -23.5614, longitude: -46.6560 },
  { name: 'Restaurante Bela Vista', address: 'Rua Bela Cintra, 500', latitude: -23.5558, longitude: -46.6608 },
  { name: 'Pub Britanico', address: 'Rua Oscar Freire, 300', latitude: -23.5620, longitude: -46.6690 },
  { name: 'Praca do Por do Sol', address: 'Rua Desembargador Ferreira, 100', latitude: -23.5678, longitude: -46.6872 },
  { name: 'Shopping Iguatemi', address: 'Av. Brigadeiro Faria Lima, 2232', latitude: -23.5726, longitude: -46.6866 },
  { name: 'Parque Ibirapuera', address: 'Av. Pedro Alvares Cabral', latitude: -23.5874, longitude: -46.6576 },
  { name: 'Livraria Cultura', address: 'Av. Paulista, 2073', latitude: -23.5634, longitude: -46.6532 },
  { name: 'Restaurante Fasano', address: 'Rua Vittorio Fasano, 88', latitude: -23.5601, longitude: -46.6680 },
  { name: 'Bar Original', address: 'Rua Graca, 120', latitude: -23.5510, longitude: -46.6350 },
];

// Dados para geracao de perfis
export const PROFILE_DATA = {
  maleNames: [
    'Lucas', 'Pedro', 'Gabriel', 'Rafael', 'Bruno', 'Felipe', 'Gustavo', 'Thiago',
    'Leonardo', 'Matheus', 'Andre', 'Rodrigo', 'Eduardo', 'Marcelo', 'Fernando',
    'Carlos', 'Diego', 'Vitor', 'Henrique', 'Ricardo', 'Alexandre', 'Daniel',
    'Paulo', 'Joao', 'Miguel', 'Arthur', 'Bernardo', 'Heitor', 'Davi', 'Lorenzo'
  ],
  femaleNames: [
    'Ana', 'Maria', 'Julia', 'Beatriz', 'Fernanda', 'Amanda', 'Camila', 'Larissa',
    'Mariana', 'Leticia', 'Carolina', 'Patricia', 'Gabriela', 'Isabela', 'Rafaela',
    'Bruna', 'Natalia', 'Juliana', 'Renata', 'Vanessa', 'Tatiana', 'Priscila',
    'Daniela', 'Carla', 'Sofia', 'Helena', 'Valentina', 'Alice', 'Laura', 'Manuela'
  ],
  surnames: [
    'Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves',
    'Pereira', 'Lima', 'Gomes', 'Costa', 'Ribeiro', 'Martins', 'Carvalho',
    'Almeida', 'Lopes', 'Soares', 'Fernandes', 'Vieira', 'Barbosa'
  ],
  professions: [
    'Desenvolvedor', 'Designer', 'Marketing', 'Advogado', 'Medico', 'Engenheiro',
    'Arquiteto', 'Professor', 'Jornalista', 'Fotografo', 'Musico', 'Chef',
    'Nutricionista', 'Psicologo', 'Administrador', 'Contador', 'Economista',
    'Dentista', 'Fisioterapeuta', 'Empresario'
  ],
  education: [
    'Ensino Superior', 'Pos-graduacao', 'Mestrado', 'Doutorado', 'MBA',
    'Ensino Tecnico', 'Cursando Superior'
  ],
  intentions: [
    ['friendship'],
    ['dating'],
    ['relationship'],
    ['friendship', 'dating'],
    ['dating', 'relationship'],
    ['friendship', 'dating', 'relationship']
  ],
  musicalStyles: [
    ['Rock', 'Pop'],
    ['Sertanejo', 'Funk'],
    ['MPB', 'Jazz'],
    ['Eletronica', 'House'],
    ['Hip Hop', 'R&B'],
    ['Classica', 'Instrumental'],
    ['Reggae', 'Ska'],
    ['Metal', 'Punk']
  ],
  languages: [
    ['Portugues'],
    ['Portugues', 'Ingles'],
    ['Portugues', 'Espanhol'],
    ['Portugues', 'Ingles', 'Espanhol'],
    ['Portugues', 'Ingles', 'Frances'],
    ['Portugues', 'Italiano']
  ],
  religions: [
    'Catolico', 'Evangelico', 'Espirita', 'Budista', 'Judaico', 'Agnostico', 'Ateu', null
  ],
  zodiacSigns: [
    'Aries', 'Touro', 'Gemeos', 'Cancer', 'Leao', 'Virgem',
    'Libra', 'Escorpiao', 'Sagitario', 'Capricornio', 'Aquario', 'Peixes'
  ],
  alcoholPreferences: [
    'Sim', 'Nao', 'Socialmente', 'Raramente'
  ],
  aboutMeTemplates: [
    'Adoro conhecer pessoas novas e explorar a cidade!',
    'Buscando fazer novas amizades e quem sabe algo mais.',
    'Apaixonado por musica e viagens. Vamos conversar?',
    'Curtindo a vida, uma aventura de cada vez.',
    'Profissional durante o dia, aventureiro nas horas vagas.',
    'Amante de cafe, livros e boas conversas.',
    'Sempre em busca de novas experiencias e conexoes.',
    'Espontaneo e cheio de energia. Vamos nos conhecer?'
  ]
};

// Mensagens de chat para simulacao
export const CHAT_MESSAGES = [
  'Oi! Tudo bem?',
  'Que legal te encontrar aqui!',
  'Vi que voce tambem esta por aqui. Como esta a noite?',
  'Gostei do seu perfil!',
  'O que te trouxe aqui hoje?',
  'Ja conhecia esse lugar?',
  'Estou curtindo a vibe daqui!',
  'Vamos tomar algo?',
  'Que coincidencia a gente se encontrar!',
  'Voce vem sempre aqui?',
  'Adorei suas fotos!',
  'Que sorriso lindo!',
  'Parece que temos gostos parecidos',
  'Vamos nos conhecer melhor?',
  'Ta animado(a) pra hoje?'
];
