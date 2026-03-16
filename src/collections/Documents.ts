import type { CollectionConfig } from 'payload'

export const Documents: CollectionConfig = {
  slug: 'documents',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'jurisdiction', 'year', 'documentType', 'processingStatus'],
  },
  hooks: {
    afterChange: [
      async ({ req, doc, operation }) => {
        // Queue processing job when a new document is created
        if (operation === 'create') {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (req.payload.jobs as any).queue({
            task: 'processPdf',
            input: {
              documentId: doc.id,
            },
          })
        }
      },
    ],
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      name: 'jurisdiction',
      type: 'select',
      required: true,
      options: [
        'Bund',
        'Baden-Württemberg',
        'Bayern',
        'Berlin',
        'Brandenburg',
        'Bremen',
        'Hamburg',
        'Hessen',
        'Mecklenburg-Vorpommern',
        'Niedersachsen',
        'Nordrhein-Westfalen',
        'Rheinland-Pfalz',
        'Saarland',
        'Sachsen',
        'Sachsen-Anhalt',
        'Schleswig-Holstein',
        'Thüringen',
      ],
    },
    { name: 'year', type: 'number', required: true },
    {
      name: 'documentType',
      type: 'select',
      required: true,
      defaultValue: 'jahresbericht',
      options: [
        { label: 'Jahresbericht', value: 'jahresbericht' },
        { label: 'Kurzfassung', value: 'kurzfassung' },
        { label: 'Lagebild', value: 'lagebild' },
        { label: 'Broschüre', value: 'broschuere' },
        { label: 'Kompendium', value: 'kompendium' },
        { label: 'Flyer', value: 'flyer' },
        { label: 'Parlamentarische Fassung', value: 'parlamentarisch' },
      ],
    },
    {
      name: 'language',
      type: 'select',
      required: true,
      defaultValue: 'de',
      options: [
        { label: 'Deutsch', value: 'de' },
        { label: 'Englisch', value: 'en' },
      ],
    },
    { name: 'pdf', type: 'upload', relationTo: 'media', required: true },
    {
      name: 'numPages',
      type: 'number',
      admin: { readOnly: true, description: 'Wird automatisch bei der Verarbeitung gesetzt.' },
    },
    {
      name: 'processingStatus',
      type: 'select',
      defaultValue: 'pending',
      options: [
        { label: 'Ausstehend', value: 'pending' },
        { label: 'Wird verarbeitet', value: 'processing' },
        { label: 'Fertig', value: 'completed' },
        { label: 'Fehler', value: 'error' },
      ],
      admin: { readOnly: true },
    },
    {
      name: 'processingError',
      type: 'textarea',
      admin: {
        readOnly: true,
        condition: (data) => data?.processingStatus === 'error',
      },
    },
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
