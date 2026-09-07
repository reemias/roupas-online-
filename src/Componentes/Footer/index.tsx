import { Mail, Phone, MapPin } from 'lucide-react';
import style from './Footer.module.css';
import { Link } from 'react-router-dom';
import Logo from "../../Img/warm_winter_clothes_scarf_shawl_muffler_icon_262742.ico";

function Footer() {
  return (
    <footer className={style.footer}>
      <div className={style.container}>
        {/* Coluna 1 - Sobre a loja */}
        <div className={style.column}>
          <h3>Minha Loja</h3>
          <p>
            Loja de roupas masculinas e femininas com tecnologia de ponta.
            Conforto, estilo e inovação para o seu dia a dia.
          </p>
          <div className={style.contactInfo}>
            <div className={style.contactItem}>
              <Mail size={18} />
              <span>contato@minhaloja.com.br</span>
            </div>
            <div className={style.contactItem}>
              <Phone size={18} />
              <span>(11) 1234-5678</span>
            </div>
            <div className={style.contactItem}>
              <MapPin size={18} />
              <span>São Paulo - SP</span>
            </div>
          </div>
        </div>

        {/* Coluna 2 - Links rápidos */}
        <div className={style.column}>
          <h4>Institucional</h4>
          <ul>
            <li><a href="#">Sobre nós</a></li>
            <li><a href="#">Nossas lojas</a></li>
            <li><a href="#">Trabalhe conosco</a></li>
            <li><a href="#">Blog</a></li>
          </ul>
        </div>

        {/* Coluna 3 - Atendimento */}
        <div className={style.column}>
          <h4>Atendimento</h4>
          <ul>
            <li><a href="#">Central de ajuda</a></li>
            <li><a href="#">Política de troca</a></li>
            <li><a href="#">Política de privacidade</a></li>
            <li><a href="#">Termos e condições</a></li>
          </ul>
        </div>

        {/* Coluna 4 - Newsletter */}
        <div className={style.column}>
          <div className={style.Logo}>
            <Link to="/"><img src={Logo}/>
              <h1>ROUPAS<span>ONLINE</span></h1>
            </Link>
          </div>
        </div>
      </div>

      {/* Rodapé inferior */}
      <div className={style.bottom}>
        <p>© {new Date().getFullYear()} Minha Loja. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
}

export default Footer;