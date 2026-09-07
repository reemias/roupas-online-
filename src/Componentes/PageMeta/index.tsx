import { Helmet } from 'react-helmet-async';

interface PageMetaProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  siteName?: string;
  type?: 'website' | 'product' | 'article';
}

const PageMeta = ({
  title = 'Insider - Roupas Tecnológicas',
  description = 'Roupas masculinas e femininas com tecnologia de ponta. Conforto, estilo e inovação.',
  image = 'https://insider-roan.vercel.app/og-image.jpg', // imagem padrão
  url = 'https://insider-roan.vercel.app',
  siteName = 'Insider Store',
  type = 'website',
}: PageMetaProps) => {
  return (
    <Helmet>
      {/* Título da página */}
      <title>{title}</title>

      {/* Meta tags básicas */}
      <meta name="description" content={description} />
      <meta name="robots" content="index, follow" />

      {/* Open Graph (Facebook, WhatsApp, LinkedIn) */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteName} />

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Ícones e etc (opcional) */}
      <link rel="canonical" href={url} />
    </Helmet>
  );
};

export default PageMeta;