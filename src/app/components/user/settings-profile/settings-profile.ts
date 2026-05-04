import { Component, input, linkedSignal } from '@angular/core';
import { form, FormField, required, FormRoot } from '@angular/forms/signals';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { BrnSelectImports } from '@spartan-ng/brain/select';
import { User, UserProfile } from '@app/core/models/user.model';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-settings-profile',
  imports: [
    ...HlmButtonImports,
    ...HlmInputImports,
    ...HlmLabelImports,
    ...HlmCardImports,
    ...HlmSelectImports,
    BrnSelectImports,
    FormField,
    FormRoot,
  ],
  templateUrl: './settings-profile.html',
})
export class SettingsProfileComponent {
  user = input.required<User>();
  profileModel = linkedSignal<UserProfile>(() => ({
    firstName: this.user()?.firstName || '',
    lastName: this.user()?.lastName || '',
    phone: this.user()?.phone || '',
    gender: this.user()?.gender || 'MALE',
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
          console.log('Saving profile', data);
          toast.success('Profile updated', {
            description: 'Your profile settings have been saved successfully.',
          });
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
}
