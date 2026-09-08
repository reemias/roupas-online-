import { useState, useEffect, useCallback, useRef } from "react";
import { MapPinCheckIcon, Phone, Star, X } from "lucide-react";
import api from "../../services/api";
import ProductCard from "../../Componentes/ProductCard";
import style from "./Home.module.css";
import Banner from "../../Img/Design sem nome (1).png";
import Banner2 from "../../Img/banner2.png";
import Banner3 from "../../Img/banner3.png";
import LoadingSpinner from "../../Componentes/LoadingSpinner";
import PageMeta from "../../Componentes/PageMeta";
import Footer from "../../Componentes/Footer";
import ImageWithLoader from "../../Componentes/ImageWithLoader";
import Whatsapp from "../../Img/Whatsapp_37229.ico";

// ============================================================
// TIPOS
// ============================================================
interface Produto {
  _id: string;
  name: string;
  price: number;
  discount: number;
  images: string[];
  rating: number;
  numReviews: number;
  category: string;
  brand: string;
  gender: string;
  sizes: string[];
  colors: string[];
  isBestSeller: boolean;
}

interface Filters {
  category: string;
  brand: string;
  gender: string;
  size: string;
  color: string;
  minPrice: number;
  maxPrice: number;
  sort: string;
}

interface Unidade {
  nome: string;
  endereco: string;
  telefone: string;
  whatsapp: string;
  mapaUrl: string;
}

// ============================================================
// DADOS DAS UNIDADES (pode vir de uma API futuramente)
// ============================================================
const UNIDADES: Unidade[] = [
  {
    nome: "Ponta Verde",
    endereco: "Rua Exemplo, 123 - Ponta Verde, Maceió-AL",
    telefone: "(82) 98896-3444",
    whatsapp: "5582988963444",
    mapaUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3933.350883402848!2d-35.71177989999999!3d-9.651029699999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x70145bba3ec13a3%3A0xaecb9c5f20553107!2sAnimal%20Amigo%3A%20Cl%C3%ADnica%20Veterin%C3%A1ria%2C%20Banho%20e%20Tosa%20e%20Pet%20Shop%20em%20Macei%C3%B3!5e0!3m2!1spt-BR!2sbr!4v1765216204994!5m2!1spt-BR!2sbr",
  },
  // Adicione outras unidades aqui
];

// ============================================================
// COMPONENTE POPUP MAPA (extraído para melhor organização)
// ============================================================
const PopUpMapa = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  if (!isOpen) return null;

  return (
    <div className={style.popupOverlay} onClick={onClose}>
      <div
        className={style.popupContainer}
        onClick={(e) => e.stopPropagation()}
      >
        <button className={style.popupClose} onClick={onClose}>
          <X size={24} />
        </button>
        {UNIDADES.map((unidade) => (
          <div key={unidade.nome} className={style.unidadeCard}>
            <h2 className={style.popupTitle}>{unidade.endereco}</h2>

            <h3 className={style.unidadeNome}>{unidade.nome}</h3>

            {/* Mapa */}
            <div className={style.mapaContainer}>
              <iframe
                src={unidade.mapaUrl}
                width="100%"
                height="280"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`Mapa - ${unidade.nome}`}
              />
            </div>

            {/* WhatsApp */}
            <a
              href={`https://api.whatsapp.com/send?phone=55${unidade.whatsapp}&text=Ol%C3%A1,%20gostaria%20de%20mais%20informa%C3%A7%C3%B5es%20sobre%20os%20servi%C3%A7os`}
              target="_blank"
              rel="noopener noreferrer"
              className={style.unidadeWhatsapp}
            >
              <i className="fab fa-whatsapp"></i> {unidade.telefone}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================
// COMPONENTE PRINCIPAL HOME
// ============================================================
const Home = () => {
  // Estados
  const [isMapPopupOpen, setIsMapPopupOpen] = useState(false);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [filters, setFilters] = useState<Filters>({
    category: "",
    brand: "",
    gender: "",
    size: "",
    color: "",
    minPrice: 0,
    maxPrice: 10000,
    sort: "createdAt",
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Slider de banners
  const slides = [Banner, Banner2, Banner3];
  const [currentSlide, setCurrentSlide] = useState(0);

  // Ref para o loader infinito
  const loaderRef = useRef<HTMLDivElement>(null);

  // ===== HANDLERS DO POPUP =====
  const abrirPopupMapa = () => setIsMapPopupOpen(true);
  const fecharPopupMapa = () => setIsMapPopupOpen(false);

  // ===== SLIDER =====
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [slides.length]);

  // ===== EXTRAIR OPCÕES ÚNICAS =====
  const categorias = [
    ...new Set(produtos.map((p) => p.category).filter(Boolean)),
  ];
  const marcas = [...new Set(produtos.map((p) => p.brand).filter(Boolean))];
  const tamanhos = ["P", "M", "G", "GG", "XGG", "PP", "XG", "XXG"];
  const cores = [
    "Preto",
    "Branco",
    "Azul",
    "Vermelho",
    "Verde",
    "Amarelo",
    "Cinza",
    "Marrom",
  ];

  // ===== BUSCA DE PRODUTOS =====
  const fetchProdutos = useCallback(
    async (pageNum: number, reset: boolean = false) => {
      try {
        if (reset) {
          setInitialLoading(true);
          setProdutos([]);
          setHasMore(true);
        } else {
          setLoadingMore(true);
        }

        const params = new URLSearchParams();
        params.append("page", String(pageNum));
        params.append("limit", "10");
        if (filters.category) params.append("category", filters.category);
        if (filters.brand) params.append("brand", filters.brand);
        if (filters.gender) params.append("gender", filters.gender);
        if (filters.size) params.append("size", filters.size);
        if (filters.color) params.append("color", filters.color);
        if (filters.minPrice > 0)
          params.append("minPrice", String(filters.minPrice));
        if (filters.maxPrice < 10000)
          params.append("maxPrice", String(filters.maxPrice));
        if (filters.sort) params.append("sort", filters.sort);

        const data = await api.get<{
          products: Produto[];
          totalPages: number;
          currentPage: number;
        }>(`/products?${params.toString()}`);

        const produtosArray = data?.products || [];
        setTotalResults(
          data?.totalPages ? data.totalPages * 10 : produtosArray.length,
        );

        if (reset) {
          setProdutos(produtosArray);
        } else {
          setProdutos((prev) => [...prev, ...produtosArray]);
        }

        setHasMore(produtosArray.length === 10);
        setError(null);
      } catch (err: any) {
        console.error("Erro ao buscar produtos:", err);
        if (reset) setError(err.message || "Erro ao carregar produtos");
      } finally {
        setInitialLoading(false);
        setLoadingMore(false);
      }
    },
    [filters],
  );

  // ===== EFEITOS =====
  useEffect(() => {
    setPage(1);
  }, [filters]);

  useEffect(() => {
    const isReset = page === 1;
    fetchProdutos(page, isReset);
  }, [page, fetchProdutos]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          !initialLoading &&
          !loadingMore &&
          hasMore
        ) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.1 },
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [initialLoading, loadingMore, hasMore]);

  // ===== HANDLERS DE FILTRO E ORDENAÇÃO =====
  const handleFilterChange = (key: keyof Filters, value: string | number) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const toggleSortDropdown = () => setIsDropdownOpen((prev) => !prev);
  const selectSort = (sort: string) => {
    setFilters((prev) => ({ ...prev, sort }));
    setIsDropdownOpen(false);
  };

  const clearFilters = () => {
    setFilters({
      category: "",
      brand: "",
      gender: "",
      size: "",
      color: "",
      minPrice: 0,
      maxPrice: 10000,
      sort: "createdAt",
    });
  };

  // ===== LOADING INICIAL =====
  if (initialLoading && produtos.length === 0) {
    return <LoadingSpinner />;
  }

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <>
      <div className={style.ContainerHome}>
        <PageMeta
          title="Roupas Online - Comprar suas Roupas em um local seguro e confiável"
          description="Descubra as melhores roupas masculinas e femininas com tecnologia de ponta. Conforto, estilo e inovação."
          image="https://insider-roan.vercel.app/banner-home.jpg"
          url="https://insider-roan.vercel.app"
          type="website"
        />

        {/* ===== BANNER SLIDER ===== */}
        <div className={style.Banner}>
          <div className={style.slidesWrapper}>
            {slides.map((src, index) => (
              <ImageWithLoader
                key={index}
                src={src}
                alt={`Banner ${index + 1}`}
                className={`${style.slide} ${index === currentSlide ? style.active : ""}`}
              />
            ))}
          </div>
          <div className={style.dots}>
            {slides.map((_, index) => (
              <span
                key={index}
                className={`${style.dot} ${index === currentSlide ? style.activeDot : ""}`}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </div>
        </div>

        {/* ===== TOPO: VENDEDORES + LOCALIZAÇÃO + ORDENAÇÃO ===== */}
        <div className={style.filtro_Preco_Baixo_alto}>
          <div className={style.Titulo_Filtro_Home}>
            <div className={style.VendedoresButton}>
              <button>
                <img src={Whatsapp} alt="WhatsApp" /> Lista Vendedores
              </button>
              <div className={style.DropDown_Vendedores}>
                <a
                  href="https://wa.me/5511999999999"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Phone size={16} /> Marte
                </a>
                <a
                  href="https://wa.me/5511999999999"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Phone size={16} /> Carlos
                </a>
              </div>
            </div>
          </div>

          {/* Popup do mapa */}
          <PopUpMapa isOpen={isMapPopupOpen} onClose={fecharPopupMapa} />

          <div className={style.Area_Button_Filter_Home_Inter}>
            {/* Botão "Onde estamos" */}
            <button onClick={abrirPopupMapa} className={style.Area_Localizacao}>
              <MapPinCheckIcon size={20} />
              Onde estamos
            </button>

            <div className={style.Area_Resultados_mobile}>
              <p>Resultados {totalResults}</p>
            </div>

            <div className={style.dropdownContainer}>
              <button
                className={style.dropdownToggle}
                onClick={toggleSortDropdown}
              >
                ORDENAR POR
              </button>
              <ul
                className={`${style.dropdownMenu} ${isDropdownOpen ? style.open : ""}`}
              >
                <li onClick={() => selectSort("price")}>Menor Preço</li>
                <li onClick={() => selectSort("-price")}>Maior Preço</li>
                <li onClick={() => selectSort("createdAt")}>Mais Recentes</li>
                <li onClick={() => selectSort("views")}>Mais Vistos</li>
              </ul>
            </div>
          </div>
        </div>

        {/* ===== FILTROS (lateral esquerda) ===== */}
        <div className={`${style.filtro} ${style.mobileOpen}`}>
          <div className={style.filterHeader}>
            <h4>Filtros</h4>
            <button onClick={clearFilters} className={style.clearFilters}>
              Limpar
            </button>
          </div>

          {/* Categoria */}
          <div className={style.filterSection}>
            <h5>Categoria</h5>
            <div className={style.filterOptions}>
              <button
                className={`${style.filterOption} ${!filters.category ? style.active : ""}`}
                onClick={() => handleFilterChange("category", "")}
              >
                Todas
              </button>
              {categorias.map((cat) => (
                <button
                  key={cat}
                  className={`${style.filterOption} ${filters.category === cat ? style.active : ""}`}
                  onClick={() => handleFilterChange("category", cat)}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Marca */}
          <div className={style.filterSection}>
            <h5>Marca</h5>
            <div className={style.filterOptions}>
              <button
                className={`${style.filterOption} ${!filters.brand ? style.active : ""}`}
                onClick={() => handleFilterChange("brand", "")}
              >
                Todas
              </button>
              {marcas.map((marca) => (
                <button
                  key={marca}
                  className={`${style.filterOption} ${filters.brand === marca ? style.active : ""}`}
                  onClick={() => handleFilterChange("brand", marca)}
                >
                  {marca.charAt(0).toUpperCase() + marca.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Gênero */}
          <div className={style.filterSection}>
            <h5>Gênero</h5>
            <div className={style.filterOptions}>
              <button
                className={`${style.filterOption} ${!filters.gender ? style.active : ""}`}
                onClick={() => handleFilterChange("gender", "")}
              >
                Todos
              </button>
              <button
                className={`${style.filterOption} ${filters.gender === "masculino" ? style.active : ""}`}
                onClick={() => handleFilterChange("gender", "masculino")}
              >
                Masculino
              </button>
              <button
                className={`${style.filterOption} ${filters.gender === "feminino" ? style.active : ""}`}
                onClick={() => handleFilterChange("gender", "feminino")}
              >
                Feminino
              </button>
            </div>
          </div>

          {/* Tamanho */}
          <div className={style.filterSection}>
            <h5>Tamanho</h5>
            <div className={style.filterOptions}>
              <button
                className={`${style.filterOption} ${!filters.size ? style.active : ""}`}
                onClick={() => handleFilterChange("size", "")}
              >
                Todos
              </button>
              {tamanhos.map((size) => (
                <button
                  key={size}
                  className={`${style.filterOption} ${filters.size === size ? style.active : ""}`}
                  onClick={() => handleFilterChange("size", size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Cor */}
          <div className={style.filterSection}>
            <h5>Cor</h5>
            <div className={style.filterOptions}>
              <button
                className={`${style.filterOption} ${!filters.color ? style.active : ""}`}
                onClick={() => handleFilterChange("color", "")}
              >
                Todas
              </button>
              {cores.map((cor) => (
                <button
                  key={cor}
                  className={`${style.filterOption} ${filters.color === cor ? style.active : ""}`}
                  onClick={() => handleFilterChange("color", cor)}
                >
                  {cor}
                </button>
              ))}
            </div>
          </div>

          {/* Faixa de Preço */}
          <div className={style.filterSection}>
            <h5>Preço</h5>
            <div className={style.priceRange}>
              <input
                type="number"
                placeholder="Min"
                value={filters.minPrice || ""}
                onChange={(e) =>
                  handleFilterChange("minPrice", Number(e.target.value) || 0)
                }
                min="0"
              />
              <span>até</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.maxPrice || ""}
                onChange={(e) =>
                  handleFilterChange(
                    "maxPrice",
                    Number(e.target.value) || 10000,
                  )
                }
                min="0"
              />
            </div>
          </div>
        </div>

        {/* ===== GRADE DE PRODUTOS ===== */}
        <div className={style.Roupas}>
          {error ? (
            <div className={style.error}>{error}</div>
          ) : produtos.length === 0 ? (
            <div className={style.empty}>Nenhum produto encontrado</div>
          ) : (
            <>
              <div className={style.productGrid}>
                {produtos.map((produto) => (
                  <ProductCard
                    key={produto._id}
                    id={produto._id}
                    name={produto.name}
                    price={produto.price}
                    discount={produto.discount}
                    image={produto.images?.[0] || "/placeholder.png"}
                    rating={produto.rating || 0}
                    reviews={produto.numReviews || 0}
                    isBestSeller={produto.isBestSeller || false}
                  />
                ))}
              </div>
              <div ref={loaderRef} className={style.loader}>
                {loadingMore && <span>Carregando mais...</span>}
                {!hasMore && produtos.length > 0 && (
                  <span>Fim dos produtos</span>
                )}
              </div>
            </>
          )}
        </div>

        {/* ===== AVALIAÇÕES ===== */}
        <div className={style.Avaliacao}>
          <div className={style.ratingSummary}>
            <div className={style.ratingScore}>
              <span className={style.score}>4,9</span>
              <div className={style.stars}>
                <Star size={20} />
                <Star size={20} />
                <Star size={20} />
                <Star size={20} />
                <Star size={20} />
              </div>
              <p className={style.totalReviews}>
                Baseado em 117.246 Avaliações
              </p>
            </div>
          </div>

          <div className={style.Grafico}>
            <div className={style.ratingBars}>
              <div className={style.barRow}>
                <span className={style.barLabel}>5 ★</span>
                <div className={style.barTrack}>
                  <div className={style.barFill} style={{ width: "90%" }}></div>
                </div>
                <span className={style.barPercent}>90%</span>
                <span className={style.barCount}>(105.531)</span>
              </div>
              <div className={style.barRow}>
                <span className={style.barLabel}>4 ★</span>
                <div className={style.barTrack}>
                  <div className={style.barFill} style={{ width: "10%" }}></div>
                </div>
                <span className={style.barPercent}>10%</span>
                <span className={style.barCount}>(11.211)</span>
              </div>
              <div className={style.barRow}>
                <span className={style.barLabel}>3 ★</span>
                <div className={style.barTrack}>
                  <div className={style.barFill} style={{ width: "0%" }}></div>
                </div>
                <span className={style.barPercent}>0%</span>
                <span className={style.barCount}>(491)</span>
              </div>
              <div className={style.barRow}>
                <span className={style.barLabel}>2 ★</span>
                <div className={style.barTrack}>
                  <div className={style.barFill} style={{ width: "0%" }}></div>
                </div>
                <span className={style.barPercent}>0%</span>
                <span className={style.barCount}>(0)</span>
              </div>
              <div className={style.barRow}>
                <span className={style.barLabel}>1 ★</span>
                <div className={style.barTrack}>
                  <div className={style.barFill} style={{ width: "0%" }}></div>
                </div>
                <span className={style.barPercent}>0%</span>
                <span className={style.barCount}>(13)</span>
              </div>
            </div>

            <div className={style.recommendation}>
              <p>
                <span>99%</span> dos revisores recomendariam este produto
              </p>
            </div>
          </div>
        </div>

        {/* ===== COMENTÁRIOS ===== */}
        <div className={style.Comentarios}></div>
      </div>
      <Footer />
    </>
  );
};

export default Home;
