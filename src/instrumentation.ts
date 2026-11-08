// Initialises Payload at server start, which runs pending migrations and starts the job cron.
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs' || process.env.NODE_ENV !== 'production') return

  const [{ getPayload }, { default: config }] = await Promise.all([
    import('payload'),
    import('@payload-config'),
  ])
  await getPayload({ config, cron: true })
}
