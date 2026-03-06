import { useState } from 'react'
import { motion } from 'framer-motion'
import { Upload, Sparkles, Zap, Play, ArrowRight, Film, Scissors, Share2 } from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: 'easeOut' },
  }),
}

function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Film className="w-7 h-7 text-primary-400" />
          <span className="text-xl font-bold text-white">ViralClip<span className="text-primary-400">AI</span></span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-gray-300">
          <a href="#features" className="hover:text-white transition">Features</a>
          <a href="#how-it-works" className="hover:text-white transition">How it Works</a>
          <a href="#pricing" className="hover:text-white transition">Pricing</a>
        </div>
        <button className="bg-primary-600 hover:bg-primary-500 text-white px-5 py-2 rounded-lg text-sm font-medium transition">
          Get Started
        </button>
      </div>
    </nav>
  )
}

function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black pt-16">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-900/30 via-black to-accent-500/10" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-500/15 rounded-full blur-[120px]" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
          <span className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm text-gray-300 mb-8">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            AI-Powered Video Editing
          </span>
        </motion.div>

        <motion.h1
          className="text-5xl md:text-7xl font-extrabold text-white leading-tight mb-6"
          initial="hidden" animate="visible" variants={fadeUp} custom={1}
        >
          Turn Any Video Into{' '}
          <span className="bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
            Viral Clips
          </span>
        </motion.h1>

        <motion.p
          className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10"
          initial="hidden" animate="visible" variants={fadeUp} custom={2}
        >
          Upload your video and let AI find the best moments, add captions, and create
          scroll-stopping clips ready for TikTok, Reels, and Shorts.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial="hidden" animate="visible" variants={fadeUp} custom={3}
        >
          <button className="group flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-500 text-white px-8 py-4 rounded-xl text-lg font-semibold transition shadow-lg shadow-primary-600/25">
            <Upload className="w-5 h-5" />
            Upload Video
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white px-8 py-4 rounded-xl text-lg font-medium transition border border-white/20">
            <Play className="w-5 h-5" />
            Watch Demo
          </button>
        </motion.div>

        <motion.p
          className="text-sm text-gray-500 mt-6"
          initial="hidden" animate="visible" variants={fadeUp} custom={4}
        >
          No credit card required. 3 free clips per month.
        </motion.p>
      </div>
    </section>
  )
}

function Features() {
  const features = [
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: 'AI Highlight Detection',
      desc: 'Our AI analyzes your video to find the most engaging, viral-worthy moments automatically.',
    },
    {
      icon: <Scissors className="w-6 h-6" />,
      title: 'Auto-Cut & Resize',
      desc: 'Clips are automatically cropped to 9:16 vertical format with smart framing on the speaker.',
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Animated Captions',
      desc: 'Word-by-word animated subtitles are added automatically, boosting engagement by 40%.',
    },
    {
      icon: <Share2 className="w-6 h-6" />,
      title: 'One-Click Export',
      desc: 'Export optimized clips for TikTok, Instagram Reels, and YouTube Shorts in one click.',
    },
  ]

  return (
    <section id="features" className="py-24 bg-gray-950">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          className="text-center mb-16"
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Everything You Need to Go Viral
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            From raw footage to viral-ready clips in minutes, not hours.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={i}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition group"
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
            >
              <div className="w-12 h-12 rounded-xl bg-primary-600/20 text-primary-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                {f.icon}
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function HowItWorks() {
  const steps = [
    { num: '01', title: 'Upload', desc: 'Drop your long-form video — podcast, stream, lecture, vlog.' },
    { num: '02', title: 'AI Analyzes', desc: 'Our AI finds the best clips, detects faces, and transcribes audio.' },
    { num: '03', title: 'Edit & Customize', desc: 'Fine-tune clips, pick caption styles, add your branding.' },
    { num: '04', title: 'Export & Share', desc: 'Download optimized clips or post directly to social media.' },
  ]

  return (
    <section id="how-it-works" className="py-24 bg-black">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          className="text-center mb-16"
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">How It Works</h2>
          <p className="text-gray-400 text-lg">Four simple steps to viral content.</p>
        </motion.div>

        <div className="grid md:grid-cols-4 gap-8">
          {steps.map((s, i) => (
            <motion.div
              key={i}
              className="text-center"
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
            >
              <div className="text-5xl font-black text-primary-600/30 mb-4">{s.num}</div>
              <h3 className="text-white font-semibold text-xl mb-2">{s.title}</h3>
              <p className="text-gray-400 text-sm">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Pricing() {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: '/month',
      features: ['3 clips per month', '720p export', 'Basic captions', 'Watermark'],
      cta: 'Get Started',
      highlight: false,
    },
    {
      name: 'Pro',
      price: '$19',
      period: '/month',
      features: ['Unlimited clips', '1080p export', 'Custom captions', 'No watermark', 'Priority processing'],
      cta: 'Start Free Trial',
      highlight: true,
    },
    {
      name: 'Business',
      price: '$49',
      period: '/month',
      features: ['Everything in Pro', '4K export', 'Team collaboration', 'API access', 'Custom branding'],
      cta: 'Contact Sales',
      highlight: false,
    },
  ]

  return (
    <section id="pricing" className="py-24 bg-gray-950">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          className="text-center mb-16"
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Simple Pricing</h2>
          <p className="text-gray-400 text-lg">Start free. Scale as you grow.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((p, i) => (
            <motion.div
              key={i}
              className={`rounded-2xl p-8 border ${
                p.highlight
                  ? 'bg-primary-600/10 border-primary-500/50 ring-1 ring-primary-500/20'
                  : 'bg-white/5 border-white/10'
              }`}
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
            >
              <h3 className="text-white font-semibold text-lg mb-1">{p.name}</h3>
              <div className="flex items-end gap-1 mb-6">
                <span className="text-4xl font-bold text-white">{p.price}</span>
                <span className="text-gray-400 text-sm mb-1">{p.period}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {p.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm text-gray-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary-400" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                className={`w-full py-3 rounded-xl font-medium transition ${
                  p.highlight
                    ? 'bg-primary-600 hover:bg-primary-500 text-white'
                    : 'bg-white/10 hover:bg-white/15 text-white border border-white/20'
                }`}
              >
                {p.cta}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="py-12 bg-black border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Film className="w-5 h-5 text-primary-400" />
          <span className="text-white font-bold">ViralClip<span className="text-primary-400">AI</span></span>
        </div>
        <p className="text-gray-500 text-sm">2026 ViralClip AI. All rights reserved.</p>
      </div>
    </footer>
  )
}

export default function Landing() {
  return (
    <div className="bg-black min-h-screen">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Pricing />
      <Footer />
    </div>
  )
}
