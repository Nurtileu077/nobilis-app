import React from 'react';
import I from './Icons';

const Modal = ({ title, children, onClose, size = 'md' }) => (
  <div
    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn"
    onClick={onClose}
    role="dialog"
    aria-modal="true"
    aria-label={title}
  >
    <div
      className={`bg-white rounded-2xl shadow-2xl ${size === 'lg' ? 'max-w-4xl' : 'max-w-lg'} w-full max-h-[90vh] overflow-hidden animate-slideIn`}
      onClick={e => e.stopPropagation()}
    >
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-[#1a3a32] to-[#2d5a4a]">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <button
          onClick={onClose}
          className="text-white/70 hover:text-white transition-colors"
          aria-label="Закрыть"
        >
          <I.Close />
        </button>
      </div>
      <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
        {children}
      </div>
    </div>
  </div>
);

export default Modal;
