# Pixed Portfolio Migration — Milestone 3: Theme System & Easter Eggs

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Перевести интерактив, который был в прототипе `pixed_dev_design`, в production-стек на Astro + Svelte 5 islands. После M3 у сайта есть рабочий переключатель из 6 тем с persist в localStorage и набор пасхалок (Konami, тайпинг секретных слов, клики по логотипу, console-команды) — всё, что отличает «личное живое портфолио» от обычной статики.

**Architecture:** Состояние интерактива живёт в одном `src/lib/state.svelte.ts` через Svelte 5 runes (`$state`). Острова Svelte 5 — компактные изолированные модули, гидратируются на `client:idle` или `client:visible`. Тема применяется ДО hydration через inline-script в `<head>`, чтобы избежать FOUC. Все overlay'и (KonamiOverlay, SecretMsg, MatrixRain) — отдельные острова, подписанные на общий стейт.

**Tech Stack:** Astro 6 · Svelte 5 (runes) · TypeScript strict · SCSS · CSS custom properties

**Specs:** [`docs/superpowers/specs/2026-04-25-astro-migration-design.md`](../specs/2026-04-25-astro-migration-design.md) — sections 5.4 (карта островов) и 4 (что keep — Konami, type-eggs, theme tweaker; что cut — cursor trail).

**Source of intent:** реализация в прототипе [`/mnt/shared/Work/pixed_dev_design/index.html`](../../../../pixed_dev_design/index.html) — 6 палитр в `THEMES` объекте, Konami sequence, type-watcher для слов «flathead» и «matrix», matrix-rain canvas, console-команды.

**Locked decisions:**

| Тема | Решение |
|---|---|
| Framework для островов | Svelte 5 (`@astrojs/svelte` уже подключён в M1) |
| State management | Один `src/lib/state.svelte.ts` с `$state` runes — без классических stores и без zustand-подобных библиотек |
| Theme persist | `localStorage` ключ `pdev-theme`, дефолт `matrix` |
| FOUC prevention | Inline-script в `<head>` BaseLayout читает `localStorage` и применяет CSS-vars до парсинга body |
| Hydration стратегии | EasterEggs — `client:idle` (глобальный listener), MatrixRain — `client:idle` (canvas скрыт по умолчанию), ThemeTweaker — `client:visible` (он в sticky-header), LogoGlitch — `client:visible` (он в header) |
| Cursor trail | Не имплементируем (cut по spec секция 4) |
| Анимации Motion One / scroll-driven / View Transitions | Отдельный milestone «Animation Pass» (вне scope M3) |
| Glitch на логотипе | CSS-only `@keyframes glitch1/glitch2` + clip-path — без библиотек |
| Console commands | `window.help/matrix/konami/flathead/hire/coffee/source` — TypeScript module attached on EasterEggs mount |
| Konami sequence | `↑↑↓↓←→←→BA` (как в прототипе, классика) |
| Type-watcher слова | `flathead` → secret msg, `matrix` → toggle matrix rain |
| Logo click trigger | 5 кликов → secret msg + glitch на каждом клике |
| Lang switcher | Остаётся скрытым из M2 (i18n активируется не в M3) |
| Theme apply подход | `document.documentElement.style.setProperty('--green', ...)` для каждой темы |
| Темы (6 палитр) | matrix (default) / amber / cyberpunk / gameboy / synthwave / ocean — точно как в прототипе |

**Out of scope (Animation Pass / M4 / M5):**
- Motion One scroll-reveal, stagger, parallax.
- Astro View Transitions.
- Typewriter в Hero, animated HP-bars on viewport.
- Темы для Highlight.js / Shiki — отдельной задачей при работе над code-блоками.
- Звуковые пасхалки.
- Реальная отправка контактной формы (M4).
- Sveltia CMS (M4).

---

## File Structure

```
src/
├── lib/
│   ├── state.svelte.ts            # NEW: $state runes — easterEggs, theme
│   ├── themes.ts                  # NEW: 6 палитр + applyTheme/getTheme/THEME_KEYS
│   ├── easter-eggs.ts             # NEW: sequence-watchers + console-команды
│   └── (existing)
├── components/
│   ├── islands/                   # NEW directory
│   │   ├── ThemeTweaker.svelte    # NEW: gear-меню в шапке
│   │   ├── EasterEggs.svelte      # NEW: невидимый orchestrator (key listeners)
│   │   ├── MatrixRain.svelte      # NEW: canvas, rAF-рендер
│   │   ├── KonamiOverlay.svelte   # NEW: модальное окно cheat-code
│   │   ├── SecretMsg.svelte       # NEW: toast-сообщение
│   │   └── LogoGlitch.svelte      # NEW: brand с click-счётчиком и glitch
│   ├── nav/
│   │   ├── ThemeTweakerBtn.astro  # DELETE — заменён ThemeTweaker.svelte
│   │   └── Header.astro           # MODIFY: подключить LogoGlitch + ThemeTweaker
│   └── (existing)
├── layouts/
│   └── BaseLayout.astro           # MODIFY: inline pre-hydration theme script
├── styles/
│   └── animations.scss            # MODIFY: добавить glitch1, glitch2 keyframes
├── pages/
│   └── dev/
│       └── easter-eggs.astro      # NEW: dev showcase для KonamiOverlay/SecretMsg/themes
└── docs/
    └── EASTER-EGGS.md             # NEW: гайд по пасхалкам и темам
```

**Новые файлы и их единственная ответственность:**
- `state.svelte.ts` — реактивное хранилище, к которому подписаны все острова. Никакой бизнес-логики.
- `themes.ts` — данные тем + чистая функция `applyTheme(key, root)`. Не трогает DOM напрямую (передаём `root`).
- `easter-eggs.ts` — runtime-логика: parse keyboard sequences, регистрация console-команд. Не рендерит UI.
- `ThemeTweaker.svelte` — gear-кнопка + dropdown с swatches. Подписан на `state.theme`.
- `EasterEggs.svelte` — слушает global keyboard, обновляет `state.easterEggs`. UI = пустой `<svelte:window>`.
- `MatrixRain.svelte` — canvas с rAF, отображается когда `state.easterEggs.matrixActive === true`.
- `KonamiOverlay.svelte` — overlay, отображается когда `state.easterEggs.konamiOpen === true`.
- `SecretMsg.svelte` — toast, отображается когда `state.easterEggs.secretMsg !== null`.
- `LogoGlitch.svelte` — wrapper для бренд-ссылки в Header, держит click-counter, добавляет/снимает класс `glitch`.

---

## Phase 5 — Theme System

### Task 5.1: Themes data + applyTheme helper

**Files:**
- Create: `src/lib/themes.ts`

- [ ] **Step 1: Создать `src/lib/themes.ts`**

```ts
/**
 * Theme palette definitions and pure helpers for applying them.
 *
 * A theme overrides 5 pairs of CSS variables (green/cyan/magenta/yellow/purple
 * and their *-dim siblings). Background, surface, and text variables stay
 * as defined in `tokens.scss` — themes only swap the accent family.
 *
 * Apply a theme by calling `applyTheme(key, document.documentElement)` in
 * the browser. The pre-hydration inline script in BaseLayout uses the same
 * data to set vars before any island mounts.
 */
export const THEME_KEYS = ['matrix', 'amber', 'cyberpunk', 'gameboy', 'synthwave', 'ocean'] as const;
export type ThemeKey = (typeof THEME_KEYS)[number];
export const DEFAULT_THEME: ThemeKey = 'matrix';

interface ThemeDef {
  label: string;
  swatches: readonly [string, string, string]; // 3 colors shown in the picker
  vars: Readonly<Record<string, string>>;
}

export const THEMES: Readonly<Record<ThemeKey, ThemeDef>> = {
  matrix: {
    label: 'Matrix',
    swatches: ['#39ff14', '#00e5ff', '#ff006e'],
    vars: {
      '--green': '#39ff14', '--green-dim': '#0f3d1a',
      '--cyan': '#00e5ff', '--cyan-dim': '#003540',
      '--magenta': '#ff006e', '--magenta-dim': '#40001a',
      '--yellow': '#ffd700', '--yellow-dim': '#403600',
      '--purple': '#9b59b6', '--purple-dim': '#2a1540',
    },
  },
  amber: {
    label: 'Amber CRT',
    swatches: ['#ffb000', '#ff8c00', '#ff006e'],
    vars: {
      '--green': '#ffb000', '--green-dim': '#3d2a00',
      '--cyan': '#ff8c00', '--cyan-dim': '#402000',
      '--magenta': '#ff006e', '--magenta-dim': '#40001a',
      '--yellow': '#ffd700', '--yellow-dim': '#403600',
      '--purple': '#ff5f00', '--purple-dim': '#3d1800',
    },
  },
  cyberpunk: {
    label: 'Cyberpunk',
    swatches: ['#ff00ff', '#00e5ff', '#fff200'],
    vars: {
      '--green': '#ff00ff', '--green-dim': '#400040',
      '--cyan': '#00e5ff', '--cyan-dim': '#003540',
      '--magenta': '#ff0077', '--magenta-dim': '#40001f',
      '--yellow': '#fff200', '--yellow-dim': '#403d00',
      '--purple': '#b26bff', '--purple-dim': '#2a1740',
    },
  },
  gameboy: {
    label: 'Game Boy',
    swatches: ['#9bbc0f', '#8bac0f', '#306230'],
    vars: {
      '--green': '#9bbc0f', '--green-dim': '#1e2a0a',
      '--cyan': '#8bac0f', '--cyan-dim': '#2a3d08',
      '--magenta': '#306230', '--magenta-dim': '#0a1a0a',
      '--yellow': '#cdd6a6', '--yellow-dim': '#3d4033',
      '--purple': '#0f380f', '--purple-dim': '#05100a',
    },
  },
  synthwave: {
    label: 'Synthwave',
    swatches: ['#ff2975', '#ff8a3d', '#00e5ff'],
    vars: {
      '--green': '#ff2975', '--green-dim': '#40001a',
      '--cyan': '#00e5ff', '--cyan-dim': '#003540',
      '--magenta': '#ff8a3d', '--magenta-dim': '#40200f',
      '--yellow': '#fee440', '--yellow-dim': '#403d0f',
      '--purple': '#b347ff', '--purple-dim': '#2a1040',
    },
  },
  ocean: {
    label: 'Deep Sea',
    swatches: ['#4cc9f0', '#7209b7', '#f72585'],
    vars: {
      '--green': '#4cc9f0', '--green-dim': '#0f3340',
      '--cyan': '#7209b7', '--cyan-dim': '#1a0240',
      '--magenta': '#f72585', '--magenta-dim': '#400a1f',
      '--yellow': '#ffd166', '--yellow-dim': '#403520',
      '--purple': '#4361ee', '--purple-dim': '#10173d',
    },
  },
};

export const STORAGE_KEY = 'pdev-theme';

export function isThemeKey(value: unknown): value is ThemeKey {
  return typeof value === 'string' && (THEME_KEYS as readonly string[]).includes(value);
}

export function applyTheme(key: ThemeKey, root: HTMLElement): void {
  const theme = THEMES[key];
  for (const [k, v] of Object.entries(theme.vars)) {
    root.style.setProperty(k, v);
  }
}

export function readStoredTheme(storage: Storage): ThemeKey {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    return isThemeKey(raw) ? raw : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

export function writeStoredTheme(storage: Storage, key: ThemeKey): void {
  try {
    storage.setItem(STORAGE_KEY, key);
  } catch {
    // localStorage may be disabled — fail silently.
  }
}
```

- [ ] **Step 2: Прогнать `pnpm check`**

```bash
pnpm check
```

Expected: `0 errors, 0 warnings, 0 hints`.

- [ ] **Step 3: Коммит**

```bash
git add src/lib/themes.ts
git commit -m "feat(themes): add 6 palette definitions + apply/read/write helpers"
```

---

### Task 5.2: Reactive state runes module

**Files:**
- Create: `src/lib/state.svelte.ts`

- [ ] **Step 1: Создать `src/lib/state.svelte.ts`**

```ts
/**
 * Cross-island reactive state via Svelte 5 runes.
 *
 * Imported by every interactive island so they share one source of truth
 * without resorting to global events or the legacy `writable` store API.
 *
 * The `.svelte.ts` extension is required for `$state` outside of `.svelte`
 * components.
 */
import { DEFAULT_THEME, type ThemeKey } from './themes';

/**
 * Easter egg presentation flags. Toggled by EasterEggs.svelte and consumed
 * by KonamiOverlay/SecretMsg/MatrixRain to decide whether to render.
 */
export const easterEggs = $state({
  konamiOpen: false,
  matrixActive: false,
  secretMsg: null as string | null,
});

/**
 * Currently active theme. Synced to localStorage by ThemeTweaker.svelte.
 * The default is overwritten on mount once the persisted value is read.
 */
export const themeState = $state({
  theme: DEFAULT_THEME as ThemeKey,
});
```

- [ ] **Step 2: `pnpm check`**

Expected: 0 errors.

- [ ] **Step 3: Коммит**

```bash
git add src/lib/state.svelte.ts
git commit -m "feat(state): add cross-island reactive state via Svelte 5 runes"
```

---

### Task 5.3: ThemeTweaker island

**Files:**
- Create: `src/components/islands/ThemeTweaker.svelte`

- [ ] **Step 1: Создать директорию островов**

```bash
mkdir -p src/components/islands
```

- [ ] **Step 2: Создать `src/components/islands/ThemeTweaker.svelte`**

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { themeState } from '../../lib/state.svelte';
  import {
    THEMES,
    THEME_KEYS,
    applyTheme,
    readStoredTheme,
    writeStoredTheme,
    type ThemeKey,
  } from '../../lib/themes';

  let open = $state(false);
  let menuRef = $state<HTMLDivElement | null>(null);

  onMount(() => {
    // Pre-hydration script in BaseLayout has already applied the right CSS
    // vars; here we just sync the reactive store with the persisted value.
    themeState.theme = readStoredTheme(window.localStorage);
  });

  function pick(key: ThemeKey): void {
    themeState.theme = key;
    applyTheme(key, document.documentElement);
    writeStoredTheme(window.localStorage, key);
  }

  function handleDocumentClick(event: MouseEvent): void {
    if (!open) return;
    const target = event.target;
    if (!(target instanceof Node)) return;
    if (menuRef && !menuRef.contains(target)) {
      open = false;
    }
  }

  function handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') open = false;
  }
</script>

<svelte:window onmousedown={handleDocumentClick} onkeydown={handleKeydown} />

<div class="theme-tweaker" bind:this={menuRef}>
  <button
    class="theme-tweaker__btn"
    class:theme-tweaker__btn--active={open}
    type="button"
    aria-label="Theme settings"
    aria-expanded={open}
    onclick={() => (open = !open)}
  >
    ⚙
  </button>

  {#if open}
    <div class="theme-tweaker__menu" role="menu">
      <div class="theme-tweaker__title">// THEME</div>
      {#each THEME_KEYS as key (key)}
        {@const def = THEMES[key]}
        {@const active = themeState.theme === key}
        <button
          class="theme-tweaker__option"
          class:theme-tweaker__option--active={active}
          type="button"
          role="menuitemradio"
          aria-checked={active}
          onclick={() => pick(key)}
        >
          <span class="theme-tweaker__swatches" aria-hidden="true">
            {#each def.swatches as color (color)}
              <span class="theme-tweaker__swatch" style:background={color}></span>
            {/each}
          </span>
          <span class="theme-tweaker__label">{def.label}</span>
          {#if active}
            <span class="theme-tweaker__check" aria-hidden="true">✓</span>
          {/if}
        </button>
      {/each}
    </div>
  {/if}
</div>

<style lang="scss">
  @use '../../styles/tokens' as *;

  .theme-tweaker {
    position: relative;
  }

  .theme-tweaker__btn {
    background: transparent;
    border: none;
    color: var(--text-muted);
    font-size: $text-base;
    cursor: pointer;
    padding: $space-1;
    transition: color 80ms steps(2), transform 200ms steps(8);

    &:hover,
    &--active {
      color: var(--green);
    }

    &--active {
      transform: rotate(90deg);
    }
  }

  .theme-tweaker__menu {
    position: absolute;
    top: calc(100% + #{$space-2});
    right: 0;
    z-index: 60;
    min-width: 240px;
    background: var(--surface);
    border: 4px solid var(--border);
    box-shadow: $shadow-pixel-md var(--border);
    padding: $space-3;
    display: flex;
    flex-direction: column;
    gap: $space-2;
  }

  .theme-tweaker__title {
    font-family: var(--font-display);
    font-size: $text-xs;
    color: var(--green);
    letter-spacing: $tracking-pixel;
    text-transform: uppercase;
    margin-bottom: $space-2;
  }

  .theme-tweaker__option {
    display: flex;
    align-items: center;
    gap: $space-3;
    padding: $space-2 $space-3;
    background: transparent;
    border: 2px solid var(--border);
    color: var(--text);
    font-family: var(--font-code);
    font-size: $text-sm;
    text-align: left;
    cursor: pointer;
    transition: border-color 80ms steps(2), background 80ms steps(2);

    &:hover {
      border-color: var(--cyan);
    }

    &--active {
      border-color: var(--green);
      background: var(--surface-2);
      color: var(--green);
    }
  }

  .theme-tweaker__swatches {
    display: flex;
    gap: 2px;
  }

  .theme-tweaker__swatch {
    width: 14px;
    height: 14px;
    border: 1px solid rgba(0, 0, 0, 0.4);
  }

  .theme-tweaker__label {
    flex: 1;
  }

  .theme-tweaker__check {
    color: var(--green);
  }
</style>
```

- [ ] **Step 3: `pnpm check`**

Expected: 0 errors.

- [ ] **Step 4: Коммит**

```bash
git add src/components/islands/ThemeTweaker.svelte
git commit -m "feat(islands): add ThemeTweaker — gear menu with 6 palette swatches"
```

---

### Task 5.4: Pre-hydration theme apply script

**Files:**
- Modify: `src/layouts/BaseLayout.astro`

- [ ] **Step 1: Прочитать текущий `BaseLayout.astro`**

```bash
cat src/layouts/BaseLayout.astro
```

- [ ] **Step 2: Добавить inline-script перед `</head>`**

В `BaseLayout.astro` найти строку `<meta name="generator" content={Astro.generator} />` и добавить **сразу после неё** блок:

```astro
    <!-- No-FOUC theme apply: read localStorage and set CSS vars before body parses. -->
    <script is:inline>
      (function () {
        try {
          var KEY = 'pdev-theme';
          var DEFAULT = 'matrix';
          var THEMES = {
            matrix: {
              '--green': '#39ff14', '--green-dim': '#0f3d1a',
              '--cyan': '#00e5ff', '--cyan-dim': '#003540',
              '--magenta': '#ff006e', '--magenta-dim': '#40001a',
              '--yellow': '#ffd700', '--yellow-dim': '#403600',
              '--purple': '#9b59b6', '--purple-dim': '#2a1540',
            },
            amber: {
              '--green': '#ffb000', '--green-dim': '#3d2a00',
              '--cyan': '#ff8c00', '--cyan-dim': '#402000',
              '--magenta': '#ff006e', '--magenta-dim': '#40001a',
              '--yellow': '#ffd700', '--yellow-dim': '#403600',
              '--purple': '#ff5f00', '--purple-dim': '#3d1800',
            },
            cyberpunk: {
              '--green': '#ff00ff', '--green-dim': '#400040',
              '--cyan': '#00e5ff', '--cyan-dim': '#003540',
              '--magenta': '#ff0077', '--magenta-dim': '#40001f',
              '--yellow': '#fff200', '--yellow-dim': '#403d00',
              '--purple': '#b26bff', '--purple-dim': '#2a1740',
            },
            gameboy: {
              '--green': '#9bbc0f', '--green-dim': '#1e2a0a',
              '--cyan': '#8bac0f', '--cyan-dim': '#2a3d08',
              '--magenta': '#306230', '--magenta-dim': '#0a1a0a',
              '--yellow': '#cdd6a6', '--yellow-dim': '#3d4033',
              '--purple': '#0f380f', '--purple-dim': '#05100a',
            },
            synthwave: {
              '--green': '#ff2975', '--green-dim': '#40001a',
              '--cyan': '#00e5ff', '--cyan-dim': '#003540',
              '--magenta': '#ff8a3d', '--magenta-dim': '#40200f',
              '--yellow': '#fee440', '--yellow-dim': '#403d0f',
              '--purple': '#b347ff', '--purple-dim': '#2a1040',
            },
            ocean: {
              '--green': '#4cc9f0', '--green-dim': '#0f3340',
              '--cyan': '#7209b7', '--cyan-dim': '#1a0240',
              '--magenta': '#f72585', '--magenta-dim': '#400a1f',
              '--yellow': '#ffd166', '--yellow-dim': '#403520',
              '--purple': '#4361ee', '--purple-dim': '#10173d',
            },
          };
          var stored = window.localStorage.getItem(KEY);
          var key = (stored && THEMES[stored]) ? stored : DEFAULT;
          var vars = THEMES[key];
          var root = document.documentElement;
          for (var name in vars) {
            if (Object.prototype.hasOwnProperty.call(vars, name)) {
              root.style.setProperty(name, vars[name]);
            }
          }
        } catch (e) {
          /* localStorage disabled — fall through to CSS defaults from tokens.scss */
        }
      })();
    </script>
```

> Важно: палитры здесь дублируют `src/lib/themes.ts`. Это сознательно — inline-script должен быть самодостаточным, импорты из ESM-модулей блокировали бы его. При смене палитр держим оба файла в синхроне (см. EASTER-EGGS.md для процесса).

- [ ] **Step 3: `pnpm check && rm -rf dist .astro && ASTRO_IMAGES=passthrough pnpm build`**

Expected: 0 errors, 9 страниц.

- [ ] **Step 4: Smoke (no-FOUC)**

```bash
ASTRO_IMAGES=passthrough pnpm dev
```

Открыть `http://localhost:4321/`. В DevTools Console:
```js
localStorage.setItem('pdev-theme', 'amber'); location.reload();
```
Страница должна сразу появиться в янтарной палитре, без зелёной вспышки.

- [ ] **Step 5: Коммит**

```bash
git add src/layouts/BaseLayout.astro
git commit -m "feat(themes): no-FOUC pre-hydration theme apply via inline script"
```

---

### Task 5.5: Wire ThemeTweaker into Header

**Files:**
- Modify: `src/components/nav/Header.astro`
- Delete: `src/components/nav/ThemeTweakerBtn.astro`

- [ ] **Step 1: Удалить старый placeholder**

```bash
rm src/components/nav/ThemeTweakerBtn.astro
```

- [ ] **Step 2: В `src/components/nav/Header.astro` заменить импорт**

В блоке frontmatter заменить:

```astro
import ThemeTweakerBtn from './ThemeTweakerBtn.astro';
```

на:

```astro
import ThemeTweaker from '../islands/ThemeTweaker.svelte';
```

- [ ] **Step 3: В разметке Header заменить `<ThemeTweakerBtn />`**

Заменить:

```astro
<ThemeTweakerBtn />
```

на:

```astro
<ThemeTweaker client:visible />
```

- [ ] **Step 4: `pnpm check && pnpm format && rm -rf dist .astro && ASTRO_IMAGES=passthrough pnpm build`**

Expected: 0 errors, билд успешен. В `dist/_astro/` появится chunk для ThemeTweaker.

- [ ] **Step 5: Коммит**

```bash
git add src/components/nav/Header.astro src/components/nav/ThemeTweakerBtn.astro
git commit -m "feat(nav): replace theme placeholder with live ThemeTweaker island"
```

---

## Phase 6 — Easter Eggs

### Task 6.1: Easter eggs runtime module

**Files:**
- Create: `src/lib/easter-eggs.ts`

- [ ] **Step 1: Создать `src/lib/easter-eggs.ts`**

```ts
/**
 * Runtime helpers for hidden interactions:
 *   • parsing and matching keyboard sequences (Konami, typed words)
 *   • registering window-level console commands
 *
 * The orchestrator (`EasterEggs.svelte`) wires these helpers to the
 * reactive `easterEggs` state.
 */
import { easterEggs } from './state.svelte';

export const KONAMI_SEQUENCE = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'KeyB',
  'KeyA',
] as const;

export const SECRETS = {
  flathead: 'Потому. Просто потому. 🤷',
  hire: 'hire(): отправляйся на /contact/ и заполняй квест-форму.',
  coffee: '☕ +1 cup. Эффективность +50% на ближайший час.',
  source: 'github.com/flathead/pixed-portfolio — звездани, если нравится.',
  logoFive: 'printf("Hello, secret hunter!\\n"); // ты кликнул 5 раз. уважаю.',
} as const;

/**
 * Match a typed sequence against a target word. Returns true on success
 * and resets the sequence buffer; the caller stores the buffer between
 * keystrokes.
 */
export function matchTyped(buffer: string, target: string): boolean {
  return buffer.toLowerCase().endsWith(target.toLowerCase());
}

/**
 * Match a key-code sequence against the Konami pattern.
 */
export function matchKonami(buffer: readonly string[]): boolean {
  if (buffer.length < KONAMI_SEQUENCE.length) return false;
  const tail = buffer.slice(-KONAMI_SEQUENCE.length);
  return tail.every((code, i) => code === KONAMI_SEQUENCE[i]);
}

/**
 * Hook console commands onto `window`. Idempotent — safe to call multiple
 * times; later calls overwrite the same names.
 */
export function registerConsoleCommands(): void {
  if (typeof window === 'undefined') return;

  const w = window as Window & Record<string, unknown>;

  w.help = () => {
    /* eslint-disable no-console */
    console.log(
      '%cflathead.dev — секретные команды:\n' +
        '  hire()       — нанять разработчика\n' +
        '  coffee()     — добавить кофе\n' +
        '  konami()     — читкод\n' +
        '  matrix()     — войти в матрицу\n' +
        '  flathead()   — секрет\n' +
        '  source()     — исходники',
      'color:#39ff14;font-family:monospace;line-height:1.5;',
    );
    return '— see above —';
  };

  w.konami = () => {
    easterEggs.konamiOpen = true;
    return '+99 to PHP';
  };

  w.matrix = () => {
    easterEggs.matrixActive = !easterEggs.matrixActive;
    return easterEggs.matrixActive ? 'enter the matrix' : 'leaving';
  };

  w.flathead = () => {
    easterEggs.secretMsg = SECRETS.flathead;
    return SECRETS.flathead;
  };

  w.hire = () => {
    easterEggs.secretMsg = SECRETS.hire;
    return SECRETS.hire;
  };

  w.coffee = () => {
    easterEggs.secretMsg = SECRETS.coffee;
    return SECRETS.coffee;
  };

  w.source = () => {
    easterEggs.secretMsg = SECRETS.source;
    return SECRETS.source;
  };
}
```

- [ ] **Step 2: Написать unit-тесты**

`tests/lib/easter-eggs.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { KONAMI_SEQUENCE, matchKonami, matchTyped } from '~/lib/easter-eggs';

describe('matchTyped', () => {
  it('matches when buffer ends with target', () => {
    expect(matchTyped('xxflathead', 'flathead')).toBe(true);
  });

  it('is case-insensitive', () => {
    expect(matchTyped('FLATHEAD', 'flathead')).toBe(true);
    expect(matchTyped('flathead', 'FLATHEAD')).toBe(true);
  });

  it('does not match when target absent', () => {
    expect(matchTyped('hello', 'flathead')).toBe(false);
  });

  it('matches even if buffer has extra prefix', () => {
    expect(matchTyped('aaaaaaaaaaflathead', 'flathead')).toBe(true);
  });
});

describe('matchKonami', () => {
  it('matches the canonical sequence', () => {
    expect(matchKonami([...KONAMI_SEQUENCE])).toBe(true);
  });

  it('matches when sequence is at the end of a longer buffer', () => {
    expect(matchKonami(['Tab', 'Tab', ...KONAMI_SEQUENCE])).toBe(true);
  });

  it('does not match an incomplete sequence', () => {
    expect(matchKonami(KONAMI_SEQUENCE.slice(0, 5))).toBe(false);
  });

  it('does not match a wrong sequence of equal length', () => {
    const wrong = KONAMI_SEQUENCE.map(() => 'KeyZ');
    expect(matchKonami(wrong)).toBe(false);
  });
});
```

- [ ] **Step 3: Запустить тесты — должны пройти после написания реализации (она уже выше)**

```bash
pnpm test
```

Expected: `Tests  20 passed (20)` (16 i18n + 4 typed + 4 konami).

- [ ] **Step 4: Коммит**

```bash
git add src/lib/easter-eggs.ts tests/lib/easter-eggs.test.ts
git commit -m "feat(easter-eggs): sequence matchers + console commands with tests"
```

---

### Task 6.2: KonamiOverlay island

**Files:**
- Create: `src/components/islands/KonamiOverlay.svelte`
- Modify: `src/styles/animations.scss` — add `levelup` keyframe

- [ ] **Step 1: Добавить keyframe `levelup` в `src/styles/animations.scss`**

В конец файла добавить:

```scss
@keyframes levelup {
  0% {
    transform: scale(0.5);
    opacity: 0;
  }
  60% {
    transform: scale(1.08);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
```

- [ ] **Step 2: Создать `src/components/islands/KonamiOverlay.svelte`**

```svelte
<script lang="ts">
  import { easterEggs } from '../../lib/state.svelte';

  function close(): void {
    easterEggs.konamiOpen = false;
  }

  function handleKey(event: KeyboardEvent): void {
    if (!easterEggs.konamiOpen) return;
    if (event.key === 'Escape' || event.key === 'Enter') close();
  }
</script>

<svelte:window onkeydown={handleKey} />

{#if easterEggs.konamiOpen}
  <div
    class="overlay"
    role="dialog"
    aria-modal="true"
    aria-label="Cheat code activated"
    onclick={close}
    onkeydown={handleKey}
    tabindex="-1"
  >
    <div class="overlay__box" role="alert">
      <div class="overlay__title">CHEAT CODE</div>
      <div class="overlay__sub">GODMODE ENABLED</div>
      <div class="overlay__body">
        +99 к PHP · +99 к Laravel<br />
        +99 к кофе · +99 к удаче<br />
        Ты нашёл пасхалку. Уважение.
      </div>
      <div class="overlay__hint">[click anywhere · Esc · Enter]</div>
    </div>
  </div>
{/if}

<style lang="scss">
  @use '../../styles/tokens' as *;

  .overlay {
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.92);
    cursor: pointer;
  }

  .overlay__box {
    background: var(--surface);
    border: 4px solid var(--green);
    box-shadow:
      0 0 40px var(--green),
      $shadow-pixel-lg var(--green-dim);
    padding: $space-7 $space-9;
    text-align: center;
    animation: levelup 0.4s steps(8) forwards;
    cursor: default;
  }

  .overlay__title {
    font-family: var(--font-display);
    font-size: $text-xl;
    color: var(--green);
    text-shadow: 0 0 20px var(--green);
    margin-bottom: $space-3;
    letter-spacing: $tracking-pixel;
  }

  .overlay__sub {
    font-family: var(--font-display);
    font-size: $text-base;
    color: var(--yellow);
    margin-bottom: $space-4;
    letter-spacing: $tracking-pixel;
  }

  .overlay__body {
    font-family: var(--font-body);
    font-size: $text-lg;
    color: var(--text);
    line-height: $leading-normal;
    margin-bottom: $space-5;
    max-width: 360px;
  }

  .overlay__hint {
    font-family: var(--font-code);
    font-size: $text-sm;
    color: var(--text-muted);
  }
</style>
```

- [ ] **Step 3: `pnpm check`**

Expected: 0 errors.

- [ ] **Step 4: Коммит**

```bash
git add src/components/islands/KonamiOverlay.svelte src/styles/animations.scss
git commit -m "feat(easter-eggs): KonamiOverlay island + levelup keyframe"
```

---

### Task 6.3: SecretMsg island

**Files:**
- Create: `src/components/islands/SecretMsg.svelte`

- [ ] **Step 1: Создать `src/components/islands/SecretMsg.svelte`**

```svelte
<script lang="ts">
  import { easterEggs } from '../../lib/state.svelte';

  function close(): void {
    easterEggs.secretMsg = null;
  }

  function handleKey(event: KeyboardEvent): void {
    if (easterEggs.secretMsg && event.key === 'Escape') close();
  }
</script>

<svelte:window onkeydown={handleKey} />

{#if easterEggs.secretMsg}
  <button
    class="msg"
    type="button"
    onclick={close}
    aria-label="Dismiss secret message"
  >
    <div class="msg__head">// secret.txt</div>
    <div class="msg__body">{easterEggs.secretMsg}</div>
    <div class="msg__hint">[click · Esc]</div>
  </button>
{/if}

<style lang="scss">
  @use '../../styles/tokens' as *;

  .msg {
    position: fixed;
    bottom: $space-7;
    left: 50%;
    transform: translateX(-50%);
    z-index: 500;
    background: var(--surface);
    border: 4px solid var(--magenta);
    box-shadow: $shadow-pixel-md var(--magenta-dim);
    padding: $space-4 $space-6;
    text-align: left;
    cursor: pointer;
    animation: px-enter 0.3s steps(8) forwards;
    max-width: min(560px, calc(100vw - #{$space-5}));
    color: var(--text);
    font-family: var(--font-body);
  }

  .msg__head {
    font-family: var(--font-code);
    font-size: $text-sm;
    color: var(--magenta);
    margin-bottom: $space-2;
    letter-spacing: $tracking-pixel;
  }

  .msg__body {
    font-size: $text-base;
    line-height: $leading-normal;
    margin-bottom: $space-2;
  }

  .msg__hint {
    font-family: var(--font-code);
    font-size: $text-xs;
    color: var(--text-muted);
  }
</style>
```

- [ ] **Step 2: `pnpm check`**

Expected: 0 errors.

- [ ] **Step 3: Коммит**

```bash
git add src/components/islands/SecretMsg.svelte
git commit -m "feat(easter-eggs): SecretMsg toast island"
```

---

### Task 6.4: MatrixRain island

**Files:**
- Create: `src/components/islands/MatrixRain.svelte`

- [ ] **Step 1: Создать `src/components/islands/MatrixRain.svelte`**

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { easterEggs } from '../../lib/state.svelte';

  let canvasRef = $state<HTMLCanvasElement | null>(null);
  let raf = 0;
  let drops: number[] = [];
  let cols = 0;

  const CHARS =
    'アイウエオカキクケコサシスセソタチツテトナニヌネノABCDEF0123456789{}[]<>/\\|';
  const CELL = 14;

  function resize(canvas: HTMLCanvasElement): void {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    cols = Math.floor(canvas.width / CELL);
    drops = new Array(cols).fill(1);
  }

  function draw(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle =
      getComputedStyle(document.documentElement).getPropertyValue('--green').trim() ||
      '#39ff14';
    ctx.font = '13px "IBM Plex Mono", monospace';
    for (let i = 0; i < drops.length; i++) {
      const ch = CHARS[Math.floor(Math.random() * CHARS.length)];
      ctx.fillText(ch, i * CELL, drops[i] * CELL);
      if (drops[i] * CELL > canvas.height && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    }
  }

  onMount(() => {
    const canvas = canvasRef;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    resize(canvas);
    const onResize = (): void => resize(canvas);
    window.addEventListener('resize', onResize);

    const loop = (): void => {
      if (easterEggs.matrixActive) draw(canvas, ctx);
      raf = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
    };
  });

  function dismiss(): void {
    easterEggs.matrixActive = false;
  }
</script>

<canvas
  bind:this={canvasRef}
  class="matrix"
  class:matrix--active={easterEggs.matrixActive}
  onclick={dismiss}
  aria-hidden="true"
></canvas>

<style lang="scss">
  .matrix {
    position: fixed;
    inset: 0;
    z-index: 8000;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.5s steps(10);

    &--active {
      opacity: 1;
      pointer-events: auto;
      cursor: pointer;
    }
  }
</style>
```

- [ ] **Step 2: `pnpm check`**

Expected: 0 errors.

- [ ] **Step 3: Коммит**

```bash
git add src/components/islands/MatrixRain.svelte
git commit -m "feat(easter-eggs): MatrixRain canvas island"
```

---

### Task 6.5: LogoGlitch island + glitch keyframes

**Files:**
- Create: `src/components/islands/LogoGlitch.svelte`
- Modify: `src/styles/animations.scss` — add `glitch1`, `glitch2`

- [ ] **Step 1: Расширить `src/styles/animations.scss`**

В конец файла добавить:

```scss
@keyframes glitch1 {
  0%, 100% {
    clip-path: inset(40% 0 61% 0);
  }
  20% {
    clip-path: inset(92% 0 1% 0);
  }
  40% {
    clip-path: inset(43% 0 1% 0);
  }
  60% {
    clip-path: inset(25% 0 58% 0);
  }
  80% {
    clip-path: inset(54% 0 7% 0);
  }
}

@keyframes glitch2 {
  0%, 100% {
    clip-path: inset(15% 0 70% 0);
  }
  25% {
    clip-path: inset(80% 0 5% 0);
  }
  50% {
    clip-path: inset(50% 0 35% 0);
  }
  75% {
    clip-path: inset(35% 0 50% 0);
  }
}
```

- [ ] **Step 2: Создать `src/components/islands/LogoGlitch.svelte`**

```svelte
<script lang="ts">
  import { easterEggs } from '../../lib/state.svelte';
  import { SECRETS } from '../../lib/easter-eggs';

  interface Props {
    href?: string;
    text: string;
  }

  let { href = '/', text }: Props = $props();

  let clicks = $state(0);
  let glitching = $state(false);
  let glitchTimer = 0;

  function handleClick(event: MouseEvent): void {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;

    clicks += 1;
    glitching = true;
    window.clearTimeout(glitchTimer);
    glitchTimer = window.setTimeout(() => (glitching = false), 400);

    if (clicks >= 5) {
      event.preventDefault();
      easterEggs.secretMsg = SECRETS.logoFive;
      clicks = 0;
    }
  }
</script>

<a
  {href}
  class="brand"
  class:brand--glitching={glitching}
  data-text={text}
  onclick={handleClick}
>
  <span class="brand__bracket">[</span>
  <span class="brand__name">{text}</span>
  <span class="brand__bracket">]</span>
  {#if clicks > 0 && clicks < 5}
    <span class="brand__hint">{5 - clicks}...</span>
  {/if}
</a>

<style lang="scss">
  @use '../../styles/tokens' as *;

  .brand {
    position: relative;
    display: inline-flex;
    align-items: baseline;
    gap: $space-1;
    font-family: var(--font-display);
    font-size: $text-xs;
    color: var(--green);
    letter-spacing: $tracking-pixel;
    text-transform: uppercase;
    text-decoration: none;
    cursor: pointer;
    user-select: none;
  }

  .brand__bracket {
    color: var(--green);
  }

  .brand__name {
    color: var(--text);
    transition: color 80ms steps(2);
  }

  .brand:hover .brand__name {
    color: var(--cyan);
  }

  .brand__hint {
    font-family: var(--font-code);
    font-size: 9px;
    color: var(--text-muted);
    margin-left: $space-2;
  }

  .brand--glitching::before,
  .brand--glitching::after {
    content: attr(data-text);
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }

  .brand--glitching::before {
    color: var(--magenta);
    animation: glitch1 0.3s steps(2) infinite;
  }

  .brand--glitching::after {
    color: var(--cyan);
    animation: glitch2 0.3s steps(2) 0.1s infinite;
  }
</style>
```

- [ ] **Step 3: `pnpm check`**

Expected: 0 errors.

- [ ] **Step 4: Коммит**

```bash
git add src/components/islands/LogoGlitch.svelte src/styles/animations.scss
git commit -m "feat(easter-eggs): LogoGlitch island with click counter + glitch keyframes"
```

---

### Task 6.6: EasterEggs orchestrator island

**Files:**
- Create: `src/components/islands/EasterEggs.svelte`

- [ ] **Step 1: Создать `src/components/islands/EasterEggs.svelte`**

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { easterEggs } from '../../lib/state.svelte';
  import {
    SECRETS,
    matchKonami,
    matchTyped,
    registerConsoleCommands,
  } from '../../lib/easter-eggs';

  const TYPED_BUFFER_LIMIT = 12;
  const KEY_BUFFER_LIMIT = 12;

  let typedBuffer = '';
  let keyBuffer: string[] = [];

  function isInputTarget(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) return false;
    const tag = target.tagName;
    return tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable;
  }

  function handleKeydown(event: KeyboardEvent): void {
    if (isInputTarget(event.target)) return;

    keyBuffer = [...keyBuffer, event.code].slice(-KEY_BUFFER_LIMIT);
    if (matchKonami(keyBuffer)) {
      easterEggs.konamiOpen = true;
      keyBuffer = [];
      return;
    }

    if (event.key.length === 1) {
      typedBuffer = (typedBuffer + event.key).slice(-TYPED_BUFFER_LIMIT);
      if (matchTyped(typedBuffer, 'flathead')) {
        easterEggs.secretMsg = SECRETS.flathead;
        typedBuffer = '';
        return;
      }
      if (matchTyped(typedBuffer, 'matrix')) {
        easterEggs.matrixActive = !easterEggs.matrixActive;
        typedBuffer = '';
        return;
      }
    }
  }

  onMount(() => {
    registerConsoleCommands();
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  });
</script>
```

> Этот компонент **рендерит пустоту** — он только подписывается на события и обновляет общий стейт. Overlay'и (Konami, SecretMsg, Matrix) — отдельные острова, которые читают тот же стейт.

- [ ] **Step 2: `pnpm check`**

Expected: 0 errors.

- [ ] **Step 3: Коммит**

```bash
git add src/components/islands/EasterEggs.svelte
git commit -m "feat(easter-eggs): EasterEggs orchestrator wires keyboard to state"
```

---

## Phase 7 — Integration & Documentation

### Task 7.1: Wire islands into BaseLayout

**Files:**
- Modify: `src/layouts/BaseLayout.astro`

- [ ] **Step 1: Прочитать файл**

```bash
cat src/layouts/BaseLayout.astro
```

- [ ] **Step 2: В блоке frontmatter добавить импорты**

В начало `---` блока (рядом с другими импортами):

```astro
import EasterEggs from '../components/islands/EasterEggs.svelte';
import KonamiOverlay from '../components/islands/KonamiOverlay.svelte';
import SecretMsg from '../components/islands/SecretMsg.svelte';
import MatrixRain from '../components/islands/MatrixRain.svelte';
```

- [ ] **Step 3: Перед закрытием `</body>` подключить острова**

Сразу после `<slot />` и перед `</body>` добавить:

```astro
    <EasterEggs client:idle />
    <KonamiOverlay client:idle />
    <SecretMsg client:idle />
    <MatrixRain client:idle />
```

- [ ] **Step 4: `pnpm check && rm -rf dist .astro && ASTRO_IMAGES=passthrough pnpm build`**

Expected: 0 errors, билд успешен. В `dist/_astro/` появятся chunks для каждого острова.

- [ ] **Step 5: Smoke-тест в `pnpm dev`**

```bash
ASTRO_IMAGES=passthrough pnpm dev
```

Открыть `/`, протестировать:
- Konami последовательность `↑↑↓↓←→←→BA` → появляется overlay.
- Набрать `flathead` → secret msg.
- Набрать `matrix` → matrix rain включается, ещё раз → выключается.
- В DevTools console: `help()` → выводит список команд. `konami()`, `flathead()` — триггерят соответствующие пасхалки.

- [ ] **Step 6: Коммит**

```bash
git add src/layouts/BaseLayout.astro
git commit -m "feat(layout): mount EasterEggs orchestrator + overlay islands"
```

---

### Task 7.2: Replace Header brand with LogoGlitch

**Files:**
- Modify: `src/components/nav/Header.astro`

- [ ] **Step 1: В frontmatter добавить импорт**

В блоке `---` рядом с другими импортами:

```astro
import LogoGlitch from '../islands/LogoGlitch.svelte';
```

- [ ] **Step 2: Заменить статичный бренд**

Было:

```astro
<a href="/" class="header__brand">[ {SITE.author}.dev ]</a>
```

Заменить на:

```astro
<LogoGlitch client:visible href="/" text={`${SITE.author}.dev`} />
```

И **удалить** блок CSS-правил `.header__brand` из тега `<style>` — стили теперь живут в самом `LogoGlitch.svelte`.

- [ ] **Step 3: `pnpm check && pnpm format`**

Expected: 0 errors, format clean.

- [ ] **Step 4: Smoke-тест**

```bash
ASTRO_IMAGES=passthrough pnpm dev
```

Открыть `/`. Кликнуть лого 1, 2, 3, 4 раза — должна появляться подсказка `5−clicks...`. На пятый клик — secret msg «Hello, secret hunter!». На каждом клике — кратковременный glitch-эффект.

- [ ] **Step 5: Коммит**

```bash
git add src/components/nav/Header.astro
git commit -m "feat(nav): replace static brand with interactive LogoGlitch island"
```

---

### Task 7.3: Dev showcase — easter eggs

**Files:**
- Create: `src/pages/dev/easter-eggs.astro`

- [ ] **Step 1: Создать `src/pages/dev/easter-eggs.astro`**

```astro
---
/**
 * Dev-only showcase for the easter-egg overlays and theme palettes.
 * Lets you trigger each interaction manually instead of needing to
 * type the right sequence on every UI tweak.
 */
import MainLayout from '../../layouts/MainLayout.astro';
import PixelButton from '../../components/ui/PixelButton.astro';
import PixelDivider from '../../components/ui/PixelDivider.astro';
import { THEMES, THEME_KEYS } from '../../lib/themes';
---

<MainLayout title="Easter eggs — dev" description="Manual triggers for hidden interactions">
  <div class="container ee-dev">
    <header class="ee-dev__head">
      <span class="ee-dev__label">// DEV</span>
      <h1 class="ee-dev__title">Easter eggs &amp; themes</h1>
      <p class="ee-dev__intro">
        Ручные триггеры для каждой пасхалки — не надо набирать комбинации руками
        каждый раз при правке UI. Откройте DevTools console и используйте команды
        ниже или нажмите на кнопки.
      </p>
    </header>

    <section class="ee-dev__section">
      <h2 class="ee-dev__h2">Triggers (DevTools console)</h2>
      <ul class="ee-dev__list">
        <li><code>help()</code> — список всех команд.</li>
        <li><code>konami()</code> — открывает GODMODE-overlay.</li>
        <li><code>matrix()</code> — переключает matrix rain.</li>
        <li><code>flathead()</code>, <code>hire()</code>, <code>coffee()</code>, <code>source()</code> — секретные сообщения.</li>
      </ul>
    </section>

    <PixelDivider accent="green" />

    <section class="ee-dev__section">
      <h2 class="ee-dev__h2">Sequences</h2>
      <ul class="ee-dev__list">
        <li>Konami: <code>↑ ↑ ↓ ↓ ← → ← → B A</code></li>
        <li>Тайпинг <code>flathead</code> в любом месте (вне input/textarea) — secret msg.</li>
        <li>Тайпинг <code>matrix</code> — toggle matrix rain.</li>
        <li>5 кликов по логотипу в шапке — secret msg + glitch на каждом клике.</li>
      </ul>
    </section>

    <PixelDivider accent="cyan" />

    <section class="ee-dev__section">
      <h2 class="ee-dev__h2">Themes overview</h2>
      <p class="ee-dev__hint">
        Текущая тема живёт в <code>localStorage['pdev-theme']</code>. Меню — шестерёнка
        в шапке справа.
      </p>
      <ul class="ee-dev__themes">
        {
          THEME_KEYS.map((key) => {
            const def = THEMES[key];
            return (
              <li class="ee-dev__theme">
                <div class="ee-dev__swatches" aria-hidden="true">
                  {def.swatches.map((c) => (
                    <span class="ee-dev__swatch" style={`background:${c};`} />
                  ))}
                </div>
                <span class="ee-dev__theme-name">{def.label}</span>
                <code class="ee-dev__theme-key">{key}</code>
              </li>
            );
          })
        }
      </ul>
    </section>

    <PixelDivider accent="magenta" />

    <section class="ee-dev__section">
      <h2 class="ee-dev__h2">Manual button triggers</h2>
      <p class="ee-dev__hint">
        На самом сайте этих кнопок не будет — это dev-only ярлыки.
      </p>
      <div class="ee-dev__buttons">
        <PixelButton variant="primary" class="js-trigger-konami">Trigger konami()</PixelButton>
        <PixelButton variant="secondary" class="js-trigger-matrix">Trigger matrix()</PixelButton>
        <PixelButton variant="danger" class="js-trigger-flathead">Trigger flathead()</PixelButton>
      </div>
    </section>
  </div>
</MainLayout>

<script>
  document.querySelector('.js-trigger-konami')?.addEventListener('click', () => {
    (window as unknown as { konami?: () => void }).konami?.();
  });
  document.querySelector('.js-trigger-matrix')?.addEventListener('click', () => {
    (window as unknown as { matrix?: () => void }).matrix?.();
  });
  document.querySelector('.js-trigger-flathead')?.addEventListener('click', () => {
    (window as unknown as { flathead?: () => void }).flathead?.();
  });
</script>

<style lang="scss">
  @use '../../styles/tokens' as *;

  .ee-dev {
    padding: $space-6 0;
  }

  .ee-dev__label {
    font-family: var(--font-code);
    font-size: $text-sm;
    color: var(--text-muted);
    letter-spacing: $tracking-wide;
    text-transform: uppercase;
  }

  .ee-dev__title {
    font-family: var(--font-display);
    font-size: $display-md;
    color: var(--green);
    text-transform: uppercase;
    letter-spacing: $tracking-pixel;
    margin: $space-2 0 $space-3;
  }

  .ee-dev__intro {
    color: var(--text);
    line-height: $leading-normal;
    max-width: 70ch;
    margin: 0 0 $space-7;
  }

  .ee-dev__section {
    margin-bottom: $space-7;
  }

  .ee-dev__h2 {
    font-family: var(--font-display);
    font-size: $text-base;
    color: var(--cyan);
    text-transform: uppercase;
    letter-spacing: $tracking-pixel;
    margin: 0 0 $space-3;
  }

  .ee-dev__hint {
    color: var(--text-muted);
    font-size: $text-sm;
    margin: 0 0 $space-4;
  }

  .ee-dev__list {
    color: var(--text);
    line-height: $leading-normal;
    margin: 0 0 0 $space-5;
    padding: 0;
  }

  code {
    font-family: var(--font-code);
    font-size: 0.9em;
    color: var(--cyan);
    background: var(--surface-2);
    padding: 1px 6px;
    border: 1px solid var(--border);
  }

  .ee-dev__themes {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: $space-3;
  }

  .ee-dev__theme {
    display: flex;
    align-items: center;
    gap: $space-3;
    padding: $space-3;
    border: 2px solid var(--border);
    background: var(--surface);
  }

  .ee-dev__swatches {
    display: flex;
    gap: 2px;
  }

  .ee-dev__swatch {
    width: 14px;
    height: 14px;
    border: 1px solid rgba(0, 0, 0, 0.4);
  }

  .ee-dev__theme-name {
    flex: 1;
    font-family: var(--font-code);
    font-size: $text-sm;
    color: var(--text);
    text-transform: uppercase;
    letter-spacing: $tracking-pixel;
  }

  .ee-dev__theme-key {
    font-size: 0.85em;
  }

  .ee-dev__buttons {
    display: flex;
    flex-wrap: wrap;
    gap: $space-3;
  }
</style>
```

- [ ] **Step 2: `pnpm check && pnpm format`**

Expected: 0 errors, format clean.

- [ ] **Step 3: Smoke в dev**

Открыть `http://localhost:4321/dev/easter-eggs/` — все 6 палитр в превью, 3 кнопки-триггера, секции описания.

- [ ] **Step 4: Коммит**

```bash
git add src/pages/dev/easter-eggs.astro
git commit -m "feat(dev): /dev/easter-eggs showcase with manual triggers and theme grid"
```

---

### Task 7.4: Documentation

**Files:**
- Create: `docs/EASTER-EGGS.md`
- Modify: `docs/CONTENT.md` — добавить ссылку на EASTER-EGGS.md

- [ ] **Step 1: Создать `docs/EASTER-EGGS.md`**

```markdown
# Easter eggs & themes

Гайд по интерактивным «пасхалкам» сайта и системе тем. Всё, что описано
здесь — продуктовая часть портфолио, не кодовая инфраструктура.

---

## Темы

В сайт встроено 6 палитр. Переключатель — шестерёнка в правой части
шапки. Выбор сохраняется в `localStorage['pdev-theme']` и применяется
до hydration через inline-script (без FOUC).

| Ключ | Название | Палитра |
|---|---|---|
| `matrix` | Matrix | classic CRT-зелёный + cyan + magenta (по умолчанию) |
| `amber` | Amber CRT | янтарный с тёплыми оранжевыми акцентами |
| `cyberpunk` | Cyberpunk | magenta / cyan / yellow |
| `gameboy` | Game Boy | 4-уровневый зелёный |
| `synthwave` | Synthwave | hot pink / orange / cyan |
| `ocean` | Deep Sea | cyan / purple / pink |

### Добавить новую палитру

Добавить запись в **двух** местах одновременно — иначе появится FOUC при
загрузке:

1. `src/lib/themes.ts` → добавить ключ в `THEME_KEYS` и определение в
   `THEMES`. Описать `label`, 3 `swatches` для меню и 5 пар `--*` /
   `--*-dim` для CSS-vars.
2. `src/layouts/BaseLayout.astro` → продублировать ту же палитру в
   inline-script `THEMES` объекте перед `</head>`. Inline-script не
   импортирует ESM-модули намеренно — он должен исполняться до парсинга
   тела документа.

После правки — `pnpm check && pnpm build` и визуальный smoke на
`/dev/easter-eggs/`.

---

## Пасхалки

### 1. Konami code

`↑ ↑ ↓ ↓ ← → ← → B A` (на физической клавиатуре, без модификаторов).
Открывает overlay «GODMODE ENABLED». Закрывается кликом, Esc или Enter.

Закодировано в `src/lib/easter-eggs.ts` → `KONAMI_SEQUENCE`. Прослушка —
в `src/components/islands/EasterEggs.svelte`.

### 2. Тайпинг секретных слов

Набрать в произвольном месте сайта (вне input/textarea):

- `flathead` → toast «Потому. Просто потому. 🤷»
- `matrix` → переключает matrix rain canvas

### 3. 5 кликов по логотипу

Каждый клик по бренд-ссылке `[flathead.dev]` в шапке вызывает короткий
glitch и увеличивает счётчик. На 5-м клике — secret msg
«printf("Hello, secret hunter!")».

### 4. Console-команды

Открыть DevTools → Console:

| Команда | Эффект |
|---|---|
| `help()` | список всех команд |
| `konami()` | открыть GODMODE overlay |
| `matrix()` | toggle matrix rain |
| `flathead()` | secret msg «Потому. Просто потому. 🤷» |
| `hire()` | secret msg c CTA на /contact/ |
| `coffee()` | secret msg «☕ +1 cup» |
| `source()` | secret msg со ссылкой на github |

Регистрация — в `src/lib/easter-eggs.ts` →
`registerConsoleCommands()`.

---

## Тестирование

Все триггеры также доступны вручную на dev-странице:

```
http://localhost:4321/dev/easter-eggs/
```

Там есть кнопки `Trigger konami()`, `Trigger matrix()`,
`Trigger flathead()`, превью всех палитр с swatches и описанием
последовательностей. Используй её при правке overlay'ев и стилей —
не надо набирать `↑↑↓↓←→←→BA` каждый раз.

---

## Архитектура состояния

Все острова используют один реактивный стейт через Svelte 5 runes:

```
src/lib/state.svelte.ts
   ├── easterEggs.konamiOpen     ← KonamiOverlay показывает себя
   ├── easterEggs.matrixActive   ← MatrixRain включает canvas
   ├── easterEggs.secretMsg      ← SecretMsg показывает toast
   └── themeState.theme          ← ThemeTweaker подсвечивает текущую
```

Острова:

- `EasterEggs.svelte` — невидимый, слушает keyboard и регистрирует
  console-команды на mount.
- `KonamiOverlay.svelte`, `SecretMsg.svelte`, `MatrixRain.svelte` —
  показывают/скрывают себя на основе стейта.
- `ThemeTweaker.svelte` — gear-меню в шапке, читает/пишет
  `pdev-theme` в localStorage.
- `LogoGlitch.svelte` — обёртка для бренд-ссылки в шапке, держит
  click-counter и переключает CSS-класс `.brand--glitching` на 400ms.

Все острова гидратируются на `client:idle` или `client:visible` — JS
не блокирует первый рендер.
```

- [ ] **Step 2: Добавить ссылку в `docs/CONTENT.md`**

В конце раздела «Локальная разработка и проверка» (перед `## Деплой`) добавить:

```markdown
### Интерактив и пасхалки

Гайд по темам, Konami, secret msgs и console-командам — отдельный
документ: [`docs/EASTER-EGGS.md`](EASTER-EGGS.md). Полезно при правке
overlay'ев или добавлении новых палитр.

Dev-страница со всеми триггерами:
`http://localhost:4321/dev/easter-eggs/`.
```

- [ ] **Step 3: `pnpm format`**

Expected: clean.

- [ ] **Step 4: Коммит**

```bash
git add docs/EASTER-EGGS.md docs/CONTENT.md
git commit -m "docs: add EASTER-EGGS.md guide and link from CONTENT.md"
```

---

### Task 7.5: Final verification + production smoke

**Files:** none

- [ ] **Step 1: Полный gate**

```bash
pnpm check && pnpm test && pnpm format:check && rm -rf dist .astro && ASTRO_IMAGES=passthrough pnpm build
```

Expected:
- `pnpm check`: 0 errors / 0 warnings / 0 hints
- `pnpm test`: ≥20 passed (16 i18n + ≥8 easter-eggs)
- `pnpm format:check`: clean
- `pnpm build`: 10 страниц (предыдущие 9 + `/dev/easter-eggs/`)

- [ ] **Step 2: Push**

```bash
git push
```

- [ ] **Step 3: Дождаться CI**

```bash
gh run list --repo flathead/pixed-portfolio --limit 1
```

Expected: `completed success` через 30–60 сек.

- [ ] **Step 4: Production smoke**

```bash
for url in / /about/ /projects/ /projects/sport-nutrition/ /contact/ /404 /dev/components/ /dev/project-preview/ /dev/easter-eggs/ ; do
  printf "%-45s " "$url"
  curl -sI "https://pixed-portfolio.pages.dev$url" | head -1
done
```

Expected: все 9 URL возвращают `HTTP/2 200`.

- [ ] **Step 5: Smoke в браузере**

Открыть `https://pixed-portfolio.pages.dev/`:

- Шестерёнка в шапке открывается → видно 6 палитр со swatches → клик на «Game Boy» меняет акценты по всему сайту → reload → тема сохранилась.
- В DevTools Console: `help()` → выводит список команд.
- На клавиатуре: `↑↑↓↓←→←→BA` → overlay GODMODE.
- Тайпинг `flathead` → secret msg.
- Тайпинг `matrix` → matrix rain включается → клик по канвасу → выключается.
- 5 кликов по логотипу `[flathead.dev]` → 5-й клик показывает «Hello, secret hunter!» + видимый glitch на каждом клике.

---

## Verification Checklist (end of M3)

**Build & types:**
- [ ] `pnpm check` 0/0/0
- [ ] `pnpm test` все зелёные
- [ ] `pnpm build` создаёт 10 HTML-страниц + JS-чанки для каждого острова в `dist/_astro/`
- [ ] `pnpm format:check` clean

**Темы:**
- [ ] 6 палитр определены в `src/lib/themes.ts` и в inline-script BaseLayout
- [ ] Шестерёнка в шапке открывает меню с 6 swatches + label
- [ ] Активная палитра подсвечена `--green` бордюром и checkmark
- [ ] Persist в `localStorage['pdev-theme']` работает (reload сохраняет тему)
- [ ] Pre-hydration script применяет тему до парсинга body — нет FOUC
- [ ] Esc и клик вне меню закрывают dropdown

**Пасхалки:**
- [ ] Konami code открывает overlay
- [ ] Тайпинг `flathead` показывает secret msg
- [ ] Тайпинг `matrix` toggle-ит matrix rain
- [ ] 5 кликов по логотипу показывают secret msg
- [ ] Каждый клик по логотипу триггерит glitch на 400ms
- [ ] Console-команды `help/konami/matrix/flathead/hire/coffee/source` все определены
- [ ] Тайпинг внутри input/textarea **не** триггерит (важно для контактной формы)
- [ ] Esc закрывает overlay и SecretMsg

**Production:**
- [ ] CI зелёный
- [ ] `https://pixed-portfolio.pages.dev/` отдаёт сайт с шестерёнкой и работающими пасхалками
- [ ] `/dev/easter-eggs/` доступна и показывает 6 палитр + 3 кнопки-триггера
- [ ] Sharp работает на CI — обложки проектов как .webp
- [ ] `<meta name="robots" content="noindex">` остаётся (M3 не открывает индексацию)

---

## What's in / out of M3

**In:**
- 6 палитр + ThemeTweaker UI с persist
- 4 пасхалки на keyboard (Konami, flathead, matrix, logo×5) + 7 console-команд
- 3 overlay-острова (KonamiOverlay, SecretMsg, MatrixRain) + 2 wrapper-острова (LogoGlitch, ThemeTweaker, EasterEggs orchestrator)
- CSS-only glitch-эффекты на лого (без библиотек)
- `/dev/easter-eggs/` showcase
- `docs/EASTER-EGGS.md` гайд

**Out (Animation Pass / M4 / M5):**
- Любые scroll-driven, scroll-reveal, parallax анимации
- Astro View Transitions (page-to-page wipes)
- Motion One библиотека и stagger-эффекты
- Анимация шагов ContactWizard
- Анимированные HP-bars on scroll, typewriter в Hero
- Реальная отправка контактной формы (M4)
- Sveltia CMS (M4)
- Открытие индексации (только когда контент будет реальным — M5)

---

## Execution Handoff

**Plan complete and saved to `docs/superpowers/plans/2026-05-03-m3-theme-and-easter-eggs.md`. Two execution options:**

**1. Subagent-Driven (recommended)** — диспатчу свежего сабагента на каждую задачу с двухстадийным ревью.

**2. Inline Execution** — выполняем задачи в текущей сессии через executing-plans, batch с чекпоинтами.

> 📌 **M3 — средний по объёму** (12 задач, плюс TDD для easter-eggs.ts модуля). Inline-выполнение комфортно. Для свежей пары глаз можно запустить финальный subagent code-review в конце M3 (как в M1+M2).

**Какой подход?**
