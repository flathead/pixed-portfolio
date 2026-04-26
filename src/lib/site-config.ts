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
