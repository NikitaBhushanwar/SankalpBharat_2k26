'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { SponsorEntry } from '@/lib/admin-repository'
import { Trash2, Edit2, Plus, X, AlertTriangle, ArrowLeft, LogOut } from 'lucide-react'
import { useAuth } from '@/context/auth-context'

const isValidSponsorId = (id: unknown): id is string =>
  typeof id === 'string' && id.trim().length > 0 && id !== 'undefined' && id !== 'null'

export default function SponsorsPage() {
  const router = useRouter()
  const { isAuthenticated, logout } = useAuth()

  const [sponsors, setSponsors] = useState<SponsorEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [uploadingPrimary, setUploadingPrimary] = useState(false)
  const [uploadingSecondary, setUploadingSecondary] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [primaryPreviewUrl, setPrimaryPreviewUrl] = useState<string | null>(null)
  const [secondaryPreviewUrl, setSecondaryPreviewUrl] = useState<string | null>(null)
  const [showCustomCategory, setShowCustomCategory] = useState(false)
  const [customCategoryInput, setCustomCategoryInput] = useState('')
  const [formData, setFormData] = useState<Omit<SponsorEntry, 'id'>>({
    name: '',
    logoUrl: '',
    secondaryLogoUrl: null,
    websiteUrl: null,
    category: '',
    titlePrimary: null,
    titleSecondary: null,
    description: null,
    displayOrder: 0,
    isFeatured: false,
  })

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/admin/login')
      return
    }

    const initializeAndFetch = async () => {
      try {
        // Initialize bucket first
        const initResponse = await fetch('/api/sponsors/init', {
          method: 'POST',
        })
        const initResult = await initResponse.json()
        
        if (!initResult.success && initResponse.status !== 200) {
          console.warn('Bucket initialization warning:', initResult.error)
        }

        // Then fetch sponsors
        await fetchSponsors()
      } catch (err) {
        console.warn('Initialization error:', err instanceof Error ? err.message : 'Unknown error')
        // Still try to fetch sponsors even if init fails
        await fetchSponsors()
      }
    }

    void initializeAndFetch()
  }, [isAuthenticated, router])

  const fetchSponsors = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/sponsors')
      const result = await response.json()

      if (result.success) {
        setSponsors(result.data)
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sponsors')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      setError(null)

      if (editingId && !isValidSponsorId(editingId)) {
        setError('Invalid sponsor id. Please close and reopen this form.')
        return
      }
      
      // Client-side validation
      if (!formData.name || !formData.name.trim()) {
        setError('Sponsor name is required')
        setSubmitting(false)
        return
      }
      if (!formData.category || !formData.category.trim()) {
        setError('Category is required')
        setSubmitting(false)
        return
      }
      if (!formData.logoUrl || !formData.logoUrl.trim()) {
        setError('Logo image must be uploaded first. Please wait for the upload to complete.')
        setSubmitting(false)
        return
      }

      const method = editingId ? 'PUT' : 'POST'
      const url = editingId ? `/api/sponsors/${editingId}` : '/api/sponsors'

      console.log(`Making ${method} request to ${url}`, formData)
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const result = await response.json()
      console.log('API Response:', result)

      if (result.success) {
        await fetchSponsors()
        resetForm()
        setShowForm(false)
        setError(null)
      } else {
        setError(result.error || 'Failed to save sponsor')
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to save sponsor'
      console.error('Form submission error:', err)
      setError(errorMsg)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!isValidSponsorId(id)) {
      setError('Invalid sponsor id. Please refresh and try again.')
      return
    }

    if (!confirm('Are you sure you want to delete this sponsor?')) return

    try {
      setDeletingId(id)
      setError(null)
      
      const response = await fetch(`/api/sponsors/${id}`, {
        method: 'DELETE',
      })

      const result = await response.json()
      console.log('Delete response:', result)

      if (result.success) {
        await fetchSponsors()
        setError(null)
      } else {
        setError(result.error || 'Failed to delete sponsor')
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to delete sponsor'
      console.error('Delete error:', err)
      setError(errorMsg)
    } finally {
      setDeletingId(null)
    }
  }

  const handleEdit = (sponsor: SponsorEntry) => {
    if (!isValidSponsorId(sponsor.id)) {
      setError('This sponsor has an invalid id. Please refresh the page.')
      return
    }

    setFormData({
      name: sponsor.name,
      logoUrl: sponsor.logoUrl,
      secondaryLogoUrl: sponsor.secondaryLogoUrl,
      websiteUrl: sponsor.websiteUrl,
      category: sponsor.category,
      titlePrimary: sponsor.titlePrimary,
      titleSecondary: sponsor.titleSecondary,
      description: sponsor.description,
      displayOrder: sponsor.displayOrder,
      isFeatured: sponsor.isFeatured,
    })
    setPrimaryPreviewUrl(sponsor.logoUrl)
    setSecondaryPreviewUrl(sponsor.secondaryLogoUrl)
    setEditingId(sponsor.id)
    setShowForm(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      logoUrl: '',
      secondaryLogoUrl: null,
      websiteUrl: null,
      category: '',
      titlePrimary: null,
      titleSecondary: null,
      description: null,
      displayOrder: 0,
      isFeatured: false,
    })
    setEditingId(null)
    setPrimaryPreviewUrl(null)
    setSecondaryPreviewUrl(null)
  }

  const handleImageUpload = async (file: File, target: 'primary' | 'secondary') => {
    if (!file) return

    try {
      if (target === 'primary') {
        setUploadingPrimary(true)
      } else {
        setUploadingSecondary(true)
      }
      setError(null)

      const formDataToSend = new FormData()
      formDataToSend.append('file', file)

      const response = await fetch('/api/sponsors/upload', {
        method: 'POST',
        body: formDataToSend,
      })

      const result = await response.json()

      if (result.success) {
        setFormData((prev) =>
          target === 'primary'
            ? { ...prev, logoUrl: result.data.url }
            : { ...prev, secondaryLogoUrl: result.data.url }
        )
        if (target === 'primary') {
          setPrimaryPreviewUrl(result.data.url)
        } else {
          setSecondaryPreviewUrl(result.data.url)
        }
      } else {
        setError(result.error || 'Failed to upload image')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image')
    } finally {
      if (target === 'primary') {
        setUploadingPrimary(false)
      } else {
        setUploadingSecondary(false)
      }
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>, target: 'primary' | 'secondary') => {
    const file = e.target.files?.[0]
    if (file) {
      // Clear any previous error when user selects new file
      if (error && error.includes('upload')) {
        setError(null)
      }
      
      // Show preview immediately
      const reader = new FileReader()
      reader.onloadend = () => {
        if (target === 'primary') {
          setPrimaryPreviewUrl(reader.result as string)
        } else {
          setSecondaryPreviewUrl(reader.result as string)
        }
      }
      reader.readAsDataURL(file)

      // Upload file
      handleImageUpload(file, target)
    }
  }

  const handleFormClose = () => {
    setShowForm(false)
    resetForm()
  }

  const handleAddNewClick = () => {
    resetForm()
    setShowCustomCategory(false)
    setCustomCategoryInput('')
    setError(null)
    setShowForm((prev) => !prev)
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <section className="min-h-screen px-4 sm:px-6 lg:px-8 pt-28 pb-10">
      <div className="max-w-6xl mx-auto rounded-3xl border border-cyan-500/20 bg-slate-950/80 backdrop-blur-xl shadow-2xl p-4 sm:p-6 lg:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-cyan-300 transition"
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </button>

          <button
            onClick={() => {
              logout()
              router.replace('/admin/login')
            }}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-red-500/20 text-red-300 hover:bg-red-500/30 transition"
          >
            <LogOut size={14} /> Logout
          </button>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white">Sponsors</h1>
          <p className="text-sm text-slate-400 mt-1">Manage sponsor entries and logos for public display.</p>
        </div>

        <div className="flex justify-end mb-4">
          <button
            onClick={handleAddNewClick}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500 text-slate-950 text-sm font-black hover:brightness-110 transition"
          >
            <Plus size={16} /> {showForm ? 'Close' : 'Add Sponsor'}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-xl border border-rose-500/40 bg-gradient-to-r from-rose-500/20 via-rose-500/15 to-amber-500/10 shadow-lg shadow-rose-500/10 backdrop-blur-sm">
            <div className="flex items-start gap-3 p-3 sm:p-4">
              <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-rose-500/20 text-rose-300">
                <AlertTriangle size={14} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-rose-300/90">Action failed</p>
                <p className="mt-1 text-sm sm:text-base text-rose-100 break-words">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-rose-400/30 text-rose-200/90 hover:bg-rose-500/20 hover:text-rose-100 transition-colors"
                aria-label="Dismiss error"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Form Section */}
        {showForm && (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 rounded-2xl border border-blue-500/20 bg-slate-900/80 p-4 sm:p-5 mb-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                {editingId ? 'Edit Sponsor' : 'Add New Sponsor'}
              </h2>
            </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-foreground mb-2">
                    Sponsor Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Acme Corporation"
                    className="w-full px-3 sm:px-4 py-2 text-sm rounded-lg border border-border/50 bg-background/50 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-foreground mb-2">
                    Category *
                  </label>
                  {!showCustomCategory ? (
                    <div className="space-y-2">
                      <select
                        value={formData.category}
                        onChange={(e) => {
                          if (e.target.value === 'custom') {
                            setShowCustomCategory(true)
                            setCustomCategoryInput('')
                          } else {
                            setFormData({ ...formData, category: e.target.value })
                          }
                        }}
                        className="w-full px-3 sm:px-4 py-2 text-sm rounded-lg border border-border/50 bg-background/50 text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500"
                        required
                      >
                        <option value="">Select a category</option>
                        <option value="Gold">Gold</option>
                        <option value="Silver">Silver</option>
                        <option value="Bronze">Bronze</option>
                        <option value="Platinum">Platinum</option>
                        <option value="Title Sponsors">Title Sponsors</option>
                        <option value="Co Powered By Sponsors">Co Powered By Sponsors</option>
                        <option value="Powered By Sponsor">Powered By Sponsor</option>
                        <option value="Technology Partner">Technology Partner</option>
                        <option value="Media Partner">Media Partner</option>
                        <option value="Community Partner">Community Partner</option>
                        <option value="Education Partner">Education Partner</option>
                        <option value="Associate Partner">Associate Partner</option>
                        <option value="custom">+ Add Custom Category</option>
                      </select>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={customCategoryInput}
                        onChange={(e) => setCustomCategoryInput(e.target.value)}
                        placeholder="Enter custom category name"
                        className="w-full px-3 sm:px-4 py-2 text-sm rounded-lg border border-border/50 bg-background/50 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-500"
                        required
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (customCategoryInput.trim()) {
                              setFormData({ ...formData, category: customCategoryInput.trim() })
                              setShowCustomCategory(false)
                              setCustomCategoryInput('')
                            }
                          }}
                          className="flex-1 px-3 py-1 text-xs bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-all"
                        >
                          Confirm
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowCustomCategory(false)
                            setCustomCategoryInput('')
                            setFormData({ ...formData, category: '' })
                          }}
                          className="flex-1 px-3 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg font-semibold transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Sponsor Titles */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-foreground mb-2">
                    Title 1
                  </label>
                  <input
                    type="text"
                    value={formData.titlePrimary || ''}
                    onChange={(e) => setFormData({ ...formData, titlePrimary: e.target.value || null })}
                    placeholder="e.g., Title Sponsors"
                    className="w-full px-3 sm:px-4 py-2 text-sm rounded-lg border border-border/50 bg-background/50 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-foreground mb-2">
                    Title 2
                  </label>
                  <input
                    type="text"
                    value={formData.titleSecondary || ''}
                    onChange={(e) => setFormData({ ...formData, titleSecondary: e.target.value || null })}
                    placeholder="Optional second title"
                    className="w-full px-3 sm:px-4 py-2 text-sm rounded-lg border border-border/50 bg-background/50 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                {/* Primary Logo Upload */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-foreground mb-2">
                    Primary Logo Image * (PNG, JPG, or SVG - Max 5MB)
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                      onChange={(e) => handleFileInputChange(e, 'primary')}
                      disabled={uploadingPrimary}
                      className="w-full px-4 py-2 rounded-lg border border-border/50 bg-background/50 text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-orange-500 file:text-white hover:file:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    {uploadingPrimary && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-lg">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Secondary Logo Upload */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-foreground mb-2">
                    Secondary Logo Image (Optional)
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                      onChange={(e) => handleFileInputChange(e, 'secondary')}
                      disabled={uploadingSecondary}
                      className="w-full px-4 py-2 rounded-lg border border-border/50 bg-background/50 text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-orange-500 file:text-white hover:file:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    {uploadingSecondary && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-lg">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Website URL */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-foreground mb-2">
                    Website URL
                  </label>
                  <input
                    type="url"
                    value={formData.websiteUrl || ''}
                    onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value || null })}
                    placeholder="https://..."
                    className="w-full px-3 sm:px-4 py-2 text-sm rounded-lg border border-border/50 bg-background/50 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                {/* Display Order */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-foreground mb-2">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) =>
                      setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })
                    }
                    min="0"
                    className="w-full px-3 sm:px-4 py-2 text-sm rounded-lg border border-border/50 bg-background/50 text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                {/* Featured */}
                <div className="flex items-end h-full">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                      className="w-4 h-4 rounded border-border accent-orange-500"
                    />
                    <span className="text-xs sm:text-sm font-semibold text-foreground">Featured Sponsor</span>
                  </label>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-foreground mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value || null })}
                  placeholder="Add sponsor details, contribution area, etc."
                  rows={3}
                  className="w-full px-3 sm:px-4 py-2 text-sm rounded-lg border border-border/50 bg-background/50 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Logo Preview */}
              {(primaryPreviewUrl || secondaryPreviewUrl) && (
                <div className="p-3 sm:p-4 bg-background/30 border border-orange-500/30 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-xs sm:text-sm font-semibold text-foreground">
                      Logo Preview
                    </label>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {primaryPreviewUrl && (
                      <div>
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-xs font-semibold text-muted-foreground">Primary Logo</span>
                          <button
                            type="button"
                            onClick={() => {
                              setPrimaryPreviewUrl(null)
                              setFormData({ ...formData, logoUrl: '' })
                            }}
                            className="p-1 hover:bg-red-500/20 rounded transition-colors"
                          >
                            <X size={16} className="text-red-500" />
                          </button>
                        </div>
                        <div className="h-40 bg-background/50 rounded-lg p-4 flex items-center justify-center border border-border/30">
                          <img
                            src={primaryPreviewUrl}
                            alt="Primary logo preview"
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                      </div>
                    )}

                    {secondaryPreviewUrl && (
                      <div>
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-xs font-semibold text-muted-foreground">Secondary Logo</span>
                          <button
                            type="button"
                            onClick={() => {
                              setSecondaryPreviewUrl(null)
                              setFormData({ ...formData, secondaryLogoUrl: null })
                            }}
                            className="p-1 hover:bg-red-500/20 rounded transition-colors"
                          >
                            <X size={16} className="text-red-500" />
                          </button>
                        </div>
                        <div className="h-40 bg-background/50 rounded-lg p-4 flex items-center justify-center border border-border/30">
                          <img
                            src={secondaryPreviewUrl}
                            alt="Secondary logo preview"
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-700/60">
                <button
                  type="submit"
                  disabled={submitting || uploadingPrimary || uploadingSecondary}
                  className="flex-1 px-4 py-2.5 text-sm sm:text-base rounded-xl bg-blue-500 text-slate-950 font-black hover:brightness-110 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      {editingId ? 'Updating...' : 'Adding...'}
                    </>
                  ) : (
                    editingId ? 'Update Sponsor' : 'Add Sponsor'
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleFormClose}
                  disabled={submitting}
                  className="flex-1 px-4 py-2.5 text-sm sm:text-base rounded-xl bg-slate-800 border border-slate-700 text-slate-200 font-semibold hover:bg-slate-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </form>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
            <p className="mt-4 text-muted-foreground">Loading sponsors...</p>
          </div>
        )}

        {/* Sponsors Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sponsors.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">No sponsors added yet. Create one to get started!</p>
              </div>
            ) : (
              sponsors.map((sponsor) => (
                <div
                  key={sponsor.id || sponsor.name}
                  className="p-4 sm:p-6 bg-gradient-to-br from-background to-background/50 border border-border/50 rounded-xl glass-effect hover:border-orange-500/30 transition-all duration-300 group"
                >
                  {/* Logo */}
                  <div className="mb-4 h-40 sm:h-48 bg-background/50 rounded-lg p-3 sm:p-4 border border-border/30">
                    <div className={`grid h-full w-full gap-3 ${sponsor.secondaryLogoUrl ? 'grid-cols-2' : 'grid-cols-1'}`}>
                      <div className="flex items-center justify-center">
                        <img
                          src={sponsor.logoUrl}
                          alt={`${sponsor.name} primary logo`}
                          className="max-w-full max-h-full object-contain"
                          onError={(e) => {
                            e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect fill="%23f0f0f0" width="100" height="100"/%3E%3Ctext x="50" y="50" font-size="14" text-anchor="middle" dy=".3em" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E'
                          }}
                        />
                      </div>
                      {sponsor.secondaryLogoUrl && (
                        <div className="flex items-center justify-center border-l border-border/30 pl-2">
                          <img
                            src={sponsor.secondaryLogoUrl}
                            alt={`${sponsor.name} secondary logo`}
                            className="max-w-full max-h-full object-contain"
                            onError={(e) => {
                              e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect fill="%23f0f0f0" width="100" height="100"/%3E%3Ctext x="50" y="50" font-size="14" text-anchor="middle" dy=".3em" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E'
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-base sm:text-lg font-bold text-foreground mb-2 line-clamp-2">
                    {sponsor.name}
                  </h3>

                  {(sponsor.titlePrimary || sponsor.titleSecondary) && (
                    <div className="mb-3 flex flex-wrap gap-2">
                      {sponsor.titlePrimary && (
                        <span className="px-2 py-1 rounded text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/30">
                          {sponsor.titlePrimary}
                        </span>
                      )}
                      {sponsor.titleSecondary && (
                        <span className="px-2 py-1 rounded text-xs font-semibold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                          {sponsor.titleSecondary}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="space-y-2 mb-4 text-xs sm:text-sm">
                    <div>
                      <span className="text-muted-foreground">Category:</span>{' '}
                      <span className="text-foreground font-semibold">{sponsor.category}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Order:</span>{' '}
                      <span className="text-foreground font-semibold">{sponsor.displayOrder}</span>
                    </div>
                    {sponsor.isFeatured && (
                      <div className="inline-block px-2 py-1 bg-orange-500/20 text-orange-600 dark:text-orange-400 rounded text-xs font-semibold">
                        Featured
                      </div>
                    )}
                  </div>

                  {sponsor.description && (
                    <p className="text-xs sm:text-sm text-muted-foreground mb-4 line-clamp-2">
                      {sponsor.description}
                    </p>
                  )}

                  {sponsor.websiteUrl && (
                    <a
                      href={sponsor.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-orange-500 hover:text-orange-600 text-xs sm:text-sm font-semibold mb-4 block truncate"
                    >
                      Visit Website →
                    </a>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300">
                    <button
                      onClick={() => handleEdit(sponsor)}
                      disabled={deletingId !== null || !isValidSponsorId(sponsor.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg font-semibold hover:bg-blue-500/30 transition-all duration-300 text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Edit2 size={16} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(sponsor.id)}
                      disabled={deletingId !== null || !isValidSponsorId(sponsor.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg font-semibold hover:bg-red-500/30 transition-all duration-300 text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {deletingId === sponsor.id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                          <span>Deleting...</span>
                        </>
                      ) : (
                        <>
                          <Trash2 size={16} />
                          Delete
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </section>
  )
}

