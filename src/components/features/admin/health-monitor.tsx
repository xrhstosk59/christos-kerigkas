'use client';

import { useState, useEffect } from 'react';
import { 
  Activity, 
  Database, 
  Settings, 
  Shield, 
  Server, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Clock,
  RefreshCw,
  Info
} from 'lucide-react';

interface HealthData {
  status: 'ok' | 'degraded' | 'error';
  timestamp: string;
  environment: string;
  version: string;
  database: {
    status: string;
    responseTime?: number;
    error?: string;
  };
  migrations: {
    status: string;
    available: number;
    applied: number;
    pending: number;
    lastMigration?: string;
    error?: string;
  };
  schema: {
    status: string;
    error?: string;
  };
  features: {
    twoFactorAuth: boolean;
    auditLogging: boolean;
    rateLimiting: boolean;
    offlineSupport: boolean;
    performanceMonitoring: boolean;
  };
  services: {
    supabase: { status: string };
    sentry: { status: string };
    analytics: { status: string };
  };
  responseTime: number;
  diagnostics?: {
    memory: {
      rss: number;
      heapTotal: number;
      heapUsed: number;
      external: number;
    };
    uptime: number;
    platform: string;
    nodeVersion: string;
    environment: Record<string, string>;
  };
}

export default function HealthMonitor() {
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchHealthData = async (detailed = false) => {
    try {
      setLoading(true);
      const method = detailed ? 'POST' : 'GET';
      const body = detailed ? JSON.stringify({ adminSecret: 'admin-check' }) : undefined;
      
      const response = await fetch('/api/health', {
        method,
        ...(detailed && {
          headers: { 'Content-Type': 'application/json' },
          body,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch health data');
      }

      const data = await response.json();
      setHealthData(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthData();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchHealthData();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'ok':
      case 'connected':
      case 'up-to-date':
      case 'valid':
      case 'configured':
        return 'text-green-600 dark:text-green-400';
      case 'degraded':
      case 'pending':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'error':
      case 'invalid':
      case 'not-configured':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'ok':
      case 'connected':
      case 'up-to-date':
      case 'valid':
      case 'configured':
        return <CheckCircle className="h-5 w-5" />;
      case 'degraded':
      case 'pending':
        return <AlertTriangle className="h-5 w-5" />;
      case 'error':
      case 'invalid':
      case 'not-configured':
        return <XCircle className="h-5 w-5" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  const formatBytes = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (loading && !healthData) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-800 rounded-lg h-32"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md mx-auto">
          <p className="text-red-800 dark:text-red-200 font-medium mb-4">Error loading health data</p>
          <p className="text-sm text-red-600 dark:text-red-300 mb-4">{error}</p>
          <button 
            onClick={() => fetchHealthData()} 
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!healthData) return null;

  return (
    <div className="space-y-6">
      {/* Overall Status */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Status
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                autoRefresh 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
            </button>
            <button
              onClick={() => fetchHealthData()}
              disabled={loading}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-1"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={() => fetchHealthData(true)}
              className="px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
            >
              Detailed Check
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className={`text-2xl font-bold ${getStatusColor(healthData.status)} flex items-center justify-center gap-2`}>
              {getStatusIcon(healthData.status)}
              {healthData.status.toUpperCase()}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Overall Status</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{healthData.responseTime}ms</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Response Time</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{healthData.environment}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Environment</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{healthData.version}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Version</p>
          </div>
        </div>
      </div>

      {/* Database Status */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Database className="h-5 w-5" />
          Database & Schema
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <div className={getStatusColor(healthData.database.status)}>
              {getStatusIcon(healthData.database.status)}
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Database</p>
              <p className={`text-sm ${getStatusColor(healthData.database.status)}`}>
                {healthData.database.status}
                {healthData.database.responseTime && ` (${healthData.database.responseTime}ms)`}
              </p>
              {healthData.database.error && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">{healthData.database.error}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className={getStatusColor(healthData.migrations.status)}>
              {getStatusIcon(healthData.migrations.status)}
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Migrations</p>
              <p className={`text-sm ${getStatusColor(healthData.migrations.status)}`}>
                {healthData.migrations.applied}/{healthData.migrations.available} applied
                {healthData.migrations.pending > 0 && ` (${healthData.migrations.pending} pending)`}
              </p>
              {healthData.migrations.error && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">{healthData.migrations.error}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className={getStatusColor(healthData.schema.status)}>
              {getStatusIcon(healthData.schema.status)}
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Schema</p>
              <p className={`text-sm ${getStatusColor(healthData.schema.status)}`}>
                {healthData.schema.status}
              </p>
              {healthData.schema.error && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">{healthData.schema.error}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Services */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Server className="h-5 w-5" />
          External Services
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(healthData.services).map(([service, data]) => (
            <div key={service} className="flex items-center gap-3">
              <div className={getStatusColor(data.status)}>
                {getStatusIcon(data.status)}
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white capitalize">{service}</p>
                <p className={`text-sm ${getStatusColor(data.status)}`}>
                  {data.status}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Flags */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Feature Flags
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Object.entries(healthData.features).map(([feature, enabled]) => (
            <div key={feature} className="flex items-center gap-2">
              <div className={enabled ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}>
                {enabled ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              </div>
              <span className="text-sm text-gray-900 dark:text-white">
                {feature.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Diagnostics */}
      {healthData.diagnostics && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Shield className="h-5 w-5" />
              System Diagnostics
            </h3>
            <button
              onClick={() => setShowDiagnostics(!showDiagnostics)}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              {showDiagnostics ? 'Hide Details' : 'Show Details'}
            </button>
          </div>

          {showDiagnostics && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Memory Usage</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatBytes(healthData.diagnostics.memory.heapUsed)} / {formatBytes(healthData.diagnostics.memory.heapTotal)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    RSS: {formatBytes(healthData.diagnostics.memory.rss)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Uptime</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatUptime(healthData.diagnostics.uptime)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Platform</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {healthData.diagnostics.platform}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Node.js</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {healthData.diagnostics.nodeVersion}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Environment Configuration</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {Object.entries(healthData.diagnostics.environment).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2 text-sm">
                      <span className="text-gray-600 dark:text-gray-400">{key}:</span>
                      <span className="text-gray-900 dark:text-white">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Last Updated */}
      <div className="text-center text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1">
        <Clock className="h-4 w-4" />
        Last updated: {new Date(healthData.timestamp).toLocaleString()}
      </div>
    </div>
  );
}