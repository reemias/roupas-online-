// Header.tsx
import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Menu, Search, ShoppingBag, User, X } from "lucide-react";
import style from "./Header.module.css";
import SideMenu from "../SideMenu";
import { useCart } from "../../contexts/CartContext";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";

interface Category {
  name: string;
  subcategories: string[];
}

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);
  const { totalItems, toggleDrawer } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Estado para categorias carregadas da API
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Busca categorias ao montar
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await api.get<Category[]>("/categories");
        setCategories(data);
      } catch (error) {
        console.error("Erro ao carregar categorias:", error);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  // Controles de menu mobile
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  // Busca
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/busca?q=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm("");
      setIsSearchOpen(false);
    }
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    if (!isSearchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  };

  // Dropdown hover
  const handleMouseEnter = (menu: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setOpenDropdown(menu);
  };

  const handleMouseLeave = () => {
    timerRef.current = window.setTimeout(() => setOpenDropdown(null), 200);
  };

  const handleDropdownMouseEnter = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const handleDropdownMouseLeave = () => {
    timerRef.current = window.setTimeout(() => setOpenDropdown(null), 200);
  };

  // Logout
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Se ainda estiver carregando, pode mostrar um placeholder ou nada
  if (loadingCategories) {
    // Opcional: renderizar esqueleto ou vazio
    // return <div>Carregando...</div>;
  }

  return (
    <>
      <div className={style.ContainerHeader}>
        {/* Menu mobile */}
        <div className={style.Menu} onClick={toggleMenu}>
          <Menu size={30} style={{ cursor: "pointer" }} />
        </div>

        {/* Logo */}
        <div className={style.Logo}>
          <Link to="/">
            <h1>
              Catálogo<span> Online</span>
            </h1>
          </Link>
        </div>

        {/* Navegação desktop */}
        <nav className={style.NavDesktop}>
          <Link to="/">
            <span>HOME</span>
          </Link>
          {/* Mapeia as categorias dinamicamente */}
          {categories.map((cat) => (
            <div
              key={cat.name}
              className={style.dropdownWrapper}
              onMouseEnter={() => handleMouseEnter(cat.name)}
              onMouseLeave={handleMouseLeave}
            >
              <span className={style.dropdownLabel}>
                {cat.name.toUpperCase()}
              </span>
              {openDropdown === cat.name && (
                <div
                  className={style.dropdownContent}
                  onMouseEnter={handleDropdownMouseEnter}
                  onMouseLeave={handleDropdownMouseLeave}
                >
                  {/* Subcategorias */}
                  {cat.subcategories && cat.subcategories.length > 0 ? (
                    <div className={style.dropdownColumn}>
                      <h4>SUB categorias</h4>
                      <ul>
                        <li>
                          <Link
                            to={`/busca?categoria=${encodeURIComponent(cat.name)}`}
                          >
                            Ver tudo em {cat.name}
                          </Link>
                        </li>
                        {cat.subcategories.map((sub) => (
                          <li key={sub}>
                            <Link
                              to={`/busca?subcategoria=${encodeURIComponent(sub)}`}
                            >
                              {sub}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className={style.dropdownColumn}>
                      <ul>
                        <li>
                          <Link
                            to={`/busca?categoria=${encodeURIComponent(cat.name)}`}
                          >
                            Ver todos os produtos de {cat.name}
                          </Link>
                        </li>
                      </ul>
                    </div>
                  )}
                  {/* Você pode adicionar mais colunas com destaques, etc. */}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Ferramentas (busca, carrinho, usuário) */}
        <div className={style.Area_Ferramentas}>
          <div
            className={`${style.searchWrapper} ${isSearchOpen ? style.open : ""}`}
          >
            <form onSubmit={handleSearch} className={style.searchForm}>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="O que você procura?"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={style.searchInput}
              />
              <button type="submit" className={style.searchSubmit}>
                <Search size={20} />
              </button>
              {isSearchOpen && (
                <button
                  type="button"
                  onClick={toggleSearch}
                  className={style.searchClose}
                >
                  <X size={20} />
                </button>
              )}
            </form>
          </div>

          <div className={style.iconWrapper} onClick={toggleSearch}>
            <Search />
          </div>

          <button onClick={toggleDrawer} className={style.cartIcon}>
            <ShoppingBag size={24} />
            {totalItems > 0 && (
              <span className={style.badge}>{totalItems}</span>
            )}
          </button>

          <div className={style.iconWrapper}>
            {user ? (
              <div className={style.userMenu}>
                <span>Olá, {user.name}</span>
                <button onClick={handleLogout} className={style.logoutBtn}>
                  Sair
                </button>
              </div>
            ) : (
              <Link to="/login" className={style.loginLink}>
                <User />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Menu Mobile */}
      <SideMenu isOpen={isMenuOpen} onClose={closeMenu} />
    </>
  );
}

export default Header;
