import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const notes = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/notes" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.string(),
    displayDate: z.string().optional(),
    tag: z.string().default('APPLIED AI'),
    readTime: z.string().default('2 MIN READ'),
  }),
});

export const collections = { notes };
