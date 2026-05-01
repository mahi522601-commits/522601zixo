export interface Product {
  id: string;
  name: string;
  image: string;
  price: number;
  originalPrice?: number;
  badge?: string;
  details?: string;
  detailImage?: string;
  thumbnailUrls?: string[];
}

export interface CartItem extends Product {
  quantity: number;
  isAvailable?: boolean;
}

export interface Category {
  id: string;
  name: string;
  image: string;
  href: string;
}

export interface Testimonial {
  id: string;
  name: string;
  rating: number;
  text: string;
}
