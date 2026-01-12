import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Rutas que se pueden prerenderizar (no contienen parámetros dinámicos)
  {
    path: '',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'community',
    renderMode: RenderMode.Prerender,
  },
  // Todas las demás rutas (incluidas las que tienen parámetros) se renderizan con SSR
  {
    path: '**',
    renderMode: RenderMode.Server,
  },
];
