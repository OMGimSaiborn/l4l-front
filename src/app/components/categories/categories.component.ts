import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToolbarModule } from 'primeng/toolbar';
import { MessageService, ConfirmationService } from 'primeng/api';
import { CategoryService } from '../../services/category.service';
import { Category, CreateCategoryRequest } from '../../models/category.model';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
    ToastModule,
    ConfirmDialogModule,
    ToolbarModule,
    FormsModule
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <div class="container mx-auto px-4 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-800 mb-2">Gestión de Categorías</h1>
        <p class="text-gray-600">Crea y administra las categorías de tus productos</p>
      </div>

      <p-toolbar styleClass="mb-4">
        <ng-template pTemplate="left">
          <p-button
            label="Nueva Categoría"
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
                placeholder="Buscar categorías..."
                class="w-64" />
            </span>
          </div>
        </ng-template>
      </p-toolbar>

      <p-table
        [value]="filteredCategories"
        [loading]="loading"
        dataKey="id"
        styleClass="p-datatable-gridlines">

        <ng-template pTemplate="header">
          <tr>
            <th>Nombre</th>
            <th>Descripción</th>
            <th class="text-center">Acciones</th>
          </tr>
        </ng-template>

        <ng-template pTemplate="body" let-category>
          <tr>
            <td>
              <span class="font-semibold text-gray-800">{{ category.name }}</span>
            </td>
            <td>
              <span class="text-gray-600">{{ category.description || 'Sin descripción' }}</span>
            </td>
            <td class="text-center">
              <div class="flex justify-center gap-2">
                <p-button
                  icon="pi pi-pencil"
                  severity="info"
                  [text]="true"
                  (onClick)="editCategory(category)"
                  pTooltip="Editar">
                </p-button>
                <p-button
                  icon="pi pi-trash"
                  severity="danger"
                  [text]="true"
                  (onClick)="deleteCategory(category)"
                  pTooltip="Eliminar">
                </p-button>
              </div>
            </td>
          </tr>
        </ng-template>

        <ng-template pTemplate="emptymessage">
          <tr>
            <td colspan="3" class="text-center py-8">
              <div class="text-gray-500">
                <i class="pi pi-search text-4xl mb-4"></i>
                <p class="text-lg">No se encontraron categorías</p>
                <p class="text-sm">{{ searchTerm ? 'Intenta con otros términos de búsqueda' : 'Crea tu primera categoría' }}</p>
              </div>
            </td>
          </tr>
        </ng-template>
      </p-table>

      <!-- Dialog crear/editar -->
      <p-dialog
        [header]="isEditing ? 'Editar Categoría' : 'Nueva Categoría'"
        [(visible)]="showDialog"
        [modal]="true"
        [draggable]="false"
        [resizable]="false"
        styleClass="p-fluid"
        [style]="{width: '450px'}">

        <form [formGroup]="categoryForm" (ngSubmit)="saveCategory()">
          <div class="space-y-4">
            <div>
              <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
                Nombre de la Categoría *
              </label>
              <input
                pInputText
                id="name"
                formControlName="name"
                placeholder="Ej: Vegetales, Carnes, Lácteos..."
                class="w-full"
                [class.ng-invalid]="categoryForm.get('name')?.invalid && categoryForm.get('name')?.touched"
              />
              <small class="text-red-500" *ngIf="categoryForm.get('name')?.invalid && categoryForm.get('name')?.touched">
                El nombre es requerido
              </small>
            </div>

            <div>
              <label for="description" class="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                pInputText
                id="description"
                formControlName="description"
                placeholder="Descripción opcional de la categoría..."
                rows="3"
                class="w-full resize-none">
              </textarea>
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
              [disabled]="categoryForm.invalid"
              (onClick)="saveCategory()">
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
export class CategoriesComponent implements OnInit {
  categories: Category[] = [];
  filteredCategories: Category[] = [];
  searchTerm: string = '';
  loading = true;
  saving = false;
  showDialog = false;
  isEditing = false;
  selectedCategory?: Category;
  categoryForm: FormGroup;

  constructor(
    private categoryService: CategoryService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private fb: FormBuilder
  ) {
    this.categoryForm = this.fb.group({
      name: ['', Validators.required],
      description: ['']
    });
  }

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.loading = true;
    this.categoryService.getAllCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.filteredCategories = categories;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  onSearch() {
    const term = this.searchTerm.toLowerCase();
    this.filteredCategories = this.categories.filter(c =>
      c.name.toLowerCase().includes(term) ||
      (c.description?.toLowerCase().includes(term) ?? false)
    );
  }

  openNew() {
    this.categoryForm.reset();
    this.isEditing = false;
    this.showDialog = true;
  }

  editCategory(category: Category) {
    this.selectedCategory = category;
    this.categoryForm.patchValue({
      name: category.name,
      description: category.description
    });
    this.isEditing = true;
    this.showDialog = true;
  }

  saveCategory() {
    if (this.categoryForm.invalid) return;

    const categoryData: CreateCategoryRequest = {
      name: this.categoryForm.value.name,
      description: this.categoryForm.value.description
    };

    this.saving = true;

    if (this.isEditing && this.selectedCategory) {
      this.categoryService.updateCategory(this.selectedCategory.id, categoryData).subscribe({
        next: (updated) => {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Categoría actualizada' });
          this.showDialog = false;
          this.saving = false;
          // Actualizar localmente
          const idx = this.categories.findIndex(c => c.id === updated.id);
          if (idx !== -1) this.categories[idx] = updated;
          this.onSearch();
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar' });
          this.saving = false;
        }
      });
    } else {
      this.categoryService.createCategory(categoryData).subscribe({
        next: (created) => {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Categoría creada' });
          this.showDialog = false;
          this.saving = false;
          this.categories.push(created);
          this.onSearch();
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo crear' });
          this.saving = false;
        }
      });
    }
  }

  deleteCategory(category: Category) {
    this.confirmationService.confirm({
      message: `¿Seguro que deseas eliminar la categoría "${category.name}"?`,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí',
      rejectLabel: 'No',
      accept: () => {
        this.categoryService.deleteCategory(category.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Categoría eliminada' });
            this.categories = this.categories.filter(c => c.id !== category.id);
            this.onSearch();
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar' });
          }
        });
      }
    });
  }

  hideDialog() {
    this.showDialog = false;
  }
}
