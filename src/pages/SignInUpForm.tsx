import { useState } from "react";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <div className="relative z-10 flex items-center justify-center h-full">

          <div className="flex w-full h-full">
            {/* Coluna vermelha */}
            <div className="w-2/5 bg-gradient-to-br from-red-700 to-red-900 text-white flex flex-col justify-center items-center">
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

            {/* Formulário Login */}
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
                      type={showPassword ? "text" : "password"}
                      className="w-full p-3 border rounded-md bg-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Sua senha"
                    />
                    <span
                      className="material-symbols-outlined absolute right-3 top-3 text-gray-400 cursor-pointer select-none"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-red-400 hover:bg-gradient-to-br from-red-600 to-red-700 text-white font-semibold py-3 rounded-md shadow-md transition-transform transform hover:scale-105"
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
      </div>
    </div>
  );
}
