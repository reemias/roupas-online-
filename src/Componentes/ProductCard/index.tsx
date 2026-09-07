import { Link } from 'react-router-dom';
import { Star, ShoppingBag } from 'lucide-react';
import style from './ProductCard.module.css';
import ImageWithLoader from '../ImageWithLoader';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  discount?: number;
  image: string;
  rating?: number;
  reviews?: number;
  isBestSeller?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  name,
  price,
  discount = 0,
  image,
  rating = 0,
  reviews = 0,
  isBestSeller = false,
}) => {
  const discountedPrice = discount > 0 ? price * (1 - discount / 100) : price;

  return (
    <div className={style.card}>
      <Link to={`/produto/${id}`} className={style.link}>
        <div className={style.imageWrapper}>
          <ImageWithLoader src={image} alt={name} />
          <div className={style.badges}>
            {isBestSeller && <span className={style.badgeBestSeller}>BEST SELLER</span>}
            {discount > 0 && <span className={style.badgeDiscount}>{discount}% OFF</span>}
          </div>
          <button className={style.quickBuy}>
            <ShoppingBag size={16} />
            COMPRA RÁPIDA
          </button>
        </div>
        <div className={style.info}>
          <h3 className={style.name}>{name}</h3>
          <div className={style.priceRow}>
            {discount > 0 ? (
              <>
                <span className={style.originalPrice}>R${price}</span>
                <span className={style.discountedPrice}>R${discountedPrice.toFixed(0)}</span>
              </>
            ) : (
              <span className={style.price}>R${price.toFixed(2)}</span>
            )}
          </div>
          {rating > 0 && (
            <div className={style.rating}>
              <div className={style.stars}>
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    fill={i < Math.round(rating) ? '#000000' : 'none'}
                    stroke={i < Math.round(rating) ? '#000000' : '#ccc'}
                  />
                ))}
              </div>
              <span className={style.ratingText}>
                {rating.toFixed(1)} ({reviews} reviews)
              </span>
            </div>
          )}
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
