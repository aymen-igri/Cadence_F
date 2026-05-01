import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HlmButtonImports } from '@spartan-ng/helm/button';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink, ...HlmButtonImports],
  templateUrl: './not-found.html',
})
export class NotFound {}
