import { format, parse } from "date-fns"
import { ptBR } from "date-fns/locale"

// Converte data do formato ISO (YYYY-MM-DD) para formato brasileiro (DD/MM/YYYY)
// CORRIGIDO: Evita problemas de fuso horário construindo Date a partir dos componentes
export const formatDateToBR = (isoDate: string): string => {
  if (!isoDate) return ""
  try {
    // Dividir a string ISO em componentes numéricos para evitar problemas de fuso horário
    const [year, month, day] = isoDate.split("-").map(Number)

    // Criar Date usando componentes (month - 1 porque JavaScript usa mês baseado em 0)
    const date = new Date(year, month - 1, day)

    return format(date, "dd/MM/yyyy", { locale: ptBR })
  } catch (error) {
    console.error("Erro ao formatar data (formatDateToBR):", error)
    return isoDate
  }
}

// Converte data do formato brasileiro (DD/MM/YYYY) para formato ISO (YYYY-MM-DD)
export const formatBRDateToISO = (brDate: string): string => {
  if (!brDate) return ""
  try {
    // Para datas no formato DD/MM/YYYY
    const [day, month, year] = brDate.split("/").map(Number)

    // Validar componentes
    if (!day || !month || !year || day > 31 || month > 12 || year < 1900) {
      throw new Error("Data inválida")
    }

    // Formatar para ISO com zero padding
    return `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`
  } catch (error) {
    console.error("Erro ao converter data BR para ISO:", error)
    return ""
  }
}

// Converte data do formato ISO para input date (YYYY-MM-DD)
export const formatDateForInput = (isoDate: string): string => {
  if (!isoDate) return ""
  try {
    // Para input type="date", manter formato ISO
    return isoDate
  } catch (error) {
    console.error("Erro ao formatar data para input:", error)
    return ""
  }
}

// Converte data do input date (YYYY-MM-DD) para formato ISO
export const formatInputDateToISO = (inputDate: string): string => {
  return inputDate // Input date já está no formato ISO
}

// NOVA FUNÇÃO: Valida se uma string está no formato DD/MM/YYYY
export const isValidBRDate = (brDate: string): boolean => {
  if (!brDate) return false

  const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/
  const match = brDate.match(dateRegex)

  if (!match) return false

  const [, day, month, year] = match.map(Number)

  // Validações básicas
  if (day < 1 || day > 31) return false
  if (month < 1 || month > 12) return false
  if (year < 1900 || year > 2100) return false

  // Criar data para validação mais precisa
  const date = new Date(year, month - 1, day)
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
}

// NOVA FUNÇÃO: Aplica máscara DD/MM/YYYY em tempo real
export const applyDateMask = (value: string): string => {
  // Remove tudo que não é número
  const numbers = value.replace(/\D/g, "")

  // Aplica a máscara progressivamente
  if (numbers.length <= 2) {
    return numbers
  } else if (numbers.length <= 4) {
    return `${numbers.slice(0, 2)}/${numbers.slice(2)}`
  } else {
    return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`
  }
}

// Funções legadas mantidas para compatibilidade
export const convertUSDateToBR = (usDate: string): string => {
  if (!usDate) return ""
  try {
    const date = parse(usDate, "MM/dd/yyyy", new Date())
    return format(date, "dd/MM/yyyy")
  } catch (error) {
    console.error("Erro ao converter data US para BR:", error)
    return usDate
  }
}

export const convertBRDateToUS = (brDate: string): string => {
  if (!brDate) return ""
  try {
    const date = parse(brDate, "dd/MM/yyyy", new Date())
    return format(date, "MM/dd/yyyy")
  } catch (error) {
    console.error("Erro ao converter data BR para US:", error)
    return brDate
  }
}

// Função legada - agora usa a nova implementação
export const formatISODateToBR = (isoDate: string): string => {
  return formatDateToBR(isoDate)
}
