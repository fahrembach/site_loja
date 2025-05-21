import React, { createContext, useContext, useState, useCallback } from "react";

interface ToastState {
  visible: boolean;
  message: string;
}

const ToastContext = createContext<(msg: string) => void>(() => {});

export function useToast() {
  return useContext(ToastContext);
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<ToastState>({ visible: false, message: "" });
  const showToast = useCallback((msg: string) => {
    setToast({ visible: true, message: msg });
    setTimeout(() => setToast({ visible: false, message: "" }), 2200);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div className={`fixed z-[1000] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${toast.visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
        <div className="flex items-center bg-white shadow-2xl border-4 border-[#14B8A6] rounded-2xl px-8 py-6 gap-3 animate-toast-pop text-[#210F50] text-lg font-extrabold drop-shadow-lg">
          <svg className="w-8 h-8 text-[#14B8A6]" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
          {toast.message}
        </div>
      </div>
    </ToastContext.Provider>
  );
};
