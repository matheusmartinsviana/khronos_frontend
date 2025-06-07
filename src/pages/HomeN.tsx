import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Home2() {
  const [transition, setTransition] = useState({
    width: 'full',
    hidden: ''
  })
  
  const navigate = useNavigate();

  const handleGoToLogin = () => {
    setTransition({
      width: '2/5',
      hidden: 'hidden'
    }); // fade out
    setTimeout(() => {
      navigate("/login");
    }, 500);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <div className={`relative z-10 flex items-center justify-center h-full bg-gradient-to-br from-red-700 to-red-900 transition-all duration-500 w-${transition.width}`}>
        <div className={`text-center text-white ${transition.hidden} space-y-10 max-w-xl`}>
          <h1 className="text-4xl font-bold">
            Bem-vindo(a) ao sistema de gerenciamento de vendas!
          </h1>

          <p className="text-md italic opacity-80">
            Venda mais, gerencie melhor!
          </p>

          <p className="text-lg leading-relaxed">
            Aqui você poderá acompanhar suas transações, gerenciar produtos,
            analisar relatórios e otimizar seus resultados de forma simples e
            eficiente.
          </p>

          <button
            // ToDo: Navegar no padrão do sistema
            onClick={handleGoToLogin}
            className="w-56 h-11 py-2 bg-white text-red-700 text-lg font-bold rounded-md shadow-md hover:bg-gray-100 transition hover:scale-105"
          >
            Acessar
          </button>
        </div>
      </div>

    </div>
  );
}