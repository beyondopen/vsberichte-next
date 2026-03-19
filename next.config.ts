import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'

const onionHost = 'zq5xve7vxljrsccptc4wxmuebnuiglhylahfwahyw7dzlxc43em4w6yd.onion'

const nextConfig: NextConfig = {
  output: 'standalone',
  async headers() {
    return [{
      source: '/:path*',
      headers: [
        { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubdomains; preload' },
        { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin' },
        {
          key: 'Content-Security-Policy',
          value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' https://matomo.daten.cool",
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: https://matomo.daten.cool",
            "font-src 'self'",
            "connect-src 'self' https://matomo.daten.cool",
            "form-action 'self' https://listen.daten.cool",
            "frame-ancestors 'self'",
          ].join('; '),
        },
        { key: 'Onion-Location', value: `http://${onionHost}/:path*` },
      ],
    }]
  },
  async rewrites() {
    return [
      { source: '/:slug.txt', destination: '/text-export/:slug' },
    ]
  },
}

export default withPayload(nextConfig)
