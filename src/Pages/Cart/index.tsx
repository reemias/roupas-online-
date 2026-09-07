// Cart.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { Minus, Plus, Trash2, ChevronRight } from 'lucide-react';
import api from '../../services/api';
import style from './Cart.module.css';
import ImageWithLoader from '../../Componentes/ImageWithLoader';

interface FormData {
  email: string;
  cpf: string;
  phone: string;
  fullName: string;
  hasBag: boolean;
}

// ===== FUNÇÕES DE MÁSCARA =====
const maskCPF = (value: string): string => {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length <= 3) return cleaned;
  if (cleaned.length <= 6) return cleaned.replace(/(\d{3})(\d{1,})/, '$1.$2');
  if (cleaned.length <= 9) return cleaned.replace(/(\d{3})(\d{3})(\d{1,})/, '$1.$2.$3');
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{1,})/, '$1.$2.$3-$4');
};

const maskPhone = (value: string): string => {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length <= 2) return cleaned;
  if (cleaned.length <= 6) return cleaned.replace(/(\d{2})(\d{1,})/, '($1) $2');
  if (cleaned.length <= 10) return cleaned.replace(/(\d{2})(\d{4})(\d{1,})/, '($1) $2-$3');
  return cleaned.replace(/(\d{2})(\d{5})(\d{1,})/, '($1) $2-$3');
};

const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// ===== COMPONENTE PRINCIPAL =====
const Cart = () => {
  const navigate = useNavigate();
  const { items, totalPrice, updateQuantity, removeItem, clearCart } = useCart();

  const initialFormData: FormData = {
    email: '',
    cpf: '',
    phone: '',
    fullName: '',
    hasBag: false,
  };

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [emailError, setEmailError] = useState(false);
  const [cpfError, setCpfError] = useState(false);
  const [phoneError, setPhoneError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Carregar dados salvos do localStorage
  useEffect(() => {
    const saved = localStorage.getItem('checkoutForm');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData(prev => ({ ...prev, ...parsed }));
      } catch {}
    }
  }, []);

  // Salvar formulário no localStorage
  useEffect(() => {
    localStorage.setItem('checkoutForm', JSON.stringify(formData));
  }, [formData]);

  const totalComFrete = totalPrice + (formData.hasBag ? 5 : 0);

  // ===== HANDLERS COM MÁSCARA E VALIDAÇÃO =====
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    let formattedValue = value;

    if (name === 'cpf') {
      formattedValue = maskCPF(value);
      setCpfError(formattedValue.replace(/\D/g, '').length < 11);
    } else if (name === 'phone') {
      formattedValue = maskPhone(value);
      setPhoneError(formattedValue.replace(/\D/g, '').length < 10);
    } else if (name === 'email') {
      formattedValue = value;
      setEmailError(!isValidEmail(value) && value.length > 0);
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : formattedValue,
    }));
  };

  // ===== SUBMISSÃO DO PEDIDO =====
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações locais
    if (!formData.email || !isValidEmail(formData.email)) {
      alert('E-mail inválido.');
      setEmailError(true);
      return;
    }
    if (formData.cpf.replace(/\D/g, '').length < 11) {
      alert('CPF inválido.');
      setCpfError(true);
      return;
    }
    if (formData.phone.replace(/\D/g, '').length < 10) {
      alert('Telefone incompleto.');
      setPhoneError(true);
      return;
    }
    if (!formData.fullName || formData.fullName.trim().length < 2) {
      alert('Nome completo é obrigatório.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const payload = {
        items: items.map(item => ({
          product: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          color: item.color,
          size: item.size,
          image: item.image,
        })),
        total: totalComFrete,
        customer: {
          email: formData.email.trim(),
          cpf: formData.cpf.replace(/\D/g, ''),
          phone: formData.phone.replace(/\D/g, ''),
          fullName: formData.fullName.trim(),
        },
        shippingAddress: {}, // backend aceita vazio
        hasBag: formData.hasBag,
      };

      const response = await api.post<{ paymentLink: string; orderId?: string }>('/orders', payload);

      // A API deve retornar { paymentLink, orderId }
      if (response?.paymentLink) {
        // Limpa carrinho e formulário antes de redirecionar
        clearCart();
        localStorage.removeItem('checkoutForm');

        // Redireciona para o checkout da InfinitePay
        window.location.href = response.paymentLink;
      } else {
        throw new Error('Link de pagamento não retornado pela API');
      }
    } catch (err: any) {
      console.error('Erro ao criar pedido:', err);
      const message = err.response?.data?.message || err.message || 'Erro ao processar pedido.';
      setSubmitError(message);
      setIsSubmitting(false);
    }
  };

  // ===== RENDER =====

  // Carrinho vazio
  if (items.length === 0) {
    return (
      <div className={style.empty}>
        <h2>Seu carrinho está vazio</h2>
        <button onClick={() => navigate('/')} className={style.continueBtn}>
          Continuar comprando
        </button>
      </div>
    );
  }

  // Formulário de dados pessoais
  return (
    <div className={style.checkoutPage}>
      <div className={style.checkoutContainer}>
        {/* FORMULÁRIO */}
        <div className={style.checkoutForm}>
          <form onSubmit={handleSubmit}>
            <div className={style.formSection}>
              <h2>Identificação</h2>

              <div className={`${style.field} ${emailError ? style.error : ''}`}>
                <label htmlFor="email">E-mail *</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="seu@email.com"
                  required
                />
                {emailError && <span className={style.errorMsg}>E-mail inválido</span>}
              </div>

              <div className={`${style.field} ${cpfError ? style.error : ''}`}>
                <label htmlFor="cpf">CPF *</label>
                <input
                  id="cpf"
                  type="text"
                  name="cpf"
                  value={formData.cpf}
                  onChange={handleInputChange}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  required
                />
                {cpfError && <span className={style.errorMsg}>CPF incompleto</span>}
              </div>

              <div className={`${style.field} ${phoneError ? style.error : ''}`}>
                <label htmlFor="phone">Celular *</label>
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                  required
                />
                {phoneError && <span className={style.errorMsg}>Telefone incompleto</span>}
              </div>

              <div className={style.field}>
                <label htmlFor="fullName">Nome completo *</label>
                <input
                  id="fullName"
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Seu nome completo"
                  required
                />
              </div>

              <div className={style.fieldCheckbox}>
                <label htmlFor="hasBag">
                  <input
                    id="hasBag"
                    type="checkbox"
                    name="hasBag"
                    checked={formData.hasBag}
                    onChange={handleInputChange}
                  />
                  Quero adicionar uma sacola (R$ 5,00)
                </label>
              </div>

              {submitError && <div className={style.paymentError}>{submitError}</div>}

              <button type="submit" className={style.continueButton} disabled={isSubmitting}>
                {isSubmitting ? 'Criando pedido...' : 'Ir para o pagamento'}
                <ChevronRight size={18} />
              </button>
            </div>
          </form>
        </div>

        {/* RESUMO DO PEDIDO */}
        <div className={style.orderSummary}>
          <h2>Resumo do pedido</h2>
          <div className={style.itemList}>
            {items.map((item) => (
              <div key={`${item.id}-${item.color}-${item.size}`} className={style.summaryItem}>
                <ImageWithLoader src={item.image} alt={item.name} className={style.itemThumb} />
                <div className={style.itemDetails}>
                  <h4>{item.name}</h4>
                  <p>
                    {item.color} / {item.size}
                  </p>
                  <div className={style.quantityControl}>
                    <button
                      onClick={() => updateQuantity(item.id, item.color, item.size, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      <Minus size={14} />
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.color, item.size, item.quantity + 1)}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <span className={style.itemPrice}>R$ {item.price.toFixed(2)}</span>
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
          <div className={style.totalSummary}>
            <div className={style.totalRow}>
              <span>Subtotal</span>
              <span>R$ {totalPrice.toFixed(2)}</span>
            </div>
            {formData.hasBag && (
              <div className={style.totalRow}>
                <span>Sacola</span>
                <span>R$ 5,00</span>
              </div>
            )}
            <div className={`${style.totalRow} ${style.grandTotal}`}>
              <strong>Total</strong>
              <strong>R$ {totalComFrete.toFixed(2)}</strong>
            </div>
            <button onClick={clearCart} className={style.clearCartBtn}>
              Limpar carrinho
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
