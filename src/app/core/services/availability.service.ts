import { Injectable, signal } from '@angular/core';
import { AvailabilitySlot } from '../models/weekly-plan.model';

@Injectable({ providedIn: 'root' })
export class AvailabilityService {
  private _slots = signal<AvailabilitySlot[]>([
    { id: '1', dayOfWeek: 0, startTime: '09:00', endTime: '11:00' },
    { id: '2', dayOfWeek: 1, startTime: '18:00', endTime: '20:00' },
  ]);

  slots = this._slots.asReadonly();

  addSlot(slot: Omit<AvailabilitySlot, 'id'>) {
    const newSlot = { ...slot, id: Math.random().toString(36).substr(2, 9) };
    this._slots.update((slots) => [...slots, newSlot]);
  }

  deleteSlot(id: string) {
    this._slots.update((slots) => slots.filter((s) => s.id !== id));
  }
}
