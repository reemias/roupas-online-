import { describe, expect, it } from 'vitest';
import { getZoomOrigin, isRatingSelected, ratingBarWidth } from './productInteractions';

describe('interações da página de produto', () => {
  it('calcula a origem do zoom com base na posição do mouse', () => {
    expect(getZoomOrigin(150, 75, { left: 50, top: 25, width: 200, height: 100 })).toEqual({ x: 50, y: 50 });
  });

  it('limita a origem do zoom aos limites da imagem', () => {
    expect(getZoomOrigin(-30, 200, { left: 0, top: 0, width: 100, height: 100 })).toEqual({ x: 0, y: 100 });
  });

  it('marca somente as estrelas até a nota selecionada', () => {
    expect(isRatingSelected(4, 3)).toBe(true);
    expect(isRatingSelected(4, 5)).toBe(false);
  });

  it('destaca a faixa correspondente à avaliação atual', () => {
    expect(ratingBarWidth(5, 5)).toBe(62);
    expect(ratingBarWidth(1, 5)).toBe(33);
  });
});
