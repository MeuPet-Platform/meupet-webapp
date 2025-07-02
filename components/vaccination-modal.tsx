"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar, Save, Loader2 } from "lucide-react"
import { vaccinesAPI, type VacinaRequest } from "@/lib/api"
import { formatDateToBR } from "@/lib/date-utils"

interface VaccinationModalProps {
  isOpen: boolean
  onClose: () => void
  petId: number
  petName: string
  onVaccinationAdded?: () => void
}

interface VaccinationData {
  tipoVacina: string // Corresponde ao backend
  dataVacina: string // Corresponde ao backend
  revacina: string // Corresponde ao backend
}

const commonVaccines = [
  "V8 (Óctupla)",
  "V10 (Décupla)",
  "V12 (Duodécupla)",
  "Antirrábica",
  "Giárdia",
  "Gripe Canina",
  "Leishmaniose",
  "Tríplice Felina",
  "Quíntupla Felina",
  "FeLV (Leucemia Felina)",
  "Outras",
]

export function VaccinationModal({ isOpen, onClose, petId, petName, onVaccinationAdded }: VaccinationModalProps) {
  const [formData, setFormData] = useState<VaccinationData>({
    tipoVacina: "",
    dataVacina: "",
    revacina: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleInputChange = (field: keyof VaccinationData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Validação local
      if (!formData.tipoVacina) {
        throw new Error("Selecione o tipo da vacina")
      }

      if (!formData.dataVacina) {
        throw new Error("Selecione a data da aplicação")
      }

      // Construir o payload com os nomes EXATOS esperados pelo backend
      const vacinaRequest: VacinaRequest = {
        tipoVacina: formData.tipoVacina, // Backend espera 'tipoVacina'
        dataVacina: formData.dataVacina, // Backend espera 'dataVacina' (já em formato ISO)
        revacina: formData.revacina || undefined, // Backend espera 'revacina' (opcional)
      }

      console.log("Payload sendo enviado para o backend:", vacinaRequest) // Debug
      console.log("Pet ID:", petId) // Debug

      const result = await vaccinesAPI.create(petId, vacinaRequest)
      console.log("Resposta do backend:", result) // Debug

      // Reset form and close modal
      setFormData({
        tipoVacina: "",
        dataVacina: "",
        revacina: "",
      })

      onClose()

      // Notify parent component to refresh data
      if (onVaccinationAdded) {
        onVaccinationAdded()
      }
    } catch (error) {
      console.error("Erro ao adicionar vacina:", error)
      setError(error instanceof Error ? error.message : "Erro ao adicionar vacina. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const calculateNextDose = (applicationDate: string, vaccineType: string) => {
    if (!applicationDate) return ""

    const appDate = new Date(applicationDate)
    let monthsToAdd = 12 // Default para a maioria das vacinas

    // Ajustar baseado no tipo de vacina
    switch (vaccineType.toLowerCase()) {
      case "giárdia":
        monthsToAdd = 6
        break
      case "gripe canina":
        monthsToAdd = 6
        break
      default:
        monthsToAdd = 12
    }

    const nextDate = new Date(appDate)
    nextDate.setMonth(nextDate.getMonth() + monthsToAdd)

    return nextDate.toISOString().split("T")[0]
  }

  // Auto-calculate next dose when application date or vaccine type changes
  const handleApplicationDateChange = (date: string) => {
    handleInputChange("dataVacina", date)
    if (date && formData.tipoVacina) {
      const nextDose = calculateNextDose(date, formData.tipoVacina)
      handleInputChange("revacina", nextDose)
    }
  }

  const handleVaccineChange = (vaccine: string) => {
    handleInputChange("tipoVacina", vaccine)
    if (formData.dataVacina && vaccine) {
      const nextDose = calculateNextDose(formData.dataVacina, vaccine)
      handleInputChange("revacina", nextDose)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setFormData({
        tipoVacina: "",
        dataVacina: "",
        revacina: "",
      })
      setError("")
      onClose()
    }
  }

  // Função para formatar data para exibição (DD/MM/YYYY)
  const formatDateForDisplay = (isoDate: string): string => {
    if (!isoDate) return ""
    return formatDateToBR(isoDate)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-green-500" />
            Adicionar Vacina - {petName}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="vaccine">Tipo da Vacina *</Label>
            <Select value={formData.tipoVacina} onValueChange={handleVaccineChange} required disabled={isLoading}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a vacina" />
              </SelectTrigger>
              <SelectContent>
                {commonVaccines.map((vaccine) => (
                  <SelectItem key={vaccine} value={vaccine}>
                    {vaccine}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formData.tipoVacina && <p className="text-xs text-gray-500">Vacina selecionada: {formData.tipoVacina}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="applicationDate">Data da Aplicação *</Label>
            <Input
              id="applicationDate"
              type="date"
              value={formData.dataVacina}
              onChange={(e) => handleApplicationDateChange(e.target.value)}
              required
              disabled={isLoading}
              max={new Date().toISOString().split("T")[0]} // Não permitir datas futuras
            />
            {formData.dataVacina && (
              <p className="text-xs text-gray-500">Data selecionada: {formatDateForDisplay(formData.dataVacina)}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="nextDose">Data da Revacinação</Label>
            <Input
              id="nextDose"
              type="date"
              value={formData.revacina}
              onChange={(e) => handleInputChange("revacina", e.target.value)}
              disabled={isLoading}
              min={new Date().toISOString().split("T")[0]} // Não permitir datas passadas
            />
            {formData.revacina && (
              <p className="text-xs text-gray-500">Revacinação em: {formatDateForDisplay(formData.revacina)}</p>
            )}
            <p className="text-xs text-gray-500">Data calculada automaticamente baseada no tipo de vacina</p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-green-500 hover:bg-green-600" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Vacina
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
