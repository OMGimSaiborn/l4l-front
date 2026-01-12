import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Category, CreateCategoryRequest } from '../models/category.model';
import { ApiResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = 'https://l4l-api.avalai.io/api/category';

  constructor(private http: HttpClient) {}

  getAllCategories(): Observable<Category[]> {
    return this.http.get<ApiResponse<Category[]>>(this.apiUrl)
      .pipe(map(response => response.data || []));
  }

  getCategoryById(id: number): Observable<Category> {
    return this.http.get<ApiResponse<Category>>(`${this.apiUrl}/${id}`)
      .pipe(map(response => {
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Categoría no encontrada');
        }
        return response.data;
      }));
  }

  searchCategories(query: string): Observable<Category[]> {
    return this.http.get<ApiResponse<Category[]>>(`${this.apiUrl}/search`, {
      params: { q: query }
    }).pipe(map(response => response.data || []));
  }

  createCategory(category: CreateCategoryRequest): Observable<Category> {
    return this.http.post<ApiResponse<Category>>(this.apiUrl, category)
      .pipe(map(response => {
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Error al crear la categoría');
        }
        return response.data;
      }));
  }

  updateCategory(id: number, category: Partial<CreateCategoryRequest>): Observable<Category> {
    return this.http.put<ApiResponse<Category>>(`${this.apiUrl}/${id}`, category)
      .pipe(map(response => {
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Error al actualizar la categoría');
        }
        return response.data;
      }));
  }

  deleteCategory(id: number): Observable<any> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`)
      .pipe(map(response => {
        if (!response.success) {
          throw new Error(response.message || 'Error al eliminar la categoría');
        }
        return response;
      }));
  }
}
