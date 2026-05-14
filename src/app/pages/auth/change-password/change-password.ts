import { Component, inject, signal, OnInit } from '@angular/core';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { LogoComponent } from '@app/components/logo/Logo';
import { form, FormField, required, FormRoot } from '@angular/forms/signals';
import { AuthService } from '@app/core/services/auth.service';
import { firstValueFrom } from 'rxjs';
import { toast } from 'ngx-sonner';
import { extractErrorMessage } from '@app/core/utils/error.util';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-change-password',
  imports: [
    CommonModule,
    ...HlmButtonImports,
    ...HlmInputImports,
    ...HlmLabelImports,
    ...HlmCardImports,
    ...HlmDialogImports,
    RouterLink,
    LogoComponent,
    FormField,
    FormRoot,
  ],
  templateUrl: './change-password.html',
})
export class ChangePassword implements OnInit {
  passwordModel = signal<{ password: string; confirmPassword: string }>({
    password: '',
    confirmPassword: '',
  });
  showSuccessDialog = signal<boolean>(false);
  showPassword = signal<boolean>(false);
  showConfirmPassword = signal<boolean>(false);
  token: string | null = null;
  isInvalidToken = signal<boolean>(false);

  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  passwordForm = form(
    this.passwordModel,
    (schema) => {
      required(schema.password, { message: 'Password is required' });
      required(schema.confirmPassword, { message: 'Confirm password is required' });
    },
    {
      submission: {
        action: async () => {
          if (!this.token) {
            toast.error('Invalid token', {
              description: 'No token provided',
            });
            return;
          }

          const data = this.passwordModel();

          if (data.password !== data.confirmPassword) {
            toast.error('Passwords do not match', {
              description: 'Please make sure both passwords are identical',
            });
            return;
          }

          try {
            await firstValueFrom(this.authService.resetPassword(this.token, data.password));
            this.showSuccessDialog.set(true);
            this.passwordModel.set({ password: '', confirmPassword: '' });
          } catch (err: any) {
            const message = extractErrorMessage(err);
            toast.error('Password reset failed', {
              description: message,
            });
            throw err;
          }
        },
      },
    },
  );

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.token = params['token'];
      if (!this.token) {
        this.isInvalidToken.set(true);
        toast.error('Invalid or missing token', {
          description: 'The password reset link is invalid or has expired',
        });
      }
    });
  }

  onSubmit(event: Event) {
    event.preventDefault();
    if (this.passwordForm().invalid()) {
      return;
    }
  }

  togglePasswordVisibility() {
    this.showPassword.set(!this.showPassword());
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword.set(!this.showConfirmPassword());
  }

  handleSuccessClose() {
    this.showSuccessDialog.set(false);
    this.router.navigate(['/sign-in']);
  }
}