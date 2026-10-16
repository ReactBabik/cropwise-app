import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Link } from 'react-router-dom';
import avatar from '../assets/savera/avatar-small.png';

const SEEN_KEY = 'savera-hint-seen';
const HINT_MS = 5000;

function hintAlreadySeen(): boolean {
  try {
    return sessionStorage.getItem(SEEN_KEY) === '1';
  } catch {
    return false;
  }
}

/**
 * S01 · Savera entry point on the Loyalty page (W02).
 *
 * Kept deliberately small so it never covers the QR or its buttons: a 48px avatar docked in
 * the bottom-right corner above the bottom bar. The "Need crop advice?" hint shows once per
 * session, sits directly above the avatar, and fades out on its own after 5 seconds.
 */
export function SaveraBubble() {
  const [showHint, setShowHint] = useState(() => !hintAlreadySeen());

  useEffect(() => {
    if (!showHint) return;
    try {
      sessionStorage.setItem(SEEN_KEY, '1');
    } catch {
      // Without storage the hint simply shows again next visit.
    }
    const t = window.setTimeout(() => setShowHint(false), HINT_MS);
    return () => window.clearTimeout(t);
  }, [showHint]);

  return (
    <div className="pointer-events-none absolute bottom-[88px] right-3 z-20 flex flex-col items-end gap-2 font-sans">
      {showHint && (
        <div className="savera-hint pointer-events-auto relative flex items-center gap-1 rounded-xl bg-navy py-1.5 pl-3 pr-1 text-white shadow-lg">
          <Link to="/savera" className="text-xs leading-tight">
            <span className="font-semibold">Ask Savera</span>
            <span className="block text-white/80">Need crop advice?</span>
          </Link>
          <button
            type="button"
            aria-label="Dismiss"
            onClick={() => setShowHint(false)}
            className="grid size-7 place-items-center text-white/70"
          >
            <X className="size-3.5" />
          </button>
          {/* tail pointing at the avatar */}
          <span className="absolute -bottom-1 right-5 size-2.5 rotate-45 bg-navy" />
        </div>
      )}

      <Link
        to="/savera"
        aria-label="Ask Savera, AI crop advisor"
        className="pointer-events-auto relative block size-12 rounded-full ring-2 ring-white shadow-[0_4px_12px_rgba(0,0,0,0.25)]"
      >
        <img src={avatar} alt="" className="size-full rounded-full object-cover" />
        <span className="absolute -right-0.5 -top-0.5 size-3 rounded-full border-2 border-white bg-brand" />
      </Link>
    </div>
  );
}
