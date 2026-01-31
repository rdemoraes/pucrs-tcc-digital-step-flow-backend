import { v4 as uuidv4 } from 'uuid'

export interface User {
  id: string
  email: string
  password: string
  name: string
  createdAt: Date
  updatedAt: Date
}

interface CreateUserData {
  email: string
  password: string
  name: string
}

interface UpdateUserData {
  name?: string
}

// In-memory store for development
// In production, this would be replaced with a database
const users: User[] = []

class UserRepository {
  async create (data: CreateUserData): Promise<User> {
    const user: User = {
      id: uuidv4(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    users.push(user)
    return user
  }

  async findByEmail (email: string): Promise<User | null> {
    const found = users.find((u) => u.email === email)
    return found ?? null
  }

  async findById (id: string): Promise<User | null> {
    const found = users.find((u) => u.id === id)
    return found ?? null
  }

  async update (id: string, data: UpdateUserData): Promise<User> {
    const userIndex = users.findIndex((u) => u.id === id)
    if (userIndex === -1) {
      throw new Error('User not found')
    }

    users[userIndex] = {
      ...users[userIndex],
      ...data,
      updatedAt: new Date()
    }

    return users[userIndex]
  }
}

export const userRepository = new UserRepository()
