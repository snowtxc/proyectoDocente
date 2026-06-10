import type { User } from '~/types/user'

export const getAuthUser = (value: any): User | null => {
  return value?.user || value?.data || value || null
}

export const getUserRoles = (value: any): any[] => {
  const user: any = getAuthUser(value)
  const roles = user?.roles || user?.role || user?.rol || []

  return Array.isArray(roles) ? roles : [roles]
}

export const hasUserRole = (value: any, roleName: string) => {
  const user: any = getAuthUser(value)
  const normalizedRoleName = roleName.toLowerCase()

  if (normalizedRoleName === 'administrador' && (user?.is_admin || user?.isAdmin)) {
    return true
  }

  return getUserRoles(value).some((role: any) => {
    const currentRole = typeof role === 'string' ? role : role?.name || role?.nombre
    return currentRole?.toLowerCase() === normalizedRoleName
  })
}

export const mergeUserPreservingRoles = (newUser: any, currentUser: any) => {
  const normalizedNewUser = getAuthUser(newUser)
  const normalizedCurrentUser = getAuthUser(currentUser)

  if (!normalizedNewUser) {
    return normalizedCurrentUser
  }

  const newRoles = getUserRoles(normalizedNewUser).filter(Boolean)
  const currentRoles = getUserRoles(normalizedCurrentUser).filter(Boolean)

  if (newRoles.length || !currentRoles.length) {
    return normalizedNewUser
  }

  return {
    ...normalizedNewUser,
    roles: currentRoles,
  }
}
