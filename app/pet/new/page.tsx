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
import { useRouter } from "next/navigation"
import { animalsAPI, authAPI, type CachorroRequest, type GatoRequest, type AveRequest } from "@/lib/api"

interface PetFormData {
  nome: string
  raca: string
  peso: string
  sexo: "Macho" | "Fêmea" | "Não Informado" | ""
  porte: "Pequeno" | "Médio" | "Grande" | "Gigante" | "Não Informado" | ""
  tipo: string
  // Campos específicos para cachorro
  manso?: boolean
  necessitaFocinheira?: boolean
  // Campos específicos para gato
  unhasCortadas?: boolean
  gostaDeAgua?: boolean
  tamanhoPelo?: "Curto" | "Médio" | "Longo" | "Sem Pelo" | "Desconhecido"
  // Campos específicos para ave
  asaCortada?: boolean
  emGaiola?: boolean
  exotico?: boolean
}

export default function NewPet() {
  const router = useRouter()
  const [formData, setFormData] = useState<PetFormData>({
    nome: "",
    raca: "",
    peso: "",
    sexo: "",
    porte: "",
    tipo: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!authAPI.isAuthenticated()) {
      router.push("/")
      return
    }
  }, [router])

  const handleInputChange = (field: keyof PetFormData, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleTypeChange = (tipo: string) => {
    // Reset campos específicos quando mudar o tipo
    setFormData((prev) => ({
      nome: prev.nome,
      raca: prev.raca,
      peso: prev.peso,
      sexo: prev.sexo,
      porte: prev.porte,
      tipo: tipo,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
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

      let createdPet

      if (formData.tipo === "dog") {
        const cachorroData: CachorroRequest = {
          nome: formData.nome,
          raca: formData.raca,
          peso: peso,
          sexo: formData.sexo as "Macho" | "Fêmea" | "Não Informado",
          porte: formData.porte as "Pequeno" | "Médio" | "Grande" | "Gigante" | "Não Informado",
          idTutor: userId,
          manso: formData.manso || false,
          necessitaFocinheira: formData.necessitaFocinheira || false,
        }
        createdPet = await animalsAPI.createDog(cachorroData)
      } else if (formData.tipo === "cat") {
        const gatoData: GatoRequest = {
          nome: formData.nome,
          raca: formData.raca,
          peso: peso,
          sexo: formData.sexo as "Macho" | "Fêmea" | "Não Informado",
          porte: formData.porte as "Pequeno" | "Médio" | "Grande" | "Gigante" | "Não Informado",
          idTutor: userId,
          unhasCortadas: formData.unhasCortadas || false,
          gostaDeAgua: formData.gostaDeAgua || false,
          tamanhoPelo: formData.tamanhoPelo || "Desconhecido",
        }
        createdPet = await animalsAPI.createCat(gatoData)
      } else if (formData.tipo === "bird") {
        const aveData: AveRequest = {
          nome: formData.nome,
          raca: formData.raca,
          peso: peso,
          sexo: formData.sexo as "Macho" | "Fêmea" | "Não Informado",
          porte: formData.porte as "Pequeno" | "Médio" | "Grande" | "Gigante" | "Não Informado",
          idTutor: userId,
          asaCortada: formData.asaCortada || false,
          emGaiola: formData.emGaiola || false,
          exotico: formData.exotico || false,
        }
        createdPet = await animalsAPI.createBird(aveData)
      } else {
        throw new Error("Tipo de animal não selecionado")
      }

      // Redirecionar para a página de detalhes do pet criado
      router.push(`/pet/${createdPet.id}`)
    } catch (error) {
      console.error("Erro ao criar pet:", error)
      setError(error instanceof Error ? error.message : "Erro ao criar pet. Tente novamente.")
    } finally {
      setIsLoading(false)
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
                disabled={isLoading}
              />
              <Label htmlFor="manso">É manso?</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="necessitaFocinheira"
                checked={formData.necessitaFocinheira || false}
                onCheckedChange={(checked) => handleInputChange("necessitaFocinheira", checked as boolean)}
                disabled={isLoading}
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
                disabled={isLoading}
              />
              <Label htmlFor="unhasCortadas">Unhas cortadas?</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="gostaDeAgua"
                checked={formData.gostaDeAgua || false}
                onCheckedChange={(checked) => handleInputChange("gostaDeAgua", checked as boolean)}
                disabled={isLoading}
              />
              <Label htmlFor="gostaDeAgua">Gosta de água?</Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tamanhoPelo">Tamanho do Pelo</Label>
              <Select
                onValueChange={(value) =>
                  handleInputChange("tamanhoPelo", value as "Curto" | "Médio" | "Longo" | "Sem Pelo" | "Desconhecido")
                }
                disabled={isLoading}
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
                disabled={isLoading}
              />
              <Label htmlFor="asaCortada">Asa cortada?</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="emGaiola"
                checked={formData.emGaiola || false}
                onCheckedChange={(checked) => handleInputChange("emGaiola", checked as boolean)}
                disabled={isLoading}
              />
              <Label htmlFor="emGaiola">Vive em gaiola?</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="exotico"
                checked={formData.exotico || false}
                onCheckedChange={(checked) => handleInputChange("exotico", checked as boolean)}
                disabled={isLoading}
              />
              <Label htmlFor="exotico">É exótico?</Label>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="mr-4" disabled={isLoading}>
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
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Adicionar Novo Pet</h2>
          <p className="text-gray-600">Preencha as informações do seu animal de estimação</p>
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
                    disabled={isLoading}
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
                    disabled={isLoading}
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
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sexo">Sexo *</Label>
                  <Select onValueChange={(value) => handleInputChange("sexo", value)} required disabled={isLoading}>
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
                  <Select onValueChange={(value) => handleInputChange("porte", value)} required disabled={isLoading}>
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

                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo de Animal *</Label>
                  <Select onValueChange={handleTypeChange} required disabled={isLoading}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dog">Cachorro</SelectItem>
                      <SelectItem value="cat">Gato</SelectItem>
                      <SelectItem value="bird">Ave</SelectItem>
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
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Salvar Pet
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
