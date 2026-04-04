// client/src/components/Reviews.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../../login/contexts/AuthContext';
import RatingStars from './RatingStars';
import Button from '../../../core/components/UI/Button';
import api from '../../../../shared/services/api';

export default function Reviews({ productId }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ total: 0, averageRating: 0, distribution: {} });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    rating: 5,
    title: '',
    comment: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadReviews();
  }, [productId]);

  const loadReviews = async () => {
    try {
      const { data } = await api.get(`/reviews/product/${productId}`);
      setReviews(data.reviews);
      setStats(data.stats);
    } catch (error) {
      console.error('Error cargando reseñas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    
    try {
      await api.post('/reviews', {
        productId,
        rating: formData.rating,
        title: formData.title,
        comment: formData.comment
      });
      setSuccess('✅ Reseña publicada correctamente');
      setFormData({ rating: 5, title: '', comment: '' });
      setShowForm(false);
      loadReviews();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al publicar reseña');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!confirm('¿Eliminar esta reseña?')) return;
    try {
      await api.delete(`/reviews/${reviewId}`);
      loadReviews();
    } catch (error) {
      console.error('Error eliminando reseña:', error);
    }
  };

  if (loading) {
    return (
      <div className="border-t border-gray-100 pt-6 mt-6">
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t border-gray-100 pt-8 mt-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
        <span>💬</span> Opiniones de clientes
      </h2>
      
      {/* Estadísticas */}
      <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 p-6 bg-gray-50 rounded-2xl">
        <div className="text-center">
          <div className="text-5xl font-bold text-primary-600">{stats.averageRating || 0}</div>
          <RatingStars rating={Math.round(stats.averageRating)} size="sm" />
          <div className="text-sm text-gray-500 mt-1">{stats.total} opiniones</div>
        </div>
        <div className="flex-1 w-full">
          {[5,4,3,2,1].map(rating => (
            <div key={rating} className="flex items-center gap-2 text-sm mb-2">
              <span className="w-8 text-gray-600">{rating}★</span>
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                  style={{ width: `${(stats.distribution[rating] || 0) / stats.total * 100}%` }}
                />
              </div>
              <span className="w-12 text-gray-500">{stats.distribution[rating] || 0}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Botón para escribir reseña */}
      {user && !showForm && (
        <Button
          variant="outline"
          onClick={() => setShowForm(true)}
          className="mb-6"
        >
          ✍️ Escribir una reseña
        </Button>
      )}
      
      {/* Formulario de reseña */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 p-6 bg-gray-50 rounded-2xl animate-fade-in">
          <h3 className="font-semibold text-gray-900 mb-4">Tu opinión cuenta</h3>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-xl text-sm border border-red-200">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-xl text-sm border border-green-200">
              {success}
            </div>
          )}
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Calificación</label>
            <RatingStars 
              rating={formData.rating} 
              size="lg" 
              interactive={true}
              onRatingChange={(rating) => setFormData({ ...formData, rating })}
            />
          </div>
          
          <div className="mb-4">
            <input
              type="text"
              placeholder="Título (opcional)"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          
          <div className="mb-4">
            <textarea
              placeholder="Cuéntanos tu experiencia..."
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows="4"
              required
            />
          </div>
          
          <div className="flex gap-3">
            <Button
              type="submit"
              variant="primary"
              loading={submitting}
            >
              Publicar reseña
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowForm(false)}
            >
              Cancelar
            </Button>
          </div>
        </form>
      )}
      
      {/* Lista de reseñas */}
      <div className="space-y-6">
        {reviews.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">💬</div>
            <p>No hay reseñas aún. ¡Sé el primero en opinar!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review._id} className="border-b border-gray-100 pb-6 last:border-0">
              <div className="flex flex-wrap justify-between items-start gap-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <RatingStars rating={review.rating} size="sm" />
                    {review.isVerified && (
                      <span className="badge badge-success text-xs">
                        ✓ Compra verificada
                      </span>
                    )}
                  </div>
                  {review.title && (
                    <p className="font-semibold text-gray-900 mt-2">{review.title}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{review.userName}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(review.createdAt).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
              <p className="text-gray-600 mt-3 leading-relaxed">{review.comment}</p>
              
              {/* Botón eliminar (solo autor o admin) */}
              {(user?._id === review.userId || user?.role === 'admin') && (
                <button
                  onClick={() => handleDelete(review._id)}
                  className="mt-3 text-xs text-red-500 hover:text-red-700 transition"
                >
                  Eliminar reseña
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}