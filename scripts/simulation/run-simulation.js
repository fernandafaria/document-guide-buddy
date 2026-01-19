#!/usr/bin/env node
/**
 * Runner Script para Simulacao de 100 Usuarios - YO App
 *
 * Execute com: node scripts/simulation/run-simulation.js
 * Ou: npm run simulate
 *
 * Opcoes:
 *   --dry-run    Executa simulacao local sem conexao ao Supabase
 *   --users=N    Numero de usuarios a simular (padrao: 100)
 *   --verbose    Mostra logs detalhados
 */

import { createClient } from '@supabase/supabase-js';

// Parse argumentos
const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const VERBOSE = args.includes('--verbose');
const userArg = args.find(a => a.startsWith('--users='));
const CUSTOM_USERS = userArg ? parseInt(userArg.split('=')[1], 10) : null;

// Configuracoes
const SUPABASE_URL = 'https://miaifxqtqpuxogpgjwty.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pYWlmeHF0cXB1eG9ncGdqd3R5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0ODA5MTYsImV4cCI6MjA3NjA1NjkxNn0.G5CDR8yesVwchHDMFazqdcQzInsl9r7qkgPQJUVOQck';

const CONFIG = {
  totalUsers: CUSTOM_USERS || 100,
  maxConcurrency: 20,
  actionDelay: { min: DRY_RUN ? 10 : 100, max: DRY_RUN ? 50 : 500 },
  probabilities: { likeUser: 0.6, sendMessage: 0.8, checkOut: 0.3 }
};

const LOCATIONS = [
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

const NAMES = {
  male: ['Lucas', 'Pedro', 'Gabriel', 'Rafael', 'Bruno', 'Felipe', 'Gustavo', 'Thiago', 'Leonardo', 'Matheus', 'Andre', 'Rodrigo', 'Eduardo', 'Marcelo', 'Fernando', 'Carlos', 'Diego', 'Vitor', 'Henrique', 'Ricardo', 'Alexandre', 'Daniel', 'Paulo', 'Joao', 'Miguel', 'Arthur', 'Bernardo', 'Heitor', 'Davi', 'Lorenzo'],
  female: ['Ana', 'Maria', 'Julia', 'Beatriz', 'Fernanda', 'Amanda', 'Camila', 'Larissa', 'Mariana', 'Leticia', 'Carolina', 'Patricia', 'Gabriela', 'Isabela', 'Rafaela', 'Bruna', 'Natalia', 'Juliana', 'Renata', 'Vanessa', 'Tatiana', 'Priscila', 'Daniela', 'Carla', 'Sofia', 'Helena', 'Valentina', 'Alice', 'Laura', 'Manuela'],
  surnames: ['Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira', 'Lima', 'Gomes', 'Costa', 'Ribeiro', 'Martins', 'Carvalho', 'Almeida', 'Lopes', 'Soares', 'Fernandes', 'Vieira', 'Barbosa']
};

const PROFESSIONS = ['Desenvolvedor', 'Designer', 'Marketing', 'Advogado', 'Medico', 'Engenheiro', 'Arquiteto', 'Professor', 'Jornalista', 'Fotografo'];
const EDUCATION = ['Ensino Superior', 'Pos-graduacao', 'Mestrado', 'Doutorado', 'MBA', 'Ensino Tecnico'];
const INTENTIONS = [['friendship'], ['dating'], ['relationship'], ['friendship', 'dating'], ['dating', 'relationship']];
const MESSAGES = ['Oi! Tudo bem?', 'Que legal te encontrar aqui!', 'Gostei do seu perfil!', 'O que te trouxe aqui hoje?', 'Vamos tomar algo?', 'Voce vem sempre aqui?', 'Adorei suas fotos!'];

// Metricas
const metrics = {
  startTime: Date.now(),
  usersCreated: 0,
  checkIns: 0,
  discoveries: 0,
  likesGiven: 0,
  matchesCreated: 0,
  messagesSent: 0,
  errors: [],
  latencies: []
};

// Utilitarios
const random = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomNum = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const delay = (ms) => new Promise(r => setTimeout(r, ms));
const randomDelay = () => delay(randomNum(CONFIG.actionDelay.min, CONFIG.actionDelay.max));

function log(msg, type = 'info') {
  const ts = new Date().toISOString();
  const colors = { info: '\x1b[36m', success: '\x1b[32m', error: '\x1b[31m', metric: '\x1b[33m' };
  console.log(`${ts} ${colors[type]}[${type.toUpperCase()}]\x1b[0m ${msg}`);
}

// Gerar perfil
function generateProfile(index) {
  const isMale = Math.random() > 0.5;
  const firstName = random(isMale ? NAMES.male : NAMES.female);
  const lastName = random(NAMES.surnames);
  return {
    email: `simuser_${index}_${Date.now()}@test.yo.app`,
    password: `SimPass123!${index}`,
    name: `${firstName} ${lastName}`,
    gender: isMale ? 'Masculino' : 'Feminino',
    age: randomNum(18, 45),
    profession: random(PROFESSIONS),
    education: random(EDUCATION),
    intentions: random(INTENTIONS)
  };
}

// Criar usuario
async function createUser(index) {
  const start = Date.now();
  const profile = generateProfile(index);

  // Modo dry-run: simula sem conexao
  if (DRY_RUN) {
    await delay(randomNum(10, 30));
    const fakeId = `fake-user-${index}-${Date.now()}`;
    metrics.usersCreated++;
    metrics.latencies.push({ op: 'signup', time: Date.now() - start });
    if (VERBOSE) log(`[DRY-RUN] Usuario ${profile.name} criado`, 'success');
    return { ...profile, id: fakeId, client: null, matches: [] };
  }

  try {
    const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    const { data, error } = await client.auth.signUp({
      email: profile.email,
      password: profile.password,
      options: { data: { name: profile.name, gender: profile.gender, age: profile.age } }
    });

    if (error) throw error;

    if (data.user) {
      await client.from('profiles').upsert({
        id: data.user.id,
        email: profile.email,
        name: profile.name,
        gender: profile.gender,
        age: profile.age,
        profession: profile.profession,
        education: profile.education,
        intentions: profile.intentions,
        notifications_enabled: true
      });
    }

    metrics.usersCreated++;
    metrics.latencies.push({ op: 'signup', time: Date.now() - start });

    return { ...profile, id: data.user.id, client, matches: [] };
  } catch (err) {
    metrics.errors.push({ op: 'createUser', err: err.message || String(err) });
    return null;
  }
}

// Check-in
async function checkIn(user) {
  const start = Date.now();
  const location = random(LOCATIONS);

  // Modo dry-run
  if (DRY_RUN) {
    await delay(randomNum(20, 50));
    user.location = location;
    metrics.checkIns++;
    metrics.latencies.push({ op: 'checkIn', time: Date.now() - start });
    if (VERBOSE) log(`[DRY-RUN] ${user.name} fez check-in em ${location.name}`, 'success');
    return true;
  }

  try {
    const res = await user.client.functions.invoke('check-in', {
      body: {
        latitude: location.latitude,
        longitude: location.longitude,
        name: location.name,
        address: location.address,
        userLatitude: location.latitude + (Math.random() * 0.001 - 0.0005),
        userLongitude: location.longitude + (Math.random() * 0.001 - 0.0005)
      }
    });

    if (res.error) throw res.error;

    user.location = location;
    metrics.checkIns++;
    metrics.latencies.push({ op: 'checkIn', time: Date.now() - start });
    log(`${user.name} fez check-in em ${location.name}`, 'success');
    return true;
  } catch (err) {
    metrics.errors.push({ op: 'checkIn', err: err.message || String(err) });
    return false;
  }
}

// Armazenamento local para dry-run
const dryRunData = {
  usersByLocation: {},
  matches: [],
  messages: []
};

// Descobrir usuarios
async function discover(user, allUsers) {
  if (!user.location) return [];
  const start = Date.now();

  // Modo dry-run
  if (DRY_RUN) {
    await delay(randomNum(10, 30));
    // Simular usuarios no mesmo local
    const sameLocationUsers = (allUsers || [])
      .filter(u => u.location?.name === user.location.name && u.id !== user.id)
      .map(u => u.id);
    metrics.discoveries++;
    metrics.latencies.push({ op: 'discover', time: Date.now() - start });
    if (VERBOSE) log(`[DRY-RUN] ${user.name} descobriu ${sameLocationUsers.length} usuarios`, 'info');
    return sameLocationUsers;
  }

  try {
    const locationId = `${user.location.latitude.toFixed(6)}_${user.location.longitude.toFixed(6)}`;
    const res = await user.client.functions.invoke('get-users-at-location', { body: { locationId } });

    if (res.error) throw res.error;

    metrics.discoveries++;
    metrics.latencies.push({ op: 'discover', time: Date.now() - start });
    return (res.data?.users || []).map(u => u.id);
  } catch (err) {
    metrics.errors.push({ op: 'discover', err: err.message || String(err) });
    return [];
  }
}

// Armazenamento de likes para dry-run
const dryRunLikes = new Map();

// Enviar like
async function sendLike(user, toUserId) {
  if (!user.location) return false;
  const start = Date.now();

  // Modo dry-run
  if (DRY_RUN) {
    await delay(randomNum(10, 30));

    // Verificar se o outro usuario ja deu like neste
    const reverseKey = `${toUserId}->${user.id}`;
    const hasReverseLike = dryRunLikes.has(reverseKey);

    // Registrar este like
    const likeKey = `${user.id}->${toUserId}`;
    dryRunLikes.set(likeKey, true);

    metrics.likesGiven++;
    metrics.latencies.push({ op: 'like', time: Date.now() - start });

    if (hasReverseLike) {
      user.matches.push(toUserId);
      const matchId = `match-${user.id}-${toUserId}`;
      dryRunData.matches.push({ id: matchId, user1: user.id, user2: toUserId });
      metrics.matchesCreated++;
      log(`[DRY-RUN] MATCH! ${user.name} deu match!`, 'success');
      return true;
    }
    if (VERBOSE) log(`[DRY-RUN] ${user.name} enviou YO`, 'info');
    return false;
  }

  try {
    const locationId = `${user.location.latitude.toFixed(6)}_${user.location.longitude.toFixed(6)}`;
    const res = await user.client.functions.invoke('process-like', {
      body: { toUserId, locationId, action: 'like' }
    });

    if (res.error) throw res.error;

    metrics.likesGiven++;
    metrics.latencies.push({ op: 'like', time: Date.now() - start });

    if (res.data?.isMatch) {
      user.matches.push(toUserId);
      metrics.matchesCreated++;
      log(`MATCH! ${user.name} deu match!`, 'success');
    }
    return res.data?.isMatch || false;
  } catch (err) {
    metrics.errors.push({ op: 'like', err: err.message || String(err) });
    return false;
  }
}

// Buscar matches
async function getMatches(user) {
  // Modo dry-run
  if (DRY_RUN) {
    const userMatches = dryRunData.matches
      .filter(m => m.user1 === user.id || m.user2 === user.id)
      .map(m => ({
        id: m.id,
        otherUserId: m.user1 === user.id ? m.user2 : m.user1
      }));
    return userMatches;
  }

  try {
    const { data, error } = await user.client
      .from('matches')
      .select('id, user1_id, user2_id')
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

    if (error) throw error;
    return (data || []).map(m => ({
      id: m.id,
      otherUserId: m.user1_id === user.id ? m.user2_id : m.user1_id
    }));
  } catch (err) {
    return [];
  }
}

// Enviar mensagem
async function sendMessage(user, matchId, receiverId) {
  const start = Date.now();
  const message = random(MESSAGES);

  // Modo dry-run
  if (DRY_RUN) {
    await delay(randomNum(10, 30));
    dryRunData.messages.push({
      matchId,
      senderId: user.id,
      receiverId,
      message,
      sentAt: new Date().toISOString()
    });
    metrics.messagesSent++;
    metrics.latencies.push({ op: 'message', time: Date.now() - start });
    if (VERBOSE) log(`[DRY-RUN] ${user.name} enviou: "${message}"`, 'success');
    return true;
  }

  try {
    await user.client.from('matches').update({
      conversation_started: true,
      first_message_by: user.id,
      last_activity: new Date().toISOString()
    }).eq('id', matchId);

    const { error } = await user.client.from('messages').insert({
      match_id: matchId,
      sender_id: user.id,
      receiver_id: receiverId,
      message,
      type: 'text'
    });

    if (error) throw error;

    metrics.messagesSent++;
    metrics.latencies.push({ op: 'message', time: Date.now() - start });
    log(`${user.name} enviou: "${message}"`, 'success');
    return true;
  } catch (err) {
    metrics.errors.push({ op: 'message', err: err.message || String(err) });
    return false;
  }
}

// Simular comportamento
async function simulateUser(user, allUsers) {
  if (VERBOSE) log(`Simulando ${user.name}`, 'info');

  // Check-in
  if (!await checkIn(user)) return;
  await randomDelay();

  // Descobrir usuarios
  const nearby = await discover(user, allUsers);
  await randomDelay();

  // Enviar likes
  for (const otherId of nearby) {
    if (otherId !== user.id && Math.random() < CONFIG.probabilities.likeUser) {
      await sendLike(user, otherId);
      await randomDelay();
    }
  }

  // Enviar mensagens
  const matches = await getMatches(user);
  for (const match of matches) {
    if (Math.random() < CONFIG.probabilities.sendMessage) {
      await sendMessage(user, match.id, match.otherUserId);
      await randomDelay();
    }
  }
}

// Gerar relatorio
function report() {
  const duration = (Date.now() - metrics.startTime) / 1000;
  const avgLatencies = {};

  for (const { op, time } of metrics.latencies) {
    if (!avgLatencies[op]) avgLatencies[op] = [];
    avgLatencies[op].push(time);
  }

  console.log('\n' + '='.repeat(60));
  console.log(' RELATORIO DA SIMULACAO - YO APP');
  console.log('='.repeat(60));
  console.log(`\n Duracao: ${duration.toFixed(2)}s`);
  console.log(` Usuarios criados: ${metrics.usersCreated}`);
  console.log(` Check-ins: ${metrics.checkIns}`);
  console.log(` Descobertas: ${metrics.discoveries}`);
  console.log(` Likes enviados: ${metrics.likesGiven}`);
  console.log(` Matches criados: ${metrics.matchesCreated}`);
  console.log(` Mensagens enviadas: ${metrics.messagesSent}`);
  console.log(`\n Latencias medias:`);
  for (const [op, times] of Object.entries(avgLatencies)) {
    const avg = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
    console.log(`   ${op}: ${avg}ms`);
  }
  console.log(`\n Erros: ${metrics.errors.length}`);
  if (metrics.errors.length > 0) {
    const byOp = {};
    metrics.errors.forEach(e => byOp[e.op] = (byOp[e.op] || 0) + 1);
    Object.entries(byOp).forEach(([op, count]) => console.log(`   ${op}: ${count}`));
  }
  console.log(`\n Throughput: ${(metrics.latencies.length / duration).toFixed(2)} ops/s`);
  console.log('='.repeat(60) + '\n');
}

// Main
async function main() {
  console.log('\n' + '='.repeat(60));
  console.log(' SIMULACAO DE USUARIOS CONCORRENTES - YO APP');
  console.log('='.repeat(60));
  console.log(` Total usuarios: ${CONFIG.totalUsers}`);
  console.log(` Concorrencia maxima: ${CONFIG.maxConcurrency}`);
  if (DRY_RUN) {
    console.log(' MODO: DRY-RUN (simulacao local, sem conexao Supabase)');
  } else {
    console.log(' MODO: PRODUCAO (conectando ao Supabase)');
  }
  console.log('');

  const users = [];

  // Fase 1: Criar usuarios
  log('=== FASE 1: Criando usuarios ===', 'info');

  for (let i = 0; i < CONFIG.totalUsers; i += CONFIG.maxConcurrency) {
    const batch = [];
    for (let j = 0; j < CONFIG.maxConcurrency && i + j < CONFIG.totalUsers; j++) {
      batch.push(createUser(i + j));
    }
    const results = await Promise.allSettled(batch);
    results.forEach(r => r.status === 'fulfilled' && r.value && users.push(r.value));
    log(`Progresso: ${users.length}/${CONFIG.totalUsers} usuarios`, 'metric');
  }

  log(`Total usuarios criados: ${users.length}`, 'success');

  // Fase 2: Simular comportamento
  log('=== FASE 2: Simulando comportamento ===', 'info');

  for (let i = 0; i < users.length; i += CONFIG.maxConcurrency) {
    const batch = users.slice(i, i + CONFIG.maxConcurrency);
    log(`Batch ${Math.floor(i / CONFIG.maxConcurrency) + 1}/${Math.ceil(users.length / CONFIG.maxConcurrency)}`, 'metric');
    await Promise.allSettled(batch.map(u => simulateUser(u, users)));
  }

  // Fase 3: Segunda rodada
  log('=== FASE 3: Segunda rodada de interacoes ===', 'info');

  const shuffled = [...users].sort(() => Math.random() - 0.5);
  for (let i = 0; i < shuffled.length; i += CONFIG.maxConcurrency) {
    const batch = shuffled.slice(i, i + CONFIG.maxConcurrency);
    await Promise.allSettled(batch.map(u => simulateUser(u, users)));
  }

  report();
}

main().catch(console.error);
