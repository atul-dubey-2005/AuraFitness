# Aura Fitness — HTML/CSS/JS Edition

A full front-end rebuild of the Aura Fitness tracker, converted from the
original ASP.NET Web Forms + SQL Server design into a static site that
runs entirely in the browser. No server, database, or build step required.

## Running it

Open `index.html` in a browser — that's it. Or serve the folder with any
static file server if your browser restricts local file access:

```bash
npx serve .
# or
python3 -m http.server 8000
```

Then visit the printed URL and register a new account.

## What changed from the original

The original app was ASP.NET Web Forms with an Entity Framework /
SQL Server backend (Models, DAL services, .aspx pages). This version keeps
the same feature set and information architecture but moves everything to
the client:

| Original | Here |
|---|---|
| SQL Server + EF (`AuraFitnessContext`) | `localStorage`, wrapped by `js/db.js` |
| `AuthService` | `AuraDB.registerUser / validateUser / logout` |
| `WorkoutService` | `AuraDB.createWorkout / getUserWorkouts / ...` |
| `RoutineService` | `AuraDB.getPredefinedRoutines / assignRoutineToUser / ...` |
| `ProgressService` | `AuraDB.addProgressLog / getUserProgressHistory / ...` |
| `Site.Master` navigation | `js/nav.js`, injected into `#app-header` on every page |
| 9 `.aspx` pages | 8 static `.html` pages (one shared master isn't needed) |

## Pages

- `index.html` — log in
- `register.html` — create an account
- `dashboard.html` — monthly stats, recent workouts, active routine
- `log-workout.html` — log a session with a live calorie estimate
- `progress.html` — log measurements, see a weight trend and history
- `routines.html` — browse routines, view a day-by-day schedule, assign one
- `exercises.html` — searchable/filterable exercise library
- `profile.html` — edit account details, view account statistics

## Data & accounts

Everything (accounts, workouts, routines assigned, progress logs) is
stored per-browser in `localStorage` under the key `auraFitnessDB`.
There's no shared backend, so data does not sync across browsers or
devices. Clearing site data resets the app back to its seeded exercise
library and routines, with no accounts.

Password "hashing" here is a simple client-side demo hash, not real
cryptography — this is a static front-end, not a place to store real
credentials.

## Notes for going further

If you outgrow `localStorage`, `js/db.js` is written as a single object
(`AuraDB`) with one function per original service method — swapping its
internals for `fetch()` calls to a real API is the natural next step,
without touching any of the page scripts that call it.
