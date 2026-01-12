import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Product, CreateProductRequest } from '../models/ingredient.model';
import { ApiResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class IngredientService {
  private apiUrl = 'https://l4l-api.avalai.io/api/product';

  constructor(private http: HttpClient) {}

  private mapProduct(apiProd: any): Product {
    return {
      id: apiProd.id,
      name: apiProd.name,
      price: +apiProd.price,
      categoryId: apiProd.category_id,
      categoryName: apiProd.category?.name
    };
  }

  getAllProducts(): Observable<Product[]> {
    return this.http.get<ApiResponse<any[]>>(this.apiUrl)
      .pipe(map(response => (response.data || []).map(p => this.mapProduct(p))));
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/${id}`)
      .pipe(map(response => {
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Producto no encontrado');
        }
        return this.mapProduct(response.data);
      }));
  }

  searchProducts(query: string): Observable<Product[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/search`, {
      params: { q: query }
    }).pipe(map(response => (response.data || []).map(p => this.mapProduct(p))));
  }

  createProduct(product: CreateProductRequest): Observable<Product> {
    const payload = {
      name: product.name,
      price: product.price,
      category_id: product.categoryId
    };
    return this.http.post<ApiResponse<any>>(this.apiUrl, payload)
      .pipe(map(response => {
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Error al crear el producto');
        }
        return this.mapProduct(response.data);
      }));
  }

  updateProduct(id: number, product: Partial<CreateProductRequest>): Observable<Product> {
    const payload: any = {};
    if (product.name) payload.name = product.name;
    if (product.price) payload.price = product.price;
    if (product.categoryId !== undefined) payload.category_id = product.categoryId;

    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/${id}`, payload)
      .pipe(map(response => {
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Error al actualizar el producto');
        }
        return this.mapProduct(response.data);
      }));
  }

  deleteProduct(id: number): Observable<any> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`)
      .pipe(map(response => {
        if (!response.success) {
          throw new Error(response.message || 'Error al eliminar el producto');
        }
        return response;
      }));
  }
}
