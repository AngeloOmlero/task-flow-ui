import apiClient from './api'
import type { User } from '../types'

export const userService = {
  getAllUsers: async (): Promise<User[]> => {
    const { data } = await apiClient.get<User[]>('/auth/users')
    return data
  },

  searchUsers: async (query: string): Promise<User[]> => {
    const { data } = await apiClient.get<User[]>(`/auth/users/search?query=${query}`)
    return data
  },
}
