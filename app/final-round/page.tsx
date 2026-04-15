import type { Metadata } from 'next'
import FinalRoundPortal from '@/components/final-round-portal'

export const metadata: Metadata = {
  title: 'Final Round Allocation - Sankalp Bharat Hackathon 2026',
  description: 'Team login and one-time problem statement allocation for the final round.',
}

export default function FinalRoundPage() {
  return <FinalRoundPortal />
}