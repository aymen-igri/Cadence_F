import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AvailabilityService } from '@app/core/services/availability.service';
import { HlmAccordionImports } from '@spartan-ng/helm/accordion';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { LucideAngularModule, Edit2, Plus, Trash2 } from 'lucide-angular';

@Component({
  selector: 'app-weekly-plan-availability',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HlmAccordionImports,
    HlmButtonImports,
    HlmInputImports,
    LucideAngularModule,
  ],
  templateUrl: './availability-section.html',
})
export class AvailabilitySectionComponent {
  private availabilityService = inject(AvailabilityService);

  slots = this.availabilityService.slots;

  addingSlotDay = signal<number | null>(null);
  newStartTime = '09:00';
  newEndTime = '10:00';

  protected Edit2Icon = Edit2;
  protected PlusIcon = Plus;
  protected Trash2Icon = Trash2;

  days = [
    { label: 'Mon', value: 0 },
    { label: 'Tue', value: 1 },
    { label: 'Wed', value: 2 },
    { label: 'Thu', value: 3 },
    { label: 'Fri', value: 4 },
    { label: 'Sat', value: 5 },
    { label: 'Sun', value: 6 },
  ];

  getSlotsForDay(dayOfWeek: number) {
    return this.slots()
      .filter((s) => s.dayOfWeek === dayOfWeek)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }

  startAdding(dayOfWeek: number) {
    this.addingSlotDay.set(dayOfWeek);
    this.newStartTime = '09:00';
    this.newEndTime = '10:00';
  }

  cancelAdd() {
    this.addingSlotDay.set(null);
  }

  saveSlot(dayOfWeek: number) {
    if (this.newStartTime && this.newEndTime) {
      this.availabilityService.addSlot({
        dayOfWeek,
        startTime: this.newStartTime,
        endTime: this.newEndTime,
      });
      this.addingSlotDay.set(null);
    }
  }

  deleteSlot(id: string) {
    this.availabilityService.deleteSlot(id);
  }
}
