/**
 * Simulacao de 100 Usuarios Concorrentes - YO App
 * Este script simula o comportamento de 100 usuarios usando todas as funcionalidades:
 * - Criacao de contas
 * - Check-in em locais
 * - Descoberta de usuarios
 * - Envio de YOs (curtidas)
 * - Criacao de matches
 * - Chat entre usuarios
 */

import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  SIMULATION_CONFIG,
  SIMULATED_LOCATIONS,
  PROFILE_DATA,
  CHAT_MESSAGES
} from './config';

// Tipos
interface SimulatedUser {
  id: string;
  email: string;
  password: string;
  name: string;
  gender: string;
  age: number;
  profession: string;
  education: string;
  intentions: string[];
  musicalStyles: string[];
  languages: string[];
  religion: string | null;
  zodiacSign: string;
  alcohol: string;
  aboutMe: string;
  client: SupabaseClient;
  accessToken?: string;
  currentLocation?: typeof SIMULATED_LOCATIONS[0];
  matches: string[];
}

interface SimulationMetrics {
  startTime: number;
  endTime?: number;
  usersCreated: number;
  usersLoggedIn: number;
  checkIns: number;
  checkOuts: number;
  discoveries: number;
  likesGiven: number;
  likesReceived: number;
  matchesCreated: number;
  messagesSent: number;
  errors: { operation: string; error: string; timestamp: number }[];
  latencies: { operation: string; latency: number }[];
}

// Classe principal da simulacao
class UserSimulation {
  private users: SimulatedUser[] = [];
  private metrics: SimulationMetrics = {
    startTime: Date.now(),
    usersCreated: 0,
    usersLoggedIn: 0,
    checkIns: 0,
    checkOuts: 0,
    discoveries: 0,
    likesGiven: 0,
    likesReceived: 0,
    matchesCreated: 0,
    messagesSent: 0,
    errors: [],
    latencies: []
  };

  // Utilitarios
  private randomItem<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  private randomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async randomDelay(): Promise<void> {
    const { min, max } = SIMULATION_CONFIG.actionDelay;
    await this.delay(this.randomNumber(min, max));
  }

  private log(message: string, type: 'info' | 'success' | 'error' | 'metric' = 'info'): void {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: '\x1b[36m[INFO]\x1b[0m',
      success: '\x1b[32m[SUCCESS]\x1b[0m',
      error: '\x1b[31m[ERROR]\x1b[0m',
      metric: '\x1b[33m[METRIC]\x1b[0m'
    };
    console.log(`${timestamp} ${prefix[type]} ${message}`);
  }

  private trackLatency(operation: string, startTime: number): void {
    const latency = Date.now() - startTime;
    this.metrics.latencies.push({ operation, latency });
  }

  private trackError(operation: string, error: unknown): void {
    const errorMsg = error instanceof Error ? error.message : String(error);
    this.metrics.errors.push({ operation, error: errorMsg, timestamp: Date.now() });
    this.log(`${operation}: ${errorMsg}`, 'error');
  }

  // Geracao de perfil de usuario
  private generateUserProfile(index: number): Omit<SimulatedUser, 'id' | 'client' | 'accessToken' | 'currentLocation' | 'matches'> {
    const isMale = Math.random() > 0.5;
    const firstName = isMale
      ? this.randomItem(PROFILE_DATA.maleNames)
      : this.randomItem(PROFILE_DATA.femaleNames);
    const lastName = this.randomItem(PROFILE_DATA.surnames);

    return {
      email: `simuser_${index}_${Date.now()}@test.yo.app`,
      password: `SimPass123!${index}`,
      name: `${firstName} ${lastName}`,
      gender: isMale ? 'Masculino' : 'Feminino',
      age: this.randomNumber(18, 45),
      profession: this.randomItem(PROFILE_DATA.professions),
      education: this.randomItem(PROFILE_DATA.education),
      intentions: this.randomItem(PROFILE_DATA.intentions),
      musicalStyles: this.randomItem(PROFILE_DATA.musicalStyles),
      languages: this.randomItem(PROFILE_DATA.languages),
      religion: this.randomItem(PROFILE_DATA.religions),
      zodiacSign: this.randomItem(PROFILE_DATA.zodiacSigns),
      alcohol: this.randomItem(PROFILE_DATA.alcoholPreferences),
      aboutMe: this.randomItem(PROFILE_DATA.aboutMeTemplates)
    };
  }

  // Criar usuario e fazer login
  private async createUser(index: number): Promise<SimulatedUser | null> {
    const startTime = Date.now();
    const profile = this.generateUserProfile(index);

    try {
      // Criar cliente Supabase para este usuario
      const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

      // Registrar usuario
      const { data: signUpData, error: signUpError } = await client.auth.signUp({
        email: profile.email,
        password: profile.password,
        options: {
          data: {
            name: profile.name,
            gender: profile.gender,
            age: profile.age
          }
        }
      });

      if (signUpError) {
        // Se o usuario ja existe, fazer login
        if (signUpError.message.includes('already registered')) {
          const { data: signInData, error: signInError } = await client.auth.signInWithPassword({
            email: profile.email,
            password: profile.password
          });

          if (signInError) throw signInError;

          this.trackLatency('login', startTime);
          this.metrics.usersLoggedIn++;

          return {
            ...profile,
            id: signInData.user!.id,
            client,
            accessToken: signInData.session?.access_token,
            matches: []
          };
        }
        throw signUpError;
      }

      // Criar perfil na tabela profiles
      if (signUpData.user) {
        const { error: profileError } = await client.from('profiles').upsert({
          id: signUpData.user.id,
          email: profile.email,
          name: profile.name,
          gender: profile.gender,
          age: profile.age,
          profession: profile.profession,
          education: profile.education,
          intentions: profile.intentions,
          musical_styles: profile.musicalStyles,
          languages: profile.languages,
          religion: profile.religion,
          zodiac_sign: profile.zodiacSign,
          alcohol: profile.alcohol,
          about_me: profile.aboutMe,
          notifications_enabled: true
        });

        if (profileError) {
          this.log(`Erro ao criar perfil: ${profileError.message}`, 'error');
        }
      }

      this.trackLatency('signup', startTime);
      this.metrics.usersCreated++;

      return {
        ...profile,
        id: signUpData.user!.id,
        client,
        accessToken: signUpData.session?.access_token,
        matches: []
      };
    } catch (error) {
      this.trackError(`createUser[${index}]`, error);
      return null;
    }
  }

  // Fazer check-in em um local
  private async checkIn(user: SimulatedUser): Promise<boolean> {
    const startTime = Date.now();
    const location = this.randomItem(SIMULATED_LOCATIONS);

    try {
      const response = await user.client.functions.invoke('check-in', {
        body: {
          latitude: location.latitude,
          longitude: location.longitude,
          name: location.name,
          address: location.address,
          // Simular que o usuario esta proximo do local
          userLatitude: location.latitude + (Math.random() * 0.001 - 0.0005),
          userLongitude: location.longitude + (Math.random() * 0.001 - 0.0005)
        }
      });

      if (response.error) throw response.error;

      user.currentLocation = location;
      this.trackLatency('checkIn', startTime);
      this.metrics.checkIns++;

      this.log(`Usuario ${user.name} fez check-in em ${location.name}`, 'success');
      return true;
    } catch (error) {
      this.trackError(`checkIn[${user.name}]`, error);
      return false;
    }
  }

  // Descobrir usuarios no mesmo local
  private async discoverUsers(user: SimulatedUser): Promise<string[]> {
    const startTime = Date.now();

    if (!user.currentLocation) {
      return [];
    }

    try {
      const locationId = `${user.currentLocation.latitude.toFixed(6)}_${user.currentLocation.longitude.toFixed(6)}`;

      const response = await user.client.functions.invoke('get-users-at-location', {
        body: { locationId }
      });

      if (response.error) throw response.error;

      const users = response.data?.users || [];
      this.trackLatency('discoverUsers', startTime);
      this.metrics.discoveries++;

      this.log(`Usuario ${user.name} descobriu ${users.length} usuarios em ${user.currentLocation.name}`, 'info');
      return users.map((u: { id: string }) => u.id);
    } catch (error) {
      this.trackError(`discoverUsers[${user.name}]`, error);
      return [];
    }
  }

  // Enviar YO (curtida)
  private async sendLike(user: SimulatedUser, toUserId: string): Promise<boolean> {
    const startTime = Date.now();

    if (!user.currentLocation) {
      return false;
    }

    try {
      const locationId = `${user.currentLocation.latitude.toFixed(6)}_${user.currentLocation.longitude.toFixed(6)}`;

      const response = await user.client.functions.invoke('process-like', {
        body: {
          toUserId,
          locationId,
          action: 'like'
        }
      });

      if (response.error) throw response.error;

      this.trackLatency('sendLike', startTime);
      this.metrics.likesGiven++;

      const isMatch = response.data?.isMatch || false;
      if (isMatch) {
        user.matches.push(toUserId);
        this.metrics.matchesCreated++;
        this.log(`MATCH! Usuario ${user.name} deu match com outro usuario!`, 'success');
      } else {
        this.log(`Usuario ${user.name} enviou YO`, 'info');
      }

      return isMatch;
    } catch (error) {
      this.trackError(`sendLike[${user.name}]`, error);
      return false;
    }
  }

  // Buscar matches do usuario
  private async getMatches(user: SimulatedUser): Promise<{ id: string; otherUserId: string }[]> {
    const startTime = Date.now();

    try {
      const { data: matches, error } = await user.client
        .from('matches')
        .select('id, user1_id, user2_id, conversation_started')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

      if (error) throw error;

      this.trackLatency('getMatches', startTime);

      return (matches || []).map(m => ({
        id: m.id,
        otherUserId: m.user1_id === user.id ? m.user2_id : m.user1_id
      }));
    } catch (error) {
      this.trackError(`getMatches[${user.name}]`, error);
      return [];
    }
  }

  // Enviar mensagem
  private async sendMessage(user: SimulatedUser, matchId: string, receiverId: string): Promise<boolean> {
    const startTime = Date.now();

    try {
      const message = this.randomItem(CHAT_MESSAGES);

      // Primeiro, atualizar o match para conversation_started = true
      await user.client
        .from('matches')
        .update({
          conversation_started: true,
          first_message_by: user.id,
          last_activity: new Date().toISOString()
        })
        .eq('id', matchId);

      // Inserir a mensagem
      const { error } = await user.client.from('messages').insert({
        match_id: matchId,
        sender_id: user.id,
        receiver_id: receiverId,
        message,
        type: 'text'
      });

      if (error) throw error;

      this.trackLatency('sendMessage', startTime);
      this.metrics.messagesSent++;

      this.log(`Usuario ${user.name} enviou mensagem: "${message.substring(0, 30)}..."`, 'success');
      return true;
    } catch (error) {
      this.trackError(`sendMessage[${user.name}]`, error);
      return false;
    }
  }

  // Fazer checkout
  private async checkOut(user: SimulatedUser): Promise<boolean> {
    const startTime = Date.now();

    if (!user.currentLocation) {
      return false;
    }

    try {
      const locationId = `${user.currentLocation.latitude.toFixed(6)}_${user.currentLocation.longitude.toFixed(6)}`;

      const response = await user.client.functions.invoke('checkout', {
        body: { locationId }
      });

      if (response.error) throw response.error;

      user.currentLocation = undefined;
      this.trackLatency('checkOut', startTime);
      this.metrics.checkOuts++;

      this.log(`Usuario ${user.name} fez checkout`, 'info');
      return true;
    } catch (error) {
      this.trackError(`checkOut[${user.name}]`, error);
      return false;
    }
  }

  // Simular comportamento de um usuario
  private async simulateUserBehavior(user: SimulatedUser): Promise<void> {
    this.log(`Iniciando simulacao para usuario ${user.name}`, 'info');

    // 1. Fazer check-in
    const checkedIn = await this.checkIn(user);
    if (!checkedIn) return;

    await this.randomDelay();

    // 2. Descobrir usuarios
    const nearbyUsers = await this.discoverUsers(user);
    await this.randomDelay();

    // 3. Enviar YOs
    for (const otherUserId of nearbyUsers) {
      if (otherUserId !== user.id && Math.random() < SIMULATION_CONFIG.probabilities.likeUser) {
        await this.sendLike(user, otherUserId);
        await this.randomDelay();
      }
    }

    // 4. Verificar matches e enviar mensagens
    const matches = await this.getMatches(user);
    for (const match of matches) {
      if (Math.random() < SIMULATION_CONFIG.probabilities.sendMessage) {
        await this.sendMessage(user, match.id, match.otherUserId);
        await this.randomDelay();
      }
    }

    // 5. Possivelmente fazer checkout
    if (Math.random() < SIMULATION_CONFIG.probabilities.checkOut) {
      await this.checkOut(user);
    }
  }

  // Executar simulacao em batches
  private async runBatch(users: SimulatedUser[]): Promise<void> {
    const promises = users.map(user => this.simulateUserBehavior(user));
    await Promise.allSettled(promises);
  }

  // Gerar relatorio de metricas
  private generateReport(): void {
    this.metrics.endTime = Date.now();
    const duration = (this.metrics.endTime - this.metrics.startTime) / 1000;

    // Calcular latencias medias
    const latencyByOperation: Record<string, number[]> = {};
    for (const { operation, latency } of this.metrics.latencies) {
      if (!latencyByOperation[operation]) {
        latencyByOperation[operation] = [];
      }
      latencyByOperation[operation].push(latency);
    }

    const avgLatencies: Record<string, number> = {};
    for (const [op, latencies] of Object.entries(latencyByOperation)) {
      avgLatencies[op] = Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length);
    }

    console.log('\n');
    console.log('='.repeat(60));
    console.log(' RELATORIO DA SIMULACAO - YO APP');
    console.log('='.repeat(60));
    console.log('\n METRICAS GERAIS:');
    console.log('-'.repeat(40));
    console.log(` Duracao total: ${duration.toFixed(2)} segundos`);
    console.log(` Usuarios criados: ${this.metrics.usersCreated}`);
    console.log(` Usuarios logados: ${this.metrics.usersLoggedIn}`);
    console.log(` Total usuarios: ${this.users.length}`);
    console.log('\n FUNCIONALIDADES:');
    console.log('-'.repeat(40));
    console.log(` Check-ins realizados: ${this.metrics.checkIns}`);
    console.log(` Check-outs realizados: ${this.metrics.checkOuts}`);
    console.log(` Descobertas de usuarios: ${this.metrics.discoveries}`);
    console.log(` YOs enviados: ${this.metrics.likesGiven}`);
    console.log(` Matches criados: ${this.metrics.matchesCreated}`);
    console.log(` Mensagens enviadas: ${this.metrics.messagesSent}`);
    console.log('\n LATENCIAS MEDIAS (ms):');
    console.log('-'.repeat(40));
    for (const [op, avg] of Object.entries(avgLatencies)) {
      console.log(` ${op}: ${avg}ms`);
    }
    console.log('\n ERROS:');
    console.log('-'.repeat(40));
    console.log(` Total de erros: ${this.metrics.errors.length}`);
    if (this.metrics.errors.length > 0) {
      const errorsByOp: Record<string, number> = {};
      for (const { operation } of this.metrics.errors) {
        const opName = operation.split('[')[0];
        errorsByOp[opName] = (errorsByOp[opName] || 0) + 1;
      }
      for (const [op, count] of Object.entries(errorsByOp)) {
        console.log(` - ${op}: ${count} erros`);
      }
    }
    console.log('\n THROUGHPUT:');
    console.log('-'.repeat(40));
    console.log(` Operacoes/segundo: ${(this.metrics.latencies.length / duration).toFixed(2)}`);
    console.log(` Check-ins/segundo: ${(this.metrics.checkIns / duration).toFixed(2)}`);
    console.log(` Likes/segundo: ${(this.metrics.likesGiven / duration).toFixed(2)}`);
    console.log(` Mensagens/segundo: ${(this.metrics.messagesSent / duration).toFixed(2)}`);
    console.log('='.repeat(60));
    console.log('\n');
  }

  // Metodo principal
  async run(): Promise<void> {
    console.log('\n');
    console.log('='.repeat(60));
    console.log(' SIMULACAO DE 100 USUARIOS CONCORRENTES - YO APP');
    console.log('='.repeat(60));
    console.log(`\n Configuracao:`);
    console.log(` - Total de usuarios: ${SIMULATION_CONFIG.totalUsers}`);
    console.log(` - Locais disponiveis: ${SIMULATED_LOCATIONS.length}`);
    console.log(` - Concorrencia maxima: ${SIMULATION_CONFIG.maxConcurrency}`);
    console.log('\n');

    // Fase 1: Criar usuarios
    this.log('=== FASE 1: Criando usuarios ===', 'info');

    const createPromises: Promise<SimulatedUser | null>[] = [];
    for (let i = 0; i < SIMULATION_CONFIG.totalUsers; i++) {
      createPromises.push(this.createUser(i));

      // Criar em batches para nao sobrecarregar
      if (createPromises.length >= SIMULATION_CONFIG.maxConcurrency) {
        const results = await Promise.allSettled(createPromises);
        for (const result of results) {
          if (result.status === 'fulfilled' && result.value) {
            this.users.push(result.value);
          }
        }
        createPromises.length = 0;
        this.log(`Progresso: ${this.users.length}/${SIMULATION_CONFIG.totalUsers} usuarios`, 'metric');
      }
    }

    // Processar usuarios restantes
    if (createPromises.length > 0) {
      const results = await Promise.allSettled(createPromises);
      for (const result of results) {
        if (result.status === 'fulfilled' && result.value) {
          this.users.push(result.value);
        }
      }
    }

    this.log(`Total de usuarios criados/logados: ${this.users.length}`, 'success');

    // Fase 2: Simular comportamento
    this.log('=== FASE 2: Simulando comportamento dos usuarios ===', 'info');

    // Dividir usuarios em batches
    const batches: SimulatedUser[][] = [];
    for (let i = 0; i < this.users.length; i += SIMULATION_CONFIG.maxConcurrency) {
      batches.push(this.users.slice(i, i + SIMULATION_CONFIG.maxConcurrency));
    }

    // Executar batches
    for (let i = 0; i < batches.length; i++) {
      this.log(`Executando batch ${i + 1}/${batches.length}`, 'metric');
      await this.runBatch(batches[i]);
    }

    // Fase 3: Segunda rodada de interacoes (para gerar mais matches)
    this.log('=== FASE 3: Segunda rodada de interacoes ===', 'info');

    // Embaralhar usuarios e fazer mais interacoes
    const shuffledUsers = [...this.users].sort(() => Math.random() - 0.5);
    for (let i = 0; i < shuffledUsers.length; i += SIMULATION_CONFIG.maxConcurrency) {
      const batch = shuffledUsers.slice(i, i + SIMULATION_CONFIG.maxConcurrency);
      await this.runBatch(batch);
    }

    // Gerar relatorio
    this.generateReport();
  }
}

// Executar simulacao
async function main() {
  const simulation = new UserSimulation();
  await simulation.run();
}

main().catch(console.error);
