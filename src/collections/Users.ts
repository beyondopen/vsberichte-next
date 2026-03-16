import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    useAPIKey: true,
  },
  admin: { useAsTitle: 'name' },
  access: {
    // Allow creating the first user without auth (Payload default behavior)
    // After that, only admins can create users
    create: async ({ req }) => {
      if (req.user) return Boolean(req.user.roles?.includes('admin'))
      // Allow if no users exist yet (first user setup)
      const { totalDocs } = await req.payload.count({ collection: 'users' })
      return totalDocs === 0
    },
    read: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user?.roles?.includes('admin')),
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      options: ['admin', 'editor', 'contributor'],
      defaultValue: ['contributor'],
      required: true,
      saveToJWT: true,
      access: {
        update: ({ req: { user } }) => Boolean(user?.roles?.includes('admin')),
      },
    },
  ],
}
