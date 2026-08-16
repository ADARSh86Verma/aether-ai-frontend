import { motion } from 'framer-motion';
import './LoadingScreen.scss';

export default function LoadingScreen({ label = 'Warming up Aether…' }) {
  return (
    <div className="loading-screen">
      <motion.div
        className="loading-screen__mark"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1.4, ease: 'linear' }}
      />
      <p>{label}</p>
    </div>
  );
}
