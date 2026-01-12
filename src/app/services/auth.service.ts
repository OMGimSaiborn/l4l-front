import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, tap, catchError, throwError } from 'rxjs';
import { User, LoginRequest, LoginResponse, SignupRequest, ApiResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://l4l-api.avalai.io/api';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private tokenKey = 'auth_token';
  private userKey = 'auth_user';

  constructor(private http: HttpClient) {
    this.loadStoredUser();
  }

  private loadStoredUser(): void {
    if (typeof localStorage === 'undefined') return;

    const token = localStorage.getItem(this.tokenKey);
    const storedUser = localStorage.getItem(this.userKey);

    if (storedUser) {
      try {
        const user: User = JSON.parse(storedUser);
        this.currentUserSubject.next(user);
      } catch (_) {}
    }

    if (token && !storedUser && token.includes('.')) {
      // Intento de decodificar JWT
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const user: User = {
          id: payload.userId ?? 0,
          email: payload.sub ?? '',
          name: payload.name || payload.sub || ''
        };
        this.currentUserSubject.next(user);
        localStorage.setItem(this.userKey, JSON.stringify(user));
      } catch (_) {
        // No hacemos logout para conservar el token
      }
    }
  }

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/login`, request)
      .pipe(
        map(response => {
          if (!response.success) {
            throw new Error(response.message || 'Error en el login');
          }

          // El token puede venir en response.token o en response.data.token
          const token: string | undefined = response.data?.token ?? (response as any).token;
          if (!token) {
            throw new Error('Token no proporcionado por el servidor');
          }

          const user: User | undefined = response.data?.user;

          return { token, user } as LoginResponse;
        }),
        tap(loginData => {
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem(this.tokenKey, loginData.token);

            const userToStore: User = loginData.user ?? {
              id: 0,
              email: request.email,
              name: request.email.split('@')[0]
            } as User;
            localStorage.setItem(this.userKey, JSON.stringify(userToStore));
          }
          if (loginData.user) {
            this.currentUserSubject.next(loginData.user);
          } else {
            // Si el backend no devuelve usuario, intentamos inferirlo del token
            try {
              const payload = JSON.parse(atob(loginData.token.split('.')[1]));
              const user: User = {
                id: payload.userId,
                email: payload.sub,
                name: payload.name || payload.sub
              };
              this.currentUserSubject.next(user);
            } catch (_) {
              // omitimos si no se puede decodificar
            }
          }
        }),
        catchError(err => {
          const message = err.error?.message || err.message || 'Error en el login';
          return throwError(() => new Error(message));
        })
      );
  }

  signup(request: SignupRequest): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/signup`, request)
      .pipe(
        map(response => {
          if (!response.success) {
            throw new Error(response.message || 'Error en el registro');
          }
          return response;
        }),
        catchError(err => {
          const message = err.error?.message || err.message || 'Error en el registro';
          return throwError(() => new Error(message));
        })
      );
  }

  logout(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.userKey);
    }
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    if (typeof localStorage === 'undefined') return false;
    return !!localStorage.getItem(this.tokenKey);
  }

  getToken(): string | null {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem(this.tokenKey);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
}
