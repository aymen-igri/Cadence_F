import { Component, inject, signal } from '@angular/core';
import { LucideAngularModule, Eye, EyeOff, BookOpen } from 'lucide-angular';
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
import { firstValueFrom } from 'rxjs';
import { toast } from 'ngx-sonner';
@Component({
  selector: 'app-sign-in',
  imports: [
    LucideAngularModule,
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
  readonly Eye = Eye;
  readonly EyeOff = EyeOff;
  readonly BookOpen = BookOpen;

  showPassword = false;
  private authService = inject(AuthService);
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
            await firstValueFrom(this.authService.login(credentials));
            toast.success('Login successful!', {
              description: 'Welcome back!',
            });
            this.router.navigate(['/user/dashboard']);
          } catch (err: any) {
            const message = err?.error?.message ?? 'Something went wrong. Please try again.';
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
