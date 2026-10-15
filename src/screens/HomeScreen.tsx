import {
  Camera,
  ChevronRight,
  FlaskConical,
  History,
  Home,
  MapPin,
  MoreHorizontal,
  ScanLine,
  Search,
  Sprout,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import potato from '../assets/crops/potato.png';
import tomato from '../assets/crops/tomato.png';
import chilli from '../assets/crops/chilli.png';
import corn from '../assets/crops/corn.png';
import loyaltyIcon from '../assets/icons/loyalty.png';

const MY_CROPS = [
  { label: 'Potato', image: potato },
  { label: 'Tomato', image: tomato },
  { label: 'Chilli', image: chilli },
  { label: 'Corn', image: corn },
  { label: 'Chilli', image: chilli },
];

const NAV = [
  { label: 'Home', icon: Home, active: true },
  { label: 'My Crops', icon: Sprout },
  { label: 'Community', icon: Users },
  { label: 'Near me', icon: MapPin },
  { label: 'More', icon: MoreHorizontal },
];

/**
 * W01 · Cropwise Home.
 * This is the existing native home screen — only the Loyalty card and the Savera
 * service tile are part of this project. Everything else is static context.
 */
export function HomeScreen() {
  return (
    <div className="flex h-full flex-col bg-app font-sans">
      <main className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-4 pb-6 pt-14">
        <h2 className="text-lg font-semibold">My Crops</h2>
        <ul className="mt-3 flex justify-between">
          {MY_CROPS.map((crop, i) => (
            <li key={i} className="flex flex-col items-center gap-1.5 text-[13px]">
              <img src={crop.image} alt="" className="size-14 rounded-full" />
              {crop.label}
            </li>
          ))}
        </ul>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <StaticButton className="border border-dashed border-brand text-brand">Add Crop</StaticButton>
          <StaticButton className="bg-brand text-white">Enroll Crop</StaticButton>
        </div>

        <section className="mt-5 rounded-xl bg-white p-4 shadow-sm">
          <h2 className="text-[15px] font-semibold">Crop Doctor</h2>
          <div className="mt-3 flex items-center justify-between px-2 text-[13px]">
            <Step icon={<Camera className="size-5 text-brand" />} label="Snap" />
            <ChevronRight className="size-3 text-neutral-400" />
            <Step icon={<Search className="size-5 text-brand" />} label="Diagnosis" />
            <ChevronRight className="size-3 text-neutral-400" />
            <Step icon={<FlaskConical className="size-5 text-brand" />} label="Solution" />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <StaticButton className="!h-9 !rounded-full bg-[#0b6fd6] !text-[13px] text-white">
              <ScanLine className="size-3.5" /> Scan Plant
            </StaticButton>
            <StaticButton className="!h-9 !rounded-full border border-[#0b6fd6] !text-[13px] text-[#0b6fd6]">
              <History className="size-3.5" /> History
            </StaticButton>
          </div>
        </section>

        {/* ── Loyalty entry point ── */}
        <h2 className="mt-6 text-lg font-semibold">Loyalty</h2>
        <section className="mt-3 rounded-xl border border-brand/40 bg-brand-tint p-3">
          <Link to="/loyalty" className="flex items-center gap-3 px-1 py-2 text-[15px]">
            <img src={loyaltyIcon} alt="" className="size-9 rounded" />
            View Points
            <ChevronRight className="ml-auto size-4" />
          </Link>
          <Link
            to="/loyalty?section=shop"
            className="mt-2 flex h-11 items-center justify-center rounded-md bg-brand text-[15px] font-semibold text-white"
          >
            Shop &amp; Redeem
          </Link>
        </section>

        <div className="mt-6 flex items-baseline justify-between">
          <h2 className="text-lg font-semibold">Services</h2>
          <span className="text-sm font-semibold text-brand">See More</span>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <Link
            to="/savera"
            className="flex h-11 items-center justify-center rounded-md bg-brand text-sm font-semibold text-white"
          >
            Savera
          </Link>
          <StaticButton className="bg-brand !text-sm text-white">Pest Disease</StaticButton>
          <StaticButton className="bg-brand !text-sm text-white">Community</StaticButton>
        </div>
      </main>

      <nav className="grid shrink-0 grid-cols-5 bg-[#454a5c] pb-4 pt-2 text-[11px] text-white/60">
        {NAV.map(({ label, icon: Icon, active }) => (
          <span
            key={label}
            className={`flex flex-col items-center gap-1 ${active ? 'text-white' : ''}`}
          >
            <Icon className="size-4" />
            {label}
          </span>
        ))}
      </nav>
    </div>
  );
}

/** Existing Cropwise features that are out of scope: rendered for context, not interactive. */
function StaticButton({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return (
    <span
      aria-disabled="true"
      className={`flex h-11 items-center justify-center gap-1.5 rounded-md text-[15px] font-semibold ${className}`}
    >
      {children}
    </span>
  );
}

function Step({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="flex flex-col items-center gap-1">
      {icon}
      {label}
    </span>
  );
}
