import { Component, HostListener, input, output } from '@angular/core';

export interface SlotRange {
  dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
  start: string;
  end: string;
}

@Component({
  selector: 'app-weekly-grid',
  standalone: true,
  templateUrl: './weekly-grid.html',
})
export class WeeklyGridComponent {
  days: ('MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY')[] = [
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY',
    'SUNDAY',
  ];

  timeLabels = Array.from({ length: 24 }).map((_, i) => {
    const hour = Math.floor(i / 2) + 8;
    const mins = i % 2 === 0 ? '00' : '30';
    return `${hour.toString().padStart(2, '0')}:${mins}`;
  });

  grid: boolean[][] = Array(7)
    .fill(false)
    .map(() => Array(24).fill(false));

  isDragging = false;
  dragMode: 'select' | 'deselect' | null = null;
  dragStartCell: { col: number; row: number } | null = null;
  currentHoverCell: { col: number; row: number } | null = null;

  gridUpdated = output<SlotRange[]>();

  preventDrag(event: DragEvent) {
    event.preventDefault();
  }

  onMouseDown(col: number, row: number, event: MouseEvent) {
    if (event.button !== 0) return;
    this.isDragging = true;
    this.dragStartCell = { col, row };
    this.currentHoverCell = { col, row };
    this.dragMode = this.grid[col][row] ? 'deselect' : 'select';
  }

  onMouseEnter(col: number, row: number) {
    if (!this.isDragging || !this.dragStartCell) return;

    if (col !== this.dragStartCell.col) return;

    this.currentHoverCell = { col, row };
  }

  @HostListener('document:mouseup')
  onMouseUp() {
    if (!this.isDragging || !this.dragStartCell || !this.currentHoverCell) {
      this.resetDrag();
      return;
    }

    const { col: startCol, row: startRow } = this.dragStartCell;
    let endRow = this.currentHoverCell.row;

    // Optional: Enforce minimum 2 cells (1 hour) constraint
    // if start & end are the same, automatically select the next slot (if available)
    if (startRow === endRow && this.dragMode === 'select') {
      if (endRow < 23) endRow++;
      else if (endRow > 0) endRow--;
    }

    const minRow = Math.min(startRow, endRow);
    const maxRow = Math.max(startRow, endRow);

    for (let r = minRow; r <= maxRow; r++) {
      this.grid[startCol][r] = this.dragMode === 'select';
    }

    this.resetDrag();
    this.emitGrid();
  }

  resetDrag() {
    this.isDragging = false;
    this.dragStartCell = null;
    this.currentHoverCell = null;
    this.dragMode = null;
  }

  getCellClass(col: number, row: number): string {
    const isSelected = this.grid[col][row];

    if (
      this.isDragging &&
      this.dragStartCell &&
      this.currentHoverCell &&
      col === this.dragStartCell.col
    ) {
      const minRow = Math.min(this.dragStartCell.row, this.currentHoverCell.row);
      const maxRow = Math.max(this.dragStartCell.row, this.currentHoverCell.row);

      if (row >= minRow && row <= maxRow) {
        return this.dragMode === 'select'
          ? 'bg-primary/50 border-primary'
          : 'bg-destructive/50 border-destructive';
      }
    }

    return isSelected ? 'bg-primary/50 border-primary' : 'bg-background hover:bg-accent';
  }

  emitGrid() {
    const slots: SlotRange[] = [];

    for (let c = 0; c < 7; c++) {
      let startRow = -1;

      for (let r = 0; r <= 24; r++) {
        const isSelected = r < 24 ? this.grid[c][r] : false;

        if (isSelected && startRow === -1) {
          startRow = r;
        } else if (!isSelected && startRow !== -1) {
          // End of a contiguous block
          slots.push({
            dayOfWeek: this.days[c],
            start: this.timeLabels[startRow],
            end: this.getEndTime(r - 1),
          });
          startRow = -1; // reset for next block
        }
      }
    }

    this.gridUpdated.emit(slots);
  }

  private getEndTime(endRowIndex: number): string {
    const hour = Math.floor((endRowIndex + 1) / 2) + 8;
    const mins = (endRowIndex + 1) % 2 === 0 ? '00' : '30';
    return `${hour.toString().padStart(2, '0')}:${mins}`;
  }

  public resetGrid() {
    this.grid = Array(7)
      .fill(false)
      .map(() => Array(24).fill(false));
    this.emitGrid();
  }
}
