import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { MenubarModule } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    MenubarModule,
    ButtonModule,
    AvatarModule,
    MenuModule
  ],
  template: `
    <div class="bg-white shadow-lg border-b border-gray-200">
      <p-menubar [model]="items" class="border-none">
        <ng-template pTemplate="start">
          <div class="flex items-center">
            <i class="pi pi-heart-fill text-2xl text-red-500 mr-2"></i>
            <span class="text-xl font-bold text-gray-800">Lunch4Less</span>
          </div>
        </ng-template>

        <ng-template pTemplate="end">
          <div class="flex items-center gap-2" *ngIf="currentUser; else loginSection">
            <p-avatar
              [label]="getInitials(currentUser.name)"
              styleClass="mr-2"
              size="normal"
              shape="circle">
            </p-avatar>
            <span class="text-gray-700 font-medium mr-3">{{ currentUser.name }}</span>
            <p-button
              icon="pi pi-sign-out"
              severity="secondary"
              [text]="true"
              (onClick)="logout()"
              pTooltip="Cerrar Sesión">
            </p-button>
          </div>

          <ng-template #loginSection>
            <div class="flex gap-2">
              <p-button
                label="Iniciar Sesión"
                severity="secondary"
                [text]="true"
                routerLink="/auth/login">
              </p-button>
              <p-button
                label="Registrarse"
                routerLink="/auth/signup">
              </p-button>
            </div>
          </ng-template>
        </ng-template>
      </p-menubar>
    </div>
  `,
  styles: [`
    :host ::ng-deep .p-menubar {
      padding: 1rem 2rem;
      border-radius: 0;
    }

    :host ::ng-deep .p-menubar .p-menubar-root-list > .p-menuitem > .p-menuitem-link {
      padding: 0.75rem 1rem;
      border-radius: 0.5rem;
      margin: 0 0.25rem;
    }

    :host ::ng-deep .p-menubar .p-menubar-root-list > .p-menuitem > .p-menuitem-link:hover {
      background: #f3f4f6;
    }
  `]
})
export class NavbarComponent implements OnInit, OnDestroy {
  items: MenuItem[] = [];
  currentUser: User | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
        this.updateMenuItems();
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateMenuItems() {
    if (this.currentUser) {
      this.items = [
        {
          label: 'Inicio',
          icon: 'pi pi-home',
          routerLink: ['/dashboard']
        },
        {
          label: 'Mis Recetas',
          icon: 'pi pi-book',
          routerLink: ['/recipes/my']
        },
        {
          label: 'Crear Receta',
          icon: 'pi pi-plus',
          routerLink: ['/recipes/create-ai']
        },
        {
          label: 'Ingredientes',
          icon: 'pi pi-shopping-bag',
          routerLink: ['/ingredients']
        },
        {
          label: 'Categorías',
          icon: 'pi pi-tags',
          routerLink: ['/categories']
        },
        {
          label: 'Comunidad',
          icon: 'pi pi-users',
          routerLink: ['/community']
        }
      ];
    } else {
      this.items = [
        {
          label: 'Inicio',
          icon: 'pi pi-home',
          routerLink: ['/']
        },
        {
          label: 'Comunidad',
          icon: 'pi pi-users',
          routerLink: ['/community']
        }
      ];
    }
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
