"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, PawPrint, Save, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { animalsAPI, authAPI, type CachorroRequest, type GatoRequest, type AveRequest } from "@/lib/api"
import { inferAnimalType, isDog, isCat, isBird } from "@/lib/animal-utils"

interface PetFormData {
  nome: string
  raca: string
  peso: string
  sexo: string
  porte: string
  tipo: string
  // Campos específicos para cachorro
  manso?: boolean
  necessitaFocinheira?: boolean
  // Campos específicos para gato
  unhasCortadas?: boolean
  gostaDeAgua?: boolean
  tamanhoPelo?: string
  // Campos específicos para ave
  asaCortada?: boolean
  emGaiola?: boolean
  exotico?: boolean
}

export default function EditPet() {
  const params = useParams()
  const router = useRouter()
  const petId = Number.parseInt(params.id as string)

  const [formData, setFormData] = useState<PetFormData>({
    nome: "",
    raca: "",
    peso: "",
    sexo: "",
    porte: "",
    tipo: "",
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!authAPI.isAuthenticated()) {
      router.push("/")
      return
    }

    if (petId) {
      loadPetData()
    }
  }, [petId, router])

  const loadPetData = async () => {
    try {
      setIsLoading(true)
      setError("")
      const pet = await animalsAPI.getById(petId)

      // Inferir o tipo do animal
      const animalType = inferAnimalType(pet)
      const typeMapping = {
        Cachorro: "dog",
        Gato: "cat",
        Ave: "bird",
      }

      // Mapear os dados do pet para o formulário
      setFormData({
        nome: pet.nome,
        raca: pet.raca,
        peso: pet.peso.toString(),
        sexo: pet.sexo,
        porte: pet.porte,
        tipo: typeMapping[animalType],
        // Campos específicos baseados no tipo inferido
        ...(isDog(pet) && {
          manso: pet.manso,
          necessitaFocinheira: pet.necessitaFocinheira,
        }),
        ...(isCat(pet) && {
          unhasCortadas: pet.unhasCortadas,
          gostaDeAgua: pet.gostaDeAgua,
          tamanhoPelo: pet.tamanhoPelo,
        }),
        ...(isBird(pet) && {
          asaCortada: pet.asaCortada,
          emGaiola: pet.emGaiola,
          exotico: pet.exotico,
        }),
      })
    } catch (error) {
      console.error("Erro ao carregar pet:", error)
      setError("Erro ao carregar os dados do pet.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof PetFormData, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError("")

    try {
      const userId = authAPI.getUserId()
      if (!userId) {
        throw new Error("Usuário não autenticado")
      }

      const peso = Number.parseFloat(formData.peso)
      if (isNaN(peso) || peso <= 0) {
        throw new Error("Peso deve ser um número válido maior que zero")
      }

      if (formData.tipo === "dog") {
        const cachorroData: CachorroRequest = {
          nome: formData.nome,
          raca: formData.raca,
          peso: peso,
          sexo: formData.sexo,
          porte: formData.porte,
          idTutor: userId,
          manso: formData.manso || false,
          necessitaFocinheira: formData.necessitaFocinheira || false,
        }
        await animalsAPI.updateDog(petId, cachorroData)
      } else if (formData.tipo === "cat") {
        const gatoData: GatoRequest = {
          nome: formData.nome,
          raca: formData.raca,
          peso: peso,
          sexo: formData.sexo,
          porte: formData.porte,
          idTutor: userId,
          unhasCortadas: formData.unhasCortadas || false,
          gostaDeAgua: formData.gostaDeAgua || false,
          tamanhoPelo: formData.tamanhoPelo || "Desconhecido",
        }
        await animalsAPI.updateCat(petId, gatoData)
      } else if (formData.tipo === "bird") {
        const aveData: AveRequest = {
          nome: formData.nome,
          raca: formData.raca,
          peso: peso,
          sexo: formData.sexo,
          porte: formData.porte,
          idTutor: userId,
          asaCortada: formData.asaCortada || false,
          emGaiola: formData.emGaiola || false,
          exotico: formData.exotico || false,
        }
        await animalsAPI.updateBird(petId, aveData)
      }

      // Redirecionar para a página de detalhes do pet
      router.push(`/pet/${petId}`)
    } catch (error) {
      console.error("Erro ao atualizar pet:", error)
      setError(error instanceof Error ? error.message : "Erro ao atualizar pet. Tente novamente.")
    } finally {
      setIsSaving(false)
    }
  }

  const renderSpecificFields = () => {
    switch (formData.tipo) {
      case "dog":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Informações Específicas - Cachorro</h3>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="manso"
                checked={formData.manso || false}
                onCheckedChange={(checked) => handleInputChange("manso", checked as boolean)}
                disabled={isSaving}
              />
              <Label htmlFor="manso">É manso?</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="necessitaFocinheira"
                checked={formData.necessitaFocinheira || false}
                onCheckedChange={(checked) => handleInputChange("necessitaFocinheira", checked as boolean)}
                disabled={isSaving}
              />
              <Label htmlFor="necessitaFocinheira">Necessita focinheira?</Label>
            </div>
          </div>
        )

      case "cat":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Informações Específicas - Gato</h3>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="unhasCortadas"
                checked={formData.unhasCortadas || false}
                onCheckedChange={(checked) => handleInputChange("unhasCortadas", checked as boolean)}
                disabled={isSaving}
              />
              <Label htmlFor="unhasCortadas">Unhas cortadas?</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="gostaDeAgua"
                checked={formData.gostaDeAgua || false}
                onCheckedChange={(checked) => handleInputChange("gostaDeAgua", checked as boolean)}
                disabled={isSaving}
              />
              <Label htmlFor="gostaDeAgua">Gosta de água?</Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tamanhoPelo">Tamanho do Pelo</Label>
              <Select
                value={formData.tamanhoPelo || ""}
                onValueChange={(value) => handleInputChange("tamanhoPelo", value)}
                disabled={isSaving}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tamanho do pelo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Curto">Curto</SelectItem>
                  <SelectItem value="Médio">Médio</SelectItem>
                  <SelectItem value="Longo">Longo</SelectItem>
                  <SelectItem value="Sem Pelo">Sem Pelo</SelectItem>
                  <SelectItem value="Desconhecido">Desconhecido</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      case "bird":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Informações Específicas - Ave</h3>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="asaCortada"
                checked={formData.asaCortada || false}
                onCheckedChange={(checked) => handleInputChange("asaCortada", checked as boolean)}
                disabled={isSaving}
              />
              <Label htmlFor="asaCortada">Asa cortada?</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="emGaiola"
                checked={formData.emGaiola || false}
                onCheckedChange={(checked) => handleInputChange("emGaiola", checked as boolean)}
                disabled={isSaving}
              />
              <Label htmlFor="emGaiola">Vive em gaiola?</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="exotico"
                checked={formData.exotico || false}
                onCheckedChange={(checked) => handleInputChange("exotico", checked as boolean)}
                disabled={isSaving}
              />
              <Label htmlFor="exotico">É exótico?</Label>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <span className="ml-2 text-gray-600">Carregando dados do pet...</span>
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
            <Link href={`/pet/${petId}`}>
              <Button variant="ghost" size="sm" className="mr-4" disabled={isSaving}>
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
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Editar Pet</h2>
          <p className="text-gray-600">Atualize as informações do {formData.nome}</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-xl text-gray-800">Informações do Pet</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Campos Comuns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => handleInputChange("nome", e.target.value)}
                    placeholder="Nome do pet"
                    required
                    disabled={isSaving}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="raca">Raça *</Label>
                  <Input
                    id="raca"
                    value={formData.raca}
                    onChange={(e) => handleInputChange("raca", e.target.value)}
                    placeholder="Raça do pet"
                    required
                    disabled={isSaving}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="peso">Peso (kg) *</Label>
                  <Input
                    id="peso"
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={formData.peso}
                    onChange={(e) => handleInputChange("peso", e.target.value)}
                    placeholder="Ex: 5.5"
                    required
                    disabled={isSaving}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sexo">Sexo *</Label>
                  <Select
                    value={formData.sexo}
                    onValueChange={(value) => handleInputChange("sexo", value)}
                    required
                    disabled={isSaving}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o sexo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Macho">Macho</SelectItem>
                      <SelectItem value="Fêmea">Fêmea</SelectItem>
                      <SelectItem value="Não Informado">Não Informado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="porte">Porte *</Label>
                  <Select
                    value={formData.porte}
                    onValueChange={(value) => handleInputChange("porte", value)}
                    required
                    disabled={isSaving}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o porte" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pequeno">Pequeno</SelectItem>
                      <SelectItem value="Médio">Médio</SelectItem>
                      <SelectItem value="Grande">Grande</SelectItem>
                      <SelectItem value="Gigante">Gigante</SelectItem>
                      <SelectItem value="Não Informado">Não Informado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Campos Específicos por Tipo */}
              {formData.tipo && <div className="mt-8 p-4 bg-blue-50 rounded-lg">{renderSpecificFields()}</div>}

              {/* Botão de Salvar */}
              <div className="flex justify-end pt-6">
                <Button
                  type="submit"
                  className="bg-green-500 hover:bg-green-600 text-white px-8"
                  size="lg"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Salvar Alterações
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
