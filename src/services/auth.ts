import apiClient from '@/services/api'
import type { AuthResponseDto, AuthRequestDto, CreateUserDto, User } from '../types/index.ts'

export const login = async (payload: AuthRequestDto): Promise<AuthResponseDto> => {
  const { data } = await apiClient.post<AuthResponseDto>('/auth/login', payload)
  return data
}

export const register = async (payload: CreateUserDto): Promise<AuthResponseDto> => {
  const { data } = await apiClient.post<AuthResponseDto>('/auth/register', payload)
  return data
}

export const getCurrentUser = async (token: string): Promise<User> => {
  const response = await apiClient.get('/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  })
  return response.data
}
