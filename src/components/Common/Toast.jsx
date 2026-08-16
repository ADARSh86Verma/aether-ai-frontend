import { AnimatePresence, motion } from 'framer-motion';
import { RiCheckLine, RiCloseLine, RiErrorWarningLine, RiInformationLine } from 'react-icons/ri';
import './Toast.scss';

const ICONS = {
  success: <RiCheckLine />,
  error: <RiErrorWarningLine />,
  info: <RiInformationLine />,
};

export default function ToastStack({ toasts, onDismiss }) {
  return (
    <div className="toast-stack" role="status" aria-live="polite">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            className={`toast toast--${t.type}`}
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, transition: { duration: 0.15 } }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="toast__icon">{ICONS[t.type] || ICONS.info}</span>
            <span className="toast__message">{t.message}</span>
            <button className="toast__close" onClick={() => onDismiss(t.id)} aria-label="Dismiss notification">
              <RiCloseLine />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
