import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { MessagesModule } from 'primeng/messages';
import { AuthService } from '../../../services/auth.service';

interface Message {
  severity: string;
  summary: string;
  detail: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    CardModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    MessagesModule
  ],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div class="w-full max-w-md">
        <div class="text-center mb-8">
          <i class="pi pi-heart-fill text-4xl text-red-500 mb-4"></i>
          <h1 class="text-3xl font-bold text-gray-800 mb-2">Lunch4Less</h1>
          <p class="text-gray-600">Crea recetas deliciosas con inteligencia artificial</p>
        </div>

        <p-card styleClass="bg-white">
          <ng-template pTemplate="header">
            <div class="p-6 pb-0">
              <h2 class="text-2xl font-semibold text-gray-800 text-center">Iniciar Sesión</h2>
            </div>
          </ng-template>

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-6">
            <p-messages [value]="messages" [enableService]="false"></p-messages>

            <div class="space-y-2">
              <label for="email" class="block text-sm font-medium text-gray-700">
                Correo Electrónico
              </label>
              <input
                pInputText
                id="email"
                type="email"
                formControlName="email"
                placeholder="tu@email.com"
                class="w-full"
                [class.ng-invalid]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched"
              />
              <small class="text-red-500" *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched">
                <span *ngIf="loginForm.get('email')?.errors?.['required']">El email es requerido</span>
                <span *ngIf="loginForm.get('email')?.errors?.['email']">Ingresa un email válido</span>
              </small>
            </div>

            <div class="space-y-2">
              <label for="password" class="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <p-password
                formControlName="password"
                [feedback]="false"
                [toggleMask]="true"
                placeholder="Tu contraseña"
                styleClass="w-full"
                inputStyleClass="w-full"
                [class.ng-invalid]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched">
              </p-password>
              <small class="text-red-500" *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched">
                La contraseña es requerida
              </small>
            </div>

            <p-button
              type="submit"
              label="Iniciar Sesión"
              [loading]="loading"
              [disabled]="loginForm.invalid"
              styleClass="w-full mt-5"
              size="large">
            </p-button>
          </form>

          <ng-template pTemplate="footer">
            <div class="text-center pt-4">
              <p class="text-gray-600">
                ¿No tienes cuenta?
                <a routerLink="/auth/signup" class="text-blue-600 hover:text-blue-800 font-semibold">
                  Regístrate aquí
                </a>
              </p>
            </div>
          </ng-template>
        </p-card>
      </div>
    </div>
  `,
  styles: [`
    :host ::ng-deep .p-card {
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
      border-radius: 1rem;
    }

    :host ::ng-deep .p-password {
      width: 100%;
    }

    :host ::ng-deep .p-inputtext {
      border-radius: 0.5rem;
      padding: 0.75rem;
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  messages: Message[] = [];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.loading = true;
      this.messages = [];

      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          this.loading = false;
          this.router.navigate(['/dashboard']).then(() => {
            if (typeof window !== 'undefined') {
              window.location.reload();
            }
          });
        },
        error: (error) => {
          this.loading = false;
          this.messages = [
            {
              severity: 'error',
              summary: 'Error',
              detail: (error.error?.message as string) || error.message || 'Credenciales incorrectas'
            }
          ];
        }
      });
    }
  }
}
