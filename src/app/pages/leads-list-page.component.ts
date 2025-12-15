import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { LeadsService } from '../services/leads.service';
import { StorageService } from '../services/storage.service';
import { Lead } from '../models/lead.model';
import { DispositionRecord } from '../models/disposition.model';

@Component({
  selector: 'app-leads-list-page',
  imports: [DatePipe],
  template: `
    <div class="space-y-4">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 class="text-lg font-semibold text-slate-900">Leads</h1>
          <p class="mt-1 text-sm text-slate-500">
            Search by mobile, last name, city, salesman, or model.
          </p>
        </div>

        <div class="w-full max-w-xs">
          <label class="block text-xs font-medium text-slate-600" for="search">
            Search
          </label>
          <input
            id="search"
            type="search"
            class="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1"
            placeholder="e.g. Riyadh, Corolla, Ahmed..."
            #q
            [value]="searchQuery()"
            (input)="onSearch(q.value)"
          />
        </div>
      </div>

      <!-- Mobile cards -->
      <div class="space-y-3 sm:hidden">
        @for (lead of filteredLeads(); track lead.zohoRecordId) {
          <button
            type="button"
            class="flex w-full flex-col items-stretch rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left shadow-sm hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
            (click)="goToLead(lead)"
          >
            <div class="flex items-center justify-between gap-2">
              <div>
                <p class="text-sm font-semibold text-slate-900">
                  {{ lead.lastName }}
                </p>
                <p class="text-xs text-slate-500">
                  {{ lead.city }} • {{ lead.salesman }}
                </p>
              </div>
              <span
                class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                [class.bg-slate-100]="!statusFor(lead)"
                [class.text-slate-600]="!statusFor(lead)"
                [class.bg-gray-100]="statusFor(lead)?.status === 'NEW'"
                [class.text-gray-700]="statusFor(lead)?.status === 'NEW'"
                [class.bg-yellow-100]="statusFor(lead)?.status === 'FOLLOW_UP'"
                [class.text-yellow-800]="statusFor(lead)?.status === 'FOLLOW_UP'"
                [class.bg-green-100]="statusFor(lead)?.status === 'INTERESTED'"
                [class.text-green-800]="statusFor(lead)?.status === 'INTERESTED'"
                [class.bg-red-100]="
                  statusFor(lead)?.status === 'NOT_INTERESTED' ||
                  statusFor(lead)?.status === 'WRONG_NUMBER'
                "
                [class.text-red-800]="
                  statusFor(lead)?.status === 'NOT_INTERESTED' ||
                  statusFor(lead)?.status === 'WRONG_NUMBER'
                "
                [class.bg-blue-100]="statusFor(lead)?.status === 'CLOSED'"
                [class.text-blue-800]="statusFor(lead)?.status === 'CLOSED'"
                [class.bg-slate-200]="statusFor(lead)?.status === 'NO_ANSWER'"
                [class.text-slate-800]="statusFor(lead)?.status === 'NO_ANSWER'"
              >
                {{ statusFor(lead)?.status ?? 'NEW' }}
              </span>
            </div>

            <div class="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-600">
              <span class="rounded bg-white px-2 py-0.5 shadow-sm">
                {{ lead.mobile }}
              </span>
              <span class="rounded bg-white px-2 py-0.5 shadow-sm">
                {{ lead.modelMap }}
              </span>
              <span class="ml-auto text-[0.7rem] text-slate-400">
                {{ lead.createdTime | date : 'short' }}
              </span>
            </div>
          </button>
        }

        @if (!filteredLeads().length) {
          <p class="text-sm text-slate-500">No leads match your search.</p>
        }
      </div>

      <!-- Desktop table -->
      <div class="hidden sm:block">
        <div class="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-sm">
          <div class="grid grid-cols-[1.5fr,1fr,1.5fr,1fr,1fr,auto] border-b border-slate-200 bg-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <div>Lead</div>
            <div>City</div>
            <div>Model</div>
            <div>Salesman</div>
            <div>Created</div>
            <div class="text-right">Status</div>
          </div>

          @for (lead of filteredLeads(); track lead.zohoRecordId; let last = $last) {
            <button
              type="button"
              class="grid w-full grid-cols-[1.5fr,1fr,1.5fr,1fr,1fr,auto] items-center px-4 py-2 text-left text-sm text-slate-800 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
              [class.border-b]="!last"
              [class.border-slate-200]="!last"
              (click)="goToLead(lead)"
            >
              <div class="flex flex-col">
                <span class="font-medium">{{ lead.lastName }}</span>
                <span class="text-xs text-slate-500">{{ lead.mobile }}</span>
              </div>
              <div class="text-sm text-slate-700">{{ lead.city }}</div>
              <div class="text-sm text-slate-700">{{ lead.modelMap }}</div>
              <div class="text-sm text-slate-700">{{ lead.salesman }}</div>
              <div class="text-xs text-slate-500">
                {{ lead.createdTime | date : 'short' }}
              </div>
              <div class="flex justify-end">
                <span
                  class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                  [class.bg-slate-100]="!statusFor(lead)"
                  [class.text-slate-600]="!statusFor(lead)"
                  [class.bg-gray-100]="statusFor(lead)?.status === 'NEW'"
                  [class.text-gray-700]="statusFor(lead)?.status === 'NEW'"
                  [class.bg-yellow-100]="statusFor(lead)?.status === 'FOLLOW_UP'"
                  [class.text-yellow-800]="statusFor(lead)?.status === 'FOLLOW_UP'"
                  [class.bg-green-100]="statusFor(lead)?.status === 'INTERESTED'"
                  [class.text-green-800]="statusFor(lead)?.status === 'INTERESTED'"
                  [class.bg-red-100]="
                    statusFor(lead)?.status === 'NOT_INTERESTED' ||
                    statusFor(lead)?.status === 'WRONG_NUMBER'
                  "
                  [class.text-red-800]="
                    statusFor(lead)?.status === 'NOT_INTERESTED' ||
                    statusFor(lead)?.status === 'WRONG_NUMBER'
                  "
                  [class.bg-blue-100]="statusFor(lead)?.status === 'CLOSED'"
                  [class.text-blue-800]="statusFor(lead)?.status === 'CLOSED'"
                  [class.bg-slate-200]="statusFor(lead)?.status === 'NO_ANSWER'"
                  [class.text-slate-800]="statusFor(lead)?.status === 'NO_ANSWER'"
                >
                  {{ statusFor(lead)?.status ?? 'NEW' }}
                </span>
              </div>
            </button>
          }

          @if (!filteredLeads().length) {
            <div class="px-4 py-3 text-sm text-slate-500">
              No leads match your search.
            </div>
          }
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeadsListPageComponent {
  private readonly leadsService = inject(LeadsService);
  private readonly storage = inject(StorageService);
  private readonly router = inject(Router);

  private readonly leadsSignal = toSignal(this.leadsService.getLeads(), { initialValue: [] });

  protected readonly searchQuery = signal('');

  protected readonly filteredLeads = computed<Lead[]>(() => {
    const term = this.searchQuery().trim().toLowerCase();
    const leads = this.leadsSignal();

    if (!term) {
      return leads;
    }

    return leads.filter((lead) => {
      const haystack =
        `${lead.lastName} ${lead.city} ${lead.salesman} ${lead.modelMap} ${lead.mobile}`.toLowerCase();
      return haystack.includes(term);
    });
  });

  protected onSearch(value: string): void {
    this.searchQuery.set(value);
  }

  protected statusFor(lead: Lead): DispositionRecord | undefined {
    return this.storage.dispositions()[lead.zohoRecordId];
  }

  protected goToLead(lead: Lead): void {
    this.router.navigate(['/leads', lead.zohoRecordId]);
  }
}


