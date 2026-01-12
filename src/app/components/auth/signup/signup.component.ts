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
  selector: 'app-signup',
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
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div class="w-full max-w-md">
        <div class="text-center mb-8">
          <i class="pi pi-heart-fill text-4xl text-red-500 mb-4"></i>
          <h1 class="text-3xl font-bold text-gray-800 mb-2">Lunch4Less</h1>
          <p class="text-gray-600">Únete a nuestra comunidad</p>
        </div>

        <p-card styleClass="bg-white">
          <ng-template pTemplate="header">
            <div class="p-6 pb-0">
              <h2 class="text-2xl font-semibold text-gray-800 text-center">Crear Cuenta</h2>
            </div>
          </ng-template>

          <form [formGroup]="signupForm" (ngSubmit)="onSubmit()" class="space-y-6">
            <p-messages [value]="messages" [enableService]="false"></p-messages>

            <div class="space-y-2">
              <label for="name" class="block text-sm font-medium text-gray-700">
                Nombre Completo
              </label>
              <input
                pInputText
                id="name"
                type="text"
                formControlName="name"
                placeholder="Tu nombre completo"
                class="w-full"
                [class.ng-invalid]="signupForm.get('name')?.invalid && signupForm.get('name')?.touched"
              />
              <small class="text-red-500" *ngIf="signupForm.get('name')?.invalid && signupForm.get('name')?.touched">
                El nombre es requerido
              </small>
            </div>

            <div class="space-y-2">
              <label for="last_name" class="block text-sm font-medium text-gray-700">
                Apellidos
              </label>
              <input
                pInputText
                id="last_name"
                type="text"
                formControlName="last_name"
                placeholder="Tus apellidos"
                class="w-full"
                [class.ng-invalid]="signupForm.get('last_name')?.invalid && signupForm.get('last_name')?.touched"
              />
              <small class="text-red-500" *ngIf="signupForm.get('last_name')?.invalid && signupForm.get('last_name')?.touched">
                Los apellidos son requeridos
              </small>
            </div>

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
                [class.ng-invalid]="signupForm.get('email')?.invalid && signupForm.get('email')?.touched"
              />
              <small class="text-red-500" *ngIf="signupForm.get('email')?.invalid && signupForm.get('email')?.touched">
                <span *ngIf="signupForm.get('email')?.errors?.['required']">El email es requerido</span>
                <span *ngIf="signupForm.get('email')?.errors?.['email']">Ingresa un email válido</span>
              </small>
            </div>

            <div class="space-y-2">
              <label for="password" class="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <p-password
                formControlName="password"
                [feedback]="true"
                [toggleMask]="true"
                placeholder="Mínimo 6 caracteres"
                styleClass="w-full"
                inputStyleClass="w-full"
                [class.ng-invalid]="signupForm.get('password')?.invalid && signupForm.get('password')?.touched">
              </p-password>
              <small class="text-red-500" *ngIf="signupForm.get('password')?.invalid && signupForm.get('password')?.touched">
                <span *ngIf="signupForm.get('password')?.errors?.['required']">La contraseña es requerida</span>
                <span *ngIf="signupForm.get('password')?.errors?.['minlength']">La contraseña debe tener al menos 6 caracteres</span>
              </small>
            </div>

            <div class="space-y-2">
              <label for="confirmPassword" class="block text-sm font-medium text-gray-700">
                Confirmar Contraseña
              </label>
              <p-password
                formControlName="confirmPassword"
                [feedback]="false"
                [toggleMask]="true"
                placeholder="Confirma tu contraseña"
                styleClass="w-full"
                inputStyleClass="w-full"
                [class.ng-invalid]="signupForm.get('confirmPassword')?.invalid && signupForm.get('confirmPassword')?.touched">
              </p-password>
              <small class="text-red-500" *ngIf="signupForm.get('confirmPassword')?.invalid && signupForm.get('confirmPassword')?.touched">
                <span *ngIf="signupForm.get('confirmPassword')?.errors?.['required']">Confirma tu contraseña</span>
                <span *ngIf="signupForm.errors?.['passwordMismatch']">Las contraseñas no coinciden</span>
              </small>
            </div>

            <p-button
              type="submit"
              label="Crear Cuenta"
              [loading]="loading"
              [disabled]="signupForm.invalid"
              styleClass="w-full mt-5"
              size="large">
            </p-button>
          </form>

          <ng-template pTemplate="footer">
            <div class="text-center pt-4">
              <p class="text-gray-600">
                ¿Ya tienes cuenta?
                <a routerLink="/auth/login" class="text-green-600 hover:text-green-800 font-semibold">
                  Inicia sesión aquí
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
export class SignupComponent {
  signupForm: FormGroup;
  loading = false;
  messages: Message[] = [];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.signupForm = this.fb.group({
      name: ['', [Validators.required]],
      last_name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  onSubmit() {
    if (this.signupForm.valid) {
      this.loading = true;
      this.messages = [];

      const { confirmPassword, ...signupData } = this.signupForm.value;

      this.authService.signup(signupData).subscribe({
        next: (response) => {
          this.loading = false;
          this.messages = [
            {
              severity: 'success',
              summary: 'Éxito',
              detail: 'Cuenta creada exitosamente. Ya puedes iniciar sesión.'
            }
          ];
          setTimeout(() => {
            this.router.navigate(['/auth/login']);
          }, 2000);
        },
        error: (error) => {
          this.loading = false;
          this.messages = [
            {
              severity: 'error',
              summary: 'Error',
              detail: error.message || 'Error al crear la cuenta'
            }
          ];
        }
      });
    }
  }
}
