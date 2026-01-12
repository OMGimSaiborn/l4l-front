import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  // Rutas públicas
  {
    path: '',
    loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'community',
    loadComponent: () => import('./components/community/community.component').then(m => m.CommunityComponent)
  },

  // Rutas de autenticación
  {
    path: 'auth/login',
    loadComponent: () => import('./components/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'auth/signup',
    loadComponent: () => import('./components/auth/signup/signup.component').then(m => m.SignupComponent)
  },

  // Rutas protegidas
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'ingredients',
    loadComponent: () => import('./components/ingredients/ingredients.component').then(m => m.IngredientsComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'recipes/create-ai',
    loadComponent: () => import('./components/recipes/create-ai/create-ai.component').then(m => m.CreateAiComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'recipes/create',
    redirectTo: 'recipes/create-ai'
  },
  {
    path: 'recipes/my',
    loadComponent: () => import('./components/recipes/my-recipes/my-recipes.component').then(m => m.MyRecipesComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'recipes/:id',
    loadComponent: () => import('./components/recipes/recipe-detail/recipe-detail.component').then(m => m.RecipeDetailComponent)
  },
  {
    path: 'recipes/:id/edit',
    loadComponent: () => import('./components/recipes/edit/edit.component').then(m => m.EditRecipeComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'categories',
    loadComponent: () => import('./components/categories/categories.component').then(m => m.CategoriesComponent),
    canActivate: [AuthGuard]
  },

  // Ruta wildcard
  {
    path: '**',
    redirectTo: ''
  }
];
