import { Component, input, linkedSignal, inject, signal } from '@angular/core';
import { form, FormField, required, FormRoot } from '@angular/forms/signals';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { BrnSelectImports } from '@spartan-ng/brain/select';
import { User, UserProfile } from '@app/core/models/user.model';
import { toast } from 'ngx-sonner';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { SettingsService } from '@app/core/services/settings.service';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { provideIcons } from '@ng-icons/core';
import { lucideUpload } from '@ng-icons/lucide';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { lastValueFrom } from 'rxjs';


@Component({
  selector: 'app-settings-profile',
  imports: [
    ...HlmButtonImports,
    ...HlmInputImports,
    ...HlmLabelImports,
    ...HlmCardImports,
    ...HlmSelectImports,
    ...HlmAvatarImports,
    ...HlmIconImports,
    ...HlmDialogImports,
    BrnSelectImports,
    FormField,
    FormRoot,
  ],
  providers: [provideIcons({ lucideUpload })],
  templateUrl: './settings-profile.html',
})
export class SettingsProfileComponent {
  user = input.required<User>();
  private readonly settingsService = inject(SettingsService);
  
  isAvatarDialogOpen = signal<boolean>(false);

  profileModel = linkedSignal<UserProfile>(() => ({
    firstName: this.user()?.firstName || '',
    lastName: this.user()?.lastName || '',
    phone: this.user()?.phone || '',
    gender: this.user()?.gender || 'MALE',
    profilePic: this.user()?.profilePic || '',
  }));

  profileForm = form(
    this.profileModel,
    (schema) => {
      required(schema.firstName, { message: 'First name is required' });
      required(schema.lastName, { message: 'Last name is required' });
    },
    {
      submission: {
        action: async () => {
          const data = this.profileModel();
          const toastId = toast.loading('Saving profile changes...');
          try {
            await lastValueFrom(this.settingsService.updateUserProfile({
              firstName: data.firstName,
              lastName: data.lastName,
              phone: data.phone,
              gender: data.gender
            }));
            
            toast.success('Profile updated', {
              id: toastId,
              description: 'Your profile settings have been saved successfully.',
            });
            // Reload the page to reflect the changes globally after a short delay so the toast completes
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          } catch (error) {
            toast.error('Failed to update profile', { 
              id: toastId,
              description: 'An error occurred while saving your changes.'
            });
          }
        },
      },
    },
  );

  onSubmit(event: Event) {
    event.preventDefault();
    if (this.profileForm().invalid()) {
      return;
    }
    // Form action is handled via submission
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const toastId = toast.loading('Uploading profile picture...');
      this.settingsService.uploadProfilePic(file).subscribe({
        next: (res: any) => {
          toast.success('Profile picture updated', { id: toastId });
          // Update the local profile model with the new image URL if returned
          if (res && res.profilePic) {
            this.profileModel.update((model) => ({
              ...model,
              profilePic: res.profilePic,
            }));
          }
          this.isAvatarDialogOpen.set(false);
          // Reload the page to reflect the changes globally after a short delay so the toast completes
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        },
        error: () => {
          toast.error('Failed to upload profile picture', { id: toastId });
        }
      });
    }
  }
}
