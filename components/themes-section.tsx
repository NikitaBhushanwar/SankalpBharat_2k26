export function ThemesSection() {
  const themes = [
    {
      title: 'Environment',
      desc: 'Address ecological conservation, pollution control, resource management, and climate resilience through practical engineering solutions.',
    },
    {
      title: 'Sustainability',
      desc: 'Build for sustainable development with circular economy models, green energy innovation, and measurable waste reduction.',
    },
    {
      title: 'Agriculture',
      desc: 'Innovate in precision farming, supply-chain efficiency, soil health analytics, and sustainable agricultural practices.',
    },
  ];

  return (
    <section className="py-24 bg-white dark:bg-slate-950 transition-colors">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-4xl font-black uppercase mb-12 dark:text-white">
          Themes
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {themes.map(t => (
            <div
              key={t.title}
              className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm"
            >
              <h3 className="text-xl font-black uppercase mb-3 dark:text-white">
                {t.title}
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                {t.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
