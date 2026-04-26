import { Component, effect, output, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventClickArg, EventContentArg, EventInput } from '@fullcalendar/core';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import { CreateSubSessionResponse } from '@app/core/models/session.model';

type CalendarStatus = CreateSubSessionResponse['status'];

export interface SessionCalendarEvent {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  subjectName?: string;
  status: CalendarStatus;
}

interface SessionEventExtendedProps {
  subjectName: string;
  status: CalendarStatus;
  badgeClass: string;
}

function normalizeCalendarTime(value: string): string {
  const [hours = '00', minutes = '00', seconds = '00'] = (value || '').split(':');
  return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`;
}

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
export class SessionsCalendarComponent {
  sessions = input<SessionCalendarEvent[]>([]);
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

  constructor() {
    effect(() => {
      this.sessions();
      this.updateEvents();
    });
  }

  updateEvents() {
    const badgeClassByStatus: Record<CalendarStatus, string> = {
      PENDING: 'bg-secondary text-secondary-foreground',
      INCOMPLETED: 'bg-destructive text-destructive-foreground',
      COMPLETED: 'bg-green-500 text-white',
      CLOSED: 'bg-muted text-muted-foreground',
    };

    const events: EventInput[] = this.sessions().map((s) => {
      const badgeClass = badgeClassByStatus[s.status];
      const extendedProps: SessionEventExtendedProps = {
        subjectName: s.subjectName || 'No Subject',
        status: s.status,
        badgeClass,
      };

      const startDateTime = `${s.date}T${normalizeCalendarTime(s.startTime)}`;
      const endDateTime = `${s.date}T${normalizeCalendarTime(s.endTime)}`;

      return {
        id: s.id,
        title: s.title,
        start: startDateTime,
        end: endDateTime,
        extendedProps,
      };
    });

    const nextInitialDate =
      events.length > 0 && typeof events[0].start === 'string'
        ? events[0].start.split('T')[0]
        : this.calendarOptions.initialDate;

    this.calendarOptions = {
      ...this.calendarOptions,
      events,
      initialDate: nextInitialDate,
    };
  }

  handleDateClick(arg: DateClickArg) {
    const dateStr = arg.dateStr.split('T')[0];
    const timeStr = arg.dateStr.split('T')[1]?.substring(0, 5) || '12:00';
    this.slotClick.emit({ dateStr, timeStr });
  }

  handleEventClick(arg: EventClickArg) {
    this.sessionClick.emit(arg.event.id);
  }

  renderEventContent(arg: EventContentArg) {
    const props = arg.event.extendedProps as SessionEventExtendedProps;
    const badgeClass = props.badgeClass;
    const status = props.status;
    const subjectName = props.subjectName;

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
