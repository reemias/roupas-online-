// PaymentSuccess.tsx
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Você pode logar os parâmetros para depuração
    console.log('Parâmetros de retorno:', {
      order_nsu: searchParams.get('order_nsu'),
      transaction_nsu: searchParams.get('transaction_nsu'),
      slug: searchParams.get('slug'),
      capture_method: searchParams.get('capture_method'),
      receipt_url: searchParams.get('receipt_url'),
    });
  }, [searchParams]);

  return (
    <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
      <CheckCircle size={64} color="#22c55e" />
      <h1>Pagamento confirmado!</h1>
      <p>Seu pedido foi aprovado e está sendo processado.</p>
      <p>Você receberá um e-mail com os detalhes da compra em breve.</p>
      <button onClick={() => navigate('/')} style={{ marginTop: '2rem' }}>
        Voltar à loja
      </button>
    </div>
  );
};

export default PaymentSuccess;