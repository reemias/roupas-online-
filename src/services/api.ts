import type { Product, ProductListResponse, ProductFilters } from '../types/api'

interface CatalogDocument {
  products: Product[]
}

export interface CatalogCategory {
  name: string
  subcategories: string[]
}

const CATALOG_URL = '/catalog.md'
let catalogPromise: Promise<Product[]> | null = null

function parseCatalog(markdown: string): Product[] {
  const jsonBlock = markdown.match(/```json\s*([\s\S]*?)\s*```/i)?.[1]
  if (!jsonBlock) throw new Error('O arquivo public/catalog.md não contém um bloco JSON válido.')

  const document = JSON.parse(jsonBlock) as CatalogDocument
  if (!Array.isArray(document.products)) throw new Error('O catálogo local não possui a lista de produtos.')
  return document.products.filter((product) => product.isActive !== false)
}

async function loadCatalog(): Promise<Product[]> {
  if (!catalogPromise) {
    catalogPromise = fetch(CATALOG_URL, { headers: { Accept: 'text/markdown' } })
      .then((response) => {
        if (!response.ok) throw new Error(`Não foi possível carregar ${CATALOG_URL}.`)
        return response.text()
      })
      .then(parseCatalog)
      .catch((error) => {
        catalogPromise = null
        throw error
      })
  }
  return catalogPromise
}

function getQuery(endpoint: string) {
  const [path, query = ''] = endpoint.split('?')
  return { path, params: new URLSearchParams(query) }
}

function sortProducts(products: Product[], sort: string | null) {
  const sorted = [...products]
  if (sort === 'price_asc' || sort === 'price-low') return sorted.sort((a, b) => a.price - b.price)
  if (sort === 'price_desc' || sort === 'price-high') return sorted.sort((a, b) => b.price - a.price)
  if (sort === 'rating') return sorted.sort((a, b) => b.rating - a.rating)
  if (sort === 'bestSeller' || sort === 'bestseller') return sorted.sort((a, b) => Number(b.isBestSeller) - Number(a.isBestSeller))
  return sorted.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
}

async function get<T>(endpoint: string): Promise<T> {
  const { path, params } = getQuery(endpoint)
  const products = await loadCatalog()

  if (path === '/categories') {
    const categories = [...new Set(products.map((product) => product.category).filter(Boolean))].map((name) => ({
      name,
      subcategories: [...new Set(products.filter((product) => product.category === name).map((product) => product.subcategory).filter(Boolean))],
    }))
    return categories as T
  }

  const productIdMatch = path.match(/^\/products\/([^/]+)$/)
  if (productIdMatch) {
    const product = products.find((item) => item._id === decodeURIComponent(productIdMatch[1]))
    if (!product) throw new Error('Produto não encontrado no catálogo local.')
    return product as T
  }

  if (path === '/products') {
    let filtered = products.filter((product) => {
      const search = (params.get('search') || '').toLocaleLowerCase('pt-BR')
      return (!search || `${product.name} ${product.description || ''} ${product.brand || ''}`.toLocaleLowerCase('pt-BR').includes(search))
        && (!params.get('category') || product.category === params.get('category'))
        && (!params.get('subcategory') || product.subcategory === params.get('subcategory'))
        && (!params.get('brand') || product.brand === params.get('brand'))
        && (!params.get('gender') || product.gender === params.get('gender'))
        && (!params.get('size') || product.sizes.includes(params.get('size')!))
        && (!params.get('color') || product.colors.includes(params.get('color')!))
        && (!params.get('minPrice') || product.price >= Number(params.get('minPrice')))
        && (!params.get('maxPrice') || product.price <= Number(params.get('maxPrice')))
    })

    filtered = sortProducts(filtered, params.get('sort'))
    const limit = Math.max(Number(params.get('limit') || 10), 1)
    const page = Math.max(Number(params.get('page') || 1), 1)
    const totalPages = Math.max(Math.ceil(filtered.length / limit), 1)
    const pageProducts = filtered.slice((page - 1) * limit, page * limit)
    return { products: pageProducts, totalPages, currentPage: page, total: filtered.length } as T
  }

  throw new Error(`Rota local não suportada: ${endpoint}`)
}

async function unsupportedMutation<T>(): Promise<T> {
  throw new Error('Esta operação requer um backend e não está disponível no modo catálogo Markdown.')
}

export const api = {
  get: <T = unknown>(endpoint: string) => get<T>(endpoint),
  post: <T = unknown>(_endpoint: string, _data?: unknown) => {
    void _endpoint
    void _data
    return unsupportedMutation<T>()
  },
  put: <T = unknown>(_endpoint: string, _data?: unknown) => {
    void _endpoint
    void _data
    return unsupportedMutation<T>()
  },
  delete: <T = unknown>(_endpoint: string) => {
    void _endpoint
    return unsupportedMutation<T>()
  },
  loadCatalog,
  filters: {} as ProductFilters,
}

export type { Product, ProductListResponse }
export default api
