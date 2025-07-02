import type { AnimalResponse } from "./api"

// Função para inferir o tipo de animal baseado nos campos específicos presentes
export const inferAnimalType = (animal: AnimalResponse): "Cachorro" | "Gato" | "Ave" => {
  // Primeiro, verificar se o campo tipoAnimal está presente (novo backend)
  if (animal.tipoAnimal) {
    return animal.tipoAnimal
  }

  // Fallback: inferir baseado nos campos específicos (backend antigo)
  if (animal.manso !== undefined || animal.necessitaFocinheira !== undefined) {
    return "Cachorro"
  }

  if (animal.unhasCortadas !== undefined || animal.gostaDeAgua !== undefined || animal.tamanhoPelo !== undefined) {
    return "Gato"
  }

  if (animal.asaCortada !== undefined || animal.emGaiola !== undefined || animal.exotico !== undefined) {
    return "Ave"
  }

  // Default fallback
  return "Ave"
}

// Função para obter o ícone do tipo de animal
export const getAnimalTypeIcon = (animal: AnimalResponse) => {
  const type = inferAnimalType(animal)
  return type
}

// Função para obter o label do tipo de animal
export const getAnimalTypeLabel = (animal: AnimalResponse): string => {
  const type = inferAnimalType(animal)
  return type
}

// Função para verificar se um animal tem campos específicos de cachorro
export const isDog = (animal: AnimalResponse): boolean => {
  return inferAnimalType(animal) === "Cachorro"
}

// Função para verificar se um animal tem campos específicos de gato
export const isCat = (animal: AnimalResponse): boolean => {
  return inferAnimalType(animal) === "Gato"
}

// Função para verificar se um animal tem campos específicos de ave
export const isBird = (animal: AnimalResponse): boolean => {
  return inferAnimalType(animal) === "Ave"
}
