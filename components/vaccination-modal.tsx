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
import { formatDateToBR, formatBRDateToISO, applyDateMask, isValidBRDate } from "@/lib/date-utils"

interface VaccinationModalProps {
  isOpen: boolean
  onClose: () => void
  petId: number
  petName: string
  onVaccinationAdded?: () => void
}

interface VaccinationData {
  tipoVacina: string
  dataVacina: string // Formato brasileiro DD/MM/YYYY para exibição
  revacina: string // Formato brasileiro DD/MM/YYYY para exibição
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

  // Manipulador específico para campos de data com máscara
  const handleDateChange = (field: "dataVacina" | "revacina", value: string) => {
    const maskedValue = applyDateMask(value)
    handleInputChange(field, maskedValue)
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
        throw new Error("Informe a data da aplicação")
      }

      // Validar formato da data de aplicação
      if (!isValidBRDate(formData.dataVacina)) {
        throw new Error("Data da aplicação inválida. Use o formato DD/MM/YYYY")
      }

      // Validar formato da data de revacinação (se informada)
      if (formData.revacina && !isValidBRDate(formData.revacina)) {
        throw new Error("Data da revacinação inválida. Use o formato DD/MM/YYYY")
      }

      // Converter datas brasileiras para formato ISO antes de enviar ao backend
      const dataVacinaISO = formatBRDateToISO(formData.dataVacina)
      const revacinaISO = formData.revacina ? formatBRDateToISO(formData.revacina) : undefined

      if (!dataVacinaISO) {
        throw new Error("Erro ao processar a data da aplicação")
      }

      // Construir o payload com os nomes EXATOS esperados pelo backend
      const vacinaRequest: VacinaRequest = {
        tipoVacina: formData.tipoVacina,
        dataVacina: dataVacinaISO, // Enviado em formato ISO para o backend
        revacina: revacinaISO, // Enviado em formato ISO para o backend (opcional)
      }

      console.log("Payload sendo enviado para o backend:", vacinaRequest)
      console.log("Pet ID:", petId)

      const result = await vaccinesAPI.create(petId, vacinaRequest)
      console.log("Resposta do backend:", result)

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
    if (!applicationDate || !isValidBRDate(applicationDate)) return ""

    try {
      // Converter data brasileira para ISO para cálculos
      const isoDate = formatBRDateToISO(applicationDate)
      const appDate = new Date(isoDate)

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

      // Converter de volta para formato brasileiro
      const nextDateISO = nextDate.toISOString().split("T")[0]
      return formatDateToBR(nextDateISO)
    } catch (error) {
      console.error("Erro ao calcular próxima dose:", error)
      return ""
    }
  }

  // Auto-calculate next dose when application date or vaccine type changes
  const handleApplicationDateChange = (date: string) => {
    const maskedDate = applyDateMask(date)
    handleInputChange("dataVacina", maskedDate)

    if (isValidBRDate(maskedDate) && formData.tipoVacina) {
      const nextDose = calculateNextDose(maskedDate, formData.tipoVacina)
      handleInputChange("revacina", nextDose)
    }
  }

  const handleVaccineChange = (vaccine: string) => {
    handleInputChange("tipoVacina", vaccine)
    if (formData.dataVacina && isValidBRDate(formData.dataVacina)) {
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
            <Label htmlFor="applicationDate">Data da Aplicação * (DD/MM/YYYY)</Label>
            <Input
              id="applicationDate"
              type="text"
              placeholder="DD/MM/YYYY"
              value={formData.dataVacina}
              onChange={(e) => handleApplicationDateChange(e.target.value)}
              required
              disabled={isLoading}
              maxLength={10}
              className="font-mono"
            />
            {formData.dataVacina && isValidBRDate(formData.dataVacina) && (
              <p className="text-xs text-green-600">✓ Data válida: {formData.dataVacina}</p>
            )}
            {formData.dataVacina && !isValidBRDate(formData.dataVacina) && formData.dataVacina.length >= 8 && (
              <p className="text-xs text-red-600">✗ Data inválida. Use DD/MM/YYYY</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="nextDose">Data da Revacinação (DD/MM/YYYY)</Label>
            <Input
              id="nextDose"
              type="text"
              placeholder="DD/MM/YYYY"
              value={formData.revacina}
              onChange={(e) => handleDateChange("revacina", e.target.value)}
              disabled={isLoading}
              maxLength={10}
              className="font-mono"
            />
            {formData.revacina && isValidBRDate(formData.revacina) && (
              <p className="text-xs text-green-600">✓ Data válida: {formData.revacina}</p>
            )}
            {formData.revacina && !isValidBRDate(formData.revacina) && formData.revacina.length >= 8 && (
              <p className="text-xs text-red-600">✗ Data inválida. Use DD/MM/YYYY</p>
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
