'use client';

import { useState, useEffect } from 'react';

interface NewsletterSubscriber {
  id: number;
  email: string;
  subscribedAt: string;
  ipAddress?: string;
  isActive: boolean;
  unsubscribedAt?: string;
}

interface NewsletterStatistics {
  totalSubscribers: number;
  activeSubscribers: number;
  unsubscribedCount: number;
  recentSubscriptions: number;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function NewsletterManager() {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [statistics, setStatistics] = useState<NewsletterStatistics | null>(null);
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
    status: 'all', // 'all', 'active', 'unsubscribed'
    search: ''
  });

  // Add subscriber modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [addingSubscriber, setAddingSubscriber] = useState(false);

  // Action states
  const [processingId, setProcessingId] = useState<number | null>(null);

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.status !== 'all' && { status: filters.status }),
        ...(filters.search && { search: filters.search })
      });

      const response = await fetch(`/api/admin/newsletter?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch newsletter subscribers');
      }

      const data = await response.json();
      setSubscribers(data.subscribers);
      setStatistics(data.statistics);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const updateSubscriber = async (id: number, action: string) => {
    try {
      setProcessingId(id);
      
      const response = await fetch('/api/admin/newsletter', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, action })
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action} subscriber`);
      }

      // Refresh data after update
      await fetchSubscribers();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${action} subscriber`);
    } finally {
      setProcessingId(null);
    }
  };

  const addSubscriber = async () => {
    if (!newEmail.trim()) return;

    try {
      setAddingSubscriber(true);
      
      const response = await fetch('/api/admin/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: newEmail.trim() })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add subscriber');
      }

      setNewEmail('');
      setShowAddModal(false);
      await fetchSubscribers();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add subscriber');
    } finally {
      setAddingSubscriber(false);
    }
  };

  const exportSubscribers = () => {
    const activeSubscribers = subscribers.filter(sub => sub.isActive);
    const emailList = activeSubscribers.map(sub => sub.email).join('\n');
    
    const blob = new Blob([emailList], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  useEffect(() => {
    fetchSubscribers();
  }, [pagination.page, filters.status, filters.search]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  };

  const getStatusBadge = (subscriber: NewsletterSubscriber) => {
    return subscriber.isActive
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
  };

  const getStatusText = (subscriber: NewsletterSubscriber) => {
    return subscriber.isActive ? 'Active' : 'Unsubscribed';
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-800 rounded-lg h-20"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md mx-auto">
          <p className="text-red-800 dark:text-red-200 font-medium mb-4">Error loading newsletter data</p>
          <p className="text-sm text-red-600 dark:text-red-300 mb-4">{error}</p>
          <button 
            onClick={() => fetchSubscribers()} 
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Total Subscribers
            </h3>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {statistics.totalSubscribers}
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Active Subscribers
            </h3>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              {statistics.activeSubscribers}
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Unsubscribed
            </h3>
            <p className="text-3xl font-bold text-red-600 dark:text-red-400">
              {statistics.unsubscribedCount}
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Recent (7 days)
            </h3>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {statistics.recentSubscriptions}
            </p>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow space-y-4">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Manage Subscribers</h3>
          
          <div className="flex gap-2">
            <button
              onClick={exportSubscribers}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Export Active Emails
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              Add Subscriber
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status Filter
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Subscribers</option>
              <option value="active">Active Only</option>
              <option value="unsubscribed">Unsubscribed Only</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Search Email
            </label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Search by email..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        <div className="flex justify-between items-center pt-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {pagination.total} total subscribers
          </div>
          <button
            onClick={() => {
              setFilters({ status: 'all', search: '' });
              setPagination(prev => ({ ...prev, page: 1 }));
            }}
            className="px-4 py-2 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Subscribers List */}
      <div className="space-y-3">
        {subscribers.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
            <p className="text-gray-500 dark:text-gray-400">No subscribers found.</p>
          </div>
        ) : (
          subscribers.map((subscriber) => (
            <div key={subscriber.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {subscriber.email}
                    </h4>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(subscriber)}`}>
                      {getStatusText(subscriber)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-300">
                    <div>
                      <strong>Subscribed:</strong> {new Date(subscriber.subscribedAt).toLocaleDateString()}
                    </div>
                    {subscriber.ipAddress && (
                      <div>
                        <strong>IP Address:</strong> {subscriber.ipAddress}
                      </div>
                    )}
                    {subscriber.unsubscribedAt && (
                      <div>
                        <strong>Unsubscribed:</strong> {new Date(subscriber.unsubscribedAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {subscriber.isActive ? (
                    <button
                      onClick={() => updateSubscriber(subscriber.id, 'deactivate')}
                      disabled={processingId === subscriber.id}
                      className="px-3 py-1 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50 transition-colors"
                    >
                      {processingId === subscriber.id ? 'Processing...' : 'Unsubscribe'}
                    </button>
                  ) : (
                    <button
                      onClick={() => updateSubscriber(subscriber.id, 'activate')}
                      disabled={processingId === subscriber.id}
                      className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                      {processingId === subscriber.id ? 'Processing...' : 'Reactivate'}
                    </button>
                  )}
                  
                  <button
                    onClick={() => updateSubscriber(subscriber.id, 'delete')}
                    disabled={processingId === subscriber.id}
                    className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
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

      {/* Add Subscriber Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Add New Subscriber
            </h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="subscriber@example.com"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                onKeyPress={(e) => e.key === 'Enter' && addSubscriber()}
              />
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewEmail('');
                }}
                className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addSubscriber}
                disabled={!newEmail.trim() || addingSubscriber}
                className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {addingSubscriber ? 'Adding...' : 'Add Subscriber'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}