import { Component,inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HlmSheetImports } from '@spartan-ng/helm/sheet';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { AppSession } from '../../../../core/models/session.model';
import { LucideAngularModule, X } from 'lucide-angular';

@Component({
  selector: 'app-session-sheet',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HlmSheetImports,
    HlmButtonImports,
    HlmInputImports,
    HlmLabelImports,
    LucideAngularModule,
  ],
  templateUrl: './session-sheet.html',
})
export class SessionSheetComponent {
  private fb = inject(FormBuilder);

  save = output<Partial<AppSession>>();
  closed = output<void>();

  state: 'closed' | 'open' = 'closed';

  sessionForm: FormGroup = this.fb.group({
    title: ['', Validators.required],
    date: ['', Validators.required],
    startTime: ['', Validators.required],
    endTime: ['', Validators.required],
    type: ['FOCUS', Validators.required],
    subjectId: [''],
    goalId: [''],
    taskId: [''],
  });

  protected XIcon = X;

  open(initialData?: Partial<AppSession>) {
    this.sessionForm.reset({
      type: 'FOCUS',
      date: initialData?.date || new Date().toISOString().split('T')[0],
      startTime: initialData?.startTime || '09:00',
      endTime: initialData?.endTime || '10:00',
    });
    this.state = 'open';
  }

  close() {
    this.state = 'closed';
  }

  onStateChange(newState: any) {
    if (newState === 'closed') {
      this.closed.emit();
    }
  }

  onSubmit() {
    if (this.sessionForm.valid) {
      this.save.emit({
        ...this.sessionForm.value,
        status: 'PLANNED',
      });
      this.close();
    }
  }
}
