import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen nobilis-gradient flex flex-col items-center justify-center text-white px-4">
      {/* Logo */}
      <div className="mb-8 text-center">
        <h1 className="text-5xl font-bold tracking-tight mb-2">
          <span className="nobilis-gold-gradient bg-clip-text text-transparent">Nobilis</span>
        </h1>
        <p className="text-lg text-blue-200">Academy</p>
      </div>

      {/* Hero text */}
      <div className="max-w-md text-center mb-12">
        <h2 className="text-2xl font-semibold mb-4">
          Поступи в топ-вуз за рубежом
        </h2>
        <p className="text-blue-200 leading-relaxed">
          AI подберёт лучшие университеты под твой профиль.
          Трекинг заявок, подготовка к IELTS, и персональный ментор — всё в одном приложении.
        </p>
      </div>

      {/* CTA */}
      <Link
        href="/onboarding"
        className="group relative px-8 py-4 rounded-2xl bg-nobilis-gold text-nobilis-navy font-bold text-lg
                   transition-all duration-300 hover:scale-105 active:scale-95 glow-gold"
      >
        Рассчитать шансы бесплатно
        <span className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
      </Link>

      {/* Stats */}
      <div className="mt-16 grid grid-cols-3 gap-8 text-center">
        <div>
          <div className="text-3xl font-bold">5000+</div>
          <div className="text-sm text-blue-300">Университетов</div>
        </div>
        <div>
          <div className="text-3xl font-bold">92%</div>
          <div className="text-sm text-blue-300">Поступают</div>
        </div>
        <div>
          <div className="text-3xl font-bold">30+</div>
          <div className="text-sm text-blue-300">Стран</div>
        </div>
      </div>
    </main>
  );
}
