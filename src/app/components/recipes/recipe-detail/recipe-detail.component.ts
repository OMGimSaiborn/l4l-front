import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { RecipeService } from '../../../services/recipe.service';
import { Recipe } from '../../../models/recipe.model';
import { Subscription, switchMap } from 'rxjs';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { GalleriaModule } from 'primeng/galleria';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { marked } from 'marked';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-recipe-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    CardModule,
    ButtonModule,
    GalleriaModule,
    ProgressSpinnerModule,
    ToastModule
  ],
  providers: [MessageService],
  template: `
    <div class="container mx-auto px-4 py-8" *ngIf="loading">
      <div class="flex justify-center items-center py-20">
        <p-progressSpinner></p-progressSpinner>
      </div>
    </div>

    <div class="container mx-auto px-4 py-8" *ngIf="!loading && recipe">
      <div class="max-w-4xl mx-auto space-y-8">
        <!-- Encabezado -->
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 class="text-3xl font-bold text-gray-800 mb-2">
              <i class="pi pi-eye text-blue-600 mr-2"></i>
              {{ recipe.name }}
            </h1>
            <!-- Descripción suprimida aquí para evitar duplicar el contenido principal -->
          </div>
          <div class="flex gap-2">
            <p-button label="Editar" icon="pi pi-pencil" severity="secondary" [outlined]="true" [routerLink]="['/recipes', recipe.id, 'edit']"></p-button>
            <p-button label="Enviar correo" icon="pi pi-envelope" (click)="sendEmail()"></p-button>
          </div>
        </div>

        <!-- Carrusel de Imágenes -->
        <p-galleria *ngIf="(recipe.images?.length || 0) > 0"
                    [value]="recipe.images || []"
                    [showThumbnails]="true"
                    [showIndicators]="(recipe.images?.length || 0) > 1"
                    [circular]="true"
                    [autoPlay]="(recipe.images?.length || 0) > 1"
                    [transitionInterval]="5000"
                    [containerStyle]="{ 'max-width': '100%' }">
          <ng-template pTemplate="item" let-item>
            <img [src]="item.url" alt="imagen de receta" class="w-full h-96 object-cover" />
          </ng-template>
          <ng-template pTemplate="thumbnail" let-item>
            <img [src]="item.url" alt="miniatura" class="h-20 object-cover" />
          </ng-template>
        </p-galleria>
        <!-- Imagen principal cuando no hay galería -->
        <img *ngIf="recipe.imageUrl && !(recipe.images?.length)" [src]="recipe.imageUrl" alt="imagen de receta" class="w-full h-96 object-cover" />
        <!-- Placeholder si no hay imágenes -->
        <div class="h-64 bg-gray-100 flex items-center justify-center" *ngIf="!recipe.imageUrl && !(recipe.images?.length)">
          <i class="pi pi-image text-6xl text-gray-300"></i>
        </div>

        <!-- Contenido -->
        <p-card>
          <ng-template pTemplate="content">
            <div class="space-y-4">
              <div class="prose max-w-none" [innerHTML]="htmlContent"></div>

              <div class="flex items-center gap-4 pt-4 border-t border-gray-200">
                <span class="text-xl font-semibold text-green-600">
                  <i class="pi pi-money-bill mr-1"></i>
                  {{ recipe.price | currency:'USD':'symbol':'1.2-2' }}
                </span>
                <span class="text-sm text-gray-500">
                  <i class="pi pi-shopping-bag mr-1"></i>
                  {{ recipe.ingredients?.length || 0 }} ingredientes
                </span>
              </div>
            </div>
          </ng-template>
        </p-card>
      </div>
    </div>
  `
})
export class RecipeDetailComponent implements OnInit, OnDestroy {
  recipe?: Recipe;
  loading = true;
  htmlContent?: SafeHtml;
  private sub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private recipeService: RecipeService,
    private sanitizer: DomSanitizer,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.sub = this.route.paramMap.pipe(
      switchMap(params => {
        this.loading = true;
        const id = Number(params.get('id'));
        return this.recipeService.getRecipeById(id);
      })
    ).subscribe({
      next: (r) => {
        this.recipe = r;
        let md = r.instructions || r.description || '';
        // Si el markdown incluye encabezado o imagen, eliminarlos para evitar duplicados
        md = md.replace(/^#.+$/m, '') // quita primer título (# ...)
          .replace(/!\[[^\]]*\]\([^)]*\)/, '') // quita primera imagen markdown
          .trim();

        // Si existe la sección "### Preparación", nos quedamos desde ahí para no repetir resumen
        const prepIndex = md.indexOf('### Preparación');
        if (prepIndex > -1) {
          md = md.slice(prepIndex);
        }

        const rawHtml = marked.parse(md) as string;
        // También removemos primer <h1/2/3> residual e img que haya quedado en HTML
        const cleanedHtml = rawHtml
          .replace(/<h[1-3][^>]*>.*?<\/h[1-3]>/i, '')
          .replace(/<img[^>]*>/i, '');


        this.htmlContent = this.sanitizer.bypassSecurityTrustHtml(cleanedHtml);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  sendEmail(): void {
    if (!this.recipe) return;
    this.loading = true;
    this.recipeService.emailRecipe(this.recipe.id).subscribe({
      next: () => {
        this.loading = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'La receta ha sido enviada a tu correo'
        });
      },
      error: () => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo enviar la receta por correo'
        });
      }
    });
  }
}
