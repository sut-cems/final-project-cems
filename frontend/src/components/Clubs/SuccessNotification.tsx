import React, { useEffect, useState } from 'react';
import { CheckCircle, X, AlertCircle } from 'lucide-react';

interface SuccessNotificationProps {
  isOpen: boolean;
  message: string;
  onClose: () => void;
  type?: 'success' | 'error';
  autoClose?: boolean;
  duration?: number;
}

const SuccessNotification: React.FC<SuccessNotificationProps> = ({
  isOpen,
  message,
  onClose,
  type = 'success',
  autoClose = true,
  duration = 4000,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [progressWidth, setProgressWidth] = useState('100%');

  useEffect(() => {
    let autoCloseTimer: ReturnType<typeof setTimeout> | null = null;
    let hideTimer: ReturnType<typeof setTimeout> | null = null;

    if (isOpen) {
      setIsVisible(true);
      setProgressWidth('100%');
      setTimeout(() => {
        setProgressWidth('0%');
      }, 50);

      if (autoClose) {
        autoCloseTimer = setTimeout(() => {
          onClose();
          window.location.reload();
        }, duration);
      }
    } else {
      hideTimer = setTimeout(() => {
        setIsVisible(false);
      }, 300);
    }

    return () => {
      if (autoCloseTimer) clearTimeout(autoCloseTimer);
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, [isOpen, autoClose, duration, onClose]);

  const handleClose = () => {
    onClose();
    window.location.reload();
  };

  if (!isVisible) return null;

  const getIcon = () => (type === 'success' ? (
    <CheckCircle className="w-6 h-6 text-green-500" />
  ) : (
    <AlertCircle className="w-6 h-6 text-red-500" />
  ));

  const getStyles = () => (type === 'success' ? {
    bg: 'bg-green-50 border-green-200',
    text: 'text-green-800',
    progress: 'bg-green-500',
  } : {
    bg: 'bg-red-50 border-red-200',
    text: 'text-red-800',
    progress: 'bg-red-500',
  });

  const styles = getStyles();

  return (
    <div
      className={`fixed top-4 left-4 z-50 transition-all duration-300 transform ${
        isOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      }`}
    >
      <div className={`${styles.bg} border rounded-xl shadow-lg p-4 max-w-sm w-full backdrop-blur-sm`}>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
          <div className={`flex-1 min-w-0 ${styles.text} font-medium text-sm leading-relaxed`}>
            {message}
          </div>
          <button
            onClick={handleClose}
            className="flex-shrink-0 p-1 rounded-full hover:bg-white/50 transition-colors duration-200"
            aria-label="Close notification"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
        {autoClose && (
          <div className="mt-3 h-1 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`${styles.progress} h-full rounded-full transition-all ease-linear`}
              style={{
                width: progressWidth,
                transitionDuration: `${duration}ms`,
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SuccessNotification;
