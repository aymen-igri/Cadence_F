import { Component, input, inject, signal, effect, ChangeDetectionStrategy, computed } from '@angular/core';
import { form, FormField, required, FormRoot } from '@angular/forms/signals';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { BrnSelectImports } from '@spartan-ng/brain/select';
import { User, UpdateProfilePayload, ProfilePictureResponse } from '@app/core/models/user.model';
import { toast } from 'ngx-sonner';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { SettingsService } from '@app/core/services/settings.service';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { provideIcons } from '@ng-icons/core';
import { lucideUpload } from '@ng-icons/lucide';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { createMutation } from '@app/core/utils/mutation.helper';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
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
  private previousProfilePic = signal<string>('');

  profileModel = signal<UpdateProfilePayload>({
    firstName: '',
    lastName: '',
    phone: '',
    gender: 'MALE',
  });

  profilePicture = signal<string>('');

  constructor() {
    effect(() => {
      const currentUser = this.user();
      if (currentUser) {
        this.profileModel.set({
          firstName: currentUser.firstName,
          lastName: currentUser.lastName,
          phone: currentUser.phone || '',
          gender: currentUser.gender,
        });
        this.profilePicture.set(currentUser.profilePic || '');
      }
    });
  }

  updateProfileMutation = createMutation({
    mutationFn: (data: UpdateProfilePayload) => this.settingsService.updateUserProfile(data),
    onSuccess: () => {
      toast.success('Profile updated', {
        description: 'Your profile settings have been saved successfully.',
      });
    },
    onError: (error: string) => {
      const currentUser = this.user();
      if (currentUser) {
        this.profileModel.set({
          firstName: currentUser.firstName,
          lastName: currentUser.lastName,
          phone: currentUser.phone || '',
          gender: currentUser.gender,
        });
      }
      toast.error('Failed to update profile', {
        description: error || 'An error occurred while saving your changes.',
      });
    },
  });

  uploadProfilePicMutation = createMutation({
    mutationFn: (file: File) => this.settingsService.uploadProfilePic(file),
    onSuccess: (response: ProfilePictureResponse) => {
      this.profilePicture.set(response.profilePic);
      this.isAvatarDialogOpen.set(false);
      toast.success('Profile picture updated', {
        description: 'Your profile picture has been changed successfully.',
      });
    },
    onError: (error) => {
      this.profilePicture.set(this.previousProfilePic());
      toast.error('Failed to upload profile picture', {
        description: error || 'An error occurred while uploading your picture.',
      });
    },
  });

  profileForm = form(
    this.profileModel,
    (schema) => {
      required(schema.firstName, { message: 'First name is required' });
      required(schema.lastName, { message: 'Last name is required' });
    },
    {
      submission: {
        action: async () => {
          const formData = this.profileModel();
          this.profileModel.set(formData);
          this.updateProfileMutation.mutate(formData);
        },
      },
    },
  );

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) {
      return;
    }

    const file = input.files[0];

    if (!file.type.startsWith('image/')) {
      toast.error('Invalid file type', {
        description: 'Please select an image file.',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      this.previousProfilePic.set(this.profilePicture());
      this.profilePicture.set(result);

      this.uploadProfilePicMutation.mutate(file);
    };
    reader.readAsDataURL(file);
  }

  optimizeAvatarUrl(url: string): string {
    if (!url || !url.includes('cloudinary.com')) return url;
    return url.replace('/upload/', '/upload/w_160,h_160,c_fill,f_auto,q_auto/');
  }

  optimizedAvatar = computed(() => this.optimizeAvatarUrl(this.profilePicture()));
}
