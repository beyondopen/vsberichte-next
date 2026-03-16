import type { CollectionConfig } from 'payload'

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: { useAsTitle: 'title' },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true },
    { name: 'content', type: 'richText', required: true },
  ],
  access: {
    read: () => true,
    create: ({ req: { user } }) =>
      Boolean(user?.roles?.some((r: string) => ['admin', 'editor'].includes(r))),
    update: ({ req: { user } }) =>
      Boolean(user?.roles?.some((r: string) => ['admin', 'editor'].includes(r))),
    delete: ({ req: { user } }) => Boolean(user?.roles?.includes('admin')),
  },
}
