"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Dog, Cat, Bird, User, LogOut, PawPrint, Loader2, Syringe } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { animalsAPI, authAPI, type AnimalResponse } from "@/lib/api"
import { inferAnimalType, getAnimalTypeLabel } from "@/lib/animal-utils"

const getTypeIcon = (animal: AnimalResponse) => {
  const type = inferAnimalType(animal)
  switch (type) {
    case "Cachorro":
      return <Dog className="w-6 h-6" />
    case "Gato":
      return <Cat className="w-6 h-6" />
    case "Ave":
      return <Bird className="w-6 h-6" />
    default:
      return <PawPrint className="w-6 h-6" />
  }
}

const getVaccinationStatusLabel = (status: string) => {
  switch (status) {
    case "Vacinado":
      return "Vacinado"
    case "Não Vacinado":
      return "Não Vacinado"
    case "Vacinação Pendente":
      return "Pendente"
    default:
      return "Desconhecido"
  }
}

const getVaccinationStatusVariant = (status: string) => {
  switch (status) {
    case "Vacinado":
      return "default"
    case "Não Vacinado":
      return "destructive"
    case "Vacinação Pendente":
      return "secondary"
    default:
      return "outline"
  }
}

export default function Dashboard() {
  const [pets, setPets] = useState<AnimalResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    // Verificar se está autenticado
    if (!authAPI.isAuthenticated()) {
      router.push("/")
      return
    }

    loadPets()
  }, [router])

  const loadPets = async () => {
    try {
      setIsLoading(true)
      setError("")

      // Usar o endpoint específico do usuário
      const petsData = await animalsAPI.getMy()
      setPets(petsData)
    } catch (error) {
      console.error("Erro ao carregar pets:", error)
      setError("Erro ao carregar seus pets. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    authAPI.logout()
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="bg-blue-500 p-2 rounded-lg">
                <PawPrint className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800">MeuPet</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/profile">
                <Button variant="ghost" size="sm">
                  <User className="w-4 h-4 mr-2" />
                  Perfil
                </Button>
              </Link>
              <Link href="/vaccines/manage">
                <Button variant="ghost" size="sm">
                  <Syringe className="w-4 h-4 mr-2" />
                  Vacinas
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Meus Pets</h2>
          <p className="text-gray-600">Gerencie todos os seus animais de estimação</p>
        </div>

        {/* Add Pet Button */}
        <div className="mb-8">
          <Link href="/pet/new">
            <Button size="lg" className="bg-green-500 hover:bg-green-600 text-white shadow-lg">
              <Plus className="w-5 h-5 mr-2" />
              Adicionar Novo Pet
            </Button>
          </Link>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <span className="ml-2 text-gray-600">Carregando seus pets...</span>
          </div>
        )}

        {/* Pets Grid */}
        {!isLoading && pets.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {pets.map((pet) => (
              <Link key={pet.id} href={`/pet/${pet.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer border-0 shadow-md">
                  <CardContent className="p-6">
                    <div className="text-center">
                      {/* Pet Photo */}
                      <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden bg-gray-100">
                        <img
                          src="/placeholder.svg?height=96&width=96"
                          alt={pet.nome}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Pet Name */}
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">{pet.nome}</h3>

                      {/* Pet Type - Usando a função de inferência */}
                      <div className="flex items-center justify-center gap-2 mb-3 text-gray-600">
                        {getTypeIcon(pet)}
                        <span className="text-sm">{getAnimalTypeLabel(pet)}</span>
                      </div>

                      {/* Breed */}
                      <p className="text-sm text-gray-500 mb-4">{pet.raca}</p>

                      {/* Vaccination Status */}
                      <Badge
                        variant={getVaccinationStatusVariant(pet.vacinado)}
                        className={
                          pet.vacinado === "Vacinado"
                            ? "bg-green-500 hover:bg-green-600"
                            : pet.vacinado === "Vacinação Pendente"
                              ? "bg-yellow-500 hover:bg-yellow-600"
                              : "bg-red-500 hover:bg-red-600"
                        }
                      >
                        {getVaccinationStatusLabel(pet.vacinado)}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && pets.length === 0 && !error && (
          <div className="text-center py-12">
            <PawPrint className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Nenhum pet cadastrado</h3>
            <p className="text-gray-500 mb-6">Adicione seu primeiro pet para começar</p>
            <Link href="/pet/new">
              <Button className="bg-blue-500 hover:bg-blue-600">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Pet
              </Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
