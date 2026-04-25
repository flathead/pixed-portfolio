# Миграция портфолио на Astro + Sveltia CMS

**Дата:** 2026-04-25
**Статус:** Утверждено к реализации
**Автор контекста:** Dmitry (flathead)

---

## 1. Контекст

Текущий сайт-портфолио — статический HTML с инлайновым React 18 + Babel Standalone, сборка отсутствует, всё рендерится в браузере. Контент проектов, скиллов и переводов вшит JSX-константами в `Pages.jsx` / `Widgets.jsx` / `i18n.jsx`. Размер кода ≈ 5 700 строк. В сайте присутствуют декоративные эффекты (boot-screen, matrix rain, cursor trail, scanlines, glitch, easter eggs, theme tweaker).

Владелец оценивает результат как «приемлемый, но не идеал». Главные претензии:
- Сайт ощущается перегруженным и вычурным.
- Сторителлинг был задан как ключевая идея, но в реализации почти не выражен.
- Нет нормальной системы наполнения контентом — каждое изменение требует правки JSX.

Референс-направление — компактность и сдержанность axeni.de, **с сохранением** пиксель-арт-эстетики.

## 2. Цели миграции

1. Перейти на современный SSG-движок с возможностью наполнения через админку.
2. Убрать визуальный шум, сохранив суть пиксельной эстетики и игровых метафор.
3. Перенести сторителлинг с уровня деклараций на уровень структуры контента: компактная главная + сюжетные страницы проектов.
4. Обеспечить базу для последующего перевода на английский (без перевода в текущей итерации).
5. Поднять реальную контактную форму с pluggable-шлюзами (Telegram сейчас, расширяемо).
6. Уложить весь сайт в бесплатные тарифы Cloudflare и is-a.dev.

## 3. Зафиксированные решения

| Тема | Решение | Обоснование |
|---|---|---|
| Подход к миграции | Перенос с упрощением (не 1:1) | Текущая вёрстка не идеал, переносить лишний шум — двойная работа |
| SSG-движок | **Astro 5.x** | MDX для сторителлинга, Islands для интерактива, типизированные Content Collections, большое сообщество |
| Острова интерактива | **Svelte** через `@astrojs/svelte` | Минимальный рантайм (~3 KB / остров), без vDOM |
| Стили | **SCSS** + миксины + scoped стили в `.astro` | Без Tailwind/CSS-in-JS, чистый SCSS с токенами |
| Анимации | **Motion One** + Astro View Transitions + CSS Scroll-driven Animations | Лёгкая библиотека (~5 KB), scroll-driven и stagger из коробки, поддержка stepped easing |
| Сторителлинг | Компактная главная (character sheet) + длинные страницы проектов с MDX | Сторителлинг живёт в контенте, не в декоре |
| Маршрутизация | Реальные URL для каждой страницы (не SPA-табы) | SEO, шаринг ссылок, удобство наполнения |
| i18n | RU без префикса (default), EN — `/en/`, заложен костяк, но не активен | Префикс default ломал бы существующий UX |
| Контент | Markdown в Git с типизированной схемой (Zod), редактируемый через Sveltia | Открытый исходник, ноль внешних зависимостей, контент = сам по себе демо |
| CMS | **Sveltia CMS** + GitHub OAuth + Cloudflare Access | Современный форк Decap, WYSIWYG, кастомные поля и editor_components, нулевая стоимость |
| Контактная форма | Pluggable-адаптеры через Cloudflare Pages Function. Активен TelegramAdapter, готовы EmailAdapter / DiscordAdapter / WebhookAdapter | Расширяемость без переписывания формы |
| Хостинг | Cloudflare Pages + Cloudflare Pages Functions (на одном домене) | Бесплатно, edge-функции = шлюзы, минимум DNS |
| Домен | `flathead.is-a.dev` через is-a.dev | Бесплатно, тематично («developer subdomain») |
| Защита админки | Cloudflare Access (email-OTP) перед `/admin/*` | Второй слой поверх GitHub OAuth |
| Репозиторий | **Новый GitHub-репозиторий** (имя уточняется в Фазе 0). Текущий `pixed_dev_design` сохраняется как архив prototyping-фазы | Чистая история коммитов миграции, отделение от prototyping-фазы |

## 4. Что keep / cut из текущей версии

**Cut (режется как визуальный шум):**
- Boot-screen с фейковыми логами загрузки
- Cursor trail (зелёные пиксели за курсором)
- Scanlines overlay (CRT-эффект)
- Grid-фон в hero-секции

**Keep (остаётся, частично улучшается):**
- Easter eggs (Konami + матричный дождь)
- Glitch-эффект на логотипе (реже, не на каждом ховере)
- Theme tweaker (шестерёнка, смена палитр) — выносится в независимый Svelte-остров с persist
- Typewriter в hero
- Pixel-borders + hard shadows на карточках
- CAPS-заголовки в `Press Start 2P`
- HP-bars скиллов — анимируются при попадании в viewport
- ★☆ рейтинг сложности на проектах
- `[BRACKET]` кнопки + `>` префикс на nav

## 5. Архитектура

### 5.1. Структура контента и URL

| URL (RU) | URL (EN, в будущем) | Источник |
|---|---|---|
| `/` | `/en/` | `src/content/site/home.mdx` |
| `/projects/` | `/en/projects/` | Авто-сборка из коллекции |
| `/projects/[slug]/` | `/en/projects/[slug]/` | `src/content/projects/<slug>/index.mdx` |
| `/about/` | `/en/about/` | `src/content/site/about.mdx` |
| `/contact/` | `/en/contact/` | `src/content/site/contact.mdx` |
| `/404.html` | `/en/404.html` | Шаблон |
| `/admin/` | — | Sveltia CMS |
| `/api/contact` | — | Cloudflare Pages Function |
| `/api/auth/oauth` | — | Cloudflare Pages Function (Sveltia auth) |
| `/api/auth/callback` | — | Cloudflare Pages Function (Sveltia auth) |

**Content Collections (Zod-схемы):**

- `projects` — основная коллекция со схемой:
  - `title`, `slug`, `summary` (≤200 симв)
  - `cover` (image), `screenshots` (image[])
  - `tech` (string[]), `complexity` (1-5), `duration`, `year`
  - `client?`, `liveUrl?`, `repoUrl?`
  - `status` (completed | in_progress | archived)
  - `featured` (bool, для главной), `order` (number)
  - `questLog` (object): `problem`, `stack[]`, `outcome`, `learned?`
- `skills` — `name`, `value` (0-100), `category` (backend | frontend | devops | tools), `color` (CSS var), `order`
- `timeline` — `year`, `title`, `description`, `icon?`
- `site` — синглтоны `home.mdx`, `about.mdx`, `contact.mdx`

Для длинного контента (проекты, site/*) — отдельные файлы по локалям (`index.mdx` + `index.en.mdx`). Для коротких полей (skills, timeline) — i18n-поля внутри frontmatter.

Скриншоты проектов лежат рядом с MDX в подпапке `screens/`. Astro оптимизирует через `image()` в схеме (AVIF/WebP/JPG, responsive sizes).

### 5.2. Файловая структура репозитория

```
.
├── astro.config.mjs
├── tsconfig.json
├── package.json (pnpm)
├── functions/                    # Cloudflare Pages Functions
│   ├── _middleware.ts
│   └── api/
│       ├── contact.ts
│       └── auth/
│           ├── oauth.ts
│           └── callback.ts
├── public/
│   ├── admin/                    # Sveltia CMS
│   │   ├── index.html
│   │   └── config.yml
│   ├── fonts/                    # self-hosted Google Fonts
│   └── favicon.ico
├── src/
│   ├── content/
│   │   ├── config.ts             # Zod-схемы коллекций
│   │   ├── projects/
│   │   ├── skills/
│   │   ├── timeline/
│   │   └── site/
│   ├── layouts/
│   │   ├── BaseLayout.astro
│   │   └── ProjectLayout.astro
│   ├── components/
│   │   ├── ui/                   # атомы: PixelCard, PixelButton, ...
│   │   ├── sections/             # композиции для страниц
│   │   ├── nav/                  # Header, Footer
│   │   ├── mdx/                  # компоненты для тела MDX
│   │   └── islands/              # интерактив (Svelte)
│   ├── pages/
│   │   ├── index.astro
│   │   ├── about.astro
│   │   ├── contact.astro
│   │   ├── 404.astro
│   │   └── projects/
│   │       ├── index.astro
│   │       └── [slug].astro
│   ├── styles/
│   │   ├── tokens.scss           # дизайн-токены (цвета, типографика, spacing)
│   │   ├── mixins.scss           # @mixin pixel-card, pixel-button, hp-bar
│   │   ├── base.scss             # reset, body, scrollbar, utility-классы
│   │   ├── animations.scss       # @keyframes (только используемые)
│   │   └── md.scss               # стили для prose внутри MDX
│   ├── lib/
│   │   ├── i18n.ts               # хелперы локализации
│   │   ├── shortcuts.ts          # реестр клавиатурных пасхалок
│   │   └── animations/
│   │       ├── index.ts
│   │       ├── presets.ts
│   │       ├── scroll-reveal.ts
│   │       ├── scroll-driven.ts
│   │       ├── transitions.ts
│   │       ├── hp-bar.ts
│   │       ├── typewriter.ts
│   │       └── matrix-rain.ts
│   ├── i18n/
│   │   ├── ru.json
│   │   └── en.json
│   └── env.d.ts
└── docs/
    └── superpowers/specs/        # этот документ
```

### 5.3. Декомпозиция компонентов

- **`ui/`** — атомарные кирпичики, разметка + scoped SCSS, без props сложнее `class` и `slot`. Ничего не знают о доменной логике. Список: `PixelCard`, `PixelButton`, `PixelDivider`, `TechBadge`, `ComplexityStars`, `HpBar`, `QuestLog`.
- **`sections/`** — композиции из `ui/`, получают данные пропсом, не фетчат сами. Список: `HeroCharacter`, `ProjectsGrid`, `SkillsTree`, `Timeline`, `ContactWizard`.
- **`nav/`** — `Header`, `Footer`. Header содержит lang-switcher (изначально скрыт CSS-переменной) и theme tweaker.
- **`mdx/`** — компоненты для использования внутри MDX-файлов проектов. Регистрируются глобально через `mdx.components` в `astro.config.mjs`. Список: `Screenshot`, `Spoiler`, `Quest`, `Callout`, `TechBadge`.
- **`islands/`** — единственное место с гидратацией (`client:*`). Все 8 островов перечислены ниже.
- **`pages/`** — тонкие маршруты, ~30 строк каждый: layout + сборка данных через `getCollection()` + передача в sections.

### 5.4. Интерактив (острова Svelte)

| Остров | Стратегия | Где | Назначение |
|---|---|---|---|
| `MatrixRain` | `client:idle` | глобально (hidden) | Easter egg, Konami trigger |
| `EasterEggs` | `client:idle` | глобально | Реестр клавиатурных комбо в `shortcuts.ts` |
| `ThemeTweaker` | `client:visible` | Header | Меню смены палитр, persist в localStorage |
| `LogoGlitch` | `client:visible` | Header | Glitch на лого, random 5–10s + on-hover |
| `Typewriter` | `client:visible` | HeroCharacter | Печатающийся заголовок + blink с `steps()` easing |
| `HpBarsAnimated` | `client:visible` | SkillsTree | Заполнение баров при попадании в viewport |
| `ContactWizard` | `client:load` | pages/contact | 5-шаговый визард, sessionStorage persist |
| `ScrollReveal` | `client:visible` | layout-обёртка | Универсальная IO-обёртка для секций |

`EasterEggs` — чистый TS-модуль без UI, остальные — Svelte-компоненты.

### 5.5. Анимации

**Стек:**
- **Motion One** для scroll-reveal, scroll-driven, staggered появлений.
- **Astro View Transitions** (через `<ClientRouter />` в `BaseLayout`) для переходов между страницами с пиксельным wipe.
- **CSS Scroll-driven Animations API** там, где поддержано (Chrome/Edge), Motion One — fallback.

**Конвенция:**
Все публичные анимации живут в `src/lib/animations/`, документируются JSDoc с обязательными секциями: описание, параметры, return, `@example`. Это «инструмент» для разработчика — единый каталог в коде, поиск через grep по `@example`.

**Что увидит посетитель:**
1. Главная грузится мгновенно, без «дёрганий».
2. Hero — заголовок печатается, blink-курсор.
3. Скролл — карточки появляются stagger'ом снизу со `steps(8)`.
4. HP-bars скиллов заполняются при viewport.
5. Клик на проект — пиксель-wipe через View Transitions.
6. Cover проекта — параллакс на скролле (CSS-only где возможно).
7. Konami — активация matrix-rain.

### 5.6. Контактная форма

**Архитектура pluggable-адаптеров:**

```
[Browser: ContactWizard]
        │ POST /api/contact (multipart FormData)
        ▼
[Cloudflare Pages Function: /api/contact]
        │ 1. Zod-валидация
        │ 2. Cloudflare Turnstile (anti-spam)
        │ 3. Rate-limit через KV (5 req/IP/час)
        │ 4. Диспетчер активных адаптеров (env CONTACT_ADAPTERS=csv)
        ▼
[Adapter Registry]
        ├── TelegramAdapter   ← активен с первого дня
        ├── EmailAdapter      ← заглушка (Resend/Mailchannels)
        ├── DiscordAdapter    ← заглушка (webhook)
        └── WebhookAdapter    ← универсальный JSON-POST
```

**Контракт адаптера:**

```ts
interface ContactAdapter {
  name: string;
  send(payload: ContactPayload, env: Env): Promise<AdapterResult>;
}
interface ContactPayload {
  name: string; email: string;
  projectType: 'ecom' | 'corp' | 'crm' | 'bot' | 'legacy' | 'other';
  budget: number;
  timeline: 'asap' | 'month' | 'quarter' | 'year';
  message: string;
  files: File[]; // ≤10MB суммарно, MIME whitelist
  meta: { ip: string; ua: string; ts: number; locale: string };
}
interface AdapterResult { ok: boolean; error?: string; externalId?: string }
```

**Конфигурация (env Pages Function):**

```
CONTACT_ADAPTERS=telegram                # CSV
TELEGRAM_BOT_TOKEN=…                     # secret
TELEGRAM_CHAT_ID=…                       # secret
TURNSTILE_SECRET=…                       # secret
RATE_LIMIT_KV=…                          # KV namespace binding
ALLOWED_ORIGINS=https://flathead.is-a.dev
# для будущих:
RESEND_API_KEY=
DISCORD_WEBHOOK_URL=
GENERIC_WEBHOOK_URL=
```

Включить email = добавить ключ + сменить `CONTACT_ADAPTERS=telegram,email`. Никаких изменений в коде сайта.

**Безопасность:**
- Turnstile-виджет в форме (`client:load`), серверная валидация в Function.
- Origin-check (CORS), MIME-whitelist (jpg/png/pdf/zip), max 10 MB.
- Sanitize всего пользовательского ввода перед HTML-вставкой в TG-сообщение.
- Rate-limit через KV: 5 заявок / IP / час, иначе 429.
- Все секреты — только в env Function, не в Git.

**Frontend:**
- 5 шагов как в текущей версии (тип → бюджет → сроки → сообщение → файлы).
- Прогресс-бар сверху в HP-стиле.
- Состояние формы persist в `sessionStorage` (восстановление при случайном закрытии вкладки).
- Реальная multipart-загрузка с `<input type="file" multiple>`.
- Анимация успеха: `levelup` keyframe + сообщение «КВЕСТ ОТПРАВЛЕН».

### 5.7. CMS (Sveltia)

**Расположение:** `public/admin/index.html` + `public/admin/config.yml`. URL — `https://flathead.is-a.dev/admin/`.

**Аутентификация:** GitHub OAuth через Cloudflare Pages Functions (`/api/auth/oauth` + `/api/auth/callback`). Секреты `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` — в env Function.

**Авторизация:** только GitHub-юзер с write-доступом к репозиторию пройдёт. Дополнительно — **Cloudflare Access** (email-OTP) перед `/admin/*`.

**Конфигурация коллекций (`config.yml`):**

```yaml
backend:
  name: github
  repo: <user>/pixed_dev_design
  branch: main
  auth_endpoint: https://flathead.is-a.dev/api/auth/oauth
media_folder: src/assets/uploads
public_folder: /uploads
i18n:
  structure: multiple_files
  locales: [ru, en]
  default_locale: ru
collections:
  - name: projects
    label: Проекты
    folder: src/content/projects
    extension: mdx
    format: frontmatter
    create: true
    slug: '{{slug}}'
    i18n: true
    fields:
      - { name: title, widget: string, i18n: true }
      - { name: slug, widget: string }
      - { name: summary, widget: text, i18n: true }
      - { name: cover, widget: image }
      - name: tech
        widget: list
        field: { name: tag, widget: string }
      - { name: complexity, widget: number, min: 1, max: 5 }
      - { name: duration, widget: string, i18n: true }
      - { name: year, widget: number }
      - { name: client, widget: string, required: false, i18n: true }
      - { name: liveUrl, widget: string, required: false }
      - { name: repoUrl, widget: string, required: false }
      - name: status
        widget: select
        options: [completed, in_progress, archived]
      - { name: featured, widget: boolean, default: false }
      - { name: order, widget: number, default: 0 }
      - name: questLog
        widget: object
        required: false
        i18n: true
        fields:
          - { name: problem, widget: text }
          - { name: stack, widget: list, field: { name: item, widget: string } }
          - { name: outcome, widget: text }
          - { name: learned, widget: text, required: false }
      - name: body
        widget: markdown
        i18n: true
        editor_components: [Screenshot, Spoiler, Quest, Callout, TechBadge]
  - name: skills
    folder: src/content/skills
    extension: yml
    format: yaml
    fields:
      - { name: name, widget: string }
      - { name: value, widget: number, min: 0, max: 100 }
      - { name: category, widget: select, options: [backend, frontend, devops, tools] }
      - { name: color, widget: select, options: ['var(--green)','var(--cyan)','var(--magenta)','var(--yellow)','var(--purple)'] }
      - { name: order, widget: number, default: 0 }
  - name: timeline
    folder: src/content/timeline
    extension: yml
    format: yaml
    fields:
      - { name: year, widget: number }
      - { name: title, widget: string, i18n: true }
      - { name: description, widget: text, i18n: true }
      - { name: icon, widget: string, required: false }
  - name: site
    files:
      - { name: home,    file: src/content/site/home.mdx,    extension: mdx, i18n: true, fields: [...] }
      - { name: about,   file: src/content/site/about.mdx,   extension: mdx, i18n: true, fields: [...] }
      - { name: contact, file: src/content/site/contact.mdx, extension: mdx, i18n: true, fields: [...] }
```

**Кастомные `editor_components`** регистрируются через JS-расширение Sveltia: `Screenshot`, `Spoiler`, `Quest`, `Callout`, `TechBadge`. В редакторе — кнопки тулбара, при клике вставляют MDX-теги, которые при билде Astro резолвит в реальные компоненты.

**Поток редактирования:** `/admin/` → Cloudflare Access (email OTP) → GitHub OAuth → форма → Save → Sveltia коммитит файл + ассеты → push на `main` → Cloudflare Pages билд → онлайн (~40-70 сек суммарно).

**Превью** на старте — без визуального превью (Sveltia покажет рендер Markdown в редакторе). На последующей итерации — Cloudflare Pages preview-deploy на каждый PR.

### 5.8. i18n (костяк под EN)

**Astro-конфиг:**

```js
i18n: {
  locales: ['ru', 'en'],
  defaultLocale: 'ru',
  routing: {
    prefixDefaultLocale: false,
    redirectToDefaultLocale: false,
  },
  fallback: { en: 'ru' },
}
```

**Стратегия контента:**
- Длинный контент (`projects`, `site/*`) — отдельные файлы по локалям (`index.mdx` + `index.en.mdx`).
- Короткий контент (`skills`, `timeline`) — i18n-поля внутри YAML.

**UI-словари:** `src/i18n/{ru,en}.json`. Хелпер `t(key, locale)` в `src/lib/i18n.ts`. В шаблонах используется везде, без хардкода строк.

**Switcher:** в Header, скрыт через CSS-переменную `--show-lang-switcher: 0`. Включается одной строкой при готовности EN-версии.

**SEO:** автоматическая генерация `<link rel="alternate" hreflang>` и `<html lang>` в `BaseLayout`.

### 5.9. Билд и деплой

**Стек зависимостей (production):**
- Astro 5.x, `@astrojs/svelte`, `@astrojs/mdx`, `@astrojs/sitemap`
- `sass`, `motion`, `zod` (через Astro)
- Sharp (Astro built-in для image-оптимизации)
- remark/rehype: `remark-gfm`, `remark-toc`, `rehype-slug`, `rehype-autolink-headings`, `rehype-pretty-code` (Shiki)

**Dev-зависимости:**
- TypeScript (strict), Prettier + plugin-astro, ESLint + plugin-astro/svelte
- Vitest (для `src/lib/`), опционально Playwright (smoke e2e)
- Wrangler (для локальной разработки Pages Functions)

**Никакого React/Babel/three.js/marked.js** из текущей версии.

**MDX-пайплайн:** custom remark-плагин резолвит `{{< Screenshot ... />}}` в JSX-вызовы Astro-компонентов. Подсветка кода — Shiki с кастомной темой `pixeldev` (производный от dracula, перекрашен в проектные `--green/--cyan/--magenta/--yellow`).

**Performance-budget:**
- HTML+CSS+JS до hydration на главной ≤ 30 KB gzip.
- Lighthouse Performance ≥ 95 на 3G.
- LCP < 1.5s, CLS < 0.05, INP < 200ms.
- Шрифты self-hosted, preload только Tektur 400 (critical), остальные `font-display: swap`.
- Изображения: AVIF + WebP fallback, responsive sizes (320 / 640 / 1024 / 1920).

**Cloudflare Pages — настройки:**
- Build command: `pnpm install && pnpm build`
- Output: `dist`
- Node: 22, pnpm: 9
- Branch `main` → production, любая другая → preview-deploy.

**Pages Functions** деплоятся вместе с сайтом из папки `functions/`. Не нужны отдельные wrangler-команды.

**Cloudflare Access:**
- Application: `flathead.is-a.dev/admin/*`
- Identity provider: One-time PIN (email)
- Allowed: твой email
- Session: 24h

**Ассеты и Git LFS:**
Sveltia загружает картинки в `src/assets/uploads/`. Astro `image()` оптимизирует на билде. `.gitattributes` подключает Git LFS на `*.png|*.jpg|*.webp|*.avif` в этой папке, чтобы исходники не надували основной репо.

**Аналитика** на старте — без. На последующей итерации — Cloudflare Web Analytics (один script-tag, без cookie, GDPR-clean).

**Локальные команды:**
```
pnpm dev          # astro dev :4321 (Sveltia доступен на /admin/ с локальным auth)
pnpm dev:pages    # wrangler pages dev для тестирования Functions
pnpm build
pnpm preview
pnpm check        # astro check + tsc + svelte-check
pnpm test
pnpm format
pnpm lint
```

### 5.10. Домен

**`flathead.is-a.dev`** через [is-a-dev/register](https://github.com/is-a-dev/register).

**Содержимое `domains/flathead.json` для PR в is-a.dev:**

```json
{
  "owner": {
    "username": "<github-username>",
    "email": "basicjispasedbs@outlook.com"
  },
  "records": {
    "CNAME": "<projectname>.pages.dev"
  },
  "proxied": false
}
```

> Точный формат (поле `record` vs `records`, наличие `proxied`) уточнить по [docs.is-a.dev/domain-structure](https://docs.is-a.dev/domain-structure/) на момент подачи PR — формат периодически уточняется maintainer'ами проекта.

**Порядок действий:**
1. Создать пустой Astro-skeleton, задеплоить на CF Pages — получить адрес `<projectname>.pages.dev`.
2. PR в `is-a-dev/register` с `flathead.json`. **Важно: PR подаётся вручную владельцем, не AI-генерация** (является основанием для отклонения). Я готовлю содержимое JSON, владелец копирует и подаёт.
3. После merge — добавить custom domain `flathead.is-a.dev` в Cloudflare Pages.
4. Cloudflare Pages автоматически выпустит SSL.
5. Все API доступны под `/api/*` на том же домене (через Pages Functions). Поддомены `api.*` / `auth.*` не нужны.

**Что не работает на is-a.dev:**
- Cloudflare proxying (orange cloud) — зоной владеет is-a.dev, не мы.
- Workers с custom domain (для них нужна Cloudflare-managed зона). Используем Pages Functions вместо Workers.
- Вложенные поддомены (`api.flathead.is-a.dev`) разрешены только через NS-делегацию и только спустя 30+ дней. На старте не используем.

## 6. План миграции (фазы)

### Фаза 0 — Подготовка (≈2 ч)
- Создать новый GitHub-репозиторий (имя предложить в writing-plans, варианты: `flathead-portfolio`, `flathead-site`, `pixed-portfolio`).
- Создать пустой Astro-skeleton, задеплоить на CF Pages, получить `<projectname>.pages.dev`.
- Подать PR в `is-a-dev/register` с `flathead.json` (вручную владельцем).
- После merge — добавить custom domain `flathead.is-a.dev` в Pages.
- Зарегистрировать GitHub OAuth App для Sveltia.
- Подключить Cloudflare Access на `/admin/*` и `/api/auth/*`.

### Фаза 1 — Каркас Astro (≈1 день)
- Скаффолд проекта, установка зависимостей.
- Перенос `colors_and_type.css` в `src/styles/tokens.scss` + миксины.
- Self-host шрифтов (Press Start 2P, Tektur, IBM Plex Mono).
- Базовый `BaseLayout.astro` с `<ClientRouter />` (View Transitions), скелет header/footer.
- Конфиг i18n с `prefixDefaultLocale: false`.
- Словари `src/i18n/{ru,en}.json` (en = копия ru).

### Фаза 2 — Контент-модель (≈4 ч)
- Zod-схемы коллекций в `src/content/config.ts`.
- Перенос трёх существующих проектов из `Pages.jsx` в `src/content/projects/<slug>/index.mdx`.
- Перенос `SKILLS` и `TIMELINE` в `src/content/skills/*.yml` и `src/content/timeline/*.yml`.
- Перенос текстов из `i18n.jsx` в `src/i18n/ru.json`.

### Фаза 3 — Атомарные UI-компоненты (≈1 день)
- `ui/`: `PixelCard`, `PixelButton`, `PixelDivider`, `TechBadge`, `ComplexityStars`, `HpBar`, `QuestLog`.
- `mdx/`: `Screenshot`, `Spoiler`, `Quest`, `Callout`, `TechBadge`. Регистрация в `astro.config.mjs`.
- Временная страница `/dev/components/` для визуальной проверки (удаляется в Фазе 8).

### Фаза 4 — Sections и страницы (≈1–2 дня)
- `sections/`: `HeroCharacter`, `ProjectsGrid`, `SkillsTree`, `Timeline`, `ContactWizard` (без логики формы).
- `pages/`: `index`, `about`, `projects/index`, `projects/[slug]`, `contact`, `404`.
- `Header` (lang-switcher скрыт, theme tweaker), `Footer`.

### Фаза 5 — Анимации и интерактив (≈1 день)
- Каркас `src/lib/animations/` с JSDoc по конвенции.
- Перенос-улучшение островов: Typewriter, LogoGlitch, HpBarsAnimated, MatrixRain, EasterEggs, ThemeTweaker.
- Motion One для scroll-reveal.
- View Transitions с пиксельным wipe между страницами.

### Фаза 6 — Контактная форма + шлюзы (≈1 день)
- `ContactWizard.svelte` с persist в sessionStorage.
- `functions/api/contact.ts`: валидация + Turnstile + rate-limit + диспетчер.
- `TelegramAdapter` (sendMessage + sendDocument для файлов).
- Заглушки `EmailAdapter`, `DiscordAdapter`, `WebhookAdapter` (готовый код, выключены через env).
- Регистрация Cloudflare Turnstile, виджет в форму.

### Фаза 7 — Sveltia CMS (≈4 ч)
- `public/admin/index.html` + `config.yml`.
- `functions/api/auth/oauth.ts` + `callback.ts` для GitHub OAuth.
- Тест полного цикла: создание тестового проекта через `/admin/` → коммит → билд → проверка онлайн.

### Фаза 8 — Тонкая настройка (≈4 ч)
- Lighthouse-аудит, оптимизация LCP/CLS.
- Кросс-браузерная проверка scroll-driven анимаций (Chrome / Firefox / Safari).
- Sitemap, OG-теги (с pixel-art превью), `<link hreflang>`.
- Cleanup: удаление `/dev/components/` и временных артефактов.

### Фаза 9 — Архивирование старого репозитория (≈1 ч)
- Перенести нужные ассеты из старого репо `pixed_dev_design` (`assets/avatar.jpg`, подходящие картинки из `uploads/`, спек из `docs/superpowers/specs/`) в новый репо.
- Старый репозиторий `pixed_dev_design` остаётся как есть (архив prototyping-фазы). Опционально: переименовать в `pixed_dev_design-legacy` и пометить как archived в GitHub.
- В новом репо в `README.md` упомянуть исходный prototyping-репо.

**Итого:** 7-8 рабочих дней для одного человека, без учёта наполнения контентом.

## 7. Что вне scope этой спеки

- Реальное содержание сторителлинг-текстов проектов (это контентная работа, не миграция).
- Английские переводы.
- Видео-обложки проектов.
- Альтернативный домен (`.dev` за деньги, переход с is-a.dev).
- Дополнительные шлюзы (помимо Telegram) — каркас готов, ключи добавляются по необходимости.
- Превью-iframe в Sveltia (превью только Markdown, без визуального превью на старте).

## 8. Открытые вопросы для writing-plans

- Имя нового GitHub-репозитория (варианты: `flathead-portfolio`, `flathead-site`, `pixed-portfolio`).
- Финальный slug проекта в Cloudflare Pages (определяет `<projectname>.pages.dev`, который пойдёт в is-a.dev JSON).
- Уточнить точный набор `editor_components` для Sveltia (могут понадобиться embed YouTube/codepen, видео-плеер).

---

**Источники:**
- [is-a.dev — Free subdomains for developers](https://www.is-a.dev/)
- [is-a-dev/register (GitHub)](https://github.com/is-a-dev/register)
- [is-a.dev Domain Structure docs](https://docs.is-a.dev/domain-structure/)
