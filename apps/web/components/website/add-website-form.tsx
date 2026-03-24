'use client'

import { useState } from 'react'
import { Input } from '../common/input'
import { Button } from '../common/button'
import { isValidUrl } from '../../lib/utils'

interface AddWebsiteFormProps {
  onSubmit: (url: string) => Promise<void>
  isLoading?: boolean
}

export function AddWebsiteForm({ onSubmit, isLoading = false }: AddWebsiteFormProps) {
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!url.trim()) {
      setError('URL is required')
      return
    }

    if (!isValidUrl(url)) {
      setError('Please enter a valid URL')
      return
    }

    try {
      await onSubmit(url)
      setUrl('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add website')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Website URL"
        type="url"
        placeholder="https://example.com"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        error={error}
      />
      <Button type="submit" isLoading={isLoading}>
        Add Website
      </Button>
    </form>
  )
}