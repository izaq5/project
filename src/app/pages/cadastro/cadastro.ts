import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { VipOfferModal } from '../../shared/components/vip-offer-modal/vip-offer-modal';

function passwordsMatch(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirm = control.get('confirmPassword')?.value;
  return password && confirm && password !== confirm ? { mismatch: true } : null;
}

@Component({
  selector: 'app-cadastro',
  imports: [RouterLink, ReactiveFormsModule, VipOfferModal],
  templateUrl: './cadastro.html',
  styleUrl: './cadastro.scss',
})
export class Cadastro {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  submitting = signal(false);
  errorMessage = signal<string | null>(null);
  showVipOffer = signal(false);

  form = this.fb.nonNullable.group(
    {
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      exclusiveMember: [false],
      terms: [false, Validators.requiredTrue],
    },
    { validators: passwordsMatch }
  );

  field(name: string): boolean {
    const c = this.form.get(name);
    return !!c && c.invalid && c.touched;
  }

  onVipCheckboxClick(event: Event): void {
    event.preventDefault();
    const current = this.form.get('exclusiveMember')?.value;
    if (!current) {
      this.showVipOffer.set(true);
    } else {
      this.form.patchValue({ exclusiveMember: false });
    }
  }

  confirmVipOffer(): void {
    this.form.patchValue({ exclusiveMember: true });
    this.showVipOffer.set(false);
    this.toastService.success('Show! Você marcou para ser membro Nexus VIP. 🎉');
  }

  declineVipOffer(): void {
    this.showVipOffer.set(false);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);

    setTimeout(() => {
      const { name, email, phone, password, exclusiveMember } = this.form.getRawValue();
      const result = this.authService.register({ name, email, phone, password, exclusiveMember });
      this.submitting.set(false);

      if (result.success) {
        this.toastService.success(result.message);
        this.router.navigate(['/']);
      } else {
        this.errorMessage.set(result.message);
      }
    }, 500);
  }
}
