export type Role = 'user' | 'admin'

export interface User {
  id: string
  _id?: string
  name: string
  email: string
  cpf?: string
  phone?: string
  role: Role
  isVerified?: boolean
}

export interface Product {
  _id: string
  name: string
  description?: string
  price: number
  discount: number
  category?: string
  subcategory?: string
  brand?: string
  material?: string
  careInstructions?: string
  gender?: 'masculino' | 'feminino' | 'unissex'
  sizes: string[]
  colors: string[]
  images: string[]
  stock: number
  isActive: boolean
  rating: number
  numReviews: number
  createdAt?: string
  updatedAt?: string
  views?: number
  sales?: number
}

export interface OrderItem {
  product: string | Pick<Product, '_id' | 'name' | 'price' | 'images'>
  name: string
  quantity: number
  price: number
  color?: string
  size?: string
  image?: string
}

export interface Customer {
  email: string
  cpf: string
  birthDate?: string
  phone?: string
  fullName: string
}

export interface ShippingAddress {
  cep: string
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string
  reference?: string
  tipoResidencia?: string
  horarioEntrega?: string
  responsavel?: string
}

export type OrderStatus = 'pending' | 'processing' | 'paid' | 'shipped' | 'delivered' | 'canceled'

export interface Order {
  _id: string
  user?: User | string
  items: OrderItem[]
  total: number
  status: OrderStatus
  paymentMethod?: string
  paymentStatus?: string
  transactionId?: string
  customer: Customer
  shippingAddress: ShippingAddress
  hasBag: boolean
  createdAt: string
  updatedAt?: string
}

export interface ProductListResponse {
  products: Product[]
  totalPages: number
  currentPage: number
  total?: number
}

export interface ApiErrorPayload {
  message?: string
}

export interface CreateOrderPayload {
  items: Array<Pick<OrderItem, 'name' | 'quantity' | 'price' | 'color' | 'size' | 'image'> & { product: string }>
  total: number
  customer: Customer
  shippingAddress: ShippingAddress
  hasBag?: boolean
}

export interface ProductFilters {
  category?: string
  brand?: string
  gender?: string
  size?: string
  color?: string
  minPrice?: number
  maxPrice?: number
  sort?: string
  page?: number
  limit?: number
  search?: string
}

export const API_BASE_URL = import.meta.env.DEV ? '/api' : 'https://backend-insider.vercel.app/api'

export const STORE_STORAGE = { token: 'store:token', user: 'store:user' } as const
export const CMS_STORAGE = { user: 'cms:user', csrf: 'cms:csrf' } as const

export function getErrorMessage(error: unknown, fallback = 'Erro na requisição') {
  return error instanceof Error && error.message ? error.message : fallback
}
