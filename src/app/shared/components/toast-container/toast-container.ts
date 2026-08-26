import { Component, inject } from '@angular/core';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  imports: [],
  templateUrl: './toast-container.html',
  styleUrl: './toast-container.scss',
})
export class ToastContainer {
  toastService = inject(ToastService);

  dismiss(id: number): void {
    this.toastService.dismiss(id);
  }

  icon(type: string): string {
    switch (type) {
      case 'success': return '✓';
      case 'error': return '✕';
      default: return 'i';
    }
  }
}
