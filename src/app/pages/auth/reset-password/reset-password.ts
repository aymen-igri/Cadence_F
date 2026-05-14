import { Component, inject, signal } from '@angular/core';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { Router, RouterLink } from '@angular/router';
import { LogoComponent } from '@app/components/logo/Logo';
import { form, FormField, required, FormRoot } from '@angular/forms/signals';
import { AuthService } from '@app/core/services/auth.service';
import { firstValueFrom } from 'rxjs';
import { toast } from 'ngx-sonner';
import { extractErrorMessage } from '@app/core/utils/error.util';

@Component({
  selector: 'app-reset-password',
  imports: [
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
  templateUrl: './reset-password.html',
})
export class ResetPassword {
  resetModel = signal<{ identifier: string }>({ identifier: '' });
  showSuccessDialog = signal<boolean>(false);
  private authService = inject(AuthService);
  private router = inject(Router);

  resetForm = form(
    this.resetModel,
    (schema) => {
      required(schema.identifier, { message: 'Email or username is required' });
    },
    {
      submission: {
        action: async () => {
          const data = this.resetModel();
          try {
            await firstValueFrom(this.authService.forgetPassword(data.identifier));
            // Show success modal regardless of whether email exists (security best practice)
            this.showSuccessDialog.set(true);
            // Reset the form
            this.resetModel.set({ identifier: '' });
          } catch (err: any) {
            const message = extractErrorMessage(err);
            toast.error('Request failed', {
              description: message,
            });
            throw err;
          }
        },
      },
    },
  );

  onSubmit(event: Event) {
    event.preventDefault();
    if (this.resetForm().invalid()) {
      return;
    }
  }

  handleSuccessClose() {
    this.showSuccessDialog.set(false);
    this.router.navigate(['/sign-in']);
  }
}