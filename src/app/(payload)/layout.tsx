import type { ServerFunctionClient } from 'payload'

import config from '@payload-config'
import { handleServerFunctions, RootLayout } from '@payloadcms/next/layouts'
import { importMap } from './admin/[[...segments]]/importMap'
import React from 'react'

import '@payloadcms/next/css'

type LayoutArgs = { children: React.ReactNode }

// Must be an inline server action ('use server') so React can serialize the
// reference when passing it to the client-side admin provider. Passing
// handleServerFunctions directly crashes the admin in production builds.
const serverFunction: ServerFunctionClient = async function (args) {
  'use server'
  return handleServerFunctions({
    ...args,
    config,
    importMap,
  })
}

export default async function Layout({ children }: LayoutArgs) {
  return (
    <RootLayout config={config} importMap={importMap} serverFunction={serverFunction}>
      {children}
    </RootLayout>
  )
}
