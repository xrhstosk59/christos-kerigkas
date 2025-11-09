'use client';

import { useState, useEffect } from 'react';
import {
  Activity,
  Clock,
  AlertTriangle,
  Server,
  RefreshCw,
  BarChart3,
  Zap
} from 'lucide-react';

interface PerformanceMetrics {
  pageMetrics: {
    slowPageLoads: number;
    slowLCP: number;
    slowFID: number;
    poorCLS: number;
  };
  apiMetrics: {
    slowAPICalls: number;
    apiErrors: number;
    failedOperations: number;
  };
  resourceMetrics: {
    slowResources: number;
    largeResources: number;
    highMemoryUsage: number;
  };
  recentIssues: Array<{
    timestamp: string;
    action: string;
    severity: string;
    metadata: any;
    source: string;
  }>;
  timeline: Array<{
    date: string;
    slowPageLoads: number;
    apiErrors: number;
    memoryIssues: number;
    resourceIssues: number;
    totalIssues: number;
  }>;
  performanceScore: number;
  period: string;
  generatedAt: string;
}

export default function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState(7);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`/api/admin/performance?days=${period}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch performance metrics');
      }
      
      const data = await response.json();
      setMetrics(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [period]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchMetrics, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
    return undefined;
  }, [autoRefresh, period]);

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 dark:bg-green-900';
    if (score >= 60) return 'bg-yellow-100 dark:bg-yellow-900';
    return 'bg-red-100 dark:bg-red-900';
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error': return 'text-red-600 dark:text-red-400';
      case 'warning': return 'text-yellow-600 dark:text-yellow-400';
      default: return 'text-blue-600 dark:text-blue-400';
    }
  };

  if (loading && !metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span>Loading performance metrics...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            <span className="text-red-800 dark:text-red-200">{error}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Performance Monitor
        </h1>
        
        <div className="flex items-center gap-4">
          <select
            value={period}
            onChange={(e) => setPeriod(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value={1}>Last 24 hours</option>
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
          </select>
          
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-gray-300 dark:border-gray-600"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Auto-refresh</span>
          </label>
          
          <button
            onClick={fetchMetrics}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {metrics && (
        <>
          {/* Performance Score */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Overall Performance Score
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Generated {formatTimestamp(metrics.generatedAt)} • {metrics.period}
                </p>
              </div>
              <div className={`${getScoreBgColor(metrics.performanceScore)} rounded-full p-4`}>
                <div className={`text-3xl font-bold ${getScoreColor(metrics.performanceScore)}`}>
                  {metrics.performanceScore}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 text-center mt-1">
                  / 100
                </div>
              </div>
            </div>
          </div>

          {/* Metrics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Page Performance */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Page Performance
                </h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Slow Page Loads</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {metrics.pageMetrics.slowPageLoads}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Slow LCP</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {metrics.pageMetrics.slowLCP}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Slow FID</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {metrics.pageMetrics.slowFID}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Poor CLS</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {metrics.pageMetrics.poorCLS}
                  </span>
                </div>
              </div>
            </div>

            {/* API Performance */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Server className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  API Performance
                </h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Slow API Calls</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {metrics.apiMetrics.slowAPICalls}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">API Errors</span>
                  <span className="font-medium text-red-600 dark:text-red-400">
                    {metrics.apiMetrics.apiErrors}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Failed Operations</span>
                  <span className="font-medium text-red-600 dark:text-red-400">
                    {metrics.apiMetrics.failedOperations}
                  </span>
                </div>
              </div>
            </div>

            {/* Resource Performance */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <Activity className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Resource Performance
                </h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Slow Resources</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {metrics.resourceMetrics.slowResources}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Large Resources</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {metrics.resourceMetrics.largeResources}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">High Memory Usage</span>
                  <span className="font-medium text-yellow-600 dark:text-yellow-400">
                    {metrics.resourceMetrics.highMemoryUsage}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <BarChart3 className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Performance Timeline
              </h3>
            </div>
            
            <div className="space-y-4">
              {metrics.timeline.map((day) => (
                <div key={day.date} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {new Date(day.date).toLocaleDateString()}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {day.totalIssues} total issues
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                        {day.slowPageLoads}
                      </div>
                      <div className="text-xs text-gray-500">Page Issues</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-red-600 dark:text-red-400">
                        {day.apiErrors}
                      </div>
                      <div className="text-xs text-gray-500">API Errors</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-yellow-600 dark:text-yellow-400">
                        {day.memoryIssues}
                      </div>
                      <div className="text-xs text-gray-500">Memory</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                        {day.resourceIssues}
                      </div>
                      <div className="text-xs text-gray-500">Resources</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Issues */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Recent Issues (Last 24 Hours)
              </h3>
            </div>
            
            {metrics.recentIssues.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-green-600 dark:text-green-400 mb-2">
                  <Clock className="h-8 w-8 mx-auto" />
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  No performance issues in the last 24 hours
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {metrics.recentIssues.map((issue, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-sm font-medium ${getSeverityColor(issue.severity)}`}>
                            {issue.severity.toUpperCase()}
                          </span>
                          <span className="text-sm text-gray-500">•</span>
                          <span className="text-sm text-gray-900 dark:text-white">
                            {issue.action.replace(/_/g, ' ').toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {formatTimestamp(issue.timestamp)}
                        </p>
                        {issue.metadata && Object.keys(issue.metadata).length > 0 && (
                          <details className="mt-2">
                            <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">
                              View details
                            </summary>
                            <pre className="text-xs text-gray-600 dark:text-gray-400 mt-1 bg-gray-50 dark:bg-gray-700 p-2 rounded overflow-x-auto">
                              {JSON.stringify(issue.metadata, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}