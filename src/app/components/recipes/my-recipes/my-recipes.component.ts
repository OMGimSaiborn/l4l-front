import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { RatingModule } from 'primeng/rating';
import { ChipModule } from 'primeng/chip';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { RecipeService } from '../../../services/recipe.service';
import { Recipe } from '../../../models/recipe.model';

@Component({
  selector: 'app-my-recipes',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    RatingModule,
    ChipModule,
    SkeletonModule,
    TagModule,
    ToastModule,
    ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <div class="container mx-auto px-4 py-8">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 class="text-3xl font-bold text-gray-800 mb-2">
              <i class="pi pi-book text-blue-600 mr-2"></i>
              Mis Recetas
            </h1>
            <p class="text-gray-600">
              Gestiona y organiza todas tus recetas creadas
            </p>
          </div>
          <div class="flex gap-2">
            <p-button
              label="Crear con IA"
              icon="pi pi-sparkles"
              routerLink="/recipes/create-ai">
            </p-button>
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8" *ngIf="!loading">
        <div class="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-blue-100 text-sm">Total Recetas</p>
              <p class="text-2xl font-bold">{{ recipes.length }}</p>
            </div>
            <i class="pi pi-book text-3xl text-blue-200"></i>
          </div>
        </div>

        <div class="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-green-100 text-sm">Públicas</p>
              <p class="text-2xl font-bold">{{ getPublicRecipesCount() }}</p>
            </div>
            <i class="pi pi-globe text-3xl text-green-200"></i>
          </div>
        </div>

        <div class="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-6 rounded-lg">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-yellow-100 text-sm">Promedio Rating</p>
              <p class="text-2xl font-bold">{{ getAverageRating() | number:'1.1-1' }}</p>
            </div>
            <i class="pi pi-star text-3xl text-yellow-200"></i>
          </div>
        </div>

        <div class="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-purple-100 text-sm">Favoritas</p>
              <p class="text-2xl font-bold">{{ getFavoriteRecipesCount() }}</p>
            </div>
            <i class="pi pi-heart-fill text-3xl text-purple-200"></i>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Buscar mis recetas</label>
            <span class="p-input-icon-left w-full">
              <i class="pi pi-search"></i>
              <input
                pInputText
                [(ngModel)]="searchTerm"
                (input)="filterRecipes()"
                placeholder="Nombre, descripción..."
                class="w-full" />
            </span>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Visibilidad</label>
            <p-dropdown
              [(ngModel)]="selectedVisibility"
              [options]="visibilityOptions"
              placeholder="Todas"
              [showClear]="true"
              (onChange)="filterRecipes()"
              styleClass="w-full">
            </p-dropdown>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Ordenar por</label>
            <p-dropdown
              [(ngModel)]="sortBy"
              [options]="sortOptions"
              (onChange)="sortRecipes()"
              styleClass="w-full">
            </p-dropdown>
          </div>
        </div>
      </div>

      <!-- Recipes Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" *ngIf="!loading">
        <div *ngFor="let recipe of filteredRecipes" class="recipe-card">
          <p-card styleClass="h-full">
            <ng-template pTemplate="header">
              <div class="relative">
                <div class="h-48 bg-gradient-to-r from-gray-200 to-gray-300 flex items-center justify-center">
                  <i class="pi pi-image text-4xl text-gray-500" *ngIf="!recipe.imageUrl"></i>
                  <img [src]="recipe.imageUrl" [alt]="recipe.name" class="w-full h-full object-cover" *ngIf="recipe.imageUrl">
                </div>
                <div class="absolute top-2 left-2">
                  <p-tag
                    [value]="recipe.isPublic ? 'Público' : 'Privado'"
                    [severity]="recipe.isPublic ? 'success' : 'secondary'"
                    styleClass="text-xs">
                  </p-tag>
                </div>
              </div>
            </ng-template>

            <div class="space-y-3 h-full flex flex-col">
              <div class="flex-1">
                <h3 class="text-lg font-semibold text-gray-800 mb-2">{{ recipe.name }}</h3>
                <p class="text-gray-600 text-sm mb-3 line-clamp-2">{{ recipe.description }}</p>

                <div class="flex items-center justify-between text-sm text-gray-500 mb-3">
                  <span><i class="pi pi-money-bill mr-1"></i>{{ recipe.price | currency:'USD':'symbol':'1.0-0' }}</span>
                  <span><i class="pi pi-shopping-bag mr-1"></i>{{ recipe.ingredients?.length || 0 }} ing.</span>
                </div>

                <div class="flex items-center justify-between mb-3">
                  <div class="flex items-center" *ngIf="recipe.averageRating && recipe.averageRating > 0">
                    <p-rating
                      [(ngModel)]="recipe.averageRating"
                      [readonly]="true"
                      styleClass="text-sm mr-2">
                    </p-rating>
                    <span class="text-sm text-gray-500">({{ recipe.totalRatings }})</span>
                  </div>
                  <div *ngIf="!recipe.averageRating || recipe.averageRating === 0">
                    <span class="text-sm text-gray-400">Sin calificaciones</span>
                  </div>
                </div>
              </div>

              <div class="pt-3 mt-auto space-y-2">
                <div class="flex gap-2">
                  <p-button
                    label="Ver"
                    icon="pi pi-eye"
                    size="small"
                    [routerLink]="['/recipes', recipe.id]"
                    styleClass="flex-1">
                  </p-button>
                  <p-button
                    label="Editar"
                    icon="pi pi-pencil"
                    severity="secondary"
                    [outlined]="true"
                    size="small"
                    [routerLink]="['/recipes', recipe.id, 'edit']"
                    styleClass="flex-1">
                  </p-button>
                  <p-button
                    [label]="recipe.isPublic ? 'Ocultar' : 'Compartir'"
                    [icon]="recipe.isPublic ? 'pi pi-eye-slash' : 'pi pi-share-alt'"
                    severity="info"
                    size="small"
                    (onClick)="toggleShare(recipe)"
                    styleClass="flex-1">
                  </p-button>
                </div>
                <p-button
                  label="Eliminar"
                  icon="pi pi-trash"
                  severity="danger"
                  [text]="true"
                  size="small"
                  (onClick)="deleteRecipe(recipe)"
                  styleClass="w-full">
                </p-button>
              </div>
            </div>
          </p-card>
        </div>
      </div>

      <!-- Loading skeleton -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" *ngIf="loading">
        <p-card *ngFor="let item of [1,2,3,4,5,6]" styleClass="h-full">
          <ng-template pTemplate="header">
            <p-skeleton height="12rem"></p-skeleton>
          </ng-template>
          <div class="space-y-3">
            <p-skeleton height="1.5rem" width="80%"></p-skeleton>
            <p-skeleton height="1rem"></p-skeleton>
            <p-skeleton height="1rem" width="60%"></p-skeleton>
            <div class="flex justify-between">
              <p-skeleton height="1rem" width="40%"></p-skeleton>
              <p-skeleton height="1rem" width="30%"></p-skeleton>
            </div>
            <p-skeleton height="2.5rem" width="100%"></p-skeleton>
          </div>
        </p-card>
      </div>

      <!-- Empty state -->
      <div class="text-center py-12" *ngIf="!loading && filteredRecipes.length === 0">
        <i class="pi pi-book text-6xl text-gray-300 mb-4"></i>
        <h3 class="text-xl font-semibold text-gray-500 mb-2">
          {{ searchTerm || selectedVisibility ? 'No se encontraron recetas' : 'Aún no tienes recetas' }}
        </h3>
        <p class="text-gray-400 mb-6">
          {{ searchTerm || selectedVisibility ? 'Intenta ajustar los filtros de búsqueda' : '¡Crea tu primera receta y empieza tu aventura culinaria!' }}
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center" *ngIf="!searchTerm && !selectedVisibility">
          <p-button
            label="Crear con IA"
            icon="pi pi-sparkles"
            routerLink="/recipes/create-ai">
          </p-button>
        </div>
      </div>
    </div>

    <p-toast></p-toast>
    <p-confirmDialog></p-confirmDialog>
  `,
  styles: [`
    .recipe-card {
      transition: transform 0.2s ease, box-shadow 0.2s ease;
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
      display: flex;
      flex-direction: column;
    }

    :host ::ng-deep .p-card-body {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    :host ::ng-deep .p-card-content {
      flex: 1;
      display: flex;
      flex-direction: column;
    }
  `]
})
export class MyRecipesComponent implements OnInit {
  recipes: Recipe[] = [];
  filteredRecipes: Recipe[] = [];
  loading = true;

  searchTerm = '';
  selectedVisibility: string | null = null;
  sortBy = 'newest';

  visibilityOptions = [
    { label: 'Públicas', value: 'public' },
    { label: 'Privadas', value: 'private' }
  ];

  sortOptions = [
    { label: 'Más recientes', value: 'newest' },
    { label: 'Mejor calificadas', value: 'rating' },
    { label: 'Tiempo de preparación', value: 'time' },
    { label: 'Nombre A-Z', value: 'name' }
  ];

  constructor(
    private recipeService: RecipeService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.loadMyRecipes();
  }

  loadMyRecipes() {
    this.loading = true;
    this.recipeService.getMyRecipes().subscribe({
      next: (recipes) => {
        this.recipes = recipes;
        this.filteredRecipes = [...recipes];
        this.sortRecipes();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading my recipes:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar tus recetas'
        });
        this.loading = false;
      }
    });
  }

  filterRecipes() {
    let filtered = [...this.recipes];

    // Filter by search term
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(recipe =>
        recipe.name.toLowerCase().includes(searchLower) ||
        recipe.description.toLowerCase().includes(searchLower)
      );
    }

    // Filter by visibility
    if (this.selectedVisibility) {
      filtered = filtered.filter(recipe =>
        this.selectedVisibility === 'public' ? recipe.isPublic : !recipe.isPublic
      );
    }

    this.filteredRecipes = filtered;
    this.sortRecipes();
  }

  sortRecipes() {
    switch (this.sortBy) {
      case 'rating':
        this.filteredRecipes.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
        break;
      case 'time':
        this.filteredRecipes.sort((a, b) => a.preparationTime - b.preparationTime);
        break;
      case 'name':
        this.filteredRecipes.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'newest':
      default:
        this.filteredRecipes.sort((a, b) => b.id - a.id);
        break;
    }
  }

  deleteRecipe(recipe: Recipe) {
    this.confirmationService.confirm({
      message: `¿Estás seguro de que deseas eliminar "${recipe.name}"?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.recipeService.deleteRecipe(recipe.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Receta eliminada correctamente'
            });
            this.loadMyRecipes();
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.message || 'Error al eliminar la receta'
            });
          }
        });
      }
    });
  }

  toggleShare(recipe: Recipe) {
    this.recipeService.toggleShare(recipe.id).subscribe({
      next: () => {
        // Actualizamos el estado local
        recipe.isPublic = !recipe.isPublic;
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: recipe.isPublic ? 'Receta compartida con la comunidad' : 'Receta marcada como privada'
        });
        // Refiltramos para actualizar contadores y vista
        this.filterRecipes();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.message || 'No se pudo actualizar la visibilidad'
        });
      }
    });
  }

  getDifficultySeverity(difficulty: string): string {
    switch (difficulty.toLowerCase()) {
      case 'fácil':
        return 'success';
      case 'medio':
        return 'warning';
      case 'difícil':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  getPublicRecipesCount(): number {
    return this.recipes.filter(recipe => recipe.isPublic).length;
  }

  getAverageRating(): number {
    const ratingsSum = this.recipes.reduce((sum, recipe) => sum + (recipe.averageRating || 0), 0);
    const ratingsCount = this.recipes.filter(recipe => recipe.averageRating && recipe.averageRating > 0).length;
    return ratingsCount > 0 ? ratingsSum / ratingsCount : 0;
  }

  getFavoriteRecipesCount(): number {
    return this.recipes.filter(recipe => recipe.averageRating && recipe.averageRating >= 4.5).length;
  }
}
