# 3CX Lead Dialer POC

Minimal Angular POC for a lead dialer workflow using static data, Tailwind CSS, and `localStorage` only.

- Fake login stores the username in `localStorage`.
- Leads are loaded from `src/assets/leads.json`.
- Call flow: Lead details → choose dialer (System / 3CX) → return → disposition modal.
- Dispositions and pending calls are stored in `localStorage`.

## Run the app

From the `3cx-poc` directory:

```bash
npm install
npm start
```

Then open `http://localhost:4200/` in your browser.

## Key pages

- `/login` – simple username input; persists to `localStorage` and redirects to `/leads`.
- `/leads` – searchable list of leads (mobile cards + desktop table), sorted by `createdTime` desc, with status badges.
- `/leads/:id` – lead details, Call button, and last disposition summary.

## Call & disposition flow (POC)

1. From `/leads/:id`, click **Call lead**.
2. Choose **System dialer** (`tel:`) or **3CX dialer** (`tcxcallto://{number}`).
3. The app stores a pending call (lead id, dialer, start time) in `localStorage` and navigates to the dialer URL.
4. When you return to the tab (focus/visibility) after ≥ 5 seconds, the disposition modal auto-opens.
5. Save a status and optional notes; the latest record is stored under the `poc_dispositions` key.

All state is local to the browser; there is no backend or real authentication.
