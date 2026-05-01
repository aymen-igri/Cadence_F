import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HlmSeparatorImports } from '@spartan-ng/helm/separator';
import { LogoComponent } from "../logo/Logo";

@Component({
  selector: 'app-footer',
  imports: [RouterLink, ...HlmSeparatorImports, LogoComponent],
  templateUrl: './footer.html',
})
export class Footer {
  readonly year = new Date().getFullYear();
}
