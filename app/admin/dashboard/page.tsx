'use client'

import React from "react"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/auth-context'
import { PageTransition } from '@/components/page-transition'
import { LogOut, Plus, Edit2, Trash2, BarChart3 } from 'lucide-react'
import Link from 'next/link'

interface LeaderboardEntry {
  id: string
  rank: number
  teamName: string
  projectTitle: string
  score: number
  members: number
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const { isAuthenticated, user, logout } = useAuth()
  const [entries, setEntries] = useState<LeaderboardEntry[]>([
    {
      id: '1',
      rank: 1,
      teamName: 'Green Innovators',
      projectTitle: 'Renewable Energy Management System',
      score: 9850,
      members: 4,
    },
    {
      id: '2',
      rank: 2,
      teamName: 'AgriTech Revolution',
      projectTitle: 'AI-Powered Crop Disease Detection',
      score: 9720,
      members: 3,
    },
  ])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    teamName: '',
    projectTitle: '',
    score: '',
    members: '',
  })

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/admin/login')
    }
  }, [isAuthenticated, router])

  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingId) {
      setEntries(
        entries.map((entry) =>
          entry.id === editingId
            ? {
              ...entry,
              teamName: formData.teamName,
              projectTitle: formData.projectTitle,
              score: parseInt(formData.score),
              members: parseInt(formData.members),
            }
            : entry
        )
      )
      setEditingId(null)
    } else {
      const newEntry: LeaderboardEntry = {
        id: Date.now().toString(),
        rank: entries.length + 1,
        teamName: formData.teamName,
        projectTitle: formData.projectTitle,
        score: parseInt(formData.score),
        members: parseInt(formData.members),
      }
      setEntries([...entries, newEntry])
    }

    setFormData({ teamName: '', projectTitle: '', score: '', members: '' })
    setShowForm(false)
  }

  const handleEdit = (entry: LeaderboardEntry) => {
    setFormData({
      teamName: entry.teamName,
      projectTitle: entry.projectTitle,
      score: entry.score.toString(),
      members: entry.members.toString(),
    })
    setEditingId(entry.id)
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    setEntries(entries.filter((entry) => entry.id !== id))
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <PageTransition>
      <main className="min-h-screen bg-background">
        {/* Admin header */}
        <div className="relative border-b border-border">
          <div className="absolute inset-0 tech-grid opacity-20" />
          <div className="relative z-10 max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div>
                <Link href="/" className="text-sm text-muted-foreground hover:text-accent transition-colors mb-2 inline-block">
                  ← Back to Home
                </Link>
                <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
              </div>
              <div className="flex items-center gap-4">
                <div className="glass-effect rounded-lg px-4 py-2 text-sm">
                  <p className="text-muted-foreground">Logged in as</p>
                  <p className="text-accent font-semibold">{user?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 btn-neon glow-cyan text-sm"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard content */}
        <div className="relative">
          <div className="absolute inset-0 tech-grid opacity-10" />
          <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {[
                { label: 'Total Entries', value: entries.length },
                { label: 'Average Score', value: Math.round(entries.reduce((a, b) => a + b.score, 0) / entries.length) },
                { label: 'Total Teams', value: entries.reduce((a, b) => a + b.members, 0) },
              ].map((stat) => (
                <div key={stat.label} className="glass-effect rounded-lg p-6 glow-accent">
                  <p className="text-muted-foreground text-sm mb-2">{stat.label}</p>
                  <p className="text-4xl font-bold text-accent">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Leaderboard management */}
            <div className="glass-effect rounded-2xl p-8 glow-accent">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-6 h-6 text-accent" />
                  <h2 className="text-2xl font-bold text-white">Manage Leaderboard</h2>
                </div>
                {!showForm && (
                  <button
                    onClick={() => {
                      setShowForm(true)
                      setEditingId(null)
                      setFormData({ teamName: '', projectTitle: '', score: '', members: '' })
                    }}
                    className="inline-flex items-center gap-2 btn-primary-neon glow-accent text-sm"
                  >
                    <Plus className="w-4 h-4" /> Add Entry
                  </button>
                )}
              </div>

              {/* Add/Edit form */}
              {showForm && (
                <form onSubmit={handleAddEntry} className="mb-8 p-6 bg-muted/20 rounded-lg border border-border/50">
                  <h3 className="text-lg font-bold text-white mb-4">
                    {editingId ? 'Edit Entry' : 'Add New Entry'}
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Team Name</label>
                      <input
                        type="text"
                        value={formData.teamName}
                        onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg bg-muted/30 border border-border focus:border-accent focus:outline-none transition-colors text-foreground"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Project Title</label>
                      <input
                        type="text"
                        value={formData.projectTitle}
                        onChange={(e) => setFormData({ ...formData, projectTitle: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg bg-muted/30 border border-border focus:border-accent focus:outline-none transition-colors text-foreground"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Score</label>
                      <input
                        type="number"
                        value={formData.score}
                        onChange={(e) => setFormData({ ...formData, score: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg bg-muted/30 border border-border focus:border-accent focus:outline-none transition-colors text-foreground"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Members</label>
                      <input
                        type="number"
                        value={formData.members}
                        onChange={(e) => setFormData({ ...formData, members: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg bg-muted/30 border border-border focus:border-accent focus:outline-none transition-colors text-foreground"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="btn-primary-neon glow-accent text-sm px-6 py-2"
                    >
                      {editingId ? 'Update' : 'Add'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false)
                        setEditingId(null)
                        setFormData({ teamName: '', projectTitle: '', score: '', members: '' })
                      }}
                      className="btn-neon glow-cyan text-sm px-6 py-2"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Entries table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Rank</th>
                      <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Team</th>
                      <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Project</th>
                      <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Members</th>
                      <th className="text-right py-3 px-4 font-semibold text-muted-foreground">Score</th>
                      <th className="text-right py-3 px-4 font-semibold text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((entry) => (
                      <tr key={entry.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                        <td className="py-3 px-4 text-accent font-bold">#{entry.rank}</td>
                        <td className="py-3 px-4 text-foreground">{entry.teamName}</td>
                        <td className="py-3 px-4 text-muted-foreground truncate">{entry.projectTitle}</td>
                        <td className="py-3 px-4 text-center text-foreground">{entry.members}</td>
                        <td className="py-3 px-4 text-right text-accent font-semibold">{entry.score}</td>
                        <td className="py-3 px-4 text-right flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(entry)}
                            className="p-2 rounded-lg bg-secondary/20 hover:bg-secondary/30 text-secondary transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(entry.id)}
                            className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </PageTransition>
  )
}
