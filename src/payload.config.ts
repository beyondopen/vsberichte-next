import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'
import { Users } from './collections/Users'
import { NewsArticles } from './collections/NewsArticles'
import { Pages } from './collections/Pages'
import { Media } from './collections/Media'
import { Documents } from './collections/Documents'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET || 'dev-secret-please-change',
  db: postgresAdapter({
    pool: {
      connectionString:
        process.env.DATABASE_URL ||
        'postgresql://postgres:password@localhost:5432/postgres',
    },
    push: false,
    migrationDir: path.resolve(dirname, '../migrations'),
  }),
  editor: lexicalEditor({}),
  collections: [Users, Documents, NewsArticles, Pages, Media],
  routes: {
    api: '/cms',
  },
  admin: {
    user: 'users',
  },
  jobs: {
    tasks: [
      {
        slug: 'processPdf',
        retries: 2,
        inputSchema: [
          { name: 'documentId', type: 'number', required: true },
        ],
        handler: async ({ input, req }) => {
          const workerUrl = process.env.WORKER_URL || 'http://localhost:8000'
          const documentId = input.documentId

          // Mark as processing
          await req.payload.update({
            collection: 'documents',
            id: documentId,
            data: { processingStatus: 'processing' },
          })

          try {
            const response = await fetch(`${workerUrl}/process/${documentId}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
            })

            if (!response.ok) {
              const text = await response.text()
              throw new Error(`Worker returned ${response.status}: ${text}`)
            }

            const result = await response.json()

            // Update document with results (Payload has full DB access here)
            await req.payload.update({
              collection: 'documents',
              id: documentId,
              data: {
                processingStatus: 'completed',
                numPages: result.numPages,
              },
            })

            // Invalidate corpus-derived caches (counts, index, charts). Via
            // HTTP because revalidateTag needs a request scope, which this
            // background job does not have. Non-fatal: caches expire after
            // their revalidate window anyway.
            try {
              await fetch(`http://localhost:${process.env.PORT || 3000}/api/revalidate`, {
                method: 'POST',
                headers: { 'x-revalidate-secret': process.env.PAYLOAD_SECRET || '' },
              })
            } catch (e) {
              console.warn('Cache revalidation after processing failed:', e)
            }

            return { output: { numPages: result.numPages, status: 'completed' } }
          } catch (error) {
            await req.payload.update({
              collection: 'documents',
              id: documentId,
              data: {
                processingStatus: 'error',
                processingError: error instanceof Error ? error.message : 'Unknown error',
              },
            })
            throw error
          }
        },
      },
    ],
    autoRun: [
      {
        cron: '*/10 * * * * *', // Every 10 seconds
        limit: 5,
      },
    ],
  },
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
})
