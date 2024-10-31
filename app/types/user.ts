export interface CreateUserDTO {
  nombre1: string
  nombre2: string
  apellido1: string
  apellido2: string
  email: string
  password: string
}

export interface LoginDTO {
  email: string
  password: string
}

export interface LoggedUser {
  id: any
  nombre1?: string
  nombre2?: string
  apellido1?: string
  apellido2?: string
  email?: string
  password?: string
  token?: string
}