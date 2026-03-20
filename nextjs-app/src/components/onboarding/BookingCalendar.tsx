'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, CheckCircle } from 'lucide-react';

interface BookingCalendarProps {
  onBook: (slot: { date: string; time: string }) => void;
}

const TIME_SLOTS = ['10:00', '12:00', '14:00', '16:00', '18:00'];

export default function BookingCalendar({ onBook }: BookingCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [booked, setBooked] = useState(false);

  // Generate next 7 days
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return {
      date: d.toISOString().split('T')[0],
      day: d.toLocaleDateString('ru-RU', { weekday: 'short' }),
      num: d.getDate(),
      month: d.toLocaleDateString('ru-RU', { month: 'short' }),
    };
  });

  const handleBook = () => {
    if (selectedDate && selectedTime) {
      setBooked(true);
      onBook({ date: selectedDate, time: selectedTime });
    }
  };

  if (booked) {
    return (
      <motion.div
        className="text-center py-8"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <CheckCircle size={48} className="text-green-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Консультация забронирована!</h3>
        <p className="text-white/50 text-sm">
          {selectedDate} в {selectedTime} — ссылка на Zoom придёт на почту
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="w-full max-w-md mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="text-center mb-6">
        <Calendar size={32} className="text-nobilis-gold mx-auto mb-2" />
        <h3 className="text-lg font-bold text-white">Выбери удобное время</h3>
        <p className="text-sm text-white/50">30 минут с персональным ментором</p>
      </div>

      {/* Dates */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 mb-4">
        {dates.map((d) => (
          <button
            key={d.date}
            onClick={() => setSelectedDate(d.date)}
            className={`shrink-0 w-16 py-3 rounded-xl text-center transition-all ${
              selectedDate === d.date
                ? 'bg-primary-500 text-white'
                : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            <div className="text-xs uppercase">{d.day}</div>
            <div className="text-lg font-bold">{d.num}</div>
            <div className="text-xs">{d.month}</div>
          </button>
        ))}
      </div>

      {/* Time slots */}
      {selectedDate && (
        <motion.div
          className="grid grid-cols-3 gap-2 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {TIME_SLOTS.map((time) => (
            <button
              key={time}
              onClick={() => setSelectedTime(time)}
              className={`py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-1.5 transition-all ${
                selectedTime === time
                  ? 'bg-nobilis-gold text-nobilis-navy'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              <Clock size={14} />
              {time}
            </button>
          ))}
        </motion.div>
      )}

      {/* Book button */}
      <button
        onClick={handleBook}
        disabled={!selectedDate || !selectedTime}
        className="w-full py-3.5 rounded-xl bg-nobilis-gold text-nobilis-navy font-bold
                   disabled:opacity-30 disabled:cursor-not-allowed hover:brightness-110
                   active:scale-[0.98] transition-all"
      >
        Забронировать
      </button>
    </motion.div>
  );
}
