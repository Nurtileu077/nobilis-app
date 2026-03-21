import React, { useEffect, useRef } from 'react';
import I from './Icons';

const Modal = ({ title, children, onClose, size = 'md' }) => {
  const modalRef = useRef(null);
  const previousFocus = useRef(null);

  useEffect(() => {
    previousFocus.current = document.activeElement;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      // Focus trap
      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    // Focus first focusable element
    if (modalRef.current) {
      const focusable = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length > 0) focusable[0].focus();
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (previousFocus.current) previousFocus.current.focus();
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50 md:p-4 animate-fadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        ref={modalRef}
        className={`bg-white rounded-t-2xl md:rounded-2xl shadow-2xl ${size === 'lg' ? 'md:max-w-4xl' : 'md:max-w-lg'} w-full max-h-[92vh] md:max-h-[90vh] overflow-hidden animate-slideUp md:animate-slideIn`}
        onClick={e => e.stopPropagation()}
      >
        {/* Mobile drag handle */}
        <div className="md:hidden flex justify-center pt-2 pb-1">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-nobilis-green to-nobilis-green-light">
          <h3 className="text-lg font-semibold text-white truncate pr-2">{title}</h3>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors flex-shrink-0 p-1"
            aria-label="Закрыть"
          >
            <I.Close />
          </button>
        </div>
        <div className="p-4 md:p-6 overflow-y-auto max-h-[calc(92vh-120px)] md:max-h-[calc(90vh-80px)]">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
