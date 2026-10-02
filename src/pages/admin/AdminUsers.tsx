import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import {
  Users,
  Search,
  Coins,
  Shield,
  ShieldAlert,
  Key,
  Trash2,
  Plus,
  Minus,
  Check,
  X,
  RefreshCw,
  Eye,
  AlertCircle,
  Copy,
} from 'lucide-react';
import { User } from '../../types.ts';

export const AdminUsers: React.FC = () => {
  const { adminToken } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Modals state
  const [coinModal, setCoinModal] = useState<{
    open: boolean;
    user: User | null;
    type: 'ADD' | 'REMOVE';
    amount: string;
    reason: string;
  }>({
    open: false,
    user: null,
    type: 'ADD',
    amount: '50',
    reason: '',
  });

  const [deleteConfirm, setDeleteConfirm] = useState<User | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchUsers = async () => {
    if (!adminToken) return;
    try {
      setLoading(true);
      const url = search.trim()
        ? `/api/admin/users?search=${encodeURIComponent(search.trim())}`
        : '/api/admin/users';
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.status) setUsers(data.users || []);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [adminToken, search]);

  const showNotification = (type: 'success' | 'error', text: string) => {
    setActionMessage({ type, text });
    setTimeout(() => setActionMessage(null), 4000);
  };

  // Add / Remove Coins
  const handleCoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coinModal.user || !adminToken) return;

    const endpoint =
      coinModal.type === 'ADD'
        ? `/api/admin/users/${coinModal.user.id}/coins/add`
        : `/api/admin/users/${coinModal.user.id}/coins/remove`;

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          amount: parseInt(coinModal.amount, 10),
          reason: coinModal.reason || (coinModal.type === 'ADD' ? 'Admin Grant' : 'Admin Deduction'),
        }),
      });

      const data = await res.json();
      if (data.status) {
        showNotification(
          'success',
          `Successfully ${coinModal.type === 'ADD' ? 'credited' : 'deducted'} ${coinModal.amount} coins.`
        );
        setCoinModal({ ...coinModal, open: false });
        fetchUsers();
      } else {
        showNotification('error', data.error || 'Coin adjustment failed');
      }
    } catch {
      showNotification('error', 'Network error executing coin adjustment');
    }
  };

  // Ban / Unban
  const handleToggleBan = async (user: User) => {
    if (!adminToken) return;
    const action = user.status === 'active' ? 'ban' : 'unban';
    try {
      const res = await fetch(`/api/admin/users/${user.id}/${action}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await res.json();
      if (data.status) {
        showNotification('success', `User ${user.username} has been ${action}ned.`);
        fetchUsers();
      } else {
        showNotification('error', data.error || 'Ban update failed');
      }
    } catch {
      showNotification('error', 'Network error');
    }
  };

  // Reset API Key
  const handleResetApiKey = async (user: User) => {
    if (!adminToken) return;
    if (!confirm(`Are you sure you want to regenerate the API key for ${user.username}?`)) return;

    try {
      const res = await fetch(`/api/admin/users/${user.id}/reset-key`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await res.json();
      if (data.status) {
        showNotification('success', `Regenerated API Key for ${user.username}: ${data.apiKey}`);
        fetchUsers();
      } else {
        showNotification('error', data.error || 'Reset failed');
      }
    } catch {
      showNotification('error', 'Network error');
    }
  };

  // Delete User
  const handleDeleteUser = async (user: User) => {
    if (!adminToken) return;
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await res.json();
      if (data.status) {
        showNotification('success', `User ${user.username} was permanently deleted.`);
        setDeleteConfirm(null);
        fetchUsers();
      } else {
        showNotification('error', data.error || 'Delete failed');
      }
    } catch {
      showNotification('error', 'Network error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white">User Management</h2>
          <p className="text-xs text-slate-400">
            Audit developers, allocate coins, toggle ban status, and manage API keys.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by user, email, ID, key..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 outline-none focus:border-purple-400"
            />
          </div>

          <button
            onClick={fetchUsers}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-purple-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Action Notification */}
      {actionMessage && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center gap-2 ${
            actionMessage.type === 'success'
              ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
              : 'bg-red-500/15 border border-red-500/30 text-red-300'
          }`}
        >
          {actionMessage.type === 'success' ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Users Table */}
      <div className="rounded-2xl bg-[#0c0e24] border border-slate-800 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          {users.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm">
              No users found matching query.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/70 text-slate-400 font-mono border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">User ID</th>
                  <th className="py-3 px-4">Coins</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Requests</th>
                  <th className="py-3 px-4">Joined</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                {users.map((u) => {
                  const isBanned = u.status === 'banned';
                  return (
                    <tr key={u.id} className="hover:bg-purple-950/10 transition-colors">
                      <td className="py-3 px-4">
                        <div>
                          <span className="font-bold text-white font-sans">{u.username}</span>
                          <span className="block text-[11px] text-slate-400 font-mono">
                            {u.email}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-purple-300 font-bold">{u.userId}</td>

                      <td className="py-3 px-4">
                        <span className="font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          {u.coinBalance.toLocaleString()} 🪙
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            !isBanned
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : 'bg-red-500/15 text-red-400 border border-red-500/30'
                          }`}
                        >
                          {u.status.toUpperCase()}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-300">
                        {u.totalRequests} calls
                      </td>

                      <td className="py-3 px-4 text-slate-400 text-[11px]">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right font-sans">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Add Coins */}
                          <button
                            onClick={() =>
                              setCoinModal({
                                open: true,
                                user: u,
                                type: 'ADD',
                                amount: '50',
                                reason: 'Manual recharge by admin',
                              })
                            }
                            title="Add Coins"
                            className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>

                          {/* Remove Coins */}
                          <button
                            onClick={() =>
                              setCoinModal({
                                open: true,
                                user: u,
                                type: 'REMOVE',
                                amount: '10',
                                reason: 'Admin adjustment',
                              })
                            }
                            title="Remove Coins"
                            className="p-1.5 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-orange-300 border border-orange-500/30 transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>

                          {/* View details */}
                          <button
                            onClick={() => setSelectedUser(u)}
                            title="View Full Profile"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Ban / Unban */}
                          <button
                            onClick={() => handleToggleBan(u)}
                            title={isBanned ? 'Unban Account' : 'Ban Account'}
                            className={`p-1.5 rounded-lg border transition-colors ${
                              isBanned
                                ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                : 'bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                            }`}
                          >
                            <ShieldAlert className="w-3.5 h-3.5" />
                          </button>

                          {/* Reset Key */}
                          <button
                            onClick={() => handleResetApiKey(u)}
                            title="Regenerate API Key"
                            className="p-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 transition-colors"
                          >
                            <Key className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => setDeleteConfirm(u)}
                            title="Delete Account"
                            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add / Remove Coins Modal */}
      {coinModal.open && coinModal.user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md p-6 rounded-2xl bg-[#0c0e24] border border-cyan-500/30 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-400" />
                {coinModal.type === 'ADD' ? 'Credit Coins to User' : 'Deduct Coins from User'}
              </h3>
              <button
                onClick={() => setCoinModal({ ...coinModal, open: false })}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCoinSubmit} className="space-y-4 text-xs">
              <div>
                <span className="text-slate-400">Target User:</span>{' '}
                <span className="font-bold text-white">{coinModal.user.username}</span> (
                {coinModal.user.userId})
              </div>
              <div>
                <span className="text-slate-400">Current Balance:</span>{' '}
                <span className="font-bold text-amber-300">{coinModal.user.coinBalance} Coins</span>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Coin Amount</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={coinModal.amount}
                  onChange={(e) => setCoinModal({ ...coinModal, amount: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white font-mono outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Reason for Adjustment
                </label>
                <input
                  type="text"
                  required
                  value={coinModal.reason}
                  onChange={(e) => setCoinModal({ ...coinModal, reason: e.target.value })}
                  placeholder="e.g. VIP grant, top-up payment, policy penalty"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCoinModal({ ...coinModal, open: false })}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 rounded-xl font-bold text-slate-950 ${
                    coinModal.type === 'ADD'
                      ? 'bg-amber-400 hover:bg-amber-300'
                      : 'bg-red-400 hover:bg-red-300'
                  }`}
                >
                  Confirm {coinModal.type === 'ADD' ? 'Credit' : 'Deduction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md p-6 rounded-2xl bg-[#0c0e24] border border-red-500/30 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-red-400 flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              Permanently Delete User Account?
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to delete <strong className="text-white">{deleteConfirm.username}</strong> ({deleteConfirm.userId})? All API keys and statistics associated with this user will be removed.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 rounded-xl text-xs bg-slate-800 text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteUser(deleteConfirm)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-red-500 text-white hover:bg-red-600"
              >
                Yes, Delete User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg p-6 rounded-2xl bg-[#0c0e24] border border-purple-500/30 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-400" />
                Developer Account Details
              </h3>
              <button onClick={() => setSelectedUser(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 font-mono">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-900/80">
                <div>
                  <span className="text-slate-400 block text-[10px]">USERNAME</span>
                  <span className="text-white font-bold text-sm">{selectedUser.username}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">USER ID</span>
                  <span className="text-purple-300 font-bold">{selectedUser.userId}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">EMAIL</span>
                  <span className="text-slate-200">{selectedUser.email}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">COIN BALANCE</span>
                  <span className="text-amber-300 font-bold">{selectedUser.coinBalance} Coins</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] mb-1">ACTIVE API KEY</span>
                <div className="p-3 rounded-xl bg-black/60 border border-slate-800 text-cyan-300 break-all select-all flex items-center justify-between gap-2">
                  <span>{selectedUser.apiKey}</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(selectedUser.apiKey)}
                    className="p-1 text-slate-400 hover:text-white"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Total Calls</span>
                  <span className="text-white font-bold">{selectedUser.totalRequests}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Success</span>
                  <span className="text-emerald-400 font-bold">{selectedUser.successfulRequests}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Failed</span>
                  <span className="text-red-400 font-bold">{selectedUser.failedRequests}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
