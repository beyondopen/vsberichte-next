import config from '@payload-config'
import { NotFoundPage } from '@payloadcms/next/views'
import { importMap } from './importMap'

export default function NotFound() {
  return NotFoundPage({
    config,
    importMap,
    params: Promise.resolve({ segments: ['not-found'] }),
    searchParams: Promise.resolve({}),
  })
}
