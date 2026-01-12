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
import { DialogModule } from 'primeng/dialog';
import { RecipeService } from '../../services/recipe.service';
import { Recipe } from '../../models/recipe.model';
import { RatingRecipe, CreateRatingRequest } from '../../models/recipe.model';

interface FilterOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-community',
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
    DialogModule
  ],
  template: `
    <div class="container mx-auto px-4 py-8">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-800 mb-2">
          <i class="pi pi-users text-blue-600 mr-2"></i>
          Comunidad de Recetas
        </h1>
        <p class="text-gray-600">
          Descubre recetas increíbles compartidas por nuestra comunidad
        </p>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div *ngFor="let item of [1,2,3,4,5,6]" class="bg-white rounded-lg shadow-sm p-6">
          <p-skeleton height="200px" styleClass="mb-4"></p-skeleton>
          <p-skeleton height="20px" styleClass="mb-2"></p-skeleton>
          <p-skeleton height="16px" width="70%" styleClass="mb-4"></p-skeleton>
          <div class="flex justify-between items-center">
            <p-skeleton height="20px" width="80px"></p-skeleton>
            <p-skeleton height="20px" width="60px"></p-skeleton>
          </div>
        </div>
      </div>

      <!-- Recipes Grid -->
      <div *ngIf="!loading && filteredRecipes.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <p-card *ngFor="let recipe of filteredRecipes" styleClass="recipe-card">
          <ng-template pTemplate="header">
            <div class="recipe-image">
              <img [src]="recipe.imageUrl || '/assets/images/recipe-placeholder.jpg'"
                   [alt]="recipe.name"
                   class="w-full h-48 object-cover">
              <div class="recipe-overlay">
                <p-button
                  icon="pi pi-eye"
                  severity="info"
                  [rounded]="true"
                  [routerLink]="['/recipes', recipe.id]">
                </p-button>
              </div>
            </div>
          </ng-template>

          <div class="recipe-content">
            <h3 class="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
              {{ recipe.name }}
            </h3>

            <p class="text-gray-600 text-sm mb-3 line-clamp-3">
              {{ recipe.description }}
            </p>

            <div class="flex items-center space-x-3 text-sm text-gray-500">
              <span>
                <i class="pi pi-money-bill mr-1"></i>
                {{ recipe.price | currency:'USD':'symbol':'1.0-0' }}
              </span>
              <span>
                <i class="pi pi-shopping-bag mr-1"></i>
                {{ recipe.ingredients?.length || 0 }} ing.
              </span>
            </div>

            <div class="flex items-center justify-between">
              <div class="flex items-center">
                                <p-rating
                  [(ngModel)]="recipe.averageRating"
                  [readonly]="true"
                  styleClass="text-sm">
                </p-rating>
                <span class="text-sm text-gray-500 ml-2">
                  ({{ recipe.totalRatings || 0 }})
                </span>
              </div>

              <div class="flex items-center space-x-2">
                <p-button
                  icon="pi pi-comment"
                  severity="help"
                  [text]="true"
                  size="small"
                  (onClick)="openReviews(recipe)">
                </p-button>
                <p-button
                  icon="pi pi-share-alt"
                  severity="info"
                  [text]="true"
                  size="small"
                  (onClick)="shareRecipe(recipe)">
                </p-button>
              </div>
            </div>
          </div>
        </p-card>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading && filteredRecipes.length === 0" class="text-center py-12">
        <i class="pi pi-search text-6xl text-gray-400 mb-4"></i>
        <h3 class="text-xl font-semibold text-gray-600 mb-2">No se encontraron recetas</h3>
      </div>
    </div>

    <!-- Review Dialog -->
    <p-dialog
      [(visible)]="displayReviews"
      [modal]="true"
      [draggable]="false"
      [resizable]="false"
      [closable]="false"
      [style]="{'width': '50vw'}"
      (onHide)="onDialogHide()">
      <div class="flex flex-col h-full">
        <div class="flex-grow overflow-y-auto">
          <div class="p-4">
            <h2 class="text-2xl font-semibold mb-4">Reseñas para {{ currentRecipe?.name }}</h2>
            <div class="flex items-center space-x-4 mb-4">
              <p-rating
                [(ngModel)]="newRating"
                [readonly]="false"
                [stars]="5">
              </p-rating>
              <span class="text-sm text-gray-500">
                {{ newRating }} de 5
              </span>
            </div>
            <textarea
              [(ngModel)]="newComment"
              placeholder="Escribe tu reseña..."
              rows="3"
              class="w-full p-2 border rounded-md">
            </textarea>
          </div>
          <div class="p-4 border-t">
            <h3 class="text-xl font-semibold mb-4">Reseñas anteriores</h3>
            <div *ngFor="let review of reviews" class="mb-4 p-4 border rounded-lg shadow-sm bg-white dark:bg-gray-900 hover:shadow-md transition-shadow">
              <div class="flex items-start justify-between mb-2">
                <div class="flex items-center space-x-3">
                  <!-- Avatar inicial -->
                  <div class="w-9 h-9 flex items-center justify-center rounded-full bg-blue-500 text-white font-semibold uppercase">
                    {{ getInitials(review) }}
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-800 dark:text-gray-200">{{ getReviewerName(review) }}</p>
                    <p class="text-xs text-gray-500">{{ review.created_at | date:'mediumDate' }}</p>
                  </div>
                </div>
                <p-rating [ngModel]="review.rating" [readonly]="true" styleClass="text-sm"></p-rating>
              </div>
              <p class="text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                {{ review.comment }}
              </p>
            </div>
          </div>
        </div>
        <div class="p-4 border-t flex justify-end space-x-2">
          <p-button
            label="Cerrar"
            icon="pi pi-times"
            severity="secondary"
            [text]="true"
            (onClick)="onDialogHide()">
          </p-button>
          <p-button
            label="Enviar reseña"
            icon="pi pi-check"
            severity="primary"
            (onClick)="submitReview()">
          </p-button>
        </div>
      </div>
    </p-dialog>
  `,
  styles: [`
    .recipe-card {
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .recipe-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .recipe-image {
      position: relative;
      overflow: hidden;
    }

    .recipe-image img {
      transition: transform 0.3s;
    }

    .recipe-card:hover .recipe-image img {
      transform: scale(1.05);
    }

    .recipe-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.3s;
    }

    .recipe-card:hover .recipe-overlay {
      opacity: 1;
    }

    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .line-clamp-3 {
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class CommunityComponent implements OnInit {
  recipes: Recipe[] = [];
  filteredRecipes: Recipe[] = [];
  loading = true;

  searchTerm = '';
  selectedDifficulty = '';
  sortBy = 'newest';

  difficultyOptions: FilterOption[] = [
    { label: 'Fácil', value: 'Fácil' },
    { label: 'Intermedio', value: 'Intermedio' },
    { label: 'Difícil', value: 'Difícil' }
  ];

  sortOptions: FilterOption[] = [
    { label: 'Más recientes', value: 'newest' },
    { label: 'Mejor calificadas', value: 'rating' },
    { label: 'Más populares', value: 'popular' },
    { label: 'Tiempo de preparación', value: 'time' }
  ];

  constructor(private recipeService: RecipeService) {}

  ngOnInit() {
    this.loadPublicRecipes();
  }

  loadPublicRecipes() {
    this.loading = true;
    this.recipeService.getPublicRecipes().subscribe({
      next: (recipes) => {
        this.recipes = recipes;
        this.filteredRecipes = [...recipes];
        this.loading = false;
        this.applyFilters();
      },
      error: (error) => {
        console.error('Error loading public recipes:', error);
        this.loading = false;
      }
    });
  }

  onSearch() {
    this.applyFilters();
  }

  onFilter() {
    this.applyFilters();
  }

  onSort() {
    this.applyFilters();
  }

  applyFilters() {
    let filtered = [...this.recipes];

    // Apply search filter
    if (this.searchTerm.trim()) {
      filtered = filtered.filter(recipe =>
        recipe.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        recipe.description.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    // Apply difficulty filter
    if (this.selectedDifficulty) {
      filtered = filtered.filter(recipe => recipe.difficulty === this.selectedDifficulty);
    }

    // Apply sorting
    switch (this.sortBy) {
      case 'rating':
        filtered.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
        break;
      case 'popular':
        filtered.sort((a, b) => (b.totalRatings || 0) - (a.totalRatings || 0));
        break;
      case 'time':
        filtered.sort((a, b) => a.preparationTime - b.preparationTime);
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => b.id - a.id);
        break;
    }

    this.filteredRecipes = filtered;
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedDifficulty = '';
    this.sortBy = 'newest';
    this.filteredRecipes = [...this.recipes];
  }

  getDifficultySeverity(difficulty: string): 'success' | 'info' | 'warn' | 'danger' {
    switch (difficulty) {
      case 'Fácil': return 'success';
      case 'Intermedio': return 'info';
      case 'Difícil': return 'warn';
      default: return 'info';
    }
  }

  toggleFavorite(recipe: Recipe) {
    // TODO: Implement favorite functionality
    console.log('Toggle favorite for recipe:', recipe.id);
  }

  shareRecipe(recipe: Recipe) {
    // TODO: Implement share functionality
    if (navigator.share) {
      navigator.share({
        title: recipe.name,
        text: recipe.description,
        url: window.location.origin + `/recipes/${recipe.id}`
      });
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(window.location.origin + `/recipes/${recipe.id}`);
    }
  }

  /* ================= RESEÑAS ================= */
  displayReviews = false;
  currentRecipe?: Recipe;
  reviews: RatingRecipe[] = [];
  newRating = 0;
  newComment = '';

  openReviews(recipe: Recipe) {
    this.currentRecipe = recipe;
    this.fetchReviews(recipe.id);
    this.displayReviews = true;
  }

  fetchReviews(id: number) {
    this.recipeService.getRecipeReviews(id).subscribe({
      next: (res) => {
        this.reviews = res;
      },
      error: (err) => console.error('Error al cargar reseñas', err)
    });
  }

  submitReview() {
    if (!this.currentRecipe) return;
    const payload = {
      recipeId: this.currentRecipe.id,
      rating: this.newRating,
      comment: this.newComment
    } as CreateRatingRequest;

    this.recipeService.createReview(payload).subscribe({
      next: (review) => {
        this.reviews.unshift(review);

        // Actualizar promedio y total de valoraciones en la tarjeta
        if (this.currentRecipe) {
          const prevTotal = this.currentRecipe.totalRatings || 0;
          const prevSum = (this.currentRecipe.averageRating || 0) * prevTotal;
          this.currentRecipe.totalRatings = prevTotal + 1;
          this.currentRecipe.averageRating = (prevSum + review.rating) / this.currentRecipe.totalRatings;
        }
        this.newRating = 0;
        this.newComment = '';
      },
      error: (err) => console.error('Error al crear reseña', err)
    });
  }

  onDialogHide() {
    this.displayReviews = false;
    this.reviews = [];
    this.newComment = '';
    this.newRating = 0;
  }

  getInitials(review: RatingRecipe): string {
    const name = this.getReviewerName(review);
    return name.split(' ').map(word => word.charAt(0)).join('');
  }

  getReviewerName(review: RatingRecipe): string {
    return review.user?.name || (review as any).name || 'Usuario Anónimo';
  }
}
