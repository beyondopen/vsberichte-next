import config from '@payload-config'
import { RootLayout } from '@payloadcms/next/layouts'
import { handleServerFunctions } from '@payloadcms/next/layouts'
import { importMap } from './admin/[[...segments]]/importMap'
import React from 'react'

import '@payloadcms/next/css'

type LayoutArgs = { children: React.ReactNode }

export default async function Layout({ children }: LayoutArgs) {
  return RootLayout({
    children,
    config,
    importMap,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    serverFunction: handleServerFunctions as any,
  })
}
