import { Component, inject, input, signal, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmInputOtpImports } from '@spartan-ng/helm/input-otp';
import { BrnInputOtpImports } from '@spartan-ng/brain/input-otp';
import { LucideAngularModule, Mail, Smartphone } from 'lucide-angular';
import { MfaSetupModalComponent } from '../mfa-setup-modal/mfa-setup-modal';
import { MfaService } from '@app/core/services/mfa.service';
import { finalize } from 'rxjs';
import { toast } from 'ngx-sonner';
import { NgIcon } from "@ng-icons/core";

@Component({
  selector: 'app-settings-mfa',
  imports: [
    CommonModule,
    FormsModule,
    ...HlmButtonImports,
    ...HlmCardImports,
    ...HlmBadgeImports,
    ...HlmDialogImports,
    ...HlmInputOtpImports,
    ...BrnInputOtpImports,
    LucideAngularModule,
    MfaSetupModalComponent,
    NgIcon
],
  templateUrl: './settings-mfa.html',
})
export class SettingsMfaComponent {
  private mfaService = inject(MfaService);
  user = input.required<any>();

  readonly Mail = Mail;
  readonly Smartphone = Smartphone;

  isDialogOpen = signal<boolean>(false);
  selectedMethodId = signal<string | null>(null);
  dialogStep = signal<'setup' | 'verify'>('setup');
  otpValue = signal('');
  isVerifying = signal(false);

  get mfaMethods() {
    const user = this.user();
    return [
      {
        id: 'EMAIL',
        name: 'Email Verification',
        description: 'Receive verification codes via email.',
        icon: this.Mail,
        active: true,
      },
      {
        id: 'AUTHENTICATOR',
        name: 'Authenticator App',
        description: 'Use an authenticator app (Google Authenticator, Authy, etc.).',
        icon: this.Smartphone,
        active: !!user?.isTotpEnabled,
      },
    ];
  }

  setupMethod(methodId: string) {
    this.selectedMethodId.set(methodId);
    this.dialogStep.set('setup');
    this.otpValue.set('');
    this.isDialogOpen.set(true);
  }

  closeModal() {
    this.isDialogOpen.set(false);
    this.selectedMethodId.set(null);
    this.dialogStep.set('setup');
    this.otpValue.set('');
  }

  onModalConfirmed() {
    this.dialogStep.set('verify');
  }

  backToSetup() {
    this.dialogStep.set('setup');
  }

  onOtpComplete(code: string) {
    this.otpValue.set(code);
    if (code.length === 6) {
      this.verifyOtp();
    }
  }

  verifyOtp() {
    const code = this.otpValue();
    if (!code || code.length < 6) {
      toast.error('Please enter the full 6-digit OTP code');
      return;
    }
    
    this.isVerifying.set(true);
    this.mfaService.confirmSetup(code)
      .pipe(finalize(() => this.isVerifying.set(false)))
      .subscribe({
        next: () => {
          toast.success('MFA setup confirmed successfully');
          this.closeModal();
          // Optionally refresh the methods list here
        },
        error: (err) => {
          toast.error('Invalid code', {
            description: err.error?.message || 'Please check your authenticator app and try again.'
          });
          this.otpValue.set('');
        }
      });
  }
}
