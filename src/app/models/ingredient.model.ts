export interface Product {
  id: number;
  name: string;
  price: number;
  categoryId: number;
  categoryName?: string; // nombre leído de la API
}

export interface CreateProductRequest {
  name: string;
  price: number;
  categoryId: number;
}

export interface AddIngredientRequest {
  productId: number;
  quantity: number;
}
