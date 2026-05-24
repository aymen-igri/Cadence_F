import { Component, inject, signal , ChangeDetectionStrategy } from '@angular/core';
import { NgIconsModule } from '@ng-icons/core';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmSeparatorImports } from '@spartan-ng/helm/separator';
import { Router, RouterLink } from '@angular/router';
import { LogoComponent } from '@app/components/logo/Logo';
import { form, FormField, required, FormRoot } from '@angular/forms/signals';
import { LoginRequest } from '@app/core/models/auth.model';
import { AuthService } from '@app/core/services/auth.service';
import { MfaService } from '@app/core/services/mfa.service';
import { firstValueFrom } from 'rxjs';
import { toast } from 'ngx-sonner';
import { extractErrorMessage } from '@app/core/utils/error.util';
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-sign-in',
  imports: [
    NgIconsModule,
    ...HlmButtonImports,
    ...HlmInputImports,
    ...HlmLabelImports,
    ...HlmCardImports,
    ...HlmSeparatorImports,
    RouterLink,
    LogoComponent,
    FormField,
    FormRoot,
  ],
  templateUrl: './sign-in.html',
})
export class SignIn {
  loginModel = signal<LoginRequest>({ identifier: '', password: '' });

  showPassword = false;
  private authService = inject(AuthService);
  private mfaService = inject(MfaService);
  private router = inject(Router);

  loginForm = form(
    this.loginModel,
    (schema) => {
      required(schema.identifier, { message: 'Username or Email is required' });
      required(schema.password, { message: 'Password is required' });
    },
    {
      submission: {
        action: async () => {
          const credentials = this.loginModel();
          try {
            const response = await firstValueFrom(this.authService.login(credentials));
            toast.success('Login successful!', {
              description: 'Welcome back!',
            });

            console.log(response);

            if (response.mfaTokens && response.user?.role === 'ROLE_PRE_AUTH') {
              this.mfaService.temporaryMfaToken.set(response.mfaTokens);
              this.router.navigate(['/auth/mfa/type']); // redirection spot for mfa verification
            } else if (response.user?.role === 'ROLE_ADMIN') {
              this.router.navigate(['/admin/dashboard']);
            } else {
              this.router.navigate(['/user/dashboard']);
            }
          } catch (err: any) {
            const message = extractErrorMessage(err);
            toast.error('Login failed', {
              description: message,
            });
            throw err;
          }
        },
      },
    },
  );

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit(event: Event) {
    event.preventDefault();
    if (this.loginForm().invalid()) {
      alert('Please fix the errors in the form before submitting.');
      return;
    }
    const credentials = this.loginModel();
    console.log('Logging in with:', credentials);
  }
}
