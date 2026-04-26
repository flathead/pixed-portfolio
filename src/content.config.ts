import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'zod';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
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
      liveUrl: z.url().optional(),
      repoUrl: z.url().optional(),
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
