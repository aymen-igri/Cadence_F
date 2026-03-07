import { Component } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { LucideAngularModule, Eye, EyeOff, BookOpen } from 'lucide-angular';
import { HlmButtonImports } from '../../../components/ui/button/src';
import { HlmInputImports } from '../../../components/ui/input/src';
import { HlmLabelImports } from '../../../components/ui/label/src';
import { HlmCardImports } from '../../../components/ui/card/src';
import { HlmSeparatorImports } from '../../../components/ui/separator/src';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-sign-in',
  imports: [
    NgOptimizedImage,
    LucideAngularModule,
    ...HlmButtonImports,
    ...HlmInputImports,
    ...HlmLabelImports,
    ...HlmCardImports,
    ...HlmSeparatorImports,
    RouterLink
],
  templateUrl: './sign-in.html',
})
export class SignIn {
  readonly Eye = Eye;
  readonly EyeOff = EyeOff;
  readonly BookOpen = BookOpen;

  showPassword = false;

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
}
