import { Component } from '@angular/core';
import { HlmSidebarImports } from '@spartan-ng/helm/sidebar';
import {
  lucideBookOpen,
  lucideCalendar,
  lucideGoal,
  lucideHouse,
  lucideInbox,
  lucideSearch,
  lucideSettings,
  lucideLogOut,
  lucideUsers,
  lucideMap,
  lucideClock,
  lucideCheck,
} from '@ng-icons/lucide';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { HlmIcon } from '@spartan-ng/helm/icon';
import { LogoComponent } from '../../components/logo/Logo';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [HlmSidebarImports, NgIcon, HlmIcon, LogoComponent, RouterLink, RouterLinkActive],
  template: `
    <div hlmSidebarWrapper>
      <hlm-sidebar>
        <!-- Header: Logo -->
        <div hlmSidebarHeader class="p-4">
          <app-logo />
        </div>

        <!-- Scrollable Content: Main Nav -->
        <div hlmSidebarContent>
          <div hlmSidebarGroup>
            <div hlmSidebarGroupContent>
              <ul hlmSidebarMenu>
                @for (item of _navItems; track item.title) {
                  <li hlmSidebarMenuItem>
                    <a
                      hlmSidebarMenuButton
                      [routerLink]="item.url"
                      class="text-muted-foreground hover:text-foreground no-underline"
                      routerLinkActive="!text-primary !bg-primary/10 !font-medium"
                    >
                      <ng-icon hlm [name]="item.icon" />
                      <span>{{ item.title }}</span>
                    </a>
                  </li>
                }
              </ul>
            </div>
          </div>
        </div>

        <!-- Footer: Settings (Pinned to bottom) -->
        <div hlmSidebarFooter class="mb-6">
          <ul hlmSidebarMenu>
            @for (item of _footerItems; track item.title) {
              <li hlmSidebarMenuItem>
                <a
                  hlmSidebarMenuButton
                  [routerLink]="item.url"
                  class="text-muted-foreground hover:text-foreground no-underline"
                  routerLinkActive="!text-primary !bg-primary/10 !font-medium"
                >
                  <ng-icon hlm [name]="item.icon" />
                  <span>{{ item.title }}</span>
                </a>
              </li>
            }
          </ul>
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
      lucideGoal,
      lucideLogOut,
      lucideUsers,
      lucideMap,
      lucideClock,
      lucideCheck,
    }),
  ],
})
export class AppSidebar {
  readonly role = localStorage.getItem('role');

  protected readonly _adminNavItems = [
    {
      title: 'Dashboard',
      url: 'dashboard',
      icon: 'lucideHouse',
    },
    {
      title: 'User Management',
      url: 'users',
      icon: 'lucideUsers',
    },
  ];

  protected readonly _userNavItems = [
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
      title: 'Study Map',
      url: 'study-map',
      icon: 'lucideMap',
    },
    {
      title: 'Sessions',
      url: 'sessions',
      icon: 'lucideClock',
    },
    {
      title: 'Groups',
      url: 'groups',
      icon: 'lucideUsers',
    },
    {
      title: 'Availability Plan',
      url: 'availability-plan/list',
      icon: 'lucideCheck',
    },
    {
      title: 'Weekly Plan',
      url: 'weekly-plan',
      icon: 'lucideCalendar',
    },
  ];

  protected readonly _footerItems = [
    {
      title: 'Settings',
      url: 'settings',
      icon: 'lucideSettings',
    },
    {
      title: 'Logout',
      url: 'logout',
      icon: 'lucideLogOut',
    },
  ];

  readonly _navItems = this.role === 'admin' ? this._adminNavItems : this._userNavItems;
}
