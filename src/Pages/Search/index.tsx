import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import ProductCard from '../../Componentes/ProductCard';
import LoadingSpinner from '../../Componentes/LoadingSpinner';
import Banner from '../../Img/Design sem nome (51).png';
import { useSearch } from '../../hooks/useSearch';
import type { Produto } from '../../types/Product';
import style from './Search.module.css';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const categoria = searchParams.get('categoria') || '';
  const subcategoria = searchParams.get('subcategoria') || '';

  const { fetchProducts } = useSearch();

  // Resultados da busca
  const [searchResults, setSearchResults] = useState<Produto[]>([]);
  const [searchPage, setSearchPage] = useState(1);
  const [hasMoreSearch, setHasMoreSearch] = useState(true);
  const [totalSearchResults, setTotalSearchResults] = useState(0);

  // Recomendações (sem filtros)
  const [recommended, setRecommended] = useState<Produto[]>([]);
  const [recommendedPage, setRecommendedPage] = useState(1);
  const [hasMoreRecommended, setHasMoreRecommended] = useState(true);

  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loaderRef = useRef<HTMLDivElement>(null);
  const loadedIds = useRef<Set<string>>(new Set());

  // Função para buscar resultados com os filtros atuais
  const fetchSearchResults = useCallback(
    async (page: number): Promise<Produto[]> => {
      const hasQuery = query.trim() !== '';
      const hasCategory = categoria !== '';
      const hasSubcategory = subcategoria !== '';

      // Só faz a busca se houver ao menos um filtro
      if (!hasQuery && !hasCategory && !hasSubcategory) return [];

      try {
        const response = await fetchProducts(page, 8, { q: query, categoria, subcategoria });
        const products = response.products || [];
        setHasMoreSearch(
          typeof response.totalPages === 'number'
            ? page < response.totalPages
            : products.length === 8
        );
        setTotalSearchResults(prevTotal => {
          if (page === 1) return products.length;
          return prevTotal + products.length;
        });
        return products;
      } catch (err) {
        setError((err as Error).message);
        return [];
      }
    },
    [query, categoria, subcategoria, fetchProducts]
  );

  // Buscar recomendações (mais vendidos/visualizados) – sem filtros
  const fetchRecommended = useCallback(
    async (page: number): Promise<Produto[]> => {
      try {
        const response = await fetchProducts(page, 8, {});
        const products = response.products || [];
        setHasMoreRecommended(
          typeof response.totalPages === 'number'
            ? page < response.totalPages
            : products.length === 8
        );
        return products;
      } catch (err) {
        console.error('Erro ao buscar recomendados:', err);
        return [];
      }
    },
    [fetchProducts]
  );

  // Carregamento inicial
  useEffect(() => {
    const loadInitial = async () => {
      setLoadingInitial(true);
      setError(null);
      setSearchResults([]);
      setRecommended([]);
      setSearchPage(1);
      setRecommendedPage(1);
      loadedIds.current = new Set();

      try {
        // Busca principal
        const searchData = await fetchSearchResults(1);
        setSearchResults(searchData);
        searchData.forEach(p => loadedIds.current.add(p._id));

        // Recomendações (exclui duplicatas)
        let recData = await fetchRecommended(1);
        recData = recData.filter(p => !loadedIds.current.has(p._id));
        setRecommended(recData);
        recData.forEach(p => loadedIds.current.add(p._id));
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar');
      } finally {
        setLoadingInitial(false);
      }
    };

    loadInitial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, categoria, subcategoria]); // Recarrega ao mudar qualquer filtro

  // Scroll infinito
  const loadMore = useCallback(async () => {
    if (loadingMore) return;
    setLoadingMore(true);

    try {
      if (hasMoreSearch) {
        const nextPage = searchPage + 1;
        const newSearch = await fetchSearchResults(nextPage);
        const filteredNew = newSearch.filter(p => !loadedIds.current.has(p._id));
        if (filteredNew.length > 0) {
          setSearchResults(prev => [...prev, ...filteredNew]);
          filteredNew.forEach(p => loadedIds.current.add(p._id));
          setSearchPage(nextPage);
        }
      } else if (hasMoreRecommended) {
        const nextPage = recommendedPage + 1;
        let newRec = await fetchRecommended(nextPage);
        newRec = newRec.filter(p => !loadedIds.current.has(p._id));
        if (newRec.length > 0) {
          setRecommended(prev => [...prev, ...newRec]);
          newRec.forEach(p => loadedIds.current.add(p._id));
          setRecommendedPage(nextPage);
        }
      }
    } catch (err) {
      console.error('Erro ao carregar mais:', err);
    } finally {
      setLoadingMore(false);
    }
  }, [
    hasMoreSearch,
    hasMoreRecommended,
    searchPage,
    recommendedPage,
    fetchSearchResults,
    fetchRecommended,
    loadingMore,
  ]);

  // Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !loadingInitial && !loadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [loadingInitial, loadingMore, loadMore]);

  // Monta o título da página
  const getPageTitle = () => {
    if (query) return `Resultados para “${query}”`;
    if (categoria) return `Categoria: ${categoria}`;
    if (subcategoria) return `Subcategoria: ${subcategoria}`;
    return 'Busca';
  };

  const hasActiveFilters = query || categoria || subcategoria;

  // Estados vazios
  if (!hasActiveFilters) {
    return (
      <div className={style.container}>
        <div className={style.emptyState}>
          <Search size={48} strokeWidth={1} />
          <h2>O que você procura?</h2>
          <p>Encontre as peças que combinam com seu estilo.</p>
        </div>
      </div>
    );
  }

  if (loadingInitial) {
    return <LoadingSpinner fullScreen message="Buscando..." />;
  }

  const hasSearchResults = searchResults.length > 0;
  const hasRecommended = recommended.length > 0;
  const hasAnyResults = hasSearchResults || hasRecommended;

  return (
    <div className={style.container}>
      {/* Banner */}
      <div className={style.Banner}>
        <img src={Banner} alt="Banner" />
      </div>

      {/* Cabeçalho */}
      <div className={style.header}>
        <div className={style.Area_esquerda}>
          <h1>{getPageTitle()}</h1>
          <p className={style.subtitle}>
            {totalSearchResults > 0
              ? `${totalSearchResults} peças encontradas`
              : 'Nenhuma peça encontrada para sua busca'}
          </p>
        </div>
        <div className={style.Area_direita}>
          <Link to="/" className={style.backLink}>
            ← Explorar loja
          </Link>
        </div>
      </div>

      {error ? (
        <div className={style.error}>{error}</div>
      ) : !hasAnyResults ? (
        <div className={style.emptyState}>
          <Search size={48} strokeWidth={1} />
          <h2>Não encontramos nada{query && ` para “${query}”`}</h2>
          <p>Tente termos diferentes ou explore nossa coleção.</p>
          <Link to="/" className={style.backBtn}>
            Ver todas as peças
          </Link>
        </div>
      ) : (
        <>
          {/* Resultados da busca */}
          {hasSearchResults && (
            <section className={style.section}>
              <div className={style.sectionHeader}>
                <h3 className={style.sectionTitle}>Resultados da busca</h3>
                <span className={style.sectionCount}>{searchResults.length} peças</span>
              </div>
              <div className={style.productGrid}>
                {searchResults.map(produto => (
                  <ProductCard
                    key={produto._id}
                    id={produto._id}
                    name={produto.name}
                    price={produto.price}
                    discount={produto.discount}
                    image={produto.images?.[0] || '/placeholder.png'}
                    rating={produto.rating || 0}
                    reviews={produto.numReviews || 0}
                    isBestSeller={produto.isBestSeller || false}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Recomendações */}
          {hasRecommended && (
            <section className={style.section}>
              <div className={style.sectionHeader}>
                <h3 className={style.sectionTitle}>Você também pode gostar</h3>
                <span className={style.sectionCount}>{recommended.length} peças</span>
              </div>
              <div className={style.productGrid}>
                {recommended.map(produto => (
                  <ProductCard
                    key={produto._id}
                    id={produto._id}
                    name={produto.name}
                    price={produto.price}
                    discount={produto.discount}
                    image={produto.images?.[0] || '/placeholder.png'}
                    rating={produto.rating || 0}
                    reviews={produto.numReviews || 0}
                    isBestSeller={produto.isBestSeller || false}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Loader infinito */}
          <div ref={loaderRef} className={style.loader}>
            {loadingMore && <span>Carregando mais peças...</span>}
            {!hasMoreSearch && !hasMoreRecommended && hasAnyResults && (
              <span>Você viu tudo por aqui</span>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default SearchPage;
