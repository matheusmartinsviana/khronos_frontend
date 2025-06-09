import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { api } from "@/api"
import { Eye, EyeOff, Mail, Lock, Loader2 } from "lucide-react"
import posthog from "posthog-js"

export default function Login() {
  const { login } = useAuth()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [emailError, setEmailError] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Validação em tempo real do email
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email) {
      setEmailError("")
    } else if (!emailRegex.test(email)) {
      setEmailError("Por favor, insira um e-mail válido")
    } else {
      setEmailError("")
    }
  }

  // Validação em tempo real da senha
  const validatePassword = (password: string) => {
    if (!password) {
      setPasswordError("")
    } else if (password.length < 6) {
      setPasswordError("A senha deve ter pelo menos 6 caracteres")
    } else {
      setPasswordError("")
    }
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEmail(value)
    validateEmail(value)
    if (error) setError("")
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setPassword(value)
    validatePassword(value)
    if (error) setError("")
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // Validação final
    validateEmail(email)
    validatePassword(password)

    if (emailError || passwordError || !email || !password) {
      setIsLoading(false)
      return
    }

    try {
      const response = await api.post("/auth/login", { email, password })
      const { token } = response.data

      if (token) {
        login(token)
        posthog.identify(email, {
          email: email,
        })
      } else {
        setError("Token não recebido da API.")
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Erro ao fazer login, tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const isFormValid = email && password && !emailError && !passwordError

  return (
    <div className="min-h-screen flex flex-col lg:flex-row overflow-hidden">
      {/* Coluna Vermelha com animações */}
      <div
        className={`lg:w-2/5 bg-gradient-to-br from-red-600 via-red-700 to-red-900 text-white flex flex-col justify-center items-center p-8 lg:p-16 relative overflow-hidden transition-all duration-1000 ${mounted ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"}`}
      >
        {/* Efeito de fundo animado */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-transparent animate-pulse"></div>
        <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-bounce"></div>
        <div className="absolute bottom-20 left-10 w-24 h-24 bg-white/5 rounded-full blur-lg animate-pulse delay-1000"></div>

        <div className="relative z-10 text-center">
          <div className="mb-8 transform transition-all duration-700 delay-300">
            <h1 className="text-5xl lg:text-6xl font-black mb-6 leading-tight bg-gradient-to-r from-white to-red-100 bg-clip-text text-transparent">
              Bem-vindo
            </h1>
            <div className="w-24 h-1 bg-white/80 mx-auto rounded-full mb-6"></div>
            <p className="text-xl lg:text-2xl max-w-md leading-relaxed text-red-50">
              Continue acompanhando suas vendas e gerenciando com eficiência.
            </p>
          </div>

          <div className="transform transition-all duration-700 delay-500">
            <span className="text-4xl lg:text-5xl font-black tracking-wider select-none bg-gradient-to-r from-white via-red-100 to-white bg-clip-text text-transparent">
              KHRONOS
            </span>
          </div>
        </div>
      </div>

      {/* Formulário Login com animações */}
      <div
        className={`lg:w-3/5 bg-gradient-to-br from-gray-50 to-white flex flex-col justify-center items-center p-8 lg:p-16 transition-all duration-1000 delay-200 ${mounted ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}`}
      >
        <div className="w-full max-w-md">
          <div className="text-center mb-8 transform transition-all duration-700 delay-400">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-2">Efetue o login</h2>
            <p className="text-gray-600">Acesse sua conta para continuar</p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="w-full space-y-6 bg-white p-8 rounded-2xl shadow-2xl border border-gray-100 transform transition-all duration-700 delay-600 hover:shadow-3xl"
            noValidate
          >
            {/* Campo Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                E-mail
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail
                    className={`h-5 w-5 transition-colors duration-200 ${email ? "text-red-500" : "text-gray-400"}`}
                  />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="exemplo@dominio.com"
                  required
                  className={`w-full pl-10 pr-4 py-4 border-2 rounded-xl bg-gray-50/50 backdrop-blur-sm
                    focus:outline-none focus:bg-white transition-all duration-300 ease-in-out
                    ${emailError
                      ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/20"
                      : email
                        ? "border-green-300 focus:border-green-500 focus:ring-4 focus:ring-green-500/20"
                        : "border-gray-200 focus:border-red-500 focus:ring-4 focus:ring-red-500/20"
                    }
                    hover:border-gray-300 hover:shadow-md`}
                />
              </div>
              {emailError && (
                <p className="text-red-500 text-sm mt-1 animate-in slide-in-from-top-1 duration-200">{emailError}</p>
              )}
            </div>

            {/* Campo Senha */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Senha
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock
                    className={`h-5 w-5 transition-colors duration-200 ${password ? "text-red-500" : "text-gray-400"}`}
                  />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={handlePasswordChange}
                  placeholder="Sua senha"
                  required
                  className={`w-full pl-10 pr-12 py-4 border-2 rounded-xl bg-gray-50/50 backdrop-blur-sm
                    focus:outline-none focus:bg-white transition-all duration-300 ease-in-out
                    ${passwordError
                      ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/20"
                      : password
                        ? "border-green-300 focus:border-green-500 focus:ring-4 focus:ring-green-500/20"
                        : "border-gray-200 focus:border-red-500 focus:ring-4 focus:ring-red-500/20"
                    }
                    hover:border-gray-300 hover:shadow-md`}
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-red-600 transition-all duration-200 focus:outline-none focus:text-red-600 hover:scale-110"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {passwordError && (
                <p className="text-red-500 text-sm mt-1 animate-in slide-in-from-top-1 duration-200">{passwordError}</p>
              )}
            </div>

            {/* Mensagem de erro */}
            {error && (
              <div className="animate-in slide-in-from-top-2 duration-300">
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                  <p className="text-red-700 font-medium text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* Botão submit */}
            <button
              type="submit"
              disabled={!isFormValid || isLoading}
              className={`w-full py-4 rounded-xl font-semibold text-white shadow-lg
                transition-all duration-300 ease-in-out transform
                ${isFormValid && !isLoading
                  ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]"
                  : "bg-gray-300 cursor-not-allowed"
                }
                focus:outline-none focus:ring-4 focus:ring-red-500/30`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Entrando...</span>
                </div>
              ) : (
                "Entrar"
              )}
            </button>
          </form>

          {/* Link de cadastro */}
          <div className="mt-8 text-center transform transition-all duration-700 delay-800">
            <p className="text-gray-600">
              Ainda não tem conta?{" "}
              <a
                href="#"
                className="text-red-600 font-semibold hover:text-red-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-600/50 rounded-md px-1 hover:underline"
              >
                Cadastre-se aqui
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
