'use client';

import { useState, useEffect } from 'react';
import { 
  Database, 
  Play, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw,
  Clock,
  Shield,
  Info,
  AlertCircle
} from 'lucide-react';

interface MigrationStatus {
  available: number;
  applied: number;
  pending: number;
  lastMigration?: string;
  lastMigrationDate?: string;
  migrations?: Array<{
    id: string;
    name: string;
    applied: boolean;
    appliedAt?: string;
  }>;
}

interface MigrationResult {
  success: boolean;
  migrationsApplied: number;
  appliedMigrations: string[];
  errors: string[];
}

export default function MigrationManager() {
  const [migrationStatus, setMigrationStatus] = useState<MigrationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [runningMigrations, setRunningMigrations] = useState(false);
  const [verifyingSchema, setVerifyingSchema] = useState(false);
  const [migrationResult, setMigrationResult] = useState<MigrationResult | null>(null);
  const [schemaValid, setSchemaValid] = useState<boolean | null>(null);

  const fetchMigrationStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/migrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'status' }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch migration status');
      }

      const data = await response.json();
      setMigrationStatus(data.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const runMigrations = async () => {
    try {
      setRunningMigrations(true);
      setMigrationResult(null);
      
      const response = await fetch('/api/migrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'run',
          useAutoMigrations: true 
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to run migrations');
      }

      const data = await response.json();
      setMigrationResult(data.data);
      
      // Refresh status after running migrations
      await fetchMigrationStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Migration failed');
    } finally {
      setRunningMigrations(false);
    }
  };

  const verifySchema = async () => {
    try {
      setVerifyingSchema(true);
      
      const response = await fetch('/api/migrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify' }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to verify schema');
      }

      const data = await response.json();
      setSchemaValid(data.data.isValid);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Schema verification failed');
    } finally {
      setVerifyingSchema(false);
    }
  };

  useEffect(() => {
    fetchMigrationStatus();
  }, []);

  const getStatusColor = (status: 'success' | 'warning' | 'error') => {
    switch (status) {
      case 'success':
        return 'text-green-600 dark:text-green-400';
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'error':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: 'success' | 'warning' | 'error') => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5" />;
      case 'error':
        return <XCircle className="h-5 w-5" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  if (loading && !migrationStatus) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-800 rounded-lg h-32"></div>
        ))}
      </div>
    );
  }

  if (error && !migrationStatus) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md mx-auto">
          <p className="text-red-800 dark:text-red-200 font-medium mb-4">Error loading migration data</p>
          <p className="text-sm text-red-600 dark:text-red-300 mb-4">{error}</p>
          <button 
            onClick={() => fetchMigrationStatus()} 
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!migrationStatus) return null;

  const migrationHealth = migrationStatus.pending === 0 ? 'success' : 'warning';

  return (
    <div className="space-y-6">
      {/* Migration Status Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Database className="h-5 w-5" />
            Migration Status
          </h2>
          <button
            onClick={fetchMigrationStatus}
            disabled={loading}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-1"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className={`text-2xl font-bold ${getStatusColor(migrationHealth)} flex items-center justify-center gap-2 mb-2`}>
              {getStatusIcon(migrationHealth)}
              {migrationStatus.pending === 0 ? 'UP TO DATE' : `${migrationStatus.pending} PENDING`}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Migration Status</p>
          </div>
          
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{migrationStatus.applied}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Applied Migrations</p>
          </div>
          
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{migrationStatus.available}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Available</p>
          </div>
          
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{migrationStatus.pending}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Pending Migrations</p>
          </div>
        </div>

        {migrationStatus.lastMigration && (
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <Clock className="h-4 w-4" />
              <span>Last migration: <strong>{migrationStatus.lastMigration}</strong></span>
              {migrationStatus.lastMigrationDate && (
                <span className="text-gray-500">
                  on {new Date(migrationStatus.lastMigrationDate).toLocaleString()}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Migration Actions</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <button
              onClick={runMigrations}
              disabled={runningMigrations || migrationStatus.pending === 0}
              className="w-full px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {runningMigrations ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Running Migrations...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Run Pending Migrations ({migrationStatus.pending})
                </>
              )}
            </button>
            
            {migrationStatus.pending === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                All migrations are up to date
              </p>
            )}
          </div>

          <div className="space-y-3">
            <button
              onClick={verifySchema}
              disabled={verifyingSchema}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {verifyingSchema ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Verifying Schema...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4" />
                  Verify Database Schema
                </>
              )}
            </button>
            
            {schemaValid !== null && (
              <div className={`text-sm text-center p-2 rounded ${
                schemaValid 
                  ? 'bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-300'
                  : 'bg-red-50 text-red-800 dark:bg-red-900 dark:text-red-300'
              }`}>
                {schemaValid ? '✅ Schema is valid' : '❌ Schema validation failed'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Migration Result */}
      {migrationResult && (
        <div className={`rounded-lg shadow p-6 ${
          migrationResult.success
            ? 'bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-800'
            : 'bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800'
        }`}>
          <div className="flex items-center gap-2 mb-4">
            {migrationResult.success ? (
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            )}
            <h3 className={`text-lg font-semibold ${
              migrationResult.success 
                ? 'text-green-800 dark:text-green-200'
                : 'text-red-800 dark:text-red-200'
            }`}>
              Migration {migrationResult.success ? 'Completed' : 'Failed'}
            </h3>
          </div>

          <div className="space-y-3">
            <p className={`text-sm ${
              migrationResult.success 
                ? 'text-green-700 dark:text-green-300'
                : 'text-red-700 dark:text-red-300'
            }`}>
              {migrationResult.success 
                ? `Successfully applied ${migrationResult.migrationsApplied} migration(s)`
                : `Migration failed with ${migrationResult.errors.length} error(s)`
              }
            </p>

            {migrationResult.appliedMigrations.length > 0 && (
              <div>
                <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-2">
                  Applied Migrations:
                </p>
                <ul className="text-sm text-green-600 dark:text-green-400 space-y-1">
                  {migrationResult.appliedMigrations.map((migration, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3" />
                      {migration}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {migrationResult.errors.length > 0 && (
              <div>
                <p className="text-sm font-medium text-red-700 dark:text-red-300 mb-2">
                  Errors:
                </p>
                <ul className="text-sm text-red-600 dark:text-red-400 space-y-1">
                  {migrationResult.errors.map((error, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                      <span className="font-mono text-xs bg-red-100 dark:bg-red-800 px-2 py-1 rounded">
                        {error}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Warning Notice */}
      <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
              Important Migration Notes
            </h3>
            <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
              <li>• Always backup your database before running migrations in production</li>
              <li>• Migration operations can take time and may temporarily lock tables</li>
              <li>• This interface is only available in development environment</li>
              <li>• In production, use proper deployment scripts or CI/CD pipelines</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            <p className="text-red-800 dark:text-red-200 font-medium">Error</p>
          </div>
          <p className="text-sm text-red-600 dark:text-red-300 mt-2">{error}</p>
        </div>
      )}
    </div>
  );
}