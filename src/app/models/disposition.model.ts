export type DispositionStatus =
  | 'NEW'
  | 'NO_ANSWER'
  | 'FOLLOW_UP'
  | 'INTERESTED'
  | 'NOT_INTERESTED'
  | 'WRONG_NUMBER'
  | 'CLOSED';

export interface DispositionRecord {
  status: DispositionStatus;
  notes?: string;
  updatedAt: string;
  dialerUsed: 'system' | '3cx';
  callStartedAt: string;
}


