import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Target, Lightbulb, Users, Compass } from 'lucide-react'

export const metadata: Metadata = {
  title: 'About Event - Sankalp Bharat Hackathon 2K26',
  description: 'Detailed overview of the Sankalp Bharat Hackathon 2K26 purpose, theme, participants, and mission.',
}

export default function AboutEventPage() {
  return (
    <main className="min-h-screen px-4 sm:px-6 lg:px-8 pt-28 pb-10">
      <div className="max-w-6xl mx-auto rounded-3xl border border-orange-500/20 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl p-5 sm:p-7 lg:p-10">
        <div className="mb-8">
          <Link
            href="/#about"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-orange-400 transition"
          >
            <ArrowLeft size={16} /> Back to Home
          </Link>
        </div>

        <div className="mb-10 text-center">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-orange-400 mb-3">About the Event</p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white">Sankalp Bharat Hackathon 2K26</h1>
          <p className="mt-3 text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
            A national-level platform where student teams build practical, technology-driven solutions for real societal and sustainability challenges.
          </p>
        </div>

        <section className="rounded-2xl border border-border/50 bg-white/80 dark:bg-slate-900/60 p-5 sm:p-6 mb-8">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white text-center mb-5 sm:mb-6">Welcome to Pallotti !!</h2>

          <div className="grid lg:grid-cols-2 gap-5 sm:gap-6 items-start">
            <div className="rounded-xl overflow-hidden border border-border/50">
              <img
                src="/pallotti.webp"
                alt="St. Vincent Pallotti College campus"
                className="w-full h-72 sm:h-full object-cover"
                loading="lazy"
              />
            </div>

            <div className="space-y-4 text-slate-600 dark:text-slate-300 leading-relaxed">
              <p>
                St. Vincent Pallotti College of Engineering and Technology was established in 2004 by the Nagpur Pallottine Society.
                The College is accredited by NAAC with A grade. The College is affiliated to Nagpur University approved by Director of
                Technical Education, Mumbai and AICTE, Government of India.
              </p>

              <p>
                <span className="font-bold text-slate-900 dark:text-white">Vision:</span> To develop a knowledge based society with clarity of thoughts
                and charity at hearts to serve humanity with integrity.
              </p>

              <p>
                <span className="font-bold text-slate-900 dark:text-white">Mission:</span> To empower youth to be technocrats of tomorrow with absolute discipline,
                quest for knowledge and strong ethos to uphold the spirit of professionalism.
              </p>
            </div>
          </div>
        </section>

        <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
          <section className="rounded-2xl border border-border/50 bg-white/80 dark:bg-slate-900/60 p-6">
            <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white mb-3">
              <Target size={18} className="text-orange-400" /> Purpose of the Hackathon
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              The hackathon is designed to encourage students to identify real-world problems and convert ideas into workable prototypes. It promotes innovation, collaboration, and practical problem-solving through a focused build-and-present format.
            </p>
          </section>

          <section className="rounded-2xl border border-border/50 bg-white/80 dark:bg-slate-900/60 p-6">
            <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white mb-3">
              <Lightbulb size={18} className="text-orange-400" /> Theme Explanation
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              The theme, “Innovating Sustainable Solutions for Viksit Bharat,” asks participants to build technology that supports a developed India through sustainability, social impact, and scalable implementation. Projects should solve meaningful challenges in areas like environment, agriculture, healthcare, education, governance, and public infrastructure.
            </p>
          </section>

          <section className="rounded-2xl border border-border/50 bg-white/80 dark:bg-slate-900/60 p-6">
            <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white mb-3">
              <Users size={18} className="text-orange-400" /> Who Can Participate?
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Engineering and technology students from colleges across India can participate in teams. The event especially welcomes enthusiastic student innovators from Vidarbha and Maharashtra while remaining open to national participation.
            </p>
          </section>

          <section className="rounded-2xl border border-border/50 bg-white/80 dark:bg-slate-900/60 p-6">
            <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white mb-3">
              <Compass size={18} className="text-orange-400" /> Goals / Mission
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              The mission is to bridge student innovation with practical deployment by connecting academia, mentors, and industry. The event aims to produce impactful solutions, strengthen technical leadership, and cultivate a culture of responsible innovation for nation-building.
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
