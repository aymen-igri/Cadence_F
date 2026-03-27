import { Component, OnInit, output, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { AppSession } from '../../../../core/models/session.model';

@Component({
  selector: 'app-sessions-calendar',
  standalone: true,
  imports: [CommonModule, FullCalendarModule],
  templateUrl: './session-calendar.html',
  styles: [
    `
      /* Minimal FullCalendar overrides for Spartan matching */
      ::ng-deep .fc-theme-standard td,
      ::ng-deep .fc-theme-standard th {
        border-color: hsl(var(--border));
      }
      ::ng-deep .fc-theme-standard .fc-scrollgrid {
        border-color: hsl(var(--border));
      }
      ::ng-deep .fc .fc-col-header-cell-cushion {
        color: hsl(var(--foreground));
        font-weight: 500;
        padding: 8px 4px;
      }
      ::ng-deep .fc .fc-timegrid-slot-label-cushion {
        color: hsl(var(--muted-foreground));
      }
      ::ng-deep .fc .fc-timegrid-now-indicator-line {
        border-color: hsl(var(--primary));
      }
      ::ng-deep .fc .fc-timegrid-now-indicator-arrow {
        border-color: hsl(var(--primary));
        background-color: hsl(var(--primary));
      }
      ::ng-deep .fc-event {
        border: none !important;
        background: none !important;
      }
    `,
  ],
})
export class SessionsCalendarComponent implements OnInit {
  sessions = input<AppSession[]>([]);
  slotClick = output<{ dateStr: string; timeStr: string }>();
  sessionClick = output<string>();

  calendarOptions: CalendarOptions = {
    plugins: [timeGridPlugin, interactionPlugin],
    initialView: 'timeGridWeek',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: '',
    },
    slotMinTime: '06:00:00',
    slotMaxTime: '23:00:00',
    allDaySlot: false,
    editable: false,
    selectable: true,
    height: '100%',
    events: [],
    dateClick: this.handleDateClick.bind(this),
    eventClick: this.handleEventClick.bind(this),
    eventContent: this.renderEventContent.bind(this),
  };

  ngOnInit() {
    this.updateEvents();
  }

  ngOnChanges() {
    this.updateEvents();
  }

  updateEvents() {
    const events: EventInput[] = this.sessions().map((s) => {
      const status = s.status;
      let badgeClass = 'bg-secondary text-secondary-foreground';

      if (status === 'COMPLETED') badgeClass = 'bg-green-500 text-white';
      if (status === 'MISSED') badgeClass = 'bg-destructive text-destructive-foreground';

      return {
        id: s.id,
        title: s.title,
        start: s.date + 'T' + s.startTime + ':00',
        end: s.date + 'T' + s.endTime + ':00',
        extendedProps: {
          subjectName: s.subjectName || 'No Subject',
          status: s.status,
          badgeClass: badgeClass,
        },
      };
    });
    this.calendarOptions.events = events;
  }

  handleDateClick(arg: any) {
    const dateStr = arg.dateStr.split('T')[0];
    const timeStr = arg.dateStr.split('T')[1]?.substring(0, 5) || '12:00';
    this.slotClick.emit({ dateStr, timeStr });
  }

  handleEventClick(arg: any) {
    this.sessionClick.emit(arg.event.id);
  }

  renderEventContent(arg: any) {
    const badgeClass = arg.event.extendedProps['badgeClass'];
    const status = arg.event.extendedProps['status'];
    const subjectName = arg.event.extendedProps['subjectName'];

    return {
      html:
        '<div class="h-full w-full p-2 flex flex-col gap-1 rounded-md border-l-4 border-l-primary bg-card/90 shadow-sm border border-border overflow-hidden cursor-pointer hover:bg-muted/50 transition-colors">' +
        '<div class="font-semibold text-xs text-foreground truncate">' +
        arg.event.title +
        '</div>' +
        '<div class="text-[10px] text-muted-foreground truncate">' +
        subjectName +
        '</div>' +
        '<div class="mt-auto self-start px-1.5 py-0.5 rounded-sm text-[9px] font-medium uppercase tracking-wider ' +
        badgeClass +
        '">' +
        status +
        '</div>' +
        '</div>',
    };
  }
}
