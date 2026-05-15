import { Component, inject, input, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmInputOtpImports } from '@spartan-ng/helm/input-otp';
import { BrnInputOtpImports } from '@spartan-ng/brain/input-otp';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { LucideAngularModule, Lock, Mail, Smartphone, Check, X } from 'lucide-angular';
import { MfaService } from '@app/core/services/mfa.service';
import { AuthService } from '@app/core/services/auth.service';
import { finalize } from 'rxjs';
import { toast } from 'ngx-sonner';
import { User } from '@app/core/models/user.model';

@Component({
  selector: 'app-settings-change-password',
  imports: [
    CommonModule,
    FormsModule,
    ...HlmButtonImports,
    ...HlmCardImports,
    ...HlmBadgeImports,
    ...HlmDialogImports,
    ...HlmInputOtpImports,
    ...BrnInputOtpImports,
    ...HlmInputImports,
    ...HlmLabelImports,
    LucideAngularModule,
  ],
  templateUrl: './settings-change-password.html',
})
export class SettingsChangePasswordComponent {
  private mfaService = inject(MfaService);
  private authService = inject(AuthService);
  user = input.required<User>();

  readonly Lock = Lock;
  readonly Mail = Mail;
  readonly Smartphone = Smartphone;
  readonly Check = Check;
  readonly X = X;

  state = signal<'closed' | 'open'>('closed');
  dialogStateChange = output<'closed' | 'open'>();
  
  // Flow states: 'mfa-selection' -> 'otp-verification' (if EMAIL) -> 'password-form' -> done
  currentStep = signal<'closed' | 'mfa-selection' | 'otp-verification' | 'password-form'>('closed');
  selectedMfaMethod = signal<'EMAIL' | 'APP' | null>(null);
  otpValue = signal('');
  oldPassword = signal('');
  newPassword = signal('');
  confirmPassword = signal('');
  showPassword = signal(false);
  showNewPassword = signal(false);
  showConfirmPassword = signal(false);
  
  isLoading = signal(false);
  isSendingOtp = signal(false);
  isVerifyingOtp = signal(false);

  // Real-time password validation
  passwordsMatch = computed(() => {
    const newPwd = this.newPassword();
    const confirmPwd = this.confirmPassword();
    return newPwd.length > 0 && confirmPwd.length > 0 && newPwd === confirmPwd;
  });

  passwordMismatch = computed(() => {
    const newPwd = this.newPassword();
    const confirmPwd = this.confirmPassword();
    return confirmPwd.length > 0 && newPwd !== confirmPwd;
  });

  allPasswordsValid = computed(() => {
    return this.oldPassword().length > 0 && 
           this.newPassword().length > 0 && 
           this.passwordsMatch();
  });

  openChangePasswordDialog() {
    if (this.user().isTotpEnabled) {
      // MFA is enabled, show method selection
      this.currentStep.set('mfa-selection');
    } else {
      // MFA is not enabled, go directly to password form
      this.currentStep.set('password-form');
    }
    this.dialogStateChange.emit('open');
  }

  selectMfaMethod(method: 'EMAIL' | 'APP') {
    this.selectedMfaMethod.set(method);
    
    if (method === 'EMAIL') {
      // Send OTP to email
      this.sendEmailOtp();
    } else {
      // Go directly to OTP verification for APP
      this.currentStep.set('otp-verification');
    }
  }

  sendEmailOtp() {
    this.isSendingOtp.set(true);
    this.mfaService
      .triggerEmailCodeForPasswordChange()
      .pipe(finalize(() => this.isSendingOtp.set(false)))
      .subscribe({
        next: () => {
          toast.success('OTP sent to email', {
            description: 'Check your email for the verification code.',
          });
          this.currentStep.set('otp-verification');
        },
        error: (err) => {
          toast.error('Failed to send OTP', {
            description: err.error?.message || 'An error occurred.',
          });
        },
      });
  }

  onOtpComplete(code: string) {
    this.otpValue.set(code);
  }

  verifyOtpAndContinue() {
    const code = this.otpValue();
    if (!code || code.length < 6) {
      toast.error('Invalid code', {
        description: 'Please enter the complete 6-digit code.',
      });
      return;
    }

    this.isVerifyingOtp.set(true);
    // We'll verify the OTP with the password change request
    this.currentStep.set('password-form');
    this.isVerifyingOtp.set(false);
  }

  submitPasswordChange() {
    // Validate passwords
    if (!this.oldPassword()) {
      toast.error('Old password required');
      return;
    }
    if (!this.newPassword()) {
      toast.error('New password required');
      return;
    }
    if (this.newPassword() !== this.confirmPassword()) {
      toast.error('Passwords do not match', {
        description: 'Make sure your new password and confirm password are the same.',
      });
      return;
    }

    this.isLoading.set(true);
    
    const payload: any = {
      oldPassword: this.oldPassword(),
      newPassword: this.newPassword(),
    };

    // Add MFA fields if MFA is enabled
    if (this.user().isTotpEnabled) {
      payload.code = this.otpValue();
      payload.type = this.selectedMfaMethod();
    }

    this.authService
      .updatePassword(payload)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => {
          toast.success('Password changed successfully', {
            description: 'Your password has been updated.',
          });
          this.closeDialog();
        },
        error: (err) => {
          toast.error('Failed to change password', {
            description: err.error?.message || 'An error occurred.',
          });
        },
      });
  }

  closeDialog() {
    this.currentStep.set('closed');
    this.selectedMfaMethod.set(null);
    this.otpValue.set('');
    this.oldPassword.set('');
    this.newPassword.set('');
    this.confirmPassword.set('');
    this.showPassword.set(false);
    this.showNewPassword.set(false);
    this.showConfirmPassword.set(false);
    this.dialogStateChange.emit('closed');
  }

  backToMfaSelection() {
    this.currentStep.set('mfa-selection');
    this.selectedMfaMethod.set(null);
    this.otpValue.set('');
  }

  backToOtpVerification() {
    this.currentStep.set('otp-verification');
  }
}
