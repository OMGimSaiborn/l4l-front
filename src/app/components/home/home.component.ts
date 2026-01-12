import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonModule, CardModule],
  template: `
    <div class="min-h-screen">
      <!-- Hero Section -->
      <section class="bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 text-white">
        <div class="container mx-auto px-4 py-20">
          <div class="text-center">
            <h1 class="text-5xl md:text-6xl font-bold mb-6">
              Crea recetas increíbles con
              <span class="text-yellow-300">Inteligencia Artificial</span>
            </h1>
            <p class="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
              Deja que la IA te ayude a crear recetas deliciosas basadas en tus ingredientes favoritos y presupuesto
            </p>
            <div class="flex flex-col sm:flex-row gap-4 justify-center">
              <p-button
                label="Empezar Gratis"
                icon="pi pi-arrow-right"
                size="large"
                styleClass="text-lg px-8 py-3"
                routerLink="/auth/signup">
              </p-button>
              <p-button
                label="Ver Recetas"
                icon="pi pi-eye"
                severity="secondary"
                [outlined]="true"
                size="large"
                styleClass="text-lg px-8 py-3"
                routerLink="/community">
              </p-button>
            </div>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section class="py-20 bg-white">
        <div class="container mx-auto px-4">
          <div class="text-center mb-16">
            <h2 class="text-4xl font-bold text-gray-800 mb-4">¿Por qué Lunch4Less?</h2>
            <p class="text-xl text-gray-600 max-w-2xl mx-auto">
              Nuestra plataforma combina la creatividad culinaria con el poder de la inteligencia artificial
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="text-center">
              <div class="bg-purple-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <i class="pi pi-sparkles text-3xl text-purple-600"></i>
              </div>
              <h3 class="text-2xl font-semibold text-gray-800 mb-4">IA Creativa</h3>
              <p class="text-gray-600">
                Nuestra IA genera recetas únicas basadas en tus ingredientes disponibles y preferencias
              </p>
            </div>

            <div class="text-center">
              <div class="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <i class="pi pi-dollar text-3xl text-green-600"></i>
              </div>
              <h3 class="text-2xl font-semibold text-gray-800 mb-4">Control de Presupuesto</h3>
              <p class="text-gray-600">
                Establece tu presupuesto y recibe recetas que se ajusten perfectamente a tu bolsillo
              </p>
            </div>

            <div class="text-center">
              <div class="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <i class="pi pi-users text-3xl text-blue-600"></i>
              </div>
              <h3 class="text-2xl font-semibold text-gray-800 mb-4">Comunidad</h3>
              <p class="text-gray-600">
                Comparte tus creaciones y descubre recetas increíbles de otros usuarios
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- How it works -->
      <section class="py-20 bg-gray-50">
        <div class="container mx-auto px-4">
          <div class="text-center mb-16">
            <h2 class="text-4xl font-bold text-gray-800 mb-4">¿Cómo funciona?</h2>
            <p class="text-xl text-gray-600">Crear recetas nunca fue tan fácil</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div class="text-center">
              <div class="bg-gradient-to-br from-purple-500 to-pink-500 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                1
              </div>
              <h3 class="text-xl font-semibold text-gray-800 mb-2">Selecciona Ingredientes</h3>
              <p class="text-gray-600">Elige los ingredientes que tienes disponibles</p>
            </div>

            <div class="text-center">
              <div class="bg-gradient-to-br from-green-500 to-teal-500 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                2
              </div>
              <h3 class="text-xl font-semibold text-gray-800 mb-2">Define tu Presupuesto</h3>
              <p class="text-gray-600">Establece cuánto quieres gastar en tu receta</p>
            </div>

            <div class="text-center">
              <div class="bg-gradient-to-br from-blue-500 to-indigo-500 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                3
              </div>
              <h3 class="text-xl font-semibold text-gray-800 mb-2">IA Genera Receta</h3>
              <p class="text-gray-600">Nuestra IA crea una receta personalizada para ti</p>
            </div>

            <div class="text-center">
              <div class="bg-gradient-to-br from-orange-500 to-red-500 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                4
              </div>
              <h3 class="text-xl font-semibold text-gray-800 mb-2">¡Cocina y Comparte!</h3>
              <p class="text-gray-600">Prepara tu receta y compártela con la comunidad</p>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="py-20 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div class="container mx-auto px-4 text-center">
          <h2 class="text-4xl font-bold mb-4">¿Listo para comenzar?</h2>
          <p class="text-xl mb-8 opacity-90">
            Únete a miles de usuarios que ya están creando recetas increíbles
          </p>
          <p-button
            label="Crear Cuenta Gratis"
            icon="pi pi-user-plus"
            size="large"
            severity="secondary"
            styleClass="text-lg px-8 py-3"
            routerLink="/auth/signup">
          </p-button>
        </div>
      </section>
    </div>
  `,
  styles: [`
    :host ::ng-deep .p-button {
      border-radius: 0.75rem;
      font-weight: 600;
    }
  `]
})
export class HomeComponent {}
