import { Routes } from '@angular/router';
import { LoginPageComponent } from './pages/login-page.component';
import { LeadsListPageComponent } from './pages/leads-list-page.component';
import { LeadDetailPageComponent } from './pages/lead-detail-page.component';

export const routes: Routes = [
  { path: 'login', component: LoginPageComponent },
  { path: 'leads', component: LeadsListPageComponent },
  { path: 'leads/:id', component: LeadDetailPageComponent },
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: '**', redirectTo: 'login' },
];
