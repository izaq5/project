import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-login',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  submitting = signal(false);
  errorMessage = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  field(name: 'email' | 'password'): boolean {
    const c = this.form.get(name);
    return !!c && c.invalid && c.touched;
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);

    setTimeout(() => {
      const { email, password } = this.form.getRawValue();
      const result = this.authService.login(email, password);
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
