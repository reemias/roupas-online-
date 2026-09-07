import { ShoppingBag } from 'lucide-react';
import style from './LoadingSpinner.module.css';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  fullScreen?: boolean;
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  fullScreen = false,
  message,
}) => {
  const sizeMap = {
    small: 40,
    medium: 60,
    large: 80,
  };

  const iconSize = sizeMap[size];

  return (
    <div className={`${style.container} ${fullScreen ? style.fullScreen : ''}`}>
      <div className={style.spinner}>
        <div className={style.circle}>
          <ShoppingBag size={iconSize * 0.5} className={style.icon} />
        </div>
        {message && <p className={style.message}>{message}</p>}
      </div>
    </div>
  );
};

export default LoadingSpinner;