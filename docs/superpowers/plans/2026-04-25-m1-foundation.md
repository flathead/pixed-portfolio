# Pixed Portfolio Migration — Milestone 1: Foundation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Поднять пустой Astro-сайт на `flathead.is-a.dev` с CI/CD, типизированной контент-моделью и каркасом i18n. К концу M1 любой push в `main` автоматически билдит и деплоит сайт; контент существующих 3 проектов / 8 скиллов / таймлайна перенесён в Markdown/YAML с Zod-валидацией.

**Architecture:** Astro 5.x SSG, Cloudflare Pages деплой, Sveltia CMS добавится в M4, шаблоны страниц в M2. На этом этапе генерируется только дефолтный Astro-роут как health-check, основная работа — инфраструктура и контент-схемы.

**Tech Stack:** Astro 5, TypeScript (strict), pnpm 9, Node 22, SCSS (`sass`), Zod (через Astro), Vitest (для `src/lib/`), Cloudflare Pages.

**Specs:** [`docs/superpowers/specs/2026-04-25-astro-migration-design.md`](../specs/2026-04-25-astro-migration-design.md)

**Locked decisions:**

- GitHub repo: `flathead/pixed-portfolio`
- Cloudflare Pages project: `pixed-portfolio` → `pixed-portfolio.pages.dev`
- Custom domain: `flathead.is-a.dev`
- Owner email (для is-a.dev): `basicjispasedbs@outlook.com`

---

## File Structure

После завершения M1 структура нового репозитория `pixed-portfolio` выглядит так:

```
pixed-portfolio/
├── .gitattributes               # Git LFS для медиа
├── .gitignore
├── .editorconfig
├── .nvmrc                       # Node 22
├── .prettierrc.json
├── astro.config.mjs
├── tsconfig.json
├── package.json
├── pnpm-lock.yaml
├── README.md
├── public/
│   ├── favicon.ico
│   └── fonts/                   # self-hosted Press Start 2P, Tektur, IBM Plex Mono
├── src/
│   ├── content/
│   │   ├── config.ts            # Zod-схемы (projects, skills, timeline, site)
│   │   ├── projects/
│   │   │   ├── sport-nutrition/
│   │   │   │   └── index.mdx
│   │   │   ├── real-estate-crm/
│   │   │   │   └── index.mdx
│   │   │   └── food-delivery-bot/
│   │   │       └── index.mdx
│   │   ├── skills/
│   │   │   ├── 01-php.yml ... 08-git.yml
│   │   │   ├── timeline/
│   │   │   │   ├── 2015.yml ... 2026.yml
│   │   │   └── site/
│   │   │       ├── home.mdx
│   │   │       ├── about.mdx
│   │   │       └── contact.mdx
│   ├── layouts/
│   │   └── BaseLayout.astro     # минимальный, расширится в M2
│   ├── pages/
│   │   └── index.astro          # health-check, скажет "M1 OK" — заменится в M2
│   ├── styles/
│   │   ├── tokens.scss          # из текущего colors_and_type.css
│   │   ├── mixins.scss          # пиксель-кард, кнопка, hp-bar (заготовки)
│   │   ├── base.scss
│   │   └── animations.scss      # keyframes (только используемые в M1)
│   ├── lib/
│   │   └── i18n.ts              # хелперы локализации
│   ├── i18n/
│   │   ├── ru.json
│   │   └── en.json              # копия ru.json пока
│   └── env.d.ts
├── tests/
│   └── lib/
│       └── i18n.test.ts         # vitest unit-тесты
└── docs/
    └── superpowers/
        ├── specs/
        │   └── 2026-04-25-astro-migration-design.md
        └── plans/
            └── 2026-04-25-m1-foundation.md
```

---

## Phase 0 — Infrastructure Setup

Задачи 0.1-0.7 — преимущественно ручные действия владельца (создание репо в GitHub UI, регистрация OAuth App, настройка Cloudflare). Для каждой задачи дан точный чек-лист.

### Task 0.1: Создать GitHub-репозиторий `flathead/pixed-portfolio`

**Files:** не применимо (manual setup)

- [ ] **Step 1: Создать пустой репозиторий на GitHub**

Открой https://github.com/new и создай репозиторий с параметрами:

- **Repository name:** `pixed-portfolio`
- **Owner:** `flathead`
- **Visibility:** Public (нужно для бесплатного Cloudflare Pages + чтобы исходник служил демо)
- **Initialize this repository with:** оставить пустым (никаких README/.gitignore/license — мы добавим сами)

Нажать **Create repository**. Скопировать SSH/HTTPS URL.

- [ ] **Step 2: Клонировать локально и подготовить рабочую директорию**

```bash
cd ~/Work
git clone git@github.com:flathead/pixed-portfolio.git
cd pixed-portfolio
```

Ожидаемый вывод:

```
Cloning into 'pixed-portfolio'...
warning: You appear to have cloned an empty repository.
```

- [ ] **Step 3: Скопировать спек-документы из старого репо**

```bash
mkdir -p docs/superpowers/{specs,plans}
cp ../pixed_dev_design/docs/superpowers/specs/2026-04-25-astro-migration-design.md docs/superpowers/specs/
cp ../pixed_dev_design/docs/superpowers/plans/2026-04-25-m1-foundation.md docs/superpowers/plans/
```

- [ ] **Step 4: Создать первый коммит с docs**

```bash
git add docs/
git commit -m "docs: copy migration spec and M1 plan from prototyping repo"
git push -u origin main
```

Ожидаемый вывод:

```
* [new branch]      main -> main
branch 'main' set up to track 'origin/main'.
```

---

### Task 0.2: Инициализировать Astro-skeleton

**Files:**

- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `.gitignore`, `.nvmrc`, `.editorconfig`, `src/pages/index.astro`, `src/env.d.ts`

- [ ] **Step 1: Инициализировать Astro через CLI**

```bash
cd ~/Work/pixed-portfolio
pnpm create astro@latest . -- --template minimal --typescript strict --no-install --no-git
```

CLI спросит: «Directory not empty, continue?» → **Yes**.

После завершения должны появиться: `package.json`, `astro.config.mjs`, `tsconfig.json`, `src/pages/index.astro`, `src/env.d.ts`.

- [ ] **Step 2: Зафиксировать версию Node**

Создать `.nvmrc`:

```
22
```

- [ ] **Step 3: Создать `.editorconfig`**

```ini
root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true

[*.md]
trim_trailing_whitespace = false
```

- [ ] **Step 4: Дописать `.gitignore`**

Astro создал базовый. Добавить в конец:

```
# Local IDE
.idea/
.vscode/

# Cloudflare
.wrangler/
.dev.vars

# Test artifacts
coverage/
.nyc_output/

# OS
.DS_Store
Thumbs.db
```

- [ ] **Step 5: Заменить дефолтную главную на M1 health-check**

Перезаписать `src/pages/index.astro`:

```astro
---
// Health-check page for M1. Will be replaced with HomePage in M2.
---

<!doctype html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>pixed-portfolio — M1 OK</title>
  </head>
  <body style="background:#0d0d1a;color:#39ff14;font-family:monospace;padding:40px;">
    <h1>flathead.is-a.dev — M1 Foundation OK</h1>
    <p>Astro skeleton deployed. Real homepage lands in M2.</p>
    <p>Build time: {new Date().toISOString()}</p>
  </body>
</html>
```

- [ ] **Step 6: Установить зависимости**

```bash
pnpm install
```

Ожидаемое: `Done in <time>s` без ошибок.

- [ ] **Step 7: Проверить локальный билд**

```bash
pnpm build
```

Ожидаемое: `dist/index.html` создан, в логе `Completed in <time>ms` и `[build] Server built in <time>s`.

- [ ] **Step 8: Запустить dev-сервер для smoke-проверки**

```bash
pnpm dev
```

Открыть http://localhost:4321/ — должна показаться зелёная страница «M1 Foundation OK». Остановить сервер (`Ctrl+C`).

- [ ] **Step 9: Зафиксировать pnpm-версию в `package.json`**

В `package.json` добавить поле `packageManager`:

```json
{
  "name": "pixed-portfolio",
  "type": "module",
  "version": "0.0.1",
  "packageManager": "pnpm@9.15.0",
  "scripts": { ... }
}
```

- [ ] **Step 10: Коммит**

```bash
git add .
git commit -m "feat(scaffold): initialize Astro skeleton with M1 health-check"
git push
```

---

### Task 0.3: Создать Cloudflare Pages-проект `pixed-portfolio`

**Files:** не применимо (Cloudflare dashboard)

- [ ] **Step 1: Открыть Cloudflare Dashboard → Workers & Pages**

URL: https://dash.cloudflare.com/?to=/:account/workers-and-pages

Если аккаунта нет — зарегистрироваться (бесплатно, нужен email).

- [ ] **Step 2: Создать новый Pages-проект из GitHub**

Кликнуть **Create application** → **Pages** → **Connect to Git** → выбрать GitHub, авторизовать Cloudflare на доступ к репо `flathead/pixed-portfolio`.

- [ ] **Step 3: Заполнить настройки билда**

| Поле                   | Значение                     |
| ---------------------- | ---------------------------- |
| Project name           | `pixed-portfolio`            |
| Production branch      | `main`                       |
| Framework preset       | `Astro`                      |
| Build command          | `pnpm install && pnpm build` |
| Build output directory | `dist`                       |
| Root directory         | (пусто)                      |

В разделе **Environment variables** добавить:
| Variable | Value |
|---|---|
| `NODE_VERSION` | `22` |
| `PNPM_VERSION` | `9` |

Кликнуть **Save and Deploy**.

- [ ] **Step 4: Дождаться первого билда**

В логах CF Pages будет видно: `Cloning repository...` → `Installing dependencies...` → `Running build command...` → `Deploying...`. Ожидаемое время — 1-2 минуты.

После деплоя откроется URL вида `https://pixed-portfolio.pages.dev` с зелёной страницей «M1 OK».

- [ ] **Step 5: Записать точный pages.dev URL**

Скопировать выданный URL из Cloudflare. Должен быть `pixed-portfolio.pages.dev`. Это значение пойдёт в is-a.dev JSON в Task 0.4.

---

### Task 0.4: Подать PR в `is-a-dev/register` для домена `flathead.is-a.dev`

**Files:** не применимо (PR в чужой репо, выполняется владельцем вручную)

> ⚠️ **Важно:** is-a.dev отклоняет AI-сгенерированные PR без объяснения. PR подаёт владелец вручную, копируя содержимое JSON ниже. Не использовать AI-агента для подачи PR.

- [ ] **Step 1: Сверить актуальный формат JSON**

Открыть https://docs.is-a.dev/domain-structure/ — на момент 2026-04-25 формат может быть `record` (singular) или `records` (plural). Использовать актуальный.

- [ ] **Step 2: Форкнуть репозиторий**

Перейти на https://github.com/is-a-dev/register, нажать **Fork** (без галочки «Copy the main branch only» — взять полный fork).

- [ ] **Step 3: Создать файл `domains/flathead.json`**

В форке добавить файл `domains/flathead.json` со следующим содержимым (адаптировать `record`/`records` под актуальный формат на момент подачи):

```json
{
  "owner": {
    "username": "flathead",
    "email": "basicjispasedbs@outlook.com"
  },
  "records": {
    "CNAME": "pixed-portfolio.pages.dev"
  },
  "proxied": false
}
```

- [ ] **Step 4: Создать PR**

Заголовок PR:

```
Register flathead.is-a.dev
```

Описание PR (заполнить честно — содержимое сайта на момент подачи будет M1 health-check):

```markdown
- **Subdomain:** `flathead.is-a.dev`
- **Use case:** Personal portfolio for a PHP developer
- **Hosting:** Cloudflare Pages (project `pixed-portfolio`)
- **CNAME target:** `pixed-portfolio.pages.dev`

The site is in active migration. The current state shows a minimal
placeholder page; full portfolio content lands in subsequent milestones.

I have read https://www.is-a.dev/docs and confirm I am submitting
this PR manually, not via AI generation.
```

- [ ] **Step 5: Дождаться merge**

Maintainers ревьюят PR обычно в течение 24-72 ч. Если запросят изменения — ответить, обновить файл, обновить PR. После merge DNS-записи появятся в течение нескольких минут.

- [ ] **Step 6: Проверить DNS**

После merge:

```bash
dig +short flathead.is-a.dev CNAME
```

Ожидаемое: `pixed-portfolio.pages.dev.`

---

### Task 0.5: Подключить custom domain в Cloudflare Pages

**Files:** не применимо (Cloudflare dashboard)

- [ ] **Step 1: Открыть проект в Cloudflare Pages**

Dashboard → Workers & Pages → `pixed-portfolio` → **Custom domains**.

- [ ] **Step 2: Добавить домен**

Кликнуть **Set up a custom domain** → ввести `flathead.is-a.dev` → **Continue**.

Cloudflare проверит DNS (CNAME уже указывает на нас благодаря Task 0.4) и предложит **Activate domain**. Кликнуть.

- [ ] **Step 3: Дождаться SSL-выпуска**

Cloudflare автоматически выпустит сертификат через Universal SSL. На странице Custom domains у `flathead.is-a.dev` появится статус **Active** через 1-5 минут.

- [ ] **Step 4: Smoke-тест**

```bash
curl -sI https://flathead.is-a.dev/ | head -5
```

Ожидаемое:

```
HTTP/2 200
content-type: text/html; charset=utf-8
...
```

И в браузере по https://flathead.is-a.dev/ — та же зелёная страница «M1 OK».

---

### Task 0.6: Зарегистрировать GitHub OAuth App для будущей Sveltia

**Files:** не применимо (GitHub Developer Settings)

> Этот шаг подготавливает OAuth App, который понадобится в M4 (CMS). Делаем заранее, чтобы при выходе на M4 не отвлекаться на регистрацию. Секреты сохраняем локально, не в Git.

- [ ] **Step 1: Открыть GitHub Developer Settings**

URL: https://github.com/settings/developers → **OAuth Apps** → **New OAuth App**.

- [ ] **Step 2: Заполнить форму**

| Поле                       | Значение                                      |
| -------------------------- | --------------------------------------------- |
| Application name           | `pixed-portfolio CMS`                         |
| Homepage URL               | `https://flathead.is-a.dev`                   |
| Authorization callback URL | `https://flathead.is-a.dev/api/auth/callback` |

Кликнуть **Register application**.

- [ ] **Step 3: Сгенерировать Client Secret**

На странице App кликнуть **Generate a new client secret**. **Сразу скопировать** — увидеть второй раз нельзя.

- [ ] **Step 4: Сохранить секреты в безопасном месте**

Сохранить локально (не в Git!) в защищённом хранилище (1Password / KeePassXC / etc.):

- `GITHUB_CLIENT_ID` — виден на странице App
- `GITHUB_CLIENT_SECRET` — секрет, только что сгенерированный

В M4 эти значения попадут в env Cloudflare Pages Functions.

---

### Task 0.7: Настроить Cloudflare Access перед `/admin/*` и `/api/auth/*`

**Files:** не применимо (Cloudflare Zero Trust dashboard)

> Защищаем будущие админку и auth-эндпоинты заранее, до их появления. Это безопаснее: к моменту M4 защита уже работает.

- [ ] **Step 1: Включить Cloudflare Zero Trust**

URL: https://one.dash.cloudflare.com/. Если первый раз — пройти setup (выбрать team name, например `flathead-portfolio`, тариф **Free**, до 50 юзеров).

- [ ] **Step 2: Добавить identity provider — One-time PIN**

Settings → **Authentication** → **Login methods** → **Add new** → **One-time PIN**. Кликнуть **Save**. Этот метод позволит логин по email-OTP.

- [ ] **Step 3: Создать Access Application для `/admin/*`**

Access → **Applications** → **Add an application** → **Self-hosted**.

| Поле               | Значение                |
| ------------------ | ----------------------- |
| Application name   | `pixed-portfolio admin` |
| Session Duration   | `24 hours`              |
| Application domain | `flathead.is-a.dev`     |
| Path               | `/admin/*`              |

Кликнуть **Next**.

- [ ] **Step 4: Настроить policy**

Создать policy:

- **Policy name:** `Owner only`
- **Action:** `Allow`
- **Configure rules** → **Include** → **Emails** → `basicjispasedbs@outlook.com`

Кликнуть **Next** → **Add application**.

- [ ] **Step 5: Создать вторую Application для `/api/auth/*`**

Повторить Step 3-4 со значениями:

- **Application name:** `pixed-portfolio auth API`
- **Path:** `/api/auth/*`

- [ ] **Step 6: Smoke-тест защиты (отрицательный)**

```bash
curl -sI https://flathead.is-a.dev/admin/
```

Ожидаемое: HTTP 302 redirect на Cloudflare Access login (даже если `/admin/` ещё не существует физически — CF Access перехватывает запрос до Pages).

В браузере по https://flathead.is-a.dev/admin/ — должна показаться форма Cloudflare Access с полем для email.

---

## Phase 1 — Astro Scaffold

### Task 1.1: Установить runtime-зависимости

**Files:**

- Modify: `package.json`

- [ ] **Step 1: Установить интеграции и библиотеки**

```bash
cd ~/Work/pixed-portfolio
pnpm add astro@^5
pnpm add @astrojs/svelte @astrojs/mdx @astrojs/sitemap
pnpm add svelte sass motion zod
pnpm add -D @types/node prettier prettier-plugin-astro prettier-plugin-svelte
pnpm add -D vitest @vitest/coverage-v8
```

- [ ] **Step 2: Проверить версии в `package.json`**

В `package.json` секция `dependencies` должна содержать:

- `astro`: `^5.x`
- `@astrojs/svelte`: `^7.x`
- `@astrojs/mdx`: `^4.x`
- `@astrojs/sitemap`: `^3.x`
- `motion`: `^11.x`
- `sass`: `^1.x`
- `svelte`: `^5.x`
- `zod`: `^3.x`

Если `pnpm` поставил major-версии иначе — проверить changelog и зафиксировать в `package.json` те, которые подтверждены работающими в Astro 5 на момент 2026-04-25.

- [ ] **Step 3: Коммит**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore(deps): add Astro integrations, Svelte, MDX, Motion One, Sass"
git push
```

---

### Task 1.2: Сконфигурировать Astro

**Files:**

- Modify: `astro.config.mjs`

- [ ] **Step 1: Перезаписать `astro.config.mjs`**

```js
import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://flathead.is-a.dev',
  trailingSlash: 'always',

  integrations: [
    svelte(),
    mdx({
      gfm: true,
    }),
    sitemap(),
  ],

  i18n: {
    locales: ['ru', 'en'],
    defaultLocale: 'ru',
    routing: {
      prefixDefaultLocale: false,
      redirectToDefaultLocale: false,
    },
    fallback: { en: 'ru' },
  },

  build: {
    inlineStylesheets: 'auto',
  },
});
```

- [ ] **Step 2: Прогнать сборку для проверки конфига**

```bash
pnpm build
```

Ожидаемое: билд успешен, в `dist/` появляется `sitemap-index.xml` и `sitemap-0.xml`.

> Если билд падает с ошибкой про SCSS `additionalData` — это нормально на этом шаге, файл `src/styles/tokens.scss` появится в Task 1.4. Если падает по другой причине — устранить.

- [ ] **Step 3: Коммит**

```bash
git add astro.config.mjs
git commit -m "feat(config): configure Astro with Svelte, MDX, sitemap, i18n, SCSS pipeline"
git push
```

---

### Task 1.3: Усилить TypeScript-конфиг

**Files:**

- Modify: `tsconfig.json`

- [ ] **Step 1: Перезаписать `tsconfig.json`**

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "~/*": ["src/*"]
    },
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "exactOptionalPropertyTypes": true,
    "verbatimModuleSyntax": true
  },
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist", ".astro"]
}
```

- [ ] **Step 2: Запустить astro check**

```bash
pnpm astro check
```

Ожидаемое: `0 errors, 0 warnings, 0 hints`. Если есть ошибки в `index.astro` из-за strict-режима — поправить там сразу.

- [ ] **Step 3: Коммит**

```bash
git add tsconfig.json
git commit -m "feat(ts): tighten TypeScript config (strict + path alias ~/)"
git push
```

---

### Task 1.4: Перенести дизайн-токены в SCSS

**Files:**

- Create: `src/styles/tokens.scss`
- Reference: текущий `colors_and_type.css` в старом репо `pixed_dev_design`

- [ ] **Step 1: Прочитать исходный CSS**

```bash
cat ../pixed_dev_design/colors_and_type.css | head -100
```

- [ ] **Step 2: Создать `src/styles/tokens.scss`**

Скопировать содержимое `colors_and_type.css` целиком как CSS custom properties (переменные `--xxx` остаются как есть, обёрнутые в `:root`). Шапку файла начать с SCSS-переменных-зеркал для использования в миксинах:

```scss
// =====================================================================
// Design Tokens — pixed-portfolio
// Mirror of CSS custom properties as SCSS variables for use in mixins.
// Import explicitly: @use 'src/styles/tokens' as *; (relative path from caller).
// =====================================================================

// Colors
$color-bg: #0d0d1a;
$color-surface: #1a1a2e;
$color-surface-2: #16213e;
$color-border: #2a2a4a;
$color-border-bright: #3d3d6e;
$color-green: #39ff14;
$color-green-dim: #1a8c0a;
$color-cyan: #00e5ff;
$color-magenta: #ff006e;
$color-magenta-dim: #8c0040;
$color-yellow: #ffd700;
$color-purple: #9b59b6;
$color-text: #e8e8f0;
$color-text-muted: #6b6b8a;
$color-text-inverse: #0d0d1a;

// Typography
$font-display: 'Press Start 2P', monospace;
$font-body: 'Tektur', monospace;
$font-mono: 'IBM Plex Mono', monospace;

// Spacing scale (8px base)
$space-1: 4px;
$space-2: 8px;
$space-3: 12px;
$space-4: 16px;
$space-6: 24px;
$space-8: 32px;
$space-12: 48px;
$space-16: 64px;

// Pixel-art shadows (no blur, hard offset)
$shadow-pixel-sm: 2px 2px 0;
$shadow-pixel-md: 4px 4px 0;
$shadow-pixel-lg: 6px 6px 0;
$shadow-pixel-press: inset 2px 2px 0 #000;

// Layout
$max-width: 1100px;
$radius: 0; // pixel art = no rounded corners

:root {
  // Colors
  --bg: #{$color-bg};
  --surface: #{$color-surface};
  --surface-2: #{$color-surface-2};
  --border: #{$color-border};
  --border-bright: #{$color-border-bright};
  --green: #{$color-green};
  --green-dim: #{$color-green-dim};
  --cyan: #{$color-cyan};
  --magenta: #{$color-magenta};
  --magenta-dim: #{$color-magenta-dim};
  --yellow: #{$color-yellow};
  --purple: #{$color-purple};
  --text: #{$color-text};
  --text-muted: #{$color-text-muted};
  --text-inverse: #{$color-text-inverse};

  // Typography
  --font-display: #{$font-display};
  --font-body: #{$font-body};
  --font-mono: #{$font-mono};

  // i18n switcher visibility (set to 1 when EN is ready)
  --show-lang-switcher: 0;
}
```

- [ ] **Step 3: Прогнать сборку для проверки**

```bash
pnpm build
```

Ожидаемое: билд успешен, никаких SCSS-ошибок.

- [ ] **Step 4: Коммит**

```bash
git add src/styles/tokens.scss
git commit -m "feat(styles): add design tokens (colors, typography, spacing) as SCSS"
git push
```

---

### Task 1.5: Добавить SCSS-миксины и base-стили

**Files:**

- Create: `src/styles/mixins.scss`
- Create: `src/styles/base.scss`
- Create: `src/styles/animations.scss`

- [ ] **Step 1: Создать `src/styles/mixins.scss`**

```scss
// =====================================================================
// SCSS Mixins for pixed-portfolio
// Use via @use 'mixins' as m; then @include m.pixel-card();
// =====================================================================

@use 'tokens' as *;

@mixin pixel-card($accent: $color-border) {
  background: var(--surface);
  border: 4px solid $accent;
  box-shadow: $shadow-pixel-md $accent;
  border-radius: $radius;
  transition:
    transform 120ms steps(4),
    box-shadow 120ms steps(4),
    border-color 120ms steps(4);

  &:hover {
    transform: translate(-2px, -2px);
    box-shadow: $shadow-pixel-lg var(--cyan);
    border-color: var(--cyan);
  }

  &:active {
    transform: translate(2px, 2px);
    box-shadow: $shadow-pixel-sm $accent;
  }
}

@mixin pixel-button($accent: $color-green) {
  display: inline-block;
  padding: $space-3 $space-6;
  font-family: var(--font-display);
  font-size: 12px;
  text-transform: uppercase;
  color: $accent;
  background: transparent;
  border: 4px solid $accent;
  box-shadow: $shadow-pixel-md $accent;
  cursor: pointer;
  text-decoration: none;
  transition:
    transform 120ms steps(4),
    box-shadow 120ms steps(4);

  &::before {
    content: '[';
    margin-right: $space-2;
  }
  &::after {
    content: ']';
    margin-left: $space-2;
  }

  &:hover {
    transform: translate(-2px, -2px);
    box-shadow: $shadow-pixel-lg $accent;
  }
  &:active {
    transform: translate(2px, 2px);
    box-shadow: $shadow-pixel-sm $accent;
  }
}

@mixin hp-bar($color: $color-green) {
  position: relative;
  width: 100%;
  height: 16px;
  background: var(--surface-2);
  border: 2px solid var(--border);

  &::after {
    content: '';
    display: block;
    width: var(--fill, 0%);
    height: 100%;
    background: $color;
    transition: width 800ms steps(8);
  }
}

@mixin caps-display {
  font-family: var(--font-display);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  line-height: 1.2;
}

@mixin nav-prefix-on-hover {
  position: relative;
  &::before {
    content: '> ';
    color: var(--green);
    opacity: 0;
    transition: opacity 80ms steps(2);
  }
  &:hover::before {
    opacity: 1;
  }
}
```

- [ ] **Step 2: Создать `src/styles/base.scss`**

```scss
@use 'tokens' as *;

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-body);
  font-size: 18px;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

body {
  min-height: 100vh;
  overflow-x: hidden;
}

a {
  color: var(--cyan);
  text-decoration: none;
  &:hover {
    text-decoration: underline;
    text-shadow: 0 0 8px var(--cyan);
  }
}

::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: var(--surface);
}
::-webkit-scrollbar-thumb {
  background: var(--border-bright);
}
::-webkit-scrollbar-thumb:hover {
  background: var(--green);
}

// Utility
.container {
  max-width: $max-width;
  margin: 0 auto;
  padding: 0 $space-6;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

- [ ] **Step 3: Создать `src/styles/animations.scss` (минимальный набор для M1)**

```scss
// =====================================================================
// Keyframes — only those used in M1.
// Animations layered in M3 will extend this file.
// =====================================================================

@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}

@keyframes px-enter {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

- [ ] **Step 4: Коммит**

```bash
git add src/styles/
git commit -m "feat(styles): add SCSS mixins, base styles, and minimal keyframes"
git push
```

---

### Task 1.6: Self-host шрифтов

**Files:**

- Create: `public/fonts/*.woff2` (5 файлов)
- Create: `src/styles/fonts.scss`
- Modify: `src/layouts/BaseLayout.astro` (после Task 1.7)

- [ ] **Step 1: Скачать шрифты с Google Fonts (через google-webfonts-helper)**

Открыть https://gwfh.mranftl.com/fonts. Для каждого шрифта:

- **Press Start 2P** (Latin only): regular 400. Скачать `.woff2`.
- **Tektur** (Cyrillic + Latin): regular 400 и bold 700. Скачать оба `.woff2`.
- **IBM Plex Mono** (Cyrillic + Latin): regular 400 и italic 400. Скачать оба `.woff2`.

Положить все 5 файлов в `public/fonts/` с понятными именами:

```
public/fonts/
├── press-start-2p-v15-latin-regular.woff2
├── tektur-v3-cyrillic_latin-regular.woff2
├── tektur-v3-cyrillic_latin-700.woff2
├── ibm-plex-mono-v19-cyrillic_latin-regular.woff2
└── ibm-plex-mono-v19-cyrillic_latin-italic.woff2
```

- [ ] **Step 2: Создать `src/styles/fonts.scss`**

```scss
// =====================================================================
// Self-hosted fonts. Only Tektur 400 is preloaded as critical.
// =====================================================================

@font-face {
  font-family: 'Press Start 2P';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('/fonts/press-start-2p-v15-latin-regular.woff2') format('woff2');
  unicode-range:
    U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074,
    U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}

@font-face {
  font-family: 'Tektur';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('/fonts/tektur-v3-cyrillic_latin-regular.woff2') format('woff2');
  unicode-range: U+0000-024F, U+0400-04FF, U+1E00-1EFF, U+2000-206F;
}

@font-face {
  font-family: 'Tektur';
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url('/fonts/tektur-v3-cyrillic_latin-700.woff2') format('woff2');
  unicode-range: U+0000-024F, U+0400-04FF, U+1E00-1EFF, U+2000-206F;
}

@font-face {
  font-family: 'IBM Plex Mono';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('/fonts/ibm-plex-mono-v19-cyrillic_latin-regular.woff2') format('woff2');
  unicode-range: U+0000-024F, U+0400-04FF, U+1E00-1EFF;
}

@font-face {
  font-family: 'IBM Plex Mono';
  font-style: italic;
  font-weight: 400;
  font-display: swap;
  src: url('/fonts/ibm-plex-mono-v19-cyrillic_latin-italic.woff2') format('woff2');
  unicode-range: U+0000-024F, U+0400-04FF, U+1E00-1EFF;
}
```

- [ ] **Step 3: Создать манифест шрифтов для preload**

Создать `src/lib/fonts.ts`:

```ts
export const PRELOAD_FONTS = ['/fonts/tektur-v3-cyrillic_latin-regular.woff2'] as const;

export const ALL_FONT_FILES = [
  '/fonts/press-start-2p-v15-latin-regular.woff2',
  '/fonts/tektur-v3-cyrillic_latin-regular.woff2',
  '/fonts/tektur-v3-cyrillic_latin-700.woff2',
  '/fonts/ibm-plex-mono-v19-cyrillic_latin-regular.woff2',
  '/fonts/ibm-plex-mono-v19-cyrillic_latin-italic.woff2',
] as const;
```

- [ ] **Step 4: Прогнать сборку**

```bash
pnpm build
```

Ожидаемое: успех. Шрифты копируются в `dist/fonts/`.

- [ ] **Step 5: Коммит**

```bash
git add public/fonts/ src/styles/fonts.scss src/lib/fonts.ts
git commit -m "feat(fonts): self-host Press Start 2P, Tektur, IBM Plex Mono"
git push
```

> Файлы шрифтов мелкие (5 × ~20-50 KB) — Git LFS пока не нужен. LFS подключим позже для скриншотов проектов в Task 2.5.

---

### Task 1.7: Создать BaseLayout

**Files:**

- Create: `src/layouts/BaseLayout.astro`

- [ ] **Step 1: Создать `src/layouts/BaseLayout.astro`**

```astro
---
import { PRELOAD_FONTS } from '~/lib/fonts';

interface Props {
  title: string;
  description?: string;
  locale?: 'ru' | 'en';
  ogImage?: string;
}

const {
  title,
  description = 'Портфолио PHP-разработчика flathead',
  locale = 'ru',
  ogImage = '/og-default.png',
} = Astro.props;

const canonical = new URL(Astro.url.pathname, Astro.site).toString();
---

<!doctype html>
<html lang={locale}>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content={description} />

    <title>{title}</title>
    <link rel="canonical" href={canonical} />

    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:image" content={new URL(ogImage, Astro.site).toString()} />
    <meta property="og:url" content={canonical} />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />

    {
      PRELOAD_FONTS.map((href) => (
        <link rel="preload" href={href} as="font" type="font/woff2" crossorigin="anonymous" />
      ))
    }

    <link rel="icon" type="image/x-icon" href="/favicon.ico" />
  </head>
  <body>
    <slot />
  </body>
</html>

<style lang="scss" is:global>
  @use '../styles/fonts';
  @use '../styles/base';
  @use '../styles/animations';
</style>
```

- [ ] **Step 2: Обновить `src/pages/index.astro` чтобы использовать layout**

```astro
---
import BaseLayout from '~/layouts/BaseLayout.astro';
---

<BaseLayout title="pixed-portfolio — M1 Foundation OK">
  <main class="container" style="padding:80px 0;">
    <h1 style="font-family:var(--font-display);color:var(--green);">flathead.is-a.dev</h1>
    <p style="margin-top:24px;color:var(--text);">M1 Foundation OK. Real homepage lands in M2.</p>
    <p style="margin-top:8px;color:var(--text-muted);font-family:var(--font-mono);font-size:14px;">
      Build: {new Date().toISOString()}
    </p>
  </main>
</BaseLayout>
```

- [ ] **Step 3: Прогнать сборку и dev**

```bash
pnpm build && pnpm preview
```

Открыть http://localhost:4321/ — увидеть страницу с зелёным заголовком в `Press Start 2P` (если шрифт латиница) или fallback monospace (если шрифт ещё не загружен). Текст внизу должен быть в `Tektur`.

В DevTools Network проверить: `tektur-...woff2` запрашивается с `as="font"` и приоритетом `Highest` благодаря preload.

- [ ] **Step 4: Коммит**

```bash
git add src/layouts/BaseLayout.astro src/pages/index.astro
git commit -m "feat(layout): add BaseLayout with SEO meta, OG, font preload"
git push
```

---

### Task 1.8: Создать i18n-хелперы

**Files:**

- Create: `src/lib/i18n.ts`
- Create: `src/i18n/ru.json`
- Create: `src/i18n/en.json`
- Create: `tests/lib/i18n.test.ts`
- Modify: `package.json` (test script)
- Create: `vitest.config.ts`

- [ ] **Step 1: Создать `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/lib/**'],
    },
  },
  resolve: {
    alias: {
      '~': new URL('./src', import.meta.url).pathname,
    },
  },
});
```

- [ ] **Step 2: Добавить test-скрипты в `package.json`**

В секцию `scripts` добавить:

```json
"scripts": {
  "dev": "astro dev",
  "build": "astro build",
  "preview": "astro preview",
  "check": "astro check",
  "test": "vitest run",
  "test:watch": "vitest",
  "test:coverage": "vitest run --coverage"
}
```

- [ ] **Step 3: Создать заглушки словарей**

`src/i18n/ru.json`:

```json
{
  "_meta": {
    "locale": "ru",
    "name": "Русский"
  }
}
```

`src/i18n/en.json` (пока копия ru, заменим в M2 при заполнении UI-строк):

```json
{
  "_meta": {
    "locale": "en",
    "name": "English"
  }
}
```

- [ ] **Step 4: Написать failing-тесты (`tests/lib/i18n.test.ts`)**

```ts
import { describe, expect, it } from 'vitest';
import { getLocale, isLocale, localeUrl, t, type Locale } from '~/lib/i18n';

describe('isLocale', () => {
  it('returns true for ru and en', () => {
    expect(isLocale('ru')).toBe(true);
    expect(isLocale('en')).toBe(true);
  });

  it('returns false for unsupported locales', () => {
    expect(isLocale('de')).toBe(false);
    expect(isLocale('')).toBe(false);
    expect(isLocale(undefined)).toBe(false);
  });
});

describe('getLocale', () => {
  it('returns ru for root URL', () => {
    expect(getLocale(new URL('https://x/'))).toBe('ru');
  });

  it('returns en for /en/ prefix', () => {
    expect(getLocale(new URL('https://x/en/'))).toBe('en');
    expect(getLocale(new URL('https://x/en/projects/'))).toBe('en');
  });

  it('treats /endpoint as ru, not en', () => {
    expect(getLocale(new URL('https://x/endpoint'))).toBe('ru');
  });

  it('returns ru for non-en paths', () => {
    expect(getLocale(new URL('https://x/projects/'))).toBe('ru');
  });
});

describe('localeUrl', () => {
  it('returns path as-is for ru (default locale)', () => {
    expect(localeUrl('/projects/', 'ru')).toBe('/projects/');
    expect(localeUrl('/', 'ru')).toBe('/');
  });

  it('prefixes /en for en locale', () => {
    expect(localeUrl('/projects/', 'en')).toBe('/en/projects/');
    expect(localeUrl('/', 'en')).toBe('/en/');
  });

  it('does not double-prefix when path already has locale prefix', () => {
    expect(localeUrl('/en/projects/', 'en')).toBe('/en/projects/');
  });
});

describe('t', () => {
  it('returns the key when no translation exists', () => {
    expect(t('nonexistent.key', 'ru')).toBe('nonexistent.key');
  });

  it('falls back to ru when en translation is missing', () => {
    // Both dictionaries currently only have _meta.name
    expect(t('_meta.name', 'en')).toBe('English');
    expect(t('_meta.name', 'ru')).toBe('Русский');
  });

  it('supports nested keys via dot notation', () => {
    expect(t('_meta.locale', 'ru')).toBe('ru');
  });
});
```

- [ ] **Step 5: Запустить тесты — должны упасть с ошибкой импорта**

```bash
pnpm test
```

Ожидаемое: `Error: Cannot find module '~/lib/i18n'` или аналогичное.

- [ ] **Step 6: Реализовать `src/lib/i18n.ts`**

```ts
import ru from '~/i18n/ru.json';
import en from '~/i18n/en.json';

export const LOCALES = ['ru', 'en'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'ru';

const dictionaries: Record<Locale, Record<string, unknown>> = {
  ru: ru as Record<string, unknown>,
  en: en as Record<string, unknown>,
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

export function getLocale(url: URL): Locale {
  const segments = url.pathname.split('/').filter(Boolean);
  const first = segments[0];
  return first === 'en' ? 'en' : 'ru';
}

export function localeUrl(path: string, locale: Locale): string {
  if (locale === DEFAULT_LOCALE) return path;
  if (path.startsWith(`/${locale}/`) || path === `/${locale}`) return path;
  return `/${locale}${path.startsWith('/') ? path : `/${path}`}`;
}

function resolveKey(dict: Record<string, unknown>, key: string): unknown {
  return key.split('.').reduce<unknown>((acc, part) => {
    if (acc && typeof acc === 'object' && part in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, dict);
}

export function t(key: string, locale: Locale = DEFAULT_LOCALE): string {
  const value = resolveKey(dictionaries[locale], key);
  if (typeof value === 'string') return value;
  if (locale !== DEFAULT_LOCALE) {
    const fallback = resolveKey(dictionaries[DEFAULT_LOCALE], key);
    if (typeof fallback === 'string') return fallback;
  }
  return key;
}
```

- [ ] **Step 7: Прогнать тесты — должны пройти**

```bash
pnpm test
```

Ожидаемое: `Test Files  1 passed (1) | Tests  N passed`.

- [ ] **Step 8: Прогнать `astro check`**

```bash
pnpm check
```

Ожидаемое: 0 errors.

- [ ] **Step 9: Коммит**

```bash
git add src/lib/i18n.ts src/i18n/ru.json src/i18n/en.json tests/ vitest.config.ts package.json
git commit -m "feat(i18n): add locale helpers (t, getLocale, localeUrl) with unit tests"
git push
```

---

### Task 1.9: Подключить Prettier

**Files:**

- Create: `.prettierrc.json`
- Create: `.prettierignore`
- Modify: `package.json` (format script)

- [ ] **Step 1: Создать `.prettierrc.json`**

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "plugins": ["prettier-plugin-astro", "prettier-plugin-svelte"],
  "overrides": [
    { "files": "*.astro", "options": { "parser": "astro" } },
    { "files": "*.svelte", "options": { "parser": "svelte" } }
  ]
}
```

- [ ] **Step 2: Создать `.prettierignore`**

```
dist/
.astro/
node_modules/
pnpm-lock.yaml
public/fonts/
```

- [ ] **Step 3: Добавить format-скрипты в `package.json`**

В `scripts`:

```json
"format": "prettier --write .",
"format:check": "prettier --check ."
```

- [ ] **Step 4: Прогнать форматтер**

```bash
pnpm format
```

Ожидаемое: список изменённых файлов выведется. Содержательных изменений быть не должно (мы старались писать в стиле Prettier с самого начала), но возможны мелкие правки whitespace.

- [ ] **Step 5: Коммит**

```bash
git add .prettierrc.json .prettierignore package.json
git commit -m "chore(format): add Prettier with plugin-astro and plugin-svelte"

git add -u
git commit -m "style: apply prettier formatting" --allow-empty
git push
```

> Если второй коммит пустой (нечего форматтить) — пропустить.

---

## Phase 2 — Content Model Migration

### Task 2.1: Создать Zod-схемы коллекций

**Files:**

- Create: `src/content/config.ts`

- [ ] **Step 1: Создать `src/content/config.ts`**

```ts
import { defineCollection, z } from 'astro:content';

const projects = defineCollection({
  type: 'content',
  schema: ({ image }) =>
    z.object({
      title: z.string().min(1),
      slug: z.string().regex(/^[a-z0-9-]+$/, 'lowercase letters, digits, hyphens only'),
      summary: z.string().max(200),
      cover: image(),
      screenshots: z.array(image()).default([]),
      tech: z.array(z.string()).min(1),
      complexity: z.number().int().min(1).max(5),
      duration: z.string(),
      year: z.number().int().min(2000).max(2100),
      client: z.string().optional(),
      liveUrl: z.string().url().optional(),
      repoUrl: z.string().url().optional(),
      status: z.enum(['completed', 'in_progress', 'archived']),
      featured: z.boolean().default(false),
      order: z.number().int().default(0),
      questLog: z
        .object({
          problem: z.string(),
          stack: z.array(z.string()),
          outcome: z.string(),
          learned: z.string().optional(),
        })
        .optional(),
    }),
});

const skills = defineCollection({
  type: 'data',
  schema: z.object({
    name: z.string(),
    value: z.number().int().min(0).max(100),
    category: z.enum(['backend', 'frontend', 'devops', 'tools']),
    color: z.enum([
      'var(--green)',
      'var(--cyan)',
      'var(--magenta)',
      'var(--yellow)',
      'var(--purple)',
    ]),
    order: z.number().int().default(0),
  }),
});

const timeline = defineCollection({
  type: 'data',
  schema: z.object({
    year: z.number().int().min(1990).max(2100),
    title: z.string(),
    description: z.string(),
    icon: z.string().optional(),
  }),
});

const site = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
  }),
});

export const collections = { projects, skills, timeline, site };
```

- [ ] **Step 2: Прогнать `astro check`**

```bash
pnpm check
```

Ожидаемое: 0 errors. Astro может предупредить о пустых коллекциях — это нормально, файлы добавятся в следующих задачах.

- [ ] **Step 3: Коммит**

```bash
git add src/content/config.ts
git commit -m "feat(content): add Zod schemas for projects, skills, timeline, site"
git push
```

---

### Task 2.2: Перенести проект 1 — «Интернет-магазин спортивного питания»

**Files:**

- Create: `src/content/projects/sport-nutrition/index.mdx`
- Create: `src/content/projects/sport-nutrition/cover.png` (placeholder)
- Reference: `../pixed_dev_design/Pages.jsx:5-38` (исходный JSX-объект)

- [ ] **Step 1: Прочитать исходный JSX-объект**

```bash
sed -n '5,38p' ../pixed_dev_design/Pages.jsx
```

Извлечь поля для frontmatter и тело сторителлинга.

- [ ] **Step 2: Подготовить cover-картинку**

Скопировать первую подходящую картинку из старого репо как заглушку:

```bash
mkdir -p src/content/projects/sport-nutrition/screens
cp ../pixed_dev_design/uploads/photo_2026-04-21_01-52-33.jpg \
   src/content/projects/sport-nutrition/cover.jpg
```

> Если конкретной обложки нет — сгенерировать SVG-плейсхолдер 1200×630 с текстом «sport-nutrition» в зелёном пиксель-стиле и сохранить как `cover.svg` (но Zod-схема ожидает image() — SVG поддерживается Astro начиная с 5.x).

- [ ] **Step 3: Создать `src/content/projects/sport-nutrition/index.mdx`**

```mdx
---
title: Интернет-магазин спортивного питания
slug: sport-nutrition
summary: Полностью переписал legacy-магазин на Laravel за три месяца — выручка удвоилась.
cover: ./cover.jpg
screenshots: []
tech: [php, laravel, mysql, vue, redis]
complexity: 3
duration: 3 месяца
year: 2024
client: ProSport
liveUrl: https://example-sport.ru
status: completed
featured: true
order: 1
questLog:
  problem: |
    Заказчик пришёл с магазином на кастомном PHP 5.6, который падал
    при пиковых нагрузках и не позволял добавить новые способы оплаты.
  stack:
    - php-8.2
    - laravel-11
    - mysql-8
    - vue-3
    - redis
  outcome: |
    Полный переписывание на Laravel + Vue. Время отклика страницы упало
    с 2.4с до 320мс. Внедрена очередь оплат через Redis. Конверсия
    выросла на 18%.
  learned: |
    Понял ценность типизированных моделей в крупных Laravel-приложениях.
    После этого проекта по умолчанию использую form-requests вместо
    inline-валидации.
---

## Завязка квеста

Заказчик пришёл с problem-чек-листом длиной в страницу. Magazин на кастомном
PHP 5.6 падал три раза в день, у админки не было нормального API, а попытка
добавить новый платёжный шлюз упиралась в спагетти из require_once.

## Бой с боссом

Главное было не сломать действующий магазин. Перенёс данные через миграции
батчами, поднял Laravel рядом, переключал страницу за страницей через
А/Б-routing на Nginx.

## Лут

Время отклика главной страницы упало с **2.4с** до **320мс**. Конверсия
выросла на **18%**.
```

> Текст сторителлинга — это плейсхолдер уровня черновика. Финальные тексты — отдельная контентная работа, не часть миграции.

- [ ] **Step 4: Прогнать `astro check`**

```bash
pnpm check
```

Ожидаемое: 0 errors. Если Zod ругается — исправить frontmatter.

- [ ] **Step 5: Коммит**

```bash
git add src/content/projects/sport-nutrition/
git commit -m "content(projects): migrate sport-nutrition project to MDX"
git push
```

---

### Task 2.3: Перенести проект 2 — «CRM для агентства недвижимости»

**Files:**

- Create: `src/content/projects/real-estate-crm/index.mdx`
- Create: `src/content/projects/real-estate-crm/cover.jpg`

- [ ] **Step 1: Прочитать исходник**

```bash
sed -n '39,73p' ../pixed_dev_design/Pages.jsx
```

- [ ] **Step 2: Подготовить cover**

```bash
mkdir -p src/content/projects/real-estate-crm
cp ../pixed_dev_design/uploads/изображение.png \
   src/content/projects/real-estate-crm/cover.jpg
```

(Любой подходящий placeholder; в M2/M5 заменим реальной обложкой).

- [ ] **Step 3: Создать `src/content/projects/real-estate-crm/index.mdx`**

```mdx
---
title: CRM для агентства недвижимости
slug: real-estate-crm
summary: Внутренняя CRM на Laravel — заменила Excel-таблицы на нормальную систему.
cover: ./cover.jpg
screenshots: []
tech: [php, laravel, postgresql, livewire, alpine]
complexity: 4
duration: 5 месяцев
year: 2025
client: ИрисНедвижимость
status: completed
featured: true
order: 2
questLog:
  problem: |
    Агентство вело сделки в общих Google-таблицах. Менеджеры теряли
    клиентов, дубли объектов появлялись каждый день, отчёты собирали
    руками.
  stack:
    - php-8.3
    - laravel-11
    - postgresql-16
    - livewire-3
    - alpine-3
  outcome: |
    CRM с разделением ролей, импортом из Excel, автоматическими
    напоминаниями и экспортом отчётов. Время оформления сделки
    сократилось с двух дней до двух часов.
---

## Завязка квеста

Шесть менеджеров делили одну Google-таблицу. Каждый писал свои объекты
в разных колонках. Отчёт за месяц собирался полтора дня.

## Бой с боссом

Нарисовал ER-схему, согласовал бизнес-процессы, поднял Laravel + Livewire.
Импортнул всю историю из Excel через одноразовый скрипт.

## Лут

Время оформления сделки упало с двух дней до двух часов. Менеджеры
перестали ругаться по поводу «чьи объекты».
```

- [ ] **Step 4: Прогнать `astro check`**

```bash
pnpm check
```

- [ ] **Step 5: Коммит**

```bash
git add src/content/projects/real-estate-crm/
git commit -m "content(projects): migrate real-estate-crm project to MDX"
git push
```

---

### Task 2.4: Перенести проект 3 — «Telegram-бот для доставки еды»

**Files:**

- Create: `src/content/projects/food-delivery-bot/index.mdx`
- Create: `src/content/projects/food-delivery-bot/cover.jpg`

- [ ] **Step 1: Прочитать исходник**

```bash
sed -n '74,117p' ../pixed_dev_design/Pages.jsx
```

- [ ] **Step 2: Подготовить cover**

```bash
mkdir -p src/content/projects/food-delivery-bot
cp ../pixed_dev_design/uploads/изображение-25a2649e.png \
   src/content/projects/food-delivery-bot/cover.jpg
```

- [ ] **Step 3: Создать `src/content/projects/food-delivery-bot/index.mdx`**

```mdx
---
title: Telegram-бот для доставки еды
slug: food-delivery-bot
summary: Полный пайплайн заказа в Telegram — от меню до уведомления курьеру.
cover: ./cover.jpg
screenshots: []
tech: [php, laravel, telegram-bot-api, mysql, redis]
complexity: 2
duration: 6 недель
year: 2025
status: completed
featured: false
order: 3
questLog:
  problem: |
    Кафе хотело принимать заказы без сайта — всё через Telegram. Готовые
    решения требовали ежемесячной подписки и не давали кастомизировать
    меню под скидки.
  stack:
    - php-8.3
    - laravel-11
    - telegram-bot-api
    - mysql-8
    - redis
  outcome: |
    Бот с inline-меню, корзиной, оплатой через ЮKassa, автоматическим
    уведомлением кухни и курьера. 200+ заказов в неделю стабильно.
---

## Завязка квеста

«Хотим принимать заказы прямо в Telegram, никакого сайта. И чтобы было
дешевле, чем ежемесячная подписка на готовые решения».

## Бой с боссом

Telegram Bot API — старый и местами странный. Ловить нажатия inline-кнопок,
управлять сессиями диалога, не путать пользователей корзинами.

## Лут

200+ заказов в неделю. Кухня видит заказ за 2 секунды после оплаты.
```

- [ ] **Step 4: Прогнать `astro check`**

```bash
pnpm check
```

- [ ] **Step 5: Коммит**

```bash
git add src/content/projects/food-delivery-bot/
git commit -m "content(projects): migrate food-delivery-bot project to MDX"
git push
```

---

### Task 2.5: Подключить Git LFS для скриншотов проектов

**Files:**

- Create: `.gitattributes`

> К моменту этой задачи в `src/content/projects/*/` уже лежат cover-jpg. Они мелкие (по 50-200 KB), но в M2 будут добавлены полноразмерные скриншоты — для них LFS обязателен.

- [ ] **Step 1: Установить Git LFS локально (если ещё не стоит)**

```bash
git lfs install
```

Ожидаемое: `Updated git hooks. Git LFS initialized.`

- [ ] **Step 2: Создать `.gitattributes`**

```
# Track project media via Git LFS
src/content/projects/**/*.png filter=lfs diff=lfs merge=lfs -text
src/content/projects/**/*.jpg filter=lfs diff=lfs merge=lfs -text
src/content/projects/**/*.jpeg filter=lfs diff=lfs merge=lfs -text
src/content/projects/**/*.webp filter=lfs diff=lfs merge=lfs -text
src/content/projects/**/*.avif filter=lfs diff=lfs merge=lfs -text

# Track future Sveltia uploads via LFS
src/assets/uploads/**/*.png filter=lfs diff=lfs merge=lfs -text
src/assets/uploads/**/*.jpg filter=lfs diff=lfs merge=lfs -text
src/assets/uploads/**/*.jpeg filter=lfs diff=lfs merge=lfs -text
src/assets/uploads/**/*.webp filter=lfs diff=lfs merge=lfs -text

# Hosted fonts stay in git (small, infrequent changes)
public/fonts/**/* -filter=lfs -diff=lfs -merge=lfs
```

- [ ] **Step 3: Мигрировать уже добавленные cover-jpg в LFS**

```bash
git lfs migrate import --include='src/content/projects/**/*.jpg' --no-rewrite
```

> Если команда выдаст ошибку про опцию `--no-rewrite` — использовать вариант без неё (git-lfs ≥ 2.13). Если репо ещё пуст по истории и страшно его перепаковывать — допустимо `git lfs track ...`, удалить и перекоммитить файлы.

- [ ] **Step 4: Проверить, что cover-файлы теперь LFS-pointer'ы**

```bash
git lfs ls-files
```

Ожидаемое: список из 3 файлов `src/content/projects/*/cover.jpg`.

- [ ] **Step 5: Прогнать сборку**

```bash
pnpm build
```

Ожидаемое: успех. Astro `image()` корректно обработает LFS-файлы (Git LFS на момент checkout восстанавливает реальные бинари).

> ⚠️ В Cloudflare Pages по умолчанию LFS-файлы **не** скачиваются автоматически. В Task 0.3 настройки уже задеплоились без LFS-фалов, и это нужно поправить в Step 6.

- [ ] **Step 6: Включить Git LFS в Cloudflare Pages**

В Cloudflare Dashboard → Pages → `pixed-portfolio` → **Settings** → **Builds & deployments** → **Build configurations** → найти секцию **Build system** → включить **Use the latest Build system version (V2)**.

V2 поддерживает LFS из коробки. Сохранить.

- [ ] **Step 7: Триггернуть передеплой**

```bash
git commit --allow-empty -m "chore: trigger redeploy with LFS support"
git push
```

В Cloudflare Pages логах убедиться: появилась строка `Setting up Git LFS` или `Fetching LFS objects`.

- [ ] **Step 8: Smoke-тест**

После деплоя зайти на `https://flathead.is-a.dev/` — страница должна по-прежнему отдавать «M1 OK». LFS на этом этапе никак не виден визуально (cover-файлы используются только в шаблонах, которые появятся в M2).

- [ ] **Step 9: Коммит .gitattributes**

```bash
git add .gitattributes
git commit -m "chore(lfs): track project media via Git LFS"
git push
```

---

### Task 2.6: Перенести скиллы в YAML

**Files:**

- Create: `src/content/skills/01-php.yml` ... `src/content/skills/08-git.yml`
- Reference: `../pixed_dev_design/Pages.jsx:118-127`

- [ ] **Step 1: Прочитать исходный массив**

```bash
sed -n '118,127p' ../pixed_dev_design/Pages.jsx
```

Ожидаемое (8 объектов):

```js
const SKILLS = [
  { name: 'PHP', value: 92, color: 'var(--green)' },
  { name: 'Laravel', value: 88, color: 'var(--green)' },
  { name: 'MySQL', value: 80, color: 'var(--cyan)' },
  { name: 'JavaScript', value: 65, color: 'var(--yellow)' },
  { name: 'Vue.js', value: 55, color: 'var(--yellow)' },
  { name: 'Docker', value: 70, color: 'var(--magenta)' },
  { name: 'Linux / CLI', value: 78, color: 'var(--purple)' },
  { name: 'Git', value: 85, color: 'var(--cyan)' },
];
```

- [ ] **Step 2: Создать файлы (новая схема включает `category` — заполнить по смыслу)**

```bash
mkdir -p src/content/skills
```

`src/content/skills/01-php.yml`:

```yaml
name: PHP
value: 92
category: backend
color: 'var(--green)'
order: 1
```

`src/content/skills/02-laravel.yml`:

```yaml
name: Laravel
value: 88
category: backend
color: 'var(--green)'
order: 2
```

`src/content/skills/03-mysql.yml`:

```yaml
name: MySQL
value: 80
category: backend
color: 'var(--cyan)'
order: 3
```

`src/content/skills/04-javascript.yml`:

```yaml
name: JavaScript
value: 65
category: frontend
color: 'var(--yellow)'
order: 4
```

`src/content/skills/05-vue.yml`:

```yaml
name: Vue.js
value: 55
category: frontend
color: 'var(--yellow)'
order: 5
```

`src/content/skills/06-docker.yml`:

```yaml
name: Docker
value: 70
category: devops
color: 'var(--magenta)'
order: 6
```

`src/content/skills/07-linux.yml`:

```yaml
name: Linux / CLI
value: 78
category: devops
color: 'var(--purple)'
order: 7
```

`src/content/skills/08-git.yml`:

```yaml
name: Git
value: 85
category: tools
color: 'var(--cyan)'
order: 8
```

- [ ] **Step 3: Прогнать `astro check`**

```bash
pnpm check
```

Ожидаемое: 0 errors. Если Zod ругается на `color` enum — проверить точное соответствие строк в схеме и YAML.

- [ ] **Step 4: Коммит**

```bash
git add src/content/skills/
git commit -m "content(skills): migrate 8 skill entries to YAML"
git push
```

---

### Task 2.7: Перенести таймлайн в YAML

**Files:**

- Create: `src/content/timeline/2015.yml` ... `src/content/timeline/2025.yml` (7 файлов)
- Reference: `../pixed_dev_design/Pages.jsx:129-137` (массив `TIMELINE` из 7 элементов)

> В исходнике 7 событий: 2015, 2016, 2018, 2019, 2021, 2023, 2025. Поле `color` из исходника отбрасывается (по спеке схема timeline color не содержит). Поле `text` исходника распадается на `title` (краткий заголовок) и `description` (полный текст).

- [ ] **Step 1: Создать директорию**

```bash
mkdir -p src/content/timeline
```

- [ ] **Step 2: Создать `src/content/timeline/2015.yml`**

```yaml
year: 2015
title: Первый PHP-скрипт
description: Написал первый PHP-скрипт — калькулятор ИМТ. Не работал, но затянуло.
icon: 🐘
```

- [ ] **Step 3: Создать `src/content/timeline/2016.yml`**

```yaml
year: 2016
title: Первый коммерческий заказ
description: Сайт-визитка за 5 000 ₽. Огромные деньги в 17 лет.
icon: 💰
```

- [ ] **Step 4: Создать `src/content/timeline/2018.yml`**

```yaml
year: 2018
title: Открыл Laravel
description: Жизнь разделилась на «до» и «после».
icon: ⚡
```

- [ ] **Step 5: Создать `src/content/timeline/2019.yml`**

```yaml
year: 2019
title: Первый крупный проект
description: Корпоративный портал на 200 пользователей.
icon: 🏢
```

- [ ] **Step 6: Создать `src/content/timeline/2021.yml`**

```yaml
year: 2021
title: Спас умирающий проект
description: 80 000 строк PHP без единого комментария. Крестовый поход.
icon: ⚔️
```

- [ ] **Step 7: Создать `src/content/timeline/2023.yml`**

```yaml
year: 2023
title: Docker везде
description: Docker в каждом проекте. Больше никакого «works on my machine».
icon: 🐳
```

- [ ] **Step 8: Создать `src/content/timeline/2025.yml`**

```yaml
year: 2025
title: Современный стек
description: 'PHP 8.3, Vue 3, архитектурные паттерны. И вот это портфолио.'
icon: 🚀
```

- [ ] **Step 9: Прогнать `astro check`**

```bash
pnpm check
```

Ожидаемое: 0 errors. Если Zod ругается на тип `year` — убедиться, что в YAML число пишется без кавычек.

- [ ] **Step 10: Коммит**

```bash
git add src/content/timeline/
git commit -m "content(timeline): migrate 7 timeline entries (2015-2025) to YAML"
git push
```

---

### Task 2.8: Создать заглушки `site/*` синглтонов

**Files:**

- Create: `src/content/site/home.mdx`
- Create: `src/content/site/about.mdx`
- Create: `src/content/site/contact.mdx`

> Тексты-заглушки. В M2/M5 заменим финальными.

- [ ] **Step 1: Создать директорию**

```bash
mkdir -p src/content/site
```

- [ ] **Step 2: Создать `home.mdx`**

```mdx
---
title: flathead — PHP-разработчик
---

Пишу код с 2015. Люблю кофе, Zelda и аккуратные миграции.
```

- [ ] **Step 3: Создать `about.mdx`**

```mdx
---
title: О себе
---

Десять лет в PHP, последние пять — в Laravel-экосистеме. Беру проекты, где
нужно подумать, а не просто слепить ещё один сайт-визитку.
```

- [ ] **Step 4: Создать `contact.mdx`**

```mdx
---
title: Контакт
---

Если задача интересная — пиши в Telegram или заполни форму.
```

- [ ] **Step 5: Прогнать `astro check`**

```bash
pnpm check
```

Ожидаемое: 0 errors.

- [ ] **Step 6: Коммит**

```bash
git add src/content/site/
git commit -m "content(site): add placeholder home/about/contact MDX singletons"
git push
```

---

### Task 2.9: Smoke-проверка коллекций через временный health-check

**Files:**

- Modify: `src/pages/index.astro` (временное расширение, заменится в M2)

- [ ] **Step 1: Расширить `src/pages/index.astro`, чтобы прочитать коллекции**

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '~/layouts/BaseLayout.astro';

const projects = await getCollection('projects');
const skills = await getCollection('skills');
const timeline = await getCollection('timeline');
---

<BaseLayout title="pixed-portfolio — M1 Foundation OK">
  <main class="container" style="padding:80px 0;">
    <h1 style="font-family:var(--font-display);color:var(--green);">flathead.is-a.dev</h1>
    <p style="margin-top:24px;color:var(--text);">M1 Foundation OK. Real homepage lands in M2.</p>
    <ul
      style="margin-top:32px;color:var(--text-muted);font-family:var(--font-mono);font-size:14px;"
    >
      <li>Projects loaded: {projects.length}</li>
      <li>Skills loaded: {skills.length}</li>
      <li>Timeline entries loaded: {timeline.length}</li>
      <li>Build: {new Date().toISOString()}</li>
    </ul>
  </main>
</BaseLayout>
```

- [ ] **Step 2: Прогнать `pnpm build` и `pnpm preview`**

```bash
pnpm build && pnpm preview
```

В http://localhost:4321/ убедиться: видны корректные числа (`Projects loaded: 3`, `Skills loaded: 8`, `Timeline entries loaded: 7`).

- [ ] **Step 3: Прогнать `astro check`**

```bash
pnpm check
```

Ожидаемое: 0 errors.

- [ ] **Step 4: Коммит**

```bash
git add src/pages/index.astro
git commit -m "chore(m1): smoke-check collection counts on health page"
git push
```

- [ ] **Step 5: Дождаться деплоя на CF Pages и проверить production**

После push'а в `main` Cloudflare Pages триггерит билд (видно в Dashboard). Через ~1-2 минуты:

```bash
curl -s https://flathead.is-a.dev/ | grep -E 'loaded:'
```

Ожидаемое: HTML содержит строки:

```html
<li>Projects loaded: 3</li>
<li>Skills loaded: 8</li>
<li>Timeline entries loaded: 7</li>
```

Если на проде получаются другие числа (или 500-ошибка) — проверить:

- Cloudflare Pages billed как Build System V2 (Task 2.5 Step 6).
- В CF Pages логах — секция `Fetching LFS objects` присутствует.
- В env Pages-проекта — `NODE_VERSION=22`, `PNPM_VERSION=9`.

---

## Verification Checklist (end of M1)

После завершения всех задач M1 эти пункты должны быть зелёными.

**Infrastructure:**

- [ ] Репозиторий `flathead/pixed-portfolio` создан, public, имеет `main` ветку.
- [ ] Cloudflare Pages-проект `pixed-portfolio` подключён к репо, авто-деплой работает.
- [ ] PR в is-a-dev/register merged, `dig +short flathead.is-a.dev CNAME` возвращает `pixed-portfolio.pages.dev.`
- [ ] `https://flathead.is-a.dev/` возвращает 200 OK с корректным SSL.
- [ ] Cloudflare Access защищает `/admin/*` и `/api/auth/*` (HTTP 302 на login без cookie).
- [ ] GitHub OAuth App `pixed-portfolio CMS` зарегистрирован, secrets сохранены локально.
- [ ] Git LFS включён в Build System V2, проектные cover'ы успешно деплоятся.

**Codebase:**

- [ ] `pnpm install` отрабатывает без ошибок на чистой машине.
- [ ] `pnpm dev` поднимает сервер на http://localhost:4321/.
- [ ] `pnpm build` успешно собирает `dist/`.
- [ ] `pnpm check` возвращает 0 errors.
- [ ] `pnpm test` проходит (юнит-тесты i18n).
- [ ] `pnpm format:check` не ругается.

**Content:**

- [ ] 3 проекта в `src/content/projects/<slug>/index.mdx` с корректным frontmatter.
- [ ] 8 скиллов в `src/content/skills/*.yml`.
- [ ] 7 таймлайн-событий в `src/content/timeline/*.yml`.
- [ ] 3 синглтона в `src/content/site/*.mdx` (home, about, contact).

**Production verification:**

- [ ] Health-check на https://flathead.is-a.dev/ показывает `Projects loaded: 3`, `Skills loaded: 8`, `Timeline entries loaded: 7`.
- [ ] Шрифт Tektur подгружается через preload (DevTools → Network).
- [ ] Lighthouse Performance в DevTools на главной ≥ 95 (плейсхолдер-страница, ничего не должно тормозить).

---

## Что входит и не входит в M1

**Входит:**

- Новый репо, CI/CD, домен, SSL, защита админки.
- Скаффолд Astro со всеми зависимостями.
- Дизайн-токены и базовые SCSS-миксины.
- Self-hosted шрифты.
- Контент-схемы Zod и миграция всего контента.
- Каркас i18n с unit-тестами.

**Не входит (передаётся в M2+):**

- Реальная вёрстка домашней страницы, страниц проектов, about, contact.
- UI-компоненты (`PixelCard`, `PixelButton`, `HpBar`, ...).
- MDX-компоненты (`Screenshot`, `Spoiler`, ...).
- Любая интерактивность и анимации.
- Контактная форма и шлюзы.
- Sveltia CMS — config, OAuth Worker, editor_components.
- Реальные тексты сторителлинга (контентная работа).

---

## Execution Handoff

**Plan complete and saved to `docs/superpowers/plans/2026-04-25-m1-foundation.md`. Two execution options:**

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration. Подходит, если хочешь делегировать выполнение.

**2. Inline Execution** — выполняем задачи в текущей сессии через executing-plans, batch-выполнение с чекпоинтами.

> ⚠️ Tasks 0.1, 0.3-0.7 содержат шаги, которые **обязательно** выполняет владелец вручную (создание GitHub-репо, регистрация OAuth-app, подача PR в is-a.dev, настройка Cloudflare Access). Никакой автомат не пройдёт за тебя email-OTP. Эти шаги отмечены и описаны как чек-листы.

**Какой подход?**
