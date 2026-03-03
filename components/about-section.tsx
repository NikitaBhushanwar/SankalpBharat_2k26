import Link from 'next/link'

export function AboutSection() {
  return (
    <section id="about" className="py-24 px-4 relative overflow-hidden">
      <div className="absolute inset-0 tech-grid opacity-20" />

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="mb-14 text-center">
          <p className="text-xs font-mono text-accent tracking-widest uppercase mb-3">About the Event</p>
          <h2 className="text-4xl md:text-5xl font-black uppercase text-slate-900 dark:text-white mb-4">Event Overview</h2>
          <p className="text-muted-foreground max-w-3xl mx-auto">
            Sankalp Bharat 2K26 is a National Level Hackathon under the mission:
            {' '}<span className="text-accent font-semibold">Innovating Sustainable Solutions for Viksit Bharat</span>.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="glass-effect rounded-2xl p-8 border border-border/40">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Organizers &amp; Host</h3>
            <p className="text-muted-foreground leading-relaxed">
              Organized by the Department of Computer Science and Engineering, Computer Society of India,
              and Zenith Forum at St. Vincent Pallotti College of Engineering &amp; Technology, Nagpur
              (An Autonomous Institution).
            </p>
          </div>

          <div className="glass-effect rounded-2xl p-8 border border-border/40">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Objective &amp; Vision</h3>
            <p className="text-muted-foreground leading-relaxed">
              The hackathon provides a high-impact platform for engineering students across India,
              especially Vidarbha and Maharashtra, to solve real-world sustainability and social challenges.
              Through partnerships with industries and organizations, it bridges student innovation with practical deployment.
            </p>
          </div>
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/about-event"
            className="inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-black uppercase tracking-wider bg-orange-500 text-white hover:bg-orange-400 transition"
          >
            Learn More
          </Link>
        </div>
      </div>
    </section>
  );
}
