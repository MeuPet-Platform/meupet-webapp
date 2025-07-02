"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, PawPrint, User, Mail, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { usersAPI, authAPI, type UsuarioResponse } from "@/lib/api"

export default function ProfilePage() {
  const [user, setUser] = useState<UsuarioResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    if (!authAPI.isAuthenticated()) {
      router.push("/")
      return
    }

    loadUserProfile()
  }, [router])

  const loadUserProfile = async () => {
    try {
      setIsLoading(true)
      setError("")

      const userId = authAPI.getUserId()
      if (!userId) {
        throw new Error("ID do usuário não encontrado")
      }

      const userData = await usersAPI.getById(userId)
      setUser(userData)
    } catch (error) {
      console.error("Erro ao carregar perfil:", error)
      setError("Erro ao carregar os dados do perfil.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <span className="ml-2 text-gray-600">Carregando perfil...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="mr-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="bg-blue-500 p-2 rounded-lg">
                <PawPrint className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800">MeuPet</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Meu Perfil</h2>
          <p className="text-gray-600">Informações da sua conta</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {user && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Informações do Usuário */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-xl text-gray-800 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Informações Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{user.nome}</h3>
                    <p className="text-gray-600">Tutor de pets</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <User className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Nome</p>
                      <p className="font-medium">{user.nome}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Mail className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">E-mail</p>
                      <p className="font-medium">{user.email}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ações Rápidas */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-xl text-gray-800">Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link href="/dashboard">
                  <Button className="w-full bg-blue-500 hover:bg-blue-600 justify-start">
                    <PawPrint className="w-4 h-4 mr-2" />
                    Ver Meus Pets
                  </Button>
                </Link>

                <Link href="/pet/new">
                  <Button className="w-full bg-green-500 hover:bg-green-600 justify-start">
                    <User className="w-4 h-4 mr-2" />
                    Adicionar Novo Pet
                  </Button>
                </Link>

                <Link href="/vaccines/manage">
                  <Button className="w-full bg-purple-500 hover:bg-purple-600 justify-start">
                    <Mail className="w-4 h-4 mr-2" />
                    Gerenciar Vacinas
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
