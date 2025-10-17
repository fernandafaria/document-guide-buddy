import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const PrivacyPolicy = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    // Se veio de configurações ou ajuda, volta lá. Caso contrário, vai para home
    if (location.state?.from) {
      navigate(location.state.from);
    } else if (document.referrer.includes('/settings')) {
      navigate('/settings');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <Button
          variant="ghost"
          onClick={handleBack}
          className="mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Voltar
        </Button>

        <h1 className="text-4xl font-bold text-foreground mb-8">Política de Privacidade</h1>
        
        <div className="prose prose-lg max-w-none space-y-6 text-muted-foreground">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Introdução</h2>
            <p>
              O YO! está comprometido em proteger sua privacidade. Esta Política de Privacidade explica como coletamos, 
              usamos, divulgamos e protegemos suas informações quando você usa nosso aplicativo.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Informações que Coletamos</h2>
            
            <h3 className="text-xl font-semibold text-foreground mb-3 mt-4">2.1 Informações Fornecidas por Você</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Nome, email e número de telefone</li>
              <li>Data de nascimento e gênero</li>
              <li>Fotos de perfil</li>
              <li>Informações de biografia e interesses</li>
              <li>Preferências de descoberta</li>
              <li>Mensagens e conteúdo de chat</li>
            </ul>

            <h3 className="text-xl font-semibold text-foreground mb-3 mt-4">2.2 Informações Coletadas Automaticamente</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Localização GPS precisa (quando você faz check-in)</li>
              <li>Informações do dispositivo (modelo, sistema operacional, identificadores únicos)</li>
              <li>Dados de uso (funcionalidades acessadas, tempo de uso)</li>
              <li>Endereço IP e dados de conexão</li>
              <li>Cookies e tecnologias similares</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. Como Usamos Suas Informações</h2>
            <p className="mb-3">Usamos suas informações para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Fornecer, operar e manter o serviço YO!</li>
              <li>Processar check-ins e mostrar sua localização para usuários próximos</li>
              <li>Facilitar matches e comunicação entre usuários</li>
              <li>Personalizar sua experiência no aplicativo</li>
              <li>Enviar notificações sobre atividades relevantes</li>
              <li>Melhorar nosso serviço e desenvolver novos recursos</li>
              <li>Detectar e prevenir fraudes e abusos</li>
              <li>Cumprir obrigações legais</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Compartilhamento de Informações</h2>
            
            <h3 className="text-xl font-semibold text-foreground mb-3 mt-4">4.1 Com Outros Usuários</h3>
            <p>
              Seu perfil (nome, fotos, idade, bio, interesses) é visível para outros usuários do YO!. Quando você faz 
              check-in em um local, sua localização aproximada é compartilhada com usuários próximos por até 30 minutos.
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-3 mt-4">4.2 Com Prestadores de Serviços</h3>
            <p>
              Compartilhamos informações com provedores terceiros que nos ajudam a operar o serviço, como serviços de 
              hospedagem, análise de dados e suporte ao cliente.
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-3 mt-4">4.3 Por Razões Legais</h3>
            <p>
              Podemos divulgar suas informações se exigido por lei ou se acreditarmos de boa-fé que tal ação é necessária 
              para cumprir uma obrigação legal, proteger nossos direitos ou a segurança de usuários.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Localização e Check-ins</h2>
            <p>
              Coletamos sua localização GPS precisa apenas quando você opta por fazer check-in em um local. Você pode 
              controlar o acesso à localização através das configurações do seu dispositivo. Os check-ins expiram 
              automaticamente após 30 minutos de inatividade, removendo sua presença do local.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Retenção de Dados</h2>
            <p>
              Mantemos suas informações pessoais apenas pelo tempo necessário para os fins descritos nesta política ou 
              conforme exigido por lei. Check-ins expiram automaticamente após 30 minutos. Você pode solicitar a exclusão 
              de sua conta a qualquer momento.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Segurança de Dados</h2>
            <p>
              Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações contra acesso 
              não autorizado, alteração, divulgação ou destruição. No entanto, nenhum método de transmissão pela Internet 
              é 100% seguro.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">8. Seus Direitos</h2>
            <p className="mb-3">Você tem o direito de:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Acessar suas informações pessoais</li>
              <li>Corrigir informações imprecisas</li>
              <li>Solicitar a exclusão de suas informações</li>
              <li>Opor-se ao processamento de suas informações</li>
              <li>Solicitar a portabilidade de seus dados</li>
              <li>Revogar consentimentos a qualquer momento</li>
            </ul>
            <p className="mt-3">
              Para exercer esses direitos, entre em contato conosco através das configurações do aplicativo ou pelo 
              email privacidade@yoapp.com.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">9. Menores de Idade</h2>
            <p>
              O YO! não é destinado a menores de 18 anos. Não coletamos intencionalmente informações de menores. Se 
              tomarmos conhecimento de que coletamos dados de um menor, tomaremos medidas para excluir essas informações.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">10. Transferências Internacionais</h2>
            <p>
              Suas informações podem ser transferidas e mantidas em servidores localizados fora do seu país de residência, 
              onde as leis de proteção de dados podem ser diferentes. Ao usar o YO!, você consente com essas transferências.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">11. Cookies e Tecnologias Similares</h2>
            <p>
              Usamos cookies e tecnologias similares para coletar informações de uso e melhorar nosso serviço. Você pode 
              controlar cookies através das configurações do seu navegador, mas isso pode afetar a funcionalidade do 
              aplicativo.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">12. Alterações a Esta Política</h2>
            <p>
              Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos você sobre mudanças 
              significativas através do aplicativo ou por email. Recomendamos que você revise esta política regularmente.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">13. Contato</h2>
            <p>
              Para questões sobre esta Política de Privacidade ou sobre como tratamos suas informações, entre em contato:
            </p>
            <ul className="list-none pl-0 space-y-1 mt-3">
              <li><strong>Email:</strong> privacidade@yoapp.com</li>
              <li><strong>Através do aplicativo:</strong> Configurações &gt; Suporte</li>
            </ul>
          </section>

          <section className="pt-6 border-t border-border">
            <p className="text-sm">
              <strong>Última atualização:</strong> {new Date().toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
