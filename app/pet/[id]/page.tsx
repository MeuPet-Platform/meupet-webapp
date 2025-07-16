"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  ArrowLeft,
  Edit,
  Plus,
  Dog,
  Cat,
  Bird,
  PawPrint,
  Calendar,
  Weight,
  Ruler,
  Loader2,
  Trash2,
  User,
} from "lucide-react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { animalsAPI, vaccinesAPI, authAPI, type AnimalResponse, type VacinaResponse } from "@/lib/api"
import { VaccinationModal } from "@/components/vaccination-modal"
import { inferAnimalType, getAnimalTypeLabel, isDog, isCat, isBird } from "@/lib/animal-utils"
import { formatDateToBR } from "@/lib/date-utils"

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

// NOVA FUNÇÃO: Lógica detalhada de status de revacinação - CORRIGIDA
const getVaccinationDetailedStatus = (
  currentVaccination: VacinaResponse,
  allVaccinations: VacinaResponse[],
): { label: string; variant: "default" | "destructive" | "secondary" | "outline" } => {
  // Se não há data de revacinação definida, considerar como "Vacinado" (dose única ou não requer revacinação)
  if (!currentVaccination.revacina) {
    return { label: "Vacinado", variant: "default" }
  }

  const today = new Date()
  const revacinaDate = new Date(currentVaccination.revacina)
  const currentVaccinaDate = new Date(currentVaccination.dataVacina)

  // VERIFICAR SE A REVACINAÇÃO FOI COBERTA POR OUTRA VACINA DO MESMO TIPO
  const wasCoveredByLaterVaccination = allVaccinations.some((otherVaccination) => {
    // Não comparar com a mesma vacina
    if (otherVaccination.id === currentVaccination.id) {
      return false
    }

    // CORREÇÃO: Descartar se NÃO for do mesmo tipo (antes estava descartando se fosse do mesmo tipo)
    if (otherVaccination.tipoVacina !== currentVaccination.tipoVacina) {
      return false
    }

    const otherVaccinaDate = new Date(otherVaccination.dataVacina)

    // A outra vacina deve ter sido aplicada DEPOIS da vacina atual
    // E ANTES OU NO DIA da data de revacinação prevista
    return (
      otherVaccinaDate > currentVaccinaDate && // Aplicada depois da vacina atual
      otherVaccinaDate <= revacinaDate // Aplicada antes ou no dia da revacinação prevista
    )
  })

  // Se foi coberta por outra vacina, considerar como "Vacinado"
  if (wasCoveredByLaterVaccination) {
    return { label: "Vacinado", variant: "default" }
  }

  // APLICAR LÓGICA TRADICIONAL DE STATUS BASEADA NA DATA DE REVACINAÇÃO
  const isOverdue = revacinaDate < today
  const isUpcoming = revacinaDate <= new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000) // Próximos 30 dias

  if (isOverdue) {
    return { label: "Atrasada", variant: "destructive" }
  }

  if (isUpcoming) {
    return { label: "Próxima", variant: "secondary" }
  }

  // Revacinação está no futuro (mais de 30 dias)
  return { label: "Em dia", variant: "default" }
}

export default function PetDetails() {
  const params = useParams()
  const router = useRouter()
  const petId = Number.parseInt(params.id as string)

  const [pet, setPet] = useState<AnimalResponse | null>(null)
  const [vaccinations, setVaccinations] = useState<VacinaResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingVaccinations, setIsLoadingVaccinations] = useState(true)
  const [error, setError] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (!authAPI.isAuthenticated()) {
      router.push("/")
      return
    }

    if (petId) {
      loadPetDetails()
      loadVaccinations()
    }
  }, [petId, router])

  const loadPetDetails = async () => {
    try {
      setIsLoading(true)
      setError("")
      const petData = await animalsAPI.getById(petId)
      setPet(petData)
    } catch (error) {
      console.error("Erro ao carregar pet:", error)
      setError("Erro ao carregar os detalhes do pet.")
    } finally {
      setIsLoading(false)
    }
  }

  const loadVaccinations = async () => {
    try {
      setIsLoadingVaccinations(true)
      const vaccinationsData = await vaccinesAPI.getByAnimalId(petId)
      setVaccinations(vaccinationsData)
    } catch (error) {
      console.error("Erro ao carregar vacinas:", error)
    } finally {
      setIsLoadingVaccinations(false)
    }
  }

  const handleDeletePet = async () => {
    if (!pet || !confirm(`Tem certeza que deseja excluir ${pet.nome}? Esta ação não pode ser desfeita.`)) {
      return
    }

    try {
      setIsDeleting(true)
      await animalsAPI.delete(pet.id)
      router.push("/dashboard")
    } catch (error) {
      console.error("Erro ao deletar pet:", error)
      setError("Erro ao deletar o pet. Tente novamente.")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleVaccinationAdded = () => {
    loadVaccinations()
    loadPetDetails() // Recarregar para atualizar o status de vacinação
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <span className="ml-2 text-gray-600">Carregando detalhes do pet...</span>
        </div>
      </div>
    )
  }

  if (error && !pet) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!pet) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <PawPrint className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">Pet não encontrado</h3>
          <Link href="/dashboard">
            <Button>Voltar ao Dashboard</Button>
          </Link>
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Pet Info Card */}
          <div className="lg:col-span-1">
            <Card className="shadow-lg border-0">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden bg-gray-100">
                    <img
                      src="/placeholder.svg?height=128&width=128"
                      alt={pet.nome}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">{pet.nome}</h2>
                  <div className="flex items-center justify-center gap-2 mb-4 text-gray-600">
                    {getTypeIcon(pet)}
                    <span>{getAnimalTypeLabel(pet)}</span>
                  </div>
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

                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Ruler className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Raça</p>
                      <p className="font-medium">{pet.raca}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Ruler className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Porte</p>
                      <p className="font-medium">{pet.porte}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Weight className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Peso</p>
                      <p className="font-medium">{pet.peso} kg</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <User className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Sexo</p>
                      <p className="font-medium">{pet.sexo}</p>
                    </div>
                  </div>

                  {/* Campos específicos por tipo usando inferência */}
                  {isDog(pet) && (
                    <>
                      {pet.manso !== undefined && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-500 mb-1">Temperamento</p>
                          <p className="font-medium">{pet.manso ? "Manso" : "Não manso"}</p>
                        </div>
                      )}
                      {pet.necessitaFocinheira !== undefined && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-500 mb-1">Focinheira</p>
                          <p className="font-medium">{pet.necessitaFocinheira ? "Necessária" : "Não necessária"}</p>
                        </div>
                      )}
                    </>
                  )}

                  {isCat(pet) && (
                    <>
                      {pet.unhasCortadas !== undefined && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-500 mb-1">Unhas</p>
                          <p className="font-medium">{pet.unhasCortadas ? "Cortadas" : "Não cortadas"}</p>
                        </div>
                      )}
                      {pet.gostaDeAgua !== undefined && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-500 mb-1">Água</p>
                          <p className="font-medium">{pet.gostaDeAgua ? "Gosta de água" : "Não gosta de água"}</p>
                        </div>
                      )}
                      {pet.tamanhoPelo && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-500 mb-1">Tamanho dos Pelos</p>
                          <p className="font-medium">{pet.tamanhoPelo}</p>
                        </div>
                      )}
                    </>
                  )}

                  {isBird(pet) && (
                    <>
                      {pet.asaCortada !== undefined && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-500 mb-1">Asa</p>
                          <p className="font-medium">{pet.asaCortada ? "Cortada" : "Não cortada"}</p>
                        </div>
                      )}
                      {pet.emGaiola !== undefined && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-500 mb-1">Habitat</p>
                          <p className="font-medium">{pet.emGaiola ? "Vive em gaiola" : "Não vive em gaiola"}</p>
                        </div>
                      )}
                      {pet.exotico !== undefined && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-500 mb-1">Tipo</p>
                          <p className="font-medium">{pet.exotico ? "Exótico" : "Comum"}</p>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="mt-6 space-y-3">
                  <Link href={`/pet/${pet.id}/edit`}>
                    <Button className="w-full bg-blue-500 hover:bg-blue-600">
                      <Edit className="w-4 h-4 mr-2" />
                      Editar Animal
                    </Button>
                  </Link>
                  <Button variant="destructive" className="w-full" onClick={handleDeletePet} disabled={isDeleting}>
                    {isDeleting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Excluindo...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Excluir Pet
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Vaccination History */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl text-gray-800">Histórico de Vacinação</CardTitle>
                  <Button onClick={() => setIsModalOpen(true)} className="bg-green-500 hover:bg-green-600">
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Vacina
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingVaccinations ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                    <span className="ml-2 text-gray-600">Carregando vacinas...</span>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Vacina</TableHead>
                        <TableHead>Data de Aplicação</TableHead>
                        <TableHead>Próxima Dose</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {vaccinations.map((vaccination) => {
                        // USAR A NOVA FUNÇÃO DE STATUS DETALHADO
                        const status = getVaccinationDetailedStatus(vaccination, vaccinations)

                        return (
                          <TableRow key={vaccination.id}>
                            <TableCell className="font-medium">{vaccination.tipoVacina}</TableCell>
                            <TableCell>{formatDateToBR(vaccination.dataVacina)}</TableCell>
                            <TableCell>
                              {vaccination.revacina ? formatDateToBR(vaccination.revacina) : "Não definida"}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={status.variant}
                                className={
                                  status.variant === "destructive"
                                    ? "bg-red-500 hover:bg-red-600"
                                    : status.variant === "secondary"
                                      ? "bg-yellow-500 hover:bg-yellow-600"
                                      : status.variant === "default"
                                        ? "bg-green-500 hover:bg-green-600"
                                        : "bg-gray-500 hover:bg-gray-600"
                                }
                              >
                                {status.label}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                )}
                {!vaccinations.length && (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Nenhuma vacina registrada</p>
                    <p className="text-sm text-gray-400 mt-1">Adicione a primeira vacina para começar o histórico</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <VaccinationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        petId={petId}
        petName={pet.nome}
        onVaccinationAdded={handleVaccinationAdded}
      />
    </div>
  )
}
