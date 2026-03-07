import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { HlmSeparatorImports } from '../../../components/ui/separator/src';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, NgOptimizedImage, ...HlmSeparatorImports],
  templateUrl: './footer.html',
})
export class Footer {
  readonly year = new Date().getFullYear();
}
