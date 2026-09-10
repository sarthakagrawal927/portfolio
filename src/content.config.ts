import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * `work` — engineering case studies. Each one is an MDX file in
 * src/content/work/. Framed as systems: problem → architecture → outcome.
 */
const work = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/work' }),
  schema: z.object({
    title: z.string(),
    tagline: z.string(),
    role: z.string(),
    year: z.string(),
    /** One-paragraph summary shown on cards. */
    summary: z.string(),
    /** Tech used — rendered as mono chips. */
    stack: z.array(z.string()),
    /** Headline numbers. Keep to 2–4. */
    metrics: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .default([]),
    repo: z.url().optional(),
    demo: z.url().optional(),
    /** Show on the home page "Selected work" grid. */
    featured: z.boolean().default(false),
    /** Lower sorts first. */
    order: z.number().default(99),
  }),
});

/**
 * `blog` — long-form writing published under /blog.
 */
const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    draft: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
  }),
});

export const collections = { work, blog };
