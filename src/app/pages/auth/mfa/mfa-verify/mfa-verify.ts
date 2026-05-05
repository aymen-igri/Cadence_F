import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgIconsModule } from '@ng-icons/core';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { MfaService } from '@app/core/services/mfa.service';
import { toast } from 'ngx-sonner';
import { finalize } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HlmInputOtpImports } from '@spartan-ng/helm/input-otp';
import { BrnInputOtpImports } from '@spartan-ng/brain/input-otp';

@Component({
  selector: 'app-mfa-verify',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgIconsModule,
    RouterLink,
    ...HlmButtonImports,
    ...HlmCardImports,
    ...HlmInputOtpImports,
    ...BrnInputOtpImports,
  ],
  templateUrl: './mfa-verify.html',
})
export class MfaVerify {
  private mfaService = inject(MfaService);
  private router = inject(Router);

  isLoading = signal(false);
  otpValue = signal('');
  selectedMethod = this.mfaService.selectedMethod;

  onOtpComplete(code: string) {
    this.otpValue.set(code);
    if (code.length === 6) {
      this.verify(code);
    }
  }

  verify(code: string) {
    if (code.length < 6) return;
    this.isLoading.set(true);
    this.mfaService
      .verifyOtp(code)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => {
          toast.success('OTP verified successfully');
          this.router.navigate(['/user/dashboard']);
        },
        error: (err) => {
          toast.error('Verification failed', { description: err.error?.message });
          this.otpValue.set('');
        },
      });
  }

  public get instructionMessage(): string {
    return this.selectedMethod() === 'EMAIL'
      ? 'Enter the 6-digit code sent to your email.'
      : 'Enter the 6-digit code from your Authenticator app.';
  }
}
