import { Component, input, output, signal, inject, OnInit, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { QRCodeComponent } from 'angularx-qrcode';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { CommonModule } from '@angular/common';
import { MfaService } from '@app/core/services/mfa.service';
import { MfaApp } from '@app/core/models/mfa-app.model';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-mfa-setup-modal',
  standalone: true,
  imports: [
    CommonModule,
    QRCodeComponent,
    ...HlmButtonImports,
    ...HlmInputImports,
    ...HlmLabelImports
  ],
  template: `
    <div class="space-y-6">
      <!-- QR Code -->
      <div class="flex justify-center">
        <div class="bg-white p-4 rounded-lg border">
          @if (qrCodeData()) {
            <qrcode 
              [qrdata]="qrCodeData()" 
              [width]="200" 
              [errorCorrectionLevel]="'M'"
              [elementType]="'canvas'">
            </qrcode>
          } @else {
            <div class="w-48 h-48 bg-muted animate-pulse rounded flex items-center justify-center">
              <p class="text-xs text-muted-foreground">Generating QR...</p>
            </div>
          }
        </div>
      </div>

      <!-- Secret Key -->
      <div class="space-y-2">
        <label hlmLabel>Secret Key</label>
        <div class="flex gap-2">
          <input
            hlmInput
            [value]="secretKey()"
            [readonly]="true"
            class="flex-1 font-mono text-xs"
          />
          <button hlmBtn variant="outline" size="sm" (click)="copySecret()">
            Copy
          </button>
        </div>
        <p class="text-xs text-muted-foreground">
          Save this key in a secure location as a backup.
        </p>
      </div>
    </div>
  `,
})
export class MfaSetupModalComponent implements OnInit {
  private mfaService = inject(MfaService);
  private destroyRef = inject(DestroyRef);

  methodId = input.required<string>();
  closed = output<void>();
  confirmed = output<void>();

  qrCodeData = signal<string>('');
  secretKey = signal<string>('');

  ngOnInit() {
    this.generateQrCode();
  }

  generateQrCode() {
    this.mfaService
      .generateAppSecret()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: MfaApp) => {
          this.secretKey.set(response.secret);
          this.qrCodeData.set(response.qrUrl);
        },
        error: () => {
          toast.error('Failed to generate MFA secret');
        }
      });
  }

  copySecret() {
    navigator.clipboard.writeText(this.secretKey());
    toast.success('Secret key copied to clipboard');
  }

  onCancel() {
    this.closed.emit();
  }

  onConfirm() {
    this.confirmed.emit();
  }
}
