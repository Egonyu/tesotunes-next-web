@extends('layouts.admin')

@section('title', 'QR Scanner - ' . $event->title)

@section('page-header')
    <div class="flex items-center justify-between py-6">
        <div>
            <h1 class="text-2xl font-bold text-slate-800 dark:text-navy-50">QR Code Scanner</h1>
            <p class="text-slate-500 dark:text-navy-300">Scan tickets for {{ $event->title }}</p>
        </div>
        <div class="flex items-center space-x-2">
            <a href="{{ route('admin.events.check-in.index', $event) }}" class="btn border border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-navy-500 dark:text-navy-100 dark:hover:bg-navy-600">
                <svg xmlns="http://www.w3.org/2000/svg" class="size-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Check-in
            </a>
        </div>
    </div>
@endsection

@section('content')
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <!-- QR Scanner -->
        <div class="card">
            <div class="p-4 sm:p-5">
                <h3 class="text-lg font-medium text-slate-700 dark:text-navy-100 mb-4">Scan QR Code</h3>

                <!-- Camera Container -->
                <div class="relative">
                    <div id="camera-container" class="aspect-square bg-slate-100 dark:bg-navy-600 rounded-lg overflow-hidden relative">
                        <video id="camera-feed" class="w-full h-full object-cover" autoplay muted playsinline></video>

                        <!-- Scanner Overlay -->
                        <div class="absolute inset-0 pointer-events-none">
                            <div class="absolute inset-4 border-2 border-primary border-dashed rounded-lg"></div>
                            <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                <div class="w-48 h-48 border-2 border-primary rounded-lg relative">
                                    <!-- Corner indicators -->
                                    <div class="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-primary rounded-tl-lg"></div>
                                    <div class="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-primary rounded-tr-lg"></div>
                                    <div class="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-primary rounded-bl-lg"></div>
                                    <div class="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-primary rounded-br-lg"></div>

                                    <!-- Scanning line -->
                                    <div id="scan-line" class="absolute w-full h-0.5 bg-primary opacity-75 animate-pulse"></div>
                                </div>
                            </div>
                        </div>

                        <!-- Camera status overlay -->
                        <div id="camera-status" class="absolute inset-0 flex items-center justify-center bg-slate-900/75 text-white hidden">
                            <div class="text-center">
                                <svg id="camera-loading" xmlns="http://www.w3.org/2000/svg" class="size-12 mx-auto mb-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                <p id="camera-status-text">Starting camera...</p>
                            </div>
                        </div>
                    </div>

                    <!-- Camera Controls -->
                    <div class="flex items-center justify-center space-x-4 mt-4">
                        <button id="start-camera" class="btn bg-primary text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" class="size-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Start Camera
                        </button>
                        <button id="stop-camera" class="btn border border-slate-300 text-slate-700 hidden">
                            <svg xmlns="http://www.w3.org/2000/svg" class="size-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                            </svg>
                            Stop Camera
                        </button>
                        <button id="switch-camera" class="btn border border-slate-300 text-slate-700 hidden" title="Switch Camera">
                            <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                            </svg>
                        </button>
                    </div>
                </div>

                <!-- Manual Input Fallback -->
                <div class="mt-6 pt-6 border-t border-slate-200 dark:border-navy-500">
                    <h4 class="font-medium text-slate-700 dark:text-navy-100 mb-3">Manual Ticket Code Entry</h4>
                    <div class="flex space-x-2">
                        <input type="text" id="manual-ticket-code"
                               placeholder="Enter ticket code manually..."
                               class="form-input flex-1"
                               autocomplete="off">
                        <button id="validate-manual" class="btn bg-primary text-white">
                            Validate
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Scan Results and Recent Scans -->
        <div class="space-y-6">
            <!-- Ticket Validation Result -->
            <div id="validation-result" class="card hidden">
                <div class="p-4 sm:p-5">
                    <h3 class="text-lg font-medium text-slate-700 dark:text-navy-100 mb-4">Ticket Validation</h3>
                    <div id="validation-content">
                        <!-- Content will be populated by JavaScript -->
                    </div>
                </div>
            </div>

            <!-- Recent Scans -->
            <div class="card">
                <div class="p-4 sm:p-5">
                    <h3 class="text-lg font-medium text-slate-700 dark:text-navy-100 mb-4">Recent Scans</h3>
                    <div id="recent-scans" class="space-y-3 max-h-96 overflow-y-auto">
                        <div class="text-center py-8 text-slate-500 dark:text-navy-300">
                            <svg xmlns="http://www.w3.org/2000/svg" class="size-12 mx-auto mb-3 text-slate-300 dark:text-navy-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h2M4 4h5v5H4V4zm11 14h5v5h-5v-5zM4 15h5v5H4v-5z" />
                            </svg>
                            No scans yet
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Audio for scan feedback -->
    <audio id="scan-success-sound" preload="auto">
        <source src="{{ asset('sounds/scan-success.mp3') }}" type="audio/mpeg">
    </audio>
    <audio id="scan-error-sound" preload="auto">
        <source src="{{ asset('sounds/scan-error.mp3') }}" type="audio/mpeg">
    </audio>

    <!-- Success/Error Messages -->
    <div id="message-container" class="fixed top-4 right-4 z-50"></div>
@endsection

@section('scripts')
<!-- Include QR Scanner Library -->
<script src="https://unpkg.com/qr-scanner@1.4.2/qr-scanner.umd.min.js"></script>

<script>
document.addEventListener('DOMContentLoaded', function() {
    let qrScanner = null;
    let isScanning = false;
    let currentCamera = 'environment'; // 'user' for front camera, 'environment' for back camera

    const cameraFeed = document.getElementById('camera-feed');
    const cameraStatus = document.getElementById('camera-status');
    const cameraStatusText = document.getElementById('camera-status-text');
    const startCameraBtn = document.getElementById('start-camera');
    const stopCameraBtn = document.getElementById('stop-camera');
    const switchCameraBtn = document.getElementById('switch-camera');
    const manualTicketCode = document.getElementById('manual-ticket-code');
    const validateManualBtn = document.getElementById('validate-manual');
    const validationResult = document.getElementById('validation-result');
    const validationContent = document.getElementById('validation-content');
    const recentScans = document.getElementById('recent-scans');
    const messageContainer = document.getElementById('message-container');
    const scanSuccessSound = document.getElementById('scan-success-sound');
    const scanErrorSound = document.getElementById('scan-error-sound');

    let recentScansData = [];

    // Initialize QR Scanner
    function initQRScanner() {
        if (qrScanner) {
            qrScanner.destroy();
        }

        qrScanner = new QrScanner(
            cameraFeed,
            result => handleScanResult(result.data),
            {
                highlightScanRegion: false,
                highlightCodeOutline: false,
                preferredCamera: currentCamera,
                maxScansPerSecond: 3,
            }
        );

        qrScanner.setInversionMode('both');
    }

    // Handle scan result
    function handleScanResult(ticketCode) {
        if (!isScanning) return;

        console.log('Scanned ticket code:', ticketCode);
        validateTicket(ticketCode);
    }

    // Start camera
    async function startCamera() {
        try {
            showCameraStatus('Starting camera...');

            if (!qrScanner) {
                initQRScanner();
            }

            await qrScanner.start();

            isScanning = true;
            hideCameraStatus();
            startCameraBtn.classList.add('hidden');
            stopCameraBtn.classList.remove('hidden');
            switchCameraBtn.classList.remove('hidden');

            showMessage('Camera started successfully', 'success');
        } catch (error) {
            console.error('Camera start error:', error);
            showCameraStatus('Camera access denied or not available');
            showMessage('Failed to start camera. Please check permissions.', 'error');
        }
    }

    // Stop camera
    function stopCamera() {
        if (qrScanner) {
            qrScanner.stop();
        }

        isScanning = false;
        showCameraStatus('Camera stopped');
        startCameraBtn.classList.remove('hidden');
        stopCameraBtn.classList.add('hidden');
        switchCameraBtn.classList.add('hidden');
    }

    // Switch camera
    async function switchCamera() {
        if (!qrScanner) return;

        try {
            currentCamera = currentCamera === 'environment' ? 'user' : 'environment';
            showCameraStatus('Switching camera...');

            await qrScanner.setCamera(currentCamera);
            hideCameraStatus();

            showMessage(`Switched to ${currentCamera === 'environment' ? 'back' : 'front'} camera`, 'success');
        } catch (error) {
            console.error('Camera switch error:', error);
            showMessage('Failed to switch camera', 'error');
            hideCameraStatus();
        }
    }

    // Show/hide camera status
    function showCameraStatus(text) {
        cameraStatusText.textContent = text;
        cameraStatus.classList.remove('hidden');
    }

    function hideCameraStatus() {
        cameraStatus.classList.add('hidden');
    }

    // Validate ticket
    async function validateTicket(ticketCode) {
        try {
            const response = await fetch(`{{ route('admin.events.check-in.validate', $event) }}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                },
                body: JSON.stringify({ ticket_code: ticketCode })
            });

            const data = await response.json();
            displayValidationResult(data, ticketCode);

            if (data.success) {
                scanSuccessSound.play().catch(e => console.log('Audio play failed:', e));
            } else {
                scanErrorSound.play().catch(e => console.log('Audio play failed:', e));
            }

            addToRecentScans(data, ticketCode);
        } catch (error) {
            console.error('Validation error:', error);
            showMessage('Validation failed. Please try again.', 'error');
            scanErrorSound.play().catch(e => console.log('Audio play failed:', e));
        }
    }

    // Display validation result
    function displayValidationResult(data, ticketCode) {
        let content = '';

        if (data.success) {
            const attendee = data.attendee;
            content = `
                <div class="border border-success/20 bg-success/5 rounded-lg p-4">
                    <div class="flex items-center space-x-3 mb-4">
                        <div class="size-12 rounded-full bg-success flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" class="size-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <h4 class="font-semibold text-success text-lg">Valid Ticket</h4>
                            <p class="text-sm text-success/80">${data.message}</p>
                        </div>
                    </div>

                    <div class="space-y-3">
                        <div class="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p class="text-slate-500 dark:text-navy-400">Name</p>
                                <p class="font-medium">${attendee.name}</p>
                            </div>
                            <div>
                                <p class="text-slate-500 dark:text-navy-400">Email</p>
                                <p class="font-medium">${attendee.email}</p>
                            </div>
                            <div>
                                <p class="text-slate-500 dark:text-navy-400">Ticket Type</p>
                                <p class="font-medium">${attendee.ticket_type}</p>
                            </div>
                            <div>
                                <p class="text-slate-500 dark:text-navy-400">Amount Paid</p>
                                <p class="font-medium">${attendee.amount_paid}</p>
                            </div>
                            <div>
                                <p class="text-slate-500 dark:text-navy-400">Status</p>
                                <p class="font-medium">${attendee.status}</p>
                            </div>
                            <div>
                                <p class="text-slate-500 dark:text-navy-400">Registration Date</p>
                                <p class="font-medium">${attendee.registration_date}</p>
                            </div>
                        </div>

                        ${attendee.special_requirements ? `
                        <div>
                            <p class="text-slate-500 dark:text-navy-400 text-sm">Special Requirements</p>
                            <p class="font-medium text-sm">${attendee.special_requirements}</p>
                        </div>
                        ` : ''}

                        <div class="pt-3 border-t border-success/20">
                            <button onclick="processCheckIn(${attendee.id})" class="btn bg-success text-white w-full">
                                <svg xmlns="http://www.w3.org/2000/svg" class="size-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Check In Attendee
                            </button>
                        </div>
                    </div>
                </div>
            `;
        } else {
            content = `
                <div class="border border-error/20 bg-error/5 rounded-lg p-4">
                    <div class="flex items-center space-x-3">
                        <div class="size-12 rounded-full bg-error flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" class="size-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <div>
                            <h4 class="font-semibold text-error text-lg">Invalid Ticket</h4>
                            <p class="text-sm text-error/80">${data.message}</p>
                            <p class="text-xs text-slate-500 dark:text-navy-400 mt-1">Ticket Code: ${ticketCode}</p>
                        </div>
                    </div>
                </div>
            `;
        }

        validationContent.innerHTML = content;
        validationResult.classList.remove('hidden');
    }

    // Process check-in
    window.processCheckIn = async function(attendeeId) {
        try {
            const response = await fetch(`{{ route('admin.events.check-in.process', $event) }}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                },
                body: JSON.stringify({ attendee_id: attendeeId })
            });

            const data = await response.json();

            if (data.success) {
                showMessage(data.message, 'success');
                validationResult.classList.add('hidden');

                // Add to recent scans with check-in status
                addToRecentScans({
                    success: true,
                    type: 'check_in',
                    attendee: data.attendee,
                    message: data.message
                }, null);
            } else {
                showMessage(data.message, 'error');
            }
        } catch (error) {
            console.error('Check-in error:', error);
            showMessage('Check-in failed. Please try again.', 'error');
        }
    };

    // Add to recent scans
    function addToRecentScans(data, ticketCode) {
        const scanData = {
            ...data,
            ticketCode,
            timestamp: new Date(),
            id: Date.now()
        };

        recentScansData.unshift(scanData);
        if (recentScansData.length > 10) {
            recentScansData.pop();
        }

        updateRecentScansDisplay();
    }

    // Update recent scans display
    function updateRecentScansDisplay() {
        if (recentScansData.length === 0) {
            recentScans.innerHTML = `
                <div class="text-center py-8 text-slate-500 dark:text-navy-300">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-12 mx-auto mb-3 text-slate-300 dark:text-navy-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h2M4 4h5v5H4V4zm11 14h5v5h-5v-5zM4 15h5v5H4v-5z" />
                    </svg>
                    No scans yet
                </div>
            `;
            return;
        }

        recentScans.innerHTML = recentScansData.map(scan => {
            const icon = scan.success ?
                '<svg class="size-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>' :
                '<svg class="size-5 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>';

            return `
                <div class="flex items-center space-x-3 p-3 border border-slate-200 dark:border-navy-500 rounded-lg">
                    <div class="flex-shrink-0">${icon}</div>
                    <div class="flex-1 min-w-0">
                        <p class="font-medium text-slate-700 dark:text-navy-100 truncate">
                            ${scan.attendee ? scan.attendee.name : 'Invalid Ticket'}
                        </p>
                        <p class="text-xs text-slate-400 dark:text-navy-300">
                            ${scan.ticketCode || 'Check-in'} • ${scan.timestamp.toLocaleTimeString()}
                        </p>
                        <p class="text-xs ${scan.success ? 'text-success' : 'text-error'}">
                            ${scan.message}
                        </p>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Event listeners
    startCameraBtn.addEventListener('click', startCamera);
    stopCameraBtn.addEventListener('click', stopCamera);
    switchCameraBtn.addEventListener('click', switchCamera);

    validateManualBtn.addEventListener('click', function() {
        const ticketCode = manualTicketCode.value.trim();
        if (ticketCode) {
            validateTicket(ticketCode);
            manualTicketCode.value = '';
        }
    });

    manualTicketCode.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            validateManualBtn.click();
        }
    });

    // Show message function
    function showMessage(message, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `alert ${type === 'success' ? 'alert-success' :
                                      type === 'warning' ? 'alert-warning' : 'alert-error'}
                                mb-4 transition-all duration-300`;
        messageDiv.textContent = message;

        messageContainer.appendChild(messageDiv);

        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }

    // Cleanup on page unload
    window.addEventListener('beforeunload', function() {
        if (qrScanner) {
            qrScanner.destroy();
        }
    });

    // Initialize scanner on load
    initQRScanner();
});
</script>
@endsection