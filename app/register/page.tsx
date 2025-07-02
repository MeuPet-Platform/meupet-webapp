"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, PawPrint, Loader2, UserPlus } from "lucide-react"
import { authAPI } from "@/lib/api"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
    confirmSenha: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    // Validações
    if (formData.senha !== formData.confirmSenha) {
      setError("As senhas não coincidem.")
      setIsLoading(false)
      return
    }

    if (formData.senha.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.")
      setIsLoading(false)
      return
    }

    try {
      await authAPI.register({
        nome: formData.nome,
        email: formData.email,
        senha: formData.senha,
      })

      setSuccess("Usuário cadastrado com sucesso! Redirecionando para o login...")

      // Redirecionar para o login após 2 segundos
      setTimeout(() => {
        router.push("/")
      }, 2000)
    } catch (error) {
      console.error("Erro no cadastro:", error)
      setError(error instanceof Error ? error.message : "Erro no cadastro. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="bg-blue-500 p-3 rounded-full">
              <PawPrint className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">MeuPet</h1>
          </div>
          <p className="text-gray-600">Crie sua conta para começar</p>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-gray-800">Cadastrar</CardTitle>
            <CardDescription>Preencha seus dados para criar uma conta</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-green-200 bg-green-50">
                  <AlertDescription className="text-green-800">{success}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="nome">Nome Completo</Label>
                <Input
                  id="nome"
                  type="text"
                  placeholder="Seu nome completo"
                  value={formData.nome}
                  onChange={(e) => handleInputChange("nome", e.target.value)}
                  required
                  disabled={isLoading}
                  className="border-gray-300 focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                  disabled={isLoading}
                  className="border-gray-300 focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="senha">Senha</Label>
                <Input
                  id="senha"
                  type="password"
                  placeholder="••••••••"
                  value={formData.senha}
                  onChange={(e) => handleInputChange("senha", e.target.value)}
                  required
                  disabled={isLoading}
                  className="border-gray-300 focus:border-blue-500"
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmSenha">Confirmar Senha</Label>
                <Input
                  id="confirmSenha"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmSenha}
                  onChange={(e) => handleInputChange("confirmSenha", e.target.value)}
                  required
                  disabled={isLoading}
                  className="border-gray-300 focus:border-blue-500"
                  minLength={6}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-green-500 hover:bg-green-600 text-white"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Cadastrando...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Cadastrar
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link href="/">
                <Button variant="ghost" disabled={isLoading}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar ao Login
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
