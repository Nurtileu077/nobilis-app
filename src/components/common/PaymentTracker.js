import React, { useState, useMemo } from 'react';

const formatMoney = (amount) => {
  if (amount == null) return '0 ₸';
  return Number(amount).toLocaleString('ru-RU').replace(/,/g, ' ').replace(/\s/g, ' ') + ' ₸';
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
};

const methodLabels = {
  kaspi: 'Kaspi',
  cash: 'Наличные',
  transfer: 'Перевод',
};

const methodColors = {
  kaspi: 'bg-red-50 text-red-700',
  cash: 'bg-green-50 text-green-700',
  transfer: 'bg-blue-50 text-blue-700',
};

function ProgressBar({ paid, total }) {
  const pct = total > 0 ? Math.min((paid / total) * 100, 100) : 0;
  const isComplete = pct >= 100;
  const isLow = pct < 30;

  let barColor = 'bg-yellow-400';
  if (isComplete) barColor = 'bg-emerald-500';
  else if (isLow) barColor = 'bg-red-400';

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-medium text-gray-500">Прогресс оплаты</span>
        <span className="text-xs font-semibold text-gray-700">{Math.round(pct)}%</span>
      </div>
      <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function OverviewCard({ student }) {
  const total = student?.totalContractSum || 0;
  const paid = student?.paidAmount || 0;
  const remaining = Math.max(total - paid, 0);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 animate-fadeIn">
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
        Оплата
      </h3>

      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="text-center p-3 bg-gray-50 rounded-xl">
          <p className="text-[10px] sm:text-xs text-gray-400 mb-1">Договор</p>
          <p className="text-sm sm:text-base font-bold text-gray-800">{formatMoney(total)}</p>
        </div>
        <div className="text-center p-3 bg-emerald-50 rounded-xl">
          <p className="text-[10px] sm:text-xs text-emerald-500 mb-1">Оплачено</p>
          <p className="text-sm sm:text-base font-bold text-emerald-700">{formatMoney(paid)}</p>
        </div>
        <div className="text-center p-3 bg-amber-50 rounded-xl">
          <p className="text-[10px] sm:text-xs text-amber-500 mb-1">Остаток</p>
          <p className="text-sm sm:text-base font-bold text-amber-700">{formatMoney(remaining)}</p>
        </div>
      </div>

      <ProgressBar paid={paid} total={total} />

      {student?.paymentType && (
        <div className="mt-3 flex items-center gap-2">
          <span className="text-xs text-gray-400">Тип:</span>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-nobilis-green/10 text-nobilis-green">
            {student.paymentType}
          </span>
        </div>
      )}
    </div>
  );
}

function PaymentHistory({ payments }) {
  const sorted = useMemo(
    () => [...(payments || [])].sort((a, b) => new Date(b.date) - new Date(a.date)),
    [payments]
  );

  if (!sorted.length) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 animate-fadeIn">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
          История платежей
        </h3>
        <p className="text-sm text-gray-400 text-center py-8">Платежей пока нет</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 animate-fadeIn">
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
        История платежей
      </h3>
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {sorted.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-full bg-nobilis-green/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-nobilis-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">
                  {formatMoney(p.amount)}
                </p>
                <p className="text-[11px] text-gray-400">{formatDate(p.date)}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {p.method && (
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${methodColors[p.method] || 'bg-gray-100 text-gray-600'}`}>
                  {methodLabels[p.method] || p.method}
                </span>
              )}
              {p.receipt && (
                <a
                  href={p.receipt}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-nobilis-green hover:text-nobilis-green-light"
                  title="Чек"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
      {sorted.length > 0 && (
        <p className="text-[11px] text-gray-300 text-right mt-2">
          Всего: {sorted.length} {sorted.length === 1 ? 'платёж' : 'платежей'}
        </p>
      )}
    </div>
  );
}

function AddPaymentForm({ onAddPayment }) {
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [method, setMethod] = useState('kaspi');
  const [receipt, setReceipt] = useState(null);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleReceiptChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setReceipt(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;

    setSubmitting(true);
    try {
      await onAddPayment({
        amount: Number(amount),
        date,
        method,
        receipt,
        note: note.trim() || undefined,
      });
      setAmount('');
      setNote('');
      setReceipt(null);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 animate-fadeIn">
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
        Добавить платёж
      </h3>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Сумма (₸)</label>
          <input
            type="number"
            min="0"
            step="1000"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="100 000"
            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-nobilis-green/30 focus:border-nobilis-green transition-colors"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Дата</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-nobilis-green/30 focus:border-nobilis-green transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Метод</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-nobilis-green/30 focus:border-nobilis-green transition-colors bg-white"
            >
              <option value="kaspi">Kaspi</option>
              <option value="cash">Наличные</option>
              <option value="transfer">Перевод</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">Чек / Скриншот</label>
          <label className="flex items-center justify-center w-full px-3 py-3 rounded-xl border border-dashed border-gray-300 cursor-pointer hover:border-nobilis-green hover:bg-nobilis-green/5 transition-colors">
            <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs text-gray-400">
              {receipt ? receipt.name : 'Загрузить фото чека'}
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={handleReceiptChange}
              className="hidden"
            />
          </label>
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">Примечание</label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Необязательно"
            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-nobilis-green/30 focus:border-nobilis-green transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={submitting || !amount}
          className="w-full py-2.5 rounded-xl bg-nobilis-green text-white text-sm font-semibold hover:bg-nobilis-green-light disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? 'Сохраняем...' : 'Добавить платёж'}
        </button>
      </form>
    </div>
  );
}

function PaymentSchedule({ student }) {
  const conditions = student?.paymentConditions;
  if (!conditions || !Array.isArray(conditions) || conditions.length === 0) return null;

  const today = new Date();

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 animate-fadeIn">
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
        График платежей
      </h3>
      <div className="space-y-2">
        {conditions.map((item, idx) => {
          const dueDate = new Date(item.date);
          const isPast = dueDate < today;
          const isPaid = item.paid;

          return (
            <div
              key={idx}
              className={`flex items-center justify-between p-3 rounded-xl transition-colors ${
                isPaid
                  ? 'bg-emerald-50'
                  : isPast
                  ? 'bg-red-50'
                  : 'bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isPaid
                      ? 'bg-emerald-500'
                      : isPast
                      ? 'bg-red-400'
                      : 'bg-gray-300'
                  }`}
                >
                  {isPaid ? (
                    <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="text-[10px] font-bold text-white">{idx + 1}</span>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">{formatMoney(item.amount)}</p>
                  <p className="text-[11px] text-gray-400">{formatDate(item.date)}</p>
                </div>
              </div>
              <span
                className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                  isPaid
                    ? 'bg-emerald-100 text-emerald-700'
                    : isPast
                    ? 'bg-red-100 text-red-700'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {isPaid ? 'Оплачено' : isPast ? 'Просрочено' : 'Ожидается'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function KaspiQR({ student }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 animate-fadeIn">
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
        Оплата через Kaspi QR
      </h3>
      <div className="flex flex-col items-center py-6">
        <div className="w-40 h-40 bg-gray-100 rounded-2xl flex items-center justify-center mb-4 border-2 border-dashed border-gray-200">
          <div className="text-center">
            <svg className="w-10 h-10 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
            <span className="text-[10px] text-gray-300">QR-код</span>
          </div>
        </div>
        <p className="text-xs text-gray-400 text-center max-w-[200px]">
          Отсканируйте QR-код в приложении Kaspi для оплаты
        </p>
        {student?.name && (
          <p className="text-[11px] text-gray-300 mt-2">
            Получатель: Nobilis Academy
          </p>
        )}
      </div>
    </div>
  );
}

export default function PaymentTracker({ student, payments, onAddPayment, isAdmin }) {
  return (
    <div className="space-y-4">
      <OverviewCard student={student} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PaymentHistory payments={payments} />

        <div className="space-y-4">
          {isAdmin && onAddPayment && (
            <AddPaymentForm onAddPayment={onAddPayment} />
          )}

          <PaymentSchedule student={student} />

          <KaspiQR student={student} />
        </div>
      </div>
    </div>
  );
}
