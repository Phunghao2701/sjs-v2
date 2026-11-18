# Trending System Design System

## Product UI

Research and administration dashboard for publication discovery, project tracking, journal analytics, and data management. Use a restrained, task-first interface with consistent researcher and admin navigation.

## Color

- Primary: `#0071BC` for primary actions, selected navigation, links, and focus.
- Primary hover: `#005A96`.
- Primary subtle: `#E6F3FA`.
- App background: `#F8FAFC`.
- Surface: `#FFFFFF`.
- Muted surface: `#F2F4F7`.
- Foreground: `#0D1B1C`.
- Muted foreground: `#475467`.
- Border: `#E4E7EC`.
- Success, warning, and danger use semantic green, amber, and red tokens. Chart series may use additional data colors; do not map those semantic colors to interface actions.

The source of truth is `src/shared/ui/theme.css`. Legacy analytics aliases in `src/trendingApp/shared/styles/tokens.css` point to the shared semantic tokens.

## Typography

- Use the existing Roboto/system sans stack for UI and data.
- Keep interface text between 13px and 16px: 13px metadata, 14px body and controls, 15px emphasized text, and 16px headings/page titles.
- Use readable line height and wrap long titles instead of clipping them.

## Layout

- Researcher routes use the shared responsive `DashboardShell` with a fixed desktop sidebar and mobile navigation drawer.
- Admin routes retain their admin-specific sidebar and header while sharing the same content width, spacing, surface, and control tokens.
- Center page content with a maximum width of 1600px; use narrower widths for forms and focused detail views.
- Prefer clear sections and restrained surface borders over nested decorative cards.

## Components

- Shared source components live in `src/shared/ui`: Button, Card, Input, Badge, Skeleton, PageContainer, and PageHeader.
- Use shadcn-style source components and Tailwind CSS v4 utilities for new interface work. Keep React Bootstrap only where legacy routes still require it.
- Keep controls at least 40px high where practical; provide hover, focus-visible, active, disabled, loading, error, and empty states.
- Use shared border, radius, and focus tokens. Avoid hard-coded theme colors in new components.

## Motion

- Use Framer Motion for meaningful navigation and state transitions, generally 150–250ms.
- Respect `prefers-reduced-motion`; avoid decorative entrance sequences.

## Data Visualization

- Use the blue brand color for primary series and selection, while retaining distinct semantic colors where series must be compared.
- Keep category labels, axis labels, legends, and tooltips visible at responsive widths.
- Empty and error chart states must explain the situation without collapsing the chart's layout.

## Shared interaction and data states

Shared controls and feedback use this state contract. Feature pages may provide domain-specific copy, while preserving the same interaction and accessibility behavior.

| Component/state | Visual behavior | Semantics and interaction |
| --- | --- | --- |
| Button: default | Primary blue, neutral, outline, or ghost variant | Native button semantics; visible keyboard focus |
| Button: hover / active | Token-based hover color; subtle pressed offset | Hover is not the only action cue; active responds to pointer and keyboard |
| Button: focus-visible | 2px high-contrast blue outline with offset | Keyboard focus remains visible |
| Button: disabled | Reduced contrast and no pointer interaction | Native `disabled`; unavailable actions cannot be triggered |
| Button: loading | Inline spinner and optional loading label | `aria-busy`; native button disabled while work is pending |
| Input: default / focus | Surface and border tokens; blue focus ring | Associated visible label and keyboard focus indicator |
| Input: invalid | Danger border and danger focus ring | `aria-invalid=true`, error linked through `aria-describedby` |
| Input: hint / error | Muted hint; danger validation text | Hint and error IDs are announced with the control; error uses alert semantics |
| Badge: neutral / info / success / warning / destructive | Semantic token palette | Non-interactive by default; no false keyboard focus treatment |
| Alert: info / success / warning | Semantic border and subtle background | Polite live region; title and description supported |
| Alert: destructive | Danger palette | Assertive `alert` live region |
| Loading skeleton | Neutral animated placeholder | Decorative skeleton is hidden from assistive technology; async panels pair it with a polite status label |
| Empty state | Neutral icon, title, explanation, optional action | Polite status region; action is keyboard accessible |
| Error state | Danger icon, explanation, optional retry | Assertive alert region; retry is a real button and may enter loading/disabled state |
| Toast: info / success / warning | Semantic token colors | Polite status message and labeled dismiss action |
| Toast: error | Danger token colors | Assertive alert message and labeled dismiss action |
| Navigation drawer | Overlay and slide transition | Dialog semantics, Escape close, focus entry/trap/restore, reduced-motion support |
| Selection: selected / checked / expanded | Blue subtle fill, border, or indicator; consistent selected nav style | `aria-current`, `aria-selected`, `aria-pressed`, or native checked state matches the actual control pattern |
| Table/list: loading | Preserve column and row geometry with skeleton rows | Announce loading politely; decorative skeleton cells are hidden |
| Table/list: empty / filtered-empty | Explain no records or no filter matches; offer clear filters when available | Empty state is distinguishable from loading and request failure |
| Table/list: request error | Keep page context and provide a retry action | Alert semantics; retry is keyboard operable and reports its busy state |
| Async content: refreshing | Keep existing content visible where safe and indicate refresh activity | `aria-busy=true` on the updating region; avoid replacing useful content with a blank panel |
| Async content: success | Show updated content or an action confirmation | Use a polite status/toast only when the completion needs user awareness |
| Dialog: open / close | Modal backdrop and panel; reduced-motion-aware transition | Dialog label, focus moves inside, Tab stays in dialog, Escape closes, focus returns to trigger |
| Chart: loading / empty / error / data | Keep chart frame and show a status-specific skeleton, explanation, or visualization | Loading and errors are announced; charts retain text summaries/labels for interpretation |

Reduced motion shortens CSS animation and Framer Motion transitions. Async pages should preserve their content frame while switching among loading, error, empty, and populated states.
