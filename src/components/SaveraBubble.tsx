import { useState } from 'react';
import { X } from 'lucide-react';
import { Link } from 'react-router-dom';
import avatar from '../assets/savera/avatar-large.png';

/**
 * S01 · Savera avatar + pop-up, floating over the Loyalty page (W02).
 * The speech bubble and the avatar can be dismissed separately; both open Ask Savera (S02).
 */
export function SaveraBubble() {
  const [showPopup, setShowPopup] = useState(true);
  const [showAvatar, setShowAvatar] = useState(true);

  if (!showAvatar) return null;

  return (
    <div className="pointer-events-none absolute bottom-[84px] right-2 z-20 flex items-end font-sans">
      {showPopup && (
        <div className="pointer-events-auto relative mb-2 mr-1 rounded-2xl bg-white py-2 pl-4 pr-9 shadow-[0_4px_16px_rgba(0,0,0,0.18)]">
          <Link to="/savera" className="block">
            <p className="text-sm font-bold text-navy">Ask Savera</p>
            <p className="text-[13px] text-ink/80">Need crop advice? Ask me.</p>
          </Link>
          <button
            type="button"
            aria-label="Dismiss Ask Savera message"
            onClick={() => setShowPopup(false)}
            className="absolute right-1 top-1 grid size-8 place-items-center text-muted"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      <div className="pointer-events-auto relative">
        <Link to="/savera" aria-label="Ask Savera, AI crop advisor">
          <img src={avatar} alt="" className="h-[84px] w-auto drop-shadow-md" />
        </Link>
        <button
          type="button"
          aria-label="Hide Savera"
          onClick={() => setShowAvatar(false)}
          className="absolute -right-1 -top-1 grid size-6 place-items-center rounded-full border border-line bg-white text-ink shadow"
        >
          <X className="size-3" />
        </button>
      </div>
    </div>
  );
}
