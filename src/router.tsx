import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./Pages/Home";
import Header from "./Componentes/Header";
import ProductDetails from "./Pages/Product";
import { CartProvider } from "./contexts/CartContext";
import Cart from "./Pages/Cart";
import CartDrawer from "./Componentes/CartDrawer";
import SearchPage from "./Pages/Search";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import ProtectedRoute from "./Componentes/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
import PaymentSuccess from "./Componentes/PaymentSuccess";

function Router() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <CartDrawer />
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/produto/:id" element={<ProductDetails />} />
            <Route path="/carrinho" element={<Cart />} />
            <Route path="/busca" element={<SearchPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/registrar" element={<Register />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route
              path="/perfil"
              element={
                <ProtectedRoute>
                  <div>Página de perfil (em breve)</div>
                </ProtectedRoute>
              }
            />
            {/* Outras rotas protegidas, se necessário */}
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default Router;