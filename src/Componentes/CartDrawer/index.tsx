import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";
import { X, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import api from "../../services/api";
import style from "./CartDrawer.module.css";
import LoadingSpinner from "../LoadingSpinner";
import ImageWithLoader from "../ImageWithLoader";

interface SuggestedProduct {
  _id: string;
  name: string;
  price: number;
  images: string[];
  discount: number;
}

const CartDrawer = () => {
  const navigate = useNavigate();
  const {
    items,
    totalItems,
    totalPrice,
    isDrawerOpen,
    closeDrawer,
    removeItem,
    updateQuantity,
    clearCart,
  } = useCart();

  const [suggestedProducts, setSuggestedProducts] = useState<
    SuggestedProduct[]
  >([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // Número do WhatsApp (configure no .env)
  const whatsappNumber = "558296878817";

  // Buscar produtos sugeridos quando o drawer for aberto
  useEffect(() => {
    if (isDrawerOpen && suggestedProducts.length === 0) {
      const fetchSuggestions = async () => {
        try {
          setLoadingSuggestions(true);
          const data = await api.get<{ products: SuggestedProduct[] }>(
            "/products?limit=3&page=1",
          );
          const products = data?.products || [];
          setSuggestedProducts(products.slice(0, 3));
        } catch (error) {
          console.error("Erro ao buscar produtos sugeridos:", error);
        } finally {
          setLoadingSuggestions(false);
        }
      };
      fetchSuggestions();
    }
  }, [isDrawerOpen, suggestedProducts.length]);

  const handleProductClick = (id: string) => {
    closeDrawer();
    navigate(`/produto/${id}`);
  };

  // Função que gera a mensagem e abre o WhatsApp
  const handleWhatsAppCheckout = () => {
    if (items.length === 0) return;

    // Monta o cabeçalho com quebra de linha real (\n)
    let message =
      "Olá! Vim pelo catálogo online e gostaria de fazer um pedido:\n";

    // Adiciona cada item
    items.forEach((item) => {
      message += `${item.quantity}x ${item.name} - R$ ${item.price.toFixed(2)}\n`;
    });

    // Adiciona o total (com * para negrito no WhatsApp)
    message += `*Total à vista: R$ ${totalPrice.toFixed(2)}*`;

    // Codifica a mensagem para URL (substitui \n por %0A e espaços por %20)
    const encodedMessage = encodeURIComponent(message);
    const url = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

    // Abre em nova aba/janela
    window.open(url, "_blank");

    // Fecha o drawer após enviar
    closeDrawer();
  };

  if (!isDrawerOpen) return null;

  const cartIds = items.map((item) => item.id);
  const filteredSuggestions = suggestedProducts.filter(
    (p) => !cartIds.includes(p._id),
  );

  return (
    <>
      <div className={style.overlay} onClick={closeDrawer} />
      <div className={style.drawer}>
        <div className={style.header}>
          <h2>
            <ShoppingBag size={20} />
            Carrinho ({totalItems})
          </h2>
          <button onClick={closeDrawer} className={style.closeBtn}>
            <X size={24} />
          </button>
        </div>

        <div className={style.content}>
          {items.length === 0 ? (
            <>
              <p className={style.empty}>Seu carrinho está vazio.</p>
              <div className={style.suggestions}>
                <div className={style.suggestionsHeader}>
                  <span>Você também pode gostar</span>
                </div>
                {loadingSuggestions ? (
                  <div className={style.suggestionsLoading}>
                    <LoadingSpinner />
                  </div>
                ) : (
                  <div className={style.suggestionsGrid}>
                    {filteredSuggestions.map((product) => (
                      <div
                        key={product._id}
                        className={style.suggestionCard}
                        onClick={() => handleProductClick(product._id)}
                      >
                        <ImageWithLoader src={product.images?.[0]} alt={product.name} />
                        <h4>{product.name}</h4>
                        <p>
                          {product.discount > 0 ? (
                            <>
                              <span className={style.oldPrice}>
                                R${product.price}
                              </span>
                              <span className={style.salePrice}>
                                R$
                                {(
                                  product.price *
                                  (1 - product.discount / 100)
                                ).toFixed(0)}
                              </span>
                            </>
                          ) : (
                            <span>R${product.price.toFixed(2)}</span>
                          )}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <div className={style.itemList}>
                {items.map((item) => (
                  <div
                    key={`${item.id}-${item.color}-${item.size}`}
                    className={style.cartItem}
                  >
                    <ImageWithLoader
                      src={item.image}
                      alt={item.name}
                      className={style.itemImage}
                    />
                    <div className={style.itemInfo}>
                      <h4>{item.name}</h4>
                      <p>
                        {item.color} / {item.size}
                      </p>
                      <p className={style.itemPrice}>
                        R$ {item.price.toFixed(2)}
                      </p>
                      <div className={style.quantityControl}>
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.id,
                              item.color,
                              item.size,
                              item.quantity - 1,
                            )
                          }
                          disabled={item.quantity <= 1}
                        >
                          <Minus size={14} />
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.id,
                              item.color,
                              item.size,
                              item.quantity + 1,
                            )
                          }
                          disabled={
                            item.maxStock
                              ? item.quantity >= item.maxStock
                              : false
                          }
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(item.id, item.color, item.size)}
                      className={style.removeBtn}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Sugestões abaixo da lista */}
              <div className={style.suggestions}>
                <div className={style.suggestionsHeader}>
                  <span>Você também pode gostar</span>
                </div>
                {loadingSuggestions ? (
                  <div className={style.suggestionsLoading}>
                    <LoadingSpinner />
                  </div>
                ) : (
                  <div className={style.suggestionsGrid}>
                    {filteredSuggestions.slice(0, 3).map((product) => (
                      <div
                        key={product._id}
                        className={style.suggestionCard}
                        onClick={() => handleProductClick(product._id)}
                      >
                        <ImageWithLoader src={product.images?.[0]} alt={product.name} />
                        <h4>{product.name}</h4>
                        <p>
                          {product.discount > 0 ? (
                            <>
                              <span className={style.oldPrice}>
                                R${product.price}
                              </span>
                              <span className={style.salePrice}>
                                R$
                                {(
                                  product.price *
                                  (1 - product.discount / 100)
                                ).toFixed(0)}
                              </span>
                            </>
                          ) : (
                            <span>R${product.price.toFixed(2)}</span>
                          )}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className={style.footer}>
                <div className={style.total}>
                  <span>Total:</span>
                  <strong>R$ {totalPrice.toFixed(2)}</strong>
                </div>
                <div className={style.actions}>
                  <button onClick={clearCart} className={style.clearBtn}>
                    Limpar
                  </button>
                  <button
                    onClick={handleWhatsAppCheckout}
                    className={style.checkoutBtn}
                  >
                    Finalizar Compra
                  </button>
                </div>
                <button onClick={closeDrawer} className={style.continueBtn}>
                  Continuar comprando
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default CartDrawer;
