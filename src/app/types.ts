// src/app/types.ts

export interface ServiceItem {
    id: number;
    name: string;
    price: string;
    category: string;
  }
  
  export interface GamepassItem {
    id: number;
    name: string;
    price: string;
    stock: string;
  }
  
  export interface TestimonialItem {
    id: number;
    user: string;
    text: string;
    rating: number;
  }