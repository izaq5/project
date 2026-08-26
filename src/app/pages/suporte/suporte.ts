import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-suporte',
  imports: [ReactiveFormsModule],
  templateUrl: './suporte.html',
  styleUrl: './suporte.scss',
})
export class Suporte {
  private fb = inject(FormBuilder);
  private toastService = inject(ToastService);

  sending = signal(false);
  sent = signal(false);

  faqs = [
    { q: 'Qual o prazo de entrega dos pedidos?', a: 'A entrega padrão leva de 5 a 10 dias úteis, e a entrega expressa de 2 a 4 dias úteis, dependendo da sua região.' },
    { q: 'Como funciona a troca ou devolução?', a: 'Você tem até 7 dias corridos após o recebimento do produto para solicitar troca ou devolução gratuita através da sua conta.' },
    { q: 'Quais formas de pagamento vocês aceitam?', a: 'Aceitamos PIX (aprovação imediata), cartão de crédito em até 12x sem juros e boleto bancário.' },
    { q: 'Como faço para vender meus produtos na Nexus Store?', a: 'Basta clicar em "Quero Vender", preencher os dados do seu produto e ele ficará disponível na loja para todos os clientes.' },
    { q: 'Como funcionam os cupons exclusivos Nexus VIP?', a: 'Ao se cadastrar marcando a opção Nexus VIP, você desbloqueia cupons e produtos exclusivos com descontos maiores.' },
    { q: 'O frete é grátis?', a: 'Compras acima de R$ 500,00 têm frete grátis automaticamente. Alguns produtos também oferecem frete grátis individualmente.' },
  ];

  form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    subject: ['', Validators.required],
    message: ['', Validators.required],
  });

  field(name: string): boolean {
    const c = this.form.get(name);
    return !!c && c.invalid && c.touched;
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.sending.set(true);
    setTimeout(() => {
      this.sending.set(false);
      this.sent.set(true);
      this.toastService.success('Mensagem enviada! Nossa equipe responderá em breve.');
      this.form.reset();
    }, 700);
  }
}
