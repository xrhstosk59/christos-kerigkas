'use client';

import { useState, useEffect } from 'react';

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  message: string;
  status: string;
  ipAddress?: string;
  createdAt: string;
  respondedAt?: string;
  respondedById?: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function ContactMessagesManager() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingMessageId, setUpdatingMessageId] = useState<number | null>(null);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        status: statusFilter
      });

      const response = await fetch(`/api/admin/contact-messages?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch contact messages');
      }

      const data = await response.json();
      setMessages(data.messages);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const updateMessageStatus = async (messageId: number, newStatus: string) => {
    try {
      setUpdatingMessageId(messageId);
      
      const response = await fetch('/api/admin/contact-messages', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: messageId,
          status: newStatus
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update message status');
      }

      // Refresh messages after update
      await fetchMessages();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update message');
    } finally {
      setUpdatingMessageId(null);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [pagination.page, statusFilter]);

  const getStatusBadge = (status: string) => {
    const badges = {
      new: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      responded: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      spam: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      archived: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    };
    
    return badges[status as keyof typeof badges] || badges.new;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-800 rounded-lg h-32"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md mx-auto">
          <p className="text-red-800 dark:text-red-200 font-medium mb-4">Error loading messages</p>
          <p className="text-sm text-red-600 dark:text-red-300 mb-4">{error}</p>
          <button 
            onClick={() => fetchMessages()} 
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
      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <label className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All</option>
            <option value="new">New</option>
            <option value="responded">Responded</option>
            <option value="spam">Spam</option>
            <option value="archived">Archived</option>
          </select>
        </label>
        
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {pagination.total} total messages
        </div>
      </div>

      {/* Messages List */}
      <div className="space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
            <p className="text-gray-500 dark:text-gray-400">No messages found.</p>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {message.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {message.email}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(message.createdAt).toLocaleString()}
                    {message.ipAddress && ` • IP: ${message.ipAddress}`}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(message.status)}`}>
                    {message.status}
                  </span>
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {message.message}
                </p>
              </div>
              
              {message.respondedAt && (
                <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                  Responded on {new Date(message.respondedAt).toLocaleString()}
                </div>
              )}
              
              <div className="flex gap-2">
                {message.status === 'new' && (
                  <button
                    onClick={() => updateMessageStatus(message.id, 'responded')}
                    disabled={updatingMessageId === message.id}
                    className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    {updatingMessageId === message.id ? 'Updating...' : 'Mark as Responded'}
                  </button>
                )}
                
                {message.status !== 'spam' && (
                  <button
                    onClick={() => updateMessageStatus(message.id, 'spam')}
                    disabled={updatingMessageId === message.id}
                    className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                  >
                    Mark as Spam
                  </button>
                )}
                
                {message.status !== 'archived' && (
                  <button
                    onClick={() => updateMessageStatus(message.id, 'archived')}
                    disabled={updatingMessageId === message.id}
                    className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
                  >
                    Archive
                  </button>
                )}
                
                <a
                  href={`mailto:${message.email}?subject=Re: Your message&body=Hi ${message.name},%0D%0A%0D%0AThank you for your message:%0D%0A%0D%0A"${message.message}"%0D%0A%0D%0A`}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Reply via Email
                </a>
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
    </div>
  );
}