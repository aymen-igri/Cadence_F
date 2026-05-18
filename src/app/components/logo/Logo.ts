import { Component, Input , ChangeDetectionStrategy } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-logo',
  imports: [NgOptimizedImage],
  template: `
    <img
      ngSrc="LogoDark.webp"
      alt="Cadence"
      [class]="'w-auto ' + sizeClass"
      [width]="width"
      [height]="height"
      priority
    />
  `,
})
export class LogoComponent {
  @Input() size: 'sm' | 'md' | 'lg' = 'md';

  get sizeClass() {
    return { sm: 'h-6', md: 'h-7', lg: 'h-10' }[this.size];
  }

  get width() {
    return { sm: 85, md: 113, lg: 141 }[this.size];
  }

  get height() {
    return { sm: 24, md: 32, lg: 40 }[this.size];
  }
}
