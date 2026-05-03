# Easter eggs & themes

Гайд по интерактивным «пасхалкам» сайта и системе тем. Всё, что описано
здесь — продуктовая часть портфолио, не кодовая инфраструктура.

---

## Темы

В сайт встроено 6 палитр. Переключатель — шестерёнка в правой части
шапки. Выбор сохраняется в `localStorage['pdev-theme']` и применяется
до hydration через inline-script (без FOUC).

| Ключ        | Название  | Палитра                                             |
| ----------- | --------- | --------------------------------------------------- |
| `matrix`    | Matrix    | classic CRT-зелёный + cyan + magenta (по умолчанию) |
| `amber`     | Amber CRT | янтарный с тёплыми оранжевыми акцентами             |
| `cyberpunk` | Cyberpunk | magenta / cyan / yellow                             |
| `gameboy`   | Game Boy  | 4-уровневый зелёный                                 |
| `synthwave` | Synthwave | hot pink / orange / cyan                            |
| `ocean`     | Deep Sea  | cyan / purple / pink                                |

### Добавить новую палитру

Добавить запись в **двух** местах одновременно — иначе появится FOUC при
загрузке:

1. `src/lib/themes.ts` → добавить ключ в `THEME_KEYS` и определение в
   `THEMES`.
2. `src/layouts/BaseLayout.astro` → продублировать ту же палитру в
   inline-script `THEMES` объекте перед `</head>`. Inline-script не
   импортирует ESM-модули намеренно — он должен исполняться до парсинга
   тела документа.

После правки — `pnpm check && ASTRO_IMAGES=passthrough pnpm build` и
визуальный smoke на `/dev/easter-eggs/`.

---

## Пасхалки

### 1. Konami code

`↑ ↑ ↓ ↓ ← → ← → B A`. Открывает overlay «GODMODE ENABLED». Закрывается
кликом, Esc или Enter.

Закодировано в `src/lib/easter-eggs/sequences.ts` → `KONAMI_SEQUENCE`.
Прослушка — в `src/components/islands/EasterEggs.svelte`.

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

| Команда      | Эффект                                 |
| ------------ | -------------------------------------- |
| `help()`     | список всех команд                     |
| `konami()`   | открыть GODMODE overlay                |
| `matrix()`   | toggle matrix rain                     |
| `flathead()` | secret msg «Потому. Просто потому. 🤷» |
| `hire()`     | secret msg c CTA на /contact/          |
| `coffee()`   | secret msg «☕ +1 cup»                 |
| `source()`   | secret msg со ссылкой на github        |

Регистрация — в `src/lib/easter-eggs/console.ts` →
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
