import React from "react";
import { Link } from "react-router-dom";
import style from "./SideMenu.module.css";

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const SideMenu: React.FC<SideMenuProps> = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Overlay */}
      <div
        className={`${style.overlay} ${isOpen ? style.open : ""}`}
        onClick={onClose}
      />
      {/* Menu lateral */}
      <div className={`${style.sideMenu} ${isOpen ? style.open : ""}`}>
        <button className={style.closeBtn} onClick={onClose}>
          ✕
        </button>

        {/* Navegação principal */}
        <nav className={style.nav}>
          <ul>
            <li>
              <Link to="/" onClick={onClose}>
                Home
              </Link>
            </li>
            <li>
              <Link to="/busca?q=Camisas" onClick={onClose}>
                Camisas
              </Link>
            </li>
            <li>
              <Link to="/busca?q=Calças" onClick={onClose}>
                Calças
              </Link>
            </li>
            <li>
              <Link to="/busca?q=Bonés" onClick={onClose}>
                Bonés
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </>
  );
};

export default SideMenu;
