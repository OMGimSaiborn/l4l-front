import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Recipe, CreateRecipeRequest, RatingRecipe, CreateRatingRequest } from '../models/recipe.model';
import { ApiResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class RecipeService {
  private apiUrl = 'https://l4l-api.avalai.io/api';
  /** URL base donde Laravel expone los archivos de almacenamiento */
  private storageBaseUrl = 'https://l4l-api.avalai.io';

  /** Convierte una ruta relativa en una URL absoluta del storage */
  private resolveImageUrl(path?: string): string | undefined {
    if (!path) return undefined;
    // Si ya es absoluta devolvemos tal cual
    if (path.startsWith('http')) return path;
    // Garantizar que la ruta empieza con '/'
    const sanitized = path.startsWith('/') ? path : `/${path}`;
    return `${this.storageBaseUrl}${sanitized}`;
  }

  constructor(private http: HttpClient) {}

  private mapRecipe(api: any): Recipe {
    return {
      id: api.id,
      name: api.name,
      description: api.description || api.content || '',
      instructions: api.instructions || '',
      preparationTime: +api.preparation_time || 0,
      difficulty: api.difficulty || 'Fácil',
      servings: +api.servings || 0,
      price: +api.price || 0,
      calories: +api.calories || 0,
      ingredients: api.ingredients || [],
      imageUrl: api.image?.length ? this.resolveImageUrl(api.image[0].url) : undefined,
      images: api.image?.length ? api.image.map((img: any) => ({ id: img.id, url: this.resolveImageUrl(img.url) })) : [],
      isPublic: Boolean(api.share) || api.is_public || false,
      userId: api.user_id,
      averageRating: api.rating ?? api.average_rating,
      totalRatings: api.total ?? api.total_ratings
    } as Recipe;
  }

  // Recetas
  getAllRecipes(): Observable<Recipe[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/recipes`)
      .pipe(map(response => (response.data || []).map(r => this.mapRecipe(r))));
  }

  getPublicRecipes(): Observable<Recipe[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/recipe/comunity`)
      .pipe(map(response => (response.data || []).map(r => this.mapRecipe(r))));
  }

  getMyRecipes(): Observable<Recipe[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/recipe`)
      .pipe(map(response => (response.data || []).map(r => this.mapRecipe(r))));
  }

  getRecipeById(id: number): Observable<Recipe> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/recipe/${id}`)
      .pipe(map(response => {
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Receta no encontrada');
        }
        return this.mapRecipe(response.data);
      }));
  }


  createRecipeWithAI(ingredients: string[], budget: number): Observable<Recipe> {
    const request = {
      ingredients,
      budget
    };
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/recipe`, request)
      .pipe(map(response => {
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Error al generar la receta con IA');
        }
        return this.mapRecipe(response.data);
      }));
  }

  updateRecipe(id: number, recipe: Partial<Recipe>): Observable<Recipe> {
    return this.http.put<any>(`${this.apiUrl}/recipe/${id}`, recipe).pipe(map(res => res.data));
  }

  deleteRecipe(id: number): Observable<any> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/recipe/${id}`)
      .pipe(map(response => {
        if (!response.success) {
          throw new Error(response.message || 'Error al eliminar la receta');
        }
        return response;
      }));
  }

  /** Envía la receta por correo electrónico en formato PDF */
  emailRecipe(id: number): Observable<void> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/recipe/email/${id}`)
      .pipe(map(response => {
        if (!response.success) {
          throw new Error(response.message || 'Error al enviar la receta por correo');
        }
      }));
  }

  // Reseñas / Valoraciones
  /** Obtiene todas las reseñas de una receta */
  getRecipeReviews(recipeId: number): Observable<RatingRecipe[]> {
    return this.http.get<ApiResponse<RatingRecipe[]>>(`${this.apiUrl}/review/${recipeId}`)
      .pipe(map(response => response.data || []));
  }

  /** Crea una reseña para una receta */
  createReview(review: CreateRatingRequest): Observable<RatingRecipe> {
    return this.http.post<ApiResponse<RatingRecipe>>(`${this.apiUrl}/review`, {
      id: review.recipeId,
      rating: review.rating,
      comment: review.comment
    }).pipe(
      map(response => {
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Error al crear la reseña');
        }
        return response.data;
      })
    );
  }

  uploadImage(recipeId: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('image', file, file.name);
    return this.http.post<any>(`${this.apiUrl}/recipe/upload/${recipeId}`, formData);
  }

  deleteImage(imageId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/recipe/image/${imageId}`);
  }

  // NUEVO: alternar visibilidad (compartir / dejar de compartir)
  toggleShare(recipeId: number): Observable<void> {
    return this.http
      .put<ApiResponse<any>>(`${this.apiUrl}/recipe/share/${recipeId}`, { id: recipeId })
      .pipe(
        map((response) => {
          if (!response.success) {
            throw new Error(response.message || 'Error al actualizar la visibilidad');
          }
        })
      );
  }
}
