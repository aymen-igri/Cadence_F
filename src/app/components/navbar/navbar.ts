import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { HlmButtonImports } from '../../../components/ui/button/src';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, NgOptimizedImage, ...HlmButtonImports],
  templateUrl: './navbar.html',
})
export class Navbar {}
