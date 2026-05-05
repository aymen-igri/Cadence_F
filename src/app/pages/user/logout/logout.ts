import { Component, inject } from '@angular/core';
import { AuthService } from '@app/core/services/auth.service';
import { HlmAlertImports } from '@spartan-ng/helm/alert';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { NgIconsModule } from '@ng-icons/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-logout',
  imports: [HlmAlertImports, HlmButtonImports, NgIconsModule],
  templateUrl: './logout.html',
})
export class LogoutComponent {
  private authService = inject(AuthService);
  private location = inject(Location);

  confirmLogout() {
    this.authService.logout();
  }

  cancel() {
    this.location.back();
  }
}
