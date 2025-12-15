import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { StorageService } from '../services/storage.service';

@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule],
  template: `
    <div class="flex min-h-[60vh] items-center justify-center">
      <div class="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 class="text-lg font-semibold text-slate-900">Enter workspace</h1>
        <p class="mt-1 text-sm text-slate-500">
          This is a demo login.
        </p>

        <form class="mt-6 space-y-4" [formGroup]="form" (ngSubmit)="onSubmit()">
          <label class="block text-sm font-medium text-slate-700" for="username">
            Username
          </label>
          <input
            id="username"
            type="text"
            autocomplete="off"
            formControlName="username"
            class="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1"
            [attr.aria-invalid]="form.controls.username.invalid && form.controls.username.touched"
            aria-describedby="username-help"
          />
          <p id="username-help" class="text-xs text-slate-500">
            Use any name you like.
          </p>

          <button
            type="submit"
            class="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300"
            [disabled]="form.invalid"
          >
            Enter
          </button>
        </form>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly storage = inject(StorageService);

  readonly form = this.fb.group({
    username: ['', [Validators.required, Validators.maxLength(64)]],
  });

  constructor() {
    const existing = this.storage.username();
    if (existing) {
      this.router.navigateByUrl('/leads');
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.value.username?.trim();
    if (!value) {
      return;
    }

    this.storage.setUsername(value);
    this.router.navigateByUrl('/leads');
  }
}


