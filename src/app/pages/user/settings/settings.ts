import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { SettingsProfileComponent } from '@app/components/user/settings-profile/settings-profile';
import { SettingsMfaComponent } from '@app/components/user/settings-mfa/settings-mfa';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';
import { SettingsService } from '@app/core/services/settings.service';

@Component({
  selector: 'app-settings',
  imports: [SettingsProfileComponent, SettingsMfaComponent, HlmSkeletonImports],
  templateUrl: './settings.html',
})
export class SettingsComponent {
  public settingsService = inject(SettingsService);
  profile = toSignal(this.settingsService.getUserProfile());
}
