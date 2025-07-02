"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Heart, PawPrint, Loader2, UserPlus } from "lucide-react"
import { authAPI } from "@/lib/api"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await authAPI.login({
        email,
        senha: password,
      })

      // Salvar o token no localStorage
      authAPI.saveToken(response.token)

      // Redirecionar para o dashboard
      router.push("/dashboard")
    } catch (error) {
      console.error("Erro no login:", error)
      setError(error instanceof Error ? error.message : "Erro no login. Tente novamente.")
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
          <p className="text-gray-600">Gerencie seus pets com carinho</p>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-gray-800">Entrar</CardTitle>
            <CardDescription>Acesse sua conta para cuidar dos seus pets</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="border-gray-300 focus:border-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="border-gray-300 focus:border-blue-500"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  "Entrar"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 mb-4">Ainda não tem uma conta?</p>
              <Link href="/register">
                <Button variant="outline" className="w-full bg-transparent" disabled={isLoading}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Cadastrar Novo Usuário
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-sm text-gray-500">
          <Heart className="w-4 h-4 inline mr-1 text-red-400" />
          Feito com amor para seus pets
        </div>
      </div>
    </div>
  )
}
