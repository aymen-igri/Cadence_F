import { Component } from '@angular/core';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { LucideAngularModule, Mail, Smartphone } from 'lucide-angular';

@Component({
  selector: 'app-settings-mfa',
  imports: [...HlmButtonImports, ...HlmCardImports, ...HlmBadgeImports, LucideAngularModule],
  templateUrl: './settings-mfa.html',
})
export class SettingsMfaComponent {
  readonly Mail = Mail;
  readonly Smartphone = Smartphone;

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
    console.log('Setup MFA method:', methodId);
    // To be implemented
  }
}
