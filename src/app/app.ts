import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HlmToasterImports } from '@spartan-ng/helm/sonner';
import { GlobalAlertComponent } from "./components/shared/alert/alert";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HlmToasterImports, GlobalAlertComponent],
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('Cadence');
}
