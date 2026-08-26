# Nexus Store — Loja Premium (Angular + SCSS)

Projeto Angular 20 (standalone components, SCSS, novo control flow `@if/@for/@switch`) implementando a Nexus Store no tema preto & amarelo, 100% funcional em memória (sem backend — dados persistidos no `localStorage` do navegador).

## Como rodar

```bash
npm install
npm start
```

Acesse `http://localhost:4200`.

Para gerar build de produção:

```bash
npm run build
```//gera em dist/nexus-store

## Funcionalidades incluídas

- **Início**: banner, categorias, mais vendidos, ofertas exclusivas Nexus VIP, novidades, banner "Quero Vender".
- **Produtos**: busca (barra do topo), filtros por categoria/preço/exclusivo, ordenação.
- **Página do produto**: galeria de imagens, avaliações, especificações, FAQ, produtos relacionados, favoritar, adicionar ao carrinho.
- **Carrinho**: adicionar/remover/alterar quantidade, cálculo de frete grátis acima de R$ 500.
- **Checkout**: 3 etapas (Entrega → Pagamento → Confirmação), PIX/Cartão/Boleto, cupom de desconto, tela de pedido confirmado com número do pedido.
- **Cupons**: cupons **normais** (qualquer cliente) e **exclusivos** (somente membros Nexus VIP) — `BEMVINDO10`, `PREMIUM15` (normais) e `NEXUSVIP`, `BLACK30` (exclusivos).
- **Login / Cadastro**: autenticação simples via `localStorage`, opção de virar membro **Nexus VIP** no cadastro.
- **Quero Vender**: formulário para o próprio cliente cadastrar um produto, que passa a aparecer na loja.
- **Suporte**: FAQ + formulário de contato.
- **Favoritos** e **Meus Pedidos**: histórico de pedidos e produtos favoritados, por usuário no navegador.
- **Cabeçalho**: busca, carrinho com contador/valor, favoritos, menu do usuário, indicador "X online".

## Estrutura

```
src/app/
  core/
    models/       -> interfaces (Product, Cart, Coupon, User, Order)
    services/      -> ProductService, CartService, CouponService, AuthService,
                       FavoritesService, ToastService, OrderService
  shared/components/
    header, footer, product-card, star-rating, toast-container
  pages/
    home, produtos, produto-detalhes, carrinho, checkout,
    login, cadastro, vender, cupons, suporte, favoritos, perfil, pedidos
```

## Observações

- Os dados dos produtos ficam em `core/services/products-seed.ts` — substitua pelos seus produtos reais e imagens.
- As imagens usam `picsum.photos` como placeholder; troque `images: [...]` de cada produto pelas fotos reais.
- Todo o "backend" (usuários, carrinho, pedidos, favoritos) roda em `localStorage`, então cada usuário funciona isolado no seu navegador. Para produção real, plugue APIs no lugar dos services.
