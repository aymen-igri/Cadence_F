import { Component } from '@angular/core';
import { NgIconsModule } from '@ng-icons/core';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';

@Component({
  selector: 'app-settings-mfa',
  imports: [...HlmButtonImports, ...HlmCardImports, ...HlmBadgeImports, NgIconsModule],
  templateUrl: './settings-mfa.html',
})
export class SettingsMfaComponent {
  mfaMethods = [
    {
      id: 'EMAIL',
      name: 'Email Verification',
      description: 'Receive verification codes via email.',
      icon: 'mail',
      active: true,
    },
    {
      id: 'AUTHENTICATOR',
      name: 'Authenticator App',
      description: 'Use an authenticator app (Google Authenticator, Authy, etc.).',
      icon: 'smartphone',
      active: false,
    },
  ];

  setupMethod(methodId: string) {
    console.log('Setup MFA method:', methodId);
    // To be implemented
  }
}
