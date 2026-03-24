import Link from 'next/link'
import { ROUTES } from '../lib/constants'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 px-6">
      <div className="max-w-2xl text-center">
        <h1 className="mb-4 text-6xl font-bold text-gray-900">RunState</h1>

        <p className="mb-8 text-xl text-gray-600">
          Monitor your websites in real-time. Get instant alerts when services go down.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href={ROUTES.SIGNIN}
            className="inline-block rounded-lg bg-blue-600 px-8 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Sign In
          </Link>

          <Link
            href={ROUTES.SIGNIN}
            className="inline-block rounded-lg border border-blue-600 bg-white px-8 py-3 font-semibold text-blue-600 transition hover:bg-blue-50"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  )
}