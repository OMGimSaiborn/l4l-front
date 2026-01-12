import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { MultiSelectModule } from 'primeng/multiselect';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessagesModule } from 'primeng/messages';
import { StepsModule } from 'primeng/steps';
import { ChipModule } from 'primeng/chip';
import { TagModule } from 'primeng/tag';
import { MenuItem } from 'primeng/api';
import { RecipeService } from '../../../services/recipe.service';
import { IngredientService } from '../../../services/ingredient.service';
import { Product } from '../../../models/ingredient.model';
import { Recipe } from '../../../models/recipe.model';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { marked } from 'marked';

interface Message {
  severity: string;
  summary: string;
  detail: string;
}

@Component({
  selector: 'app-create-ai',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    InputNumberModule,
    MultiSelectModule,
    ProgressSpinnerModule,
    MessagesModule,
    StepsModule,
    ChipModule,
    TagModule
  ],
  template: `
    <div class="container mx-auto px-4 py-8">
      <div class="max-w-4xl mx-auto">
        <!-- Header -->
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-800 mb-2">
            <i class="pi pi-sparkles text-purple-600 mr-2"></i>
            Crear Receta con IA
          </h1>
          <p class="text-gray-600">
            Selecciona tus ingredientes y presupuesto, y deja que la IA cree una receta perfecta para ti
          </p>
        </div>

        <!-- Steps -->
        <p-steps
          [model]="steps"
          [activeIndex]="activeStep"
          styleClass="mb-8">
        </p-steps>

        <!-- Step 1: Seleccionar Ingredientes -->
        <div *ngIf="activeStep === 0">
          <p-card>
            <ng-template pTemplate="header">
              <div class="p-6 pb-0">
                <h2 class="text-2xl font-semibold text-gray-800">
                  <i class="pi pi-shopping-bag mr-2 text-green-600"></i>
                  Selecciona tus Ingredientes
                </h2>
                <p class="text-gray-600 mt-2">
                  Elige los ingredientes que tienes disponibles o que te gustaría usar
                </p>
              </div>
            </ng-template>

            <form [formGroup]="ingredientsForm" class="space-y-6">
              <p-messages [value]="messages" [enableService]="false"></p-messages>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-3">
                  Ingredientes Disponibles *
                </label>
                <p-multiSelect
                  formControlName="selectedIngredients"
                  [options]="availableIngredients"
                  optionLabel="name"
                  optionValue="id"
                  placeholder="Selecciona ingredientes..."
                  [filter]="true"
                  filterBy="name"
                  [showClear]="true"
                  styleClass="w-full"
                  [maxSelectedLabels]="3"
                  selectedItemsLabel="{0} ingredientes seleccionados">

                  <ng-template pTemplate="item" let-ingredient>
                    <div class="flex items-center justify-between w-full">
                      <div>
                        <span class="font-medium">{{ ingredient.name }}</span>
                        <small class="text-gray-500 block">{{ ingredient.category || 'Sin categoría' }}</small>
                      </div>
                      <p-tag
                        [value]="(ingredient.price | currency:'USD':'symbol':'1.2-2') ?? ''"
                        severity="success"
                        styleClass="text-sm">
                      </p-tag>
                    </div>
                  </ng-template>
                </p-multiSelect>
                <small class="text-red-500" *ngIf="ingredientsForm.get('selectedIngredients')?.invalid && ingredientsForm.get('selectedIngredients')?.touched">
                  Selecciona al menos 2 ingredientes
                </small>
              </div>

              <!-- Ingredientes seleccionados -->
              <div *ngIf="selectedIngredientsData.length > 0" class="bg-gray-50 p-4 rounded-lg">
                <h3 class="font-semibold text-gray-800 mb-3">Ingredientes Seleccionados:</h3>
                <div class="flex flex-wrap gap-2">
                  <p-chip
                    *ngFor="let ingredient of selectedIngredientsData"
                    [label]="ingredient.name + ' - ' + (ingredient.price | currency:'USD':'symbol':'1.2-2')"
                    [removable]="true"
                    (onRemove)="removeIngredient(ingredient.id)">
                  </p-chip>
                </div>
                <div class="mt-3 pt-3 border-t border-gray-200">
                  <p class="text-sm text-gray-600">
                    <strong>Costo base estimado:</strong>
                    <span class="text-green-600 font-semibold">
                      {{ calculateBaseCost() | currency:'USD':'symbol':'1.2-2' }}
                    </span>
                  </p>
                </div>
              </div>

              <div class="flex justify-end">
                <p-button
                  label="Siguiente"
                  icon="pi pi-arrow-right"
                  [disabled]="!ingredientsForm.valid"
                  (onClick)="nextStep()">
                </p-button>
              </div>
            </form>
          </p-card>
        </div>

        <!-- Step 2: Configurar Presupuesto -->
        <div *ngIf="activeStep === 1">
          <p-card>
            <ng-template pTemplate="header">
              <div class="p-6 pb-0">
                <h2 class="text-2xl font-semibold text-gray-800">
                  <i class="pi pi-dollar mr-2 text-green-600"></i>
                  Define tu Presupuesto
                </h2>
                <p class="text-gray-600 mt-2">
                  Establece cuánto quieres gastar en tu receta completa
                </p>
              </div>
            </ng-template>

            <form [formGroup]="budgetForm" class="space-y-6">
              <div class="bg-blue-50 p-4 rounded-lg">
                <h3 class="font-semibold text-blue-800 mb-2">Resumen de Ingredientes Base</h3>
                <p class="text-blue-700 text-sm mb-2">
                  Has seleccionado {{ selectedIngredientsData.length }} ingredientes con un costo base de
                  <strong>{{ calculateBaseCost() | currency:'USD':'symbol':'1.2-2' }}</strong>
                </p>
                <div class="flex flex-wrap gap-1">
                  <small class="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs"
                         *ngFor="let ingredient of selectedIngredientsData">
                    {{ ingredient.name }}
                  </small>
                </div>
              </div>

              <div>
                <label for="budget" class="block text-sm font-medium text-gray-700 mb-3">
                  Presupuesto Total *
                </label>
                <p-inputNumber
                  formControlName="budget"
                  mode="currency"
                  currency="USD"
                  locale="es-US"
                  [min]="calculateBaseCost()"
                  [max]="1000"
                  [maxFractionDigits]="2"
                  placeholder="0.00"
                  styleClass="w-full">
                </p-inputNumber>
                <small class="text-gray-500 mt-1 block">
                  El presupuesto mínimo es {{ calculateBaseCost() | currency:'USD':'symbol':'1.2-2' }} (costo de ingredientes base)
                </small>
                <small class="text-red-500" *ngIf="budgetForm.get('budget')?.invalid && budgetForm.get('budget')?.touched">
                  <span *ngIf="budgetForm.get('budget')?.errors?.['required']">El presupuesto es requerido</span>
                  <span *ngIf="budgetForm.get('budget')?.errors?.['min']">
                    Presupuesto mínimo: {{ calculateBaseCost() | currency:'USD':'symbol':'1.2-2' }}
                  </span>
                </small>
              </div>

              <div class="bg-yellow-50 p-4 rounded-lg" *ngIf="budgetForm.get('budget')?.value">
                <h4 class="font-semibold text-yellow-800 mb-2">
                  <i class="pi pi-info-circle mr-1"></i>
                  Información del Presupuesto
                </h4>
                <div class="text-sm text-yellow-700 space-y-1">
                  <p>• Ingredientes base: {{ calculateBaseCost() | currency:'USD':'symbol':'1.2-2' }}</p>
                  <p>• Presupuesto adicional:
                    {{ (budgetForm.get('budget')?.value - calculateBaseCost()) | currency:'USD':'symbol':'1.2-2' }}
                  </p>
                  <p class="font-medium">
                    La IA podrá sugerir ingredientes adicionales y condimentos dentro de este rango
                  </p>
                </div>
              </div>

              <div class="flex justify-between">
                <p-button
                  label="Anterior"
                  icon="pi pi-arrow-left"
                  severity="secondary"
                  [text]="true"
                  (onClick)="previousStep()">
                </p-button>
                <p-button
                  label="Generar Receta"
                  icon="pi pi-sparkles"
                  [disabled]="!budgetForm.valid"
                  [loading]="generating"
                  (onClick)="generateRecipe()">
                </p-button>
              </div>
            </form>
          </p-card>
        </div>

        <!-- Step 3: Generando Receta -->
        <div *ngIf="activeStep === 2">
          <p-card styleClass="text-center">
            <div class="py-12">
              <div class="mb-6" *ngIf="!generatedRecipe">
                <p-progressSpinner styleClass="w-16 h-16"></p-progressSpinner>
              </div>

              <div *ngIf="!generatedRecipe">
                <h2 class="text-2xl font-semibold text-gray-800 mb-4">
                  <i class="pi pi-sparkles mr-2 text-purple-600"></i>
                  Generando tu receta...
                </h2>
                <p class="text-gray-600 mb-4">
                  Nuestra IA está creando una receta personalizada con tus ingredientes y presupuesto
                </p>
                <div class="bg-purple-50 p-4 rounded-lg max-w-md mx-auto">
                  <p class="text-sm text-purple-700">
                    <strong>Procesando:</strong> {{ selectedIngredientsData.length }} ingredientes con presupuesto de
                    {{ budgetForm.get('budget')?.value | currency:'USD':'symbol':'1.2-2' }}
                  </p>
                </div>
              </div>

              <!-- Receta Generada -->
              <div *ngIf="generatedRecipe" class="text-left">
                <div class="text-center mb-6">
                  <i class="pi pi-check-circle text-4xl text-green-600 mb-4"></i>
                  <h2 class="text-2xl font-semibold text-gray-800">¡Receta Generada!</h2>
                  <p class="text-gray-600">Tu receta personalizada está lista</p>
                </div>

                <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <h3 class="text-xl font-bold text-gray-800 mb-2">{{ generatedRecipe.name }}</h3>
                  <p class="text-gray-600 mb-4">{{ generatedRecipe.description }}</p>

                  <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div class="text-center">
                      <i class="pi pi-clock text-blue-600 text-lg mb-1"></i>
                      <p class="text-sm font-medium">{{ generatedRecipe.preparationTime }} min</p>
                    </div>
                    <div class="text-center">
                      <i class="pi pi-users text-green-600 text-lg mb-1"></i>
                      <p class="text-sm font-medium">{{ generatedRecipe.servings }} personas</p>
                    </div>
                    <div class="text-center">
                      <i class="pi pi-star text-yellow-600 text-lg mb-1"></i>
                      <p class="text-sm font-medium">{{ generatedRecipe.difficulty }}</p>
                    </div>
                    <div class="text-center">
                      <i class="pi pi-dollar text-purple-600 text-lg mb-1"></i>
                      <p class="text-sm font-medium">Dentro de presupuesto</p>
                    </div>
                  </div>

                  <div class="bg-gray-50 p-4 rounded-lg">
                    <h4 class="font-semibold text-gray-800 mb-2">Vista previa de instrucciones:</h4>
                    <div class="prose max-w-none text-sm text-gray-600 line-clamp-3" [innerHTML]="htmlPreview"></div>
                  </div>
                </div>

                <div class="flex flex-col sm:flex-row gap-4 justify-center mt-6">
                  <p-button
                    label="Ver Receta Completa"
                    icon="pi pi-eye"
                    (onClick)="viewRecipe()">
                  </p-button>
                  <p-button
                    label="Generar Otra"
                    icon="pi pi-refresh"
                    severity="secondary"
                    [outlined]="true"
                    (onClick)="startOver()">
                  </p-button>
                </div>
              </div>
            </div>
          </p-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .line-clamp-3 {
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    :host ::ng-deep .p-steps .p-steps-item.p-highlight .p-steps-number {
      background: #7c3aed;
      color: white;
    }

    :host ::ng-deep .p-multiselect-panel .p-multiselect-items .p-multiselect-item {
      padding: 0.75rem;
    }

    :host ::ng-deep .p-inputnumber {
      width: 100%;
    }
  `]
})
export class CreateAiComponent implements OnInit {
  steps: MenuItem[] = [
    { label: 'Ingredientes', icon: 'pi pi-shopping-bag' },
    { label: 'Presupuesto', icon: 'pi pi-dollar' },
    { label: 'Generar', icon: 'pi pi-sparkles' }
  ];

  activeStep = 0;
  ingredientsForm: FormGroup;
  budgetForm: FormGroup;
  messages: Message[] = [];

  availableIngredients: Product[] = [];
  selectedIngredientsData: Product[] = [];
  generating = false;
  generatedRecipe?: Recipe;
  htmlPreview?: SafeHtml;

  constructor(
    private fb: FormBuilder,
    private ingredientService: IngredientService,
    private recipeService: RecipeService,
    private router: Router,
    private sanitizer: DomSanitizer
  ) {
    this.ingredientsForm = this.fb.group({
      selectedIngredients: [[], [Validators.required, Validators.minLength(2)]]
    });

    this.budgetForm = this.fb.group({
      budget: [0, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit() {
    this.loadIngredients();
  }

  loadIngredients() {
    this.ingredientService.getAllProducts().subscribe({
      next: (products) => {
        this.availableIngredients = products;
      },
      error: (error) => {
        this.messages = [
          {
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron cargar los ingredientes'
          }
        ];
      }
    });
  }

  nextStep() {
    if (this.activeStep === 0 && this.ingredientsForm.valid) {
      this.updateSelectedIngredientsData();
      this.updateBudgetMinimum();
      this.activeStep = 1;
    }
  }

  previousStep() {
    if (this.activeStep > 0) {
      this.activeStep--;
    }
  }

  updateSelectedIngredientsData() {
    const selectedIds = this.ingredientsForm.get('selectedIngredients')?.value || [];
    this.selectedIngredientsData = this.availableIngredients.filter(
      ingredient => selectedIds.includes(ingredient.id)
    );
  }

  updateBudgetMinimum() {
    const minBudget = this.calculateBaseCost();
    this.budgetForm.get('budget')?.setValidators([
      Validators.required,
      Validators.min(minBudget)
    ]);
    this.budgetForm.get('budget')?.updateValueAndValidity();

    // Set minimum value if current is less
    const currentBudget = this.budgetForm.get('budget')?.value || 0;
    if (currentBudget < minBudget) {
      this.budgetForm.patchValue({ budget: minBudget });
    }
  }

  removeIngredient(ingredientId: number) {
    const currentSelected = this.ingredientsForm.get('selectedIngredients')?.value || [];
    const newSelected = currentSelected.filter((id: number) => id !== ingredientId);
    this.ingredientsForm.patchValue({ selectedIngredients: newSelected });
    this.updateSelectedIngredientsData();
    this.updateBudgetMinimum();
  }

  calculateBaseCost(): number {
    return this.selectedIngredientsData.reduce((total, ingredient) => total + ingredient.price, 0);
  }

  generateRecipe() {
    if (this.budgetForm.valid) {
      this.generating = true;
      this.activeStep = 2;
      this.messages = [];

      const selectedNames = this.selectedIngredientsData.map(i => i.name);
      const budget = this.budgetForm.get('budget')?.value;

      this.recipeService.createRecipeWithAI(selectedNames, budget).subscribe({
        next: (recipe) => {
          this.generatedRecipe = recipe;
          // Convertir markdown a HTML seguro para la vista previa
          const rawHtml = marked.parse(this.generatedRecipe.instructions || '') as string;
          this.htmlPreview = this.sanitizer.bypassSecurityTrustHtml(rawHtml);
          this.generating = false;
        },
        error: (error) => {
          this.generating = false;
          this.messages = [
            {
              severity: 'error',
              summary: 'Error',
              detail: error.message || 'Error al generar la receta'
            }
          ];
          this.activeStep = 1; // Volver al paso anterior
        }
      });
    }
  }

  viewRecipe() {
    if (this.generatedRecipe) {
      this.router.navigate(['/recipes', this.generatedRecipe.id]);
    }
  }

  startOver() {
    this.activeStep = 0;
    this.generatedRecipe = undefined;
    this.ingredientsForm.reset({ selectedIngredients: [] });
    this.budgetForm.reset({ budget: 0 });
    this.selectedIngredientsData = [];
    this.messages = [];
  }
}
