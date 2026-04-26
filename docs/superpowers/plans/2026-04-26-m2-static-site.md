# Pixed Portfolio Migration — Milestone 2: Static Site

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Превратить заскаффолженный пустой Astro-сайт в полноценную статическую вёрстку портфолио. Все 6 страниц (/, /about/, /projects/, /projects/[slug]/, /contact/, /404) рендерят реальный контент из collections в единой пиксель-арт эстетике. Никакого интерактива и backend — это M3/M4. После M2 сайт «completed» по правилам is-a.dev и можно подавать PR на custom domain.

**Architecture:** Layered: `BaseLayout` (M1, html-skeleton) ⇒ `MainLayout` (header + slot + footer) ⇒ `pages/*.astro` (тонкие маршруты, ~30 строк) ⇒ `sections/*` (композиции конкретных страниц) ⇒ `ui/*` (атомарные кирпичики). Все стили — SCSS, токены и миксины из M1, scoped в `<style>` каждого компонента. Никакой client-side JS в M2 — только CSS-hover и анимации `prefers-reduced-motion`-aware. Любые «острова» — placeholder без `client:*`.

**Tech Stack:** Astro 6 · MDX · SCSS · Astro Image · Content Collections (Layer API)

**Specs:** [`docs/superpowers/specs/2026-04-25-astro-migration-design.md`](../specs/2026-04-25-astro-migration-design.md) — sections 4 (что keep/cut), 5.1 (URL карта), 5.3 (компоненты), 5.4 (острова — что плейсхолдерить), 5.6 (форма — статичный UI), 5.8 (i18n switcher — скрыт)

**Predecessor:** M1 Foundation done at commit `6379b2c`. Coming live on `https://pixed-portfolio.pages.dev/`.

**Locked decisions:**

| Тема | Решение |
|---|---|
| Layout pattern | `BaseLayout` (M1) → `MainLayout` (новый M2) → `pages/*` |
| Header | sticky top, минимальный: `[ flathead.dev ]` слева, nav посередине (`Главная / Проекты / О себе / Контакт`), справа: lang-switcher (скрыт CSS-переменной из M1) + gear-icon (placeholder без логики) |
| Footer | одна строка: copyright + GitHub + Telegram + email |
| Theme tweaker (M2) | placeholder: gear-icon `<button>` без поведения. Реальная логика — M3 как Svelte island |
| Lang switcher (M2) | placeholder: `[RU \| EN]` button. Видимость через `--show-lang-switcher: 0` (из M1, остаётся скрыт) |
| Контактная форма | статичный 5-шаговый визард на чистом HTML+CSS. Все state-changes через `<details>` или radio-buttons. На submit — `<a href="mailto:...">` или alert. Реальная отправка — M4 как Svelte island |
| View Transitions | НЕТ в M2 (требует `<ClientRouter />` — это M3) |
| Изображения | `astro:assets` `<Image />` для всех cover'ов (auto AVIF/WebP, lazy by default) |
| Анимации | только CSS-hover/transitions из миксинов M1 (pixel-card, pixel-button). Никаких scroll-driven, никаких stagger — это M3 |
| Cursor trail / scanlines / grid-bg / boot-screen | НЕ имплементируем (cut по spec секция 4) |
| HP-bars скиллов | статичная заливка `--fill: 92%` через inline-style. Анимация-on-scroll — M3 |
| `/dev/components/` showcase | оставляем доступным в проде. Удаляется в M5 polishing |
| `<ContactForm />` action | placeholder `<form>` без `action`/JS — submit ничего не делает или открывает mailto |
| 404 страница | кастомная пиксельная, использует `MainLayout` |
| EN routes | НЕ создаём в M2 — оставляем костяк i18n из M1 как есть, switcher скрыт |

**Out of scope (M3/M4/M5):**
- Animation islands (typewriter, hp-bars-on-scroll, matrix rain, easter eggs, glitch logo, theme tweaker logic)
- Contact form submission (Cloudflare Pages Functions, Telegram adapter, Turnstile, rate limit)
- Sveltia CMS (`/admin/`, OAuth Worker, editor_components)
- Real EN translations (placeholders only)
- Scroll-driven, View Transitions, parallax
- Lighthouse 95+ audit (M5)

---

## File Structure

После завершения M2 структура `src/` выглядит так:

```
src/
├── content/                       # без изменений (из M1)
├── content.config.ts              # без изменений (из M1)
├── layouts/
│   ├── BaseLayout.astro           # без изменений (из M1)
│   └── MainLayout.astro           # NEW: BaseLayout + Header + slot + Footer
├── components/
│   ├── ui/
│   │   ├── PixelCard.astro        # NEW: универсальная карточка
│   │   ├── PixelButton.astro      # NEW: [BRACKET] кнопка / ссылка
│   │   ├── PixelDivider.astro     # NEW: 4px coloured divider
│   │   ├── TechBadge.astro        # NEW: тег технологии (lowercase)
│   │   ├── ComplexityStars.astro  # NEW: ★★★☆☆ rating 1-5
│   │   ├── HpBar.astro            # NEW: статический HP/XP-бар
│   │   └── QuestLog.astro         # NEW: блок проблема/исход для проектов
│   ├── nav/
│   │   ├── Header.astro           # NEW: sticky шапка
│   │   ├── Footer.astro           # NEW: минимальный футер
│   │   ├── LangSwitcher.astro     # NEW: placeholder switcher
│   │   └── ThemeTweakerBtn.astro  # NEW: gear-icon placeholder
│   ├── sections/
│   │   ├── HeroCharacter.astro    # NEW: character sheet на главной
│   │   ├── ProjectsGrid.astro     # NEW: сетка карточек проектов
│   │   ├── SkillsTree.astro       # NEW: список скиллов с HP-bars
│   │   ├── Timeline.astro         # NEW: таймлайн событий
│   │   └── ContactWizard.astro    # NEW: статичный 5-шаговый визард
│   └── mdx/
│       ├── Screenshot.astro       # NEW: оптимизированное изображение в MDX
│       ├── Spoiler.astro          # NEW: <details>-обёртка
│       ├── Callout.astro          # NEW: блок info/warning/success
│       ├── Quest.astro            # NEW: блок-метка квеста
│       └── TechBadge.astro        # NEW: реэкспорт ui/TechBadge для MDX
├── pages/
│   ├── index.astro                # MODIFY: replace M1 health-check with HomePage
│   ├── about.astro                # NEW
│   ├── contact.astro              # NEW
│   ├── 404.astro                  # NEW
│   ├── projects/
│   │   ├── index.astro            # NEW
│   │   └── [slug].astro           # NEW
│   └── dev/
│       └── components.astro       # NEW: showcase всех ui/sections
├── lib/
│   ├── fonts.ts                   # без изменений (из M1)
│   ├── i18n.ts                    # без изменений (из M1)
│   └── site-config.ts             # NEW: SITE-константы (urls, email, telegram, github)
├── styles/                        # без изменений (из M1)
└── i18n/                          # без изменений (из M1)
```

**Новые ключевые файлы и их единственная ответственность:**
- `MainLayout.astro` — оборачивает страницы Header'ом и Footer'ом, ничего не знает о контенте.
- `ui/*` — чистая разметка + scoped SCSS. Принимают `slot` и минимум props (`href`, `accent`, `value`).
- `sections/*` — собирают `ui/*` в крупные блоки, принимают данные пропсом, не вызывают `getCollection` сами.
- `mdx/*` — компоненты для тела MDX (`Screenshot`, `Spoiler`, ...). Регистрируются глобально через `mdx.components` в `astro.config.mjs`.
- `pages/*` — тонкие маршруты, ~30 строк: layout + `getCollection` + props в sections.
- `site-config.ts` — single source of truth для адресов, ссылок, email.

---

## Phase 3 — UI Atoms, MDX components, Dev Showcase

### Task 3.1: site-config + MainLayout

**Files:**
- Create: `src/lib/site-config.ts`
- Create: `src/layouts/MainLayout.astro`
- Create: `src/components/nav/Header.astro` (placeholder с одной ссылкой — расширим в Task 4.1)
- Create: `src/components/nav/Footer.astro` (placeholder — расширим в Task 4.2)

- [ ] **Step 1: Создать `src/lib/site-config.ts`**

```ts
/**
 * Single source of truth for site-wide constants:
 * URLs, contact handles, social links.
 *
 * Update here, not inline in templates.
 */
export const SITE = {
  url: 'https://flathead.is-a.dev',
  pagesDevUrl: 'https://pixed-portfolio.pages.dev',
  title: 'flathead — PHP-разработчик',
  description: 'Портфолио PHP-разработчика flathead. Pixel-art, сторителлинг, реальные проекты.',
  author: 'flathead',
  copyrightStart: 2024,
} as const;

export const CONTACT = {
  email: 'basicjispasedbs@outlook.com',
  telegram: 'https://t.me/flathead_dev',
  github: 'https://github.com/flathead',
  repo: 'https://github.com/flathead/pixed-portfolio',
} as const;

export const NAV_LINKS = [
  { href: '/', label: 'Главная' },
  { href: '/projects/', label: 'Проекты' },
  { href: '/about/', label: 'О себе' },
  { href: '/contact/', label: 'Контакт' },
] as const;
```

- [ ] **Step 2: Создать минимальный `src/components/nav/Header.astro`**

```astro
---
import { SITE } from '../../lib/site-config';
---

<header class="header">
  <div class="container header__inner">
    <a href="/" class="header__brand">[ {SITE.author}.dev ]</a>
  </div>
</header>

<style lang="scss">
  @use '../../styles/tokens' as *;

  .header {
    position: sticky;
    top: 0;
    z-index: 50;
    background: var(--bg);
    border-bottom: 4px solid var(--border);
  }

  .header__inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: $space-3 0;
  }

  .header__brand {
    font-family: var(--font-display);
    font-size: $text-xs;
    color: var(--green);
    letter-spacing: $tracking-pixel;
    text-transform: uppercase;
    text-decoration: none;
  }
</style>
```

- [ ] **Step 3: Создать минимальный `src/components/nav/Footer.astro`**

```astro
---
import { SITE, CONTACT } from '../../lib/site-config';
const year = new Date().getFullYear();
---

<footer class="footer">
  <div class="container footer__inner">
    <span>© {SITE.copyrightStart}–{year} {SITE.author}</span>
    <span class="footer__links">
      <a href={CONTACT.github}>github</a>
      <span aria-hidden="true">·</span>
      <a href={CONTACT.telegram}>telegram</a>
      <span aria-hidden="true">·</span>
      <a href={`mailto:${CONTACT.email}`}>email</a>
    </span>
  </div>
</footer>

<style lang="scss">
  @use '../../styles/tokens' as *;

  .footer {
    margin-top: $space-9;
    border-top: 4px solid var(--border);
  }

  .footer__inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: $space-5 0;
    font-family: var(--font-code);
    font-size: $text-sm;
    color: var(--text-muted);
  }

  .footer__links {
    display: inline-flex;
    gap: $space-2;
  }
</style>
```

- [ ] **Step 4: Создать `src/layouts/MainLayout.astro`**

```astro
---
import BaseLayout from './BaseLayout.astro';
import Header from '../components/nav/Header.astro';
import Footer from '../components/nav/Footer.astro';

interface Props {
  title: string;
  description?: string;
  ogImage?: string;
}

const { title, description, ogImage } = Astro.props;
---

<BaseLayout title={title} description={description} ogImage={ogImage}>
  <Header />
  <main class="page">
    <slot />
  </main>
  <Footer />
</BaseLayout>

<style lang="scss">
  @use '../styles/tokens' as *;

  .page {
    min-height: calc(100vh - 200px);
    padding: $space-6 0 $space-9;
  }
</style>
```

- [ ] **Step 5: Прогнать `pnpm check`**

Run: `pnpm check`
Expected: `0 errors, 0 warnings`.

- [ ] **Step 6: Прогнать `pnpm build`**

Run: `pnpm build`
Expected: успех. `dist/index.html` есть (ещё с M1 health-check, но без MainLayout — эта замена в Task 4.7).

- [ ] **Step 7: Коммит**

```bash
git add src/lib/site-config.ts src/layouts/MainLayout.astro src/components/nav/
git commit -m "feat(layout): site-config, MainLayout, Header/Footer placeholders"
```

---

### Task 3.2: PixelCard и PixelDivider

**Files:**
- Create: `src/components/ui/PixelCard.astro`
- Create: `src/components/ui/PixelDivider.astro`

- [ ] **Step 1: Создать `src/components/ui/PixelCard.astro`**

```astro
---
interface Props {
  href?: string;
  accent?: 'border' | 'green' | 'cyan' | 'magenta' | 'yellow' | 'purple';
  class?: string;
}

const { href, accent = 'border', class: className } = Astro.props;
const Tag = href ? 'a' : 'div';
const accentVar = `var(--${accent === 'border' ? 'border' : accent})`;
---

<Tag
  href={href}
  class:list={['pixel-card', `pixel-card--${accent}`, className]}
  style={`--card-accent: ${accentVar};`}
>
  <slot />
</Tag>

<style lang="scss">
  @use '../../styles/tokens' as *;
  @use '../../styles/mixins' as m;

  .pixel-card {
    @include m.pixel-card;
    display: block;
    padding: $card-pad;
    color: inherit;
    text-decoration: none;
    border-color: var(--card-accent);
    box-shadow: $shadow-pixel-md var(--card-accent);

    &:hover {
      border-color: var(--cyan);
      box-shadow: $shadow-pixel-lg var(--cyan);
    }
  }
</style>
```

- [ ] **Step 2: Создать `src/components/ui/PixelDivider.astro`**

```astro
---
interface Props {
  accent?: 'border' | 'green' | 'cyan' | 'magenta' | 'yellow' | 'purple';
  spacing?: 'sm' | 'md' | 'lg';
}

const { accent = 'border', spacing = 'md' } = Astro.props;
---

<hr class:list={['pixel-divider', `pixel-divider--${spacing}`]} data-accent={accent} />

<style lang="scss">
  @use '../../styles/tokens' as *;

  .pixel-divider {
    border: none;
    border-top: 4px solid var(--border);

    &[data-accent='green'] {
      border-color: var(--green);
    }
    &[data-accent='cyan'] {
      border-color: var(--cyan);
    }
    &[data-accent='magenta'] {
      border-color: var(--magenta);
    }
    &[data-accent='yellow'] {
      border-color: var(--yellow);
    }
    &[data-accent='purple'] {
      border-color: var(--purple);
    }

    &--sm {
      margin: $space-5 0;
    }
    &--md {
      margin: $space-7 0;
    }
    &--lg {
      margin: $space-9 0;
    }
  }
</style>
```

- [ ] **Step 3: `pnpm check`**

Run: `pnpm check`
Expected: 0 errors.

- [ ] **Step 4: Коммит**

```bash
git add src/components/ui/PixelCard.astro src/components/ui/PixelDivider.astro
git commit -m "feat(ui): add PixelCard and PixelDivider atoms"
```

---

### Task 3.3: PixelButton

**Files:**
- Create: `src/components/ui/PixelButton.astro`

- [ ] **Step 1: Создать `src/components/ui/PixelButton.astro`**

```astro
---
interface Props {
  href?: string;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  class?: string;
}

const {
  href,
  type = 'button',
  variant = 'primary',
  disabled = false,
  class: className,
} = Astro.props;

const Tag = href ? 'a' : 'button';
const tagProps = href ? { href } : { type, disabled };
---

<Tag
  {...tagProps}
  class:list={['pixel-btn', `pixel-btn--${variant}`, className]}
>
  <slot />
</Tag>

<style lang="scss">
  @use '../../styles/tokens' as *;
  @use '../../styles/mixins' as m;

  .pixel-btn {
    @include m.pixel-button($color-green);
    border: none;
    background: transparent;
    cursor: pointer;
    font-family: var(--font-display);
    text-decoration: none;
    display: inline-block;

    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
      pointer-events: none;
    }

    &--secondary {
      @include m.pixel-button($color-cyan);
    }

    &--danger {
      @include m.pixel-button($color-magenta);
    }
  }
</style>
```

- [ ] **Step 2: `pnpm check`**

Expected: 0 errors.

- [ ] **Step 3: Коммит**

```bash
git add src/components/ui/PixelButton.astro
git commit -m "feat(ui): add PixelButton atom (link/button polymorphic)"
```

---

### Task 3.4: TechBadge и ComplexityStars

**Files:**
- Create: `src/components/ui/TechBadge.astro`
- Create: `src/components/ui/ComplexityStars.astro`

- [ ] **Step 1: `src/components/ui/TechBadge.astro`**

```astro
---
interface Props {
  accent?: 'purple' | 'green' | 'cyan' | 'yellow' | 'magenta';
}

const { accent = 'purple' } = Astro.props;
---

<span class="tech-badge" data-accent={accent}>
  <slot />
</span>

<style lang="scss">
  @use '../../styles/tokens' as *;
  @use '../../styles/mixins' as m;

  .tech-badge {
    @include m.pixel-tag($color-purple);

    &[data-accent='green'] {
      color: var(--green);
      border-color: var(--green);
    }
    &[data-accent='cyan'] {
      color: var(--cyan);
      border-color: var(--cyan);
    }
    &[data-accent='yellow'] {
      color: var(--yellow);
      border-color: var(--yellow);
    }
    &[data-accent='magenta'] {
      color: var(--magenta);
      border-color: var(--magenta);
    }
  }
</style>
```

- [ ] **Step 2: `src/components/ui/ComplexityStars.astro`**

```astro
---
interface Props {
  value: number; // 1..5
  max?: number;
  label?: string;
}

const { value, max = 5, label = 'Сложность' } = Astro.props;
const filled = Math.max(0, Math.min(max, Math.round(value)));
const empty = max - filled;
---

<span class="stars" aria-label={`${label}: ${filled} из ${max}`}>
  <span class="stars__label">{label}:</span>
  <span class="stars__row" aria-hidden="true">
    {Array.from({ length: filled }).map(() => <span class="stars__filled">★</span>)}
    {Array.from({ length: empty }).map(() => <span class="stars__empty">☆</span>)}
  </span>
</span>

<style lang="scss">
  @use '../../styles/tokens' as *;

  .stars {
    display: inline-flex;
    align-items: center;
    gap: $space-2;
    font-family: var(--font-code);
    font-size: $text-sm;
  }

  .stars__label {
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: $tracking-wide;
  }

  .stars__row {
    letter-spacing: 4px;
    color: var(--yellow);
  }

  .stars__filled {
    color: var(--yellow);
  }

  .stars__empty {
    color: var(--border-bright);
  }
</style>
```

- [ ] **Step 3: `pnpm check`**

Expected: 0 errors.

- [ ] **Step 4: Коммит**

```bash
git add src/components/ui/TechBadge.astro src/components/ui/ComplexityStars.astro
git commit -m "feat(ui): add TechBadge and ComplexityStars atoms"
```

---

### Task 3.5: HpBar и QuestLog

**Files:**
- Create: `src/components/ui/HpBar.astro`
- Create: `src/components/ui/QuestLog.astro`

- [ ] **Step 1: `src/components/ui/HpBar.astro`**

```astro
---
interface Props {
  label: string;
  value: number; // 0..100
  color?: 'green' | 'cyan' | 'magenta' | 'yellow' | 'purple';
}

const { label, value, color = 'green' } = Astro.props;
const clamped = Math.max(0, Math.min(100, Math.round(value)));
---

<div class="hp-bar" data-color={color}>
  <div class="hp-bar__head">
    <span class="hp-bar__label">{label}</span>
    <span class="hp-bar__value">{clamped}/100</span>
  </div>
  <div class="hp-bar__track" style={`--fill: ${clamped}%;`}>
    <div class="hp-bar__fill"></div>
  </div>
</div>

<style lang="scss">
  @use '../../styles/tokens' as *;

  .hp-bar {
    display: flex;
    flex-direction: column;
    gap: $space-2;
  }

  .hp-bar__head {
    display: flex;
    justify-content: space-between;
    font-family: var(--font-code);
    font-size: $text-sm;
  }

  .hp-bar__label {
    color: var(--text);
    text-transform: uppercase;
    letter-spacing: $tracking-pixel;
  }

  .hp-bar__value {
    color: var(--text-muted);
  }

  .hp-bar__track {
    position: relative;
    width: 100%;
    height: 16px;
    background: var(--surface-2);
    border: 2px solid var(--border);
  }

  .hp-bar__fill {
    width: var(--fill, 0%);
    height: 100%;
    background: var(--green);
    transition: width 800ms steps(8);
  }

  .hp-bar[data-color='cyan'] .hp-bar__fill {
    background: var(--cyan);
  }
  .hp-bar[data-color='magenta'] .hp-bar__fill {
    background: var(--magenta);
  }
  .hp-bar[data-color='yellow'] .hp-bar__fill {
    background: var(--yellow);
  }
  .hp-bar[data-color='purple'] .hp-bar__fill {
    background: var(--purple);
  }
</style>
```

- [ ] **Step 2: `src/components/ui/QuestLog.astro`**

```astro
---
interface Props {
  problem: string;
  stack?: readonly string[];
  outcome: string;
  learned?: string;
}

const { problem, stack, outcome, learned } = Astro.props;
---

<aside class="quest-log" aria-label="Quest log">
  <header class="quest-log__title">// QUEST LOG</header>

  <div class="quest-log__row">
    <strong class="quest-log__key">Проблема</strong>
    <p class="quest-log__value">{problem}</p>
  </div>

  {
    stack && stack.length > 0 && (
      <div class="quest-log__row">
        <strong class="quest-log__key">Стек</strong>
        <ul class="quest-log__stack">
          {stack.map((item) => (
            <li>{item}</li>
          ))}
        </ul>
      </div>
    )
  }

  <div class="quest-log__row">
    <strong class="quest-log__key">Исход</strong>
    <p class="quest-log__value">{outcome}</p>
  </div>

  {
    learned && (
      <div class="quest-log__row">
        <strong class="quest-log__key">Чему научило</strong>
        <p class="quest-log__value">{learned}</p>
      </div>
    )
  }
</aside>

<style lang="scss">
  @use '../../styles/tokens' as *;

  .quest-log {
    background: var(--surface);
    border: 4px solid var(--green);
    box-shadow: $shadow-pixel-md var(--green-dim);
    padding: $card-pad;
    display: flex;
    flex-direction: column;
    gap: $space-4;
  }

  .quest-log__title {
    font-family: var(--font-display);
    font-size: $text-xs;
    color: var(--green);
    text-transform: uppercase;
    letter-spacing: $tracking-pixel;
  }

  .quest-log__row {
    display: flex;
    flex-direction: column;
    gap: $space-1;
  }

  .quest-log__key {
    font-family: var(--font-code);
    font-size: $text-sm;
    color: var(--cyan);
    text-transform: uppercase;
    letter-spacing: $tracking-wide;
  }

  .quest-log__value {
    font-family: var(--font-body);
    color: var(--text);
    line-height: $leading-normal;
  }

  .quest-log__stack {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-wrap: wrap;
    gap: $space-2;
    font-family: var(--font-code);
    font-size: $text-sm;
    color: var(--text-muted);

    li {
      padding: 2px $space-3;
      background: var(--surface-2);
      border: 1px solid var(--border);
    }
  }
</style>
```

- [ ] **Step 3: `pnpm check`**

Expected: 0 errors.

- [ ] **Step 4: Коммит**

```bash
git add src/components/ui/HpBar.astro src/components/ui/QuestLog.astro
git commit -m "feat(ui): add HpBar and QuestLog atoms"
```

---

### Task 3.6: MDX text components — Spoiler, Callout, Quest

**Files:**
- Create: `src/components/mdx/Spoiler.astro`
- Create: `src/components/mdx/Callout.astro`
- Create: `src/components/mdx/Quest.astro`

- [ ] **Step 1: `src/components/mdx/Spoiler.astro`**

```astro
---
interface Props {
  title?: string;
}
const { title = 'Подробнее' } = Astro.props;
---

<details class="spoiler">
  <summary class="spoiler__summary">▶ {title}</summary>
  <div class="spoiler__body">
    <slot />
  </div>
</details>

<style lang="scss">
  @use '../../styles/tokens' as *;

  .spoiler {
    margin: $space-4 0;
    border: 2px solid var(--border);
    background: var(--surface-2);

    &[open] .spoiler__summary::before {
      transform: rotate(90deg);
    }
  }

  .spoiler__summary {
    cursor: pointer;
    padding: $space-3 $space-4;
    font-family: var(--font-display);
    font-size: $text-xs;
    color: var(--cyan);
    text-transform: uppercase;
    letter-spacing: $tracking-pixel;
    list-style: none;
    user-select: none;

    &::-webkit-details-marker {
      display: none;
    }
  }

  .spoiler__body {
    padding: 0 $space-4 $space-4;
    color: var(--text);
  }
</style>
```

- [ ] **Step 2: `src/components/mdx/Callout.astro`**

```astro
---
interface Props {
  type?: 'info' | 'warning' | 'success' | 'danger';
}
const { type = 'info' } = Astro.props;

const ICON_MAP = {
  info: 'ⓘ',
  warning: '⚠',
  success: '✓',
  danger: '✗',
} as const;
---

<aside class="callout" data-type={type}>
  <span class="callout__icon" aria-hidden="true">{ICON_MAP[type]}</span>
  <div class="callout__body">
    <slot />
  </div>
</aside>

<style lang="scss">
  @use '../../styles/tokens' as *;

  .callout {
    display: flex;
    gap: $space-3;
    padding: $space-4;
    margin: $space-4 0;
    border-left: 4px solid var(--cyan);
    background: var(--surface-2);

    &[data-type='warning'] {
      border-color: var(--yellow);
    }
    &[data-type='success'] {
      border-color: var(--green);
    }
    &[data-type='danger'] {
      border-color: var(--magenta);
    }
  }

  .callout__icon {
    font-family: var(--font-display);
    font-size: $text-base;
    color: var(--cyan);

    .callout[data-type='warning'] & {
      color: var(--yellow);
    }
    .callout[data-type='success'] & {
      color: var(--green);
    }
    .callout[data-type='danger'] & {
      color: var(--magenta);
    }
  }

  .callout__body {
    flex: 1;
    color: var(--text);
    line-height: $leading-normal;
  }
</style>
```

- [ ] **Step 3: `src/components/mdx/Quest.astro`**

```astro
---
interface Props {
  status?: 'completed' | 'in_progress' | 'failed';
  title: string;
}
const { status = 'completed', title } = Astro.props;

const LABEL = {
  completed: 'КВЕСТ ЗАВЕРШЁН',
  in_progress: 'КВЕСТ АКТИВЕН',
  failed: 'КВЕСТ ПРОВАЛЕН',
} as const;
---

<aside class="quest" data-status={status}>
  <header class="quest__head">
    <span class="quest__label">// {LABEL[status]}</span>
    <h3 class="quest__title">{title}</h3>
  </header>
  <div class="quest__body">
    <slot />
  </div>
</aside>

<style lang="scss">
  @use '../../styles/tokens' as *;

  .quest {
    margin: $space-5 0;
    padding: $space-4;
    border: 4px solid var(--green);
    background: var(--surface);
    box-shadow: $shadow-pixel-md var(--green-dim);

    &[data-status='in_progress'] {
      border-color: var(--yellow);
      box-shadow: $shadow-pixel-md var(--yellow-dim);
    }
    &[data-status='failed'] {
      border-color: var(--magenta);
      box-shadow: $shadow-pixel-md var(--magenta-dim);
    }
  }

  .quest__head {
    margin-bottom: $space-3;
  }

  .quest__label {
    display: block;
    font-family: var(--font-code);
    font-size: $text-xs;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: $tracking-wide;
  }

  .quest__title {
    font-family: var(--font-display);
    font-size: $text-base;
    color: var(--green);
    margin: $space-2 0 0;
    text-transform: uppercase;

    .quest[data-status='in_progress'] & {
      color: var(--yellow);
    }
    .quest[data-status='failed'] & {
      color: var(--magenta);
    }
  }

  .quest__body {
    color: var(--text);
    line-height: $leading-normal;
  }
</style>
```

- [ ] **Step 4: `pnpm check`**

Expected: 0 errors.

- [ ] **Step 5: Коммит**

```bash
git add src/components/mdx/Spoiler.astro src/components/mdx/Callout.astro src/components/mdx/Quest.astro
git commit -m "feat(mdx): add Spoiler, Callout, Quest text components"
```

---

### Task 3.7: MDX Screenshot + TechBadge re-export

**Files:**
- Create: `src/components/mdx/Screenshot.astro`
- Create: `src/components/mdx/TechBadge.astro`

- [ ] **Step 1: `src/components/mdx/Screenshot.astro`**

```astro
---
import { Image } from 'astro:assets';
import type { ImageMetadata } from 'astro';

interface Props {
  src: ImageMetadata;
  alt: string;
  caption?: string;
  accent?: 'border' | 'green' | 'cyan' | 'magenta' | 'yellow' | 'purple';
}

const { src, alt, caption, accent = 'border' } = Astro.props;
---

<figure class="screenshot" data-accent={accent}>
  <Image src={src} alt={alt} loading="lazy" />
  {caption && <figcaption class="screenshot__caption">{caption}</figcaption>}
</figure>

<style lang="scss">
  @use '../../styles/tokens' as *;

  .screenshot {
    margin: $space-5 0;
    border: 4px solid var(--border);
    background: var(--surface);

    &[data-accent='green'] {
      border-color: var(--green);
    }
    &[data-accent='cyan'] {
      border-color: var(--cyan);
    }
    &[data-accent='magenta'] {
      border-color: var(--magenta);
    }
    &[data-accent='yellow'] {
      border-color: var(--yellow);
    }
    &[data-accent='purple'] {
      border-color: var(--purple);
    }
  }

  .screenshot :global(img) {
    display: block;
    width: 100%;
    height: auto;
  }

  .screenshot__caption {
    padding: $space-2 $space-4;
    font-family: var(--font-code);
    font-size: $text-sm;
    color: var(--text-muted);
    border-top: 2px solid var(--border);
    text-align: center;
  }
</style>
```

- [ ] **Step 2: `src/components/mdx/TechBadge.astro`** (реэкспорт ui-варианта)

```astro
---
import UiTechBadge from '../ui/TechBadge.astro';

interface Props {
  accent?: 'purple' | 'green' | 'cyan' | 'yellow' | 'magenta';
}

const props = Astro.props;
---

<UiTechBadge {...props}>
  <slot />
</UiTechBadge>
```

- [ ] **Step 3: `pnpm check`**

Expected: 0 errors.

- [ ] **Step 4: Коммит**

```bash
git add src/components/mdx/Screenshot.astro src/components/mdx/TechBadge.astro
git commit -m "feat(mdx): add Screenshot (astro:assets) and TechBadge re-export"
```

---

### Task 3.8: Регистрировать MDX-компоненты глобально

**Files:**
- Modify: `astro.config.mjs`

> Astro 6 не поддерживает глобальные `mdx.components` через config — это API было в Astro 4. В Astro 6 рекомендуемый паттерн — импортировать компоненты в каждом MDX-файле через `import` (но это инвазивно для контент-редактора), либо использовать [`@astrojs/markdoc`](https://docs.astro.build/en/guides/integrations-guide/markdoc/), либо настроить через `remark-mdx-components` (community). Для M2 будем регистрировать компоненты в layout, передавая через `components` prop в `<Content components={...} />`.
>
> Это значит: в `pages/projects/[slug].astro` мы импортируем компоненты и передаём их в render. Это зафиксировано в Task 4.10. **Этот task — пометка-anchor**, физического файла не создаём.

- [ ] **Step 1: Подтвердить, что MDX-компоненты используются через `<Content components={...} />` в `[slug].astro`**

Никаких изменений в этом task. Просто фиксируем: в Task 4.10 будет `import { Screenshot, Spoiler, Callout, Quest, TechBadge } from '~/components/mdx'` и `<Content components={{ Screenshot, Spoiler, Callout, Quest, TechBadge }} />`.

- [ ] **Step 2: Создать `src/components/mdx/index.ts` для barrel-экспорта**

```ts
export { default as Screenshot } from './Screenshot.astro';
export { default as Spoiler } from './Spoiler.astro';
export { default as Callout } from './Callout.astro';
export { default as Quest } from './Quest.astro';
export { default as TechBadge } from './TechBadge.astro';
```

- [ ] **Step 3: `pnpm check`**

Expected: 0 errors.

- [ ] **Step 4: Коммит**

```bash
git add src/components/mdx/index.ts
git commit -m "feat(mdx): barrel export of MDX components for [slug].astro"
```

---

### Task 3.9: Dev showcase `/dev/components/`

**Files:**
- Create: `src/pages/dev/components.astro`

- [ ] **Step 1: Создать `src/pages/dev/components.astro`**

```astro
---
import MainLayout from '../../layouts/MainLayout.astro';
import PixelCard from '../../components/ui/PixelCard.astro';
import PixelButton from '../../components/ui/PixelButton.astro';
import PixelDivider from '../../components/ui/PixelDivider.astro';
import TechBadge from '../../components/ui/TechBadge.astro';
import ComplexityStars from '../../components/ui/ComplexityStars.astro';
import HpBar from '../../components/ui/HpBar.astro';
import QuestLog from '../../components/ui/QuestLog.astro';

import Spoiler from '../../components/mdx/Spoiler.astro';
import Callout from '../../components/mdx/Callout.astro';
import Quest from '../../components/mdx/Quest.astro';
---

<MainLayout title="Components — pixed-portfolio">
  <div class="container showcase">
    <h1 class="showcase__title">// COMPONENTS SHOWCASE</h1>

    <section class="showcase__section">
      <h2>PixelCard</h2>
      <div class="showcase__row">
        <PixelCard accent="border">Default card</PixelCard>
        <PixelCard accent="green">Green accent</PixelCard>
        <PixelCard accent="cyan">Cyan accent</PixelCard>
        <PixelCard href="#" accent="magenta">Clickable</PixelCard>
      </div>
    </section>

    <PixelDivider accent="green" spacing="md" />

    <section class="showcase__section">
      <h2>PixelButton</h2>
      <div class="showcase__row">
        <PixelButton>Primary</PixelButton>
        <PixelButton variant="secondary">Secondary</PixelButton>
        <PixelButton variant="danger">Danger</PixelButton>
        <PixelButton href="/projects/">Link variant</PixelButton>
        <PixelButton disabled>Disabled</PixelButton>
      </div>
    </section>

    <PixelDivider accent="cyan" />

    <section class="showcase__section">
      <h2>TechBadge / ComplexityStars</h2>
      <div class="showcase__row">
        <TechBadge>php</TechBadge>
        <TechBadge accent="green">laravel</TechBadge>
        <TechBadge accent="cyan">mysql</TechBadge>
        <TechBadge accent="yellow">vue</TechBadge>
        <TechBadge accent="magenta">redis</TechBadge>
      </div>
      <div class="showcase__row">
        <ComplexityStars value={1} />
        <ComplexityStars value={3} />
        <ComplexityStars value={5} />
      </div>
    </section>

    <PixelDivider accent="yellow" />

    <section class="showcase__section">
      <h2>HpBar</h2>
      <HpBar label="PHP" value={92} color="green" />
      <HpBar label="MySQL" value={80} color="cyan" />
      <HpBar label="Docker" value={70} color="magenta" />
    </section>

    <PixelDivider accent="magenta" />

    <section class="showcase__section">
      <h2>QuestLog</h2>
      <QuestLog
        problem="Демо-проблема для проверки рендера."
        stack={["php-8.2", "laravel", "redis"]}
        outcome="Демо-исход с конкретным результатом."
        learned="Что-то полезное."
      />
    </section>

    <PixelDivider accent="purple" />

    <section class="showcase__section">
      <h2>MDX components</h2>
      <Spoiler title="Открыть подробности">
        <p>Содержимое спойлера. Сюда можно положить любой контент.</p>
      </Spoiler>

      <Callout type="info">Это info-блок.</Callout>
      <Callout type="warning">Это warning-блок.</Callout>
      <Callout type="success">Это success-блок.</Callout>
      <Callout type="danger">Это danger-блок.</Callout>

      <Quest status="completed" title="Демо-квест">
        <p>Описание демонстрационного квеста.</p>
      </Quest>
      <Quest status="in_progress" title="Активный квест">
        <p>Описание активного квеста.</p>
      </Quest>
    </section>
  </div>
</MainLayout>

<style lang="scss">
  @use '../../styles/tokens' as *;

  .showcase {
    padding: $space-6 0;
  }

  .showcase__title {
    font-family: var(--font-display);
    font-size: $text-xl;
    color: var(--green);
    text-transform: uppercase;
    letter-spacing: $tracking-pixel;
    margin-bottom: $space-7;
  }

  .showcase__section {
    margin-bottom: $space-7;

    h2 {
      font-family: var(--font-display);
      font-size: $text-base;
      color: var(--cyan);
      text-transform: uppercase;
      margin-bottom: $space-4;
    }
  }

  .showcase__row {
    display: flex;
    flex-wrap: wrap;
    gap: $space-4;
    margin-bottom: $space-4;
    align-items: center;
  }
</style>
```

- [ ] **Step 2: `pnpm build`**

Run: `pnpm build`
Expected: страница `dist/dev/components/index.html` создана. В выводе билда — `└─ /dev/components/index.html`.

- [ ] **Step 3: Smoke-тест локально (опционально)**

```bash
pnpm preview
```

Открыть http://localhost:4321/dev/components/. Все компоненты должны рендериться без CSS-сюрпризов: карточки с разными акцентами, кнопки с `[ ]`, теги, звёзды, заполненные HP-бары, quest-log, spoiler разворачивается, callouts разноцветные, quest-блоки.

- [ ] **Step 4: Коммит**

```bash
git add src/pages/dev/components.astro
git commit -m "feat(dev): add /dev/components showcase page"
```

---

## Phase 4 — Nav, Sections, Pages

### Task 4.1: Header (full)

**Files:**
- Modify: `src/components/nav/Header.astro`
- Create: `src/components/nav/LangSwitcher.astro`
- Create: `src/components/nav/ThemeTweakerBtn.astro`

- [ ] **Step 1: Создать `src/components/nav/LangSwitcher.astro`**

```astro
---
import { getLocale } from '../../lib/i18n';
const locale = getLocale(Astro.url);
const otherLocale = locale === 'ru' ? 'en' : 'ru';
const otherHref = locale === 'ru' ? '/en/' : '/';
---

<a href={otherHref} class="lang-switcher" data-current={locale}>
  <span class="lang-switcher__current">{locale.toUpperCase()}</span>
  <span class="lang-switcher__sep" aria-hidden="true">|</span>
  <span class="lang-switcher__other">{otherLocale.toUpperCase()}</span>
</a>

<style lang="scss">
  @use '../../styles/tokens' as *;

  .lang-switcher {
    display: var(--lang-switcher-display, none);
    font-family: var(--font-code);
    font-size: $text-sm;
    color: var(--text-muted);
    text-decoration: none;
    letter-spacing: $tracking-wide;
  }

  :root {
    --lang-switcher-display: none;
  }

  .lang-switcher__current {
    color: var(--green);
  }

  .lang-switcher__sep {
    margin: 0 $space-1;
    color: var(--border-bright);
  }

  .lang-switcher__other:hover {
    color: var(--cyan);
  }
</style>
```

> Note: `--lang-switcher-display` — вторая переменная-затвор, дублирующая `--show-lang-switcher` из M1 для надёжности (можно либо убрать `--show-lang-switcher: 0` из M1, либо менять `display` через JS в M3 при готовности перевода). На M2 switcher остаётся скрыт.

- [ ] **Step 2: Создать `src/components/nav/ThemeTweakerBtn.astro`**

```astro
---
// M2 placeholder: button without behavior. Real theme picker is an M3 island.
---

<button class="theme-btn" type="button" aria-label="Theme settings (coming soon)" disabled>
  ⚙
</button>

<style lang="scss">
  @use '../../styles/tokens' as *;

  .theme-btn {
    background: transparent;
    border: none;
    cursor: not-allowed;
    color: var(--text-muted);
    font-size: $text-base;
    padding: $space-1;

    &:hover {
      color: var(--green);
    }
  }
</style>
```

- [ ] **Step 3: Перезаписать `src/components/nav/Header.astro` с полным навигатором**

```astro
---
import { SITE, NAV_LINKS } from '../../lib/site-config';
import LangSwitcher from './LangSwitcher.astro';
import ThemeTweakerBtn from './ThemeTweakerBtn.astro';

const currentPath = Astro.url.pathname;

function isActive(href: string): boolean {
  if (href === '/') return currentPath === '/';
  return currentPath.startsWith(href);
}
---

<header class="header">
  <div class="container header__inner">
    <a href="/" class="header__brand">[ {SITE.author}.dev ]</a>

    <nav class="header__nav" aria-label="Main">
      <ul class="header__list">
        {
          NAV_LINKS.map((link) => (
            <li>
              <a
                href={link.href}
                class:list={['header__link', { 'is-active': isActive(link.href) }]}
              >
                {link.label}
              </a>
            </li>
          ))
        }
      </ul>
    </nav>

    <div class="header__tools">
      <LangSwitcher />
      <ThemeTweakerBtn />
    </div>
  </div>
</header>

<style lang="scss">
  @use '../../styles/tokens' as *;
  @use '../../styles/mixins' as m;

  .header {
    position: sticky;
    top: 0;
    z-index: 50;
    background: var(--bg);
    border-bottom: 4px solid var(--border);
  }

  .header__inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: $space-3 0;
    gap: $space-5;
  }

  .header__brand {
    font-family: var(--font-display);
    font-size: $text-xs;
    color: var(--green);
    letter-spacing: $tracking-pixel;
    text-transform: uppercase;
    text-decoration: none;
    white-space: nowrap;
  }

  .header__list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    gap: $space-5;
  }

  .header__link {
    @include m.nav-prefix-on-hover;
    font-family: var(--font-code);
    font-size: $text-sm;
    color: var(--text);
    text-decoration: none;
    text-transform: uppercase;
    letter-spacing: $tracking-pixel;

    &.is-active {
      color: var(--green);

      &::before {
        opacity: 1;
      }
    }

    &:hover {
      color: var(--cyan);
    }
  }

  .header__tools {
    display: flex;
    gap: $space-3;
    align-items: center;
  }

  @media (max-width: 720px) {
    .header__list {
      gap: $space-3;
      font-size: 12px;
    }

    .header__inner {
      gap: $space-3;
    }
  }
</style>
```

- [ ] **Step 4: `pnpm check && pnpm build`**

Expected: 0 errors, билд успешен.

- [ ] **Step 5: Коммит**

```bash
git add src/components/nav/Header.astro src/components/nav/LangSwitcher.astro src/components/nav/ThemeTweakerBtn.astro
git commit -m "feat(nav): full Header with nav links, lang switcher (hidden), theme button"
```

---

### Task 4.2: Footer (final)

**Files:**
- Modify: `src/components/nav/Footer.astro`

> Footer уже создан в Task 3.1 как минимальный. Этот task — финальная полировка с правильной типографикой и адаптивностью.

- [ ] **Step 1: Перезаписать `src/components/nav/Footer.astro`**

```astro
---
import { SITE, CONTACT } from '../../lib/site-config';
const year = new Date().getFullYear();
---

<footer class="footer">
  <div class="container footer__inner">
    <span class="footer__copyright">
      © {SITE.copyrightStart}–{year} {SITE.author}
    </span>
    <nav class="footer__links" aria-label="Внешние ссылки">
      <a href={CONTACT.github} rel="me noopener" target="_blank">github</a>
      <span aria-hidden="true">·</span>
      <a href={CONTACT.telegram} rel="noopener" target="_blank">telegram</a>
      <span aria-hidden="true">·</span>
      <a href={`mailto:${CONTACT.email}`}>email</a>
    </nav>
  </div>
</footer>

<style lang="scss">
  @use '../../styles/tokens' as *;

  .footer {
    margin-top: $space-9;
    border-top: 4px solid var(--border);
    background: var(--surface);
  }

  .footer__inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: $space-3;
    padding: $space-5 0;
    font-family: var(--font-code);
    font-size: $text-sm;
    color: var(--text-muted);
  }

  .footer__copyright {
    text-transform: uppercase;
    letter-spacing: $tracking-pixel;
  }

  .footer__links {
    display: flex;
    gap: $space-2;
    align-items: center;

    a {
      color: var(--text-muted);
      text-decoration: none;
      text-transform: uppercase;
      letter-spacing: $tracking-pixel;

      &:hover {
        color: var(--cyan);
      }
    }
  }

  @media (max-width: 480px) {
    .footer__inner {
      flex-direction: column;
      align-items: flex-start;
    }
  }
</style>
```

- [ ] **Step 2: `pnpm check && pnpm build`**

Expected: 0 errors, билд успешен.

- [ ] **Step 3: Коммит**

```bash
git add src/components/nav/Footer.astro
git commit -m "feat(nav): polish Footer with responsive layout"
```

---

### Task 4.3: HeroCharacter section

**Files:**
- Create: `src/components/sections/HeroCharacter.astro`

- [ ] **Step 1: Создать `src/components/sections/HeroCharacter.astro`**

```astro
---
import PixelButton from '../ui/PixelButton.astro';

interface Props {
  title: string;
  characterClass: string;
  tagline: string;
  ctaPrimary?: { href: string; label: string };
  ctaSecondary?: { href: string; label: string };
}

const {
  title,
  characterClass,
  tagline,
  ctaPrimary = { href: '/projects/', label: 'Смотреть работы' },
  ctaSecondary = { href: '/contact/', label: 'Начать квест' },
} = Astro.props;
---

<section class="hero">
  <div class="container">
    <span class="hero__class">// {characterClass}</span>
    <h1 class="hero__title">{title}</h1>
    <p class="hero__tagline">{tagline}</p>

    <div class="hero__cta">
      <PixelButton href={ctaPrimary.href}>{ctaPrimary.label}</PixelButton>
      <PixelButton href={ctaSecondary.href} variant="secondary">{ctaSecondary.label}</PixelButton>
    </div>
  </div>
</section>

<style lang="scss">
  @use '../../styles/tokens' as *;

  .hero {
    padding: $space-9 0;
  }

  .hero__class {
    display: block;
    font-family: var(--font-code);
    font-size: $text-sm;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: $tracking-wide;
    margin-bottom: $space-3;
  }

  .hero__title {
    font-family: var(--font-display);
    font-size: clamp(28px, 5vw, $display-xl);
    color: var(--green);
    text-transform: uppercase;
    letter-spacing: $tracking-pixel;
    line-height: $leading-tight;
    margin: 0 0 $space-5;
  }

  .hero__tagline {
    font-family: var(--font-body);
    font-size: $text-lg;
    color: var(--text);
    max-width: 56ch;
    margin: 0 0 $space-7;
    line-height: $leading-normal;
  }

  .hero__cta {
    display: flex;
    gap: $space-4;
    flex-wrap: wrap;
  }
</style>
```

- [ ] **Step 2: `pnpm check`**

Expected: 0 errors.

- [ ] **Step 3: Коммит**

```bash
git add src/components/sections/HeroCharacter.astro
git commit -m "feat(sections): add HeroCharacter for homepage"
```

---

### Task 4.4: ProjectsGrid section

**Files:**
- Create: `src/components/sections/ProjectsGrid.astro`

- [ ] **Step 1: Создать `src/components/sections/ProjectsGrid.astro`**

```astro
---
import { Image } from 'astro:assets';
import type { CollectionEntry } from 'astro:content';
import PixelCard from '../ui/PixelCard.astro';
import TechBadge from '../ui/TechBadge.astro';
import ComplexityStars from '../ui/ComplexityStars.astro';

interface Props {
  projects: CollectionEntry<'projects'>[];
  showHeading?: boolean;
  heading?: string;
  limit?: number;
}

const { projects, showHeading = true, heading = '// КВЕСТЫ', limit } = Astro.props;
const list = limit ? projects.slice(0, limit) : projects;
---

<section class="projects">
  <div class="container">
    {showHeading && <h2 class="projects__heading">{heading}</h2>}

    <ul class="projects__grid">
      {
        list.map((project) => {
          const slug = project.data.slug;
          return (
            <li class="projects__item">
              <PixelCard href={`/projects/${slug}/`} accent="border">
                <div class="projects__cover">
                  <Image src={project.data.cover} alt={project.data.title} loading="lazy" />
                </div>
                <h3 class="projects__title">{project.data.title}</h3>
                <p class="projects__summary">{project.data.summary}</p>

                <div class="projects__meta">
                  <ComplexityStars value={project.data.complexity} />
                  <span class="projects__year">{project.data.year}</span>
                </div>

                <div class="projects__tags">
                  {project.data.tech.slice(0, 4).map((t) => (
                    <TechBadge>{t}</TechBadge>
                  ))}
                </div>
              </PixelCard>
            </li>
          );
        })
      }
    </ul>
  </div>
</section>

<style lang="scss">
  @use '../../styles/tokens' as *;

  .projects {
    padding: $space-7 0;
  }

  .projects__heading {
    font-family: var(--font-display);
    font-size: $text-lg;
    color: var(--cyan);
    text-transform: uppercase;
    letter-spacing: $tracking-pixel;
    margin: 0 0 $space-5;
  }

  .projects__grid {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: $space-5;
  }

  .projects__item {
    display: contents;
  }

  .projects__cover {
    margin: -$card-pad -$card-pad $space-4;
    border-bottom: 4px solid var(--border);
    overflow: hidden;
  }

  .projects__cover :global(img) {
    display: block;
    width: 100%;
    height: 200px;
    object-fit: cover;
  }

  .projects__title {
    font-family: var(--font-display);
    font-size: $text-sm;
    color: var(--green);
    text-transform: uppercase;
    letter-spacing: $tracking-pixel;
    line-height: $leading-tight;
    margin: 0 0 $space-3;
  }

  .projects__summary {
    color: var(--text);
    font-size: $text-sm;
    line-height: $leading-normal;
    margin: 0 0 $space-4;
    min-height: 4em;
  }

  .projects__meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $space-3;

    .projects__year {
      font-family: var(--font-code);
      font-size: $text-sm;
      color: var(--text-muted);
    }
  }

  .projects__tags {
    display: flex;
    flex-wrap: wrap;
    gap: $space-2;
  }
</style>
```

- [ ] **Step 2: `pnpm check`**

Expected: 0 errors.

- [ ] **Step 3: Коммит**

```bash
git add src/components/sections/ProjectsGrid.astro
git commit -m "feat(sections): add ProjectsGrid (auto-fill grid + cover image)"
```

---

### Task 4.5: SkillsTree section

**Files:**
- Create: `src/components/sections/SkillsTree.astro`

- [ ] **Step 1: Создать `src/components/sections/SkillsTree.astro`**

```astro
---
import type { CollectionEntry } from 'astro:content';
import HpBar from '../ui/HpBar.astro';

interface Props {
  skills: CollectionEntry<'skills'>[];
  heading?: string;
}

const { skills, heading = '// СТАТЫ ПЕРСОНАЖА' } = Astro.props;

const colorMap: Record<string, 'green' | 'cyan' | 'magenta' | 'yellow' | 'purple'> = {
  'var(--green)': 'green',
  'var(--cyan)': 'cyan',
  'var(--magenta)': 'magenta',
  'var(--yellow)': 'yellow',
  'var(--purple)': 'purple',
};

const grouped = {
  backend: skills.filter((s) => s.data.category === 'backend'),
  frontend: skills.filter((s) => s.data.category === 'frontend'),
  devops: skills.filter((s) => s.data.category === 'devops'),
  tools: skills.filter((s) => s.data.category === 'tools'),
};

const groupLabels = {
  backend: 'BACKEND',
  frontend: 'FRONTEND',
  devops: 'DEVOPS',
  tools: 'TOOLS',
} as const;
---

<section class="skills">
  <div class="container">
    <h2 class="skills__heading">{heading}</h2>

    <div class="skills__grid">
      {
        (['backend', 'frontend', 'devops', 'tools'] as const).map((cat) => (
          grouped[cat].length > 0 && (
            <div class="skills__group">
              <h3 class="skills__group-title">{groupLabels[cat]}</h3>
              <div class="skills__bars">
                {grouped[cat]
                  .sort((a, b) => a.data.order - b.data.order)
                  .map((skill) => (
                    <HpBar
                      label={skill.data.name}
                      value={skill.data.value}
                      color={colorMap[skill.data.color]}
                    />
                  ))}
              </div>
            </div>
          )
        ))
      }
    </div>
  </div>
</section>

<style lang="scss">
  @use '../../styles/tokens' as *;

  .skills {
    padding: $space-7 0;
  }

  .skills__heading {
    font-family: var(--font-display);
    font-size: $text-lg;
    color: var(--cyan);
    text-transform: uppercase;
    letter-spacing: $tracking-pixel;
    margin: 0 0 $space-5;
  }

  .skills__grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: $space-7;
  }

  .skills__group-title {
    font-family: var(--font-display);
    font-size: $text-xs;
    color: var(--green);
    text-transform: uppercase;
    letter-spacing: $tracking-wide;
    margin: 0 0 $space-3;
  }

  .skills__bars {
    display: flex;
    flex-direction: column;
    gap: $space-3;
  }
</style>
```

- [ ] **Step 2: `pnpm check`**

Expected: 0 errors.

- [ ] **Step 3: Коммит**

```bash
git add src/components/sections/SkillsTree.astro
git commit -m "feat(sections): add SkillsTree grouped by category"
```

---

### Task 4.6: Timeline section

**Files:**
- Create: `src/components/sections/Timeline.astro`

- [ ] **Step 1: Создать `src/components/sections/Timeline.astro`**

```astro
---
import type { CollectionEntry } from 'astro:content';

interface Props {
  events: CollectionEntry<'timeline'>[];
  heading?: string;
}

const { events, heading = '// ХРОНИКА' } = Astro.props;
const sorted = [...events].sort((a, b) => a.data.year - b.data.year);
---

<section class="timeline">
  <div class="container">
    <h2 class="timeline__heading">{heading}</h2>

    <ol class="timeline__list">
      {
        sorted.map((event) => (
          <li class="timeline__item">
            <span class="timeline__year">{event.data.year}</span>
            <span class="timeline__icon" aria-hidden="true">
              {event.data.icon ?? '◆'}
            </span>
            <div class="timeline__body">
              <h3 class="timeline__title">{event.data.title}</h3>
              <p class="timeline__desc">{event.data.description}</p>
            </div>
          </li>
        ))
      }
    </ol>
  </div>
</section>

<style lang="scss">
  @use '../../styles/tokens' as *;

  .timeline {
    padding: $space-7 0;
  }

  .timeline__heading {
    font-family: var(--font-display);
    font-size: $text-lg;
    color: var(--cyan);
    text-transform: uppercase;
    letter-spacing: $tracking-pixel;
    margin: 0 0 $space-5;
  }

  .timeline__list {
    list-style: none;
    padding: 0;
    margin: 0;
    border-left: 4px solid var(--border);
  }

  .timeline__item {
    position: relative;
    padding: 0 0 $space-5 $space-6;
    display: grid;
    grid-template-columns: auto auto 1fr;
    gap: $space-3;
    align-items: baseline;
  }

  .timeline__year {
    font-family: var(--font-display);
    font-size: $text-xs;
    color: var(--green);
    letter-spacing: $tracking-pixel;
  }

  .timeline__icon {
    font-size: $text-base;
  }

  .timeline__body {
    grid-column: 1 / -1;
    margin-top: $space-1;
  }

  .timeline__title {
    font-family: var(--font-code);
    font-size: $text-base;
    color: var(--text);
    margin: 0 0 $space-1;
    text-transform: uppercase;
    letter-spacing: $tracking-pixel;
  }

  .timeline__desc {
    font-family: var(--font-body);
    font-size: $text-sm;
    color: var(--text-muted);
    line-height: $leading-normal;
    margin: 0;
  }

  @media (min-width: 720px) {
    .timeline__item {
      grid-template-columns: 80px auto 1fr;
    }
    .timeline__body {
      grid-column: 3;
      margin-top: 0;
    }
  }
</style>
```

- [ ] **Step 2: `pnpm check`**

Expected: 0 errors.

- [ ] **Step 3: Коммит**

```bash
git add src/components/sections/Timeline.astro
git commit -m "feat(sections): add Timeline (chronological list with year/icon)"
```

---

### Task 4.7: Replace home page (`/`)

**Files:**
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Переписать `src/pages/index.astro`**

```astro
---
import { getCollection, getEntry } from 'astro:content';
import MainLayout from '../layouts/MainLayout.astro';
import HeroCharacter from '../components/sections/HeroCharacter.astro';
import ProjectsGrid from '../components/sections/ProjectsGrid.astro';
import SkillsTree from '../components/sections/SkillsTree.astro';
import PixelDivider from '../components/ui/PixelDivider.astro';

const home = await getEntry('site', 'home');
const allProjects = await getCollection('projects');
const featured = allProjects.filter((p) => p.data.featured).sort((a, b) => a.data.order - b.data.order);
const skills = await getCollection('skills');
---

<MainLayout
  title="flathead — PHP-разработчик"
  description="Портфолио PHP-разработчика flathead. Pixel-art, сторителлинг, реальные проекты."
>
  <HeroCharacter
    title={home?.data.title ?? 'flathead — PHP-разработчик'}
    characterClass="PHP-кудесник, lvl 25"
    tagline="Пишу код с 2015. Беру проекты, где нужно подумать. Laravel, PostgreSQL, Telegram-боты, инфраструктура."
  />

  <PixelDivider accent="green" />

  <ProjectsGrid projects={featured} heading="// ИЗБРАННЫЕ КВЕСТЫ" />

  <PixelDivider accent="cyan" />

  <SkillsTree skills={skills} />
</MainLayout>
```

- [ ] **Step 2: `pnpm check && pnpm build`**

Expected: 0 errors, в выводе билда `└─ /index.html`. dist/index.html содержит hero-заголовок, 2 проекта (которые `featured: true`), скиллы.

- [ ] **Step 3: Коммит**

```bash
git add src/pages/index.astro
git commit -m "feat(pages): replace M1 health-check with real homepage"
```

---

### Task 4.8: About page (`/about/`)

**Files:**
- Create: `src/pages/about.astro`

- [ ] **Step 1: Создать `src/pages/about.astro`**

```astro
---
import { getCollection, getEntry, render } from 'astro:content';
import MainLayout from '../layouts/MainLayout.astro';
import Timeline from '../components/sections/Timeline.astro';
import SkillsTree from '../components/sections/SkillsTree.astro';
import PixelDivider from '../components/ui/PixelDivider.astro';

const about = await getEntry('site', 'about');
const skills = await getCollection('skills');
const events = await getCollection('timeline');

if (!about) {
  throw new Error('content/site/about.mdx not found');
}

const { Content } = await render(about);
---

<MainLayout
  title="О себе — flathead"
  description="Десять лет в PHP, последние пять — в Laravel. Краткая хроника и стек."
>
  <article class="about container">
    <header class="about__head">
      <span class="about__label">// CHARACTER PROFILE</span>
      <h1 class="about__title">{about.data.title}</h1>
    </header>

    <div class="about__body">
      <Content />
    </div>
  </article>

  <PixelDivider accent="cyan" />

  <SkillsTree skills={skills} />

  <PixelDivider accent="yellow" />

  <Timeline events={events} />
</MainLayout>

<style lang="scss">
  @use '../styles/tokens' as *;

  .about {
    padding: $space-7 0;
  }

  .about__label {
    font-family: var(--font-code);
    font-size: $text-sm;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: $tracking-wide;
  }

  .about__title {
    font-family: var(--font-display);
    font-size: $display-lg;
    color: var(--green);
    text-transform: uppercase;
    letter-spacing: $tracking-pixel;
    line-height: $leading-tight;
    margin: $space-2 0 $space-5;
  }

  .about__body {
    color: var(--text);
    line-height: $leading-normal;
    max-width: 70ch;

    :global(p) {
      margin: 0 0 $space-4;
    }
    :global(h2) {
      font-family: var(--font-display);
      font-size: $text-base;
      color: var(--cyan);
      text-transform: uppercase;
      margin: $space-5 0 $space-3;
    }
  }
</style>
```

- [ ] **Step 2: `pnpm check && pnpm build`**

Expected: 0 errors, `dist/about/index.html` создан.

- [ ] **Step 3: Коммит**

```bash
git add src/pages/about.astro
git commit -m "feat(pages): add /about page (bio + skills + timeline)"
```

---

### Task 4.9: Projects index page (`/projects/`)

**Files:**
- Create: `src/pages/projects/index.astro`

- [ ] **Step 1: Создать `src/pages/projects/index.astro`**

```astro
---
import { getCollection } from 'astro:content';
import MainLayout from '../../layouts/MainLayout.astro';
import ProjectsGrid from '../../components/sections/ProjectsGrid.astro';

const projects = await getCollection('projects');
const sorted = [...projects].sort((a, b) => a.data.order - b.data.order);
---

<MainLayout title="Проекты — flathead" description="Все проекты флэтхеда: e-commerce, CRM, телеграм-боты.">
  <div class="container projects-page">
    <header class="projects-page__head">
      <span class="projects-page__label">// АРХИВ КВЕСТОВ</span>
      <h1 class="projects-page__title">Проекты</h1>
      <p class="projects-page__count">{sorted.length} проектов завершено</p>
    </header>
  </div>

  <ProjectsGrid projects={sorted} showHeading={false} />
</MainLayout>

<style lang="scss">
  @use '../../styles/tokens' as *;

  .projects-page {
    padding: $space-6 0 0;
  }

  .projects-page__label {
    font-family: var(--font-code);
    font-size: $text-sm;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: $tracking-wide;
  }

  .projects-page__title {
    font-family: var(--font-display);
    font-size: $display-lg;
    color: var(--green);
    text-transform: uppercase;
    letter-spacing: $tracking-pixel;
    line-height: $leading-tight;
    margin: $space-2 0 $space-3;
  }

  .projects-page__count {
    font-family: var(--font-code);
    font-size: $text-sm;
    color: var(--text-muted);
  }
</style>
```

- [ ] **Step 2: `pnpm check && pnpm build`**

Expected: 0 errors. `dist/projects/index.html` создан, отображает всё 3 проекта.

- [ ] **Step 3: Коммит**

```bash
git add src/pages/projects/index.astro
git commit -m "feat(pages): add /projects index page"
```

---

### Task 4.10: Project detail page (`/projects/[slug]/`)

**Files:**
- Create: `src/pages/projects/[slug].astro`

- [ ] **Step 1: Создать `src/pages/projects/[slug].astro`**

```astro
---
import { Image } from 'astro:assets';
import { getCollection, render } from 'astro:content';
import type { CollectionEntry } from 'astro:content';
import MainLayout from '../../layouts/MainLayout.astro';
import PixelButton from '../../components/ui/PixelButton.astro';
import PixelDivider from '../../components/ui/PixelDivider.astro';
import ComplexityStars from '../../components/ui/ComplexityStars.astro';
import TechBadge from '../../components/ui/TechBadge.astro';
import QuestLog from '../../components/ui/QuestLog.astro';

import * as MdxComponents from '../../components/mdx';

export async function getStaticPaths() {
  const projects = await getCollection('projects');
  return projects.map((project) => ({
    params: { slug: project.data.slug },
    props: { project },
  }));
}

interface Props {
  project: CollectionEntry<'projects'>;
}

const { project } = Astro.props;
const { Content } = await render(project);
---

<MainLayout title={`${project.data.title} — flathead`} description={project.data.summary}>
  <article class="project container">
    <header class="project__head">
      <a href="/projects/" class="project__back">← все проекты</a>

      <h1 class="project__title">{project.data.title}</h1>
      <p class="project__summary">{project.data.summary}</p>
    </header>

    <div class="project__cover">
      <Image src={project.data.cover} alt={project.data.title} />
    </div>

    <dl class="project__specs">
      <div>
        <dt>Длительность</dt>
        <dd>{project.data.duration}</dd>
      </div>
      <div>
        <dt>Год</dt>
        <dd>{project.data.year}</dd>
      </div>
      {
        project.data.client && (
          <div>
            <dt>Клиент</dt>
            <dd>{project.data.client}</dd>
          </div>
        )
      }
      <div>
        <dt>Статус</dt>
        <dd class={`project__status project__status--${project.data.status}`}>
          {project.data.status === 'completed' ? 'Завершён' : project.data.status === 'in_progress' ? 'В работе' : 'Архив'}
        </dd>
      </div>
      <div>
        <dt>Сложность</dt>
        <dd>
          <ComplexityStars value={project.data.complexity} label="" />
        </dd>
      </div>
    </dl>

    <div class="project__tags">
      {project.data.tech.map((t) => <TechBadge>{t}</TechBadge>)}
    </div>

    {
      project.data.liveUrl && (
        <div class="project__cta">
          <PixelButton href={project.data.liveUrl}>Открыть live</PixelButton>
          {project.data.repoUrl && (
            <PixelButton href={project.data.repoUrl} variant="secondary">
              Исходники
            </PixelButton>
          )}
        </div>
      )
    }

    <PixelDivider accent="green" />

    <div class="project__body">
      <Content components={MdxComponents} />
    </div>

    {
      project.data.questLog && (
        <>
          <PixelDivider accent="cyan" />
          <QuestLog
            problem={project.data.questLog.problem}
            stack={project.data.questLog.stack}
            outcome={project.data.questLog.outcome}
            learned={project.data.questLog.learned}
          />
        </>
      )
    }
  </article>
</MainLayout>

<style lang="scss">
  @use '../../styles/tokens' as *;

  .project {
    padding: $space-6 0;
    max-width: 880px;
  }

  .project__back {
    font-family: var(--font-code);
    font-size: $text-sm;
    color: var(--text-muted);
    text-decoration: none;
    text-transform: uppercase;
    letter-spacing: $tracking-pixel;

    &:hover {
      color: var(--cyan);
    }
  }

  .project__title {
    font-family: var(--font-display);
    font-size: clamp(24px, 4vw, $display-lg);
    color: var(--green);
    text-transform: uppercase;
    letter-spacing: $tracking-pixel;
    line-height: $leading-tight;
    margin: $space-3 0 $space-4;
  }

  .project__summary {
    font-family: var(--font-body);
    font-size: $text-lg;
    color: var(--text);
    line-height: $leading-normal;
    margin: 0 0 $space-6;
    max-width: 70ch;
  }

  .project__cover {
    margin: 0 0 $space-6;
    border: 4px solid var(--border);
  }

  .project__cover :global(img) {
    display: block;
    width: 100%;
    height: auto;
  }

  .project__specs {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: $space-4;
    margin: 0 0 $space-5;
    padding: $space-4;
    background: var(--surface-2);
    border: 2px solid var(--border);

    div {
      display: flex;
      flex-direction: column;
      gap: $space-1;
    }

    dt {
      font-family: var(--font-code);
      font-size: $text-xs;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: $tracking-wide;
    }

    dd {
      font-family: var(--font-code);
      font-size: $text-sm;
      color: var(--text);
      margin: 0;
    }
  }

  .project__status--completed {
    color: var(--green);
  }
  .project__status--in_progress {
    color: var(--yellow);
  }
  .project__status--archived {
    color: var(--text-muted);
  }

  .project__tags {
    display: flex;
    flex-wrap: wrap;
    gap: $space-2;
    margin: 0 0 $space-5;
  }

  .project__cta {
    display: flex;
    gap: $space-4;
    margin: 0 0 $space-6;
  }

  .project__body {
    color: var(--text);
    line-height: $leading-normal;

    :global(h2) {
      font-family: var(--font-display);
      font-size: $text-base;
      color: var(--cyan);
      text-transform: uppercase;
      margin: $space-6 0 $space-3;
    }

    :global(h3) {
      font-family: var(--font-code);
      font-size: $text-base;
      color: var(--text);
      text-transform: uppercase;
      margin: $space-5 0 $space-3;
    }

    :global(p) {
      margin: 0 0 $space-4;
    }

    :global(ul),
    :global(ol) {
      margin: 0 0 $space-4 $space-5;
    }

    :global(strong) {
      color: var(--green);
    }

    :global(code) {
      font-family: var(--font-code);
      font-size: 0.9em;
      color: var(--cyan);
      background: var(--surface-2);
      padding: 2px 6px;
      border: 1px solid var(--border);
    }

    :global(pre) {
      background: var(--surface-2);
      border: 2px solid var(--border);
      padding: $space-4;
      margin: $space-4 0;
      overflow-x: auto;

      code {
        background: none;
        border: none;
        padding: 0;
      }
    }
  }
</style>
```

- [ ] **Step 2: `pnpm check && pnpm build`**

Expected: 0 errors. В выводе билда:
```
├─ /projects/sport-nutrition/index.html
├─ /projects/real-estate-crm/index.html
├─ /projects/food-delivery-bot/index.html
```

- [ ] **Step 3: Коммит**

```bash
git add src/pages/projects/\[slug\].astro
git commit -m "feat(pages): add /projects/[slug] detail page with MDX rendering"
```

---

### Task 4.11: Contact page + ContactWizard section (статика)

**Files:**
- Create: `src/components/sections/ContactWizard.astro`
- Create: `src/pages/contact.astro`

- [ ] **Step 1: Создать `src/components/sections/ContactWizard.astro`**

```astro
---
import PixelButton from '../ui/PixelButton.astro';
import { CONTACT } from '../../lib/site-config';

const PROJECT_TYPES = [
  { id: 'ecom', label: 'Интернет-магазин', icon: '🛒' },
  { id: 'corp', label: 'Корп. сайт', icon: '🏢' },
  { id: 'crm', label: 'CRM / админка', icon: '⚙️' },
  { id: 'bot', label: 'Бот / автоматизация', icon: '🤖' },
  { id: 'legacy', label: 'Спасти legacy', icon: '💀' },
  { id: 'other', label: 'Другое', icon: '✨' },
] as const;

const TIMELINES = [
  { id: 'asap', label: 'ASAP', desc: 'Горит, сегодня-завтра' },
  { id: 'month', label: 'Месяц', desc: 'Можно вдумчиво' },
  { id: 'quarter', label: 'Квартал', desc: 'Спокойно и хорошо' },
  { id: 'year', label: 'Год+', desc: 'Долгосрочный проект' },
] as const;
---

<section class="wizard">
  <header class="wizard__head">
    <span class="wizard__label">// QUEST FORM</span>
    <h1 class="wizard__title">Начать квест</h1>
    <p class="wizard__intro">
      Заполни — отвечу в течение суток. На M2 форма статичная, реальная отправка в TG появится в следующей итерации.
      Срочно? <a href={`mailto:${CONTACT.email}`}>напиши на email</a> или <a href={CONTACT.telegram}>в Telegram</a>.
    </p>
  </header>

  <form class="wizard__form" method="post" action={`mailto:${CONTACT.email}`} enctype="text/plain">
    <fieldset class="wizard__step">
      <legend>1. Тип проекта</legend>
      <div class="wizard__grid">
        {
          PROJECT_TYPES.map((pt) => (
            <label class="wizard__option">
              <input type="radio" name="projectType" value={pt.id} required />
              <span class="wizard__icon" aria-hidden="true">{pt.icon}</span>
              <span class="wizard__option-label">{pt.label}</span>
            </label>
          ))
        }
      </div>
    </fieldset>

    <fieldset class="wizard__step">
      <legend>2. Бюджет (₽)</legend>
      <input type="number" name="budget" min="10000" step="10000" placeholder="напр. 100000" required />
    </fieldset>

    <fieldset class="wizard__step">
      <legend>3. Сроки</legend>
      <div class="wizard__grid">
        {
          TIMELINES.map((tl) => (
            <label class="wizard__option">
              <input type="radio" name="timeline" value={tl.id} required />
              <span class="wizard__option-label">{tl.label}</span>
              <span class="wizard__option-desc">{tl.desc}</span>
            </label>
          ))
        }
      </div>
    </fieldset>

    <fieldset class="wizard__step">
      <legend>4. Контакт</legend>
      <input type="text" name="name" placeholder="Имя" required />
      <input type="email" name="email" placeholder="Email" required />
    </fieldset>

    <fieldset class="wizard__step">
      <legend>5. Сообщение</legend>
      <textarea name="message" rows="5" placeholder="Расскажи коротко о задаче..." required></textarea>
    </fieldset>

    <div class="wizard__submit">
      <PixelButton type="submit">Отправить</PixelButton>
    </div>
  </form>
</section>

<style lang="scss">
  @use '../../styles/tokens' as *;

  .wizard {
    padding: $space-7 0;
    max-width: 760px;
    margin: 0 auto;
  }

  .wizard__label {
    font-family: var(--font-code);
    font-size: $text-sm;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: $tracking-wide;
  }

  .wizard__title {
    font-family: var(--font-display);
    font-size: $display-lg;
    color: var(--green);
    text-transform: uppercase;
    letter-spacing: $tracking-pixel;
    margin: $space-2 0 $space-4;
  }

  .wizard__intro {
    color: var(--text);
    line-height: $leading-normal;
    margin: 0 0 $space-7;

    a {
      color: var(--cyan);
    }
  }

  .wizard__step {
    border: 4px solid var(--border);
    padding: $space-5;
    margin: 0 0 $space-5;
    background: var(--surface);

    legend {
      font-family: var(--font-display);
      font-size: $text-xs;
      color: var(--cyan);
      text-transform: uppercase;
      letter-spacing: $tracking-pixel;
      padding: 0 $space-3;
    }

    input[type='text'],
    input[type='email'],
    input[type='number'],
    textarea {
      width: 100%;
      padding: $space-3;
      margin-bottom: $space-3;
      background: var(--surface-2);
      border: 2px solid var(--border);
      color: var(--text);
      font-family: var(--font-code);
      font-size: $text-sm;

      &:focus {
        outline: none;
        border-color: var(--cyan);
      }
    }

    textarea {
      resize: vertical;
    }
  }

  .wizard__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: $space-3;
  }

  .wizard__option {
    display: flex;
    flex-direction: column;
    gap: $space-1;
    padding: $space-3;
    border: 2px solid var(--border);
    background: var(--surface-2);
    cursor: pointer;
    transition: border-color 80ms steps(2);

    &:has(input:checked) {
      border-color: var(--green);
      box-shadow: $shadow-pixel-sm var(--green-dim);
    }

    input[type='radio'] {
      position: absolute;
      opacity: 0;
      pointer-events: none;
    }
  }

  .wizard__icon {
    font-size: $text-base;
  }

  .wizard__option-label {
    font-family: var(--font-code);
    font-size: $text-sm;
    color: var(--text);
    text-transform: uppercase;
    letter-spacing: $tracking-pixel;
  }

  .wizard__option-desc {
    font-family: var(--font-body);
    font-size: $text-sm;
    color: var(--text-muted);
  }

  .wizard__submit {
    display: flex;
    justify-content: flex-end;
    margin-top: $space-5;
  }
</style>
```

> Note: `mailto:` action — статичный fallback. Реальная отправка в TG — в M4 как Svelte island, который перехватит submit.

- [ ] **Step 2: Создать `src/pages/contact.astro`**

```astro
---
import { getEntry, render } from 'astro:content';
import MainLayout from '../layouts/MainLayout.astro';
import ContactWizard from '../components/sections/ContactWizard.astro';

const contact = await getEntry('site', 'contact');
---

<MainLayout title="Контакт — flathead" description="Заполни форму или напиши напрямую — отвечу в течение суток.">
  <ContactWizard />
</MainLayout>
```

> Контент `site/contact.mdx` сейчас не используется — поле `title` зарезервировано на будущее, body не нужно. Можно удалить файл, но это контент-вопрос M5.

- [ ] **Step 3: `pnpm check && pnpm build`**

Expected: 0 errors. `dist/contact/index.html` создан с визардом.

- [ ] **Step 4: Коммит**

```bash
git add src/components/sections/ContactWizard.astro src/pages/contact.astro
git commit -m "feat(pages): add /contact with static 5-step wizard (mailto fallback)"
```

---

### Task 4.12: 404 page

**Files:**
- Create: `src/pages/404.astro`

- [ ] **Step 1: Создать `src/pages/404.astro`**

```astro
---
import MainLayout from '../layouts/MainLayout.astro';
import PixelButton from '../components/ui/PixelButton.astro';
---

<MainLayout title="404 — Квест не найден" description="Страница, которую ты ищешь, не существует.">
  <div class="error container">
    <span class="error__code">// ERROR 404</span>
    <h1 class="error__title">Квест не найден</h1>
    <p class="error__msg">
      Эта страница либо никогда не существовала, либо стерта временем. Возвращайся на главную или проверь архив проектов.
    </p>
    <div class="error__cta">
      <PixelButton href="/">На главную</PixelButton>
      <PixelButton href="/projects/" variant="secondary">К проектам</PixelButton>
    </div>
  </div>
</MainLayout>

<style lang="scss">
  @use '../styles/tokens' as *;

  .error {
    padding: $space-9 0;
    text-align: center;
  }

  .error__code {
    font-family: var(--font-code);
    font-size: $text-base;
    color: var(--magenta);
    text-transform: uppercase;
    letter-spacing: $tracking-wide;
  }

  .error__title {
    font-family: var(--font-display);
    font-size: clamp(36px, 8vw, $display-2xl);
    color: var(--magenta);
    text-transform: uppercase;
    letter-spacing: $tracking-pixel;
    line-height: $leading-tight;
    margin: $space-4 0;
  }

  .error__msg {
    color: var(--text);
    max-width: 56ch;
    margin: 0 auto $space-7;
    line-height: $leading-normal;
  }

  .error__cta {
    display: flex;
    gap: $space-4;
    justify-content: center;
    flex-wrap: wrap;
  }
</style>
```

- [ ] **Step 2: `pnpm check && pnpm build`**

Expected: 0 errors. `dist/404.html` создан.

- [ ] **Step 3: Коммит**

```bash
git add src/pages/404.astro
git commit -m "feat(pages): add custom 404"
```

---

### Task 4.13: Final verification и deploy smoke

**Files:** none

- [ ] **Step 1: Финальный `pnpm check && pnpm test && pnpm build && pnpm format:check`**

Run все четыре. Expected:
- check: 0 errors / 0 warnings / 0 hints
- test: 16/16 passed (вся i18n из M1)
- build: 8 страниц → `/`, `/about/`, `/contact/`, `/404`, `/dev/components/`, `/projects/`, `/projects/sport-nutrition/`, `/projects/real-estate-crm/`, `/projects/food-delivery-bot/` (итого 9 HTML)
- format:check: clean

Если что-то падает — починить inline и зафиксировать одним коммитом `fix(m2): final cleanup`.

- [ ] **Step 2: Push и проверка production**

```bash
git push
```

CI задеплоит в ~30-60 секунд. Проверить:
```bash
curl -sI https://pixed-portfolio.pages.dev/
curl -sI https://pixed-portfolio.pages.dev/projects/sport-nutrition/
curl -sI https://pixed-portfolio.pages.dev/about/
curl -sI https://pixed-portfolio.pages.dev/contact/
curl -sI https://pixed-portfolio.pages.dev/404
curl -sI https://pixed-portfolio.pages.dev/dev/components/
```

Все должны вернуть `HTTP/2 200`. 404 — может быть 404 (как кастомная страница).

- [ ] **Step 3: Smoke на проде через браузер (рекомендация)**

Открыть в браузере по очереди:
- `/` — Hero, 2 featured-проекта, скиллы, footer.
- `/projects/` — все 3 проекта в сетке.
- `/projects/sport-nutrition/` — большая страница с обложкой, specs, tags, body, quest log.
- `/about/` — текст + skills + timeline.
- `/contact/` — 5-шаговая статичная форма.
- `/404` — пиксельная страница ошибки.
- `/dev/components/` — все компоненты в showcase.

Главное проверять глазом: pixel-shadows на месте, шрифты загрузились (Tektur для body, Press Start 2P для CAPS-заголовков), кнопки имеют `[ ]` обёртку, навигация sticky, mobile (DevTools narrow) не ломается.

- [ ] **Step 4: Финальный коммит, если потребовался hotfix**

Любые финальные правки для прода — одним коммитом. После этого M2 закрыт.

---

## Verification Checklist (end of M2)

**Build & types:**
- [ ] `pnpm check` — 0 errors / 0 warnings / 0 hints
- [ ] `pnpm test` — 16/16 (i18n из M1 не сломались)
- [ ] `pnpm build` создаёт 9 HTML-страниц (1 home + 1 about + 1 contact + 1 404 + 1 dev/components + 1 projects + 3 projects/[slug])
- [ ] `pnpm format:check` clean

**Pages & content:**
- [ ] `/` показывает Hero, 2 featured-проекта (sport-nutrition + real-estate-crm), все 8 скиллов сгруппированы.
- [ ] `/projects/` показывает все 3 проекта в auto-fill grid.
- [ ] `/projects/sport-nutrition/` рендерит cover, specs, tech-tags, MDX-body со сторителлингом, QuestLog внизу.
- [ ] То же для `/projects/real-estate-crm/` и `/projects/food-delivery-bot/`.
- [ ] `/about/` рендерит body из `site/about.mdx`, скиллы, таймлайн.
- [ ] `/contact/` рендерит 5-шаговый визард, mailto-fallback.
- [ ] `/404` — кастомная страница в магента-цвете.
- [ ] `/dev/components/` отображает все ui- и mdx-компоненты.

**Visuals & UX:**
- [ ] Header sticky сверху, лого слева, nav посередине, переключатели справа (lang-switcher скрыт через CSS-переменную).
- [ ] Footer с copyright и тремя ссылками внизу всех страниц.
- [ ] Все карточки имеют pixel-borders + hard shadows.
- [ ] Кнопки `[BRACKET]` стилизованы.
- [ ] HP-bars скиллов отображают %-заполнение.
- [ ] ★★★☆☆ рейтинг сложности на карточках проектов.
- [ ] Шрифты загружены: Tektur для body, Press Start 2P для CAPS-заголовков, IBM Plex Mono для меток/кода.
- [ ] Mobile (≤480px) — header не ломается, footer стакается вертикально, projects-grid → 1 колонка.

**Production:**
- [ ] CI workflow на push в `main` зелёный.
- [ ] `https://pixed-portfolio.pages.dev/` показывает реальный сайт, не M1 health-check.
- [ ] Все URL отвечают 200.
- [ ] LFS-картинки (cover'ы) загружаются (DevTools Network → 200 на `_image/...avif`).

**Acceptance for is-a.dev (post-M2):**
- [ ] Сайт визуально целостный, не похож на «Hello World» или скаффолд.
- [ ] Минимум 3 проекта со сторителлингом.
- [ ] About и Contact заполнены содержанием.
- [ ] Можно подавать PR в `flathead/register/register-flathead` (Task 0.4 из M1).

---

## What's in / out of M2

**In:**
- Все 6 публичных страниц + 1 dev showcase + кастомная 404.
- Полный набор UI-атомов (PixelCard, PixelButton, PixelDivider, TechBadge, ComplexityStars, HpBar, QuestLog).
- Полный набор MDX-компонентов (Screenshot, Spoiler, Callout, Quest, TechBadge).
- Header/Footer навигация.
- Статичный 5-шаговый ContactWizard с mailto-fallback.
- Декомпозиция layout: BaseLayout → MainLayout → pages.
- site-config.ts как single source of truth для адресов.

**Out (M3+):**
- Любой client-side JS (matrix rain, easter eggs, theme tweaker logic, glitch logo, typewriter, animated HP-bars on scroll).
- View Transitions между страницами.
- Cloudflare Pages Function для contact-form (`/api/contact`).
- Sveltia CMS (`/admin/`).
- Реальные английские тексты (костяк i18n остаётся).
- Lighthouse 95+ оптимизация.
- OpenGraph-image generator (используется default `/og-default.png`, который пока не существует — добавить в M5).
- Editor_components в Sveltia (M4).

---

## Execution Handoff

**Plan complete and saved to `docs/superpowers/plans/2026-04-26-m2-static-site.md`. Two execution options:**

**1. Subagent-Driven (recommended)** — диспатчу свежего сабагента на каждую задачу, ревью между задачами, быстрая итерация.

**2. Inline Execution** — выполняем задачи в текущей сессии через executing-plans, batch с чекпоинтами.

> 📌 **M2 — самая большая фаза по объёму вёрстки** (13 задач × 5+ шагов). Inline-выполнение разумно, если хочется быстрого прогона. Subagent-driven — если хочется подробного ревью каждой страницы. Для UI-кода `pnpm check`, `pnpm build` и визуальный smoke служат основными вратами вместо TDD.

**Какой подход?**
