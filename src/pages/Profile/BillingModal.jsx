import { RiCheckLine, RiDownload2Line } from 'react-icons/ri';
import Modal from '../../components/Common/Modal.jsx';
import Button from '../../components/Common/Button.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import './BillingModal.scss';

// Dummy billing data — replace with real calls to your billing provider
// (e.g. GET /account/billing, /account/invoices) once connected.
const CURRENT_PLAN = { name: 'Pro', price: '$24/mo', renews: 'August 8, 2026' };
const USAGE = { used: 4_215_309, limit: 10_000_000 };
const INVOICES = [
  { id: 'inv_1042', date: 'Jun 8, 2026', amount: '$24.00', status: 'Paid' },
  { id: 'inv_1031', date: 'May 8, 2026', amount: '$24.00', status: 'Paid' },
  { id: 'inv_1020', date: 'Apr 8, 2026', amount: '$24.00', status: 'Paid' },
];

export default function BillingModal({ open, onClose }) {
  const { showToast } = useToast();
  const usagePct = Math.min(100, Math.round((USAGE.used / USAGE.limit) * 100));

  return (
    <Modal open={open} onClose={onClose} title="Billing" size="lg">
      <div className="billing">
        <div className="billing__plan">
          <div>
            <span className="billing__plan-name">{CURRENT_PLAN.name} plan</span>
            <span className="billing__plan-renews">Renews {CURRENT_PLAN.renews}</span>
          </div>
          <div className="billing__plan-price">{CURRENT_PLAN.price}</div>
        </div>

        <div className="billing__actions">
          <Button variant="primary" size="sm" onClick={() => showToast('Redirecting to plan options…', { type: 'info' })}>
            Change plan
          </Button>
          <Button variant="ghost" size="sm" onClick={() => showToast('Redirecting to payment method…', { type: 'info' })}>
            Update payment method
          </Button>
        </div>

        <div className="billing__usage">
          <div className="billing__usage-row">
            <span>Token usage this cycle</span>
            <span>
              {USAGE.used.toLocaleString()} / {USAGE.limit.toLocaleString()}
            </span>
          </div>
          <div className="billing__usage-bar">
            <div className="billing__usage-fill" style={{ width: `${usagePct}%` }} />
          </div>
        </div>

        <div className="billing__features">
          {['Unlimited chats', 'Priority response speed', '10M tokens / month', 'Team workspaces'].map((f) => (
            <span key={f}>
              <RiCheckLine /> {f}
            </span>
          ))}
        </div>

        <h4 className="billing__section-title">Invoice history</h4>
        <ul className="billing__invoices">
          {INVOICES.map((inv) => (
            <li key={inv.id}>
              <span className="billing__invoice-date">{inv.date}</span>
              <span className="billing__invoice-amount">{inv.amount}</span>
              <span className="billing__invoice-status">{inv.status}</span>
              <button
                className="billing__invoice-download"
                onClick={() => showToast('Invoice download is a demo action', { type: 'info' })}
                aria-label="Download invoice"
              >
                <RiDownload2Line />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </Modal>
  );
}
