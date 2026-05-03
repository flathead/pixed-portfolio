# pixed-portfolio

Personal portfolio for a PHP developer — pixel-art aesthetic, storytelling-driven.

**Live:** https://flathead.is-a.dev (after M1 completion)
**Stack:** Astro 6 · Svelte islands · MDX · SCSS · Sveltia CMS · Cloudflare Pages

## Status

This repository is the production codebase. It replaces an earlier prototyping
repository (`pixed_dev_design`) where the design system and visual direction
were explored. Migration follows the plan in
[`docs/superpowers/plans/`](docs/superpowers/plans/) milestone by milestone.

## Documentation

- **Design spec:** [`docs/superpowers/specs/2026-04-25-astro-migration-design.md`](docs/superpowers/specs/2026-04-25-astro-migration-design.md)
- **M1 Foundation plan:** [`docs/superpowers/plans/2026-04-25-m1-foundation.md`](docs/superpowers/plans/2026-04-25-m1-foundation.md)

## Versioning

The project uses `package.json` as the single source of truth for the site
version. Do not duplicate the version in docs, source files, or build config.

Use SemVer as a release marker for the public state of the portfolio:

- `patch` for bug fixes, small visual/content edits, SEO fixes, dependency
  updates, and build fixes without visible feature changes.
- `minor` for new pages, sections, projects, UI features, or meaningful content
  model improvements.
- `major` for redesigns, route/content structure changes, or other changes that
  intentionally break the previous public shape of the site.

Useful release commands:

```bash
pnpm release:patch
pnpm release:minor
pnpm release:major
```

These commands update `package.json`, create a release commit, and create a git
tag such as `v0.1.0`. Push the release with:

```bash
git push --follow-tags
```

Suggested milestone path:

- `0.0.1` for the current early build.
- `0.1.0` for the first complete public portfolio release.
- `1.0.0` when routes, design system, and content model are stable enough to be
  treated as the baseline.

## Local development

Will be filled out at the end of M1, after the Astro skeleton lands.
