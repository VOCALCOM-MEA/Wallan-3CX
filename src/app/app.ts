import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { StorageService } from './services/storage.service';
import { CallFlowService } from './services/call-flow.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly storage = inject(StorageService);
  private readonly router = inject(Router);
  private readonly callFlow = inject(CallFlowService);

  protected readonly title = signal('3CX Lead Dialer POC');

  protected readonly username = this.storage.username;

  protected readonly isLoggedIn = computed(() => this.username() !== null);

  constructor() {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        if (!this.storage.username() && !event.urlAfterRedirects.startsWith('/login')) {
          this.router.navigateByUrl('/login');
        }
      });

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
          this.callFlow.checkPendingOnReturn();
        }
      });
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('focus', () => {
        this.callFlow.checkPendingOnReturn();
      });
    }
  }

  protected logout(): void {
    this.storage.setUsername(null);
    this.router.navigateByUrl('/login');
  }
}
