'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  FileText,
  LogOut,
  Trophy,
  Medal,
  Users,
  ShieldCheck,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  KeyRound,
  Sparkles,
} from 'lucide-react'
import { useAuth } from '@/context/auth-context'
import type { QualifiedTeamEntry, SponsorEntry } from '@/lib/admin-repository'

interface LeaderboardEntry {
  id: string
  rank: number
  teamName: string
  projectTitle: string
  score: number
  isDisqualified: boolean
  members: number
}

interface WinnerEntry {
  id: string
  rank: number
  teamName: string
  title: string
  prizeAmount: string
}

interface ProblemStatementEntry {
  id: string
  title: string
  domain: string
  description: string
  pdfLink?: string
}

interface ApiResponse<T> {
  success: boolean
  data: T
  error?: string
}

interface RegistrationLinkData {
  registrationLink: string
}

interface NavbarVisibilityState {
  leaderboard: boolean
  winners: boolean
  qualifiedTeams: boolean
}

interface PublishState {
  leaderboard: boolean
  winners: boolean
  problemStatements: boolean
  problemStatementsDownload: boolean
  qualifiedTeams: boolean
}

interface AdminAccessUser {
  id: string
  email: string
  password?: string | null
  isPrimarySuperAdmin: boolean
  isSuperAdmin: boolean
  isActive: boolean
  createdAt: string
}

const emptyTeamForm = {
  teamName: '',
  projectTitle: '',
  score: '',
  scoreAdjustment: '0',
  isDisqualified: false,
  members: '',
}

const emptyWinnerForm = {
  teamName: '',
  title: '',
  prizeAmount: '',
}

const emptyProblemForm = {
  title: '',
  domain: '',
  description: '',
  pdfLink: '',
}

const emptySponsorForm = {
  name: '',
  logoUrl: '',
  websiteUrl: '',
  category: '',
  customTierName: '',
  description: '',
  displayOrder: '0',
  isFeatured: false,
}

const emptyQualifiedTeamForm = {
  teamName: '',
  logoUrl: '',
  participantNamesText: '',
  collegeName: '',
}

const emptyAccessForm = {
  email: '',
  password: '',
  isSuperAdmin: false,
  isActive: true,
}

const emptyPasswordForm = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
}

const defaultRegistrationLink = 'https://unstop.com/'

export default function AdminDashboardPage() {
  const router = useRouter()
  const { isAuthenticated, logout, user } = useAuth()

  const [activeTab, setActiveTab] = useState<'leaderboard' | 'winners' | 'problemStatements' | 'qualifiedTeams' | 'sponsors' | 'access'>('leaderboard')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [winners, setWinners] = useState<WinnerEntry[]>([])
  const [problemStatements, setProblemStatements] = useState<ProblemStatementEntry[]>([])
  const [qualifiedTeams, setQualifiedTeams] = useState<QualifiedTeamEntry[]>([])
  const [sponsors, setSponsors] = useState<SponsorEntry[]>([])
  const [adminUsers, setAdminUsers] = useState<AdminAccessUser[]>([])

  const [showTeamForm, setShowTeamForm] = useState(false)
  const [showWinnerForm, setShowWinnerForm] = useState(false)
  const [showProblemForm, setShowProblemForm] = useState(false)
  const [showQualifiedTeamForm, setShowQualifiedTeamForm] = useState(false)
  const [showSponsorForm, setShowSponsorForm] = useState(false)
  const [showAccessForm, setShowAccessForm] = useState(false)

  const [editingTeamId, setEditingTeamId] = useState<string | null>(null)
  const [editingWinnerId, setEditingWinnerId] = useState<string | null>(null)
  const [editingProblemId, setEditingProblemId] = useState<string | null>(null)
  const [editingQualifiedTeamId, setEditingQualifiedTeamId] = useState<string | null>(null)
  const [editingSponsorId, setEditingSponsorId] = useState<string | null>(null)
  const [editingAccessId, setEditingAccessId] = useState<string | null>(null)

  const [teamForm, setTeamForm] = useState(emptyTeamForm)
  const [winnerForm, setWinnerForm] = useState(emptyWinnerForm)
  const [problemForm, setProblemForm] = useState(emptyProblemForm)
  const [qualifiedTeamForm, setQualifiedTeamForm] = useState(emptyQualifiedTeamForm)
  const [sponsorForm, setSponsorForm] = useState(emptySponsorForm)
  const [accessForm, setAccessForm] = useState(emptyAccessForm)
  const [sponsorPreviewUrl, setSponsorPreviewUrl] = useState<string | null>(null)
  const [qualifiedTeamPreviewUrl, setQualifiedTeamPreviewUrl] = useState<string | null>(null)
  const [sponsorUploading, setSponsorUploading] = useState(false)
  const [qualifiedTeamUploading, setQualifiedTeamUploading] = useState(false)
  const [passwordForm, setPasswordForm] = useState(emptyPasswordForm)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [registrationLink, setRegistrationLink] = useState(defaultRegistrationLink)
  const [registrationLinkInput, setRegistrationLinkInput] = useState(defaultRegistrationLink)
  const [navbarVisibility, setNavbarVisibility] = useState<NavbarVisibilityState>({
    leaderboard: true,
    winners: true,
    qualifiedTeams: true,
  })
  const [revealedAdminPasswords, setRevealedAdminPasswords] = useState<Record<string, boolean>>({})
  const [publishState, setPublishState] = useState<PublishState>({
    leaderboard: false,
    winners: false,
    problemStatements: false,
    problemStatementsDownload: false,
    qualifiedTeams: false,
  })

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/admin/login')
      return
    }

    void loadData()
  }, [isAuthenticated, router])

  const notifyLeaderboardUpdated = () => {
    const updateAt = String(Date.now())

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const channel = new BroadcastChannel('sb_admin_updates')
      channel.postMessage({ type: 'leaderboard-updated', updatedAt: updateAt })
      channel.close()
    }

    localStorage.setItem('sb_leaderboard_updated_at', updateAt)
  }

  const loadData = async () => {
    setLoading(true)
    setError(null)

    try {
      const [leaderboardRes, winnersRes, problemStatementsRes, qualifiedTeamsRes, sponsorsRes, publishRes] = await Promise.all([
        fetch('/api/leaderboard?sortBy=rank', { cache: 'no-store' }),
        fetch('/api/winners', { cache: 'no-store' }),
        fetch('/api/problem-statements', { cache: 'no-store' }),
        fetch('/api/qualified-teams', { cache: 'no-store' }),
        fetch('/api/sponsors', { cache: 'no-store' }),
        fetch('/api/publish-state', { cache: 'no-store' }),
      ])

      const leaderboardJson = (await leaderboardRes.json()) as ApiResponse<LeaderboardEntry[]>
      const winnersJson = (await winnersRes.json()) as ApiResponse<WinnerEntry[]>
      const problemStatementsJson = (await problemStatementsRes.json()) as ApiResponse<ProblemStatementEntry[]>
      const qualifiedTeamsJson = (await qualifiedTeamsRes.json()) as ApiResponse<QualifiedTeamEntry[]>
      const sponsorsJson = (await sponsorsRes.json()) as ApiResponse<SponsorEntry[]>
      const publishJson = (await publishRes.json()) as ApiResponse<PublishState>

      if (!leaderboardRes.ok || !leaderboardJson.success) {
        throw new Error(leaderboardJson.error || 'Failed to fetch leaderboard')
      }

      if (!winnersRes.ok || !winnersJson.success) {
        throw new Error(winnersJson.error || 'Failed to fetch winners')
      }

      if (!problemStatementsRes.ok || !problemStatementsJson.success) {
        throw new Error(problemStatementsJson.error || 'Failed to fetch problem statements')
      }

      if (!qualifiedTeamsRes.ok || !qualifiedTeamsJson.success) {
        throw new Error(qualifiedTeamsJson.error || 'Failed to fetch qualified teams')
      }

      if (!sponsorsRes.ok || !sponsorsJson.success) {
        throw new Error(sponsorsJson.error || 'Failed to fetch sponsors')
      }

      setLeaderboard(leaderboardJson.data ?? [])
      setWinners(winnersJson.data ?? [])
      setProblemStatements(problemStatementsJson.data ?? [])
      setQualifiedTeams(qualifiedTeamsJson.data ?? [])
      setSponsors(sponsorsJson.data ?? [])
      if (publishJson.success && publishJson.data) {
        setPublishState(publishJson.data)
      }

      if (user?.isSuperAdmin) {
        const [adminUsersRes, registrationLinkRes, navbarVisibilityRes] = await Promise.all([
          fetch('/api/admin-users', {
            cache: 'no-store',
          }),
          fetch('/api/site-settings/registration-link', {
            cache: 'no-store',
          }),
          fetch('/api/site-settings/navbar-visibility', {
            cache: 'no-store',
          }),
        ])
        const adminUsersJson = (await adminUsersRes.json()) as ApiResponse<AdminAccessUser[]>
        const registrationLinkJson = (await registrationLinkRes.json()) as ApiResponse<RegistrationLinkData>
        const navbarVisibilityJson = (await navbarVisibilityRes.json()) as ApiResponse<NavbarVisibilityState>

        if (!adminUsersRes.ok || !adminUsersJson.success) {
          throw new Error(adminUsersJson.error || 'Failed to fetch admin users')
        }

        setAdminUsers(adminUsersJson.data ?? [])

        if (registrationLinkRes.ok && registrationLinkJson.success && registrationLinkJson.data?.registrationLink) {
          const nextLink = registrationLinkJson.data.registrationLink
          setRegistrationLink(nextLink)
          setRegistrationLinkInput(nextLink)
        }

        if (navbarVisibilityJson.success && navbarVisibilityJson.data) {
          setNavbarVisibility(navbarVisibilityJson.data)
        }
      }
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const resetTeamForm = () => {
    setEditingTeamId(null)
    setTeamForm(emptyTeamForm)
    setShowTeamForm(false)
  }

  const resetWinnerForm = () => {
    setEditingWinnerId(null)
    setWinnerForm(emptyWinnerForm)
    setShowWinnerForm(false)
  }

  const resetSponsorForm = () => {
    setEditingSponsorId(null)
    setSponsorForm(emptySponsorForm)
    setSponsorPreviewUrl(null)
    setShowSponsorForm(false)
  }

  const resetQualifiedTeamForm = () => {
    setEditingQualifiedTeamId(null)
    setQualifiedTeamForm(emptyQualifiedTeamForm)
    setQualifiedTeamPreviewUrl(null)
    setShowQualifiedTeamForm(false)
  }

  const onSaveTeam = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const baseScore = Number(teamForm.score)
      const adjustment = Number(teamForm.scoreAdjustment || 0)
      const nextScore = editingTeamId ? baseScore + adjustment : baseScore

      if (!Number.isFinite(baseScore) || !Number.isFinite(adjustment)) {
        throw new Error('Score and score adjustment must be valid numbers')
      }

      if (nextScore < 0) {
        throw new Error('Final score cannot be negative')
      }

      const payload = {
        teamName: teamForm.teamName.trim(),
        projectTitle: teamForm.projectTitle.trim(),
        score: nextScore,
        isDisqualified: teamForm.isDisqualified,
        members: Number(teamForm.members),
      }

      const endpoint = editingTeamId ? `/api/leaderboard/${editingTeamId}` : '/api/leaderboard'
      const method = editingTeamId ? 'PUT' : 'POST'

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const json = (await response.json()) as ApiResponse<LeaderboardEntry>
      if (!response.ok || !json.success) {
        throw new Error(json.error || 'Failed to save team')
      }

      await loadData()
      notifyLeaderboardUpdated()
      resetTeamForm()
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to save team')
      setLoading(false)
    }
  }

  const onDeleteTeam = async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/leaderboard/${id}`, { method: 'DELETE' })
      const json = (await response.json()) as ApiResponse<LeaderboardEntry>

      if (!response.ok || !json.success) {
        throw new Error(json.error || 'Failed to delete team')
      }

      await loadData()
      notifyLeaderboardUpdated()
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Failed to delete team')
      setLoading(false)
    }
  }

  const onSaveWinner = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const payload = {
        teamName: winnerForm.teamName.trim(),
        title: winnerForm.title.trim(),
        prizeAmount: winnerForm.prizeAmount.trim(),
      }

      const endpoint = editingWinnerId ? `/api/winners/${editingWinnerId}` : '/api/winners'
      const method = editingWinnerId ? 'PUT' : 'POST'

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const json = (await response.json()) as ApiResponse<WinnerEntry>
      if (!response.ok || !json.success) {
        throw new Error(json.error || 'Failed to save winner')
      }

      await loadData()
      resetWinnerForm()
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to save winner')
      setLoading(false)
    }
  }

  const onDeleteWinner = async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/winners/${id}`, { method: 'DELETE' })
      const json = (await response.json()) as ApiResponse<WinnerEntry>

      if (!response.ok || !json.success) {
        throw new Error(json.error || 'Failed to delete winner')
      }

      await loadData()
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Failed to delete winner')
      setLoading(false)
    }
  }

  const onSaveSponsor = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const finalCategory = sponsorForm.category === 'Custom' 
        ? (sponsorForm.customTierName?.trim() || 'Custom')
        : sponsorForm.category.trim()

      const payload = {
        name: sponsorForm.name.trim(),
        logoUrl: sponsorForm.logoUrl.trim(),
        websiteUrl: sponsorForm.websiteUrl.trim() || null,
        category: finalCategory,
        description: sponsorForm.description.trim() || null,
        displayOrder: Number(sponsorForm.displayOrder) || 0,
        isFeatured: sponsorForm.isFeatured,
      }

      if (!payload.logoUrl) {
        throw new Error('Please upload sponsor logo before saving')
      }

      const endpoint = editingSponsorId ? `/api/sponsors/${editingSponsorId}` : '/api/sponsors'
      const method = editingSponsorId ? 'PUT' : 'POST'

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const json = (await response.json()) as ApiResponse<SponsorEntry>
      if (!response.ok || !json.success) {
        throw new Error(json.error || 'Failed to save sponsor')
      }

      await loadData()
      resetSponsorForm()
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to save sponsor')
      setLoading(false)
    }
  }

  const onDeleteSponsor = async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/sponsors/${id}`, { method: 'DELETE' })
      const json = (await response.json()) as ApiResponse<null>

      if (!response.ok || !json.success) {
        throw new Error(json.error || 'Failed to delete sponsor')
      }

      await loadData()
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Failed to delete sponsor')
      setLoading(false)
    }
  }

  const onSaveQualifiedTeam = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const participantNames = qualifiedTeamForm.participantNamesText
        .split('\n')
        .map((name) => name.trim())
        .filter(Boolean)

      if (participantNames.length < 2 || participantNames.length > 6) {
        throw new Error('Participant names must be between 2 and 6')
      }

      const payload = {
        teamName: qualifiedTeamForm.teamName.trim(),
        logoUrl: qualifiedTeamForm.logoUrl.trim(),
        participantNames,
        collegeName: qualifiedTeamForm.collegeName.trim(),
      }

      if (!payload.logoUrl) {
        throw new Error('Please upload team logo before saving')
      }

      const endpoint = editingQualifiedTeamId ? `/api/qualified-teams/${editingQualifiedTeamId}` : '/api/qualified-teams'
      const method = editingQualifiedTeamId ? 'PUT' : 'POST'

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const json = (await response.json()) as ApiResponse<QualifiedTeamEntry>
      if (!response.ok || !json.success) {
        throw new Error(json.error || 'Failed to save qualified team')
      }

      await loadData()
      resetQualifiedTeamForm()
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to save qualified team')
      setLoading(false)
    }
  }

  const onDeleteQualifiedTeam = async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/qualified-teams/${id}`, { method: 'DELETE' })
      const json = (await response.json()) as ApiResponse<null>

      if (!response.ok || !json.success) {
        throw new Error(json.error || 'Failed to delete qualified team')
      }

      await loadData()
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Failed to delete qualified team')
      setLoading(false)
    }
  }

  const onUploadSponsorLogo = async (file: File) => {
    if (!file) return

    try {
      setSponsorUploading(true)
      setError(null)

      const uploadData = new FormData()
      uploadData.append('file', file)

      const response = await fetch('/api/sponsors/upload', {
        method: 'POST',
        body: uploadData,
      })

      const json = (await response.json()) as ApiResponse<{ url: string }>
      if (!response.ok || !json.success || !json.data?.url) {
        throw new Error(json.error || 'Failed to upload sponsor logo')
      }

      setSponsorForm((prev) => ({ ...prev, logoUrl: json.data.url }))
      setSponsorPreviewUrl(json.data.url)
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Failed to upload sponsor logo')
    } finally {
      setSponsorUploading(false)
    }
  }

  const onSponsorFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      setSponsorPreviewUrl(reader.result as string)
    }
    reader.readAsDataURL(file)

    void onUploadSponsorLogo(file)
  }

  const onUploadQualifiedTeamLogo = async (file: File) => {
    if (!file) return

    try {
      setQualifiedTeamUploading(true)
      setError(null)

      const uploadData = new FormData()
      uploadData.append('file', file)

      const response = await fetch('/api/qualified-teams/upload', {
        method: 'POST',
        body: uploadData,
      })

      const json = (await response.json()) as ApiResponse<{ url: string }>
      if (!response.ok || !json.success || !json.data?.url) {
        throw new Error(json.error || 'Failed to upload team logo')
      }

      setQualifiedTeamForm((prev) => ({ ...prev, logoUrl: json.data.url }))
      setQualifiedTeamPreviewUrl(json.data.url)
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Failed to upload team logo')
    } finally {
      setQualifiedTeamUploading(false)
    }
  }

  const onQualifiedTeamFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      setQualifiedTeamPreviewUrl(reader.result as string)
    }
    reader.readAsDataURL(file)

    void onUploadQualifiedTeamLogo(file)
  }

  const resetProblemForm = () => {
    setEditingProblemId(null)
    setProblemForm(emptyProblemForm)
    setShowProblemForm(false)
  }

  const onSaveProblem = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const payload = {
        title: problemForm.title.trim(),
        domain: problemForm.domain.trim(),
        description: problemForm.description.trim(),
        pdfLink: problemForm.pdfLink.trim(),
      }

      const endpoint = editingProblemId ? `/api/problem-statements/${editingProblemId}` : '/api/problem-statements'
      const method = editingProblemId ? 'PUT' : 'POST'

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const json = (await response.json()) as ApiResponse<ProblemStatementEntry>
      if (!response.ok || !json.success) {
        throw new Error(json.error || 'Failed to save problem statement')
      }

      await loadData()
      resetProblemForm()
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to save problem statement')
      setLoading(false)
    }
  }

  const onDeleteProblem = async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/problem-statements/${id}`, { method: 'DELETE' })
      const json = (await response.json()) as ApiResponse<ProblemStatementEntry>

      if (!response.ok || !json.success) {
        throw new Error(json.error || 'Failed to delete problem statement')
      }

      await loadData()
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Failed to delete problem statement')
      setLoading(false)
    }
  }

  const resetAccessForm = () => {
    setEditingAccessId(null)
    setAccessForm(emptyAccessForm)
    setShowAccessForm(false)
  }

  const resetPasswordForm = () => {
    setPasswordForm(emptyPasswordForm)
    setShowCurrentPassword(false)
    setShowNewPassword(false)
    setShowConfirmPassword(false)
    setShowPasswordForm(false)
  }

  const onSaveAccess = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!user?.isSuperAdmin) return

    setLoading(true)
    setError(null)

    try {
      const payload = {
        email: accessForm.email.trim(),
        password: accessForm.password.trim() || undefined,
        isSuperAdmin: accessForm.isSuperAdmin,
        isActive: accessForm.isActive,
      }

      const endpoint = editingAccessId ? `/api/admin-users/${editingAccessId}` : '/api/admin-users'
      const method = editingAccessId ? 'PUT' : 'POST'

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const json = (await response.json()) as ApiResponse<AdminAccessUser>
      if (!response.ok || !json.success) {
        throw new Error(json.error || 'Failed to save admin access')
      }

      await loadData()
      resetAccessForm()
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to save admin access')
      setLoading(false)
    }
  }

  const onDeleteAccess = async (id: string) => {
    if (!user?.isSuperAdmin) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin-users/${id}`, {
        method: 'DELETE',
      })
      const json = (await response.json()) as ApiResponse<AdminAccessUser>

      if (!response.ok || !json.success) {
        throw new Error(json.error || 'Failed to remove admin user')
      }

      await loadData()
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Failed to remove admin user')
      setLoading(false)
    }
  }

  const onChangeOwnPassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!user?.email) return

    if (passwordForm.newPassword.length < 8) {
      setError('New password must be at least 8 characters')
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New password and confirm password do not match')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/admin-auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      })

      const json = (await response.json()) as ApiResponse<null>

      if (!response.ok || !json.success) {
        throw new Error(json.error || 'Failed to change password')
      }

      resetPasswordForm()
    } catch (changeError) {
      setError(changeError instanceof Error ? changeError.message : 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  const togglePublish = async (section: keyof PublishState) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/publish-state', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section, value: !publishState[section] }),
      })

      const json = (await response.json()) as ApiResponse<PublishState>

      if (!response.ok || !json.success) {
        throw new Error(json.error || 'Failed to update publish state')
      }

      if (json.data) {
        setPublishState(json.data)
      }

      if (section === 'leaderboard') {
        notifyLeaderboardUpdated()
      }
    } catch (publishError) {
      setError(publishError instanceof Error ? publishError.message : 'Failed to update publish state')
    } finally {
      setLoading(false)
    }
  }

  const onSaveRegistrationLink = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!user?.isSuperAdmin) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/site-settings/registration-link', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          registrationLink: registrationLinkInput.trim(),
        }),
      })

      const json = (await response.json()) as ApiResponse<RegistrationLinkData>

      if (!response.ok || !json.success || !json.data?.registrationLink) {
        throw new Error(json.error || 'Failed to update registration redirect link')
      }

      setRegistrationLink(json.data.registrationLink)
      setRegistrationLinkInput(json.data.registrationLink)
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to update registration redirect link')
    } finally {
      setLoading(false)
    }
  }

  const onSaveNavbarVisibility = async (nextState: NavbarVisibilityState) => {
    if (!user?.isSuperAdmin) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/site-settings/navbar-visibility', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nextState),
      })

      const json = (await response.json()) as ApiResponse<NavbarVisibilityState>

      if (!response.ok || !json.success || !json.data) {
        throw new Error(json.error || 'Failed to update navbar visibility')
      }

      setNavbarVisibility(json.data)
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to update navbar visibility')
    } finally {
      setLoading(false)
    }
  }

  const sortedLeaderboard = useMemo(
    () =>
      [...leaderboard].sort((a, b) => {
        if (a.isDisqualified !== b.isDisqualified) {
          return a.isDisqualified ? 1 : -1
        }
        return a.rank - b.rank
      }),
    [leaderboard]
  )

  const sortedWinners = useMemo(
    () => [...winners].sort((a, b) => a.rank - b.rank),
    [winners]
  )

  const sortedQualifiedTeams = useMemo(
    () => [...qualifiedTeams].sort((a, b) => a.teamName.localeCompare(b.teamName)),
    [qualifiedTeams]
  )

  if (!isAuthenticated) {
    return null
  }

  return (
    <section className="min-h-screen px-4 sm:px-6 lg:px-8 pt-28 pb-10">
      <div className="max-w-7xl mx-auto rounded-3xl border border-cyan-500/20 bg-slate-950/80 backdrop-blur-xl shadow-2xl p-4 sm:p-6 lg:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-cyan-300 transition"
          >
            <ArrowLeft size={16} /> Back
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setShowPasswordForm((prev) => !prev)
                if (showPasswordForm) {
                  resetPasswordForm()
                }
              }}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-slate-800 text-slate-200 hover:bg-slate-700 transition"
            >
              <KeyRound size={14} /> {showPasswordForm ? 'Close' : 'Change Password'}
            </button>
            <button
              onClick={() => void loadData()}
              className="px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-slate-800 text-slate-200 hover:bg-slate-700 transition"
            >
              Refresh
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
        </div>

        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white">Admin Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">Manage leaderboard, winners, and problem statements in real-time.</p>
        </div>

        <div className="mb-6 overflow-x-auto">
          <div className="inline-flex min-w-full sm:min-w-0 rounded-xl bg-slate-900 border border-cyan-500/20 p-1 gap-1 whitespace-nowrap">
            <button
            onClick={() => setActiveTab('leaderboard')}
            className={`shrink-0 px-4 py-2 rounded-lg text-sm font-bold transition ${
              activeTab === 'leaderboard' ? 'bg-cyan-500 text-slate-950' : 'text-slate-300'
            }`}
          >
            <span className="inline-flex items-center gap-2 justify-center">
              <Trophy size={16} /> Leaderboard
            </span>
            </button>
            <button
            onClick={() => setActiveTab('winners')}
            className={`shrink-0 px-4 py-2 rounded-lg text-sm font-bold transition ${
              activeTab === 'winners' ? 'bg-cyan-500 text-slate-950' : 'text-slate-300'
            }`}
          >
            <span className="inline-flex items-center gap-2 justify-center">
              <Medal size={16} /> Winners
            </span>
            </button>
            <button
            onClick={() => setActiveTab('problemStatements')}
            className={`shrink-0 px-4 py-2 rounded-lg text-sm font-bold transition ${
              activeTab === 'problemStatements' ? 'bg-blue-500 text-slate-950' : 'text-slate-300'
            }`}
          >
            <span className="inline-flex items-center gap-2 justify-center">
              <FileText size={16} /> Problem Statements
            </span>
            </button>
            <button
              onClick={() => setActiveTab('qualifiedTeams')}
              className={`shrink-0 px-4 py-2 rounded-lg text-sm font-bold transition ${
                activeTab === 'qualifiedTeams' ? 'bg-emerald-500 text-slate-950' : 'text-slate-300'
              }`}
            >
              <span className="inline-flex items-center gap-2 justify-center">
                <Users size={16} /> Qualified Teams
              </span>
            </button>
            <button
              onClick={() => setActiveTab('sponsors')}
              className={`shrink-0 px-4 py-2 rounded-lg text-sm font-bold transition ${
                activeTab === 'sponsors' ? 'bg-amber-500 text-slate-950' : 'text-slate-300'
              }`}
            >
              <span className="inline-flex items-center gap-2 justify-center">
                <Sparkles size={16} /> Sponsors
              </span>
            </button>
            {user?.isSuperAdmin && (
              <button
                onClick={() => setActiveTab('access')}
                className={`shrink-0 px-4 py-2 rounded-lg text-sm font-bold transition ${
                  activeTab === 'access' ? 'bg-violet-500 text-slate-950' : 'text-slate-300'
                }`}
              >
                <span className="inline-flex items-center gap-2 justify-center">
                  <ShieldCheck size={16} /> Access
                </span>
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {showPasswordForm && (
          <form
            onSubmit={onChangeOwnPassword}
            className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-3 rounded-2xl border border-slate-700 bg-slate-900/80 p-4"
          >
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                placeholder="Current password"
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 pr-10 text-sm text-white"
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword((prev) => !prev)}
                className="absolute inset-y-0 right-2 inline-flex items-center text-slate-400 hover:text-slate-200"
              >
                {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                placeholder="New password"
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 pr-10 text-sm text-white"
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword((prev) => !prev)}
                className="absolute inset-y-0 right-2 inline-flex items-center text-slate-400 hover:text-slate-200"
              >
                {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Confirm new password"
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 pr-10 text-sm text-white"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute inset-y-0 right-2 inline-flex items-center text-slate-400 hover:text-slate-200"
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div className="md:col-span-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={resetPasswordForm}
                className="px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-slate-700 text-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-cyan-500 text-slate-950 disabled:opacity-60"
              >
                Update Password
              </button>
            </div>
          </form>
        )}

        {activeTab === 'leaderboard' && (
          <div className="space-y-4">
            <div className="flex justify-end gap-2">
              <button
                onClick={() => void togglePublish('leaderboard')}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black transition ${
                  publishState.leaderboard ? 'bg-cyan-500 text-slate-950' : 'bg-slate-700 text-slate-200'
                }`}
              >
                {publishState.leaderboard ? 'Unpublish' : 'Go Live'}
              </button>
              <button
                onClick={() => {
                  setShowTeamForm((prev) => !prev)
                  if (editingTeamId) {
                    setEditingTeamId(null)
                    setTeamForm(emptyTeamForm)
                  }
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 text-sm font-black hover:brightness-110 transition"
              >
                <Plus size={16} /> {showTeamForm ? 'Close' : 'Add Team'}
              </button>
            </div>

            {showTeamForm && (
              <form onSubmit={onSaveTeam} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 rounded-2xl border border-cyan-500/20 bg-slate-900/80 p-4">
                <input
                  value={teamForm.teamName}
                  onChange={(e) => setTeamForm((prev) => ({ ...prev, teamName: e.target.value }))}
                  placeholder="Team name"
                  className="rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white"
                  required
                />
                <input
                  value={teamForm.projectTitle}
                  onChange={(e) => setTeamForm((prev) => ({ ...prev, projectTitle: e.target.value }))}
                  placeholder="Project"
                  className="rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white"
                  required
                />
                <input
                  type="number"
                  min="0"
                  value={teamForm.score}
                  onChange={(e) => setTeamForm((prev) => ({ ...prev, score: e.target.value }))}
                  placeholder={editingTeamId ? 'Current score' : 'Score'}
                  className="rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white"
                  required
                />
                {editingTeamId ? (
                  <div className="rounded-xl bg-slate-800 border border-slate-700 px-3 py-2">
                    <p className="text-[10px] uppercase tracking-wide text-slate-400 mb-1">Score Adjustment</p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setTeamForm((prev) => ({ ...prev, scoreAdjustment: String((Number(prev.scoreAdjustment) || 0) - 1) }))}
                        className="h-7 w-7 rounded-md bg-slate-700 text-slate-200 font-bold"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={teamForm.scoreAdjustment}
                        onChange={(e) => setTeamForm((prev) => ({ ...prev, scoreAdjustment: e.target.value }))}
                        placeholder="+/-"
                        className="w-full rounded-md bg-slate-900 border border-slate-700 px-2 py-1 text-sm text-white"
                      />
                      <button
                        type="button"
                        onClick={() => setTeamForm((prev) => ({ ...prev, scoreAdjustment: String((Number(prev.scoreAdjustment) || 0) + 1) }))}
                        className="h-7 w-7 rounded-md bg-slate-700 text-slate-200 font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="hidden lg:block" />
                )}
                <input
                  type="number"
                  min="1"
                  value={teamForm.members}
                  onChange={(e) => setTeamForm((prev) => ({ ...prev, members: e.target.value }))}
                  placeholder="Members"
                  className="rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white"
                  required
                />

                <label className="sm:col-span-2 lg:col-span-4 inline-flex items-center gap-2 text-sm text-slate-200">
                  <input
                    type="checkbox"
                    checked={teamForm.isDisqualified}
                    onChange={(e) => setTeamForm((prev) => ({ ...prev, isDisqualified: e.target.checked }))}
                    className="h-4 w-4 rounded border-slate-600"
                  />
                  Mark as disqualified
                </label>

                {editingTeamId && (
                  <p className="sm:col-span-2 lg:col-span-4 text-xs text-cyan-300">
                    Final score after adjustment: {(Number(teamForm.score) || 0) + (Number(teamForm.scoreAdjustment) || 0)}
                  </p>
                )}

                <div className="sm:col-span-2 lg:col-span-4 flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={resetTeamForm}
                    className="px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-slate-700 text-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={loading}
                    type="submit"
                    className="px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-cyan-500 text-slate-950 disabled:opacity-60"
                  >
                    {editingTeamId ? 'Update Team' : 'Save Team'}
                  </button>
                </div>
              </form>
            )}

            <div className="rounded-2xl border border-cyan-500/20 overflow-hidden">
              <div className="hidden md:grid grid-cols-12 bg-slate-900/90 text-slate-300 text-xs font-bold uppercase tracking-wider px-4 py-3">
                <div className="col-span-1">#</div>
                <div className="col-span-3">Team</div>
                <div className="col-span-3">Project</div>
                <div className="col-span-1">Score</div>
                <div className="col-span-1">Members</div>
                <div className="col-span-1">Status</div>
                <div className="col-span-2 text-right">Actions</div>
              </div>

              {sortedLeaderboard.length === 0 ? (
                <div className="p-10 text-center text-slate-400 font-semibold">No leaderboard teams added yet.</div>
              ) : (
                <>
                  <div className="hidden md:block">
                    {sortedLeaderboard.map((entry) => (
                      <div key={entry.id} className="grid grid-cols-12 px-4 py-4 border-t border-cyan-500/10 bg-slate-950/40 text-sm text-slate-200">
                        <div className="col-span-1 font-bold text-cyan-300">{entry.isDisqualified ? 'DQ' : entry.rank}</div>
                        <div className="col-span-3 font-semibold">{entry.teamName}</div>
                        <div className="col-span-3 text-slate-300">{entry.projectTitle}</div>
                        <div className="col-span-1 font-bold">{entry.score}</div>
                        <div className="col-span-1">{entry.members}</div>
                        <div className="col-span-1">
                          {entry.isDisqualified ? (
                            <span className="inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase bg-red-500/20 text-red-300 border border-red-500/40">
                              Disqualified
                            </span>
                          ) : (
                            <span className="text-slate-500">-</span>
                          )}
                        </div>
                        <div className="col-span-2 flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditingTeamId(entry.id)
                              setTeamForm({
                                teamName: entry.teamName,
                                projectTitle: entry.projectTitle,
                                score: String(entry.score),
                                scoreAdjustment: '0',
                                isDisqualified: entry.isDisqualified,
                                members: String(entry.members),
                              })
                              setShowTeamForm(true)
                            }}
                            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => void onDeleteTeam(entry.id)}
                            className="p-2 rounded-lg bg-slate-800 hover:bg-red-500/40"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="md:hidden space-y-3 p-3">
                    {sortedLeaderboard.map((entry) => (
                      <div key={entry.id} className="rounded-xl border border-cyan-500/20 bg-slate-900/60 p-3">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <p className="text-xs text-cyan-300 font-bold">{entry.isDisqualified ? 'DQ' : `#${entry.rank}`}</p>
                            <p className="text-lg font-bold text-white">{entry.teamName}</p>
                            <p className="text-sm text-slate-400">{entry.projectTitle}</p>
                            {entry.isDisqualified && (
                              <p className="mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase bg-red-500/20 text-red-300 border border-red-500/40">
                                Disqualified
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-white">{entry.score} pts</p>
                            <p className="text-xs text-slate-400">{entry.members} members</p>
                          </div>
                        </div>
                        <div className="mt-3 flex justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditingTeamId(entry.id)
                              setTeamForm({
                                teamName: entry.teamName,
                                projectTitle: entry.projectTitle,
                                score: String(entry.score),
                                scoreAdjustment: '0',
                                isDisqualified: entry.isDisqualified,
                                members: String(entry.members),
                              })
                              setShowTeamForm(true)
                            }}
                            className="px-3 py-2 text-xs rounded-lg bg-slate-800 text-slate-200"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => void onDeleteTeam(entry.id)}
                            className="px-3 py-2 text-xs rounded-lg bg-red-500/20 text-red-300"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === 'winners' && (
          <div className="space-y-4">
            <div className="flex justify-end gap-2">
              <button
                onClick={() => void togglePublish('winners')}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black transition ${
                  publishState.winners ? 'bg-cyan-500 text-slate-950' : 'bg-slate-700 text-slate-200'
                }`}
              >
                {publishState.winners ? 'Unpublish' : 'Go Live'}
              </button>
              <button
                onClick={() => {
                  setShowWinnerForm((prev) => !prev)
                  if (editingWinnerId) {
                    setEditingWinnerId(null)
                    setWinnerForm(emptyWinnerForm)
                  }
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 text-sm font-black hover:brightness-110 transition"
              >
                <Plus size={16} /> {showWinnerForm ? 'Close' : 'Add Winner'}
              </button>
            </div>

            {showWinnerForm && (
              <form onSubmit={onSaveWinner} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 rounded-2xl border border-cyan-500/20 bg-slate-900/80 p-4">
                <input
                  value={winnerForm.teamName}
                  onChange={(e) => setWinnerForm((prev) => ({ ...prev, teamName: e.target.value }))}
                  placeholder="Team name"
                  className="rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white"
                  required
                />
                <input
                  value={winnerForm.title}
                  onChange={(e) => setWinnerForm((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Winner title (e.g. Overall Best)"
                  className="rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white"
                  required
                />
                <input
                  value={winnerForm.prizeAmount}
                  onChange={(e) => setWinnerForm((prev) => ({ ...prev, prizeAmount: e.target.value }))}
                  placeholder="Prize (e.g. ₹50,000)"
                  className="rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white"
                  required
                />

                <div className="sm:col-span-2 lg:col-span-3 flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={resetWinnerForm}
                    className="px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-slate-700 text-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={loading}
                    type="submit"
                    className="px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-cyan-500 text-slate-950 disabled:opacity-60"
                  >
                    {editingWinnerId ? 'Update Winner' : 'Save Winner'}
                  </button>
                </div>
              </form>
            )}

            <div className="rounded-2xl border border-cyan-500/20 overflow-hidden">
              {sortedWinners.length === 0 ? (
                <div className="p-10 text-center text-slate-400 font-semibold">No winners added yet.</div>
              ) : (
                <div className="space-y-3 p-3 sm:p-4">
                  {sortedWinners.map((winner) => (
                    <div key={winner.id} className="rounded-xl border border-cyan-500/20 bg-slate-900/60 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <p className="text-xs text-cyan-300 font-bold uppercase tracking-wider">Rank #{winner.rank}</p>
                        <p className="text-lg font-bold text-white">{winner.teamName}</p>
                        <p className="text-sm text-slate-400">{winner.title}</p>
                      </div>
                      <div className="flex items-center gap-3 justify-between sm:justify-end">
                        <p className="text-base font-black text-cyan-300">{winner.prizeAmount}</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingWinnerId(winner.id)
                              setWinnerForm({
                                teamName: winner.teamName,
                                title: winner.title,
                                prizeAmount: winner.prizeAmount,
                              })
                              setShowWinnerForm(true)
                            }}
                            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => void onDeleteWinner(winner.id)}
                            className="p-2 rounded-lg bg-slate-800 hover:bg-red-500/40"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'problemStatements' && (
          <div className="space-y-4">
            <div className="flex justify-end gap-2">
              <button
                onClick={() => void togglePublish('problemStatements')}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black transition ${
                  publishState.problemStatements ? 'bg-blue-500 text-slate-950' : 'bg-slate-700 text-slate-200'
                }`}
              >
                {publishState.problemStatements ? 'Unpublish' : 'Go Live'}
              </button>
              <button
                onClick={() => void togglePublish('problemStatementsDownload')}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black transition ${
                  publishState.problemStatementsDownload ? 'bg-sky-500 text-slate-950' : 'bg-slate-700 text-slate-200'
                }`}
              >
                {publishState.problemStatementsDownload ? 'Hide Download PS' : 'Show Download PS'}
              </button>
              <button
                onClick={() => {
                  setShowProblemForm((prev) => !prev)
                  if (editingProblemId) {
                    setEditingProblemId(null)
                    setProblemForm(emptyProblemForm)
                  }
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500 text-slate-950 text-sm font-black hover:brightness-110 transition"
              >
                <Plus size={16} /> {showProblemForm ? 'Close' : 'Add Problem Statement'}
              </button>
            </div>

            {showProblemForm && (
              <form onSubmit={onSaveProblem} className="grid grid-cols-1 gap-3 rounded-2xl border border-blue-500/20 bg-slate-900/80 p-4">
                <input
                  value={problemForm.title}
                  onChange={(e) => setProblemForm((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Problem title"
                  className="rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white"
                  required
                />
                <input
                  value={problemForm.domain}
                  onChange={(e) => setProblemForm((prev) => ({ ...prev, domain: e.target.value }))}
                  placeholder="Domain (e.g. Environment, AI, Healthcare)"
                  className="rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white"
                  required
                />
                <textarea
                  value={problemForm.description}
                  onChange={(e) => setProblemForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Detailed problem statement description"
                  rows={4}
                  className="rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white"
                  required
                />
                <input
                  value={problemForm.pdfLink}
                  onChange={(e) => setProblemForm((prev) => ({ ...prev, pdfLink: e.target.value }))}
                  placeholder="Google Drive PDF link"
                  className="rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white"
                  required
                />

                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={resetProblemForm}
                    className="px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-slate-700 text-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={loading}
                    type="submit"
                    className="px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-blue-500 text-slate-950 disabled:opacity-60"
                  >
                    {editingProblemId ? 'Update Statement' : 'Save Statement'}
                  </button>
                </div>
              </form>
            )}

            <div className="rounded-2xl border border-blue-500/20 overflow-hidden">
              {problemStatements.length === 0 ? (
                <div className="p-10 text-center text-slate-400 font-semibold">No problem statements uploaded yet.</div>
              ) : (
                <div className="space-y-3 p-3 sm:p-4">
                  {problemStatements.map((item, index) => (
                    <div key={item.id} className="rounded-xl border border-blue-500/20 bg-slate-900/60 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs text-blue-300 font-bold uppercase tracking-wider mb-1">Statement {String(index + 1).padStart(2, '0')}</p>
                          <h3 className="text-lg font-bold text-white">{item.title}</h3>
                          <p className="text-xs text-cyan-300 mt-1">Domain: {item.domain}</p>
                          <p className="text-xs text-slate-400 mt-1 break-all">PDF Link: {item.pdfLink || 'Not added yet'}</p>
                          <p className="text-sm text-slate-300 mt-2 leading-relaxed">{item.description}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingProblemId(item.id)
                              setProblemForm({
                                title: item.title,
                                domain: item.domain,
                                description: item.description,
                                pdfLink: item.pdfLink ?? '',
                              })
                              setShowProblemForm(true)
                            }}
                            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => void onDeleteProblem(item.id)}
                            className="p-2 rounded-lg bg-slate-800 hover:bg-red-500/40"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'qualifiedTeams' && (
          <div className="space-y-4">
            <div className="flex justify-end gap-2">
              <button
                onClick={() => void togglePublish('qualifiedTeams')}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black transition ${
                  publishState.qualifiedTeams ? 'bg-emerald-500 text-slate-950' : 'bg-slate-700 text-slate-200'
                }`}
              >
                {publishState.qualifiedTeams ? 'Unpublish' : 'Go Live'}
              </button>
              <button
                onClick={() => {
                  setShowQualifiedTeamForm((prev) => !prev)
                  if (editingQualifiedTeamId) {
                    resetQualifiedTeamForm()
                  }
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 text-sm font-black hover:brightness-110 transition"
              >
                <Plus size={16} /> {showQualifiedTeamForm ? 'Close' : 'Add Qualified Team'}
              </button>
            </div>

            {showQualifiedTeamForm && (
              <form onSubmit={onSaveQualifiedTeam} className="grid grid-cols-1 md:grid-cols-2 gap-3 rounded-2xl border border-emerald-500/20 bg-slate-900/80 p-4">
                <input
                  value={qualifiedTeamForm.teamName}
                  onChange={(e) => setQualifiedTeamForm((prev) => ({ ...prev, teamName: e.target.value }))}
                  placeholder="Team name"
                  className="rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white"
                  required
                />

                <input
                  value={qualifiedTeamForm.collegeName}
                  onChange={(e) => setQualifiedTeamForm((prev) => ({ ...prev, collegeName: e.target.value }))}
                  placeholder="College name"
                  className="rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white"
                  required
                />

                <div>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                    onChange={onQualifiedTeamFileChange}
                    disabled={qualifiedTeamUploading}
                    className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-500 file:px-3 file:py-1 file:text-xs file:font-bold file:text-slate-950"
                    required={!editingQualifiedTeamId}
                  />
                  {qualifiedTeamUploading && <p className="mt-1 text-xs text-emerald-300">Uploading logo...</p>}
                </div>

                <textarea
                  value={qualifiedTeamForm.participantNamesText}
                  onChange={(e) => setQualifiedTeamForm((prev) => ({ ...prev, participantNamesText: e.target.value }))}
                  placeholder={'Participant names (one per line)\nMinimum 2, maximum 6'}
                  rows={5}
                  className="rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white"
                  required
                />

                {qualifiedTeamPreviewUrl && (
                  <div className="md:col-span-2 rounded-xl border border-emerald-500/20 bg-slate-950/70 p-3">
                    <p className="mb-2 text-xs font-bold uppercase tracking-wider text-emerald-300">Logo Preview</p>
                    <div className="h-36 rounded-lg border border-slate-700 bg-slate-900 flex items-center justify-center p-3">
                      <img src={qualifiedTeamPreviewUrl} alt="Qualified team preview" className="max-h-full max-w-full object-contain" />
                    </div>
                  </div>
                )}

                <div className="md:col-span-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={resetQualifiedTeamForm}
                    className="px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-slate-700 text-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={loading || qualifiedTeamUploading}
                    type="submit"
                    className="px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-emerald-500 text-slate-950 disabled:opacity-60"
                  >
                    {editingQualifiedTeamId ? 'Update Qualified Team' : 'Save Qualified Team'}
                  </button>
                </div>
              </form>
            )}

            <div className="rounded-2xl border border-emerald-500/20 overflow-hidden">
              {sortedQualifiedTeams.length === 0 ? (
                <div className="p-10 text-center text-slate-400 font-semibold">No qualified teams added yet.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-3 sm:p-4">
                  {sortedQualifiedTeams.map((team) => (
                    <div key={team.id} className="rounded-xl border border-emerald-500/20 bg-slate-900/60 p-4">
                      <div className="h-28 rounded-lg border border-slate-700 bg-slate-950 flex items-center justify-center p-3 mb-3">
                        <img src={team.logoUrl} alt={team.teamName} className="max-h-full max-w-full object-contain" />
                      </div>
                      <p className="text-lg font-bold text-white line-clamp-1">{team.teamName}</p>
                      <p className="text-xs text-emerald-300 mt-1 line-clamp-1">{team.collegeName}</p>
                      <p className="text-xs text-slate-400 mt-1">Members: {team.participantNames.length}</p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {team.participantNames.slice(0, 3).map((name, index) => (
                          <span key={`${team.id}-member-${index}`} className="text-[10px] rounded-full bg-slate-800 border border-slate-700 px-2 py-0.5 text-slate-300">
                            {name}
                          </span>
                        ))}
                        {team.participantNames.length > 3 && (
                          <span className="text-[10px] rounded-full bg-slate-800 border border-slate-700 px-2 py-0.5 text-slate-300">
                            +{team.participantNames.length - 3} more
                          </span>
                        )}
                      </div>
                      <div className="mt-3 flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingQualifiedTeamId(team.id)
                            setQualifiedTeamForm({
                              teamName: team.teamName,
                              logoUrl: team.logoUrl,
                              participantNamesText: team.participantNames.join('\n'),
                              collegeName: team.collegeName,
                            })
                            setQualifiedTeamPreviewUrl(team.logoUrl)
                            setShowQualifiedTeamForm(true)
                          }}
                          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => void onDeleteQualifiedTeam(team.id)}
                          className="p-2 rounded-lg bg-slate-800 hover:bg-red-500/40"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'sponsors' && (
          <div className="space-y-4">
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowSponsorForm((prev) => !prev)
                  if (editingSponsorId) {
                    setEditingSponsorId(null)
                    setSponsorForm(emptySponsorForm)
                    setSponsorPreviewUrl(null)
                  }
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 text-sm font-black hover:brightness-110 transition"
              >
                <Plus size={16} /> {showSponsorForm ? 'Close' : 'Add Sponsor'}
              </button>
            </div>

            {showSponsorForm && (
              <form onSubmit={onSaveSponsor} className="grid grid-cols-1 md:grid-cols-2 gap-3 rounded-2xl border border-amber-500/20 bg-slate-900/80 p-4">
                <input
                  value={sponsorForm.name}
                  onChange={(e) => setSponsorForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Sponsor name"
                  className="rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white"
                  required
                />
                <select
                  value={sponsorForm.category}
                  onChange={(e) => setSponsorForm((prev) => ({ ...prev, category: e.target.value }))}
                  className="rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white cursor-pointer hover:border-amber-500/50 focus:border-amber-500 focus:outline-none"
                  required
                >
                  <option value="">Select Tier (required)</option>
                  <option value="Platinum">Platinum</option>
                  <option value="Gold">Gold</option>
                  <option value="Silver">Silver</option>
                  <option value="Bronze">Bronze</option>
                  <option value="Custom">Custom</option>
                </select>

                {sponsorForm.category === 'Custom' && (
                  <input
                    value={sponsorForm.customTierName || ''}
                    onChange={(e) => setSponsorForm((prev) => ({ ...prev, customTierName: e.target.value }))}
                    placeholder="Enter custom tier name (e.g., Partner, Supporter)"
                    className="rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white"
                    required
                  />
                )}

                <div>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                    onChange={onSponsorFileChange}
                    disabled={sponsorUploading}
                    className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white file:mr-3 file:rounded-lg file:border-0 file:bg-amber-500 file:px-3 file:py-1 file:text-xs file:font-bold file:text-slate-950"
                    required={!editingSponsorId}
                  />
                  {sponsorUploading && <p className="mt-1 text-xs text-amber-300">Uploading logo...</p>}
                </div>

                <input
                  value={sponsorForm.websiteUrl}
                  onChange={(e) => setSponsorForm((prev) => ({ ...prev, websiteUrl: e.target.value }))}
                  placeholder="Website URL (optional)"
                  className="rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white"
                />

                <input
                  type="number"
                  min="0"
                  value={sponsorForm.displayOrder}
                  onChange={(e) => setSponsorForm((prev) => ({ ...prev, displayOrder: e.target.value }))}
                  placeholder="Display order"
                  className="rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white"
                />

                <label className="inline-flex items-center gap-2 text-sm text-slate-200">
                  <input
                    type="checkbox"
                    checked={sponsorForm.isFeatured}
                    onChange={(e) => setSponsorForm((prev) => ({ ...prev, isFeatured: e.target.checked }))}
                    className="h-4 w-4 rounded border-slate-600"
                  />
                  Featured sponsor
                </label>

                <textarea
                  value={sponsorForm.description}
                  onChange={(e) => setSponsorForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Sponsor description (optional)"
                  rows={3}
                  className="md:col-span-2 rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white"
                />

                {sponsorPreviewUrl && (
                  <div className="md:col-span-2 rounded-xl border border-amber-500/20 bg-slate-950/70 p-3">
                    <p className="mb-2 text-xs font-bold uppercase tracking-wider text-amber-300">Logo Preview</p>
                    <div className="h-36 rounded-lg border border-slate-700 bg-slate-900 flex items-center justify-center p-3">
                      <img src={sponsorPreviewUrl} alt="Sponsor preview" className="max-h-full max-w-full object-contain" />
                    </div>
                  </div>
                )}

                <div className="md:col-span-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={resetSponsorForm}
                    className="px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-slate-700 text-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={loading || sponsorUploading}
                    type="submit"
                    className="px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-amber-500 text-slate-950 disabled:opacity-60"
                  >
                    {editingSponsorId ? 'Update Sponsor' : 'Save Sponsor'}
                  </button>
                </div>
              </form>
            )}

            <div className="rounded-2xl border border-amber-500/20 overflow-hidden">
              {sponsors.length === 0 ? (
                <div className="p-10 text-center text-slate-400 font-semibold">No sponsors added yet.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-3 sm:p-4">
                  {sponsors.map((sponsor) => (
                    <div key={sponsor.id} className="rounded-xl border border-amber-500/20 bg-slate-900/60 p-4">
                      <div className="h-28 rounded-lg border border-slate-700 bg-slate-950 flex items-center justify-center p-3 mb-3">
                        <img src={sponsor.logoUrl} alt={sponsor.name} className="max-h-full max-w-full object-contain" />
                      </div>
                      <p className="text-lg font-bold text-white line-clamp-1">{sponsor.name}</p>
                      <p className="text-xs text-amber-300 mt-1">{sponsor.category}</p>
                      <p className="text-xs text-slate-400 mt-1">Order: {sponsor.displayOrder}</p>
                      {sponsor.description && <p className="text-sm text-slate-300 mt-2 line-clamp-2">{sponsor.description}</p>}
                      <div className="mt-3 flex justify-end gap-2">
                        <button
                          onClick={() => {
                            const predefinedCategories = ['Platinum', 'Gold', 'Silver', 'Bronze']
                            const isCustom = !predefinedCategories.includes(sponsor.category)
                            
                            setEditingSponsorId(sponsor.id)
                            setSponsorForm({
                              name: sponsor.name,
                              logoUrl: sponsor.logoUrl,
                              websiteUrl: sponsor.websiteUrl ?? '',
                              category: isCustom ? 'Custom' : sponsor.category,
                              customTierName: isCustom ? sponsor.category : '',
                              description: sponsor.description ?? '',
                              displayOrder: String(sponsor.displayOrder),
                              isFeatured: sponsor.isFeatured,
                            })
                            setSponsorPreviewUrl(sponsor.logoUrl)
                            setShowSponsorForm(true)
                          }}
                          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => void onDeleteSponsor(sponsor.id)}
                          className="p-2 rounded-lg bg-slate-800 hover:bg-red-500/40"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'access' && user?.isSuperAdmin && (
          <div className="space-y-4">
            <form onSubmit={onSaveRegistrationLink} className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 rounded-2xl border border-violet-500/20 bg-slate-900/80 p-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-violet-300 mb-2">
                  Register Button Redirect Link
                </label>
                <input
                  value={registrationLinkInput}
                  onChange={(e) => setRegistrationLinkInput(e.target.value)}
                  placeholder="https://example.com/register"
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white"
                  required
                />
                <p className="mt-2 text-xs text-slate-400 break-all">
                  Current live link: {registrationLink}
                </p>
              </div>

              <div className="flex md:items-end justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRegistrationLinkInput(registrationLink)}
                  className="px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-slate-700 text-slate-200"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-violet-500 text-slate-950 disabled:opacity-60"
                >
                  Save Redirect
                </button>
              </div>
            </form>

            <div className="rounded-2xl border border-violet-500/20 bg-slate-900/80 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-violet-300 mb-3">
                Navbar Visibility (Super Admin)
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  onClick={() => void onSaveNavbarVisibility({ ...navbarVisibility, leaderboard: !navbarVisibility.leaderboard })}
                  className={`px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
                    navbarVisibility.leaderboard ? 'bg-emerald-500 text-slate-950' : 'bg-slate-700 text-slate-200'
                  }`}
                >
                  {navbarVisibility.leaderboard ? 'Hide' : 'Show'} Leaderboard
                </button>
                <button
                  onClick={() => void onSaveNavbarVisibility({ ...navbarVisibility, winners: !navbarVisibility.winners })}
                  className={`px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
                    navbarVisibility.winners ? 'bg-emerald-500 text-slate-950' : 'bg-slate-700 text-slate-200'
                  }`}
                >
                  {navbarVisibility.winners ? 'Hide' : 'Show'} Winners
                </button>
                <button
                  onClick={() => void onSaveNavbarVisibility({ ...navbarVisibility, qualifiedTeams: !navbarVisibility.qualifiedTeams })}
                  className={`px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
                    navbarVisibility.qualifiedTeams ? 'bg-emerald-500 text-slate-950' : 'bg-slate-700 text-slate-200'
                  }`}
                >
                  {navbarVisibility.qualifiedTeams ? 'Hide' : 'Show'} Qualified Teams
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowAccessForm((prev) => !prev)
                  if (editingAccessId) {
                    setEditingAccessId(null)
                    setAccessForm(emptyAccessForm)
                  }
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-500 text-slate-950 text-sm font-black hover:brightness-110 transition"
              >
                <Plus size={16} /> {showAccessForm ? 'Close' : 'Add Admin'}
              </button>
            </div>

            {showAccessForm && (
              <form onSubmit={onSaveAccess} className="grid grid-cols-1 md:grid-cols-2 gap-3 rounded-2xl border border-violet-500/20 bg-slate-900/80 p-4">
                <input
                  value={accessForm.email}
                  onChange={(e) => setAccessForm((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="Admin email"
                  className="rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white"
                  required
                />
                <input
                  type="password"
                  value={accessForm.password}
                  onChange={(e) => setAccessForm((prev) => ({ ...prev, password: e.target.value }))}
                  placeholder={editingAccessId ? 'New password (optional)' : 'Password'}
                  className="rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white"
                  required={!editingAccessId}
                />

                <label className="inline-flex items-center gap-2 text-sm text-slate-200">
                  <input
                    type="checkbox"
                    checked={accessForm.isSuperAdmin}
                    onChange={(e) => setAccessForm((prev) => ({ ...prev, isSuperAdmin: e.target.checked }))}
                  />
                  Super Admin
                </label>

                <label className="inline-flex items-center gap-2 text-sm text-slate-200">
                  <input
                    type="checkbox"
                    checked={accessForm.isActive}
                    onChange={(e) => setAccessForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                  />
                  Active
                </label>

                <div className="md:col-span-2 flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={resetAccessForm}
                    className="px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-slate-700 text-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={loading}
                    type="submit"
                    className="px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-violet-500 text-slate-950 disabled:opacity-60"
                  >
                    {editingAccessId ? 'Update Admin' : 'Save Admin'}
                  </button>
                </div>
              </form>
            )}

            <div className="rounded-2xl border border-violet-500/20 overflow-hidden">
              {adminUsers.length === 0 ? (
                <div className="p-10 text-center text-slate-400 font-semibold">No admin users found.</div>
              ) : (
                <div className="space-y-3 p-3 sm:p-4">
                  {adminUsers.map((admin) => {
                    const isPrimarySuperAdmin = admin.isPrimarySuperAdmin

                    return (
                      <div key={admin.id} className="rounded-xl border border-violet-500/20 bg-slate-900/60 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                          <p className="text-lg font-bold text-white break-all">{admin.email}</p>
                          <p className="text-sm text-slate-400">
                            {admin.isSuperAdmin ? 'Super Admin' : 'Admin'} • {admin.isActive ? 'Active' : 'Inactive'}
                          </p>
                          <p className="text-xs text-slate-400 mt-1 break-all">
                            Password: {revealedAdminPasswords[admin.id] ? admin.password || 'Not available' : '••••••••'}
                          </p>
                          {isPrimarySuperAdmin && (
                            <p className="text-xs text-violet-300 mt-1">Primary super admin (cannot be removed or demoted)</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingAccessId(admin.id)
                              setAccessForm({
                                email: admin.email,
                                password: '',
                                isSuperAdmin: admin.isSuperAdmin,
                                isActive: admin.isActive,
                              })
                              setShowAccessForm(true)
                            }}
                            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() =>
                              setRevealedAdminPasswords((prev) => ({
                                ...prev,
                                [admin.id]: !prev[admin.id],
                              }))
                            }
                            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700"
                          >
                            {revealedAdminPasswords[admin.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                          {!isPrimarySuperAdmin && (
                            <button
                              onClick={() => void onDeleteAccess(admin.id)}
                              className="p-2 rounded-lg bg-slate-800 hover:bg-red-500/40"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {loading && <p className="mt-4 text-xs text-slate-400">Processing...</p>}
      </div>
    </section>
  )
}
