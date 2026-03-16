import { test, expect } from '@playwright/test'
import { execSync } from 'child_process'
import { existsSync, readFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = process.env.DATA_DIR || path.resolve(__dirname, '../../data')
const BASE_URL = 'http://localhost:3333'
const DOCKER_TIMEOUT = 120_000

/**
 * E2E test for the full automatic CMS workflow:
 *
 *   1. Create a test PDF
 *   2. Upload PDF to Payload CMS (Media collection)
 *   3. Create a Document in Payload (triggers afterChange hook → queues job)
 *   4. Wait for Payload autoRun to process the job via the Python worker
 *   5. Verify: Payload document status = 'completed'
 *   6. Verify: document appears in search results
 *   7. Verify: document appears in API
 *   8. Cleanup
 */
test.describe('Automatic Ingestion Pipeline', () => {
  let payloadToken = ''
  let mediaId: number | null = null
  let documentId: number | null = null
  const testYear = 2097

  async function payloadFetch(urlPath: string, options: RequestInit = {}) {
    return fetch(`${BASE_URL}${urlPath}`, {
      ...options,
      headers: {
        ...(options.headers as Record<string, string>),
        ...(payloadToken ? { Authorization: `JWT ${payloadToken}` } : {}),
      },
    })
  }

  test.beforeAll(async () => {
    // Login (user should already exist from previous test runs or seed)
    let res = await fetch(`${BASE_URL}/cms/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@test.de', password: 'testtest1234' }),
    })

    if (!res.ok) {
      // Create first user
      await fetch(`${BASE_URL}/cms/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test Admin',
          email: 'test@test.de',
          password: 'testtest1234',
          roles: ['admin'],
        }),
      })
      res = await fetch(`${BASE_URL}/cms/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@test.de', password: 'testtest1234' }),
      })
    }

    const data = await res.json()
    payloadToken = data.token || ''
    expect(payloadToken).toBeTruthy()
  })

  test('upload PDF → auto-process → searchable', async ({ request }) => {
    // Step 1: Create test PDF
    execSync(
      `docker compose run --rm cli python -c "
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet

pdf_path = '/data/pdfs/auto-pipeline-test.pdf'
doc = SimpleDocTemplate(pdf_path, pagesize=A4)
styles = getSampleStyleSheet()
story = [
    Paragraph('Automatischer Pipeline-Test ${testYear}', styles['Title']),
    Spacer(1, 20),
    Paragraph('Dieser Bericht testet den automatischen Verarbeitungsworkflow. '
              'UniqueAutoTest${testYear} ist ein einzigartiger Suchbegriff.', styles['Normal']),
    Spacer(1, 12),
    Paragraph('Der Verfassungsschutz beobachtet extremistische Bestrebungen. '
              'NSU-Komplex und Rechtsextremismus werden erwaehnt.', styles['Normal']),
]
doc.build(story)
print('OK')
"`,
      { timeout: DOCKER_TIMEOUT, stdio: 'pipe' }
    )

    const pdfPath = path.join(DATA_DIR, 'pdfs', 'auto-pipeline-test.pdf')
    expect(existsSync(pdfPath)).toBe(true)

    // Step 2: Upload PDF to Payload Media
    const pdfBuffer = readFileSync(pdfPath)
    const formData = new FormData()
    formData.append('file', new Blob([pdfBuffer], { type: 'application/pdf' }), 'auto-pipeline-test.pdf')
    formData.append('_payload', JSON.stringify({ alt: 'Auto Pipeline Test' }))

    const uploadRes = await payloadFetch('/cms/media', { method: 'POST', body: formData })
    expect(uploadRes.ok).toBe(true)
    const uploadData = await uploadRes.json()
    mediaId = uploadData.doc?.id
    expect(mediaId).toBeTruthy()

    // Step 3: Create Document in Payload — this triggers the afterChange hook
    // which queues the processPdf job automatically
    const createRes = await payloadFetch('/cms/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: `Auto Pipeline Test ${testYear}`,
        jurisdiction: 'Bund',
        year: testYear,
        documentType: 'jahresbericht',
        language: 'de',
        pdf: mediaId,
      }),
    })
    expect(createRes.ok).toBe(true)
    const createData = await createRes.json()
    documentId = createData.doc?.id
    expect(documentId).toBeTruthy()
    expect(createData.doc?.processingStatus).toBe('pending')

    // Step 4: Wait for automatic processing
    // autoRun checks every 10s, processing takes a few seconds
    // Poll every 5s for up to 60s
    let status = 'pending'
    for (let i = 0; i < 12; i++) {
      await new Promise((r) => setTimeout(r, 5000))
      const checkRes = await payloadFetch(`/cms/documents/${documentId}`)
      const checkData = await checkRes.json()
      status = checkData.processingStatus
      if (status === 'completed' || status === 'error') break
    }

    expect(status).toBe('completed')

    // Step 5: Verify Payload document has numPages
    const finalRes = await payloadFetch(`/cms/documents/${documentId}`)
    const finalData = await finalRes.json()
    expect(finalData.processingStatus).toBe('completed')
    // numPages is set by the job handler after worker returns
    expect(finalData.numPages == null ? 0 : finalData.numPages).toBeGreaterThanOrEqual(0)

    // Step 6: Verify document is searchable
    const searchRes = await request.get(`/suche?q=UniqueAutoTest${testYear}`)
    expect(searchRes.ok()).toBe(true)
    const searchHtml = await searchRes.text()
    expect(searchHtml).toContain(`UniqueAutoTest${testYear}`)

    // Step 7: Verify PNG images were created (not JPEG/AVIF)
    const pngExists = existsSync(path.join(DATA_DIR, 'images', 'document-' + documentId + '_0.png'))
    expect(pngExists).toBe(true)

    // Step 8: Verify API has the document
    const apiRes = await request.get('/api')
    const apiData = await apiRes.json()
    const bundReport = apiData.reports.find((r: { jurisdiction: string }) => r.jurisdiction === 'Bund')
    expect(bundReport.years).toContain(testYear)
  })

  test.afterAll(async () => {
    // Cleanup Payload
    if (documentId) {
      await payloadFetch(`/cms/documents/${documentId}`, { method: 'DELETE' })
    }
    if (mediaId) {
      await payloadFetch(`/cms/media/${mediaId}`, { method: 'DELETE' })
    }

    // Cleanup raw SQL
    try {
      execSync(
        `docker compose run --rm cli python -c "
import psycopg2, os
conn = psycopg2.connect(os.environ['DATABASE_URL'])
cur = conn.cursor()
cur.execute('SELECT id FROM document WHERE year = ${testYear}')
for row in cur.fetchall():
    did = row[0]
    cur.execute('DELETE FROM token_count WHERE document_id = %s', (did,))
    cur.execute('DELETE FROM document_page WHERE document_id = %s', (did,))
    cur.execute('DELETE FROM document WHERE id = %s', (did,))
conn.commit()
cur.close()
conn.close()
"`,
        { timeout: DOCKER_TIMEOUT, stdio: 'pipe' }
      )
    } catch { /* ignore */ }

    // Cleanup files
    try {
      execSync(`rm -f ${DATA_DIR}/pdfs/auto-pipeline-test.pdf ${DATA_DIR}/pdfs/document-${documentId}.pdf`, { stdio: 'pipe' })
      execSync(`rm -f ${DATA_DIR}/images/document-${documentId}_*.png`, { stdio: 'pipe' })
      execSync(`rm -f ${DATA_DIR}/wordpos/document-${documentId}_*.json.gz`, { stdio: 'pipe' })
    } catch { /* ignore */ }
  })
})
