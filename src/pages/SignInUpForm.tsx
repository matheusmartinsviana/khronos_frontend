import React, { useState } from "react";

function SalesSystemWelcome() {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      { }
      <div className="absolute inset-0 bg-gradient-to-br from-red-700 to-red-900"></div>

      { }
      <div className="absolute inset-0 opacity-10 bg-[url('https://www.heropatterns.com/static/media/hexagons.4be3dbb8.svg')] bg-repeat"></div>

      { }
      <div className="relative z-10 flex items-center justify-center h-full">
        {!showLogin ? (
          <div className="text-center text-white space-y-10 max-w-xl">
            <h1 className="text-4xl font-bold">
              Bem-vindo(a) ao sistema de gerenciamento de vendas!
            </h1>

            { }
            <p className="text-md italic opacity-80">
              Venda mais, gerencie melhor!
            </p>

            <p className="text-lg leading-relaxed">
              Aqui você poderá acompanhar suas transações, gerenciar produtos,
              analisar relatórios e otimizar seus resultados de forma simples e
              eficiente.
            </p>

            <button
              onClick={() => setShowLogin(true)}
              className="w-56 h-11 py-2 bg-white text-red-700 text-lg font-bold rounded-md shadow-md hover:bg-gray-100 transition-transform transform hover:scale-105"
            >
              Acessar
            </button>
          </div>
        ) : (

          <div className="flex w-full h-full">
            {/* Coluna vermelha */}
            <div className="w-2/5 bg-red-700 text-white flex flex-col justify-center items-center ">
              <div className="h-9/12 flex flex-col justify-center items-center">
                <h2 className="text-5xl font-bold text-center">
                  Bem-vindo(a) novamente!
                </h2>
                <p className="text-center max-w-sm leading-relaxed p-10 text-xl">
                  Continue acompanhando suas vendas e gerenciando com eficiência.
                </p>
              </div>
              <span className="text-4xl font-extrabold">KHRONOS</span>
            </div>

            {/* Coluna branca com formulário */}
            <div className="w-3/5 bg-gray-50 flex flex-col justify-center items-center p-10">
              <h2 className="text-2xl font-bold mb-6">Efetue o login</h2>

              <form className="w-full max-w-md space-y-4">
                <div>
                  <label className="block mb-1 text-gray-700">
                    Informe o seu e-mail
                  </label>
                  <input
                    type="email"
                    className="w-full p-3 border rounded-md bg-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Seu e-mail"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-gray-700">
                    Informe a sua senha
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      className="w-full p-3 border rounded-md bg-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Sua senha"
                    />
                    <span className="material-symbols-outlined absolute right-3 top-3 text-gray-400 cursor-pointer">
                      visibility_off
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-red-400 hover:bg-red-500 text-white font-semibold py-3 rounded-md shadow-md transition-transform transform hover:scale-105"
                >
                  Login
                </button>
              </form>

              <p className="mt-4 text-gray-600">
                Ainda não tem conta?{" "}
                <a href="#" className="text-red-600 underline">
                  Cadastre-se aqui
                </a>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SalesSystemWelcome;
