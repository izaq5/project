import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductService } from '../../core/services/product.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Product } from '../../core/models/product.model';

@Component({
  selector: 'app-vender',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './vender.html',
  styleUrl: './vender.scss',
})
export class Vender {
  private fb = inject(FormBuilder);
  private productService = inject(ProductService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  submitting = signal(false);
  submitted = signal(false);
  lastProductId = signal<string | null>(null);

  categories = ['Periféricos', 'Áudio', 'Vestuário', 'Wearables', 'Acessórios', 'Computadores', 'Móveis', 'Outros'];

  form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    category: ['Periféricos', Validators.required],
    price: [0, [Validators.required, Validators.min(1)]],
    originalPrice: [0],
    stock: [1, [Validators.required, Validators.min(1)]],
    imageUrl: [''],
    description: ['', [Validators.required, Validators.minLength(20)]],
    exclusive: [false],
    freeShipping: [false],
  });

  field(name: string): boolean {
    const c = this.form.get(name);
    return !!c && c.invalid && c.touched;
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toastService.error('Preencha todos os campos obrigatórios corretamente.');
      return;
    }

    this.submitting.set(true);
    const data = this.form.getRawValue();
    const sellerName = this.authService.currentUser()?.name ?? 'Vendedor Nexus';
    const id = `seller-${Date.now()}`;
    const fallbackImage = `https://picsum.photos/seed/${id}/700/700`;

    const newProduct: Product = {
      id,
      name: data.name,
      category: data.category,
      price: Number(data.price),
      originalPrice: data.originalPrice ? Number(data.originalPrice) : undefined,
      images: [data.imageUrl?.trim() || fallbackImage],
      description: data.description,
      features: ['Produto cadastrado por vendedor parceiro Nexus'],
      specs: [{ label: 'Categoria', value: data.category }],
      rating: 5,
      reviewsCount: 0,
      reviews: [],
      stock: Number(data.stock),
      badge: data.exclusive ? 'exclusivo' : null,
      exclusive: data.exclusive,
      faq: [],
      soldBy: sellerName,
      freeShipping: data.freeShipping,
    };

    setTimeout(() => {
      this.productService.addSellerProduct(newProduct);
      this.lastProductId.set(id);
      this.submitting.set(false);
      this.submitted.set(true);
      this.toastService.success('Produto cadastrado com sucesso na Nexus Store!');
    }, 700);
  }

  goToProduct(): void {
    const id = this.lastProductId();
    if (id) this.router.navigate(['/produtos', id]);
  }

  addAnother(): void {
    this.submitted.set(false);
    this.form.reset({ category: 'Periféricos', price: 0, originalPrice: 0, stock: 1, exclusive: false, freeShipping: false });
  }
}
