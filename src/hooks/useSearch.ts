import { useState, useCallback } from 'react';
import api from '../services/api';
import type { Produto } from '../types/Product';

interface SearchFilters {
  q?: string;
  categoria?: string;
  subcategoria?: string;
}

interface SearchResponse {
  products: Produto[];
  total?: number;
  totalPages: number;
  currentPage: number;
}

export const useSearch = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(
    async (page: number, limit: number = 8, filters: SearchFilters = {}): Promise<SearchResponse> => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(limit),
        });

        if (filters.q?.trim()) params.append('search', filters.q.trim());
        if (filters.categoria) params.append('category', filters.categoria);
        if (filters.subcategoria) params.append('subcategory', filters.subcategoria);

        const data = await api.get<SearchResponse>(`/products?${params.toString()}`);
        return data;
      } catch (err: any) {
        const msg = err.message || 'Erro ao buscar produtos';
        setError(msg);
        throw new Error(msg);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { fetchProducts, loading, error };
};
