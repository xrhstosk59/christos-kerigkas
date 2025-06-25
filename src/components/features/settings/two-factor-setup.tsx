'use client';

import { useState, useRef } from 'react';
import { Shield, Copy, Check, AlertTriangle, Smartphone } from 'lucide-react';
import type { User } from '@supabase/supabase-js';

interface TwoFactorSetupData {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

interface TwoFactorSetupProps {
  user: User;
  isEnabled: boolean;
}

export default function TwoFactorSetup({ user, isEnabled }: TwoFactorSetupProps) {
  const [setupData, setSetupData] = useState<TwoFactorSetupData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState<'initial' | 'setup' | 'verify' | 'backup'>('initial');
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedBackup, setCopiedBackup] = useState(false);
  const qrCodeRef = useRef<HTMLImageElement>(null);

  const startSetup = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/auth/2fa/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          userEmail: user.email
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to setup 2FA');
      }

      const data = await response.json();
      setSetupData(data);
      setStep('setup');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to setup 2FA');
    } finally {
      setLoading(false);
    }
  };

  const verifySetup = async () => {
    if (!verificationCode.trim() || !setupData) {
      setError('Please enter the verification code');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/auth/2fa/verify-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          token: verificationCode.trim(),
          secret: setupData.secret
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Invalid verification code');
      }

      setStep('backup');
      setSuccess('2FA has been successfully enabled!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const disable2FA = async () => {
    if (!confirm('Are you sure you want to disable two-factor authentication? This will make your account less secure.')) {
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/auth/2fa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to disable 2FA');
      }

      setSuccess('Two-factor authentication has been disabled');
      setStep('initial');
      setSetupData(null);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disable 2FA');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, type: 'secret' | 'backup') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'secret') {
        setCopiedSecret(true);
        setTimeout(() => setCopiedSecret(false), 2000);
      } else {
        setCopiedBackup(true);
        setTimeout(() => setCopiedBackup(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const finishSetup = () => {
    setStep('initial');
    setSetupData(null);
    setVerificationCode('');
    // In a real app, you'd refetch user data to reflect the 2FA status
  };

  return (
    <div className="space-y-6">
      {/* Current Status */}
      <div className={`p-4 rounded-lg border ${
        isEnabled 
          ? 'bg-green-50 border-green-200 dark:bg-green-900 dark:border-green-800'
          : 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900 dark:border-yellow-800'
      }`}>
        <div className="flex items-center gap-3">
          <Shield className={`h-5 w-5 ${
            isEnabled 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-yellow-600 dark:text-yellow-400'
          }`} />
          <div>
            <p className={`font-medium ${
              isEnabled 
                ? 'text-green-800 dark:text-green-200' 
                : 'text-yellow-800 dark:text-yellow-200'
            }`}>
              Two-Factor Authentication is {isEnabled ? 'Enabled' : 'Disabled'}
            </p>
            <p className={`text-sm ${
              isEnabled 
                ? 'text-green-600 dark:text-green-300' 
                : 'text-yellow-600 dark:text-yellow-300'
            }`}>
              {isEnabled 
                ? 'Your account is protected with 2FA'
                : 'Enable 2FA to add an extra layer of security to your account'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
            <span className="text-sm text-red-800 dark:text-red-200">{error}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span className="text-sm text-green-800 dark:text-green-200">{success}</span>
          </div>
        </div>
      )}

      {/* Initial State */}
      {step === 'initial' && (
        <div className="space-y-4">
          {!isEnabled ? (
            <button
              onClick={startSetup}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Smartphone className="h-4 w-4" />
              {loading ? 'Setting up...' : 'Enable Two-Factor Authentication'}
            </button>
          ) : (
            <button
              onClick={disable2FA}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Shield className="h-4 w-4" />
              {loading ? 'Disabling...' : 'Disable Two-Factor Authentication'}
            </button>
          )}
        </div>
      )}

      {/* Setup Step */}
      {step === 'setup' && setupData && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Step 1: Scan QR Code
            </h3>
            <div className="bg-white p-4 rounded-lg border inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                ref={qrCodeRef}
                src={setupData.qrCodeUrl} 
                alt="2FA QR Code"
                className="w-48 h-48"
              />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
            </p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              Manual Setup (if you can't scan)
            </h4>
            <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
              <code className="flex-1 text-sm font-mono text-gray-900 dark:text-white break-all">
                {setupData.secret}
              </code>
              <button
                onClick={() => copyToClipboard(setupData.secret, 'secret')}
                className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                {copiedSecret ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Step 2: Enter Verification Code
            </h3>
            <div className="flex gap-3">
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="Enter 6-digit code"
                maxLength={6}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <button
                onClick={verifySetup}
                disabled={loading || !verificationCode.trim()}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Verifying...' : 'Verify'}
              </button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Enter the 6-digit code from your authenticator app
            </p>
          </div>
        </div>
      )}

      {/* Backup Codes Step */}
      {step === 'backup' && setupData && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Save Your Recovery Codes
            </h3>
            <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                    Important: Save these recovery codes
                  </p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    Store these codes in a safe place. You can use them to access your account if you lose your authenticator device.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  Recovery Codes
                </h4>
                <button
                  onClick={() => copyToClipboard(setupData.backupCodes.join('\n'), 'backup')}
                  className="flex items-center gap-1 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                >
                  {copiedBackup ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  {copiedBackup ? 'Copied!' : 'Copy All'}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {setupData.backupCodes.map((code, index) => (
                  <code 
                    key={index}
                    className="text-sm font-mono text-gray-900 dark:text-white bg-white dark:bg-gray-600 p-2 rounded border"
                  >
                    {code}
                  </code>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={finishSetup}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Complete Setup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}