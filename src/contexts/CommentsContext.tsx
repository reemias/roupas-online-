import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

// ===== TIPOS =====
interface Review {
  _id: string;
  product: string;
  user: { _id: string; name: string };
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
  updatedAt?: string;
}

interface Comment {
  _id: string;
  product: string;
  user: { _id: string; name: string };
  content: string;
  createdAt: string;
  updatedAt?: string;
}

interface CommentsContextType {
  productId: string | null;
  reviews: Review[];
  comments: Comment[];
  loading: boolean;
  error: string | null;
  loadComments: (productId: string) => Promise<void>;
  addComment: (content: string) => Promise<void>;
  editComment: (commentId: string, content: string) => Promise<void>;
  deleteComment: (commentId: string) => Promise<void>;
  addReview: (rating: number, title: string, comment: string) => Promise<void>;
  editReview: (reviewId: string, rating: number, title: string, comment: string) => Promise<void>;
  deleteReview: (reviewId: string) => Promise<void>;
  userHasReviewed: boolean;
}

const CommentsContext = createContext<CommentsContextType | undefined>(undefined);

export const CommentsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [productId, setProductId] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ===== CARREGAR COMENTÁRIOS (com useCallback e verificação) =====
  const loadComments = useCallback(async (id: string) => {
    if (!id) return;
    if (id === productId) return; // Evita recarregar o mesmo produto
    setProductId(id);
    setLoading(true);
    setError(null);
    try {
      const [reviewsData, commentsData] = await Promise.all([
        api.get<Review[]>(`/reviews/product/${id}`),
        api.get<Comment[]>(`/comments/product/${id}`),
      ]);
      setReviews(reviewsData || []);
      setComments(commentsData || []);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar comentários');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  // ===== ADICIONAR COMENTÁRIO =====
  const addComment = async (content: string) => {
    if (!productId) return;
    try {
      const newComment = await api.post<Comment>('/comments', { product: productId, content });
      setComments(prev => [newComment, ...prev]);
    } catch (err: any) {
      setError(err.message || 'Erro ao adicionar comentário');
      throw err;
    }
  };

  // ===== EDITAR COMENTÁRIO =====
  const editComment = async (commentId: string, content: string) => {
    try {
      const updated = await api.put<Comment>(`/comments/${commentId}`, { content });
      setComments(prev => prev.map(c => c._id === commentId ? updated : c));
    } catch (err: any) {
      setError(err.message || 'Erro ao editar comentário');
      throw err;
    }
  };

  // ===== DELETAR COMENTÁRIO =====
  const deleteComment = async (commentId: string) => {
    try {
      await api.delete(`/comments/${commentId}`);
      setComments(prev => prev.filter(c => c._id !== commentId));
    } catch (err: any) {
      setError(err.message || 'Erro ao excluir comentário');
      throw err;
    }
  };

  // ===== ADICIONAR AVALIAÇÃO =====
  const addReview = async (rating: number, title: string, comment: string) => {
    if (!productId) return;
    try {
      const newReview = await api.post<Review>('/reviews', { product: productId, rating, title, comment });
      setReviews(prev => [newReview, ...prev]);
    } catch (err: any) {
      setError(err.message || 'Erro ao adicionar avaliação');
      throw err;
    }
  };

  // ===== EDITAR AVALIAÇÃO =====
  const editReview = async (reviewId: string, rating: number, title: string, comment: string) => {
    try {
      const updated = await api.put<Review>(`/reviews/${reviewId}`, { rating, title, comment });
      setReviews(prev => prev.map(r => r._id === reviewId ? updated : r));
    } catch (err: any) {
      setError(err.message || 'Erro ao editar avaliação');
      throw err;
    }
  };

  // ===== DELETAR AVALIAÇÃO =====
  const deleteReview = async (reviewId: string) => {
    try {
      await api.delete(`/reviews/${reviewId}`);
      setReviews(prev => prev.filter(r => r._id !== reviewId));
    } catch (err: any) {
      setError(err.message || 'Erro ao excluir avaliação');
      throw err;
    }
  };

  // ===== VERIFICA SE USUÁRIO JÁ AVALIOU =====
  const userHasReviewed = user ? reviews.some(r => r.user._id === user.id) : false;

  return (
    <CommentsContext.Provider
      value={{
        productId,
        reviews,
        comments,
        loading,
        error,
        loadComments,
        addComment,
        editComment,
        deleteComment,
        addReview,
        editReview,
        deleteReview,
        userHasReviewed,
      }}
    >
      {children}
    </CommentsContext.Provider>
  );
};

export const useComments = (): CommentsContextType => {
  const context = useContext(CommentsContext);
  if (!context) throw new Error('useComments must be used within a CommentsProvider');
  return context;
};