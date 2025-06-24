// src/components/features/admin/2fa-setup.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Key, Download, Copy, Check } from 'lucide-react';

interface TwoFactorSetupProps {
  userId: string;
  userEmail: string;
  onComplete: () => void;
  onCancel: () => void;
}

interface SetupData {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

export function TwoFactorSetup({ userId, userEmail, onComplete, onCancel }: TwoFactorSetupProps) {
  const [step, setStep] = useState<'generate' | 'verify' | 'backup'>('generate');
  const [setupData, setSetupData] = useState<SetupData | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedCodes, setCopiedCodes] = useState(false);

  const generate2FA = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/auth/2fa/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, userEmail }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate 2FA setup');
      }

      const data = await response.json();
      setSetupData(data);
      setStep('verify');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Σφάλμα κατά τη δημιουργία 2FA');
    } finally {
      setLoading(false);
    }
  };

  const verify2FA = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Εισάγετε έναν έγκυρο 6-ψήφιο κωδικό');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/2fa/verify-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, token: verificationCode }),
      });

      if (!response.ok) {
        throw new Error('Invalid verification code');
      }

      setStep('backup');
    } catch {
      setError('Λάθος κωδικός. Παρακαλώ δοκιμάστε ξανά.');
    } finally {
      setLoading(false);
    }
  };

  const copyBackupCodes = async () => {
    if (!setupData?.backupCodes) return;
    
    const codesText = setupData.backupCodes.join('\n');
    await navigator.clipboard.writeText(codesText);
    setCopiedCodes(true);
    setTimeout(() => setCopiedCodes(false), 2000);
  };

  const downloadBackupCodes = () => {
    if (!setupData?.backupCodes) return;
    
    const codesText = setupData.backupCodes.join('\n');
    const blob = new Blob([codesText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '2fa-backup-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="max-w-md mx-auto p-6">
      <div className="text-center mb-6">
        <Shield className="h-12 w-12 mx-auto mb-4 text-blue-600" />
        <h2 className="text-2xl font-bold">Ενεργοποίηση 2FA</h2>
        <p className="text-gray-600 mt-2">
          Ενισχύστε την ασφάλεια του λογαριασμού σας
        </p>
      </div>

      {error && (
        <Alert className="mb-4" variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {step === 'generate' && (
        <div className="space-y-4">
          <div className="text-center">
            <Key className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-600">
              Ο Two-Factor Authentication προσθέτει ένα επιπλέον επίπεδο ασφάλειας στον λογαριασμό σας.
            </p>
          </div>
          
          <div className="space-y-2">
            <Button 
              onClick={generate2FA} 
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Δημιουργία...' : 'Ξεκινήστε την εγκατάσταση'}
            </Button>
            <Button onClick={onCancel} variant="outline" className="w-full">
              Ακύρωση
            </Button>
          </div>
        </div>
      )}

      {step === 'verify' && setupData && (
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="font-semibold mb-2">Σκανάρετε τον κωδικό QR</h3>
            <p className="text-sm text-gray-600 mb-4">
              Χρησιμοποιήστε μια εφαρμογή όπως Google Authenticator ή Authy
            </p>
            
            <div className="bg-white p-4 rounded-lg border inline-block">
              <Image
                src={setupData.qrCodeUrl}
                alt="QR Code για 2FA"
                width={200}
                height={200}
                className="mx-auto"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Κωδικός επαλήθευσης
            </label>
            <Input
              type="text"
              placeholder="6-ψήφιος κωδικός"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="text-center text-lg tracking-widest"
              maxLength={6}
            />
          </div>

          <div className="space-y-2">
            <Button 
              onClick={verify2FA} 
              disabled={loading || verificationCode.length !== 6}
              className="w-full"
            >
              {loading ? 'Επαλήθευση...' : 'Επαλήθευση'}
            </Button>
            <Button onClick={() => setStep('generate')} variant="outline" className="w-full">
              Πίσω
            </Button>
          </div>
        </div>
      )}

      {step === 'backup' && setupData && (
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="font-semibold mb-2">Αποθηκεύστε τους κωδικούς ανάκτησης</h3>
            <p className="text-sm text-gray-600 mb-4">
              Αυτοί οι κωδικοί θα σας επιτρέψουν πρόσβαση αν χάσετε τη συσκευή σας
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-2 text-sm font-mono">
              {setupData.backupCodes.map((code, index) => (
                <div key={index} className="text-center py-1">
                  {code}
                </div>
              ))}
            </div>
          </div>

          <div className="flex space-x-2">
            <Button
              onClick={copyBackupCodes}
              variant="outline"
              className="flex-1"
              size="sm"
            >
              {copiedCodes ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
              {copiedCodes ? 'Αντιγράφηκαν!' : 'Αντιγραφή'}
            </Button>
            <Button
              onClick={downloadBackupCodes}
              variant="outline"
              className="flex-1"
              size="sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Λήψη
            </Button>
          </div>

          <Alert>
            <AlertDescription>
              <strong>Σημαντικό:</strong> Αποθηκεύστε αυτούς τους κωδικούς σε ασφαλές μέρος. 
              Κάθε κωδικός μπορεί να χρησιμοποιηθεί μόνο μία φορά.
            </AlertDescription>
          </Alert>

          <Button onClick={onComplete} className="w-full">
            Ολοκλήρωση εγκατάστασης
          </Button>
        </div>
      )}
    </Card>
  );
}