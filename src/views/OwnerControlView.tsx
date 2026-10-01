import React, { useState, useEffect } from 'react';
import { User, Property, ActivityLog, AccessRequest } from '../types';
import { api } from '../services/api';
import { 
  ShieldCheck, 
  Users, 
  Building2, 
  Database, 
  Download, 
  Upload, 
  Trash2, 
  Key, 
  UserPlus, 
  ToggleLeft, 
  ToggleRight, 
  Check, 
  AlertCircle,
  ArrowLeft,
  Search,
  Activity,
  Mail,
  Phone,
  MessageCircle,
  Clock,
  CreditCard,
  Save,
  CheckCircle2,
  XCircle,
  ExternalLink
} from 'lucide-react';
import { formatPKR } from '../utils/formatters';

interface OwnerControlViewProps {
  currentUser: User;
  onExit: () => void;
  onRefreshData: () => void;
}

export const OwnerControlView: React.FC<OwnerControlViewProps> = ({
  currentUser: _currentUser,
  onExit,
  onRefreshData,
}) => {
  const [activeTab, setActiveTab] = useState<'requests' | 'users' | 'properties' | 'system' | 'logs'>('requests');
  const [overview, setOverview] = useState<any>(null);
  const [allProperties, setAllProperties] = useState<(Property & { employee_username: string; employee_name: string })[]>([]);
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([]);
  const [_isLoading, setIsLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState<{ text: string; isError?: boolean } | null>(null);

  // Settings form state
  const [ownerEmail, setOwnerEmail] = useState('sacc5038@gmail.com');
  const [ownerPhone, setOwnerPhone] = useState('+92 3082665978');
  const [ownerWhatsApp, setOwnerWhatsApp] = useState('+92 3082665978');
  const [monthlyFee, setMonthlyFee] = useState('5000');
  const [paymentInstructions, setPaymentInstructions] = useState('Bank Transfer / EasyPaisa / JazzCash available. Contact Owner for bank details.');
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // User form modal state
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'user' | 'owner'>('user');

  // Password reset modal state
  const [resettingUser, setResettingUser] = useState<User | null>(null);
  const [resetNewPassword, setResetNewPassword] = useState('');

  // Property search inside owner console
  const [propertySearch, setPropertySearch] = useState('');

  // Backup restore file state
  const [restoreFile, setRestoreFile] = useState<File | null>(null);

  const loadOwnerData = async () => {
    setIsLoading(true);
    try {
      const [overviewData, propData, requestsData] = await Promise.all([
        api.getOwnerOverview(),
        api.getOwnerProperties(),
        api.getOwnerAccessRequests(),
      ]);
      setOverview(overviewData);
      setAllProperties(propData.properties);
      setAccessRequests(requestsData.requests || []);

      if (overviewData.settings) {
        if (overviewData.settings.owner_email) setOwnerEmail(overviewData.settings.owner_email);
        if (overviewData.settings.owner_phone) setOwnerPhone(overviewData.settings.owner_phone);
        if (overviewData.settings.owner_whatsapp) setOwnerWhatsApp(overviewData.settings.owner_whatsapp);
        if (overviewData.settings.monthly_subscription_fee_pkr) setMonthlyFee(String(overviewData.settings.monthly_subscription_fee_pkr));
        if (overviewData.settings.payment_instructions) setPaymentInstructions(overviewData.settings.payment_instructions);
      }
    } catch (err: any) {
      console.error('Owner data load failed', err);
      setStatusMsg({ text: err.message || 'Failed to load owner overview.', isError: true });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOwnerData();
  }, []);

  // Access Requests actions
  const handleApproveRequest = async (requestId: string) => {
    try {
      const res = await api.approveOwnerAccessRequest(requestId);
      setStatusMsg({ text: res.message || 'Access approved successfully! User is now active.' });
      await loadOwnerData();
      onRefreshData();
    } catch (err: any) {
      setStatusMsg({ text: err.message || 'Failed to approve access request', isError: true });
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    const reason = window.prompt('Enter reason for rejection (optional):', 'Payment not received');
    try {
      const res = await api.rejectOwnerAccessRequest(requestId, reason || undefined);
      setStatusMsg({ text: res.message || 'Request rejected.' });
      await loadOwnerData();
    } catch (err: any) {
      setStatusMsg({ text: err.message || 'Failed to reject request', isError: true });
    }
  };

  const handleDeleteRequest = async (requestId: string) => {
    if (!window.confirm('Are you sure you want to delete this access request record?')) return;
    try {
      await api.deleteOwnerAccessRequest(requestId);
      setStatusMsg({ text: 'Access request deleted.' });
      await loadOwnerData();
    } catch (err: any) {
      setStatusMsg({ text: err.message || 'Failed to delete request', isError: true });
    }
  };

  const handleSavePaymentSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      await api.updateOwnerSettings({
        owner_email: ownerEmail.trim(),
        owner_phone: ownerPhone.trim(),
        owner_whatsapp: ownerWhatsApp.trim(),
        monthly_subscription_fee_pkr: Number(monthlyFee) || 0,
        payment_instructions: paymentInstructions.trim(),
        require_owner_approval_for_signup: true,
      });
      setStatusMsg({ text: 'Owner payment and contact settings saved successfully!' });
      await loadOwnerData();
    } catch (err: any) {
      setStatusMsg({ text: err.message || 'Failed to save settings', isError: true });
    } finally {
      setIsSavingSettings(false);
    }
  };

  // User management actions
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newFullName.trim() || !newPassword.trim()) {
      setStatusMsg({ text: 'All fields are required to register an employee.', isError: true });
      return;
    }

    try {
      await api.createOwnerUser({
        username: newUsername.trim(),
        full_name: newFullName.trim(),
        password: newPassword.trim(),
        role: newRole,
      });
      setStatusMsg({ text: `Employee ${newUsername} created successfully!` });
      setShowCreateUserModal(false);
      setNewUsername('');
      setNewFullName('');
      setNewPassword('');
      await loadOwnerData();
    } catch (err: any) {
      setStatusMsg({ text: err.message || 'Failed to create user', isError: true });
    }
  };

  const handleToggleUserStatus = async (user: User) => {
    try {
      await api.updateOwnerUserStatus(user.user_id, !user.is_active);
      setStatusMsg({
        text: `Employee ${user.username} account ${!user.is_active ? 'activated' : 'disabled'}.`,
      });
      await loadOwnerData();
    } catch (err: any) {
      setStatusMsg({ text: err.message || 'Failed to update user status', isError: true });
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resettingUser || !resetNewPassword.trim() || resetNewPassword.length < 4) {
      setStatusMsg({ text: 'Password must be at least 4 characters.', isError: true });
      return;
    }

    try {
      await api.resetOwnerUserPassword(resettingUser.user_id, resetNewPassword.trim());
      setStatusMsg({ text: `Password for ${resettingUser.username} updated.` });
      setResettingUser(null);
      setResetNewPassword('');
      await loadOwnerData();
    } catch (err: any) {
      setStatusMsg({ text: err.message || 'Failed to reset password', isError: true });
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (!window.confirm(`Warning: Deleting ${user.username} will also permanently erase all property records created by this employee. Proceed?`)) {
      return;
    }

    try {
      await api.deleteOwnerUser(user.user_id);
      setStatusMsg({ text: `Employee ${user.username} and their properties removed.` });
      await loadOwnerData();
      onRefreshData();
    } catch (err: any) {
      setStatusMsg({ text: err.message || 'Failed to delete user', isError: true });
    }
  };

  // Property actions
  const handleDeleteProperty = async (propId: string, plotNum: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete Plot #${plotNum}?`)) {
      return;
    }

    try {
      await api.deleteOwnerProperty(propId);
      setStatusMsg({ text: `Property Plot #${plotNum} permanently deleted by Owner.` });
      await loadOwnerData();
      onRefreshData();
    } catch (err: any) {
      setStatusMsg({ text: err.message || 'Failed to delete property', isError: true });
    }
  };

  // Backup & Restore
  const handleDownloadBackup = async () => {
    try {
      const backup = await api.getOwnerBackup();
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `property_hub_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setStatusMsg({ text: 'Company database backup downloaded successfully.' });
    } catch (err: any) {
      setStatusMsg({ text: err.message || 'Failed to download backup', isError: true });
    }
  };

  const handleRestoreBackup = async () => {
    if (!restoreFile) {
      setStatusMsg({ text: 'Please select a backup JSON file first.', isError: true });
      return;
    }

    if (!window.confirm('Warning: Restoring will overwrite existing company property records with the backup. Continue?')) {
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        const payload = json.database || json;
        const res = await api.restoreOwnerBackup(payload);
        setStatusMsg({ text: `Backup restored! ${res.restored_properties_count} property records restored.` });
        setRestoreFile(null);
        await loadOwnerData();
        onRefreshData();
      } catch (err: any) {
        setStatusMsg({ text: 'Invalid JSON backup format: ' + err.message, isError: true });
      }
    };
    reader.readAsText(restoreFile);
  };

  const filteredProperties = allProperties.filter((p) => {
    if (!propertySearch.trim()) return true;
    const q = propertySearch.toLowerCase().trim();
    return (
      p.society.toLowerCase().includes(q) ||
      p.plot_number.toLowerCase().includes(q) ||
      p.block.toLowerCase().includes(q) ||
      p.employee_username.toLowerCase().includes(q) ||
      p.employee_name.toLowerCase().includes(q) ||
      p.status.toLowerCase().includes(q)
    );
  });

  const pendingRequestsCount = accessRequests.filter(r => r.status === 'pending_payment').length;

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-28 space-y-4 sm:space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b theme-border">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold theme-text-main font-brand">
                Owner Executive Backend
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30 font-bold">
                DIRECTOR CONTROL
              </span>
            </div>
            <p className="text-xs theme-text-tertiary mt-0.5">
              License management, payment approvals, employee accounts, and company backups
            </p>
          </div>
        </div>

        <button
          onClick={onExit}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl theme-bg-card hover:theme-bg-subtle text-xs font-semibold theme-text-secondary transition border theme-border theme-shadow min-h-[40px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit to Dashboard</span>
        </button>
      </div>

      {statusMsg && (
        <div
          className={`p-3.5 rounded-xl border flex items-start gap-2.5 text-xs ${
            statusMsg.isError
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-800 dark:text-rose-300'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
          }`}
        >
          {statusMsg.isError ? <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> : <Check className="w-4 h-4 shrink-0 mt-0.5" />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b theme-border pb-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('requests')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'requests'
              ? 'bg-amber-600 text-white font-bold shadow-sm'
              : 'theme-bg-subtle theme-text-secondary hover:theme-text-main border theme-border'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>Access & Payment Requests</span>
          {pendingRequestsCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-600 text-white font-bold animate-pulse">
              {pendingRequestsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'users'
              ? 'bg-amber-600 text-white font-bold shadow-sm'
              : 'theme-bg-subtle theme-text-secondary hover:theme-text-main border theme-border'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Employees ({overview?.users?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('properties')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'properties'
              ? 'bg-amber-600 text-white font-bold shadow-sm'
              : 'theme-bg-subtle theme-text-secondary hover:theme-text-main border theme-border'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>All Company Properties ({allProperties.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('system')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'system'
              ? 'bg-amber-600 text-white font-bold shadow-sm'
              : 'theme-bg-subtle theme-text-secondary hover:theme-text-main border theme-border'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Database & Backup</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'logs'
              ? 'bg-amber-600 text-white font-bold shadow-sm'
              : 'theme-bg-subtle theme-text-secondary hover:theme-text-main border theme-border'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Activity Audit Logs</span>
        </button>
      </div>

      {/* TAB: ACCESS & PAYMENT REQUESTS (NEW!) */}
      {activeTab === 'requests' && (
        <div className="space-y-5 animate-in fade-in">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="theme-bg-card border theme-border rounded-2xl p-4 theme-shadow">
              <div className="text-xs font-semibold text-rose-700 dark:text-rose-400 flex items-center justify-between">
                <span>Pending Approvals</span>
                <Clock className="w-4 h-4" />
              </div>
              <div className="text-2xl font-bold theme-text-main mt-1 font-brand">
                {pendingRequestsCount}
              </div>
              <p className="text-[11px] theme-text-tertiary mt-0.5">Awaiting fee confirmation from owner</p>
            </div>

            <div className="theme-bg-card border theme-border rounded-2xl p-4 theme-shadow">
              <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center justify-between">
                <span>Approved Active Users</span>
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="text-2xl font-bold theme-text-main mt-1 font-brand">
                {accessRequests.filter(r => r.status === 'approved').length}
              </div>
              <p className="text-[11px] theme-text-tertiary mt-0.5">Granted full access to the portal</p>
            </div>

            <div className="theme-bg-card border theme-border rounded-2xl p-4 theme-shadow">
              <div className="text-xs font-semibold text-amber-700 dark:text-amber-400 flex items-center justify-between">
                <span>Owner Notification Email</span>
                <Mail className="w-4 h-4" />
              </div>
              <div className="text-sm font-bold font-mono theme-text-main mt-1 truncate">
                {ownerEmail}
              </div>
              <p className="text-[11px] theme-text-tertiary mt-0.5">Receives applicant registration alerts</p>
            </div>
          </div>

          {/* Owner Payment & Notification Setup Form */}
          <div className="theme-bg-card border theme-border rounded-2xl p-4 sm:p-6 theme-shadow">
            <div className="flex items-center justify-between pb-3 mb-4 border-b theme-border">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                <h3 className="text-sm font-bold theme-text-main font-brand uppercase tracking-wider">
                  Administration Contact & Subscription Settings
                </h3>
              </div>
              <span className="text-[11px] font-mono text-amber-800 dark:text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded">
                Direct Applicant Inquiries
              </span>
            </div>

            <form onSubmit={handleSavePaymentSettings} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold theme-text-secondary mb-1">
                    Administrative Notification Email (Receives Access Alerts)
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 absolute left-3 top-2.5 theme-text-tertiary" />
                    <input
                      type="email"
                      value={ownerEmail}
                      onChange={(e) => setOwnerEmail(e.target.value)}
                      placeholder="sacc5038@gmail.com"
                      required
                      className="w-full pl-9 pr-3 py-2 theme-bg-subtle border theme-border rounded-xl text-xs theme-text-main focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold theme-text-secondary mb-1">
                    Administration WhatsApp / Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 absolute left-3 top-2.5 theme-text-tertiary" />
                    <input
                      type="text"
                      value={ownerWhatsApp}
                      onChange={(e) => setOwnerWhatsApp(e.target.value)}
                      placeholder="+92 3082665978"
                      required
                      className="w-full pl-9 pr-3 py-2 theme-bg-subtle border theme-border rounded-xl text-xs theme-text-main focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold theme-text-secondary mb-1">
                    Monthly Portal License Fee (PKR)
                  </label>
                  <input
                    type="number"
                    value={monthlyFee}
                    onChange={(e) => setMonthlyFee(e.target.value)}
                    placeholder="5000"
                    className="w-full px-3 py-2 theme-bg-subtle border theme-border rounded-xl text-xs theme-text-main focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold theme-text-secondary mb-1">
                    Payment Receiving Account Details (Bank / EasyPaisa / JazzCash)
                  </label>
                  <input
                    type="text"
                    value={paymentInstructions}
                    onChange={(e) => setPaymentInstructions(e.target.value)}
                    placeholder="Meezan Bank A/C: 1234... or EasyPaisa: 0300..."
                    className="w-full px-3 py-2 theme-bg-subtle border theme-border rounded-xl text-xs theme-text-main focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSavingSettings}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition shadow-xs active:scale-95 disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSavingSettings ? 'Saving Settings...' : 'Save Settings'}</span>
              </button>
            </form>
          </div>

          {/* Access Requests List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-bold theme-text-main font-brand uppercase tracking-wider">
                License & Subscription Requests ({accessRequests.length})
              </h3>
              <span className="text-xs theme-text-tertiary">
                Talk to applicants directly & grant access after receiving payment
              </span>
            </div>

            {accessRequests.length === 0 ? (
              <div className="text-center py-12 theme-bg-card rounded-2xl border theme-border p-6 theme-shadow">
                <Mail className="w-10 h-10 theme-text-tertiary mx-auto mb-2 opacity-40" />
                <h4 className="text-sm font-bold theme-text-main font-brand">No pending access requests</h4>
                <p className="text-xs theme-text-secondary mt-1 max-w-sm mx-auto">
                  When new users sign up on the portal, their requests and contact details will appear here for payment settlement.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {accessRequests.map((req) => {
                  const isPending = req.status === 'pending_payment';
                  const isApproved = req.status === 'approved';
                  const cleanPhone = req.phone.replace(/[^0-9]/g, '');
                  const waText = encodeURIComponent(
                    `Hello ${req.full_name}! I am the Administration of MSA (Managed | Search | Access). I received your account access request for username "${req.desired_username}". Let's finalize your activation.`
                  );
                  const waUrl = `https://wa.me/${cleanPhone}?text=${waText}`;

                  return (
                    <div
                      key={req.request_id}
                      className={`p-4 rounded-2xl border transition theme-shadow flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                        isPending
                          ? 'theme-bg-card border-amber-300 dark:border-amber-700/60'
                          : isApproved
                          ? 'theme-bg-card border-emerald-300 dark:border-emerald-800/60'
                          : 'theme-bg-subtle theme-border opacity-75'
                      }`}
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-bold theme-text-main font-brand">
                            {req.full_name}
                          </span>
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                            Username: {req.desired_username}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                              isPending
                                ? 'bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950/60 dark:text-amber-300'
                                : isApproved
                                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : 'bg-rose-100 text-rose-900 border border-rose-300 dark:bg-rose-950/60 dark:text-rose-300'
                            }`}
                          >
                            {isPending ? 'Pending Payment & Approval ⏳' : isApproved ? 'Approved & Active ✅' : 'Rejected ❌'}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs theme-text-secondary">
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold hover:underline"
                            title="Chat on WhatsApp"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>{req.phone}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>

                          <a
                            href={`mailto:${req.email}?subject=${encodeURIComponent('MSA Portal Access - Activation Details')}`}
                            className="flex items-center gap-1 hover:underline truncate"
                          >
                            <Mail className="w-3.5 h-3.5 theme-text-tertiary" />
                            <span>{req.email}</span>
                          </a>

                          {req.agency_name && (
                            <span className="flex items-center gap-1">
                              <Building2 className="w-3.5 h-3.5 theme-text-tertiary" />
                              <span>{req.agency_name} {req.city ? `(${req.city})` : ''}</span>
                            </span>
                          )}
                        </div>

                        <div className="text-[10px] theme-text-tertiary font-mono">
                          Requested at: {new Date(req.created_at).toLocaleString()}
                        </div>
                      </div>

                      {/* Action Buttons for Owner */}
                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        {/* 1. Chat on WhatsApp to discuss activation */}
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs active:scale-95 transition"
                          title="Open WhatsApp to contact applicant"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Contact on WhatsApp</span>
                        </a>

                        {/* 2. Approve & Grant Access */}
                        {isPending && (
                          <button
                            onClick={() => handleApproveRequest(req.request_id)}
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs active:scale-95 transition"
                            title="Activate applicant portal access"
                          >
                            <Check className="w-4 h-4 stroke-[3]" />
                            <span>Approve & Grant Access</span>
                          </button>
                        )}

                        {/* 3. Reject */}
                        {isPending && (
                          <button
                            onClick={() => handleRejectRequest(req.request_id)}
                            className="p-2 rounded-xl theme-bg-subtle hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-700 dark:text-rose-400 border theme-border transition text-xs font-semibold"
                            title="Reject request"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}

                        {/* 4. Delete */}
                        <button
                          onClick={() => handleDeleteRequest(req.request_id)}
                          className="p-2 rounded-xl theme-bg-subtle hover:bg-rose-50 dark:hover:bg-rose-950/40 text-stone-400 hover:text-rose-600 border theme-border transition"
                          title="Delete record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 1: USERS MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold theme-text-secondary uppercase tracking-wider font-brand">
              Employee User Accounts
            </h2>
            <button
              onClick={() => setShowCreateUserModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition shadow-sm"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Create Employee Account</span>
            </button>
          </div>

          <div className="theme-bg-card border theme-border rounded-2xl overflow-hidden theme-shadow">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b theme-border theme-bg-subtle theme-text-secondary font-semibold">
                    <th className="py-3 px-4">Employee ID</th>
                    <th className="py-3 px-4">Full Name</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Properties</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Last Login</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y theme-border theme-text-main">
                  {overview?.users?.map((user: any) => (
                    <tr key={user.user_id} className="hover:theme-bg-subtle transition">
                      <td className="py-3 px-4 font-mono font-bold text-amber-700 dark:text-amber-400">
                        {user.username}
                      </td>
                      <td className="py-3 px-4 font-semibold">{user.full_name}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded ${
                            user.role === 'owner'
                              ? 'bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30'
                              : 'bg-black/5 dark:bg-white/10 theme-text-secondary'
                          }`}
                        >
                          {user.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 text-[11px] font-mono">
                          <span className="font-bold">{user.properties_count || 0}</span>
                          <span className="text-emerald-700 dark:text-emerald-400">({user.available_count || 0} avail)</span>
                          <span className="text-rose-700 dark:text-rose-400">({user.sold_count || 0} sold)</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded ${
                            user.is_active
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                          }`}
                        >
                          {user.is_active ? 'ACTIVE' : 'DISABLED'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-stone-500 font-mono text-[11px]">
                        {user.last_login_at ? new Date(user.last_login_at).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {user.role !== 'owner' && (
                            <button
                              onClick={() => handleToggleUserStatus(user)}
                              className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-stone-500 transition"
                              title={user.is_active ? 'Disable Employee' : 'Enable Employee'}
                            >
                              {user.is_active ? (
                                <ToggleRight className="w-5 h-5 text-emerald-600" />
                              ) : (
                                <ToggleLeft className="w-5 h-5 text-rose-500" />
                              )}
                            </button>
                          )}

                          <button
                            onClick={() => {
                              setResettingUser(user);
                              setResetNewPassword('');
                            }}
                            className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-amber-700 dark:text-amber-400 transition"
                            title="Reset Employee Password"
                          >
                            <Key className="w-4 h-4" />
                          </button>

                          {user.role !== 'owner' && (
                            <button
                              onClick={() => handleDeleteUser(user)}
                              className="p-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 transition"
                              title="Delete Employee & Records"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: COMPANY PROPERTIES INSPECTION */}
      {activeTab === 'properties' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-sm font-bold theme-text-secondary uppercase tracking-wider font-brand">
              All Properties ({allProperties.length})
            </h2>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-2.5 theme-text-tertiary" />
              <input
                type="text"
                value={propertySearch}
                onChange={(e) => setPropertySearch(e.target.value)}
                placeholder="Filter by plot #, society, or employee..."
                className="w-full pl-9 pr-3 py-1.5 theme-bg-card border theme-border rounded-xl text-xs theme-text-main focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="theme-bg-card border theme-border rounded-2xl overflow-hidden theme-shadow">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b theme-border theme-bg-subtle theme-text-secondary font-semibold">
                    <th className="py-3 px-4">Plot / Society</th>
                    <th className="py-3 px-4">Size & Type</th>
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Media</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y theme-border theme-text-main">
                  {filteredProperties.map((prop) => {
                    const priceInfo = formatPKR(prop.price);
                    return (
                      <tr key={prop.property_id} className="hover:theme-bg-subtle transition">
                        <td className="py-3 px-4">
                          <div className="font-bold theme-text-main">
                            Plot #{prop.plot_number} · {prop.block || 'Main'}
                          </div>
                          <div className="text-[11px] theme-text-tertiary">
                            {prop.society}, {prop.town}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-medium">
                          <div>{prop.plot_size}</div>
                          <div className="text-[10px] theme-text-tertiary">{prop.plot_type}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-mono text-amber-700 dark:text-amber-400 font-bold">
                            {prop.employee_username}
                          </span>
                          <span className="block text-[10px] theme-text-tertiary">{prop.employee_name}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold font-brand">{priceInfo.short}</div>
                          <div className="text-[10px] theme-text-tertiary font-mono">{priceInfo.full}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded ${
                              prop.status === 'Available'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : prop.status === 'On Hold'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                            }`}
                          >
                            {prop.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] theme-text-secondary">
                          {prop.images?.length || 0} pics
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleDeleteProperty(prop.property_id, prop.plot_number)}
                            className="p-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 transition"
                            title="Delete Property (Director Authority)"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DATABASE & BACKUP */}
      {activeTab === 'system' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="theme-bg-card border theme-border rounded-2xl p-5 sm:p-6 theme-shadow space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b theme-border">
              <Download className="w-4 h-4 text-amber-700 dark:text-amber-400" />
              <h2 className="text-sm font-bold theme-text-main uppercase tracking-wider font-brand">
                Export Complete Company Backup
              </h2>
            </div>
            <p className="text-xs theme-text-secondary leading-relaxed">
              Download a complete JSON snapshot containing all employee user accounts, property records, high-resolution photo archives, and activity history.
            </p>
            <button
              onClick={handleDownloadBackup}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition shadow-sm active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Download Company Database JSON</span>
            </button>
          </div>

          <div className="theme-bg-card border theme-border rounded-2xl p-5 sm:p-6 theme-shadow space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b theme-border">
              <Upload className="w-4 h-4 text-amber-700 dark:text-amber-400" />
              <h2 className="text-sm font-bold theme-text-main uppercase tracking-wider font-brand">
                Restore Database From JSON
              </h2>
            </div>
            <p className="text-xs theme-text-secondary leading-relaxed">
              Upload a previously exported backup file to restore property records.
            </p>
            <div className="space-y-3">
              <input
                type="file"
                accept=".json"
                onChange={(e) => setRestoreFile(e.target.files ? e.target.files[0] : null)}
                className="w-full text-xs theme-text-main file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border file:theme-border file:text-xs file:font-semibold file:bg-amber-500/10 file:text-amber-800 dark:file:text-amber-300"
              />
              <button
                onClick={handleRestoreBackup}
                disabled={!restoreFile}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs disabled:opacity-50 transition shadow-sm active:scale-95"
              >
                <Upload className="w-4 h-4" />
                <span>Restore Backup (Overwrites Current DB)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT ACTIVITY LOGS */}
      {activeTab === 'logs' && (
        <div className="theme-bg-card border theme-border rounded-2xl p-5 sm:p-6 theme-shadow space-y-4">
          <h2 className="text-sm font-bold theme-text-secondary uppercase tracking-wider font-brand">
            Real-Time Company Activity Audit Log
          </h2>

          <div className="space-y-2">
            {overview?.activity_logs?.map((log: ActivityLog) => (
              <div
                key={log.log_id}
                className="p-3 rounded-xl theme-bg-subtle border theme-border flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold uppercase">
                    {log.action}
                  </span>
                  <div>
                    <span className="font-semibold theme-text-main">{log.username}: </span>
                    <span className="theme-text-secondary">{log.details}</span>
                  </div>
                </div>

                <span className="text-[10px] font-mono theme-text-tertiary whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Employee Modal */}
      {showCreateUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl theme-bg-card border theme-border p-6 shadow-2xl theme-text-main">
            <h3 className="text-base font-bold text-amber-700 dark:text-amber-400 font-brand">
              Create New Employee Account
            </h3>
            <p className="text-xs theme-text-tertiary mt-1">
              Add a new office employee with strictly isolated property records.
            </p>

            <form onSubmit={handleCreateUser} className="space-y-3.5 mt-4">
              <div>
                <label className="block text-xs font-semibold theme-text-secondary mb-1">
                  Employee ID / Username (e.g. EMP-104)
                </label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="EMP-104"
                  required
                  className="w-full px-3 py-2 theme-bg-subtle border theme-border rounded-xl text-xs theme-text-main focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold theme-text-secondary mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  placeholder="e.g. Bilal Farooq"
                  required
                  className="w-full px-3 py-2 theme-bg-subtle border theme-border rounded-xl text-xs theme-text-main focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold theme-text-secondary mb-1">
                  Initial Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  className="w-full px-3 py-2 theme-bg-subtle border theme-border rounded-xl text-xs theme-text-main focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold theme-text-secondary mb-1">
                  Role
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as any)}
                  className="w-full px-3 py-2 theme-bg-subtle border theme-border rounded-xl text-xs theme-text-main focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  <option value="user">Office Employee (Normal User)</option>
                  <option value="owner">Executive Owner</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateUserModal(false)}
                  className="flex-1 py-2 rounded-xl theme-bg-subtle text-xs font-semibold theme-text-secondary hover:theme-bg-hover"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition shadow-sm"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resettingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl theme-bg-card border theme-border p-6 shadow-2xl theme-text-main">
            <h3 className="text-base font-bold text-amber-700 dark:text-amber-400 font-brand">
              Reset Password for {resettingUser.username}
            </h3>
            <p className="text-xs theme-text-tertiary mt-1">
              Enter a new secure password for {resettingUser.full_name}.
            </p>

            <form onSubmit={handleResetPassword} className="space-y-3 mt-4">
              <input
                type="password"
                value={resetNewPassword}
                onChange={(e) => setResetNewPassword(e.target.value)}
                placeholder="New password (min 4 chars)"
                required
                className="w-full px-3 py-2 theme-bg-subtle border theme-border rounded-xl text-xs theme-text-main focus:outline-none focus:ring-1 focus:ring-amber-500"
              />

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResettingUser(null)}
                  className="flex-1 py-2 rounded-xl theme-bg-subtle text-xs font-semibold theme-text-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold"
                >
                  Save Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
