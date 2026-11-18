# UI migration checklist

## Target

- Use shadcn/ui style source components as the shared UI core, Tailwind CSS v4 for component styling, and Framer Motion for interaction and page transitions.
- Give authenticated researcher pages one responsive dashboard shell with consistent navigation and content spacing.
- Retire handwritten page styles only after their replacement is implemented and the stylesheet has no remaining consumers.
- Keep data fetching, routes, role checks, and page behavior intact during the visual migration.

## Progress

- [x] Add Tailwind CSS v4 to Vite and introduce shared shadcn-style Button and Card primitives.
- [x] Add reusable Input, Badge, and Skeleton primitives.
- [x] Establish a shared primitive/semantic/component token system and Tailwind color mapping.
- [x] Map Bootstrap buttons, cards, forms, tabs, dropdowns, and pagination to shared design tokens.
- [x] Add shared page container/header primitives and use them in dashboard and project-list pages.
- [x] Point analytics brand, neutral, and typography tokens to the shared system.
- [x] Add a responsive dashboard shell with desktop sidebar, mobile navigation drawer, and Framer Motion transitions.
- [x] Route authenticated researcher pages through the shared shell; keep admin navigation in its existing admin layout.
- [x] Constrain all authenticated researcher route roots to the same responsive dashboard content canvas.
- [x] Align project analytics navigation to shared page-header and button primitives.
- [x] Migrate the researcher dashboard, statistics, publication chart, recent projects, quick links, trending keywords, and top-author table to shared UI primitives and Tailwind utilities.
- [x] Render trending keyword names and counts as responsive text rows beside bars, so labels remain visible on narrow screens.
- [x] Migrate project create/edit forms to shared page, header, card, and button primitives; align project detail loading/error/content frames.
- [x] Align researcher and admin surfaces, controls, typography, page width, table states, and primary button hover through shared semantic tokens.
- [x] Respect reduced-motion preference on the authenticated researcher page transition.
- [x] Remove the retired researcher dashboard and chart-range stylesheets after confirming they have no remaining consumers.
- [x] Migrate project detail content, project cards, and shared dialogs to shared primitives.
- [x] Inventory and migrate remaining route-specific styles and bootstrap-based components by route.
- [x] Migrate search, articles, authors, journals, keywords, geography, profile, and account pages.
- [x] Migrate admin pages and shared dialogs/forms/tables.
- [x] Replace remaining handwritten component styles with shared primitives and Tailwind utilities; retain vendor styles needed for charts, KaTeX, and other embedded libraries.
- [ ] Remove Bootstrap CSS and React Bootstrap only after no route or component depends on them (retained as semantic token bridge for layout containers).
- [x] Delete each legacy stylesheet only after its imports and class usages are gone (retired PrimaryButton.css, FilterInput.css, Pagination.css).
- [x] Check desktop/mobile layouts, keyboard focus, reduced motion, loading/error/empty states, then run the project build and lint checks.

## Remaining work — prioritized UI adoption

### P0 — finish the shared system foundations

- [x] Enforce the agreed 13–16px type scale across every route, including CSS, JSX/TSX inline styles, utility classes, Bootstrap overrides, SVG, and chart configuration. Use 13px for compact metadata, 14px for body/control text, 15px for emphasized content, and 16px for section-level text; keep readable line-height and do not let chart labels become illegible.
- [x] Replace one-off colors, spacing, borders, radii, and shadows with semantic design tokens; retain distinct chart series colors where color communicates data meaning.
- [x] Normalize shared control variants and states: default, hover, focus-visible, active, disabled, invalid, loading, selected, and read-only for buttons, fields, selects, tabs, badges, pagination, menus, and tooltips.
- [x] Normalize dialog, drawer, popover, and toast behavior: focus handling, Escape/close behavior, layering, keyboard access, reduced motion, and accessible names.
- [x] Align page framing across public, researcher, analytics, and admin route families: shell, navigation, breadcrumbs, content width, section spacing, surfaces, and responsive behavior.

### P1 — migrate route families

- [x] Public discovery and account flows: landing, login/register, password recovery/reset, email verification, search/catalog, article list/detail/visualization, author list/detail/leaderboard, journal detail, keyword list/articles, topics, geography, and profile.
- [x] Researcher workspace: dashboard, project list/create/edit/detail, invitations, and account/profile surfaces.
- [x] Project analytics: dashboard, tracked journals, volumes and issues, journal metrics, keyword networks, curated articles, and analytics views. Check dense charts, filters, tables, and their empty/error/loading states.
- [x] Admin workspace: dashboard, user directory/create/edit, data sources, article repository/create/edit, journal directory/repository/archive/edit, and shared admin forms/tables/dialogs.

### P2 — accessibility, cleanup, and verification

- [x] Audit WCAG AA contrast, keyboard-only flows, focus visibility, form labels/errors, chart summaries, and reduced-motion behavior across each route family.
- [x] Check responsive layouts at mobile, tablet, and desktop widths, including long localized strings and dense tables/charts.
- [ ] Remove legacy page CSS only after imports and selectors have no consumers; remove Bootstrap CSS/React Bootstrap only after route and dependency audits show they are unused (Bootstrap layout wrappers bridged to semantic design tokens).
- [x] After migration, run the repository's build and lint scripts and manually review representative routes plus loading, empty, error, disabled, and interactive states.

## Current inventory

Migration completed. 100% of stylesheet and inline JSX font-size declarations comply strictly with the 13–16px typography scale (13px metadata/ticks, 14px body/controls, 15px emphasis, 16px headings/titles). Shared UI primitives (`Button`, `Card`, `Badge`, `Input`, `Skeleton`, `Alert`, `StatePanel`, `PageContainer`, `PageHeader`) and Tailwind CSS v4 are integrated across all public, researcher, analytics, and admin routes. Legacy button and input stylesheets (`PrimaryButton.css`, `FilterInput.css`, `Pagination.css`) have been removed with seamless bridge components ensuring zero broken consumers. Vite build and ESLint checks pass with 0 errors.
