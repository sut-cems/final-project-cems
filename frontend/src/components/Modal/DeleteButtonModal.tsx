import { AlertCircle, CheckCircle, Info, X } from "lucide-react";
import { useEffect, useState } from "react";

const DeleteConfirmationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  reportName: string;
  isProcessing?: boolean;
}> = ({ isOpen, onClose, onConfirm, reportName, isProcessing = false }) => {
  if (!isOpen) return null;

  return (
    // เปลี่ยน backdrop และ modal container
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 max-w-md w-full overflow-hidden">

        {/* Header Section - ใช้สีแดงจากธีม */}
        <div className="p-6 pb-4">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-[#D91656] rounded-full flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 pt-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {isProcessing ? 'ยกเลิกการสร้างรายงาน' : 'ลบรายงาน'}
              </h3>
              <p className="text-sm text-gray-500">การดำเนินการนี้ไม่สามารถย้อนกลับได้</p>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="px-6 pb-6 space-y-4">
          <div className="space-y-3">
            <p className="text-gray-800 font-medium">
              {isProcessing
                ? `ยกเลิกการสร้างรายงาน`
                : `ลบรายงาน`
              }
            </p>

            {/* Report Name Card */}
            <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
              <p className="text-sm text-gray-600 font-mono truncate">
                "{reportName}"
              </p>
            </div>
          </div>

          {/* Warning Card - ใช้สีจากธีม */}
          <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl border border-red-100/50">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-gradient-to-r from-red-500 to-[#D91656] rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-red-800">คำเตือน</p>
                <p className="text-sm text-red-700 leading-relaxed">
                  {isProcessing
                    ? 'การยกเลิกจะทำให้การสร้างรายงานหยุดทำงานทันที'
                    : 'ไฟล์รายงานจะถูกลบออกจากระบบอย่างถาวร'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 pt-0">
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 text-gray-600 bg-gray-100 hover:bg-gray-150 rounded-2xl transition-all duration-200 font-medium text-sm"
            >
              ยกเลิก
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-[#D91656] hover:from-red-600 hover:to-[#e61a61] text-white rounded-2xl transition-all duration-200 font-medium text-sm shadow-lg shadow-red-500/25"
            >
              {isProcessing ? 'ยกเลิกการสร้าง' : 'ลบรายงาน'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Tooltip: React.FC<{
  text: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right'
}> = ({ text, children, position = 'top' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showDelay, setShowDelay] = useState<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    const delay = setTimeout(() => setIsVisible(true), 500);
    setShowDelay(delay);
  };

  const handleMouseLeave = () => {
    if (showDelay) {
      clearTimeout(showDelay);
      setShowDelay(null);
    }
    setIsVisible(false);
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom':
        return 'top-full left-1/2 transform -translate-x-1/2 mt-2';
      case 'left':
        return 'right-full top-1/2 transform -translate-y-1/2 mr-2';
      case 'right':
        return 'left-full top-1/2 transform -translate-y-1/2 ml-2';
      default: // top
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
    }
  };

  const getArrowClasses = () => {
    switch (position) {
      case 'bottom':
        return 'bottom-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-gray-800';
      case 'left':
        return 'left-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-gray-800';
      case 'right':
        return 'right-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-gray-800';
      default: // top
        return 'top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-gray-800';
    }
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {isVisible && text && (
        <div className={`absolute z-[70] ${getPositionClasses()}`}>
          <div className="bg-gray-800 text-white text-xs px-3 py-2 rounded-lg shadow-2xl border border-gray-700 backdrop-blur-sm bg-opacity-95 whitespace-nowrap animate-in fade-in-0 zoom-in-95 duration-200">
            {text}
          </div>
          <div className={`absolute w-0 h-0 border-4 ${getArrowClasses()}`}></div>
        </div>
      )}
    </div>
  );
};

// Custom Text Truncate Component (reused from ProfileDropdown)
const TruncatedText: React.FC<{
  text: string;
  maxLength: number;
  className?: string;
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right';
  showTooltip?: boolean;
}> = ({ text, maxLength, className = "", tooltipPosition = 'top', showTooltip = true }) => {
  const shouldTruncate = text.length > maxLength;
  const displayText = shouldTruncate ? `${text.slice(0, maxLength)}...` : text;

  if (shouldTruncate && showTooltip) {
    return (
      <Tooltip text={text} position={tooltipPosition}>
        <span className={`cursor-default ${className}`}>
          {displayText}
        </span>
      </Tooltip>
    );
  }

  return <span className={className}>{displayText}</span>;
};

// Enhanced Toast Notification Component
const ToastNotification: React.FC<{
  message: string;
  type: 'success' | 'error' | 'info';
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
  title?: string;
  showCloseButton?: boolean;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}> = ({
  message,
  type,
  isVisible,
  onClose,
  duration = 4000,
  title,
  showCloseButton = true,
  position = 'top-right'
}) => {
    const [shouldRender, setShouldRender] = useState(isVisible);

    useEffect(() => {
      if (isVisible) {
        setShouldRender(true);
        if (duration > 0) {
          const timer = setTimeout(() => {
            onClose();
          }, duration);
          return () => clearTimeout(timer);
        }
      } else {
        const timer = setTimeout(() => setShouldRender(false), 300);
        return () => clearTimeout(timer);
      }
    }, [isVisible, onClose, duration]);

    if (!shouldRender) return null;

    const getToastStyles = () => {
      switch (type) {
        case 'success':
          return {
            container: 'bg-white border-2 border-green-200 shadow-2xl',
            iconBg: 'bg-gradient-to-br from-green-500 to-emerald-600',
            iconColor: 'text-white',
            titleColor: 'text-green-800',
            messageColor: 'text-green-700'
          };
        case 'error':
          return {
            container: 'bg-white border-2 border-red-200 shadow-2xl',
            iconBg: 'bg-gradient-to-br from-red-500 to-red-600',
            iconColor: 'text-white',
            titleColor: 'text-red-800',
            messageColor: 'text-red-700'
          };
        default: // info
          return {
            container: 'bg-white border-2 border-blue-200 shadow-2xl',
            iconBg: 'bg-gradient-to-br from-[#640D5F] to-[#D91656]',
            iconColor: 'text-white',
            titleColor: 'text-[#640D5F]',
            messageColor: 'text-gray-700'
          };
      }
    };

    const getIcon = () => {
      switch (type) {
        case 'success':
          return <CheckCircle className="w-5 h-5" />;
        case 'error':
          return <AlertCircle className="w-5 h-5" />;
        default:
          return <Info className="w-5 h-5" />;
      }
    };

    const getPositionClasses = () => {
      switch (position) {
        case 'top-left':
          return 'top-4 left-4';
        case 'bottom-right':
          return 'bottom-4 right-4';
        case 'bottom-left':
          return 'bottom-4 left-4';
        case 'top-center':
          return 'top-4 left-1/2 transform -translate-x-1/2';
        case 'bottom-center':
          return 'bottom-4 left-1/2 transform -translate-x-1/2';
        default: // top-right
          return 'top-4 right-4';
      }
    };

    const getAnimationClasses = () => {
      const isLeft = position.includes('left');
      const isRight = position.includes('right');
      const isCenter = position.includes('center');

      if (isVisible) {
        return 'opacity-100 scale-100 translate-y-0 translate-x-0';
      } else {
        if (isLeft) return 'opacity-0 scale-95 -translate-x-full';
        if (isRight) return 'opacity-0 scale-95 translate-x-full';
        if (isCenter) return 'opacity-0 scale-95 -translate-y-full';
        return 'opacity-0 scale-95 translate-x-full';
      }
    };

    const styles = getToastStyles();

    return (
      <div className={`fixed z-99 ${getPositionClasses()}`}>
        <div className={`
        ${styles.container}
        rounded-xl p-4 min-w-80 max-w-96 
        transition-all duration-300 ease-in-out transform
        ${getAnimationClasses()}
        backdrop-blur-sm
      `}>
          <div className="flex items-start space-x-3">
            {/* Icon */}
            <div className={`
            flex-shrink-0 w-10 h-10 rounded-full ${styles.iconBg} 
            flex items-center justify-center shadow-lg
            group-hover:scale-110 transition-transform duration-200
          `}>
              <div className={styles.iconColor}>
                {getIcon()}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {title && (
                <div className={`font-semibold ${styles.titleColor} mb-1`}>
                  <TruncatedText
                    text={title}
                    maxLength={40}
                    tooltipPosition="bottom"
                  />
                </div>
              )}
              <div className={`text-sm ${styles.messageColor}`}>
                <TruncatedText
                  text={message}
                  maxLength={100}
                  tooltipPosition="bottom"
                />
              </div>
            </div>

            {/* Close Button */}
            {showCloseButton && (
              <Tooltip text="ปิด" position="left">
                <button
                  onClick={onClose}
                  className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 transition-all duration-200 flex items-center justify-center group hover:scale-110"
                  aria-label="ปิดการแจ้งเตือน"
                >
                  <X className="w-4 h-4 text-gray-500 group-hover:text-gray-700" />
                </button>
              </Tooltip>
            )}
          </div>

          {/* Progress Bar (optional) */}
          {duration > 0 && isVisible && (
            <div className="mt-3 h-1 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ease-linear ${type === 'success' ? 'bg-gradient-to-r from-green-500 to-emerald-600' :
                    type === 'error' ? 'bg-gradient-to-r from-red-500 to-red-600' :
                      'bg-gradient-to-r from-[#640D5F] to-[#D91656]'
                  }`}
                style={{
                  width: '100%',
                  animation: `shrink ${duration}ms linear`
                }}
              />
            </div>
          )}
        </div>

        <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
      </div>
    );
  };

export { DeleteConfirmationModal, ToastNotification };