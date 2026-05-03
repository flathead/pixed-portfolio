# Управление контентом

Гайд по добавлению и редактированию проектов, скиллов, таймлайна и страниц
сайта. Контент живёт в `src/content/` как Markdown/MDX и YAML — никакой
внешней БД, всё валидируется Zod-схемами при сборке.

---

## TL;DR

```bash
# Новый проект (CLI создаёт скелет):
pnpm new:project sport-store

# Запустить dev-сервер с предпросмотром:
ASTRO_IMAGES=passthrough pnpm dev
# → http://localhost:4321/projects/sport-store/

# Превью всех вариантов карточек/QuestLog без реальных данных:
# → http://localhost:4321/dev/project-preview/

# Каталог UI-атомов:
# → http://localhost:4321/dev/components/

# Проверить контент перед коммитом:
pnpm check && pnpm format:check && pnpm test
```

> `ASTRO_IMAGES=passthrough` нужен только локально на Node 25+, где sharp ещё
> не имеет prebuild'ов. На CI (Node 22 LTS) sharp работает по умолчанию,
> переменную не выставлять.

---

## Структура контента

```
src/content/
├── projects/                      # Кейсы — каждая папка = один проект
│   └── <slug>/
│       ├── index.mdx              # frontmatter + storytelling
│       ├── cover.jpg              # обложка карточки и страницы
│       └── screens/               # скриншоты для тела MDX
├── skills/<order>-<name>.yml      # один файл на скилл
├── timeline/<year>.yml            # один файл на событие
└── site/                          # синглтоны страниц
    ├── home.mdx
    ├── about.mdx
    └── contact.mdx
```

---

## Проекты

### Создать новый проект

```bash
pnpm new:project sport-store
```

Скрипт:

- проверяет валидность slug (lowercase, цифры, дефисы — `^[a-z0-9-]+$`),
- создаёт `src/content/projects/sport-store/index.mdx` со скелетом
  frontmatter, заполненным TODO-маркерами,
- создаёт `src/content/projects/sport-store/screens/.gitkeep`,
- печатает следующие шаги.

### Frontmatter: обязательные поля

| Поле         | Тип        | Ограничение                                                              |
| ------------ | ---------- | ------------------------------------------------------------------------ |
| `title`      | string     | 3–120 символов                                                           |
| `slug`       | string     | `^[a-z0-9-]+$`, 3–60 символов                                            |
| `summary`    | string     | **40–200 символов** (короткий — режется визуально, длинный — обрезается) |
| `cover`      | image path | относительный путь к файлу-обложке: `./cover.jpg`                        |
| `tech`       | string[]   | 1–12 тегов, каждый ≤30 символов, lowercase                               |
| `complexity` | int        | 1..5 (звёзды на карточке)                                                |
| `duration`   | string     | `'3 месяца'`, `'6 недель'` — свободный формат                            |
| `year`       | int        | 2000..2100                                                               |
| `status`     | enum       | `completed` \| `in_progress` \| `archived`                               |

### Frontmatter: опциональные поля

| Поле          | Тип       | Что значит                                               |
| ------------- | --------- | -------------------------------------------------------- |
| `screenshots` | image[]   | до 10 файлов: `[./screens/01.png, ./screens/02.png]`     |
| `client`      | string    | имя клиента (2–80)                                       |
| `liveUrl`     | https URL | боевой адрес проекта (только https)                      |
| `repoUrl`     | https URL | репозиторий (только https)                               |
| `featured`    | boolean   | `true` → проект попадает на главную                      |
| `order`       | int       | сортировка (меньше = выше)                               |
| `questLog`    | object    | блок «проблема / стек / исход / чему научило» (см. ниже) |

### Quest Log

Опциональный структурированный блок в конце страницы проекта.

```yaml
questLog:
  problem: |
    Что было сломано (минимум 20 символов).
  stack:
    - php-8.3
    - laravel-11
  outcome: |
    Что сделал и какой результат (минимум 20 символов).
  learned: |
    Что вынес из проекта (минимум 10 символов, опционально).
```

Если хочешь, чтобы блок не отображался — просто не указывай `questLog`.

### Тело MDX

После frontmatter — обычный Markdown. Заголовки уровня `##` и `###`
автоматически стилизуются. Доступны MDX-компоненты:

```mdx
import { Screenshot, Spoiler, Callout, Quest, TechBadge } from '~/components/mdx';

<Screenshot src={import('./screens/admin.png')} alt="Админка" caption="После редизайна" />

<Callout type="warning">Обрати внимание на этот момент.</Callout>
<Callout type="info">Контекст.</Callout>
<Callout type="success">Выигрыш.</Callout>
<Callout type="danger">Опасность.</Callout>

<Spoiler title="Технические детали">Скрытый блок с подробностями. Раскрывается по клику.</Spoiler>

<Quest status="completed" title="Фаза 1: переезд на Laravel">
  Описание этапа.
</Quest>

<TechBadge accent="cyan">postgresql</TechBadge>
```

Фактически в `[slug].astro` уже импортируется barrel-namespace, поэтому
`<Screenshot>`/`<Callout>` и т.д. в теле MDX работают **без явного
import-блока**. Но если линтер/IDE ругаются на «unused import» в .mdx —
добавляй явный import как в примере выше.

### Картинки

- **Cover:** 1200×630 (OG-friendly), JPG/PNG/WebP. Astro автоматически
  оптимизирует в AVIF/WebP при билде через sharp.
- **Screenshots:** свободно, lazy-loaded. По 1 на скриншот в `screens/`.
- **Git LFS** включён для `src/content/projects/**/*.{png,jpg,jpeg,webp,avif}` — не
  нужно ничего настраивать вручную, при `git add` LFS подхватит автоматически.

### Featured-проекты на главной

Главная (`/`) показывает только проекты с `featured: true`,
отсортированные по `order` (меньше = выше). Чтобы добавить в избранное:

```yaml
featured: true
order: 1
```

### Удалить проект

Удалить папку `src/content/projects/<slug>/`. Astro автоматически
пересоберёт и страница `/projects/<slug>/` исчезнет. LFS-объекты
останутся в истории Git, но это нормально.

---

## Скиллы

```yaml
# src/content/skills/01-php.yml
name: PHP
value: 92 # 0..100 — заполнение HP-бара
category: backend # backend | frontend | devops | tools
color: 'var(--green)' # var(--green|--cyan|--magenta|--yellow|--purple)
order: 1
```

Имя файла: `<2-digit-order>-<name>.yml` для упорядоченности листинга.

---

## Таймлайн

```yaml
# src/content/timeline/2024.yml
year: 2024
title: Первый Laravel-проект
description: |
  Что произошло. Краткий нарратив.
icon: ⚡ # опционально, эмодзи
```

Один файл = одно событие. Сортировка по `year` автоматически.

---

## Страницы сайта (синглтоны)

```
src/content/site/home.mdx       # главная (только title в frontmatter)
src/content/site/about.mdx      # /about/ — body MDX рендерится в страницу
src/content/site/contact.mdx    # /contact/ — заголовок страницы
```

`about.mdx` — единственная синглтон-страница, чьё тело MDX
рендерится. Она поддерживает `## Заголовки` и MDX-компоненты, как страницы
проектов.

---

## Локальная разработка и проверка

```bash
# Установка (один раз):
pnpm install

# Dev-сервер с hot reload:
ASTRO_IMAGES=passthrough pnpm dev

# Полная проверка перед коммитом:
pnpm check          # типы + Zod-схемы
pnpm test           # unit-тесты i18n
pnpm format:check   # код-стиль

# Авто-форматирование:
pnpm format

# Production-бандл (только если sharp работает локально):
pnpm build
```

### Превью без реального контента

- `http://localhost:4321/dev/components/` — каталог всех UI-атомов
  (PixelCard, кнопки, бейджи, звёзды, HP-бары, MDX-блоки).
- `http://localhost:4321/dev/project-preview/` — карточки проекта во всех
  вариациях (3 статуса × 5 уровней сложности × длины summary × счётчики
  тегов × QuestLog formы), без реального контента.

Если ломаешь UI-атом и хочешь увидеть — открой `/dev/*` страницы.

---

## Деплой

Контент деплоится автоматически на push в `main`:

1. Редактируешь файлы локально (или через Sveltia CMS, когда она появится в M4).
2. `git add` → `git commit` → `git push origin main`.
3. GitHub Actions запускает `pnpm install --frozen-lockfile && pnpm build`.
4. Cloudflare Pages деплоит `dist/` через `cloudflare/wrangler-action`.
5. Через 30–60 секунд изменения видны на `https://pixed-portfolio.pages.dev/`.

Сейчас сайт **закрыт от индексации** (`<meta name="robots" content="noindex">` +
`/robots.txt` с `Disallow: /`). Когда контент будет реальный — снять блок одним
коммитом и подать PR в `is-a-dev/register` для домена `flathead.is-a.dev`.
