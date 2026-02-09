'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { 
  ChevronLeft, 
  QrCode,
  Camera,
  Loader2,
  CheckCircle,
  XCircle,
  Flashlight
} from 'lucide-react';
import { useScanLoyaltyQR } from '@/hooks/useLoyalty';

export default function LoyaltyScanPage() {
  const [qrCode, setQrCode] = useState('');
  const [manualMode, setManualMode] = useState(true); // Start with manual for now
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    points?: number;
    message: string;
  } | null>(null);
  
  const scanMutation = useScanLoyaltyQR();
  
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrCode.trim()) return;
    
    scanMutation.mutate(
      { qr_code: qrCode },
      {
        onSuccess: (data) => {
          setScanResult({
            success: true,
            points: data.data.points_earned,
            message: data.message || `You earned ${data.data.points_earned} points!`
          });
          setQrCode('');
        },
        onError: (error: Error) => {
          setScanResult({
            success: false,
            message: (error as Error & { response?: { data?: { message?: string } } }).response?.data?.message || error.message || 'Invalid QR code. Please try again.'
          });
        }
      }
    );
  };
  
  const resetScan = () => {
    setScanResult(null);
    setQrCode('');
  };
  
  return (
    <div className="container max-w-lg py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/loyalty" className="p-2 rounded-lg hover:bg-muted">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Scan QR Code</h1>
          <p className="text-muted-foreground">
            Scan to earn loyalty points
          </p>
        </div>
      </div>
      
      {/* Scan Result */}
      {scanResult && (
        <div className={`p-6 rounded-xl border ${
          scanResult.success 
            ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' 
            : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
        }`}>
          <div className="flex items-center gap-4">
            {scanResult.success ? (
              <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
            ) : (
              <XCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
            )}
            <div>
              <h3 className="font-semibold text-lg">
                {scanResult.success ? 'Points Earned!' : 'Scan Failed'}
              </h3>
              <p className="text-muted-foreground">{scanResult.message}</p>
              {scanResult.points && (
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                  +{scanResult.points} pts
                </p>
              )}
            </div>
          </div>
          <button
            onClick={resetScan}
            className="w-full mt-4 px-4 py-2 border rounded-lg hover:bg-background/50"
          >
            Scan Another
          </button>
        </div>
      )}
      
      {!scanResult && (
        <>
          {/* Mode Toggle */}
          <div className="flex rounded-lg border p-1">
            <button
              onClick={() => setManualMode(false)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-colors ${
                !manualMode ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
              }`}
            >
              <Camera className="h-4 w-4" />
              Camera
            </button>
            <button
              onClick={() => setManualMode(true)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-colors ${
                manualMode ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
              }`}
            >
              <QrCode className="h-4 w-4" />
              Manual
            </button>
          </div>
          
          {manualMode ? (
            /* Manual Entry */
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div className="p-8 rounded-xl border bg-card">
                <QrCode className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <label className="block text-sm font-medium mb-2">
                  Enter QR Code
                </label>
                <input
                  type="text"
                  value={qrCode}
                  onChange={(e) => setQrCode(e.target.value)}
                  placeholder="e.g., TESO-LOYALTY-ABC123"
                  className="w-full px-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Enter the code printed below the QR code
                </p>
              </div>
              
              <button
                type="submit"
                disabled={!qrCode.trim() || scanMutation.isPending}
                className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {scanMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Submit Code'
                )}
              </button>
            </form>
          ) : (
            /* Camera Scanner Placeholder */
            <div className="space-y-4">
              <div className="aspect-square rounded-xl border bg-black/90 flex flex-col items-center justify-center relative overflow-hidden">
                {/* Scanner frame overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-64 h-64 border-2 border-white/50 rounded-lg relative">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg" />
                    
                    {/* Scanning line animation */}
                    <div className="absolute inset-x-2 h-0.5 bg-primary/70 animate-pulse top-1/2" />
                  </div>
                </div>
                
                <Camera className="h-12 w-12 text-white/50 mb-4 z-10" />
                <p className="text-white/70 text-sm z-10">Camera access needed</p>
                <p className="text-white/50 text-xs z-10">Position QR code in frame</p>
              </div>
              
              <div className="flex justify-center">
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-muted">
                  <Flashlight className="h-4 w-4" />
                  Toggle Flash
                </button>
              </div>
              
              <p className="text-center text-sm text-muted-foreground">
                Camera scanner requires browser permissions. 
                <button 
                  onClick={() => setManualMode(true)}
                  className="text-primary ml-1 hover:underline"
                >
                  Use manual entry instead
                </button>
              </p>
            </div>
          )}
        </>
      )}
      
      {/* Help Section */}
      <div className="p-4 rounded-xl bg-muted/50">
        <h3 className="font-medium mb-2">Where to find QR codes?</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Event tickets and wristbands</li>
          <li>• Artist merchandise tags</li>
          <li>• Concert posters and flyers</li>
          <li>• Album packaging</li>
          <li>• Partner venue displays</li>
        </ul>
      </div>
    </div>
  );
}
