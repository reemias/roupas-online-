import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useComments } from '../../contexts/CommentsContext';
import {
  Star,
  Trash2,
  User,
  Calendar,
  ThumbsUp,
  ThumbsDown,
  Share2,
  CheckCircle,
  Flag,
} from 'lucide-react';
import style from './Comments.module.css';

const localReviewsKey = (productId: string) => `insider:reviews:${productId}`;
const localCommentsKey = (productId: string) => `insider:comments:${productId}`;

interface Review {
  _id: string;
  product: string;
  user: { _id: string; name: string };
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
}

interface Comment {
  _id: string;
  product: string;
  user: { _id: string; name: string };
  content: string;
  createdAt: string;
}

interface CommentsProps {
  productId: string;
}

const Comments = ({ productId }: CommentsProps) => {
  const { user } = useAuth();
  const {
    reviews,
    comments,
    loading,
    error,
    loadComments,
    addComment,
    deleteComment,
    addReview,
    deleteReview,
    userHasReviewed,
    productId: contextProductId,
  } = useComments();

  const [newComment, setNewComment] = useState('');
  const [rating, setRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [localReviews, setLocalReviews] = useState<Review[]>(() => {
    try { return JSON.parse(localStorage.getItem(localReviewsKey(productId)) || '[]'); } catch { return []; }
  });
  const [localComments, setLocalComments] = useState<Comment[]>(() => {
    try { return JSON.parse(localStorage.getItem(localCommentsKey(productId)) || '[]'); } catch { return []; }
  });

  const allReviews = [...localReviews, ...reviews];
  const allComments = [...localComments, ...comments];
  const saveLocalReviews = (next: Review[]) => { setLocalReviews(next); localStorage.setItem(localReviewsKey(productId), JSON.stringify(next)); };
  const saveLocalComments = (next: Comment[]) => { setLocalComments(next); localStorage.setItem(localCommentsKey(productId), JSON.stringify(next)); };

  useEffect(() => {
    if (productId && productId !== contextProductId) {
      loadComments(productId);
    }
  }, [productId, contextProductId, loadComments]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      const localComment: Comment = { _id: `local-comment-${Date.now()}`, product: productId, user: { _id: user?.id || 'local-user', name: user?.name || 'Você' }, content: newComment.trim(), createdAt: new Date().toISOString() };
      saveLocalComments([localComment, ...localComments]);
      if (user) await addComment(newComment.trim());
      setNewComment('');
    } catch {
      // erro tratado no contexto
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este comentário?')) return;
    await deleteComment(id);
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return alert('Selecione uma nota');
    if (!reviewTitle.trim() || !reviewComment.trim()) return alert('Preencha título e comentário');
    setSubmitting(true);
    try {
      const localReview: Review = { _id: `local-review-${Date.now()}`, product: productId, user: { _id: user?.id || 'local-user', name: user?.name || 'Você' }, rating, title: reviewTitle.trim(), comment: reviewComment.trim(), createdAt: new Date().toISOString() };
      saveLocalReviews([localReview, ...localReviews]);
      if (user) await addReview(rating, reviewTitle.trim(), reviewComment.trim());
      setRating(0);
      setReviewTitle('');
      setReviewComment('');
      setShowReviewForm(false);
    } catch {
      // erro tratado
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta avaliação?')) return;
    if (id.startsWith('local-')) saveLocalReviews(localReviews.filter((review) => review._id !== id));
    else await deleteReview(id);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  // Função para gerar estrelas
  const renderStars = (count: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={16}
        fill={i < count ? '#f5a623' : 'none'}
        color="#f5a623"
      />
    ));
  };

  if (loading) return <div className={style.loading}>Carregando comentários...</div>;
  if (error) return <div className={style.error}>{error}</div>;

  return (
    <div className={style.commentsContainer}>
      <h3 className={style.title}>Comentários e Avaliações</h3>

      {/* ===== SEÇÃO DE AVALIAÇÕES ===== */}
      <div className={style.reviewsSection}>
        <div className={style.reviewsHeader}>
          <h4>Avaliações ({allReviews.length})</h4>
          {!userHasReviewed && !showReviewForm && (
            <button onClick={() => setShowReviewForm(true)} className={style.addReviewBtn}>
              Avaliar produto
            </button>
          )}
        </div>

        {showReviewForm && (
          <form onSubmit={handleAddReview} className={style.reviewForm}>
            <div className={style.starSelector}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={style.starBtn}
                >
                  <Star size={28} fill={star <= rating ? '#f5a623' : 'none'} color="#f5a623" />
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="Título da avaliação"
              value={reviewTitle}
              onChange={(e) => setReviewTitle(e.target.value)}
              required
            />
            <textarea
              placeholder="Descreva sua experiência..."
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              rows={3}
              required
            />
            <div className={style.formActions}>
              <button type="button" onClick={() => setShowReviewForm(false)} className={style.cancelBtn}>
                Cancelar
              </button>
              <button type="submit" disabled={submitting} className={style.submitBtn}>
                {submitting ? 'Enviando...' : 'Enviar avaliação'}
              </button>
            </div>
          </form>
        )}

        {allReviews.length === 0 && !showReviewForm && (
          <p className={style.emptyMsg}>Nenhuma avaliação ainda. Seja o primeiro!</p>
        )}

        <div className={style.reviewsList}>
          {allReviews.map((review) => (
            <div key={review._id} className={style.reviewCard}>
              {/* Cabeçalho do usuário */}
              <div className={style.reviewHeader}>
                <div className={style.userInfo}>
                  <User size={18} className={style.userIcon} />
                  <span className={style.userName}>{review.user.name}</span>
                  <span className={style.verifiedBadge}>
                    <CheckCircle size={14} /> Comprador verificado
                  </span>
                  <span className={style.countryFlag}>
                    <Flag size={14} /> Brasil
                  </span>
                </div>
              </div>

              {/* Estrelas e título */}
              <div className={style.reviewContent}>
                <div className={style.reviewStars}>{renderStars(review.rating)}</div>
                <h5 className={style.reviewTitle}>{review.title}</h5>
                <p className={style.reviewText}>{review.comment}</p>
              </div>

              {/* Experiência de compra (simulada) */}
              <div className={style.experienceSection}>
                <span className={style.experienceLabel}>Como foi a sua experiência de compra?</span>
                <div className={style.experienceOptions}>
                  <span className={style.experienceBadge}>Ruim</span>
                  <span className={`${style.experienceBadge} ${style.active}`}>Excelente</span>
                  <span className={style.experienceBadge}>Muito pequeno</span>
                  <span className={style.experienceBadge}>Muito grande</span>
                </div>
              </div>

              {/* Ações: Compartilhar e Útil */}
              <div className={style.reviewActions}>
                <button className={style.shareBtn}>
                  <Share2 size={16} /> Compartilhar
                </button>
                <div className={style.helpfulButtons}>
                  <button className={style.helpfulBtn}>
                    <ThumbsUp size={16} /> 0
                  </button>
                  <button className={style.helpfulBtn}>
                    <ThumbsDown size={16} /> 0
                  </button>
                </div>
                {((user && review.user._id === user.id) || review._id.startsWith('local-')) && (
                  <button
                    onClick={() => handleDeleteReview(review._id)}
                    className={style.deleteBtn}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              <div className={style.reviewDate}>
                <Calendar size={12} /> {formatDate(review.createdAt)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== SEÇÃO DE COMENTÁRIOS ===== */}
      <div className={style.commentsSection}>
        <h4>Comentários ({allComments.length})</h4>

        {<form onSubmit={handleAddComment} className={style.commentForm}>
            <textarea
              placeholder="Deixe seu comentário..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={2}
              required
            />
            <button type="submit" disabled={submitting || !newComment.trim()}>
              {submitting ? 'Enviando...' : 'Comentar'}
            </button>
        </form>}

        <div className={style.commentsList}>
          {allComments.length === 0 && <p className={style.emptyMsg}>Nenhum comentário ainda.</p>}
          {allComments.map((comment) => (
            <div key={comment._id} className={style.commentCard}>
              <div className={style.commentHeader}>
                <div className={style.commentUser}>
                  <div className={style.Circle}>
                    <User size={14} />
                  </div>
                  <span>{comment.user.name}</span>
                  <span className={style.commentDate}>{formatDate(comment.createdAt)}</span>
                </div>
                {((user && comment.user._id === user.id) || comment._id.startsWith('local-')) && (
                  <button
                    onClick={() => comment._id.startsWith('local-') ? saveLocalComments(localComments.filter((item) => item._id !== comment._id)) : handleDeleteComment(comment._id)}
                    className={style.deleteBtn}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              <p className={style.commentContent}>{comment.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Comments;
