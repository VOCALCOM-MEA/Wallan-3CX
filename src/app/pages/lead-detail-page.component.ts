import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DatePipe, UpperCasePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { LeadsService } from '../services/leads.service';
import { StorageService } from '../services/storage.service';
import { CallFlowService } from '../services/call-flow.service';
import { Lead } from '../models/lead.model';
import { DispositionRecord } from '../models/disposition.model';
import { DispositionModalComponent } from '../components/disposition-modal.component';

@Component({
  selector: 'app-lead-detail-page',
  imports: [DatePipe, UpperCasePipe, DispositionModalComponent],
  template: `
    @if (!lead()) {
      <p class="text-sm text-slate-500">Lead not found.</p>
    } @else {
      <div class="space-y-4">
        <button
          type="button"
          class="inline-flex items-center text-xs font-medium text-slate-500 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
          (click)="goBack()"
        >
          ← Back to leads
        </button>

        <div class="flex flex-col gap-4 md:flex-row md:items-start">
          <div class="flex-1 space-y-2">
            <h1 class="text-lg font-semibold text-slate-900">
              {{ lead()?.lastName }}
            </h1>
            <p class="text-sm text-slate-600">
              {{ lead()?.city }} • {{ lead()?.salesman }}
            </p>
            <p class="text-xs text-slate-500">
              Created
              <span class="font-mono">
                {{ lead()?.createdTime | date : 'short' }}
              </span>
            </p>

            <div class="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
              <span class="rounded bg-slate-50 px-2 py-1 shadow-sm">
                Mobile:
                <span class="font-mono text-slate-900">{{ lead()?.mobile }}</span>
              </span>
              <span class="rounded bg-slate-50 px-2 py-1 shadow-sm">
                Model:
                <span class="font-medium text-slate-900">{{ lead()?.modelMap }}</span>
              </span>
            </div>
          </div>

          <div class="w-full max-w-xs space-y-2">
            <button
              type="button"
              class="inline-flex w-full items-center justify-center rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
              (click)="startSystemCall()"
            >
              Call lead
            </button>

            <div class="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs">
              <span class="text-slate-500">Current status</span>
              <span
                class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                [class.bg-slate-100]="!currentDisposition()"
                [class.text-slate-600]="!currentDisposition()"
                [class.bg-gray-100]="currentDisposition()?.status === 'NEW'"
                [class.text-gray-700]="currentDisposition()?.status === 'NEW'"
                [class.bg-yellow-100]="currentDisposition()?.status === 'FOLLOW_UP'"
                [class.text-yellow-800]="currentDisposition()?.status === 'FOLLOW_UP'"
                [class.bg-green-100]="currentDisposition()?.status === 'INTERESTED'"
                [class.text-green-800]="currentDisposition()?.status === 'INTERESTED'"
                [class.bg-red-100]="
                  currentDisposition()?.status === 'NOT_INTERESTED' ||
                  currentDisposition()?.status === 'WRONG_NUMBER'
                "
                [class.text-red-800]="
                  currentDisposition()?.status === 'NOT_INTERESTED' ||
                  currentDisposition()?.status === 'WRONG_NUMBER'
                "
                [class.bg-blue-100]="currentDisposition()?.status === 'CLOSED'"
                [class.text-blue-800]="currentDisposition()?.status === 'CLOSED'"
                [class.bg-slate-200]="currentDisposition()?.status === 'NO_ANSWER'"
                [class.text-slate-800]="currentDisposition()?.status === 'NO_ANSWER'"
              >
                {{ currentDisposition()?.status ?? 'NEW' }}
              </span>
            </div>
          </div>
        </div>

        <section class="mt-3 space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <h2 class="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Last disposition
          </h2>

          @if (currentDisposition(); as d) {
            <div class="space-y-1 text-xs text-slate-700">
              <p>
                <span class="font-medium">Status:</span>
                {{ d.status }}
              </p>
              <p>
                <span class="font-medium">Updated:</span>
                {{ d.updatedAt | date : 'short' }}
              </p>
              <p>
                <span class="font-medium">Call started:</span>
                {{ d.callStartedAt | date : 'short' }}
                ({{ d.dialerUsed | uppercase }})
              </p>
              @if (d.notes) {
                <p>
                  <span class="font-medium">Notes:</span>
                  {{ d.notes }}
                </p>
              }
            </div>
          } @else {
            <p class="text-xs text-slate-500">
              No disposition saved yet for this lead.
            </p>
          }
        </section>
      </div>

      @if (showDispositionModal()) {
        <app-disposition-modal
          [existing]="currentDisposition()"
          [dialerUsed]="pendingDialer()"
          [callStartedAt]="pendingCallStartedAt()"
          (save)="handleDispositionSave($event)"
          (cancel)="closeDispositionModal()"
        />
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeadDetailPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly leadsService = inject(LeadsService);
  private readonly storage = inject(StorageService);
  private readonly callFlow = inject(CallFlowService);

  private readonly leadId = toSignal(
    this.route.paramMap,
    { initialValue: this.route.snapshot.paramMap }
  );

  readonly lead = computed<Lead | null>(() => {
    const id = this.leadId().get('id');
    if (!id) {
      return null;
    }
    let found: Lead | null = null;
    this.leadsService.getLeadById(id).subscribe((lead) => {
      found = lead;
    }).unsubscribe();
    return found;
  });

  readonly currentDisposition = computed<DispositionRecord | null>(() => {
    const id = this.leadId().get('id');
    if (!id) {
      return null;
    }
    return this.storage.dispositions()[id] ?? null;
  });

  readonly showDialer = signal(false);
  readonly showDispositionModal = signal(false);
  readonly pendingDialer = signal<'system' | '3cx'>('system');
  readonly pendingCallStartedAt = signal('');

  constructor() {
    const request = this.callFlow.dispositionRequest();
    const id = this.leadId().get('id');
    if (request && id && request.leadId === id) {
      this.pendingDialer.set(request.dialerUsed);
      this.pendingCallStartedAt.set(request.callStartedAt);
      this.showDispositionModal.set(true);
    }
  }

  protected goBack(): void {
    this.router.navigateByUrl('/leads');
  }

  protected startSystemCall(): void {
    const currentLead = this.lead();
    if (!currentLead) {
      return;
    }
    this.callFlow.startCall(currentLead.zohoRecordId, 'system', currentLead.mobile);
  }

  protected handleDispositionSave(record: DispositionRecord): void {
    const id = this.leadId().get('id');
    if (!id) {
      return;
    }
    this.storage.setDisposition(id, record);
    this.callFlow.clearPendingAndRequest();
    this.showDispositionModal.set(false);
  }

  protected closeDispositionModal(): void {
    this.callFlow.clearPendingAndRequest();
    this.showDispositionModal.set(false);
  }
}


