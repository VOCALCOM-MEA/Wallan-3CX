import { Injectable, Signal, inject, signal } from '@angular/core';
import { StorageService } from './storage.service';
import { normalizePhone } from './phone.util';

export interface DispositionRequest {
  leadId: string;
  dialerUsed: 'system' | '3cx';
  callStartedAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class CallFlowService {
  private readonly storage = inject(StorageService);

  private readonly _dispositionRequest = signal<DispositionRequest | null>(null);

  readonly dispositionRequest: Signal<DispositionRequest | null> = this._dispositionRequest.asReadonly();

  startCall(leadId: string, dialerUsed: 'system' | '3cx', rawPhone: string): void {
    const callStartedAt = new Date().toISOString();
    const normalized = normalizePhone(rawPhone);
    const href = dialerUsed === 'system' ? `tel:${normalized}` : `tcxcallto://${normalized}`;

    this.storage.setPendingCall({
      pendingLeadId: leadId,
      dialerUsed,
      callStartedAt,
    });

    window.location.href = href;
  }

  checkPendingOnReturn(): void {
    const pending = this.storage.pendingCall();
    if (!pending) {
      return;
    }

    const started = new Date(pending.callStartedAt).getTime();
    if (Number.isNaN(started)) {
      return;
    }

    const elapsedMs = Date.now() - started;
    if (elapsedMs >= 5000) {
      this._dispositionRequest.set({
        leadId: pending.pendingLeadId,
        dialerUsed: pending.dialerUsed,
        callStartedAt: pending.callStartedAt,
      });
    }
  }

  clearPendingAndRequest(): void {
    this.storage.setPendingCall(null);
    this._dispositionRequest.set(null);
  }
}


