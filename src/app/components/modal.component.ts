import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-modal',
  template: `
    <div
      class="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 px-4 py-6"
      role="dialog"
      aria-modal="true"
    >
      <div
        class="w-full max-w-md rounded-2xl bg-white p-4 shadow-lg ring-1 ring-slate-200"
      >
        <header class="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
          <h2 class="text-sm font-semibold text-slate-900">
            {{ title }}
          </h2>
          <button
            type="button"
            class="inline-flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
            (click)="close.emit()"
            aria-label="Close"
          >
            ✕
          </button>
        </header>

        <div class="mt-3 text-sm text-slate-700">
          <ng-content />
        </div>

        <footer class="mt-4 flex justify-end gap-2">
          <ng-content select="[modal-actions]" />
        </footer>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalComponent {
  @Input() title = '';
  @Output() close = new EventEmitter<void>();
}


