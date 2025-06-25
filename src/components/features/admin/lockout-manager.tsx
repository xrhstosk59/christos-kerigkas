'use client';

import { useState, useEffect } from 'react';

interface LockedAccount {
  identifier: string;
  endpoint: string;
  totalAttempts: number;
  lastAttempt: string;
  attempts: number;
  isLocked: boolean;
  remainingAttempts: number;
  lockoutExpiresAt?: string;
  nextAttemptAllowedAt?: string;
}

interface LockoutStatistics {
  totalLockedAccounts: number;
  recentFailedAttempts: number;
  topFailedIPs: Array<{ ip: string; attempts: number }>;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function LockoutManager() {
  const [lockedAccounts, setLockedAccounts] = useState<LockedAccount[]>([]);
  const [statistics, setStatistics] = useState<LockoutStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  // Filters
  const [filters, setFilters] = useState({
    endpoint: 'all',
    identifier: '',
    showLockedOnly: false
  });

  const [endpoints, setEndpoints] = useState<string[]>([]);
  const [unlockingId, setUnlockingId] = useState<string | null>(null);

  const fetchLockouts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.endpoint !== 'all' && { endpoint: filters.endpoint }),
        ...(filters.identifier && { identifier: filters.identifier })
      });

      const response = await fetch(`/api/admin/lockouts?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch lockout data');
      }

      const data = await response.json();
      
      // Filter locked accounts if requested
      const filteredAccounts = filters.showLockedOnly 
        ? data.lockedAccounts.filter((acc: LockedAccount) => acc.isLocked)
        : data.lockedAccounts;
        
      setLockedAccounts(filteredAccounts);
      setStatistics(data.statistics);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const fetchEndpoints = async () => {
    try {
      const response = await fetch('/api/admin/lockouts', {
        method: 'PATCH'
      });
      
      if (response.ok) {
        const data = await response.json();
        setEndpoints(data.endpoints);
      }
    } catch (err) {
      console.error('Error fetching endpoints:', err);
    }
  };

  const unlockAccount = async (identifier: string) => {
    try {
      setUnlockingId(identifier);
      
      const response = await fetch('/api/admin/lockouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier,
          reason: 'Emergency unlock by admin'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to unlock account');
      }

      // Refresh data after unlock
      await fetchLockouts();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unlock account');
    } finally {
      setUnlockingId(null);
    }
  };

  useEffect(() => {
    fetchLockouts();
  }, [pagination.page, filters.endpoint, filters.identifier]);

  useEffect(() => {
    fetchEndpoints();
  }, []);

  const handleFilterChange = (key: string, value: string | boolean) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  };

  const getStatusBadge = (account: LockedAccount) => {
    if (account.isLocked) {
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    } else if (account.attempts >= 3) {
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    } else {
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    }
  };

  const getStatusText = (account: LockedAccount) => {
    if (account.isLocked) {
      return 'LOCKED';
    } else if (account.attempts >= 3) {
      return 'WARNING';
    } else {
      return 'NORMAL';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-800 rounded-lg h-24"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md mx-auto">
          <p className="text-red-800 dark:text-red-200 font-medium mb-4">Error loading lockout data</p>
          <p className="text-sm text-red-600 dark:text-red-300 mb-4">{error}</p>
          <button 
            onClick={() => fetchLockouts()} 
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Locked Accounts
            </h3>
            <p className="text-3xl font-bold text-red-600 dark:text-red-400">
              {statistics.totalLockedAccounts}
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Recent Failed Attempts (24h)
            </h3>
            <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
              {statistics.recentFailedAttempts}
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Top Failed IPs
            </h3>
            <div className="space-y-1">
              {statistics.topFailedIPs.slice(0, 3).map((ip, index) => (
                <div key={index} className="text-sm text-gray-600 dark:text-gray-300">
                  {ip.ip}: {ip.attempts} attempts
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Filters</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Endpoint
            </label>
            <select
              value={filters.endpoint}
              onChange={(e) => handleFilterChange('endpoint', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Endpoints</option>
              {endpoints.map(endpoint => (
                <option key={endpoint} value={endpoint}>{endpoint}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Identifier (Email/IP)
            </label>
            <input
              type="text"
              value={filters.identifier}
              onChange={(e) => handleFilterChange('identifier', e.target.value)}
              placeholder="Search by email or IP..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div className="flex items-end">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.showLockedOnly}
                onChange={(e) => handleFilterChange('showLockedOnly', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Show locked accounts only
              </span>
            </label>
          </div>
        </div>

        <div className="flex justify-between items-center pt-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {pagination.total} total records
          </div>
          <button
            onClick={() => {
              setFilters({
                endpoint: 'all',
                identifier: '',
                showLockedOnly: false
              });
              setPagination(prev => ({ ...prev, page: 1 }));
            }}
            className="px-4 py-2 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Accounts List */}
      <div className="space-y-3">
        {lockedAccounts.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
            <p className="text-gray-500 dark:text-gray-400">No lockout records found.</p>
          </div>
        ) : (
          lockedAccounts.map((account, index) => (
            <div key={`${account.identifier}-${account.endpoint}-${index}`} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {account.identifier}
                    </h4>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(account)}`}>
                      {getStatusText(account)}
                    </span>
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 rounded">
                      {account.endpoint}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-300">
                    <div>
                      <strong>Failed Attempts:</strong> {account.attempts}
                    </div>
                    <div>
                      <strong>Remaining Attempts:</strong> {account.remainingAttempts}
                    </div>
                    <div>
                      <strong>Last Attempt:</strong> {new Date(account.lastAttempt).toLocaleString()}
                    </div>
                    {account.lockoutExpiresAt && (
                      <div>
                        <strong>Lockout Expires:</strong> {new Date(account.lockoutExpiresAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
                
                {account.isLocked && (
                  <button
                    onClick={() => unlockAccount(account.identifier)}
                    disabled={unlockingId === account.identifier}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    {unlockingId === account.identifier ? 'Unlocking...' : 'Emergency Unlock'}
                  </button>
                )}
              </div>
              
              {account.isLocked && account.lockoutExpiresAt && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
                  <p className="text-sm text-red-800 dark:text-red-200">
                    <strong>Account is currently locked.</strong> 
                    {' '}Will automatically unlock in {Math.ceil((new Date(account.lockoutExpiresAt).getTime() - Date.now()) / (60 * 1000))} minutes.
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
            disabled={pagination.page === 1}
            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            Previous
          </button>
          
          <span className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
            disabled={pagination.page === pagination.totalPages}
            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}