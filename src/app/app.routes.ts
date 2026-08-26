import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home/home').then((m) => m.Home), title: 'CaputeStore | Início' },
  { path: 'produtos', loadComponent: () => import('./pages/produtos/produtos').then((m) => m.Produtos), title: 'CaputeStore | Eletrônicos & Produtos' },
  { path: 'produtos/:id', loadComponent: () => import('./pages/produto-detalhes/produto-detalhes').then((m) => m.ProdutoDetalhes), title: 'CaputeStore | Detalhes do Produto' },
  { path: 'carrinho', loadComponent: () => import('./pages/carrinho/carrinho').then((m) => m.Carrinho), title: 'CaputeStore | Seu Carrinho' },
  { path: 'checkout', loadComponent: () => import('./pages/checkout/checkout').then((m) => m.Checkout), title: 'CaputeStore | Finalizar Compra' },
  { path: 'login', loadComponent: () => import('./pages/login/login').then((m) => m.Login), title: 'CaputeStore | Entrar' },
  { path: 'cadastro', loadComponent: () => import('./pages/cadastro/cadastro').then((m) => m.Cadastro), title: 'CaputeStore | Criar Conta' },
  { path: 'vip', loadComponent: () => import('./pages/vip/vip').then((m) => m.Vip), title: 'CaputeStore | Área VIP (R$ 20,00)' },
  { path: 'vender', loadComponent: () => import('./pages/vender/vender').then((m) => m.Vender), title: 'CaputeStore | Anunciar Produto' },
  { path: 'cupons', loadComponent: () => import('./pages/cupons/cupons').then((m) => m.Cupons), title: 'CaputeStore | Central de Cupons & Sorteios' },
  { path: 'suporte', loadComponent: () => import('./pages/suporte/suporte').then((m) => m.Suporte), title: 'CaputeStore | Suporte ao Cliente' },
  { path: 'favoritos', loadComponent: () => import('./pages/favoritos/favoritos').then((m) => m.Favoritos), title: 'CaputeStore | Meus Favoritos' },
  { path: 'perfil', loadComponent: () => import('./pages/perfil/perfil').then((m) => m.Perfil), title: 'CaputeStore | Meu Perfil' },
  { path: 'pedidos', loadComponent: () => import('./pages/pedidos/pedidos').then((m) => m.Pedidos), title: 'CaputeStore | Meus Pedidos' },
  { path: '**', redirectTo: '' },
];
