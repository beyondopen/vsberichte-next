import type { CollectionConfig } from 'payload'

export const NewsArticles: CollectionConfig = {
  slug: 'news-articles',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'publishedDate', 'status'],
  },
  versions: { drafts: true },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true },
    {
      name: 'publishedDate',
      type: 'date',
      required: true,
      admin: { date: { pickerAppearance: 'dayOnly' } },
    },
    { name: 'content', type: 'richText', required: true },
    {
      name: 'tags',
      type: 'array',
      fields: [{ name: 'tag', type: 'text' }],
    },
    { name: 'featuredImage', type: 'upload', relationTo: 'media' },
  ],
  access: {
    read: () => true,
    create: ({ req: { user } }) =>
      Boolean(user?.roles?.some((r: string) => ['admin', 'editor', 'contributor'].includes(r))),
    update: ({ req: { user } }) =>
      Boolean(user?.roles?.some((r: string) => ['admin', 'editor'].includes(r))),
    delete: ({ req: { user } }) => Boolean(user?.roles?.includes('admin')),
  },
}
