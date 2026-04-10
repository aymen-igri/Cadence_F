import { Injectable, signal } from "@angular/core";

export interface AlertConfig {
  description: string;
  actionLabel?: string;
  variant?: 'default' | 'destructive';
  action?: () => void;
}

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  private _alert = signal<AlertConfig | null>(null);
  alert = this._alert.asReadonly();

  show(config: AlertConfig) {
    this._alert.set(config);
  }

  close() {
    this._alert.set(null);
  }

  triggerAction() {
    const current = this._alert();
    current?.action?.();
    this.close();
  }
}