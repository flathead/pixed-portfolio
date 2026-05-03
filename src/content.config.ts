import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'zod';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
  schema: ({ image }) =>
    z.object({
      title: z.string().min(3, 'title is too short').max(120, 'keep title under 120 chars'),
      slug: z
        .string()
        .min(3)
        .max(60)
        .regex(/^[a-z0-9-]+$/, 'lowercase letters, digits, hyphens only'),
      // Card summary: under 200 chars but at least a sentence.
      summary: z
        .string()
        .min(40, 'write at least one full sentence (40+ chars)')
        .max(200, 'card summary must fit in 200 chars'),
      cover: image(),
      screenshots: z.array(image()).max(10).default([]),
      tech: z
        .array(z.string().min(1).max(30))
        .min(1, 'at least one tech tag')
        .max(12, 'keep tech tags focused (≤12)'),
      complexity: z.number().int().min(1).max(5),
      duration: z.string().min(2).max(40),
      year: z.number().int().min(2000).max(2100),
      client: z.string().min(2).max(80).optional(),
      // External URLs must be https — Astro warns on http on prod anyway.
      liveUrl: z
        .url()
        .refine((u) => u.startsWith('https://'), { message: 'use https:// for live URL' })
        .optional(),
      repoUrl: z
        .url()
        .refine((u) => u.startsWith('https://'), { message: 'use https:// for repo URL' })
        .optional(),
      status: z.enum(['completed', 'in_progress', 'archived']),
      featured: z.boolean().default(false),
      order: z.number().int().min(0).default(0),
      questLog: z
        .object({
          problem: z.string().min(20),
          stack: z.array(z.string().min(1)).min(1).max(20),
          outcome: z.string().min(20),
          learned: z.string().min(10).optional(),
        })
        .optional(),
    }),
});

const skills = defineCollection({
  loader: glob({ pattern: '**/*.yml', base: './src/content/skills' }),
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
  loader: glob({ pattern: '**/*.yml', base: './src/content/timeline' }),
  schema: z.object({
    year: z.number().int().min(1990).max(2100),
    title: z.string(),
    description: z.string(),
    icon: z.string().optional(),
  }),
});

const site = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/site' }),
  schema: z.object({
    title: z.string(),
  }),
});

export const collections = { projects, skills, timeline, site };
