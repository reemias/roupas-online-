import { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import style from './Login.module.css';

// ===== VALIDAÇÕES =====
const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const isValidCPF = (cpf: string): boolean => {
  const cleaned = cpf.replace(/\D/g, '');
  if (cleaned.length !== 11) return false;
  // Validação simples: não pode ser todos os dígitos iguais
  if (/^(\d)\1{10}$/.test(cleaned)) return false;
  // Cálculo dos dígitos verificadores
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

// ===== MÁSCARA DE CPF =====
const maskCPF = (value: string): string => {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length <= 3) return cleaned;
  if (cleaned.length <= 6) return cleaned.replace(/(\d{3})(\d{1,})/, '$1.$2');
  if (cleaned.length <= 9) return cleaned.replace(/(\d{3})(\d{3})(\d{1,})/, '$1.$2.$3');
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{1,})/, '$1.$2.$3-$4');
};

// ===== COMPONENTE =====
const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [identifierError, setIdentifierError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const validateIdentifier = useCallback((value: string): { valid: boolean; message: string } => {
    const trimmed = value.trim();
    if (!trimmed) return { valid: false, message: 'Campo obrigatório' };
    // Verifica se é CPF (somente números ou com máscara)
    const isCPF = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(trimmed) || /^\d{11}$/.test(trimmed);
    if (isCPF) {
      const cpfClean = trimmed.replace(/\D/g, '');
      if (cpfClean.length === 11 && isValidCPF(cpfClean)) {
        return { valid: true, message: '' };
      }
      return { valid: false, message: 'CPF inválido' };
    }
    // Verifica se é e-mail
    if (isValidEmail(trimmed)) {
      return { valid: true, message: '' };
    }
    return { valid: false, message: 'Digite um e-mail ou CPF válido' };
  }, []);

  const handleIdentifierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    // Aplica máscara se for CPF (apenas números)
    const isNumeric = /^\d*$/.test(raw);
    const formatted = isNumeric ? maskCPF(raw) : raw;
    setIdentifier(formatted);
    setIdentifierError('');
    setGeneralError('');
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setPasswordError('');
    setGeneralError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');
    setIdentifierError('');
    setPasswordError('');

    // Validação do identificador
    const idValidation = validateIdentifier(identifier);
    if (!idValidation.valid) {
      setIdentifierError(idValidation.message);
      return;
    }

    // Validação da senha (mínimo 6 caracteres)
    if (!password || password.length < 6) {
      setPasswordError('Senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);

    // Limpa o identificador para enviar (remover máscara se for CPF)
    const cleanIdentifier = identifier.replace(/\D/g, '').length === 11
      ? identifier.replace(/\D/g, '')
      : identifier;

    const result = await login(cleanIdentifier, password);
    setLoading(false);

    if (result.success) {
      navigate('/');
    } else {
      setGeneralError(result.message || 'Credenciais inválidas');
    }
  };

  return (
    <div className={style.loginPage}>
      <div className={style.loginContainer}>
        <h1>Entrar</h1>
        <p className={style.subtitle}>Acesse sua conta para comprar, avaliar e comentar produtos.</p>
        <form onSubmit={handleSubmit} className={style.form} noValidate>
          <div className={`${style.field} ${identifierError ? style.error : ''}`}>
            <label htmlFor="identifier">E-mail ou CPF</label>
            <input
              id="identifier"
              type="text"
              value={identifier}
              onChange={handleIdentifierChange}
              placeholder="Digite seu e-mail ou CPF"
              aria-invalid={!!identifierError}
              aria-describedby={identifierError ? 'identifier-error' : undefined}
              autoComplete="username"
              required
            />
            {identifierError && (
              <span id="identifier-error" className={style.errorMsg}>
                {identifierError}
              </span>
            )}
          </div>

          <div className={`${style.field} ${passwordError ? style.error : ''}`}>
            <label htmlFor="password">Senha</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={handlePasswordChange}
              placeholder="Digite sua senha"
              aria-invalid={!!passwordError}
              aria-describedby={passwordError ? 'password-error' : undefined}
              autoComplete="current-password"
              required
            />
            {passwordError && (
              <span id="password-error" className={style.errorMsg}>
                {passwordError}
              </span>
            )}
          </div>

          {generalError && <p className={style.generalError}>{generalError}</p>}

          <div className={style.actions}>
            <button type="submit" className={style.button} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 size={20} className={style.spinner} />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </button>
          </div>

          <div className={style.footerLinks}>
            <p className={style.registerLink}>
              Ainda não tem conta? <Link to="/registrar">Cadastre-se</Link>
            </p>
            <a href="/cms/login" className={style.adminLink}>
              Acessar como administrador
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
