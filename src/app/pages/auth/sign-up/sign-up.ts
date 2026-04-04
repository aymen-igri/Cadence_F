import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
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
        action: () => {
          const credentials = this.singupModel();

          return new Promise((resolve, reject) => {
            this.authService.register(credentials).subscribe({
              next: () => {
                toast.success('Account created!', {
                  description: 'Welcome aboard 🎉',
                });
                resolve();
              },
              error: (err) => {
                const message = err?.error?.message ?? 'Something went wrong. Please try again.';
                toast.error('Registration failed', {
                  description: message,
                });
                reject();
              },
            });
          });
        },
      },
    },
  );

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
}
