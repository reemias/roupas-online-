import { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import style from './Register.module.css';

// ===== VALIDAÇÕES =====
const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const isValidCPF = (cpf: string): boolean => {
  const cleaned = cpf.replace(/\D/g, '');
  if (cleaned.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleaned)) return false;
  const calcDigit = (slice: string, factor: number): number => {
    const sum = slice.split('').reduce((acc, digit) => acc + Number(digit) * factor--, 0);
    const rest = sum % 11;
    return rest < 2 ? 0 : 11 - rest;
  };
  const first = calcDigit(cleaned.slice(0, 9), 10);
  if (first !== Number(cleaned[9])) return false;
  const second = calcDigit(cleaned.slice(0, 10), 11);
  return second === Number(cleaned[10]);
};

const isValidPhone = (phone: string): boolean => {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length >= 10 && cleaned.length <= 11;
};

const isStrongPassword = (password: string): boolean => {
  return password.length >= 6 && /[A-Za-z]/.test(password) && /[0-9]/.test(password);
};

// ===== MÁSCARAS =====
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

// ===== COMPONENTE =====
const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  // Estado do formulário
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    cpf: '',
    phone: '',
    birthDate: '',
    gender: '',
    password: '',
    confirmPassword: '',
  });
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Estados de erro
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Validação de campo individual
  const validateField = useCallback((name: string, value: string): string => {
    switch (name) {
      case 'name':
        return value.trim().length < 2 ? 'Nome deve ter pelo menos 2 caracteres' : '';
      case 'email':
        return !isValidEmail(value) ? 'E-mail inválido' : '';
      case 'cpf':
        return !isValidCPF(value) ? 'CPF inválido' : '';
      case 'phone':
        return !isValidPhone(value) ? 'Telefone inválido (DDD + 8 ou 9 dígitos)' : '';
      case 'birthDate':
        return !value ? 'Data de nascimento é obrigatória' : '';
      case 'gender':
        return !value ? 'Gênero é obrigatório' : '';
      case 'password':
        return !isStrongPassword(value)
          ? 'Senha deve ter no mínimo 6 caracteres, com letras e números'
          : '';
      case 'confirmPassword':
        return value !== formData.password ? 'As senhas não coincidem' : '';
      default:
        return '';
    }
  }, [formData.password]);

  // Handlers com máscara
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'cpf') formattedValue = maskCPF(value);
    if (name === 'phone') formattedValue = maskPhone(value);

    setFormData(prev => ({ ...prev, [name]: formattedValue }));
    // Limpa erro do campo ao digitar
    setErrors(prev => ({ ...prev, [name]: '' }));
    setGeneralError('');
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    if (error) {
      setErrors(prev => ({ ...prev, [name]: error }));
    } else {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');
    setErrors({});

    // Valida todos os campos
    const newErrors: Record<string, string> = {};
    Object.entries(formData).forEach(([key, value]) => {
      const error = validateField(key, value);
      if (error) newErrors[key] = error;
    });

    if (!termsAccepted) {
      setGeneralError('Você precisa aceitar os termos para se cadastrar.');
      return;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    // Prepara dados para envio (CPF e telefone sem máscara)
    const payload = {
      ...formData,
      cpf: formData.cpf.replace(/\D/g, ''),
      phone: formData.phone.replace(/\D/g, ''),
    };

    const result = await register(payload);
    setLoading(false);

    if (result.success) {
      navigate('/login?registered=true');
    } else {
      setGeneralError(result.message || 'Erro ao criar conta. Tente novamente.');
    }
  };

  return (
    <div className={style.registerPage}>
      <div className={style.registerContainer}>
        <h1>Criar conta</h1>
        <p className={style.subtitle}>
          Preencha os dados abaixo para começar a comprar, avaliar e comentar.
        </p>

        <form onSubmit={handleSubmit} className={style.form} noValidate>
          {/* Nome */}
          <div className={`${style.field} ${errors.name ? style.error : ''}`}>
            <label htmlFor="name">Nome completo *</label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Seu nome completo"
              autoComplete="name"
              required
            />
            {errors.name && <span className={style.errorMsg}>{errors.name}</span>}
          </div>

          {/* E-mail */}
          <div className={`${style.field} ${errors.email ? style.error : ''}`}>
            <label htmlFor="email">E-mail *</label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="seu@email.com"
              autoComplete="email"
              required
            />
            {errors.email && <span className={style.errorMsg}>{errors.email}</span>}
          </div>

          {/* CPF */}
          <div className={`${style.field} ${errors.cpf ? style.error : ''}`}>
            <label htmlFor="cpf">CPF *</label>
            <input
              id="cpf"
              type="text"
              name="cpf"
              value={formData.cpf}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="000.000.000-00"
              maxLength={14}
              autoComplete="off"
              required
            />
            {errors.cpf && <span className={style.errorMsg}>{errors.cpf}</span>}
          </div>

          {/* Telefone */}
          <div className={`${style.field} ${errors.phone ? style.error : ''}`}>
            <label htmlFor="phone">Celular *</label>
            <input
              id="phone"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="(00) 00000-0000"
              maxLength={15}
              autoComplete="tel"
              required
            />
            {errors.phone && <span className={style.errorMsg}>{errors.phone}</span>}
          </div>

          {/* Data de Nascimento */}
          <div className={`${style.field} ${errors.birthDate ? style.error : ''}`}>
            <label htmlFor="birthDate">Data de Nascimento *</label>
            <input
              id="birthDate"
              type="date"
              name="birthDate"
              value={formData.birthDate}
              onChange={handleChange}
              onBlur={handleBlur}
              required
            />
            {errors.birthDate && <span className={style.errorMsg}>{errors.birthDate}</span>}
          </div>

          {/* Gênero */}
          <div className={`${style.field} ${errors.gender ? style.error : ''}`}>
            <label htmlFor="gender">Gênero *</label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              onBlur={handleBlur}
              required
            >
              <option value="">Selecione</option>
              <option value="masculino">Masculino</option>
              <option value="feminino">Feminino</option>
              <option value="outro">Outro</option>
              <option value="prefiro-nao-dizer">Prefiro não dizer</option>
            </select>
            {errors.gender && <span className={style.errorMsg}>{errors.gender}</span>}
          </div>

          {/* Senha */}
          <div className={`${style.field} ${errors.password ? style.error : ''}`}>
            <label htmlFor="password">Senha *</label>
            <div className={style.passwordWrapper}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Mínimo 6 caracteres, letras e números"
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                className={style.togglePassword}
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && <span className={style.errorMsg}>{errors.password}</span>}
          </div>

          {/* Confirmar Senha */}
          <div className={`${style.field} ${errors.confirmPassword ? style.error : ''}`}>
            <label htmlFor="confirmPassword">Confirmar senha *</label>
            <div className={style.passwordWrapper}>
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Digite a senha novamente"
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                className={style.togglePassword}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.confirmPassword && <span className={style.errorMsg}>{errors.confirmPassword}</span>}
          </div>

          {/* Termos */}
          <div className={style.terms}>
            <label>
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
              />
              Li e aceito os <Link to="/termos">Termos de Uso</Link> e a{' '}
              <Link to="/privacidade">Política de Privacidade</Link>.
            </label>
          </div>

          {generalError && <p className={style.generalError}>{generalError}</p>}

          <button type="submit" className={style.button} disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={20} className={style.spinner} />
                Criando conta...
              </>
            ) : (
              'Criar conta'
            )}
          </button>

          <p className={style.loginLink}>
            Já tem conta? <Link to="/login">Faça login</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;