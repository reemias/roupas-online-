export interface Produto {
  _id: string;
  name: string;
  price: number;
  discount: number;
  images: string[];
  rating: number;
  numReviews: number;
  category: string;
  brand: string;
  isBestSeller: boolean;
}