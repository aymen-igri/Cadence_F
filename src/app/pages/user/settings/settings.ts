import { Component, inject } from '@angular/core';
import { SettingsProfileComponent } from '@app/components/user/settings-profile/settings-profile';
import { SettingsMfaComponent } from '@app/components/user/settings-mfa/settings-mfa';
import { AuthService } from '@app/core/services/auth.service';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';

@Component({
  selector: 'app-settings',
  imports: [SettingsProfileComponent, SettingsMfaComponent, HlmSkeletonImports],
  templateUrl: './settings.html',
})
export class SettingsComponent {
  public authService = inject(AuthService);
  user = this.authService.currentUser;
}
