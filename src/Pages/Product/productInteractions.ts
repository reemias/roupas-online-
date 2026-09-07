export interface ZoomOrigin {
  x: number;
  y: number;
}

export const getZoomOrigin = (
  clientX: number,
  clientY: number,
  bounds: { left: number; top: number; width: number; height: number },
): ZoomOrigin => ({
  x: Math.min(100, Math.max(0, ((clientX - bounds.left) / bounds.width) * 100)),
  y: Math.min(100, Math.max(0, ((clientY - bounds.top) / bounds.height) * 100)),
});

export const isRatingSelected = (rating: number, star: number) => rating >= star;

export const ratingBarWidth = (rating: number, currentRating: number) =>
  currentRating === Math.round(rating) ? 62 : Math.max(8, 38 - rating * 5);
