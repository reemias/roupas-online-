// api/preview.js
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  const { id } = req.query;
  const userAgent = req.headers['user-agent'] || '';

  const botRegex = /bot|crawler|spider|facebookexternalhit|Facebot|Twitterbot|LinkedInBot|WhatsApp|TelegramBot|Discordbot|Slackbot|Pinterest|embed|Googlebot|Bingbot|YandexBot|redditbot|tumblr|SkypeUriPreview|Slack-ImgProxy|Viber|Samsung|MetaInspector/i;

  // Se não for bot, serve o SPA (index.html) para evitar redirecionamento em loop
  if (!botRegex.test(userAgent)) {
    // Em produção, o caminho é relativo à raiz do projeto
    const indexPath = path.join(process.cwd(), 'dist', 'index.html');
    try {
      const html = fs.readFileSync(indexPath, 'utf8');
      res.setHeader('Content-Type', 'text/html');
      res.status(200).send(html);
      return;
    } catch (err) {
      // Se não encontrar (ex: em desenvolvimento), redireciona para a home para evitar loop
      console.error('Erro ao ler index.html:', err);
      res.writeHead(302, { Location: '/' });
      res.end();
      return;
    }
  }

  // ===== BOT DETECTADO – GERAR HTML COM META TAGS =====
  const apiUrl = process.env.VITE_API_URL || 'https://backend-insider.vercel.app/api';
  let product = null;

  try {
    const response = await fetch(`${apiUrl}/products/${id}`);
    if (response.ok) {
      product = await response.json();
    }
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
  }

  if (!product) {
    res.status(404).send('Produto não encontrado');
    return;
  }

  const title = product.name || 'Produto';
  const description = product.description?.slice(0, 150) || 'Confira este produto incrível!';
  // Acessa o primeiro item do array de imagens
  const image = product.images?.[0] ;
  const url = `https://insider-roan.vercel.app/produto/${product._id}`;

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - Insider</title>
  <meta name="description" content="${description}">
  
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${image}">
  <meta property="og:url" content="${url}">
  <meta property="og:type" content="product">
  <meta property="og:site_name" content="Insider Store">
  
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${image}">
  
  <script>
    setTimeout(() => {
      window.location.href = "${url}";
    }, 100);
  </script>
</head>
<body>
  <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;font-family:sans-serif;background:#f5f7fa;padding:20px;">
    <div style="max-width:600px;background:#fff;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,0.08);overflow:hidden;">
      <img src="${image}" alt="${title}" style="width:100%;height:auto;aspect-ratio:1/1;object-fit:cover;" onerror="this.src='https://insider-roan.vercel.app/og-default.jpg'">
      <div style="padding:24px;">
        <h1 style="font-size:24px;margin:0 0 8px;">${title}</h1>
        <p style="color:#555;margin:0;">${description}</p>
        <a href="${url}" style="display:inline-block;margin-top:16px;background:#1a1a2e;color:#fff;padding:10px 24px;border-radius:6px;text-decoration:none;">Ver produto</a>
      </div>
    </div>
  </div>
</body>
</html>
  `;

  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(html);
}