import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../core/services/order.service';

@Component({
  selector: 'app-pedidos',
  imports: [RouterLink],
  templateUrl: './pedidos.html',
  styleUrl: './pedidos.scss',
})
export class Pedidos {
  orderService = inject(OrderService);

  statusLabel(status: string): string {
    switch (status) {
      case 'processando': return 'Processando';
      case 'enviado': return 'Enviado';
      case 'entregue': return 'Entregue';
      default: return status;
    }
  }

  formatDate(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
}
