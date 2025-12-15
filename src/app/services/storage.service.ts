import { Injectable, signal } from '@angular/core';
import { DispositionRecord } from '../models/disposition.model';

type DispositionMap = Record<string, DispositionRecord>;

interface PendingCall {
  pendingLeadId: string;
  callStartedAt: string;
  dialerUsed: 'system' | '3cx';
}

const USERNAME_KEY = 'poc_username';
const DISPOSITIONS_KEY = 'poc_dispositions';
const PENDING_CALL_KEY = 'poc_pending_call';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  username = signal<string | null>(this.readString(USERNAME_KEY));

  dispositions = signal<DispositionMap>(this.readJson<DispositionMap>(DISPOSITIONS_KEY, {}));

  pendingCall = signal<PendingCall | null>(this.readJson<PendingCall | null>(PENDING_CALL_KEY, null));

  setUsername(value: string | null): void {
    this.username.set(value);
    if (value === null) {
      localStorage.removeItem(USERNAME_KEY);
    } else {
      localStorage.setItem(USERNAME_KEY, value);
    }
  }

  setDisposition(leadId: string, record: DispositionRecord): void {
    const current = this.dispositions();
    const updated: DispositionMap = { ...current, [leadId]: record };
    this.dispositions.set(updated);
    localStorage.setItem(DISPOSITIONS_KEY, JSON.stringify(updated));
  }

  clearDispositions(): void {
    this.dispositions.set({});
    localStorage.removeItem(DISPOSITIONS_KEY);
  }

  setPendingCall(pending: PendingCall | null): void {
    this.pendingCall.set(pending);
    if (pending === null) {
      localStorage.removeItem(PENDING_CALL_KEY);
    } else {
      localStorage.setItem(PENDING_CALL_KEY, JSON.stringify(pending));
    }
  }

  private readString(key: string): string | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }
    return localStorage.getItem(key);
  }

  private readJson<T>(key: string, fallback: T): T {
    if (typeof localStorage === 'undefined') {
      return fallback;
    }
    const raw = localStorage.getItem(key);
    if (!raw) {
      return fallback;
    }
    try {
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  }
}


