import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ModalComponent } from './modal.component';
import { DispositionRecord, DispositionStatus } from '../models/disposition.model';

const STATUSES: DispositionStatus[] = [
  'NEW',
  'NO_ANSWER',
  'FOLLOW_UP',
  'INTERESTED',
  'NOT_INTERESTED',
  'WRONG_NUMBER',
  'CLOSED',
];

@Component({
  selector: 'app-disposition-modal',
  imports: [ModalComponent, ReactiveFormsModule],
  template: `
    <app-modal title="Call disposition" (close)="cancel.emit()">
      <form class="space-y-3" [formGroup]="form" (ngSubmit)="onSubmit()">
        <div>
          <label class="block text-xs font-medium text-slate-700" for="status">
            Status
          </label>
          <select
            id="status"
            formControlName="status"
            class="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1"
          >
            @for (s of statuses; track s) {
              <option [value]="s">{{ s }}</option>
            }
          </select>
        </div>

        <div>
          <label class="block text-xs font-medium text-slate-700" for="notes">
            Notes (optional)
          </label>
          <textarea
            id="notes"
            rows="3"
            formControlName="notes"
            class="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1"
          ></textarea>
        </div>

        <div class="text-xs text-slate-500">
          Last call started at:
          <span class="font-mono">{{ callStartedAt }}</span>
          • via
          <span class="uppercase">{{ dialerUsed }}</span>
        </div>

        <div modal-actions>
          <button
            type="button"
            class="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
            (click)="cancel.emit()"
          >
            Cancel
          </button>

          <button
            type="submit"
            class="inline-flex items-center rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
          >
            Save
          </button>
        </div>
      </form>
    </app-modal>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DispositionModalComponent {
  @Input() existing: DispositionRecord | null = null;
  @Input() dialerUsed: 'system' | '3cx' = 'system';
  @Input() callStartedAt = '';

  @Output() save = new EventEmitter<DispositionRecord>();
  @Output() cancel = new EventEmitter<void>();

  readonly statuses = STATUSES;

  private readonly fb = new FormBuilder();

  readonly form = this.fb.group({
    status: ['NEW' as DispositionStatus, Validators.required],
    notes: [''],
  });

  ngOnChanges(): void {
    if (this.existing) {
      this.form.patchValue({
        status: this.existing.status,
        notes: this.existing.notes ?? '',
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const now = new Date().toISOString();
    const value = this.form.value;

    const record: DispositionRecord = {
      status: value.status as DispositionStatus,
      notes: value.notes ?? undefined,
      updatedAt: now,
      dialerUsed: this.dialerUsed,
      callStartedAt: this.callStartedAt || now,
    };

    this.save.emit(record);
  }
}


