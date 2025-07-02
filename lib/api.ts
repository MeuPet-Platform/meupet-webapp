// Configuração base da API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081"

// Tipos para as requisições baseados nos DTOs do backend
export interface LoginRequest {
  email: string
  senha: string
}

export interface LoginResponse {
  token: string
}

export interface UsuarioRequest {
  nome: string
  email: string
  senha: string
}

export interface UsuarioResponse {
  id: number
  nome: string
  email: string
}

// Tipo base para resposta de animal
export interface AnimalResponse {
  id: number
  nome: string
  raca: string
  peso: number
  sexo: string
  vacinado: string
  porte: string
  tipoAnimal: "Cachorro" | "Gato" | "Ave"
  tutor?: {
    id: number
    nome: string
    email: string
  }
  historicoVacinacao?: VacinaResponse[]
  // Campos específicos do cachorro
  manso?: boolean
  necessitaFocinheira?: boolean
  // Campos específicos do gato
  unhasCortadas?: boolean
  gostaDeAgua?: boolean
  tamanhoPelo?: string
  // Campos específicos da ave
  asaCortada?: boolean
  emGaiola?: boolean
  exotico?: boolean
}

export interface VacinaRequest {
  tipoVacina: string // Corresponde a 'tipoVacina' no backend
  dataVacina: string // Corresponde a 'dataVacina' no backend (ISO YYYY-MM-DD)
  revacina?: string // Corresponde a 'revacina' no backend (ISO YYYY-MM-DD)
}

export interface VacinaResponse {
  id: number
  tipoVacina: string // Corresponde ao campo 'tipoVacina' do backend
  dataVacina: string // Corresponde ao campo 'dataVacina' do backend
  revacina?: string // Corresponde ao campo 'revacina' do backend
}

export interface CachorroRequest {
  nome: string
  raca: string
  peso: number
  sexo: string
  porte: string
  idTutor: number
  manso: boolean
  necessitaFocinheira: boolean
}

export interface GatoRequest {
  nome: string
  raca: string
  peso: number
  sexo: string
  porte: string
  idTutor: number
  unhasCortadas: boolean
  gostaDeAgua: boolean
  tamanhoPelo: string
}

export interface AveRequest {
  nome: string
  raca: string
  peso: number
  sexo: string
  porte: string
  idTutor: number
  asaCortada: boolean
  emGaiola: boolean
  exotico: boolean
}

// Utilitário para obter o token
const getAuthToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("authToken")
  }
  return null
}

// Utilitário para fazer requisições autenticadas
const apiRequest = async (endpoint: string, options: RequestInit = {}): Promise<Response> => {
  const token = getAuthToken()
  const url = `${API_BASE_URL}${endpoint}`

  const config: RequestInit = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  }

  const response = await fetch(url, config)

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || `HTTP ${response.status}`)
  }

  return response
}

// API de Autenticação
export const authAPI = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await fetch(`${API_BASE_URL}/usuarios/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(errorText || "Erro no login")
    }

    return response.json()
  },

  register: async (userData: UsuarioRequest): Promise<UsuarioResponse> => {
    const response = await fetch(`${API_BASE_URL}/usuarios`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(errorText || "Erro no cadastro")
    }

    return response.json()
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("authToken")
      localStorage.removeItem("userId")
    }
  },

  saveToken: (token: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("authToken", token)
      // Decodificar o token para obter o ID do usuário
      try {
        const payload = JSON.parse(atob(token.split(".")[1]))
        console.log("Token payload:", payload) // Debug
        // Tentar diferentes campos para o ID do usuário
        const userId = payload.sub || payload.userId || payload.id
        if (userId) {
          localStorage.setItem("userId", userId.toString())
        } else {
          console.error("ID do usuário não encontrado no token")
        }
      } catch (error) {
        console.error("Erro ao decodificar token:", error)
      }
    }
  },

  getUserId: (): number | null => {
    if (typeof window !== "undefined") {
      const userId = localStorage.getItem("userId")
      return userId ? Number.parseInt(userId) : null
    }
    return null
  },

  isAuthenticated: (): boolean => {
    return getAuthToken() !== null
  },
}

// API de Usuários
export const usersAPI = {
  getById: async (id: number): Promise<UsuarioResponse> => {
    const response = await apiRequest(`/usuarios/${id}`)
    return response.json()
  },
}

// API de Animais
export const animalsAPI = {
  // Listar todos os animais
  getAll: async (): Promise<AnimalResponse[]> => {
    const response = await apiRequest("/animais")
    return response.json()
  },

  // Listar apenas os animais do usuário logado (quando implementado no backend)
  getMy: async (): Promise<AnimalResponse[]> => {
    const userId = authAPI.getUserId()
    if (!userId) {
      throw new Error("Usuário não autenticado")
    }
    const response = await apiRequest(`/usuarios/${userId}/animais`)
    return response.json()
  },

  // Buscar animal por ID
  getById: async (id: number): Promise<AnimalResponse> => {
    const response = await apiRequest(`/animais/${id}`)
    return response.json()
  },

  // Criar cachorro
  createDog: async (data: CachorroRequest): Promise<AnimalResponse> => {
    const response = await apiRequest("/animais/cachorro", {
      method: "POST",
      body: JSON.stringify(data),
    })
    return response.json()
  },

  // Criar gato
  createCat: async (data: GatoRequest): Promise<AnimalResponse> => {
    const response = await apiRequest("/animais/gato", {
      method: "POST",
      body: JSON.stringify(data),
    })
    return response.json()
  },

  // Criar ave
  createBird: async (data: AveRequest): Promise<AnimalResponse> => {
    const response = await apiRequest("/animais/ave", {
      method: "POST",
      body: JSON.stringify(data),
    })
    return response.json()
  },

  // Atualizar cachorro
  updateDog: async (id: number, data: CachorroRequest): Promise<AnimalResponse> => {
    const response = await apiRequest(`/animais/cachorro/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
    return response.json()
  },

  // Atualizar gato
  updateCat: async (id: number, data: GatoRequest): Promise<AnimalResponse> => {
    const response = await apiRequest(`/animais/gato/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
    return response.json()
  },

  // Atualizar ave
  updateBird: async (id: number, data: AveRequest): Promise<AnimalResponse> => {
    const response = await apiRequest(`/animais/ave/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
    return response.json()
  },

  // Deletar animal
  delete: async (id: number): Promise<void> => {
    await apiRequest(`/animais/${id}`, {
      method: "DELETE",
    })
  },
}

// API de Vacinas
export const vaccinesAPI = {
  // Listar vacinas de um animal
  getByAnimalId: async (animalId: number): Promise<VacinaResponse[]> => {
    const response = await apiRequest(`/animais/${animalId}/vacinas`)
    return response.json()
  },

  // Adicionar vacina a um animal
  create: async (animalId: number, data: VacinaRequest): Promise<VacinaResponse> => {
    const response = await apiRequest(`/animais/${animalId}/vacinas`, {
      method: "POST",
      body: JSON.stringify(data),
    })
    return response.json()
  },

  // Atualizar vacina individual
  update: async (vaccineId: number, data: VacinaRequest): Promise<VacinaResponse> => {
    const response = await apiRequest(`/vacinas/${vaccineId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
    return response.json()
  },

  // Deletar vacina individual
  delete: async (vaccineId: number): Promise<void> => {
    await apiRequest(`/vacinas/${vaccineId}`, {
      method: "DELETE",
    })
  },
}
