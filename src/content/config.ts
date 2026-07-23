import { defineCollection, z } from 'astro:content';

const guides = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.enum([
      'universal-credit',
      'pip',
      'carers-allowance',
      'council-tax-reduction',
      'housing-benefit',
      'child-benefit',
      'pension-credit',
      'attendance-allowance',
      'general',
    ]),
    publishDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    relatedTool: z.string(),
    readingTime: z.string().optional(),
  }),
});

export const collections = {
  guides,
};
