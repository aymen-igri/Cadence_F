import { Component } from '@angular/core';
import { AppSidebar } from './app-sidebar';
import { HlmSidebarImports } from '@spartan-ng/helm/sidebar';
import { RouterOutlet } from '@angular/router';

@Component({
  imports: [AppSidebar, HlmSidebarImports, RouterOutlet],
  selector: 'app-side-bar-layout',
  template: `<app-sidebar>
    <main hlmSidebarInset>
      <header class="flex h-12 items-center px-4 border-b border-border">
        <button hlmSidebarTrigger><span class="sr-only">Toggle Sidebar</span></button>
      </header>
      <div class="p-6">
        <router-outlet />
      </div>
    </main>
  </app-sidebar>`,
})
export class SideBarLayout {}
