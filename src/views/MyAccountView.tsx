import React, { useState } from 'react';
import { User, Property, AuthSession } from '../types';
import { 
  User as UserIcon, 
  ShieldCheck, 
  HardDrive, 
  Lock, 
  LogOut, 
  Key, 
  Building2, 
  Smartphone, 
  Check, 
  AlertCircle,
  Eye,
  Sun,
  Moon,
  Sparkles,
  Glasses
} from 'lucide-react';
import { formatDate } from '../utils/formatters';
import { useTheme } from '../context/ThemeContext';

interface MyAccountViewProps {
  user: User;
  propertiesCount: number;
  onLogout: () => void;
  onOpenOwnerControl: () => void;
}

export const MyAccountView: React.FC<MyAccountViewProps> = ({
  user,
  propertiesCount,
  onLogout,
  onOpenOwnerControl,
}) => {
  const { theme, setTheme, eyeShield, toggleEyeShield, isNight } = useTheme();
  const [showSecretOwnerPrompt, setShowSecretOwnerPrompt] = useState(false);
  const [ownerKeyInput, setOwnerKeyInput] = useState('');
  const [ownerKeyError, setOwnerKeyError] = useState('');

  const handleOwnerAccessAttempt = (e: React.FormEvent) => {
    e.preventDefault();
    if (user.role === 'owner' || ownerKeyInput.trim() === 'propertyhub2026') {
      onOpenOwnerControl();
    } else {
      setOwnerKeyError('Incorrect owner administrative master key.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-28 space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl font-bold theme-text-main font-brand">
          Settings & Employee Account
        </h1>
        <p className="text-xs theme-text-secondary mt-0.5">
          Office employee profile, visual ergonomics, & device synchronization parameters
        </p>
      </div>

      {/* Visual Ergonomics & Eye-Care Section */}
      <div className="theme-bg-card border theme-border rounded-3xl p-6 theme-shadow space-y-4">
        <div className="flex items-center gap-3 pb-4 border-b theme-border">
          <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
            <Eye className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-base font-bold theme-text-main font-brand flex items-center gap-2">
              <span>Eye-Care & Visual Ergonomics</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 font-bold">
                EYE FRIENDLY ACTIVE
              </span>
            </h2>
            <p className="text-xs theme-text-secondary mt-0.5">
              Specially calibrated warm tones to eliminate screen glare, prevent eye fatigue, and minimize blue light strain.
            </p>
          </div>
        </div>

        {/* Theme Mode Selection Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Warm Paper Day Mode */}
          <button
            type="button"
            onClick={() => setTheme('warm-paper')}
            className={`p-4 rounded-2xl border text-left transition-all ${
              theme === 'warm-paper'
                ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-500 shadow-xs'
                : 'theme-bg-subtle theme-border hover:border-amber-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sun className={`w-4 h-4 ${theme === 'warm-paper' ? 'text-amber-700' : 'theme-text-tertiary'}`} />
                <span className="text-sm font-bold theme-text-main">Soft Warm Paper</span>
              </div>
              {theme === 'warm-paper' && (
                <span className="w-2 h-2 rounded-full bg-amber-600" />
              )}
            </div>
            <p className="text-xs theme-text-secondary mt-1.5 leading-relaxed">
              Anti-glare warm cream palette. Recommended for office and daylight work to prevent pupil contraction.
            </p>
          </button>

          {/* Soothing Twilight Night Mode */}
          <button
            type="button"
            onClick={() => setTheme('soothing-twilight')}
            className={`p-4 rounded-2xl border text-left transition-all ${
              theme === 'soothing-twilight'
                ? 'bg-slate-800/80 border-amber-400 shadow-xs'
                : 'theme-bg-subtle theme-border hover:border-amber-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Moon className={`w-4 h-4 ${theme === 'soothing-twilight' ? 'text-amber-400' : 'theme-text-tertiary'}`} />
                <span className="text-sm font-bold theme-text-main">Soothing Twilight</span>
              </div>
              {theme === 'soothing-twilight' && (
                <span className="w-2 h-2 rounded-full bg-amber-400" />
              )}
            </div>
            <p className="text-xs theme-text-secondary mt-1.5 leading-relaxed">
              Warm charcoal night palette with amber accents. Prevents dark-room glare and avoids pitch-black astigmatism halo.
            </p>
          </button>
        </div>

        {/* Eye Shield Toggle */}
        <div className="pt-2 flex items-center justify-between p-3.5 rounded-xl theme-bg-subtle border theme-border">
          <div className="flex items-center gap-2.5">
            <Glasses className="w-4 h-4 text-amber-700 dark:text-amber-400" />
            <div>
              <div className="text-xs font-semibold theme-text-main">
                Eye Shield (Blue Light Barrier)
              </div>
              <div className="text-[11px] theme-text-secondary">
                Softens harsh spectral spikes with an extra warm optical tint for long data-entry sessions.
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleEyeShield}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              eyeShield ? 'bg-amber-600' : 'bg-stone-300 dark:bg-stone-700'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                eyeShield ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Account Info Card */}
      <div className="theme-bg-card border theme-border rounded-3xl p-6 theme-shadow space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b theme-border">
          <div className="w-14 h-14 rounded-2xl bg-amber-600 dark:bg-amber-500 text-white font-bold font-mono text-xl flex items-center justify-center shadow-md shadow-amber-600/20">
            {user.username.replace('EMP-', '') || 'U'}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold theme-text-main font-brand">
                {user.full_name}
              </h2>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30">
                {user.role === 'owner' ? 'EXECUTIVE' : 'OFFICE EMPLOYEE'}
              </span>
            </div>
            <p className="text-xs theme-text-secondary font-mono mt-0.5">
              Employee ID: <strong className="theme-text-main">{user.username}</strong> · User ID: {user.user_id}
            </p>
          </div>
        </div>

        {/* Profile Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl theme-bg-subtle border theme-border">
            <span className="theme-text-tertiary text-[11px] block">Assigned Role</span>
            <span className="text-sm font-semibold theme-text-main mt-0.5 block">
              {user.role === 'owner' ? 'System Director / Owner' : 'Real Estate Employee'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl theme-bg-subtle border theme-border">
            <span className="theme-text-tertiary text-[11px] block">Private Properties Listed</span>
            <span className="text-sm font-semibold text-amber-800 dark:text-amber-300 font-brand mt-0.5 block">
              {propertiesCount} Records Isolated to You
            </span>
          </div>

          <div className="p-3.5 rounded-xl theme-bg-subtle border theme-border">
            <span className="theme-text-tertiary text-[11px] block">Data Privacy Mode</span>
            <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 mt-0.5 block flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Full Isolation Active</span>
            </span>
          </div>

          <div className="p-3.5 rounded-xl theme-bg-subtle border theme-border">
            <span className="theme-text-tertiary text-[11px] block">Offline Database</span>
            <span className="text-sm font-semibold theme-text-main mt-0.5 block">
              IndexedDB Storage Sync
            </span>
          </div>
        </div>

        {/* Account Security Policy */}
        <div className="p-4 rounded-2xl theme-bg-subtle border theme-border text-xs theme-text-secondary space-y-1.5">
          <div className="font-semibold theme-text-main">Office Security Rules:</div>
          <p>• User data is strictly isolated: other employees cannot access or view your housing records.</p>
          <p>• Passwords and accounts are managed through the central office administration.</p>
          <p>• No phone numbers or external customer contact details are stored in this system.</p>
        </div>

        {/* Logout Action */}
        <div className="pt-2 flex items-center justify-between">
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition shadow-xs active:scale-95"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out of Account</span>
          </button>
        </div>
      </div>

      {/* Discrete Owner Backend Access */}
      <div className="pt-4 border-t theme-border text-center">
        {user.role === 'owner' ? (
          <button
            onClick={onOpenOwnerControl}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-100 dark:bg-amber-950/40 hover:bg-amber-200 dark:hover:bg-amber-900/50 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700 text-xs font-semibold transition"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Open Executive Owner Console</span>
          </button>
        ) : (
          <div>
            {!showSecretOwnerPrompt ? (
              <button
                onClick={() => setShowSecretOwnerPrompt(true)}
                className="text-[11px] theme-text-tertiary hover:theme-text-main transition"
              >
                Executive Owner Access Portal
              </button>
            ) : (
              <form onSubmit={handleOwnerAccessAttempt} className="max-w-xs mx-auto p-4 rounded-xl theme-bg-card border theme-border space-y-3">
                <div className="text-xs font-bold theme-text-main font-brand">
                  Owner Administrative Key
                </div>
                <input
                  type="password"
                  value={ownerKeyInput}
                  onChange={(e) => setOwnerKeyInput(e.target.value)}
                  placeholder="Enter Master Password"
                  className="w-full px-3 py-1.5 theme-bg-subtle border theme-border rounded-lg text-xs theme-text-main focus:outline-none focus:border-amber-500"
                />
                {ownerKeyError && (
                  <p className="text-[10px] text-rose-600 dark:text-rose-400">{ownerKeyError}</p>
                )}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => { setShowSecretOwnerPrompt(false); setOwnerKeyError(''); }}
                    className="flex-1 py-1.5 rounded theme-bg-subtle text-[11px] theme-text-main border theme-border"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-1.5 rounded bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold"
                  >
                    Unlock
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
