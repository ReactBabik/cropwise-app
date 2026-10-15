import { useCallback, useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, RefreshCw } from 'lucide-react';
import { generateRedemptionCode, LOYALTY_RULES } from '../lib/loyalty';
import { useToast } from './Toast';

const TTL: number = LOYALTY_RULES.redemptionCodeTtlSeconds;

/**
 * Rotating single-use counter code (W02). The cashier scans the QR or types the code into
 * POS "Cropwise ID / QR code" (P03); an expired code gives POS state P·E5.
 *
 * PROTOTYPE: the code is generated on the device. In production the app must request it
 * from the backend (POST /loyalty/redemption-codes) so POS can verify and burn it.
 */
export function RedemptionQrCard() {
  const toast = useToast();
  const [code, setCode] = useState(() => generateRedemptionCode());
  const [secondsLeft, setSecondsLeft] = useState(TTL);

  const refresh = useCallback(() => {
    setCode(generateRedemptionCode());
    setSecondsLeft(TTL);
  }, []);

  useEffect(() => {
    const tick = window.setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => window.clearInterval(tick);
  }, []);

  useEffect(() => {
    if (secondsLeft <= 0) refresh();
  }, [secondsLeft, refresh]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      toast('Code copied');
    } catch {
      toast('Copy not available — read the code out');
    }
  };

  return (
    <section className="rounded-2xl bg-white px-4 pb-5 pt-5 font-sans shadow-[0_8px_24px_rgba(10,10,92,0.12)]">
      <h2 className="text-center text-[15px] font-bold text-navy">
        Show this QR at any Naya Savera counter
      </h2>

      <div className="mx-auto mt-3 w-fit rounded-xl border border-line p-3">
        <QRCodeSVG
          value={code}
          size={188}
          level="M"
          fgColor="#0a0a5c"
          title={`Loyalty QR code ${code}`}
        />
      </div>

      <p className="mt-4 text-center text-[13px] text-muted">Can't scan? Tell the cashier this code</p>
      <div className="mt-1 flex items-center justify-center gap-3">
        <span className="text-[26px] font-bold tracking-[0.14em] text-navy">{code}</span>
        <button
          type="button"
          onClick={copy}
          className="flex items-center gap-1 text-sm font-semibold text-brand"
        >
          <Copy className="size-3.5" />
          Copy
        </button>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
        <p className="text-sm text-muted">
          New code in{' '}
          <span className="font-bold tabular-nums text-navy">
            0:{String(Math.max(secondsLeft, 0)).padStart(2, '0')}
          </span>
        </p>
        <button
          type="button"
          onClick={refresh}
          className="flex h-10 items-center gap-1.5 rounded-md bg-brand-deep px-4 text-sm font-semibold text-white"
        >
          <RefreshCw className="size-3.5" />
          Refresh
        </button>
      </div>

      <p className="mt-3 text-center text-xs leading-relaxed text-muted">
        A new single-use code is created every time — no extra verification at the counter.
      </p>
    </section>
  );
}
