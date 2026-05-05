import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NgIconsModule } from '@ng-icons/core';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { MfaMethod } from '@app/core/models/mfa-type.model';
import { MfaService } from '@app/core/services/mfa.service';
import { finalize } from 'rxjs';
import { toast } from 'ngx-sonner';
import { LogoComponent } from '@app/components/logo/Logo';
import { createMutation } from '@app/core/utils/mutation.helper';

@Component({
  selector: 'app-mfa-type',
  standalone: true,
  imports: [NgIconsModule, ...HlmButtonImports, ...HlmCardImports, LogoComponent],
  templateUrl: './mfa-type.html',
})
export class MfaType {
  private mfaService = inject(MfaService);
  private router = inject(Router);

  readonly triggerEmailCodeMutation = createMutation({
    mutationFn: () => this.mfaService.triggerEmailCode(),
    onSuccess: () => {
      this.router.navigate(['/auth/mfa/verify']);
      toast.success('Verification code sent to your email.');
    },
    onError: (error) => {
      toast.error('Could not send email.', { description: error });
    },
  });

  selectMethod(event: Event, method: MfaMethod) {
    event.stopPropagation();
    this.mfaService.selectedMethod.set(method);
    if (method === 'EMAIL') {
      this.triggerEmailCodeMutation.mutate({});
    } else if (method === 'AUTHENTICATOR') {
      this.router.navigate(['/auth/mfa/verify']);
    }
  }
}
