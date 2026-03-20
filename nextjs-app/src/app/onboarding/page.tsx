'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CountryDeck from '@/components/onboarding/CountryDeck';
import MetricsForm from '@/components/onboarding/MetricsForm';
import LoadingAnimation from '@/components/onboarding/LoadingAnimation';
import ChanceSpeedometer from '@/components/onboarding/ChanceSpeedometer';
import UniversityCard from '@/components/onboarding/UniversityCard';
import AuthBottomSheet from '@/components/onboarding/AuthBottomSheet';
import TripwireBanner from '@/components/onboarding/TripwireBanner';
import BookingCalendar from '@/components/onboarding/BookingCalendar';
import { ArrowLeft } from 'lucide-react';

type Step = 'welcome' | 'swipe' | 'metrics' | 'loading' | 'results' | 'booking';

interface OnboardingState {
  countries: string[];
  gpa: number;
  englishLevel: string;
  ieltsScore: number;
  budget: number;
  chance: number;
  matchedUniversities: {
    name: string;
    country: string;
    ranking?: number;
    tuition: string;
    match: number;
    scholarship: boolean;
  }[];
}

// Mock AI calculation
function calculateChance(data: Partial<OnboardingState>): {
  chance: number;
  universities: OnboardingState['matchedUniversities'];
} {
  const gpa = data.gpa || 3.0;
  const ielts = data.ieltsScore || 6.0;
  const baseChance = Math.min(95, Math.round((gpa / 4) * 50 + (ielts / 9) * 40 + 5));

  const universities = [
    { name: 'University of Toronto', country: 'Канада', ranking: 21, tuition: 'CA$25,000', match: Math.min(98, baseChance + 5), scholarship: true },
    { name: 'Karlsruhe Institute of Technology', country: 'Германия', ranking: 120, tuition: '€1,500', match: Math.min(95, baseChance + 8), scholarship: false },
    { name: 'Korea University', country: 'Ю. Корея', ranking: 74, tuition: '$8,000', match: Math.min(92, baseChance + 3), scholarship: true },
    { name: 'University of Arizona', country: 'США', ranking: 99, tuition: '$28,000', match: baseChance, scholarship: true },
    { name: 'Masaryk University', country: 'Чехия', ranking: 400, tuition: '€0', match: Math.min(99, baseChance + 12), scholarship: false },
  ]
    .filter((u) => u.match > 30)
    .sort((a, b) => b.match - a.match);

  return { chance: baseChance, universities };
}

export default function OnboardingPage() {
  const [step, setStep] = useState<Step>('welcome');
  const [state, setState] = useState<OnboardingState>({
    countries: [],
    gpa: 3.0,
    englishLevel: 'B1',
    ieltsScore: 6.0,
    budget: 15000,
    chance: 0,
    matchedUniversities: [],
  });
  const [showAuth, setShowAuth] = useState(false);

  const handleCountriesComplete = useCallback((countries: string[]) => {
    setState((prev) => ({ ...prev, countries }));
    setStep('metrics');
  }, []);

  const handleMetricsSubmit = useCallback(
    (data: { gpa: number; englishLevel: string; ieltsScore: number; budget: number }) => {
      setState((prev) => ({ ...prev, ...data }));
      setStep('loading');
    },
    []
  );

  const handleLoadingComplete = useCallback(() => {
    const result = calculateChance(state);
    setState((prev) => ({
      ...prev,
      chance: result.chance,
      matchedUniversities: result.universities,
    }));
    setStep('results');
    // Show auth sheet after 3 seconds
    setTimeout(() => setShowAuth(true), 3000);
  }, [state]);

  const handleBookConsultation = useCallback(() => {
    setStep('booking');
    setShowAuth(false);
  }, []);

  return (
    <main className="min-h-screen nobilis-gradient overflow-hidden">
      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          {step !== 'welcome' && step !== 'loading' && (
            <button
              onClick={() => {
                const steps: Step[] = ['welcome', 'swipe', 'metrics', 'loading', 'results', 'booking'];
                const idx = steps.indexOf(step);
                if (idx > 0) setStep(steps[idx - 1]);
              }}
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/60"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <h1 className="text-lg font-bold text-white">
            <span className="text-nobilis-gold">Nobilis</span> Academy
          </h1>
          <div className="w-10" />
        </div>

        {/* Steps */}
        <AnimatePresence mode="wait">
          {step === 'welcome' && (
            <motion.div
              key="welcome"
              className="text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <h2 className="text-3xl font-bold text-white mb-4">
                В какую страну<br />хочешь поступить?
              </h2>
              <p className="text-white/60 mb-8">
                Свайпай вправо страны, которые тебе нравятся
              </p>
              <button
                onClick={() => setStep('swipe')}
                className="px-8 py-4 rounded-2xl bg-nobilis-gold text-nobilis-navy font-bold text-lg
                           hover:scale-105 active:scale-95 transition-all glow-gold"
              >
                Начать
              </button>
            </motion.div>
          )}

          {step === 'swipe' && (
            <motion.div
              key="swipe"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <CountryDeck onComplete={handleCountriesComplete} />
            </motion.div>
          )}

          {step === 'metrics' && (
            <motion.div
              key="metrics"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <h2 className="text-xl font-bold text-white text-center mb-6">
                Расскажи о себе
              </h2>
              <MetricsForm onSubmit={handleMetricsSubmit} />
            </motion.div>
          )}

          {step === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <LoadingAnimation onComplete={handleLoadingComplete} />
            </motion.div>
          )}

          {step === 'results' && (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-white mb-2">Твои шансы поступления</h2>
              </div>

              <ChanceSpeedometer chance={state.chance} />

              <div className="mt-8 space-y-3">
                <h3 className="text-sm font-medium text-white/50 uppercase tracking-wider">
                  Подобранные университеты
                </h3>
                {state.matchedUniversities.map((uni, i) => (
                  <UniversityCard key={uni.name} {...uni} delay={i * 0.15} />
                ))}
              </div>

              <TripwireBanner onBook={handleBookConsultation} />
            </motion.div>
          )}

          {step === 'booking' && (
            <motion.div
              key="booking"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <BookingCalendar
                onBook={(slot) => {
                  console.log('Booked:', slot);
                  // TODO: POST /api/consultations/book
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Auth bottom sheet */}
      <AuthBottomSheet isOpen={showAuth} onClose={() => setShowAuth(false)} />
    </main>
  );
}
