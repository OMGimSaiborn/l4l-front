import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { RecipeService } from '../../../services/recipe.service';
import { Recipe } from '../../../models/recipe.model';
import { RecipeImage } from '../../../models/recipe.model';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { FileUploadModule } from 'primeng/fileupload';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-edit-recipe',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    FileUploadModule,
    ToastModule,
    ProgressSpinnerModule
  ],
  providers: [MessageService],
  template: `
    <div class="container mx-auto px-4 py-8" *ngIf="loading">
      <div class="flex justify-center items-center py-20">
        <p-progressSpinner></p-progressSpinner>
      </div>
    </div>

    <p-toast></p-toast>
    <div class="container mx-auto px-4 py-8" *ngIf="!loading && recipe">
      <div class="max-w-4xl mx-auto">
        <!-- Encabezado -->
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 class="text-3xl font-bold text-gray-800 mb-2">
              <i class="pi pi-pencil text-blue-600 mr-2"></i>
              Editar Receta
            </h1>
            <p class="text-gray-600">Modifica los datos básicos de tu receta</p>
          </div>
          <div class="flex gap-2">
            <p-button label="Volver" icon="pi pi-arrow-left" severity="secondary" [outlined]="true" (onClick)="goBack()"></p-button>
          </div>
        </div>

        <p-card>
          <form [formGroup]="editForm" class="space-y-6" (ngSubmit)="save()">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Nombre -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Título *</label>
                <input pInputText formControlName="name" placeholder="Título de la receta" class="w-full" />
                <small class="text-red-500" *ngIf="editForm.get('name')?.invalid && editForm.get('name')?.touched">El título es obligatorio</small>
              </div>
              <!-- Precio -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Precio (MXN)</label>
                <p-inputNumber formControlName="price" mode="currency" currency="USD" locale="es-US" [minFractionDigits]="0" styleClass="w-full"></p-inputNumber>
              </div>
              <!-- Calorías -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Calorías (kcal)</label>
                <p-inputNumber formControlName="calories" [minFractionDigits]="0" [maxFractionDigits]="0" styleClass="w-full"></p-inputNumber>
              </div>
            </div>

            <!-- Contenido -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Contenido / Preparación *</label>
              <textarea rows="6" formControlName="content" placeholder="Describe la preparación..." class="w-full p-inputtext p-inputtextarea"></textarea>
              <small class="text-red-500" *ngIf="editForm.get('content')?.invalid && editForm.get('content')?.touched">El contenido es obligatorio</small>
            </div>

            <!-- Imágenes -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-4">Imágenes</label>
              <!-- Vista previa imágenes existentes -->
              <div class="flex flex-wrap gap-4 mb-4" *ngIf="images.length > 0">
                <div class="relative w-32 h-32" *ngFor="let img of images; let idx = index">
                  <img [src]="img.url" alt="imagen" class="w-full h-full object-cover rounded" />
                  <button type="button" (click)="removeImage(idx)" class="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 text-xs">
                    <i class="pi pi-times"></i>
                  </button>
                </div>
              </div>

              <!-- Subir nuevas imágenes -->
              <p-fileUpload name="file" mode="basic" accept="image/*" [auto]="false" chooseLabel="Seleccionar" (onSelect)="onFileSelect($event)" [maxFileSize]="5000000"></p-fileUpload>
              <small class="text-gray-500 block mt-2">Puedes subir varias imágenes. Máximo 5MB cada una.</small>
            </div>

            <div class="flex justify-end gap-2 pt-4 border-t border-gray-200">
              <p-button label="Guardar" icon="pi pi-save" [loading]="saving" type="submit"></p-button>
            </div>
          </form>
        </p-card>
      </div>
    </div>
  `
})
export class EditRecipeComponent implements OnInit, OnDestroy {
  editForm!: FormGroup;
  recipe?: Recipe;
  loading = true;
  saving = false;
  images: RecipeImage[] = [];
  private newFiles: File[] = [];
  private sub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private recipeService: RecipeService,
    private fb: FormBuilder,
    private messageService: MessageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.loading = false;
      return;
    }
    this.sub = this.recipeService.getRecipeById(id).subscribe({
      next: (r) => {
        this.recipe = r;
        this.images = r.images || [];
        this.initForm();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  private initForm(): void {
    this.editForm = this.fb.group({
      name: [this.recipe?.name || '', Validators.required],
      content: [this.recipe?.instructions || this.recipe?.description || '', Validators.required],
      price: [this.recipe?.price ?? null],
      calories: [this.recipe?.calories ?? null]
    });
  }

  onFileSelect(event: any): void {
    const files: File[] = event.files || [];
    this.newFiles.push(...files);
    // Previsualizar en la lista
    for (const f of files) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.images.push({ url: e.target.result });
      };
      reader.readAsDataURL(f);
    }
  }

  removeImage(index: number): void {
    const img = this.images[index];
    if (img.id) {
      this.recipeService.deleteImage(img.id).subscribe({
        next: () => {
          this.images.splice(index, 1);
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar la imagen' });
        }
      });
    } else {
      this.images.splice(index, 1);
      this.newFiles.splice(index, 1);
    }
  }

  save(): void {
    if (this.editForm.invalid || !this.recipe) {
      this.editForm.markAllAsTouched();
      return;
    }
    this.saving = true;
    const { name, content, price, calories } = this.editForm.value;
    const recipeId = this.recipe.id;

    // 1. Actualizar los datos de la receta
    this.recipeService.updateRecipe(recipeId, { name, content, price, calories } as any).subscribe({
      next: () => {
        // 2. Subir las nuevas imágenes si las hay
        if (this.newFiles.length > 0) {
          this.uploadFiles(recipeId);
        } else {
          this.handleSaveSuccess(recipeId);
        }
      },
      error: (err) => this.handleSaveError(err)
    });
  }

  private uploadFiles(recipeId: number): void {
    const uploadObservables = this.newFiles.map(file => this.recipeService.uploadImage(recipeId, file));
    let completed = 0;

    uploadObservables.forEach(obs => {
      obs.subscribe({
        next: () => {
          completed++;
          if (completed === uploadObservables.length) {
            this.handleSaveSuccess(recipeId);
          }
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Error de subida', detail: `No se pudo subir una imagen.` });
          completed++;
          if (completed === uploadObservables.length) {
            this.handleSaveSuccess(recipeId); // O manejar como un fallo parcial
          }
        }
      });
    });
  }

  private handleSaveSuccess(recipeId: number): void {
    this.saving = false;
    this.newFiles = [];
    this.messageService.add({ severity: 'success', summary: 'Actualizado', detail: 'La receta se actualizó correctamente' });
    this.router.navigate(['/recipes', recipeId]);
  }

  private handleSaveError(err: any): void {
    console.error(err);
    this.saving = false;
    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar la receta' });
  }

  goBack(): void {
    this.router.navigate(['/recipes', this.recipe?.id]);
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
