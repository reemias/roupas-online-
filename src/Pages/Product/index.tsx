import { useEffect, useMemo, useState } from "react";
import type { CSSProperties, MouseEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Minus,
  Plus,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
  X,
} from "lucide-react";
import { PhotoProvider, PhotoView } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";

import api from "../../services/api";
import { useCart } from "../../contexts/CartContext";
import ProductCard from "../../Componentes/ProductCard";
import LoadingSpinner from "../../Componentes/LoadingSpinner";
import ImageWithLoader from "../../Componentes/ImageWithLoader";
import PageMeta from "../../Componentes/PageMeta";
import Footer from "../../Componentes/Footer";
import { CommentsProvider } from "../../contexts/CommentsContext";
import Comments from "../../Componentes/Comments";
import style from "./Product.module.css";
import {
  getZoomOrigin,
  isRatingSelected,
  ratingBarWidth,
} from "./productInteractions";

interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  discount: number;
  images: string[];
  sizes: string[];
  colors: string[];
  stock: number;
  rating: number;
  numReviews: number;
  category: string;
  brand?: string;
  material?: string;
  careInstructions?: string;
}

const fallbackImage = "https://insider-roan.vercel.app/placeholder.jpg";

const money = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const colorMap: Record<string, string> = {
  preto: "#111111",
  branco: "#f5f3ef",
  azul: "#7895a7",
  rosa: "#dca9ab",
  vermelho: "#b85c57",
  verde: "#758a70",
  amarelo: "#d9ad56",
  marrom: "#8d6545",
};

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [recommended, setRecommended] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [showSearch, setShowSearch] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isHoverZoomed, setIsHoverZoomed] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await api.get<Product>(`/products/${id}`);
        setProduct(data);
        setSelectedColor(data.colors?.[0] || "");
        setSelectedSize(data.sizes?.[0] || "");
        setActiveImage(0);
        setError(null);
      } catch (err: unknown) {
        setError(
          err instanceof Error
            ? err.message
            : "Não foi possível carregar este produto.",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  useEffect(() => {
    const fetchRecommended = async () => {
      if (!product?.category) return;
      try {
        const data = await api.get<{ products: Product[] }>(
          `/products?category=${encodeURIComponent(product.category)}&limit=5`,
        );
        setRecommended(
          (data.products || [])
            .filter((item) => item._id !== product._id)
            .slice(0, 4),
        );
      } catch {
        setRecommended([]);
      }
    };
    fetchRecommended();
  }, [product]);

  const discountedPrice = useMemo(() => {
    if (!product) return 0;
    return product.discount > 0
      ? product.price * (1 - product.discount / 100)
      : product.price;
  }, [product]);

  if (loading) return <LoadingSpinner />;
  if (error || !product) {
    return (
      <main className={style.errorState}>
        <h1>Produto indisponível</h1>
        <p>{error || "Este produto não foi encontrado."}</p>
        <Link to="/">Voltar para a loja</Link>
      </main>
    );
  }

  const images = product.images?.length ? product.images : [fallbackImage];
  const productUrl = `${window.location.origin}/produto/${product._id}`;
  const whatsappMessage = encodeURIComponent(
    `Olá! Tenho interesse em ${product.name}. Vi na Insider: ${productUrl}`,
  );

  const handleAddToCart = () => {
    if (!selectedColor || !selectedSize) {
      window.alert("Selecione a cor e o tamanho antes de continuar.");
      return;
    }
    addItem({
      id: product._id,
      name: product.name,
      price: discountedPrice,
      image: images[0],
      color: selectedColor,
      size: selectedSize,
      quantity,
      maxStock: product.stock,
    });
    setAddedToCart(true);
    window.setTimeout(() => setAddedToCart(false), 4500);
  };

  const handleImageMove = (event: MouseEvent<HTMLButtonElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    setZoomOrigin(getZoomOrigin(event.clientX, event.clientY, bounds));
  };

  return (
    <>
      <PageMeta
        title={`${product.name} | Insider`}
        description={
          product.description?.slice(0, 155) || "Detalhes do produto Insider."
        }
        image={images[0]}
        url={productUrl}
        type="product"
        siteName="Insider Store"
      />
      <main className={style.page}>
        <div className={style.utilityBar}>
          <span>Frete grátis acima de R$ 299</span>
          <span>Compra segura e envio rápido</span>
        </div>

        {showSearch && (
          <div className={style.searchBar}>
            <input
              autoFocus
              placeholder="O que você está procurando?"
              onKeyDown={(event) =>
                event.key === "Enter" &&
                navigate(
                  `/busca?q=${encodeURIComponent(event.currentTarget.value)}`,
                )
              }
            />
            <button
              onClick={() => setShowSearch(false)}
              aria-label="Fechar busca"
            >
              <X size={18} />
            </button>
          </div>
        )}

        <div className={style.content}>
          <div className={style.breadcrumb}>
            <Link to="/">Início</Link>
            <ChevronRight size={14} />
            <Link
              to={`/busca?categoria=${encodeURIComponent(product.category)}`}
            >
              {product.category}
            </Link>
            <ChevronRight size={14} />
            <span>{product.name}</span>
          </div>
          <section className={style.productLayout}>
            <PhotoProvider maskOpacity={0.9} bannerVisible={false}>
              <div className={style.gallery}>
                <div className={style.thumbnailRail}>
                  {images.map((image, index) => (
                    <PhotoView key={`${image}-${index}`} src={image}>
                      <button
                        className={`${style.thumbnail} ${activeImage === index ? style.thumbnailActive : ""}`}
                        onClick={() => setActiveImage(index)}
                        aria-label={`Ver imagem ${index + 1}`}
                      >
                        <ImageWithLoader
                          src={image}
                          alt={`${product.name} - imagem ${index + 1}`}
                        />
                      </button>
                    </PhotoView>
                  ))}
                </div>
                <PhotoView src={images[activeImage]}>
                  <button
                    className={`${style.heroImage} ${isHoverZoomed ? style.heroImageZoomed : ""}`}
                    aria-label="Ampliar imagem do produto"
                    onMouseEnter={() => setIsHoverZoomed(true)}
                    onMouseLeave={() => setIsHoverZoomed(false)}
                    onMouseMove={handleImageMove}
                    style={
                      {
                        "--zoom-x": `${zoomOrigin.x}%`,
                        "--zoom-y": `${zoomOrigin.y}%`,
                      } as CSSProperties
                    }
                  >
                    <ImageWithLoader
                      src={images[activeImage]}
                      alt={product.name}
                    />
                    <span className={style.zoomHint}>
                      {isHoverZoomed
                        ? "Mova para explorar"
                        : "Passe o mouse para ampliar"}
                    </span>
                  </button>
                </PhotoView>
              </div>
            </PhotoProvider>

            <div className={style.details}>
              <div className={style.eyebrow}>
                <span>{product.brand || "Insider Collection"}</span>
                {product.discount > 0 && <strong>Oferta especial</strong>}
              </div>
              <h1>{product.name}</h1>
              <div className={style.ratingLine}>
                <span className={style.stars}>
                  {[0, 1, 2, 3, 4].map((star) => (
                    <Star
                      key={star}
                      size={16}
                      fill={
                        star < Math.round(product.rating || 0)
                          ? "currentColor"
                          : "none"
                      }
                    />
                  ))}
                </span>
                <b>{(product.rating || 0).toFixed(1)}</b>
                <a href="#reviews">({product.numReviews || 0} avaliações)</a>
              </div>
              <div className={style.priceBlock}>
                {product.discount > 0 && (
                  <span className={style.oldPrice}>{money(product.price)}</span>
                )}
                <strong>{money(discountedPrice)}</strong>
                {product.discount > 0 && (
                  <span className={style.discountPill}>
                    {product.discount}% OFF
                  </span>
                )}
                <small>ou em até 6x sem juros</small>
              </div>
              <div className={style.divider} />
              {product.colors?.length > 0 && (
                <div className={style.optionBlock}>
                  <div className={style.optionLabel}>
                    Cor: <b>{selectedColor}</b>
                  </div>
                  <div className={style.colorOptions}>
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        title={color}
                        onClick={() => setSelectedColor(color)}
                        className={`${style.colorOption} ${selectedColor === color ? style.colorSelected : ""}`}
                        style={{
                          backgroundColor:
                            colorMap[color.toLowerCase()] || color,
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
              {product.sizes?.length > 0 && (
                <div className={style.optionBlock}>
                  <div className={style.optionLabel}>
                    Tamanho{" "}
                    <button className={style.sizeGuide}>Guia de medidas</button>
                  </div>
                  <div className={style.sizeOptions}>
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={
                          selectedSize === size ? style.sizeSelected : ""
                        }
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className={style.stockLine}>
                <span className={style.stockDot} />
                {product.stock > 0
                  ? `Em estoque · ${product.stock} unidades disponíveis`
                  : "Produto esgotado"}
              </div>
              <div className={style.buyRow}>
                <div className={style.quantity}>
                  <button
                    onClick={() =>
                      setQuantity((value) => Math.max(1, value - 1))
                    }
                    aria-label="Diminuir quantidade"
                  >
                    <Minus size={16} />
                  </button>
                  <span>{quantity}</span>
                  <button
                    onClick={() =>
                      setQuantity((value) =>
                        Math.min(product.stock || value + 1, value + 1),
                      )
                    }
                    aria-label="Aumentar quantidade"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <button
                  className={style.buyButton}
                  onClick={handleAddToCart}
                  disabled={!product.stock}
                >
                  {addedToCart ? (
                    <>
                      <Check size={18} /> Adicionado ao carrinho
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={18} /> Comprar agora
                    </>
                  )}
                </button>
              </div>
              {addedToCart && (
                <button
                  className={style.cartLink}
                  onClick={() => navigate("/carrinho")}
                >
                  Ver carrinho e finalizar compra <ArrowLeft size={15} />
                </button>
              )}
              <div className={style.benefitList}>
                <div>
                  <Truck size={20} />
                  <span>
                    <b>Entrega rápida</b>
                    <small>Envio para todo o Brasil</small>
                  </span>
                </div>
                <div>
                  <ShieldCheck size={20} />
                  <span>
                    <b>Compra protegida</b>
                    <small>Pagamento 100% seguro</small>
                  </span>
                </div>
                <div>
                  <RotateCcw size={20} />
                  <span>
                    <b>Troca fácil</b>
                    <small>Até 30 dias após o recebimento</small>
                  </span>
                </div>
              </div>
              <a
                className={style.whatsappLink}
                href={`https://wa.me/5582988873225?text=${whatsappMessage}`}
                target="_blank"
                rel="noreferrer"
              >
                Fale com a gente pelo WhatsApp
              </a>
            </div>
          </section>

          <section className={style.infoSection}>
            <div className={style.infoIntro}>
              <span className={style.sectionKicker}>Detalhes</span>
              <h2>Feito para fazer parte da sua rotina.</h2>
              <p>
                {product.description ||
                  "Uma peça pensada para acompanhar você com conforto, qualidade e estilo em todos os momentos."}
              </p>
            </div>
            <div className={style.specGrid}>
              <div>
                <span>Material</span>
                <b>{product.material || "Selecionado para maior conforto"}</b>
              </div>
              <div>
                <span>Marca</span>
                <b>{product.brand || "Insider"}</b>
              </div>
              <div>
                <span>Categoria</span>
                <b>{product.category}</b>
              </div>
              <div>
                <span>Cuidados</span>
                <b>
                  {product.careInstructions || "Siga as instruções da etiqueta"}
                </b>
              </div>
            </div>
          </section>

          <section id="reviews" className={style.reviewsSection}>
            <div className={style.sectionHeading}>
              <div>
                <span className={style.sectionKicker}>Experiências reais</span>
                <h2>O que nossos clientes dizem</h2>
              </div>
              <div className={style.score}>
                <strong>{(product.rating || 0).toFixed(1)}</strong>
                <span className={style.stars}>
                  {[0, 1, 2, 3, 4].map((star) => (
                    <Star
                      key={star}
                      size={15}
                      fill={
                        star < Math.round(product.rating || 0)
                          ? "currentColor"
                          : "none"
                      }
                    />
                  ))}
                </span>
                <small>{product.numReviews || 0} avaliações</small>
              </div>
            </div>
            <div className={style.reviewSummary}>
              <div className={style.reviewPrompt}>
                <span className={style.reviewPromptLabel}>
                  Avalie este produto
                </span>
                <div
                  className={style.interactiveStars}
                  onMouseLeave={() => setHoveredRating(0)}
                  aria-label="Escolha uma nota de 1 a 5 estrelas"
                >
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      aria-label={`${rating} estrela${rating > 1 ? "s" : ""}`}
                      aria-pressed={selectedRating === rating}
                      onMouseEnter={() => setHoveredRating(rating)}
                      onClick={() => setSelectedRating(rating)}
                    >
                      <Star
                        size={28}
                        fill={
                          isRatingSelected(
                            hoveredRating || selectedRating,
                            rating,
                          )
                            ? "currentColor"
                            : "none"
                        }
                      />
                    </button>
                  ))}
                </div>
                <span className={style.ratingFeedback}>
                  {selectedRating
                    ? `Você selecionou ${selectedRating} de 5 estrelas`
                    : "Clique nas estrelas para deixar sua nota"}
                </span>
              </div>
              <div className={style.ratingBars}>
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating} className={style.ratingBar}>
                    <span>{rating}</span>
                    <Star size={12} fill="currentColor" />
                    <div>
                      <i
                        style={{
                          width: `${ratingBarWidth(rating, product.rating || 0)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <CommentsProvider>
              <Comments productId={product._id} />
            </CommentsProvider>
          </section>

          {recommended.length > 0 && (
            <section className={style.recommendedSection}>
              <div className={style.sectionHeading}>
                <div>
                  <span className={style.sectionKicker}>Complete seu look</span>
                  <h2>Você também pode gostar</h2>
                </div>
                <Link
                  to={`/busca?categoria=${encodeURIComponent(product.category)}`}
                >
                  Ver todos <ChevronRight size={16} />
                </Link>
              </div>
              <div className={style.recommendedGrid}>
                {recommended.map((item) => (
                  <ProductCard
                    key={item._id}
                    id={item._id}
                    name={item.name}
                    price={item.price}
                    discount={item.discount}
                    image={item.images?.[0] || fallbackImage}
                    rating={item.rating || 0}
                    reviews={item.numReviews || 0}
                    isBestSeller={false}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default ProductDetails;
