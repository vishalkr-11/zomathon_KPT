// Thin re-export — all toast calls now go through sonner directly.
// Usage anywhere in the app:
//   import { toast } from 'sonner'
//   toast.success('Done')   toast.error('Oops')   toast.warning('...')   toast.info('...')
//
// The <Toaster /> is mounted once in src/app/layout.jsx — no per-page setup needed.

export { toast } from 'sonner'
