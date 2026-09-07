import React from "react";

interface LogoProps {
  size?: number;
  color?: string; // ou fill
}

const Logo: React.FC<LogoProps> = ({ size = 40, color = "currentColor" }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100" // ajuste para o viewBox do seu SVG
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Cole aqui o conteúdo do SVG, substituindo fill/stroke por {color} */}
      <path d="..." fill={color} />
      {/* Se houver muitos paths, você pode ajustar manualmente */}
    </svg>
  );
};

export default Logo;