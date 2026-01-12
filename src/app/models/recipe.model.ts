export interface Recipe {
  id: number;
  name: string;
  description: string;
  instructions: string;
  preparationTime: number;
  difficulty: string;
  servings: number;
  price?: number;
  calories?: number;
  imageUrl?: string;
  isPublic: boolean;
  userId: number;
  user?: {
    name: string;
  };
  averageRating?: number;
  totalRatings?: number;
  images?: RecipeImage[];
  ingredients?: RecipeIngredient[];
}

export interface RecipeIngredient {
  id: number;
  productId: number;
  quantity: number;
  product: {
    id: number;
    name: string;
    price: number;
  };
}

export interface CreateRecipeRequest {
  name: string;
  description: string;
  preparationTime: number;
  difficulty: string;
  servings: number;
  isPublic: boolean;
  ingredients: {
    productId: number;
    quantity: number;
  }[];
  budget?: number;
  price?: number;
}

export interface RatingRecipe {
  id: number;
  rating: number;
  comment?: string;
  userId: number;
  recipeId: number;
  user?: {
    name: string;
  };
  created_at?: string;
}

export interface CreateRatingRequest {
  rating: number;
  comment?: string;
  recipeId: number;
}

export interface RecipeImage {
  id?: number;
  url: string;
}
