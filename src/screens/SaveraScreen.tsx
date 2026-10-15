import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Mic, SendHorizontal } from 'lucide-react';
import { AppHeader } from '../components/Screen';
import avatar from '../assets/savera/avatar-small.png';

interface Message {
  from: 'savera' | 'user';
  text: string;
}

const GREETING =
  'Assalam-o-Alaikum! I am Savera, your AI agri expert from Syngenta. I’m here to help you with all your crop-related questions, including plant diseases, insect pests, nutrient deficiencies, crop management, Syngenta products, their proper usage, and information about Naya Savera franchises.';

// PROTOTYPE: a fixed reply. Production opens the existing Cropwise "Ask Savera" screen / service.
const STUB_REPLY =
  'Thanks for your question. In the live app I’ll answer this using Savera’s crop advisory service — this prototype only shows how the chat opens from the Loyalty page.';

/** S02 · Ask Savera chat (the existing Cropwise screen, opened from the Loyalty page). */
export function SaveraScreen() {
  const [messages, setMessages] = useState<Message[]>([{ from: 'savera', text: GREETING }]);
  const [draft, setDraft] = useState('');
  const endRef = useRef<HTMLDivElement>(null);
  const replyTimer = useRef<number>();

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [messages]);
  useEffect(() => () => window.clearTimeout(replyTimer.current), []);

  const send = (e: FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setMessages((m) => [...m, { from: 'user', text }]);
    setDraft('');
    replyTimer.current = window.setTimeout(
      () => setMessages((m) => [...m, { from: 'savera', text: STUB_REPLY }]),
      700,
    );
  };

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  return (
    <div className="flex h-full flex-col bg-white font-sans">
      <AppHeader title="Ask Savera" centered right="none" />

      <main className="no-scrollbar min-h-0 flex-1 overflow-y-auto">
        <div className="flex min-h-full flex-col justify-end gap-3 px-3 py-4">
          <p className="text-center text-xs font-semibold">{today}</p>
          {messages.map((m, i) =>
            m.from === 'savera' ? (
              <div key={i} className="flex items-start gap-2">
                <img src={avatar} alt="Savera" className="size-8 shrink-0 rounded-full object-cover" />
                <p className="rounded-2xl border border-neutral-200 bg-neutral-100 px-3.5 py-3 text-sm leading-relaxed">
                  {m.text}
                </p>
              </div>
            ) : (
              <p
                key={i}
                className="ml-12 self-end rounded-2xl bg-navy px-3.5 py-3 text-sm leading-relaxed text-white"
              >
                {m.text}
              </p>
            ),
          )}
          <div ref={endRef} />
        </div>
      </main>

      <form onSubmit={send} className="flex shrink-0 items-center gap-2 border-t border-neutral-200 px-3 pb-5 pt-3">
        <div className="flex h-11 flex-1 items-center rounded-lg border border-neutral-300 pl-3">
          <input
            aria-label="Message Savera"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Type Something"
            className="min-w-0 flex-1 text-sm outline-none"
          />
          <button type="submit" aria-label="Send" disabled={!draft.trim()} className="grid size-11 place-items-center disabled:opacity-40">
            <SendHorizontal className="size-4" />
          </button>
        </div>
        <button
          type="button"
          disabled
          aria-label="Voice input (not available in the prototype)"
          title="Voice input isn't part of this prototype"
          className="grid size-11 shrink-0 place-items-center rounded-full bg-[#3b9be0] text-white"
        >
          <Mic className="size-5" />
        </button>
      </form>
    </div>
  );
}
