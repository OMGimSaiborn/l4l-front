import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-create-recipe',
  standalone: true,
  imports: [CommonModule, RouterLink, CardModule, ButtonModule],
  template: `
    <div class="container mx-auto px-4 py-8">
      <div class="max-w-4xl mx-auto">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-800 mb-2">
            <i class="pi pi-pencil text-blue-600 mr-2"></i>
            Crear Receta Manual
          </h1>
          <p class="text-gray-600">
            Crea tu receta paso a paso con tus propios ingredientes e instrucciones
          </p>
        </div>

        <p-card>
          <div class="text-center py-12">
            <i class="pi pi-wrench text-6xl text-gray-300 mb-4"></i>
            <h3 class="text-xl font-semibold text-gray-500 mb-2">En Desarrollo</h3>
            <p class="text-gray-400 mb-6">
              Esta funcionalidad estará disponible próximamente
            </p>
            <div class="flex gap-4 justify-center">
              <p-button
                label="Crear con IA"
                icon="pi pi-sparkles"
                routerLink="/recipes/create-ai">
              </p-button>
              <p-button
                label="Volver al Dashboard"
                icon="pi pi-home"
                severity="secondary"
                [outlined]="true"
                routerLink="/dashboard">
              </p-button>
            </div>
          </div>
        </p-card>
      </div>
    </div>
  `
})
export class CreateRecipeComponent {}
