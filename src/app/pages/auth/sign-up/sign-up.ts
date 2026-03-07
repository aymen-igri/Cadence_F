import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Eye, EyeOff } from 'lucide-angular';
import { HlmButtonImports } from '../../../../components/ui/button/src';
import { HlmInputImports } from '../../../../components/ui/input/src';
import { HlmLabelImports } from '../../../../components/ui/label/src';
import { HlmCardImports } from '../../../../components/ui/card/src';
import { LogoComponent } from '../../../components/logo/Logo';

@Component({
  selector: 'app-sign-up',
  imports: [
    RouterLink,
    LucideAngularModule,
    ...HlmButtonImports,
    ...HlmInputImports,
    ...HlmLabelImports,
    ...HlmCardImports,
    LogoComponent,
  ],
  templateUrl: './sign-up.html',
})
export class SignUp {
  readonly Eye = Eye;
  readonly EyeOff = EyeOff;

  showPassword = false;

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
}
