import { Injectable } from '@angular/core';
import { map, shareReplay, of } from 'rxjs';
import { Lead } from '../models/lead.model';
import leadsData from '../../assets/leads.json';

@Injectable({
  providedIn: 'root',
})
export class LeadsService {
  private readonly leads$ = of(leadsData as Lead[]).pipe(
    map((leads) =>
      [...leads].sort(
        (a, b) => new Date(b.createdTime).getTime() - new Date(a.createdTime).getTime(),
      ),
    ),
    shareReplay(1),
  );

  getLeads() {
    return this.leads$;
  }

  getLeadById(id: string) {
    return this.leads$.pipe(
      map((leads) => leads.find((lead) => lead.zohoRecordId === id) ?? null),
    );
  }
}


