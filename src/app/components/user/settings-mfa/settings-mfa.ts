import { Component, signal } from '@angular/core';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { LucideAngularModule, Mail, Smartphone } from 'lucide-angular';
import { MfaSetupModalComponent } from '../mfa-setup-modal/mfa-setup-modal';

@Component({
  selector: 'app-settings-mfa',
  imports: [
    ...HlmButtonImports,
    ...HlmCardImports,
    ...HlmBadgeImports,
    ...HlmDialogImports,
    LucideAngularModule,
    MfaSetupModalComponent,
  ],
  templateUrl: './settings-mfa.html',
})
export class SettingsMfaComponent {
  readonly Mail = Mail;
  readonly Smartphone = Smartphone;

  isDialogOpen = signal<boolean>(false);
  selectedMethodId = signal<string | null>(null);

  mfaMethods = [
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
      active: false,
    },
  ];

  setupMethod(methodId: string) {
    this.selectedMethodId.set(methodId);
    this.isDialogOpen.set(true);
  }

  closeModal() {
    this.isDialogOpen.set(false);
    this.selectedMethodId.set(null);
  }

  onModalConfirmed() {
    console.log('MFA setup confirmed for:', this.selectedMethodId());
    this.closeModal();
  }
}
