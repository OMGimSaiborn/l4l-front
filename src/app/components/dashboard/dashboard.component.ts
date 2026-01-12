import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { ChipModule } from 'primeng/chip';
import { RatingModule } from 'primeng/rating';
import { FormsModule } from '@angular/forms';
import { RecipeService } from '../../services/recipe.service';
import { AuthService } from '../../services/auth.service';
import { Recipe } from '../../models/recipe.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    CardModule,
    ButtonModule,
    SkeletonModule,
    ChipModule,
    RatingModule,
    FormsModule
  ],
  template: `
    <div class="container mx-auto px-4 py-8">
      <!-- Bienvenida -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-800 mb-2">
          ¡Bienvenido, {{ currentUser?.name }}! 👋
        </h1>
        <p class="text-gray-600 text-lg">
          ¿Qué deliciosa receta crearemos hoy?
        </p>
      </div>

      <!-- Acciones rápidas -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 max-w-5xl mx-auto justify-center">
        <p-card styleClass="bg-gradient-to-br from-purple-500 to-pink-500 text-white border-0">
          <div class="text-center">
            <i class="pi pi-sparkles text-4xl mb-4"></i>
            <h3 class="text-xl font-semibold mb-2">Crear con IA</h3>
            <p class="mb-4 opacity-90">Deja que la IA te sorprenda</p>
            <p-button
              label="Empezar"
              severity="secondary"
              [outlined]="true"
              routerLink="/recipes/create-ai"
              styleClass="w-full">
            </p-button>
          </div>
        </p-card>

        <p-card styleClass="bg-gradient-to-br from-blue-500 to-indigo-500 text-white border-0">
          <div class="text-center">
            <i class="pi pi-shopping-bag text-4xl mb-4"></i>
            <h3 class="text-xl font-semibold mb-2">Ingredientes</h3>
            <p class="mb-4 opacity-90">Gestiona tus ingredientes</p>
            <p-button
              label="Ver"
              severity="secondary"
              [outlined]="true"
              routerLink="/ingredients"
              styleClass="w-full">
            </p-button>
          </div>
        </p-card>

        <p-card styleClass="bg-gradient-to-br from-orange-500 to-red-500 text-white border-0">
          <div class="text-center">
            <i class="pi pi-users text-4xl mb-4"></i>
            <h3 class="text-xl font-semibold mb-2">Comunidad</h3>
            <p class="mb-4 opacity-90">Explora recetas públicas</p>
            <p-button
              label="Explorar"
              severity="secondary"
              [outlined]="true"
              routerLink="/community"
              styleClass="w-full">
            </p-button>
          </div>
        </p-card>
      </div>

      <!-- Mis recetas recientes -->
      <div class="mb-8">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold text-gray-800">Mis Recetas Recientes</h2>
          <p-button
            label="Ver todas"
            [text]="true"
            routerLink="/recipes/my">
          </p-button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" *ngIf="!loadingMyRecipes">
          <div *ngFor="let recipe of myRecipes" class="recipe-card">
            <p-card>
              <ng-template pTemplate="header">
                <div class="h-48 bg-gradient-to-r from-gray-200 to-gray-300 flex items-center justify-center">
                  <i class="pi pi-image text-4xl text-gray-500" *ngIf="!recipe.imageUrl"></i>
                  <img [src]="recipe.imageUrl" [alt]="recipe.name" class="w-full h-full object-cover" *ngIf="recipe.imageUrl">
                </div>
              </ng-template>

              <div class="space-y-3">
                <h3 class="text-lg font-semibold text-gray-800">{{ recipe.name }}</h3>
                <p class="text-gray-600 text-sm line-clamp-2">{{ recipe.description }}</p>

                <div class="flex items-center justify-between text-sm text-gray-500">
                  <span><i class="pi pi-money-bill mr-1"></i>{{ recipe.price | currency:'USD':'symbol':'1.0-0' }}</span>
                  <span><i class="pi pi-shopping-bag mr-1"></i>{{ recipe.ingredients?.length || 0 }} ing.</span>
                </div>

                <div class="flex items-center justify-between">
                  <div class="flex items-center" *ngIf="recipe.averageRating">
                                         <p-rating
                       [(ngModel)]="recipe.averageRating"
                       [readonly]="true"
                       styleClass="text-sm">
                     </p-rating>
                    <span class="text-sm text-gray-500 ml-2">({{ recipe.totalRatings }})</span>
                  </div>
                  <p-button
                    label="Ver"
                    size="small"
                    [routerLink]="['/recipes', recipe.id]">
                  </p-button>
                </div>
              </div>
            </p-card>
          </div>
        </div>

        <!-- Loading skeleton -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" *ngIf="loadingMyRecipes">
          <p-card *ngFor="let item of [1,2,3]">
            <ng-template pTemplate="header">
              <p-skeleton height="12rem"></p-skeleton>
            </ng-template>
            <div class="space-y-3">
              <p-skeleton height="1.5rem" width="80%"></p-skeleton>
              <p-skeleton height="1rem"></p-skeleton>
              <p-skeleton height="1rem" width="60%"></p-skeleton>
              <div class="flex justify-between">
                <p-skeleton height="1rem" width="40%"></p-skeleton>
                <p-skeleton height="2rem" width="4rem"></p-skeleton>
              </div>
            </div>
          </p-card>
        </div>

        <!-- Empty state -->
        <div class="text-center py-12" *ngIf="!loadingMyRecipes && myRecipes.length === 0">
          <i class="pi pi-book text-6xl text-gray-300 mb-4"></i>
          <h3 class="text-xl font-semibold text-gray-500 mb-2">Aún no tienes recetas</h3>
          <p class="text-gray-400 mb-6">¡Crea tu primera receta y empieza tu aventura culinaria!</p>
          <p-button
            label="Crear primera receta"
            routerLink="/recipes/create-ai">
          </p-button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .recipe-card {
      transition: transform 0.2s ease;
    }

    .recipe-card:hover {
      transform: translateY(-4px);
    }

    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    :host ::ng-deep .p-card {
      height: 100%;
    }

    :host ::ng-deep .p-card-body {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    :host ::ng-deep .p-card-content {
      flex: 1;
    }
  `]
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  myRecipes: Recipe[] = [];
  loadingMyRecipes = true;

  constructor(
    private authService: AuthService,
    private recipeService: RecipeService
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    this.loadMyRecipes();
  }

  private loadMyRecipes() {
    this.recipeService.getMyRecipes().subscribe({
      next: (recipes) => {
        this.myRecipes = recipes.slice(0, 6); // Solo mostrar las 6 más recientes
        this.loadingMyRecipes = false;
      },
      error: (error) => {
        console.error('Error loading recipes:', error);
        this.loadingMyRecipes = false;
      }
    });
  }
}
