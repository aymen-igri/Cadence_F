import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule, Eye, EyeOff } from 'lucide-angular';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { LogoComponent } from '@app/components/logo/Logo';
import { form, required, email, FormRoot, FormField } from '@angular/forms/signals';
import { RegisterRequest } from '@app/core/models/auth.model';
import { AuthService } from '@app/core/services/auth.service';
import { toast } from 'ngx-sonner';
import { firstValueFrom } from 'rxjs';
import { extractErrorMessage } from '@app/core/utils/error.util';

@Component({
  selector: 'app-sign-up',
  imports: [
    RouterLink,
    LucideAngularModule,
    ...HlmButtonImports,
    ...HlmInputImports,
    ...HlmLabelImports,
    ...HlmCardImports,
    LogoComponent,
    FormRoot,
    FormField,
  ],
  templateUrl: './sign-up.html',
})
export class SignUp {
  readonly singupModel = signal<RegisterRequest>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    gender: 'MALE',
    username: '',
  });
  readonly Eye = Eye;
  readonly EyeOff = EyeOff;
  private authService = inject(AuthService);
  private router = inject(Router);

  showPassword = false;
  SignUpForm = form(
    this.singupModel,
    (schema) => {
      required(schema.firstName, { message: 'First Name is required' });
      required(schema.lastName, { message: 'Last Name is required' });
      required(schema.username, { message: 'Username is required' });
      required(schema.email, { message: 'Email is required' });
      email(schema.email, { message: 'Please enter a valid email address' });
      required(schema.password, { message: 'Password is required' });
      required(schema.phone, { message: 'Phone is required' });
      required(schema.gender, { message: 'Gender is required' });
    },
    {
      submission: {
        action: async () => {
          const credentials = this.singupModel();

          try {
            await firstValueFrom(this.authService.register(credentials));

            toast.success('Account created!', {
              description: 'Welcome aboard!',
            });
            this.router.navigate(['/user/dashboard']);
          } catch (err: any) {
            const message = extractErrorMessage(err);
            toast.error('Registration failed', {
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
}
