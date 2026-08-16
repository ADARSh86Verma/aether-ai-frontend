import { isPasswordValid } from '../../components/Auth/PasswordStrengthMeter.jsx';
import { useState } from 'react';
import { RiGithubFill, RiShieldCheckLine } from 'react-icons/ri';
import { useSettings } from '../../context/SettingsContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import SettingRow from '../../components/SettingsUI/SettingRow.jsx';
import Toggle from '../../components/SettingsUI/Toggle.jsx';
import SelectField from '../../components/SettingsUI/SelectField.jsx';
import Slider from '../../components/SettingsUI/Slider.jsx';
import Button from '../../components/Common/Button.jsx';
import Modal from '../../components/Common/Modal.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';

const ACCENTS = [
  { value: 'blue', label: 'Blue · Purple · Cyan' },
  { value: 'purple', label: 'Purple · Magenta · Pink' },
  { value: 'cyan', label: 'Cyan · Sky · Blue' },
  { value: 'green', label: 'Emerald · Cyan · Blue' },
  { value: 'rose', label: 'Rose · Purple · Blue' },
];

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Français' },
  { value: 'de', label: 'Deutsch' },
  { value: 'ja', label: '日本語' },
  { value: 'pt', label: 'Português' },
];

const FONT_SIZES = [
  { value: 'sm', label: 'Small' },
  { value: 'md', label: 'Medium' },
  { value: 'lg', label: 'Large' },
];

const EDITOR_FONTS = [
  { value: 'jetbrains-mono', label: 'JetBrains Mono' },
  { value: 'fira-code', label: 'Fira Code' },
  { value: 'source-code-pro', label: 'Source Code Pro' },
  { value: 'sf-mono', label: 'SF Mono' },
];

const AI_MODELS = [
  { value: 'aether-1-coder', label: 'Aether-1 Coder' },
  { value: 'aether-1-swift', label: 'Aether-1 Swift (fast)' },
  { value: 'aether-1-deep', label: 'Aether-1 Deep (reasoning)' },
];

const SHELLS = [
  { value: 'zsh', label: 'zsh' },
  { value: 'bash', label: 'bash' },
  { value: 'fish', label: 'fish' },
  { value: 'powershell', label: 'PowerShell' },
];

const CURSOR_STYLES = [
  { value: 'bar', label: 'Bar' },
  { value: 'block', label: 'Block' },
  { value: 'underline', label: 'Underline' },
];

function SectionCard({ title, children }) {
  return (
    <section className="settings-section">
      <h3>{title}</h3>
      <div className="settings-section__rows">{children}</div>
    </section>
  );
}

// ---------------------------------------------------------------------------
export function GeneralPanel() {
  const { settings, updateSection } = useSettings();
  const { theme, toggleTheme } = useTheme();
  const g = settings.general;

  return (
    <>
      <SectionCard title="Appearance">
        <SettingRow title="Theme" description="Switch between dark and light mode.">
          <Button variant="glass" size="sm" onClick={toggleTheme}>
            {theme === 'dark' ? 'Dark' : 'Light'}
          </Button>
        </SettingRow>
        <SettingRow title="Accent color" description="Applied across buttons, highlights, and gradients.">
          <SelectField value={g.accentColor} onChange={(v) => updateSection('general', { accentColor: v })} options={ACCENTS} />
        </SettingRow>
        <SettingRow title="Font size" description="Base interface text size.">
          <SelectField value={g.fontSize} onChange={(v) => updateSection('general', { fontSize: v })} options={FONT_SIZES} />
        </SettingRow>
      </SectionCard>

      <SectionCard title="Language">
        <SettingRow title="Interface language" description="Changes menu and label language.">
          <SelectField value={g.language} onChange={(v) => updateSection('general', { language: v })} options={LANGUAGES} />
        </SettingRow>
      </SectionCard>

      <SectionCard title="Editor font">
        <SettingRow title="Code font" description="Used for inline code and code blocks in chat.">
          <SelectField value={g.editorFont} onChange={(v) => updateSection('general', { editorFont: v })} options={EDITOR_FONTS} />
        </SettingRow>
      </SectionCard>
    </>
  );
}

// ---------------------------------------------------------------------------
export function AiPanel() {
  const { settings, updateSection } = useSettings();
  const a = settings.ai;

  return (
    <>
      <SectionCard title="Model">
        <SettingRow title="AI model" description="Choose the model used for new messages.">
          <SelectField value={a.model} onChange={(v) => updateSection('ai', { model: v })} options={AI_MODELS} />
        </SettingRow>
        <SettingRow title="Temperature" description="Higher values give more varied, creative answers." stack>
          <Slider value={a.temperature} min={0} max={1} step={0.05} onChange={(v) => updateSection('ai', { temperature: v })} />
        </SettingRow>
        <SettingRow title="Max tokens" description="Upper limit on response length." stack>
          <Slider
            value={a.maxTokens}
            min={256}
            max={8192}
            step={256}
            onChange={(v) => updateSection('ai', { maxTokens: v })}
            formatValue={(v) => v.toLocaleString()}
          />
        </SettingRow>
        <SettingRow title="Context length" description="How much prior conversation the model can see." stack>
          <Slider
            value={a.contextLength}
            min={4000}
            max={128000}
            step={4000}
            onChange={(v) => updateSection('ai', { contextLength: v })}
            formatValue={(v) => v.toLocaleString()}
          />
        </SettingRow>
      </SectionCard>

      <SectionCard title="Behavior">
        <SettingRow title="Streaming" description="Show responses as they're generated, token by token.">
          <Toggle checked={a.streaming} onChange={(v) => updateSection('ai', { streaming: v })} />
        </SettingRow>
        <SettingRow title="Memory" description="Let Aether remember context across sessions.">
          <Toggle checked={a.memory} onChange={(v) => updateSection('ai', { memory: v })} />
        </SettingRow>
        <SettingRow title="Auto-save" description="Automatically save conversations as you go.">
          <Toggle checked={a.autoSave} onChange={(v) => updateSection('ai', { autoSave: v })} />
        </SettingRow>
        <SettingRow title="Auto-suggest" description="Show follow-up prompt suggestions.">
          <Toggle checked={a.autoSuggest} onChange={(v) => updateSection('ai', { autoSuggest: v })} />
        </SettingRow>
        <SettingRow title="Thinking mode" description="Show extended reasoning before the final answer.">
          <Toggle checked={a.thinkingMode} onChange={(v) => updateSection('ai', { thinkingMode: v })} />
        </SettingRow>
      </SectionCard>
    </>
  );
}

// ---------------------------------------------------------------------------
export function WorkspacePanel() {
  const { settings, updateSection } = useSettings();
  const w = settings.workspace;

  return (
    <SectionCard title="Workspace">
      <SettingRow title="Default workspace" description="Opens automatically on sign-in.">
        <SelectField
          value={w.defaultWorkspace}
          onChange={(v) => updateSection('workspace', { defaultWorkspace: v })}
          options={[
            { value: 'Personal', label: 'Personal' },
            { value: 'Team', label: 'Team' },
            { value: 'Client Work', label: 'Client Work' },
          ]}
        />
      </SettingRow>
      <SettingRow title="Auto backup" description="Periodically back up workspace files.">
        <Toggle checked={w.autoBackup} onChange={(v) => updateSection('workspace', { autoBackup: v })} />
      </SettingRow>
      <SettingRow title="Auto restore" description="Restore your last session on launch.">
        <Toggle checked={w.autoRestore} onChange={(v) => updateSection('workspace', { autoRestore: v })} />
      </SettingRow>
      <SettingRow title="Git integration" description="Show branch status and diffs in context.">
        <Toggle checked={w.gitIntegration} onChange={(v) => updateSection('workspace', { gitIntegration: v })} />
      </SettingRow>
    </SectionCard>
  );
}

// ---------------------------------------------------------------------------
export function EditorPanel() {
  const { settings, updateSection } = useSettings();
  const e = settings.editor;

  return (
    <>
      <SectionCard title="Typography">
        <SettingRow title="Font family">
          <SelectField
            value={e.fontFamily}
            onChange={(v) => updateSection('editor', { fontFamily: v })}
            options={[
              { value: 'JetBrains Mono', label: 'JetBrains Mono' },
              { value: 'Fira Code', label: 'Fira Code' },
              { value: 'Menlo', label: 'Menlo' },
            ]}
          />
        </SettingRow>
        <SettingRow title="Font size" stack>
          <Slider value={e.fontSize} min={10} max={22} step={1} onChange={(v) => updateSection('editor', { fontSize: v })} formatValue={(v) => `${v}px`} />
        </SettingRow>
        <SettingRow title="Tab size" stack>
          <Slider value={e.tabSize} min={2} max={8} step={2} onChange={(v) => updateSection('editor', { tabSize: v })} formatValue={(v) => `${v} spaces`} />
        </SettingRow>
      </SectionCard>

      <SectionCard title="Behavior">
        <SettingRow title="Word wrap">
          <Toggle checked={e.wordWrap} onChange={(v) => updateSection('editor', { wordWrap: v })} />
        </SettingRow>
        <SettingRow title="Line numbers">
          <Toggle checked={e.lineNumbers} onChange={(v) => updateSection('editor', { lineNumbers: v })} />
        </SettingRow>
        <SettingRow title="Minimap">
          <Toggle checked={e.minimap} onChange={(v) => updateSection('editor', { minimap: v })} />
        </SettingRow>
        <SettingRow title="Autocomplete">
          <Toggle checked={e.autoComplete} onChange={(v) => updateSection('editor', { autoComplete: v })} />
        </SettingRow>
        <SettingRow title="Format on save">
          <Toggle checked={e.formatOnSave} onChange={(v) => updateSection('editor', { formatOnSave: v })} />
        </SettingRow>
      </SectionCard>
    </>
  );
}

// ---------------------------------------------------------------------------
export function TerminalPanel() {
  const { settings, updateSection } = useSettings();
  const t = settings.terminal;

  return (
    <SectionCard title="Terminal">
      <SettingRow title="Default shell">
        <SelectField value={t.defaultShell} onChange={(v) => updateSection('terminal', { defaultShell: v })} options={SHELLS} />
      </SettingRow>
      <SettingRow title="Font size" stack>
        <Slider value={t.fontSize} min={10} max={20} step={1} onChange={(v) => updateSection('terminal', { fontSize: v })} formatValue={(v) => `${v}px`} />
      </SettingRow>
      <SettingRow title="Cursor style">
        <SelectField value={t.cursorStyle} onChange={(v) => updateSection('terminal', { cursorStyle: v })} options={CURSOR_STYLES} />
      </SettingRow>
    </SectionCard>
  );
}

// ---------------------------------------------------------------------------
export function NotificationsPanel() {
  const { settings, updateSection } = useSettings();
  const n = settings.notifications;

  return (
    <SectionCard title="Notifications">
      <SettingRow title="Desktop notifications" description="Alerts when a response finishes in the background.">
        <Toggle checked={n.desktop} onChange={(v) => updateSection('notifications', { desktop: v })} />
      </SettingRow>
      <SettingRow title="Sound" description="Play a sound when a response completes.">
        <Toggle checked={n.sound} onChange={(v) => updateSection('notifications', { sound: v })} />
      </SettingRow>
      <SettingRow title="Email notifications" description="Weekly digest and important account updates.">
        <Toggle checked={n.email} onChange={(v) => updateSection('notifications', { email: v })} />
      </SettingRow>
    </SectionCard>
  );
}

// ---------------------------------------------------------------------------
export function SecurityPanel() {
  const { settings, updateSection } = useSettings();
  const { changePassword } = useAuth();
  const { showToast } = useToast();
  const [pwModal, setPwModal] = useState(false);
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [saving, setSaving] = useState(false);

  const sessions = [
    { id: 1, device: 'MacBook Pro · Chrome', location: 'San Francisco, US', current: true },
    { id: 2, device: 'iPhone 15 · Aether app', location: 'San Francisco, US', current: false },
    { id: 3, device: 'Windows PC · Edge', location: 'Austin, US', current: false },
  ];

  const handleChangePassword = async () => {
    if (!isPasswordValid(next)) {
      showToast('Password must be at least 8 characters and include uppercase, lowercase, number, and symbol.', { type: 'error' });
      return;
    }
    setSaving(true);
    try {
      await changePassword(current, next);
      showToast('Password updated', { type: 'success' });
      setPwModal(false);
      setCurrent('');
      setNext('');
    } catch {
      showToast('Could not update password', { type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <SectionCard title="Two-factor authentication">
        <SettingRow title="Enable 2FA" description="Require a code from your authenticator app at sign-in.">
          <Toggle
            checked={settings.security.twoFactorEnabled}
            onChange={(v) => updateSection('security', { twoFactorEnabled: v })}
          />
        </SettingRow>
      </SectionCard>

      <SectionCard title="Password">
        <SettingRow title="Change password" description="Last changed 3 months ago.">
          <Button variant="glass" size="sm" onClick={() => setPwModal(true)}>
            Change password
          </Button>
        </SettingRow>
      </SectionCard>

      <SectionCard title="Active sessions">
        <div className="session-list">
          {sessions.map((s) => (
            <div className="session-list__item" key={s.id}>
              <div>
                <span className="session-list__device">
                  {s.device} {s.current && <em>· this device</em>}
                </span>
                <span className="session-list__location">{s.location}</span>
              </div>
              {!s.current && (
                <button className="session-list__revoke" onClick={() => showToast('Session revoked', { type: 'info' })}>
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Trusted devices">
        <SettingRow title="This device" description="Trusted since today.">
          <span className="settings-badge">
            <RiShieldCheckLine /> Trusted
          </span>
        </SettingRow>
      </SectionCard>

      <Modal
        open={pwModal}
        onClose={() => setPwModal(false)}
        title="Change password"
        footer={
          <>
            <Button variant="ghost" onClick={() => setPwModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleChangePassword} disabled={saving || !current || !next}>
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </>
        }
      >
        <div className="settings-modal-form">
          <label>
            Current password
            <input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} />
          </label>
          <label>
            New password
            <input type="password" value={next} onChange={(e) => setNext(e.target.value)} />
          <small>At least 8 characters, uppercase, lowercase, number and symbol.</small>
          </label>
        </div>
      </Modal>
    </>
  );
}

// ---------------------------------------------------------------------------
export function AboutPanel() {
  return (
    <SectionCard title="About Aether">
      <SettingRow title="Version" description="You're on the latest release.">
        <span className="settings-badge">v1.4.0</span>
      </SettingRow>
      <SettingRow title="Check for updates" description="Last checked just now.">
        <Button variant="glass" size="sm">
          Check now
        </Button>
      </SettingRow>
      <SettingRow title="Changelog" description="See what's new in recent releases.">
        <Button variant="ghost" size="sm">
          View changelog
        </Button>
      </SettingRow>
      <SettingRow title="Open source licenses" description="Third-party packages used in Aether.">
        <Button variant="ghost" size="sm" icon={<RiGithubFill />}>
          View licenses
        </Button>
      </SettingRow>
    </SectionCard>
  );
}
