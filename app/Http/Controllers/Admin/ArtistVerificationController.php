<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Artist;
use App\Services\Auth\ArtistVerificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

/**
 * Artist Verification Controller (Admin)
 * 
 * Handles admin review and verification of artist applications
 */
class ArtistVerificationController extends Controller
{
    protected ArtistVerificationService $verificationService;

    public function __construct(ArtistVerificationService $verificationService)
    {
        $this->verificationService = $verificationService;
        
        // Ensure user has admin access
        $this->middleware(['auth', 'admin']);
    }

    /**
     * List pending artist applications
     * 
     * @param Request $request
     * @return \Illuminate\View\View
     */
    public function index(Request $request)
    {
        $status = $request->get('status', 'pending');
        $search = $request->get('search');
        
        $query = Artist::with(['user.kycDocuments', 'primaryGenre']);

        // Filter by status
        if ($status && $status !== 'all') {
            // Map status values: pending/active/rejected
            $query->where('status', $status === 'verified' ? 'active' : $status);
        }

        // Search by stage name or user name
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('stage_name', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($userQuery) use ($search) {
                      $userQuery->where('name', 'like', "%{$search}%")
                                ->orWhere('email', 'like', "%{$search}%");
                  });
            });
        }

        // Order by most recent first
        $applications = $query->latest('created_at')->paginate(20);

        // Get statistics
        $statistics = $this->verificationService->getApplicationStatistics();

        return view('admin.artist-verification.index', [
            'applications' => $applications,
            'statistics' => $statistics,
            'currentStatus' => $status,
            'search' => $search,
        ]);
    }

    /**
     * Show detailed view of an artist application
     * 
     * @param Artist $artist
     * @return \Illuminate\View\View
     */
    public function show(Artist $artist)
    {
        // Load relationships
        $artist->load([
            'user.kycDocuments',
            'user.roles',
            'primaryGenre',
            'songs' => fn($q) => $q->latest()->limit(10),
            'verifiedBy',
        ]);

        return view('admin.artist-verification.show', [
            'artist' => $artist,
            'user' => $artist->user,
            'kycDocuments' => $artist->user->kycDocuments,
        ]);
    }

    /**
     * Approve artist application
     * 
     * @param Request $request
     * @param Artist $artist
     * @return \Illuminate\Http\RedirectResponse
     */
    public function approve(Request $request, Artist $artist)
    {
        // Validate notes
        $validated = $request->validate([
            'notes' => 'nullable|string|max:1000',
        ]);

        try {
            $admin = Auth::user();
            
            // Approve the artist
            $this->verificationService->approveArtist(
                $artist,
                $admin,
                $validated['notes'] ?? null
            );

            return redirect()->route('admin.artist-verification.index')
                ->with('success', "Artist '{$artist->stage_name}' has been approved successfully!");
                
        } catch (\Exception $e) {
            logger()->error('Artist approval error', [
                'artist_id' => $artist->id,
                'admin_id' => Auth::id(),
                'error' => $e->getMessage(),
            ]);

            return back()->with('error', 'Failed to approve artist: ' . $e->getMessage());
        }
    }

    /**
     * Reject artist application
     * 
     * @param Request $request
     * @param Artist $artist
     * @return \Illuminate\Http\RedirectResponse
     */
    public function reject(Request $request, Artist $artist)
    {
        // Validate rejection reason
        $validated = $request->validate([
            'reason' => 'required|string|max:1000',
        ], [
            'reason.required' => 'Please provide a reason for rejection.',
        ]);

        try {
            $admin = Auth::user();
            
            // Reject the artist
            $this->verificationService->rejectArtist(
                $artist,
                $admin,
                $validated['reason']
            );

            return redirect()->route('admin.artist-verification.index')
                ->with('success', "Artist application rejected. User has been notified.");
                
        } catch (\Exception $e) {
            logger()->error('Artist rejection error', [
                'artist_id' => $artist->id,
                'admin_id' => Auth::id(),
                'error' => $e->getMessage(),
            ]);

            return back()->with('error', 'Failed to reject artist: ' . $e->getMessage());
        }
    }

    /**
     * Request more information from artist
     * 
     * @param Request $request
     * @param Artist $artist
     * @return \Illuminate\Http\RedirectResponse
     */
    public function requestInfo(Request $request, Artist $artist)
    {
        $validated = $request->validate([
            'notes' => 'required|string|max:1000',
            'missing_documents' => 'nullable|array',
            'missing_documents.*' => 'string|in:national_id_front,national_id_back,selfie_with_id,proof_of_address',
        ]);

        try {
            $admin = Auth::user();
            
            $this->verificationService->requestMoreInfo(
                $artist,
                $admin,
                $validated['missing_documents'] ?? [],
                $validated['notes']
            );

            return redirect()->route('admin.artist-verification.show', $artist)
                ->with('success', 'Additional information request sent to artist');
                
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to send request: ' . $e->getMessage());
        }
    }

    /**
     * Download KYC document
     * 
     * @param Artist $artist
     * @param int $documentId
     * @return \Symfony\Component\HttpFoundation\BinaryFileResponse
     */
    public function downloadDocument(Artist $artist, int $documentId)
    {
        // Find the document
        $document = $artist->user->kycDocuments()->findOrFail($documentId);

        // Check if file exists
        if (!$document->fileExists()) {
            abort(404, 'Document file not found');
        }

        // Log the download
        logger()->info('KYC document downloaded', [
            'admin_id' => Auth::id(),
            'document_id' => $documentId,
            'artist_id' => $artist->id,
        ]);

        $filePath = storage_path('app/private/' . $document->file_path);
        
        // Return file download response
        return response()->download($filePath, $document->file_name, [
            'Content-Type' => $document->mime_type,
        ]);
    }

    /**
     * View KYC document (inline)
     * 
     * @param Artist $artist
     * @param int $documentId
     * @return \Symfony\Component\HttpFoundation\BinaryFileResponse
     */
    public function viewDocument(Artist $artist, int $documentId)
    {
        $document = $artist->user->kycDocuments()->findOrFail($documentId);

        if (!$document->fileExists()) {
            abort(404, 'Document file not found');
        }

        // Log the view
        logger()->info('KYC document viewed', [
            'admin_id' => Auth::id(),
            'document_id' => $documentId,
            'artist_id' => $artist->id,
        ]);

        $filePath = storage_path('app/private/' . $document->file_path);
        
        // Return file response with proper headers for inline viewing
        return response()->file($filePath, [
            'Content-Type' => $document->mime_type,
            'Content-Disposition' => 'inline; filename="' . $document->file_name . '"',
            'Cache-Control' => 'no-cache, must-revalidate',
        ]);
    }

    /**
     * Bulk action on multiple applications
     * 
     * @param Request $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function bulkAction(Request $request)
    {
        $validated = $request->validate([
            'action' => 'required|in:approve,reject,mark_review',
            'artist_ids' => 'required|array',
            'artist_ids.*' => 'exists:artists,id',
            'reason' => 'required_if:action,reject|string|max:500',
        ]);

        $action = $validated['action'];
        $artistIds = $validated['artist_ids'];
        $admin = Auth::user();
        $successCount = 0;

        foreach ($artistIds as $artistId) {
            try {
                $artist = Artist::findOrFail($artistId);

                switch ($action) {
                    case 'approve':
                        $this->verificationService->approveArtist($artist, $admin);
                        $successCount++;
                        break;

                    case 'reject':
                        $this->verificationService->rejectArtist($artist, $admin, $validated['reason']);
                        $successCount++;
                        break;

                    case 'mark_review':
                        $artist->update(['status' => 'pending']);
                        $successCount++;
                        break;
                }
            } catch (\Exception $e) {
                logger()->error('Bulk action error', [
                    'artist_id' => $artistId,
                    'action' => $action,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        $message = "{$successCount} artist application(s) processed successfully";
        return redirect()->route('admin.artist-verification.index')->with('success', $message);
    }

    /**
     * Export artist information as printable HTML/PDF
     * 
     * @param Artist $artist
     * @return \Illuminate\View\View
     */
    public function exportPdf(Artist $artist)
    {
        // Load all necessary relationships
        $artist->load([
            'user.kycDocuments',
            'user.roles',
            'primaryGenre',
            'songs' => fn($q) => $q->latest()->limit(10),
            'albums' => fn($q) => $q->latest()->limit(5),
            'verifiedBy',
        ]);

        $user = $artist->user;
        $kycDocuments = $user->kycDocuments ?? collect();
        
        // Get statistics
        $stats = [
            'total_songs' => $artist->songs_count ?? $artist->songs->count(),
            'total_albums' => $artist->albums_count ?? $artist->albums->count(),
            'total_followers' => $artist->followers_count ?? 0,
            'total_plays' => $artist->total_plays ?? 0,
            'member_since' => $artist->created_at->format('F Y'),
        ];

        return view('admin.artist-verification.export-pdf', compact('artist', 'user', 'kycDocuments', 'stats'));
    }
}
