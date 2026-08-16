import { motion } from 'framer-motion';
import { RiCodeSSlashLine, RiLightbulbFlashLine, RiSparkling2Fill, RiTerminalBoxLine } from 'react-icons/ri';
import './WelcomeScreen.scss';

const SUGGESTIONS = [
  { icon: <RiCodeSSlashLine />, text: 'Refactor this function for readability' },
  { icon: <RiTerminalBoxLine />, text: 'Explain what this error means' },
  { icon: <RiLightbulbFlashLine />, text: 'Suggest a cleaner data structure' },
  { icon: <RiSparkling2Fill />, text: 'Write unit tests for my component' },
];

export default function WelcomeScreen({ onPick }) {
  return (
    <motion.div
      className="welcome-screen"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="welcome-screen__mark">
        <RiSparkling2Fill />
      </div>
      <h1>What are we building today?</h1>
      <p>Ask about a bug, paste a stack trace, or describe the feature you have in mind.</p>

      <div className="welcome-screen__suggestions">
        {SUGGESTIONS.map((s, i) => (
          <motion.button
            key={s.text}
            className="welcome-screen__chip"
            onClick={() => onPick(s.text)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 * i, duration: 0.3 }}
            whileHover={{ y: -2 }}
          >
            <span>{s.icon}</span>
            {s.text}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
