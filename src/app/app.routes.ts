import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home/home').then((m) => m.Home), title: 'Nexus Store | Início' },
  { path: 'produtos', loadComponent: () => import('./pages/produtos/produtos').then((m) => m.Produtos), title: 'Nexus Store | Produtos' },
  { path: 'produtos/:id', loadComponent: () => import('./pages/produto-detalhes/produto-detalhes').then((m) => m.ProdutoDetalhes), title: 'Nexus Store | Produto' },
  { path: 'carrinho', loadComponent: () => import('./pages/carrinho/carrinho').then((m) => m.Carrinho), title: 'Nexus Store | Carrinho' },
  { path: 'checkout', loadComponent: () => import('./pages/checkout/checkout').then((m) => m.Checkout), title: 'Nexus Store | Checkout' },
  { path: 'login', loadComponent: () => import('./pages/login/login').then((m) => m.Login), title: 'Nexus Store | Entrar' },
  { path: 'cadastro', loadComponent: () => import('./pages/cadastro/cadastro').then((m) => m.Cadastro), title: 'Nexus Store | Cadastro' },
  { path: 'vender', loadComponent: () => import('./pages/vender/vender').then((m) => m.Vender), title: 'Nexus Store | Anunciar Produto' },
  { path: 'cupons', loadComponent: () => import('./pages/cupons/cupons').then((m) => m.Cupons), title: 'Nexus Store | Cupons' },
  { path: 'suporte', loadComponent: () => import('./pages/suporte/suporte').then((m) => m.Suporte), title: 'Nexus Store | Suporte' },
  { path: 'favoritos', loadComponent: () => import('./pages/favoritos/favoritos').then((m) => m.Favoritos), title: 'Nexus Store | Favoritos' },
  { path: 'perfil', loadComponent: () => import('./pages/perfil/perfil').then((m) => m.Perfil), title: 'Nexus Store | Meu Perfil' },
  { path: 'pedidos', loadComponent: () => import('./pages/pedidos/pedidos').then((m) => m.Pedidos), title: 'Nexus Store | Meus Pedidos' },
  { path: '**', redirectTo: '' },
];
