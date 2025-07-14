"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, PawPrint, Plus, Trash2, Loader2, Syringe, Calendar } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { animalsAPI, vaccinesAPI, authAPI, type AnimalResponse, type VacinaResponse } from "@/lib/api"
import { VaccinationModal } from "@/components/vaccination-modal"
import { formatDateToBR } from "@/lib/date-utils"
import { getAnimalTypeLabel } from "@/lib/animal-utils"

export default function VaccineManagePage() {
  const router = useRouter()
  const [animals, setAnimals] = useState<AnimalResponse[]>([])
  const [selectedAnimalId, setSelectedAnimalId] = useState<number | null>(null)
  const [vaccinations, setVaccinations] = useState<VacinaResponse[]>([])
  const [isLoadingAnimals, setIsLoadingAnimals] = useState(true)
  const [isLoadingVaccinations, setIsLoadingVaccinations] = useState(false)
  const [isDeletingVaccine, setIsDeletingVaccine] = useState<number | null>(null)
  const [error, setError] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    if (!authAPI.isAuthenticated()) {
      router.push("/")
      return
    }

    loadAnimals()
  }, [router])

  const loadAnimals = async () => {
    try {
      setIsLoadingAnimals(true)
      setError("")
      console.log("[VaccineManage] Carregando animais...")

      // Usar getMy() para carregar apenas os animais do usuário logado
      const animalsData = await animalsAPI.getMy()
      console.log("[VaccineManage] Animais carregados:", animalsData)
      setAnimals(animalsData)
    } catch (error) {
      console.error("Erro ao carregar animais:", error)
      setError("Erro ao carregar a lista de animais.")
    } finally {
      setIsLoadingAnimals(false)
    }
  }

  const loadVaccinations = async (animalId: number) => {
    try {
      setIsLoadingVaccinations(true)
      setError("")
      console.log(`[VaccineManage] Carregando vacinas do animal ${animalId}...`)

      const vaccinationsData = await vaccinesAPI.getByAnimalId(animalId)
      console.log("[VaccineManage] Vacinas carregadas:", vaccinationsData)
      setVaccinations(vaccinationsData)
    } catch (error) {
      console.error("Erro ao carregar vacinas:", error)
      setError("Erro ao carregar as vacinas do animal.")
      setVaccinations([])
    } finally {
      setIsLoadingVaccinations(false)
    }
  }

  const handleAnimalSelect = (animalId: string) => {
    const id = Number.parseInt(animalId)
    setSelectedAnimalId(id)
    loadVaccinations(id)
  }

  const handleDeleteVaccine = async (vaccineId: number) => {
    if (!selectedAnimalId || !confirm("Tem certeza que deseja excluir esta vacina? Esta ação não pode ser desfeita.")) {
      return
    }

    try {
      setIsDeletingVaccine(vaccineId)
      console.log(`[VaccineManage] Deletando vacina ${vaccineId} do animal ${selectedAnimalId}...`)

      // Usar o novo método que requer animalId e vaccineId
      await vaccinesAPI.delete(selectedAnimalId, vaccineId)

      console.log("[VaccineManage] Vacina deletada com sucesso")

      // Recarregar a lista de vacinas
      await loadVaccinations(selectedAnimalId)
    } catch (error) {
      console.error("Erro ao deletar vacina:", error)
      setError("Erro ao deletar a vacina. Tente novamente.")
    } finally {
      setIsDeletingVaccine(null)
    }
  }

  const handleVaccinationAdded = () => {
    if (selectedAnimalId) {
      loadVaccinations(selectedAnimalId)
    }
  }

  const getSelectedAnimal = () => {
    return animals.find((animal) => animal.id === selectedAnimalId)
  }

  const getVaccinationStatus = (vaccination: VacinaResponse) => {
    if (!vaccination.revacina) return { label: "Sem revacinação", variant: "outline" as const }

    const nextDoseDate = new Date(vaccination.revacina)
    const today = new Date()
    const isOverdue = nextDoseDate < today
    const isUpcoming = nextDoseDate <= new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)

    if (isOverdue) return { label: "Atrasada", variant: "destructive" as const }
    if (isUpcoming) return { label: "Próxima", variant: "secondary" as const }
    return { label: "Em dia", variant: "default" as const }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - REMOVIDO o texto "Kong Gateway" */}
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
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
            <Syringe className="w-8 h-8" />
            Gerenciar Vacinas
          </h2>
          <p className="text-gray-600">Adicione e gerencie as vacinas dos seus pets</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Seleção de Animal */}
        <Card className="shadow-lg border-0 mb-8">
          <CardHeader>
            <CardTitle className="text-xl text-gray-800">Selecionar Animal</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingAnimals ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                <span className="ml-2 text-gray-600">Carregando animais...</span>
              </div>
            ) : animals.length > 0 ? (
              <Select onValueChange={handleAnimalSelect}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione um animal para gerenciar suas vacinas" />
                </SelectTrigger>
                <SelectContent>
                  {animals.map((animal) => (
                    <SelectItem key={animal.id} value={animal.id.toString()}>
                      {animal.nome} - {getAnimalTypeLabel(animal)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="text-center py-8">
                <PawPrint className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Nenhum animal cadastrado</p>
                <Link href="/pet/new">
                  <Button className="mt-4">Adicionar Primeiro Pet</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lista de Vacinas */}
        {selectedAnimalId && (
          <Card className="shadow-lg border-0">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl text-gray-800">Vacinas de {getSelectedAnimal()?.nome}</CardTitle>
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
              ) : vaccinations.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vacina</TableHead>
                      <TableHead>Data de Aplicação</TableHead>
                      <TableHead>Próxima Dose</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[100px]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vaccinations.map((vaccination) => {
                      const status = getVaccinationStatus(vaccination)
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
                                      : ""
                              }
                            >
                              {status.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteVaccine(vaccination.id)}
                              disabled={isDeletingVaccine === vaccination.id}
                            >
                              {isDeletingVaccine === vaccination.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhuma vacina registrada para este animal</p>
                  <p className="text-sm text-gray-400 mt-1">Adicione a primeira vacina para começar o histórico</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>

      {/* Modal de Vacinação */}
      {selectedAnimalId && (
        <VaccinationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          petId={selectedAnimalId}
          petName={getSelectedAnimal()?.nome || ""}
          onVaccinationAdded={handleVaccinationAdded}
        />
      )}
    </div>
  )
}
