'use client'

import { Toaster as Sonner } from 'sonner'

export function Toaster(props) {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      position="bottom-right"
      richColors
      toastOptions={{
        style: {
          background: '#1E1E1E',
          border: '1px solid #2A2A2A',
          color: '#F0EDE8',
          fontFamily: 'DM Sans, sans-serif',
          fontSize: 13,
          borderRadius: 10,
        },
      }}
      {...props}
    />
  )
}
