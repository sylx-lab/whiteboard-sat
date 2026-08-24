# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Next.js dev server (localhost:3000)
npm run build    # production build
npm run start    # serve the production build
npm run lint     # bare `eslint` (eslint.config.mjs = next core-web-vitals + typescript)
npm test         # node --test over app/**/*.test.ts (no framework, plain node:assert)
npx tsc --noEmit # typecheck (no dedicated script)

node --test app/features/admin/lib/importQuestions.test.ts   # a single test file
```

Tests use Node's built-in runner against TypeScript directly. Two consequences for any module a
test reaches, transitively included:

- relative imports need the `.ts` extension (`allowImportingTsExtensions` is on for this reason)
- type-only imports must be written `import type`, or Node tries to resolve `../types` at runtime
  and fails

The pure, tested logic lives in `app/features/admin/lib/` (`groupQuestions`, `questionCodes`,
`importQuestions`). Put new category/parsing/numbering logic there rather than inline in a
component — that is what makes it checkable.

Most of the UI has no tests; verify UI changes with `npm run build` and by exercising the app.

## Architecture

Next.js 16 App Router, React 19, TypeScript, Tailwind v4. The **UI is still entirely
client-side** — every component reads `localStorage` through `useAppStore` — but there is now a
full JSON API and a MongoDB layer behind it (see *The API* below). Nothing but `/api/auth` is
wired into the store yet, so the two halves currently hold separate copies of the same data.

### The store is a hook, not a context — this is the main gotcha

`app/services/store.ts` exports `useAppStore()`, a plain `useState`-based hook with **no Provider and no context**. Every component that calls it creates its own independent copy of application state, seeded from `localStorage` and re-persisted by `useEffect`. Two live instances do not see each other's writes until remount.

Consequence — the mandatory pattern:

- Exactly **one** `useAppStore()` call per route tree, in the route's `page.tsx`.
- `page.tsx` is a thin `'use client'` adapter: call the store, prop-drill state and callbacks into the feature component, translate navigation into `router.push`.
- Feature components under `app/features/**` are presentational — they take props and must not import the store. (`app/components/AppShell.tsx` is the one deliberate exception: it holds the global chrome's own instance.)

Adding new global state means adding it to `store.ts` and threading it through props, not calling `useAppStore()` deeper in the tree.

The store's return object contains **intentional aliases** for the same function (`loginUser`/`loginWithPhoneOrEmail`, `switchUser`/`switchDemoRole`, `logoutUser`/`logout`, `finalizeMockTest`/`finalizeMockTestAttempt`, `toggleLessonComplete`/`toggleLessonCompleted`, `grantStudentAccess`/`updateUserAccess`, `toggleStudentSuspension`/`toggleUserStatus`, `mockAttempts`/`mockTestAttempts`) — leftovers from renames. Reuse an existing name; don't add a third.

### The API

`app/api/**/route.ts` — one catch-all route file per collection, all of them thin:

| Route | Methods |
| --- | --- |
| `/api/auth/[...action]` | register, login, logout, me, forgot/reset password, verify + resend email, Google OAuth |
| `/api/questions/[[...id]]` | GET (`?domain,?topic,?status,?q`…), POST (object **or array** = import), PATCH `/<id>`, PATCH (bulk `[{id,topic}]`), DELETE `/<id>` |
| `/api/courses/[[...id]]` | GET, POST, PATCH `/<id>`, DELETE `/<id>` — lessons are embedded, so editing one is a PATCH of the course |
| `/api/resources/[[...id]]`, `/api/mock-tests/[[...id]]` | same four |
| `/api/attempts/[[...kind]]` | GET (history), POST `/practice`, PUT `/mock/<id>`, PUT `/session/<id>` |
| `/api/payments/[[...id]]` | POST (submit), GET (own, or the queue), PATCH `/<id>` `{status}` |
| `/api/users/[[...id]]` | GET, POST (staff), PATCH `/<id>` (role, permissions, access, suspension) |
| `/api/me` | PATCH — own profile, lesson progress, bookmarks. Never role or access |

Three files hold everything they share; a new endpoint should reach for these rather than
re-implement them:

- **`lib/api.ts`** — `crud()` builds the four content routes from a `normalize()` (defaults and
  derived fields, run on create *and* update) plus an optional `visibleTo()` and `query()`.
  `requireUser`/`requirePermission` return the 401/403 `Response` itself, so callers write
  `if (denied(user)) return user;`.
- **`lib/access.ts`** — the entitlement engine, pure and shared with the store. `canSee*` decides,
  `redact*` strips a locked record down to what renders the padlock. The store's
  `hasAccessTo*` are one-line wrappers over the same functions, because a client-side check is a
  lock on a door with no wall.
- **`lib/db.ts`** — `hydrate.*` / `dehydrate.*` convert doc ↔ app type. The alias and derived
  fields (`answer_choices`, `totalQuestions`, `createdAt`, `timestamp`, `status`) are **not
  stored**; they are put back on read. Anything that writes a document goes through `dehydrate`,
  including `dbSeed.ts`.

Two rules the routes exist to enforce, both of which a client cannot be trusted with:

- **The server grades.** `POST /api/attempts/practice` takes a `selectedAnswer` and looks the
  correct one up itself; finalizing a mock runs `scoreAttempt` server-side and ignores any
  `scoreSummary` in the body. A submitted attempt is final (409 on resubmit).
- **The server prices.** A payment's amount comes from the plan or course being bought, and the
  payer from the session — never from the request body. Verifying expands the plan through
  `applyPlanGrants`, once, on the transition.

### Hydration

The store reads `localStorage` inside `useState` initializers, so server HTML and the first client
render can disagree. `AdminPanel.tsx` guards with

```ts
const isHydrated = useSyncExternalStore(() => () => {}, () => true, () => false);
```

and renders a placeholder until it is true. Use that form rather than a `useEffect(() =>
setMounted(true))` flag: the configured `react-hooks/set-state-in-effect` rule is an **error**, so
the effect version fails `npm run lint`. The same rule means props must not be synced into state by
effect either — remount the component with a `key` instead (see how `AdminPanel` renders
`MockTestEditorModal`).

### Admin navigation lives in the URL

`/admin` renders one shell (`AdminPanel`) whose active page comes from the `?tab=` search param,
validated against `ADMIN_SUB_PAGES`; an unknown or missing value falls back to `overview`.
That is what makes browser back/forward, deep links, and "return to the list I came from" work —
never move the active tab back into local state. Because `AdminPanel` calls `useSearchParams`,
`app/admin/page.tsx` wraps it in `<Suspense>`; keep that wrapper.

All four content types are full-route visual editors —
`/admin/{questions,courses,resources,mock-tests}/{new,[id]}` — each returning to `/admin?tab=<list>`
on save or cancel. Nothing in the admin console is edited in a modal; modals are only for read-only
inspection (payment receipt, student detail) and for picking (the mock test question picker).
`AdminPanel` therefore only receives the props its *list* views need — the editors reach the store
directly through their route page, so don't re-add create/update props to `AdminPanelProps`.

### Layout and navigation

`app/layout.tsx` → `AppShell` wraps every route and owns the Navbar, Footer, `AuthModal`, and `PaymentModal`. `AppShell` branches on `pathname.startsWith('/admin')` to render a chrome-free admin layout.

Navigation still speaks the `NavView` string union from `Navbar.tsx` — a leftover vocabulary from the pre-router single-page version. Two functions in `AppShell` must both be updated when adding a route: `getCurrentNavView()` (pathname → NavView, drives active highlighting) and `handleNavigate()` (NavView → `router.push`).

### Persistence and seed data

`app/data/seedData.ts` supplies `INITIAL_*` fallbacks (questions, courses, resources, plans, mock tests) plus `DEMO_STUDENT` / `DEMO_ADMIN`. Store keys are all `wbsat_*` (`STORAGE_KEYS` in `store.ts`). **Clearing the `wbsat_*` localStorage keys resets the app to seed state** — that's the reset procedure. `currentUser` defaults to `DEMO_STUDENT`; the Navbar role switcher swaps to `DEMO_ADMIN` (there is no real auth).

### Roles, staff, and permissions

`AdminPermission` and the `sub_admin` role are part of the data model, and
`app/features/admin/lib/permissions.ts` is the only thing that interprets them:

- `permissionsFor(user)` — a full `admin` **implicitly** has every permission (never read from
  `user.permissions`, so an admin cannot be edited into a lockout); a `sub_admin` gets exactly what
  was granted, defaulting to none; suspension revokes everything, admins included.
- `canOpenAdmin(user)` gates the console. `PAGE_PERMISSION` in `AdminPanel.tsx` maps each
  `AdminSubPage` to the permission it needs; pages a person cannot manage are **hidden** from the
  sidebar, and deep-linking one lands on Overview rather than erroring.
- Access and role editing is one full-route page, `/admin/people/[id]` (`PersonAccessEditor`),
  reached from both the Students and Team lists via `?from=`. It edits passes, per-course
  enrolment, role, and permissions. Changes **apply immediately** — there is no save step, so it
  uses `EditorTopBar` with a Done button rather than `EditorShell`'s submit.
- Self-edit guards: you cannot suspend yourself, change your own role, or alter your own permissions.
- A full pass implies the subject passes and all courses, so those toggles render locked-on rather
  than pretending to be independent.

### Topics

Topics are free text on a question, so the bank drifts into near-duplicates. `lib/topics.ts` backs
the Topics view and is pure — it returns the edits, and `store.applyTopicUpdates` writes them all in
one state update rather than one per question.

- **Renaming a topic onto an existing name *is* the merge.** There is no separate merge primitive
  for that case; `mergeTopics` only exists for collapsing several at once.
- Topics are scoped **per domain**: the same string under two domains is two topics.
- `findDuplicateTopics` normalises case, punctuation, and `&`/`and`, then suggests the most-used
  variant as the merge target — tie-broken toward the better-capitalised spelling, since
  "Linear Equations" should win over "linear equations".
- The 8 SAT domains stay fixed. They drive `domainBreakdown` and the 200–800 score estimates, so
  the taxonomy UI deliberately manages only the topic layer.

### Access control and payments

Three predicates in the store gate content: `hasAccessToQuestion`, `hasAccessToCourse`, `hasAccessToMockTest`. All three short-circuit `true` for `role === 'admin'` and for `access.fullPremium`. Payment flow is manual bKash/Nagad reference submission → `submitPayment` (status `pending`) → admin `verifyPayment` → `grantStudentAccess` expands the matching plan's `grants` into the user's `access` object.

### Mock test engine

Lives entirely in `app/features/mocktests/MockTestsHub.tsx`: module-by-module countdown, per-question `QuestionInteractionState` (selected answer, cross-outs, mark-for-review), advance-or-finalize on module submit. The attempt object round-trips through `store.saveMockTestAttempt`; `store.finalizeMockTest` recomputes the score summary using `estimateSATScore` in `app/lib/utils.ts`.

### Mock tests are modules, not metadata

A `MockTest` is only sittable if it has modules with questions in them: `MockTestsHub` reads
`modules[0].timeLimitMinutes` when starting an attempt. `app/lib/mockTests.ts` is the shared
authority on that — it lives in `app/lib/` rather than under `features/admin/` precisely because
both halves of the app need it:

- `deriveTotals` — `totalQuestions`/`totalTimeMinutes` are **computed from the modules**, never typed.
  Don't reintroduce them as inputs; the stored values would drift from the test students sit.
- `mockTestIssues` / `isPlayable` — `blocking` means a student cannot start it. The admin editor and
  list both surface these, and `MockTestsHub` disables its Start button on the same predicate, so a
  half-built test degrades to "Coming soon" instead of throwing.
- `standardSatModules` — the real Digital SAT shape (RW 1&2 at 32 min, Math 1&2 at 35 min = 134 min),
  offered as a one-click scaffold.

A module stores **copies** of its `Question` objects, not ids (the seed data does the same). That
makes a mock a stable snapshot, so editing a question later does not silently change a live exam.

Choosing a module's questions is a **full screen inside the editor**, not a modal:
`MockTestVisualEditor` swaps its whole body for `ModuleQuestionScreen` while `pickingModuleId` is
set. The component stays mounted, so an unsaved mock test is never at risk — that is why this is a
screen swap rather than a route. It offers "From existing" and "Create new"; the create tab renders
the same `EditorPanes` split (full form + live preview) as the standalone question editor, and
writes a real question to the bank via `onCreateQuestion` so it stays reusable. Saving keeps the
category and clears the content, so several questions can be authored in a row without leaving.
Its subject is locked to the module's section, since a question in the wrong section would not
appear in that module's pool.

`EditorTopBar` / `editorPrimaryButtonClass` in `EditorShell.tsx` are what keep that screen's chrome
identical to the route-level editors — use them for any new editor sub-screen instead of
re-authoring a header.

One layout trap worth knowing: a `<fieldset>` has `min-inline-size: min-content` in the UA
stylesheet and will not shrink, so a fieldset wrapping `truncate`d text overflows its container.
Any fieldset in a constrained width needs `min-w-0`.

### Authoring a question

The question form is defined **once**, in `components/questionForm.tsx`, and used in two places:
the full-page `QuestionVisualEditor`, and the compact create-new tab inside the mock test question
picker. Add or change a question field there, not in a caller.

- `useQuestionForm({ initialQuestion, allQuestions, lockedSubject, idScope })` owns the state,
  `buildPayload`, dirty tracking, code suggestion, and the datalist options.
- `<QuestionFormFields ctl variant="full" | "compact" />` renders the fields; `compact` drops what
  context already answers (subject, code, subtopic, source, status).
- `<QuestionPreview ctl />` is the shared student-facing render.
- `idScope` must differ per mounted instance — it namespaces the `<datalist>` ids and the
  `correct-answer` radio group name, which would otherwise collide across two forms on one page.

`allQuestions` is required, not incidental: it powers the next-free code suggestion
(`lib/questionCodes.ts`), the duplicate-code warning, and the `<datalist>` options for
topic/subtopic/source. Topic is free text, so those datalists are the only thing keeping the bank's
categories from drifting into near-duplicates.

The `Question` fields the editor writes that are easy to miss: `stimulus` (the passage
`QuestionCard` renders above the question — mandatory in practice for Reading & Writing),
`status` (`draft` questions still appear in the admin bank, badged, and are filterable), and
`source` (a student-facing filter in `PracticeHub`, so a new value there fragments that filter).

### The visual math editor

`app/components/VisualMathEditor.tsx` is the field used for question text, passages, and
explanations. It is a textarea over a `$…$` source document, plus a **symbol palette** whose button
faces are the real symbols rendered with KaTeX — clicking one splices LaTeX in at the caret.

- Palette contents live in `app/lib/mathSymbols.ts` (data only). `mathSymbols.test.ts` renders every
  entry through KaTeX with `throwOnError: true`, in three states: the button face, the snippet with
  slots filled, and the snippet with slots left empty. That check is what caught `\overparen` not
  existing in KaTeX 0.18 — **add symbols there, not inline in the component**, so they stay covered.
- Insertion logic is `app/lib/mathInsert.ts`. It is caret-aware: outside math a snippet gets wrapped
  in `$…$`, inside math it does not, and a non-empty selection is moved into the snippet's first
  `{}` slot. `$$` counts as one delimiter and `\$` is a literal.
- `{}` in an `insert` string marks a slot; the caret lands in the first one.

### Math rendering

Question and choice text carries LaTeX inline as `$...$` / `$$...$$`. `app/components/MathRenderer.tsx` regex-replaces those with KaTeX HTML and injects via `dangerouslySetInnerHTML` — content is admin-authored, never viewer input. `$$...$$` renders inline rather than display when surrounded by prose on the same line. Render math text through `MathRenderer`, never as raw string.

`Question` carries both `choices` and `answer_choices` holding the same data; `store.addQuestion` writes both. Read as `q.choices ?? q.answer_choices`.

### Theming and the shared visual scale

Three modes, applied as `body.mode-white | mode-warm | mode-dark` by an effect in the store; each class overrides CSS custom properties defined in `@layer base` in `app/globals.css` (`--background`, `--surface`, `--foreground`, `--border`, `--brand`, …). There is no Tailwind `dark:` variant in use. New surfaces should consume the tokens (`bg-[var(--surface)]`) — most existing components hardcode literal hexes, so theme switching currently only affects token-based surfaces. The admin console is deliberately light-only.

Both halves of the app share one literal palette and control scale, and matching it is what keeps
them looking like one product:

| Role | Value |
| --- | --- |
| Ink / muted text | `#071126` / `#58708A` |
| Border | `#E2E8F0` |
| Soft fills | `#F1F8F7` (brand tint), `#F8FBFB` (neutral) |
| Brand / hover / dark button | `#0D918A` / `#087C76` / `#080D21` |

Controls are `h-10` with `rounded-[10px]`; cards are `rounded-xl`/`rounded-2xl`; body copy is
`text-[12px]`/`text-[13px]`; headings are `font-bold` (not `font-black`), sentence case, never
uppercase-tracked. Numeric columns get `font-mono tabular-nums`.

### Admin building blocks

`AdminPanel` gates on `currentUser.role === 'admin'`, then renders one of `app/features/admin/views/*`.
Two files hold everything shared — **use them instead of hand-rolling markup**, since they are what
keeps the console consistent with the student app:

- `components/ui.tsx` — `AdminCard`, `Toolbar`, `SearchInput`, `FilterSelect`, `ResultCount`,
  `EmptyState`, `Pill`, `Button`, `IconAction`, `TableShell`/`Row`, `Modal`. `Modal` handles
  Escape and scrim-click closing; `IconAction` requires a `label`, so icon-only buttons are never
  unlabelled.
- `components/EditorShell.tsx` — `EditorShell`, `EditorPanes`, `EditorSection`, `Field`,
  `EditorNotFound`, and the `inputClass`/`textareaClass` strings.

Conventions these encode:

- **Page titles live in the header, not the view.** `SUB_PAGE_META` in `AdminHeader.tsx` is the single
  source of every admin page's title and description, and the header also owns the primary "New …"
  action. Views render only their toolbar and content.
- **Question categories come from `lib/groupQuestions.ts` and `lib/utils.ts`.** Domain ordering is
  College Board order, not alphabetical, and it lives in `ALL_DOMAINS`/`MATH_DOMAINS`/
  `READING_WRITING_DOMAINS` in `app/lib/utils.ts` — the bank's grouping, the editor's dropdowns, and
  the dashboard's `domainStats` all read from there, so don't re-declare a domain list.
  `groupQuestions` derives a question's subject from its **domain**, not its stored `subject` field,
  because imported rows can disagree and the domain is what score breakdowns key on.
- **The question bank is a two-level drill-down**, not an accordion or a rail:
  1. *Overview* — a grid of category cards per subject, each with its count, a proportional
     easy/medium/hard bar, and its topics. Empty domains get a card too
     (`groupQuestions(..., { includeEmptyDomains: true })`) so the first question in a gap can be
     added straight from it.
  2. *Category* — that category's questions as a dense hairline list.
  A search skips level 1 entirely and answers directly, because making someone guess which category
  holds their hit is the thing being avoided.
- **The open category lives in the URL** (`?tab=questions&category=<key>`), so browser back steps up
  a level and the editor can return the author to the category they were adding into. An unknown
  key falls back to the overview rather than an empty pane.
- **"Add" on a card seeds the editor.** `/admin/questions/new?domain=…` / `?topic=…` is read by the
  route page into `useQuestionForm`'s `seed`, which pre-fills the category. Keep new pre-fill going
  through `seed` rather than adding editor props.
- **Badge only the exceptions.** Free, published, and medium are the defaults, so they get no
  marker; premium gets a lock, a passage gets a document icon, draft/archived get a `Pill`.
  Difficulty uses `DifficultyDot`, not a filled pill, because every row has one and pills on every
  row are just chroma noise.
- **Row actions** are `[@media(hover:hover)]:opacity-0 group-hover:opacity-100 focus-within:opacity-100`
  — quiet on pointer devices, always visible on touch. Don't use a bare `opacity-0`.
- **Toolbar controls are `h-9` / `rounded-lg`** (`SearchInput`, `FilterSelect`, `Button size="sm"`);
  form and dialog controls stay `h-10`. Mixing the two in one row is the tell that something
  bypassed the primitives.
- **Every list needs both empty states** — "nothing exists yet" (offer the create action) and
  "nothing matches the filter" (offer to clear it) — plus a `ResultCount`.
- **Editors are real forms.** The Save button lives in `EditorShell` and reaches the form via
  `type="submit" form={formId}`, so `required`/`type="url"`/`min` do the validating. Wire a new
  editor by giving its `<form>` an `id` and passing the same string as `formId`; do not add a
  click handler that bypasses validation.
- **New records start blank.** Placeholders carry the guidance. Pre-filling sample content produced
  junk records that had to be cleared field by field.
- **Track `isDirty`** through a single `update(patch)` helper over one form-state object and pass it to
  `EditorShell`, which then guards the back link and tab close.
- Destructive or access-granting actions confirm with the record's name in the message; granting does not.

## Known misleading names and dead code

- `app/components/DesmosModal.tsx` — a mock calculator UI with a hardcoded point table, not the Desmos API.
- `bg-app-canvas` in `AppShell.tsx` has no matching definition — it does nothing.
- `.env` holds `MONGODB_URI` and `DESMOS_KEY`; neither is referenced anywhere (no `process.env` usage in `app/`). `metadata.json` is likewise unused by Next.js.
- Next 16 regenerates a default `CLAUDE.md` if the file is missing (`agentRules` in `next.config.ts`). Edit this file rather than deleting it.

## Conventions

- `@/*` maps to the repo root in `tsconfig.json`, but every existing import is relative — match the surrounding file.
- Class merging goes through `cn()` in `app/lib/utils.ts` (clsx + tailwind-merge).
- Icons from `lucide-react`; all types live in the single `app/types.ts`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
