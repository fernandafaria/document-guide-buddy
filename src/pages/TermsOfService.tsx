import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const TermsOfService = () => {
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

        <h1 className="text-4xl font-bold text-foreground mb-8">Termos de Serviço</h1>
        
        <div className="prose prose-lg max-w-none space-y-6 text-muted-foreground">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Aceitação dos Termos</h2>
            <p>
              Ao acessar e usar o aplicativo YO!, você concorda em cumprir e estar vinculado aos seguintes termos e condições de uso. 
              Se você não concordar com qualquer parte destes termos, não use nosso aplicativo.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Descrição do Serviço</h2>
            <p>
              O YO! é uma plataforma social baseada em localização que permite aos usuários fazer check-in em locais, 
              descobrir outros usuários próximos e interagir através de funcionalidades de matching e chat.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. Elegibilidade</h2>
            <p>
              Você deve ter pelo menos 18 anos de idade para usar o YO!. Ao criar uma conta, você declara que tem 
              idade legal para formar um contrato vinculativo e não está impedido de usar o serviço sob as leis aplicáveis.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Conta de Usuário</h2>
            <p className="mb-3">Ao criar uma conta no YO!, você concorda em:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Fornecer informações verdadeiras, precisas e completas</li>
              <li>Manter a segurança de sua senha e conta</li>
              <li>Notificar-nos imediatamente sobre qualquer uso não autorizado de sua conta</li>
              <li>Ser responsável por todas as atividades que ocorrem em sua conta</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Conduta do Usuário</h2>
            <p className="mb-3">Você concorda em NÃO:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Usar o serviço para fins ilegais ou não autorizados</li>
              <li>Assediar, abusar ou prejudicar outros usuários</li>
              <li>Publicar conteúdo ofensivo, discriminatório ou impróprio</li>
              <li>Se passar por outra pessoa ou entidade</li>
              <li>Coletar informações de outros usuários sem consentimento</li>
              <li>Usar bots, scripts ou automação não autorizada</li>
              <li>Interferir no funcionamento adequado do serviço</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Check-ins e Localização</h2>
            <p>
              Ao fazer check-in em locais através do YO!, você entende que sua localização será compartilhada com outros 
              usuários próximos. Os check-ins expiram automaticamente após 30 minutos de inatividade. Você é responsável 
              por garantir que seus check-ins sejam precisos e apropriados.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Conteúdo do Usuário</h2>
            <p>
              Você mantém a propriedade de todo o conteúdo que publica no YO! (fotos, mensagens, informações de perfil). 
              No entanto, ao publicar conteúdo, você nos concede uma licença mundial, não exclusiva, livre de royalties 
              para usar, exibir e distribuir esse conteúdo em conexão com o serviço.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">8. Privacidade e Dados</h2>
            <p>
              O uso de suas informações pessoais é regido por nossa Política de Privacidade. Ao usar o YO!, você concorda 
              com a coleta e uso de suas informações conforme descrito na Política de Privacidade.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">9. Suspensão e Cancelamento</h2>
            <p>
              Reservamos o direito de suspender ou encerrar sua conta a qualquer momento, sem aviso prévio, por violação 
              destes termos ou por qualquer outro motivo que consideremos apropriado. Você pode encerrar sua conta a 
              qualquer momento através das configurações do aplicativo.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">10. Isenção de Garantias</h2>
            <p>
              O YO! é fornecido "como está" e "conforme disponível". Não garantimos que o serviço será ininterrupto, 
              seguro ou livre de erros. Você usa o serviço por sua própria conta e risco.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">11. Limitação de Responsabilidade</h2>
            <p>
              Em nenhuma circunstância o YO!, seus diretores, funcionários ou parceiros serão responsáveis por quaisquer 
              danos diretos, indiretos, incidentais, especiais ou consequenciais resultantes do uso ou incapacidade de 
              usar o serviço.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">12. Modificações dos Termos</h2>
            <p>
              Reservamos o direito de modificar estes termos a qualquer momento. Notificaremos os usuários sobre mudanças 
              significativas através do aplicativo. O uso continuado do serviço após as modificações constitui aceitação 
              dos novos termos.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">13. Lei Aplicável</h2>
            <p>
              Estes termos serão regidos e interpretados de acordo com as leis do Brasil, sem consideração a conflitos 
              de disposições legais.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">14. Contato</h2>
            <p>
              Para questões sobre estes Termos de Serviço, entre em contato conosco através do aplicativo ou pelo email 
              suporte@yoapp.com.
            </p>
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

export default TermsOfService;
