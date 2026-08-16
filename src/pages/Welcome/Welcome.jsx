import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RiArrowRightLine, RiCodeBoxLine, RiFlashlightLine, RiShieldCheckLine, RiSparkling2Fill } from 'react-icons/ri';
import { useAuth } from '../../context/AuthContext.jsx';
import Button from '../../components/Common/Button.jsx';
import './Welcome.scss';

const PILLARS = [
  { icon: <RiCodeBoxLine />, title: 'Understands your code', body: 'Context-aware answers grounded in your actual project.' },
  { icon: <RiFlashlightLine />, title: 'Built for flow', body: 'Streamed answers, instant regenerate, zero friction.' },
  { icon: <RiShieldCheckLine />, title: 'Private by default', body: 'Your conversations stay yours — always.' },
];

export default function Welcome() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleContinue = () => navigate(isAuthenticated ? '/chat' : '/login');

  return (
    <div className="welcome-page">
      <motion.div
        className="welcome-page__mark"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <RiSparkling2Fill />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        Meet Aether
      </motion.h1>

      <motion.p
        className="welcome-page__subtitle"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        A premium AI coding assistant that thinks alongside you — from first
        line to shipped feature.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.5 }}
      >
        <Button variant="primary" size="lg" icon={<RiArrowRightLine />} iconPosition="right" onClick={handleContinue}>
          Continue
        </Button>
      </motion.div>

      <div className="welcome-page__pillars">
        {PILLARS.map((p, i) => (
          <motion.div
            key={p.title}
            className="welcome-page__pillar"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + i * 0.1, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="welcome-page__pillar-icon">{p.icon}</span>
            <h3>{p.title}</h3>
            <p>{p.body}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
