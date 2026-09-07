import { useState } from 'react';
import style from './ImageWithLoader.module.css';

interface ImageWithLoaderProps {
  src?: string;
  alt: string;
  className?: string;
  imageClassName?: string;
}

const ImageWithLoader = ({
  src,
  alt,
  className = '',
  imageClassName = '',
}: ImageWithLoaderProps) => {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>(
    src ? 'loading' : 'error',
  );

  return (
    <span
      className={`${style.wrapper} ${className}`}
      data-status={status}
      role={status === 'error' ? 'img' : undefined}
      aria-label={status === 'error' ? `Imagem indisponível: ${alt}` : undefined}
    >
      {status === 'loading' && (
        <span className={style.loadingState} aria-label="Carregando imagem">
          <span className={style.spinner} />
          <span className={style.loadingText}>Carregando imagem</span>
        </span>
      )}

      {status === 'error' ? (
        <span className={style.errorState}>
          <span className={style.errorIcon} aria-hidden="true">×</span>
          <span>Imagem indisponível</span>
        </span>
      ) : (
        <img
          src={src}
          alt={alt}
          className={`${style.image} ${imageClassName}`}
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus('error')}
        />
      )}
    </span>
  );
};

export default ImageWithLoader;
