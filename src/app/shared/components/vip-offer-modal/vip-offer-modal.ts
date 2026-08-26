import { Component, output } from '@angular/core';

@Component({
  selector: 'app-vip-offer-modal',
  imports: [],
  templateUrl: './vip-offer-modal.html',
  styleUrl: './vip-offer-modal.scss',
})
export class VipOfferModal {
  confirm = output<void>();
  cancel = output<void>();

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
