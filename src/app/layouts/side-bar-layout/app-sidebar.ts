import { Component } from '@angular/core';
import { HlmSidebarImports } from '@spartan-ng/helm/sidebar';
import {
  lucideBookOpen,
  lucideCalendar,
  lucideHouse,
  lucideInbox,
  lucideSearch,
  lucideSettings,
} from '@ng-icons/lucide';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { HlmIcon } from '@spartan-ng/helm/icon';
import { LogoComponent } from "../../components/logo/Logo";
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [HlmSidebarImports, NgIcon, HlmIcon, LogoComponent, RouterLink],
  template: `
    <div hlmSidebarWrapper>
      <hlm-sidebar>
        <div hlmSidebarContent>
          <div hlmSidebarGroup>
            <div hlmSidebarGroupLabel>
              <app-logo class="mt-2" />
            </div>
            <div hlmSidebarGroupContent class="mt-6">
              <ul hlmSidebarMenu>
                @for (item of _items; track item.title) {
                  <li hlmSidebarMenuItem>
                    <a hlmSidebarMenuButton [routerLink]="item.url">
                      <ng-icon hlm [name]="item.icon" />
                      <span>{{ item.title }}</span>
                    </a>
                  </li>
                }
              </ul>
            </div>
          </div>
        </div>
      </hlm-sidebar>
      <ng-content />
    </div>
  `,
  providers: [
    provideIcons({
      lucideHouse,
      lucideInbox,
      lucideCalendar,
      lucideSearch,
      lucideSettings,
      lucideBookOpen,
    }),
  ],
})
export class AppSidebar {
  protected readonly _items = [
    {
      title: 'Home',
      url: 'dashboard',
      icon: 'lucideHouse',
    },
    {
      title: 'Inbox',
      url: 'inbox',
      icon: 'lucideInbox',
    },
    {
      title: 'Subjects',
      url: 'subjects',
      icon: 'lucideBookOpen',
    },
    {
      title: 'Search',
      url: 'search',
      icon: 'lucideSearch',
    },
    {
      title: 'Settings',
      url: 'settings',
      icon: 'lucideSettings',
    },
  ];
}
