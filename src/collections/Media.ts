import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  upload: {
    staticDir: 'media',
    imageSizes: [
      { name: 'thumbnail', width: 400, height: 300, position: 'centre' },
      { name: 'card', width: 768, height: undefined, position: 'centre' },
    ],
    mimeTypes: ['image/*', 'application/pdf'],
  },
  fields: [{ name: 'alt', type: 'text', required: true }],
  access: {
    read: () => true,
    create: ({ req: { user } }) =>
      Boolean(user?.roles?.some((r: string) => ['admin', 'editor', 'contributor'].includes(r))),
  },
}
