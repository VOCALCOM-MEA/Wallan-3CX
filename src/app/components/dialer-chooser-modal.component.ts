import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { ModalComponent } from './modal.component';

@Component({
  selector: 'app-dialer-chooser-modal',
  imports: [ModalComponent],
  template: `
    <app-modal title="Choose dialer" (close)="close.emit()">
      <p class="text-sm text-slate-600">
        Call
        <span class="font-medium text-slate-900">{{ leadName }}</span>
        at
        <span class="font-mono text-xs text-slate-900">{{ mobile }}</span>
      </p>

      <div class="mt-4 space-y-2">
        <button
          type="button"
          class="flex w-full items-center justify-between rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
          (click)="selectDialer('system')"
        >
          <span>System dialer</span>
          <span class="text-xs text-indigo-100">{{ mobile }}</span>
        </button>

        <button
          type="button"
          class="flex w-full items-center justify-between rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-slate-50 shadow-sm hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
          (click)="selectDialer('3cx')"
        >
          <span>3CX dialer</span>
          <span class="text-xs text-slate-300">tcxcallto://{{ mobile }}</span>
        </button>
      </div>

      <div modal-actions>
        <button
          type="button"
          class="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
          (click)="close.emit()"
        >
          Cancel
        </button>
      </div>
    </app-modal>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialerChooserModalComponent {
  @Input() leadName = '';
  @Input() mobile = '';

  @Output() chooseDialer = new EventEmitter<'system' | '3cx'>();
  @Output() close = new EventEmitter<void>();

  protected selectDialer(kind: 'system' | '3cx'): void {
    this.chooseDialer.emit(kind);
  }
}


