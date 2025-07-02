import { format, parse } from "date-fns"
import { ptBR } from "date-fns/locale"

// Converte data do formato ISO (YYYY-MM-DD) para formato brasileiro (DD/MM/YYYY)
export const formatDateToBR = (isoDate: string): string => {
  if (!isoDate) return ""
  try {
    const date = new Date(isoDate)
    return format(date, "dd/MM/yyyy", { locale: ptBR })
  } catch (error) {
    console.error("Erro ao formatar data:", error)
    return isoDate
  }
}

// Converte data do formato brasileiro (DD/MM/YYYY) para formato ISO (YYYY-MM-DD)
export const formatDateToISO = (brDate: string): string => {
  if (!brDate) return ""
  try {
    const date = parse(brDate, "dd/MM/yyyy", new Date())
    return format(date, "yyyy-MM-dd")
  } catch (error) {
    console.error("Erro ao converter data:", error)
    return brDate
  }
}

// Converte data do formato ISO para input date (YYYY-MM-DD)
export const formatDateForInput = (isoDate: string): string => {
  if (!isoDate) return ""
  try {
    const date = new Date(isoDate)
    return format(date, "yyyy-MM-dd")
  } catch (error) {
    console.error("Erro ao formatar data para input:", error)
    return ""
  }
}

// Converte data do input date (YYYY-MM-DD) para formato ISO
export const formatInputDateToISO = (inputDate: string): string => {
  return inputDate // Input date já está no formato ISO
}

// Converte data do formato MM/DD/YYYY para DD/MM/YYYY
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

// Converte data do formato DD/MM/YYYY para MM/DD/YYYY
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

// Adicione esta função para converter data ISO para formato brasileiro para exibição
export const formatISODateToBR = (isoDate: string): string => {
  if (!isoDate) return ""
  try {
    // Para datas no formato YYYY-MM-DD
    const [year, month, day] = isoDate.split("-")
    return `${day}/${month}/${year}`
  } catch (error) {
    console.error("Erro ao converter data ISO para BR:", error)
    return isoDate
  }
}

// Adicione esta função para converter data brasileira para ISO
export const formatBRDateToISO = (brDate: string): string => {
  if (!brDate) return ""
  try {
    // Para datas no formato DD/MM/YYYY
    const [day, month, year] = brDate.split("/")
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
  } catch (error) {
    console.error("Erro ao converter data BR para ISO:", error)
    return brDate
  }
}
