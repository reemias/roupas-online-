import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import style from "./SideMenu.module.css";
import { LogOutIcon } from "lucide-react";

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const SideMenu: React.FC<SideMenuProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`${style.overlay} ${isOpen ? style.open : ""}`}
        onClick={onClose}
      />
      {/* Menu lateral */}
      <div className={`${style.sideMenu} ${isOpen ? style.open : ""}`}>
        <button className={style.closeBtn} onClick={onClose}>✕</button>

        {/* Área de autenticação */}
        <div className={style.authArea}>
          {user ? (
            // Usuário logado
            <>
              <div className={style.Area_Auth}>
                  <span className={style.userName}>Bem Vindo, {user.name}</span>
                  <div onClick={handleLogout}>
                    <LogOutIcon size={20} />
                  </div>
              </div>
            </>
          ) : (
            // Usuário não logado
            <>
              <Link to="/login" onClick={onClose} className={style.authLink}>
                Já sou cliente
              </Link>
              <Link to="/registrar" onClick={onClose} className={style.authLink}>
                Criar Conta
              </Link>
            </>
          )}
        </div>

        {/* Navegação principal */}
        <nav className={style.nav}>
          <ul>
            <li><Link to="/" onClick={onClose}>Home</Link></li>
            <li><Link to="/busca?q=Camisas" onClick={onClose}>Camisas</Link></li>
            <li><Link to="/busca?q=Calças" onClick={onClose}>Calças</Link></li>
            <li><Link to="/busca?q=Bonés" onClick={onClose}>Bonés</Link></li>
          </ul>
        </nav>
      </div>
    </>
  );
};

export default SideMenu;