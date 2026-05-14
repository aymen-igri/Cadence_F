import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { Location } from '@angular/common';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink, ...HlmButtonImports],
  templateUrl: './not-found.html',
})
export class NotFound {
  private location = inject(Location);

  goBack() {
    this.location.back();
  }
}
