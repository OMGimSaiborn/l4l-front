import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToolbarModule } from 'primeng/toolbar';
import { TagModule } from 'primeng/tag';
import { MessageService, ConfirmationService } from 'primeng/api';
import { IngredientService } from '../../services/ingredient.service';
import { CategoryService } from '../../services/category.service';
import { Product, CreateProductRequest } from '../../models/ingredient.model';
import { Category } from '../../models/category.model';
import { DropdownModule } from 'primeng/dropdown';

@Component({
  selector: 'app-ingredients',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    DialogModule,
    ToastModule,
    ConfirmDialogModule,
    ToolbarModule,
    TagModule,
    FormsModule,
    DropdownModule
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <div class="container mx-auto px-4 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-800 mb-2">Gestión de Ingredientes</h1>
        <p class="text-gray-600">Administra tu inventario de ingredientes</p>
      </div>

      <p-toolbar styleClass="mb-4">
        <ng-template pTemplate="left">
          <p-button
            label="Nuevo Ingrediente"
            icon="pi pi-plus"
            severity="success"
            (onClick)="openNew()">
          </p-button>
        </ng-template>

        <ng-template pTemplate="right">
          <div class="flex items-center gap-2">
            <span class="p-input-icon-left">
              <i class="pi pi-search"></i>
              <input
                pInputText
                type="text"
                [(ngModel)]="searchTerm"
                (input)="onSearch()"
                placeholder="Buscar ingredientes..."
                class="w-64" />
            </span>
          </div>
        </ng-template>
      </p-toolbar>

      <p-table
        [value]="filteredProducts"
        [loading]="loading"
        dataKey="id"
        styleClass="p-datatable-gridlines">

        <ng-template pTemplate="header">
          <tr>
            <th>Nombre</th>
            <th>Precio</th>
            <th>Categoría</th>
            <th class="text-center">Acciones</th>
          </tr>
        </ng-template>

        <ng-template pTemplate="body" let-product>
          <tr>
            <td>
              <span class="font-semibold text-gray-800">{{ product.name }}</span>
            </td>
            <td>
              <div class="flex items-center">
                <span class="font-bold text-green-600">\${{ product.price | number:'1.2-2' }}</span>
              </div>
            </td>
            <td>
              <p-tag
                [value]="getCategoryName(product.categoryId)"
                [severity]="getCategorySeverity(getCategoryName(product.categoryId))">
              </p-tag>
            </td>
            <td class="text-center">
              <div class="flex justify-center gap-2">
                <p-button
                  icon="pi pi-pencil"
                  severity="info"
                  [text]="true"
                  (onClick)="editProduct(product)"
                  pTooltip="Editar">
                </p-button>
                <p-button
                  icon="pi pi-trash"
                  severity="danger"
                  [text]="true"
                  (onClick)="deleteProduct(product)"
                  pTooltip="Eliminar">
                </p-button>
              </div>
            </td>
          </tr>
        </ng-template>

        <ng-template pTemplate="emptymessage">
          <tr>
            <td colspan="4" class="text-center py-8">
              <div class="text-gray-500">
                <i class="pi pi-search text-4xl mb-4"></i>
                <p class="text-lg">No se encontraron ingredientes</p>
                <p class="text-sm">{{ searchTerm ? 'Intenta con otros términos de búsqueda' : 'Crea tu primer ingrediente' }}</p>
              </div>
            </td>
          </tr>
        </ng-template>
      </p-table>

      <!-- Dialog para crear/editar -->
      <p-dialog
        [header]="isEditing ? 'Editar Ingrediente' : 'Nuevo Ingrediente'"
        [(visible)]="showDialog"
        [modal]="true"
        [draggable]="false"
        [resizable]="false"
        styleClass="p-fluid"
        [style]="{width: '450px'}">

        <form [formGroup]="productForm" (ngSubmit)="saveProduct()">
          <div class="space-y-4">
            <div>
              <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Ingrediente *
              </label>
              <input
                pInputText
                id="name"
                formControlName="name"
                placeholder="Ej: Tomate, Cebolla, Pollo..."
                class="w-full"
                [class.ng-invalid]="productForm.get('name')?.invalid && productForm.get('name')?.touched"
              />
              <small class="text-red-500" *ngIf="productForm.get('name')?.invalid && productForm.get('name')?.touched">
                El nombre es requerido
              </small>
            </div>

            <div>
              <label for="price" class="block text-sm font-medium text-gray-700 mb-2">
                Precio por unidad *
              </label>
              <p-inputNumber
                formControlName="price"
                mode="currency"
                currency="USD"
                locale="es-US"
                [min]="0"
                [maxFractionDigits]="2"
                placeholder="0.00"
                styleClass="w-full">
              </p-inputNumber>
              <small class="text-red-500" *ngIf="productForm.get('price')?.invalid && productForm.get('price')?.touched">
                El precio es requerido y debe ser mayor a 0
              </small>
            </div>

            <div>
              <label for="category" class="block text-sm font-medium text-gray-700 mb-2">
                Categoría *
              </label>
              <p-dropdown
                id="category"
                formControlName="categoryId"
                [options]="categories"
                optionLabel="name"
                optionValue="id"
                placeholder="Selecciona categoría"
                appendTo="body"
                [scrollHeight]="'200px'"
                class="w-full">
              </p-dropdown>
              <small class="text-red-500" *ngIf="productForm.get('categoryId')?.invalid && productForm.get('categoryId')?.touched">
                La categoría es requerida
              </small>
            </div>
          </div>
        </form>

        <ng-template pTemplate="footer">
          <div class="flex justify-end gap-2">
            <p-button
              label="Cancelar"
              severity="secondary"
              [text]="true"
              (onClick)="hideDialog()">
            </p-button>
            <p-button
              [label]="isEditing ? 'Actualizar' : 'Crear'"
              [loading]="saving"
              [disabled]="productForm.invalid"
              (onClick)="saveProduct()">
            </p-button>
          </div>
        </ng-template>
      </p-dialog>

      <p-toast></p-toast>
      <p-confirmDialog></p-confirmDialog>
    </div>
  `,
  styles: [`
    :host ::ng-deep .p-datatable .p-datatable-thead > tr > th {
      background: #f8f9fa;
      color: #495057;
      font-weight: 600;
    }

    :host ::ng-deep .p-toolbar {
      background: #ffffff;
      border: 1px solid #e9ecef;
      border-radius: 6px;
    }
  `]
})
export class IngredientsComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  searchTerm: string = '';
  loading = true;
  saving = false;
  showDialog = false;
  isEditing = false;
  selectedProduct?: Product;
  categories: Category[] = [];

  productForm: FormGroup;

  constructor(
    private ingredientService: IngredientService,
    private categoryService: CategoryService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private fb: FormBuilder
  ) {
    this.productForm = this.fb.group({
      name: ['', [Validators.required]],
      price: [0, [Validators.required, Validators.min(0.01)]],
      categoryId: [null, Validators.required]
    });
  }

  ngOnInit() {
    this.loadProducts();
    this.loadCategories();
  }

  loadProducts() {
    this.loading = true;
    this.ingredientService.getAllProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.filteredProducts = products;
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los ingredientes'
        });
        this.loading = false;
      }
    });
  }

  loadCategories() {
    this.categoryService.getAllCategories().subscribe({
      next: (cats) => {
        this.categories = cats;
      },
      error: () => {
        // Silencio: si falla, dropdown simplemente quedará vacío
      }
    });
  }

  onSearch() {
    if (!this.searchTerm.trim()) {
      this.filteredProducts = [...this.products];
      return;
    }

    const searchLower = this.searchTerm.toLowerCase();
    this.filteredProducts = this.products.filter(product =>
      product.name.toLowerCase().includes(searchLower) ||
      (this.getCategoryName(product.categoryId).toLowerCase().includes(searchLower))
    );
  }

  openNew() {
    this.isEditing = false;
    this.selectedProduct = undefined;
    this.productForm.reset({
      name: '',
      price: 0,
      categoryId: null
    });
    this.showDialog = true;
  }

  editProduct(product: Product) {
    this.isEditing = true;
    this.selectedProduct = product;
    this.productForm.patchValue({
      name: product.name,
      price: product.price,
      categoryId: product.categoryId
    });
    this.showDialog = true;
  }

  saveProduct() {
    if (this.productForm.valid) {
      this.saving = true;
      const productData: CreateProductRequest = this.productForm.value;

      const request = this.isEditing && this.selectedProduct
        ? this.ingredientService.updateProduct(this.selectedProduct.id, productData)
        : this.ingredientService.createProduct(productData);

      request.subscribe({
        next: (product) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: `Ingrediente ${this.isEditing ? 'actualizado' : 'creado'} correctamente`
          });
          this.loadProducts();
          this.hideDialog();
          this.saving = false;
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message || `Error al ${this.isEditing ? 'actualizar' : 'crear'} el ingrediente`
          });
          this.saving = false;
        }
      });
    }
  }

  deleteProduct(product: Product) {
    this.confirmationService.confirm({
      message: `¿Estás seguro de que deseas eliminar "${product.name}"?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.ingredientService.deleteProduct(product.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Ingrediente eliminado correctamente'
            });
            this.loadProducts();
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.message || 'Error al eliminar el ingrediente'
            });
          }
        });
      }
    });
  }

  hideDialog() {
    this.showDialog = false;
    this.productForm.reset();
    this.selectedProduct = undefined;
    this.isEditing = false;
  }

  getCategorySeverity(category?: string): string {
    if (!category) return 'secondary';

    const categoryLower = category.toLowerCase();
    if (categoryLower.includes('vegetal') || categoryLower.includes('fruta')) return 'success';
    if (categoryLower.includes('carne') || categoryLower.includes('pollo')) return 'danger';
    if (categoryLower.includes('lácteo') || categoryLower.includes('lacteo')) return 'info';
    if (categoryLower.includes('cereal') || categoryLower.includes('grano')) return 'warning';

    return 'secondary';
  }

  getCategoryName(categoryId: number | null): string {
    const category = this.categories.find(c => c.id === categoryId);
    return category?.name || 'Sin categoría';
  }
}
