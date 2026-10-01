import React, { useState } from 'react';
import { BrandLogo } from '../components/BrandLogo';
import { AuthSession } from '../types';
import { api, ApiError } from '../services/api';
import { saveSessionLocally, getCachedSessionLocally } from '../services/db';
import { 
  Lock, 
  User as UserIcon, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  WifiOff, 
  CheckCircle2, 
  Sun, 
  Moon, 
  Glasses,
  Phone,
  Mail,
  Building,
  Send,
  MessageCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import { PWAInstallButton } from '../components/PWAInstallButton';
import { useTheme } from '../context/ThemeContext';

interface LoginViewProps {
  onLoginSuccess: (session: AuthSession) => void;
  isOnline: boolean;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess, isOnline }) => {
  const { toggleTheme, eyeShield, toggleEyeShield, isNight } = useTheme();
  const [activeTab, setActiveTab] = useState<'login' | 'request_access'>('login');
  
  // Login form state
  const [username, setUsername] = useState('EMP-101');
  const [password, setPassword] = useState('emp101password');
  const [showPassword, setShowPassword] = useState(false);
  
  // Request Access form state
  const [reqFullName, setReqFullName] = useState('');
  const [reqPhone, setReqPhone] = useState('');
  const [reqEmail, setReqEmail] = useState('');
  const [reqAgency, setReqAgency] = useState('');
  const [reqCity, setReqCity] = useState('Lahore');
  const [reqUsername, setReqUsername] = useState('');
  const [reqPassword, setReqPassword] = useState('');
  const [reqConfirmPassword, setReqConfirmPassword] = useState('');
  const [showReqPassword, setShowReqPassword] = useState(false);

  // Status & notifications
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [pendingApprovalData, setPendingApprovalData] = useState<{
    owner_email: string;
    owner_whatsapp: string;
  } | null>(null);

  // Access request submitted state
  const [requestSubmittedData, setRequestSubmittedData] = useState<{
    full_name: string;
    phone: string;
    username: string;
    owner_email: string;
    owner_whatsapp: string;
    whatsapp_link: string;
    mailto_link: string;
  } | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setErrorMsg('Please enter both Username and Password');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    setPendingApprovalData(null);

    try {
      if (isOnline) {
        const response = await api.login(username.trim(), password);
        const session: AuthSession = {
          user: response.user,
          token: response.token,
          expires_at: response.expires_at,
        };
        localStorage.setItem('property_hub_token', response.token);
        localStorage.setItem('property_hub_current_user_id', response.user.user_id);
        await saveSessionLocally(session);
        onLoginSuccess(session);
      } else {
        const cached = await getCachedSessionLocally();
        if (cached && cached.user.username.toLowerCase() === username.trim().toLowerCase()) {
          onLoginSuccess(cached);
        } else {
          setErrorMsg('Offline mode: You can only sign into previously verified accounts on this device.');
        }
      }
    } catch (err: any) {
      console.error('Login error', err);
      if (err instanceof ApiError) {
        if (err.message.includes('verification') || err.message.includes('pending') || err.message.includes('deactivated')) {
          setPendingApprovalData({
            owner_email: 'sacc5038@gmail.com',
            owner_whatsapp: '+92 3082665978',
          });
        }
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Unable to connect to server. Please check your credentials or network connection.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestAccessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqFullName.trim() || !reqPhone.trim() || !reqEmail.trim() || !reqUsername.trim() || !reqPassword) {
      setErrorMsg('Please complete all required fields (Name, Phone/WhatsApp, Email, Username, Password)');
      return;
    }

    if (reqPassword !== reqConfirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }

    if (!isOnline) {
      setErrorMsg('An active Internet connection is required to submit your access request.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const response = await api.requestAccess({
        full_name: reqFullName.trim(),
        phone: reqPhone.trim(),
        email: reqEmail.trim(),
        agency_name: reqAgency.trim(),
        city: reqCity.trim(),
        desired_username: reqUsername.trim(),
        password: reqPassword,
      });

      setRequestSubmittedData({
        full_name: reqFullName.trim(),
        phone: reqPhone.trim(),
        username: reqUsername.trim(),
        owner_email: response.owner_email || 'sacc5038@gmail.com',
        owner_whatsapp: response.owner_whatsapp || '+92 3082665978',
        whatsapp_link: response.whatsapp_link,
        mailto_link: response.mailto_link,
      });

      setReqPassword('');
      setReqConfirmPassword('');
    } catch (err: any) {
      console.error('Request access error', err);
      if (err instanceof ApiError) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Unable to submit request. Network or server error.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillOwner = () => {
    setActiveTab('login');
    setUsername('owner');
    setPassword('propertyhub2026');
    setErrorMsg('');
    setPendingApprovalData(null);
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center px-3 sm:px-4 py-6 sm:py-8 theme-bg-main relative overflow-hidden transition-colors duration-200">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 -left-32 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top controls: Eye-Care mode toggle & Install */}
      <div className="absolute top-3 sm:top-4 right-3 sm:right-4 z-10 flex items-center gap-1.5 sm:gap-2">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl border theme-border theme-bg-subtle text-amber-700 dark:text-amber-400 active:scale-95 transition min-h-[40px] min-w-[40px] flex items-center justify-center"
          title={isNight ? 'Switch to Soft Warm Day' : 'Switch to Soothing Twilight'}
        >
          {isNight ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-amber-700" />}
        </button>

        <button
          onClick={toggleEyeShield}
          className={`p-2 rounded-xl border text-xs font-medium transition min-h-[40px] min-w-[40px] flex items-center justify-center ${
            eyeShield
              ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40 shadow-xs'
              : 'theme-border theme-text-tertiary hover:theme-text-main hover:bg-black/5 dark:hover:bg-white/5'
          }`}
          title={eyeShield ? 'Eye Shield Filter Active' : 'Enable Eye Shield'}
        >
          <Glasses className="w-4 h-4" />
        </button>

        <PWAInstallButton compact />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Main Logo & Identity Header: Exact Official Brand Logo */}
        <div className="flex justify-center mb-5 sm:mb-6">
          <BrandLogo size="md" />
        </div>

        {/* Main Card */}
        <div className="theme-bg-card border theme-border rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-xl theme-shadow transition-colors">
          {/* SUCCESS SCREEN: REQUEST SUBMITTED */}
          {requestSubmittedData ? (
            <div className="text-center py-4 space-y-4 animate-in fade-in">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center border-2 border-emerald-400">
                <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
              </div>

              <div>
                <h2 className="text-lg sm:text-xl font-bold theme-text-main font-brand">
                  Access Request Submitted
                </h2>
                <p className="text-xs text-emerald-800 dark:text-emerald-400 font-semibold mt-1">
                  Your registration details have been received
                </p>
              </div>

              <div className="p-3.5 rounded-2xl theme-bg-subtle border theme-border text-left text-xs space-y-2">
                <div className="flex items-center justify-between pb-2 border-b theme-border">
                  <span className="theme-text-secondary">Applicant Name:</span>
                  <span className="font-bold theme-text-main">{requestSubmittedData.full_name}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b theme-border">
                  <span className="theme-text-secondary">Phone / WhatsApp:</span>
                  <span className="font-mono font-semibold theme-text-main">{requestSubmittedData.phone}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b theme-border">
                  <span className="theme-text-secondary">Requested Username:</span>
                  <span className="font-mono font-bold text-amber-700 dark:text-amber-400">{requestSubmittedData.username}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="theme-text-secondary">Status:</span>
                  <span className="inline-flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                    Awaiting Approval
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-left text-xs theme-text-main">
                <p className="font-semibold text-amber-900 dark:text-amber-300 flex items-center gap-1.5 mb-1">
                  <Clock className="w-4 h-4" />
                  <span>Next Step:</span>
                </p>
                <p className="text-[11px] leading-relaxed theme-text-secondary">
                  Your registration details have been dispatched to Administration. Click the WhatsApp button below to message Administration directly for instant account activation.
                </p>
              </div>

              {/* Action Buttons for Applicant */}
              <div className="space-y-2 pt-2">
                {requestSubmittedData.whatsapp_link && (
                  <a
                    href={requestSubmittedData.whatsapp_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 active:scale-95 transition min-h-[44px]"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Send Details to Administration via WhatsApp</span>
                  </a>
                )}

                <a
                  href={requestSubmittedData.mailto_link}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl theme-bg-subtle hover:bg-black/5 dark:hover:bg-white/5 border theme-border font-semibold text-xs theme-text-main transition min-h-[42px]"
                >
                  <Mail className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                  <span>Contact Support via Email</span>
                </a>

                <button
                  type="button"
                  onClick={() => {
                    setRequestSubmittedData(null);
                    setActiveTab('login');
                    setUsername(requestSubmittedData.username);
                  }}
                  className="w-full py-2 text-xs font-semibold theme-text-secondary hover:theme-text-main transition"
                >
                  &larr; Back to Sign In
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Tabs: Sign In / Request Access */}
              <div className="grid grid-cols-2 gap-1 p-1 theme-bg-subtle rounded-xl mb-5 border theme-border">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('login');
                    setErrorMsg('');
                    setSuccessMsg('');
                    setPendingApprovalData(null);
                  }}
                  className={`py-2 text-xs font-bold rounded-lg transition ${
                    activeTab === 'login'
                      ? 'bg-amber-600 dark:bg-amber-500 text-white shadow-xs'
                      : 'theme-text-secondary hover:theme-text-main'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('request_access');
                    setErrorMsg('');
                    setSuccessMsg('');
                    setPendingApprovalData(null);
                  }}
                  className={`py-2 text-xs font-bold rounded-lg transition ${
                    activeTab === 'request_access'
                      ? 'bg-amber-600 dark:bg-amber-500 text-white shadow-xs'
                      : 'theme-text-secondary hover:theme-text-main'
                  }`}
                >
                  Request Access
                </button>
              </div>

              <div className="mb-4">
                <h1 className="text-lg sm:text-xl font-bold theme-text-main tracking-tight font-brand">
                  {activeTab === 'login' ? 'Portal Sign In' : 'Request Portal Access'}
                </h1>
                <p className="text-xs theme-text-secondary mt-0.5">
                  {activeTab === 'login' 
                    ? 'Enter your credentials to manage your property listings' 
                    : 'Submit your profile to request access to the MSA portal'}
                </p>
              </div>

              {!isOnline && (
                <div className="mb-4 p-3 rounded-xl bg-amber-100 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
                  <WifiOff className="w-4 h-4 shrink-0 mt-0.5 text-amber-700 dark:text-amber-400" />
                  <div>
                    <span className="font-semibold">Device is Offline</span>
                    <p className="text-[11px] opacity-80 mt-0.5">
                      You can sign in with your previously authenticated credentials on this device.
                    </p>
                  </div>
                </div>
              )}

              {/* PENDING APPROVAL ALERT BOX */}
              {pendingApprovalData && (
                <div className="mb-4 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 space-y-2.5 text-xs text-amber-950 dark:text-amber-200 animate-in fade-in">
                  <div className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-amber-900 dark:text-amber-300">
                        Account Pending Administrative Verification
                      </h4>
                      <p className="text-[11px] mt-0.5 leading-relaxed">
                        Your account has been registered and is currently awaiting administrative approval. Please contact administration to expedite your activation.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 pt-1 border-t border-amber-200 dark:border-amber-800/60">
                    <a
                      href={`https://wa.me/${pendingApprovalData.owner_whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Hello Administration, please verify and activate my account: ' + username)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Contact Administration on WhatsApp</span>
                    </a>
                    <a
                      href={`mailto:${pendingApprovalData.owner_email}?subject=${encodeURIComponent('Account Activation Request: ' + username)}`}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl theme-bg-card border theme-border font-semibold text-xs theme-text-main transition"
                    >
                      <Mail className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                      <span>Email Administration Support</span>
                    </a>
                  </div>
                </div>
              )}

              {errorMsg && !pendingApprovalData && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs font-medium">
                  {errorMsg}
                </div>
              )}

              {successMsg && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-300 text-xs font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* SIGN IN FORM */}
              {activeTab === 'login' ? (
                <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold theme-text-secondary mb-1">
                      Username / Employee ID
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none theme-text-tertiary">
                        <UserIcon className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="e.g. EMP-101 or owner"
                        required
                        className="w-full pl-10 pr-4 py-2.5 theme-bg-subtle border theme-border rounded-xl theme-text-main placeholder:text-stone-400 text-sm focus:outline-none focus:border-amber-500 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold theme-text-secondary mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none theme-text-tertiary">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password"
                        required
                        className="w-full pl-10 pr-11 py-2.5 theme-bg-subtle border theme-border rounded-xl theme-text-main placeholder:text-stone-400 text-sm focus:outline-none focus:border-amber-500 transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center theme-text-tertiary hover:theme-text-main"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-2 py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600 text-white font-bold text-sm tracking-wide transition-all shadow-md shadow-amber-600/20 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 min-h-[44px]"
                  >
                    {isLoading ? (
                      <span>Signing in...</span>
                    ) : (
                      <>
                        <span>Sign In</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* REQUEST ACCESS FORM */
                <form onSubmit={handleRequestAccessSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold theme-text-secondary mb-1">
                      Full Name *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none theme-text-tertiary">
                        <UserIcon className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="text"
                        value={reqFullName}
                        onChange={(e) => setReqFullName(e.target.value)}
                        placeholder="e.g. Tariq Mehmood"
                        required
                        className="w-full pl-9 pr-3 py-2 theme-bg-subtle border theme-border rounded-xl theme-text-main placeholder:text-stone-400 text-sm focus:outline-none focus:border-amber-500 transition"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-xs font-semibold theme-text-secondary mb-1">
                        Phone / WhatsApp *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none theme-text-tertiary">
                          <Phone className="w-3.5 h-3.5" />
                        </div>
                        <input
                          type="tel"
                          value={reqPhone}
                          onChange={(e) => setReqPhone(e.target.value)}
                          placeholder="0300-1234567"
                          required
                          className="w-full pl-9 pr-3 py-2 theme-bg-subtle border theme-border rounded-xl theme-text-main placeholder:text-stone-400 text-sm focus:outline-none focus:border-amber-500 transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold theme-text-secondary mb-1">
                        Email Address *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none theme-text-tertiary">
                          <Mail className="w-3.5 h-3.5" />
                        </div>
                        <input
                          type="email"
                          value={reqEmail}
                          onChange={(e) => setReqEmail(e.target.value)}
                          placeholder="name@email.com"
                          required
                          className="w-full pl-9 pr-3 py-2 theme-bg-subtle border theme-border rounded-xl theme-text-main placeholder:text-stone-400 text-sm focus:outline-none focus:border-amber-500 transition"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-xs font-semibold theme-text-secondary mb-1">
                        Agency / Office Name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none theme-text-tertiary">
                          <Building className="w-3.5 h-3.5" />
                        </div>
                        <input
                          type="text"
                          value={reqAgency}
                          onChange={(e) => setReqAgency(e.target.value)}
                          placeholder="e.g. Real Estate Agency"
                          className="w-full pl-9 pr-3 py-2 theme-bg-subtle border theme-border rounded-xl theme-text-main placeholder:text-stone-400 text-sm focus:outline-none focus:border-amber-500 transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold theme-text-secondary mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        value={reqCity}
                        onChange={(e) => setReqCity(e.target.value)}
                        placeholder="Lahore"
                        className="w-full px-3 py-2 theme-bg-subtle border theme-border rounded-xl theme-text-main placeholder:text-stone-400 text-sm focus:outline-none focus:border-amber-500 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold theme-text-secondary mb-1">
                      Desired Username *
                    </label>
                    <input
                      type="text"
                      value={reqUsername}
                      onChange={(e) => setReqUsername(e.target.value)}
                      placeholder="e.g. EMP-105 or yourname"
                      required
                      className="w-full px-3 py-2 theme-bg-subtle border theme-border rounded-xl theme-text-main placeholder:text-stone-400 text-sm focus:outline-none focus:border-amber-500 transition"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-xs font-semibold theme-text-secondary mb-1">
                        Password *
                      </label>
                      <div className="relative">
                        <input
                          type={showReqPassword ? 'text' : 'password'}
                          value={reqPassword}
                          onChange={(e) => setReqPassword(e.target.value)}
                          placeholder="Min 6 characters"
                          required
                          className="w-full pl-3 pr-8 py-2 theme-bg-subtle border theme-border rounded-xl theme-text-main placeholder:text-stone-400 text-sm focus:outline-none focus:border-amber-500 transition"
                        />
                        <button
                          type="button"
                          onClick={() => setShowReqPassword(!showReqPassword)}
                          className="absolute inset-y-0 right-0 pr-2.5 flex items-center theme-text-tertiary hover:theme-text-main"
                        >
                          {showReqPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold theme-text-secondary mb-1">
                        Confirm Password *
                      </label>
                      <input
                        type="password"
                        value={reqConfirmPassword}
                        onChange={(e) => setReqConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        required
                        className="w-full px-3 py-2 theme-bg-subtle border theme-border rounded-xl theme-text-main placeholder:text-stone-400 text-sm focus:outline-none focus:border-amber-500 transition"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-2 py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600 text-white font-bold text-sm tracking-wide transition-all shadow-md shadow-amber-600/20 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 min-h-[44px]"
                  >
                    {isLoading ? (
                      <span>Submitting Request...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Submit Access Request</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Discrete Owner access link */}
              <div className="mt-5 pt-3 border-t theme-border flex justify-center">
                <button
                  type="button"
                  onClick={handleFillOwner}
                  className="text-[11px] theme-text-tertiary hover:text-amber-700 dark:hover:text-amber-400 transition flex items-center gap-1.5 font-medium"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                  <span>Executive Administration Console</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Security & Privacy notice */}
        <p className="mt-4 text-center text-[11px] sm:text-xs theme-text-tertiary font-medium">
          MSA · MANAGED | SEARCH | ACCESS · Enterprise Real Estate System
        </p>
      </div>
    </div>
  );
};
