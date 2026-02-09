'use client';

import { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import { CheckCircle, XCircle, ScanLine, Loader2, Info, QrCode } from 'lucide-react';
import { useCheckInTicket, useValidateTicket } from '@/hooks/useEvents';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function QRScannerPage() {
  const [manualCode, setManualCode] = useState('');
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const scannerDivId = "qr-scanner";
  
  const checkInTicket = useCheckInTicket();
  const { data: validationResult } = useValidateTicket(scanResult || '');
  
  useEffect(() => {
    if (!isScanning) {
      // Cleanup scanner
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
        scannerRef.current = null;
      }
      return;
    }
    
    // Initialize scanner
    const scanner = new Html5QrcodeScanner(
      scannerDivId,
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
        showTorchButtonIfSupported: true,
      },
      false
    );
    
    scanner.render(
      (decodedText) => {
        setScanResult(decodedText);
        setIsScanning(false);
        scanner.clear().catch(console.error);
      },
      (errorMessage) => {
        // Ignore scan errors (they happen frequently)
      }
    );
    
    scannerRef.current = scanner;
    
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
      }
    };
  }, [isScanning]);
  
  const handleCheckIn = async (ticketNumber: string) => {
    try {
      const result = await checkInTicket.mutateAsync({ ticket_number: ticketNumber });
      toast.success(result.message || 'Ticket checked in successfully!');
      setScanResult(null);
      setManualCode('');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to check in ticket');
    }
  };
  
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      setScanResult(manualCode.trim());
    }
  };
  
  return (
    <div className="container py-8 max-w-2xl space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Ticket Check-In</h1>
        <p className="text-muted-foreground">
          Scan QR codes to verify and check in event tickets
        </p>
      </div>
      
      {/* Scanner Status */}
      {!isScanning && !scanResult && (
        <div className="space-y-4">
          {/* Start Scanning Button */}
          <button
            onClick={() => setIsScanning(true)}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl border-2 border-dashed border-primary/50 bg-primary/5 hover:bg-primary/10 transition-colors"
          >
            <ScanLine className="h-6 w-6 text-primary" />
            <span className="font-medium">Start QR Scanner</span>
          </button>
          
          {/* Manual Entry */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-muted" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or enter manually</span>
            </div>
          </div>
          
          <form onSubmit={handleManualSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-2">
                Ticket Number
              </label>
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Enter ticket number"
                className="w-full px-4 py-3 rounded-lg border bg-background font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={!manualCode.trim()}
              className={cn(
                'w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors',
                manualCode.trim()
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              )}
            >
              <QrCode className="h-5 w-5" />
              Validate Ticket
            </button>
          </form>
        </div>
      )}
      
      {/* Scanner */}
      {isScanning && (
        <div className="space-y-4">
          <div className="p-4 rounded-lg border bg-card">
            <div id={scannerDivId} className="w-full" />
          </div>
          <button
            onClick={() => setIsScanning(false)}
            className="w-full px-6 py-3 rounded-lg border bg-background hover:bg-muted transition-colors"
          >
            Cancel Scanning
          </button>
          
          <div className="flex items-start gap-2 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-500">
              Point your camera at the QR code on the ticket. Make sure the code is well-lit and centered.
            </p>
          </div>
        </div>
      )}
      
      {/* Validation Result */}
      {scanResult && validationResult && (
        <div className="space-y-4">
          {validationResult.valid && validationResult.ticket ? (
            <div className="p-6 rounded-lg border-2 border-green-500 bg-green-500/10 space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div>
                  <h3 className="text-lg font-semibold text-green-500">Valid Ticket</h3>
                  <p className="text-sm text-muted-foreground">{validationResult.message}</p>
                </div>
              </div>
              
              <div className="h-px bg-border" />
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Event:</span>
                  <span className="font-medium">{validationResult.ticket.event.title}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Ticket Type:</span>
                  <span className="font-medium">{validationResult.ticket.ticket_tier.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Holder:</span>
                  <span className="font-medium">{validationResult.ticket.holder_name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Status:</span>
                  <span className={cn(
                    'font-medium capitalize',
                    validationResult.ticket.status === 'valid' ? 'text-green-500' : 'text-red-500'
                  )}>
                    {validationResult.ticket.status}
                  </span>
                </div>
              </div>
              
              {validationResult.ticket.status === 'valid' && (
                <button
                  onClick={() => handleCheckIn(scanResult)}
                  disabled={checkInTicket.isPending}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                >
                  {checkInTicket.isPending ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Checking In...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5" />
                      Check In Guest
                    </>
                  )}
                </button>
              )}
            </div>
          ) : (
            <div className="p-6 rounded-lg border-2 border-red-500 bg-red-500/10">
              <div className="flex items-center gap-3 mb-4">
                <XCircle className="h-8 w-8 text-red-500" />
                <div>
                  <h3 className="text-lg font-semibold text-red-500">Invalid Ticket</h3>
                  <p className="text-sm text-muted-foreground">{validationResult.message}</p>
                </div>
              </div>
            </div>
          )}
          
          <button
            onClick={() => {
              setScanResult(null);
              setManualCode('');
            }}
            className="w-full px-6 py-3 rounded-lg border bg-background hover:bg-muted transition-colors"
          >
            Scan Another Ticket
          </button>
        </div>
      )}
      
      {/* Info Card */}
      {!isScanning && !scanResult && (
        <div className="p-4 rounded-lg bg-muted/50 border">
          <h3 className="font-medium mb-2">How to use:</h3>
          <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
            <li>Click "Start QR Scanner" or enter ticket number manually</li>
            <li>Point camera at the ticket's QR code</li>
            <li>Wait for automatic detection</li>
            <li>Review ticket details</li>
            <li>Click "Check In Guest" to admit entry</li>
          </ol>
        </div>
      )}
    </div>
  );
}
