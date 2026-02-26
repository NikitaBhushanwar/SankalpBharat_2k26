export function AboutSection() {
  return (
    <section id="about" className="py-24 bg-slate-50 dark:bg-slate-900 transition-colors">
      <div className="max-w-5xl mx-auto px-6">
        <h2 className="text-4xl font-black uppercase mb-6 dark:text-white">
          Event Overview
        </h2>

        <div className="space-y-6 text-slate-700 dark:text-slate-300 leading-relaxed">
          <p>
            <span className="font-semibold">Sankalp Bharat 2K26</span> is a national level hackathon with the tagline
            {' '}<span className="font-semibold">&quot;Innovating Sustainable Solutions for Viksit Bharat&quot;</span>.
          </p>

          <p>
            It is organized by the Department of Computer Science and Engineering, Computer Society of India,
            and Zenith Forum at St. Vincent Pallotti College of Engineering &amp; Technology, Nagpur (An Autonomous Institution).
          </p>

          <p>
            The objective is to provide a high-impact innovation platform for engineering students across India,
            with a specific focus on Vidarbha and Maharashtra, to solve real-world scientific and social challenges.
          </p>

          <p>
            By collaborating with organizations and industries, the event vision is to bridge the gap between
            student innovation and real-world implementation in environmental sustainability and social causes.
          </p>
        </div>
      </div>
    </section>
  );
}
