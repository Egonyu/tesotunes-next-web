<?php

namespace App\Modules\Forum\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Models\Modules\Forum\Poll;
use App\Modules\Forum\Services\PollService;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\View\View;

class PollController extends Controller
{
    public function __construct(
        protected PollService $pollService
    ) {}

    /**
     * Display all active polls
     */
    public function index(): View
    {
        $polls = $this->pollService->getActivePolls(auth()->user(), 20);
        
        return view('modules.forum.frontend.polls.index', compact('polls'));
    }

    /**
     * Show form to create a new poll
     */
    public function create(): View
    {
        $this->authorize('create', Poll::class);
        
        return view('modules.forum.frontend.polls.create');
    }

    /**
     * Store a new poll
     */
    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', Poll::class);
        
        $rules = [
            'question' => 'required|string|min:5|max:255',
            'description' => 'nullable|string|max:1000',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'poll_type' => 'required|in:simple,comparison',
            'allow_multiple_choices' => 'sometimes|boolean',
            'show_results_before_vote' => 'sometimes|boolean',
            'is_anonymous' => 'sometimes|boolean',
            'ends_at' => 'nullable|date|after:now',
            'pollable_type' => 'nullable|string',
            'pollable_id' => 'nullable|integer',
        ];

        // Add validation rules based on poll type
        if ($request->input('poll_type') === 'simple') {
            $rules['options'] = 'required|array|min:2|max:10';
            $rules['options.*'] = 'required|string|distinct|max:255';
        } else {
            // Comparison poll validation
            $rules['comparison_type'] = 'required|string|in:artist,song,artwork,service,producer,show,other';
            $rules['titles'] = 'required|array|min:2|max:10';
            $rules['titles.*'] = 'required|string|max:255';
            $rules['descriptions'] = 'nullable|array';
            $rules['descriptions.*'] = 'nullable|string|max:500';
            $rules['subtitles'] = 'nullable|array';
            $rules['subtitles.*'] = 'nullable|string|max:255';
            $rules['locations'] = 'nullable|array';
            $rules['locations.*'] = 'nullable|string|max:255';
            $rules['contact_info'] = 'nullable|array';
            $rules['contact_info.*'] = 'nullable|string|max:255';
            $rules['prices'] = 'nullable|array';
            $rules['prices.*'] = 'nullable|numeric|min:0';
            $rules['option_images'] = 'nullable|array';
            $rules['option_images.*'] = 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048';
        }

        $validated = $request->validate($rules);

        // Handle main poll image upload
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('polls', 'public');
            $validated['image_path'] = $imagePath;
        }
        
        // Set default pollable if not specified (Community poll)
        if (!isset($validated['pollable_type'])) {
            $validated['pollable_type'] = null;
            $validated['pollable_id'] = null;
        }
        
        $poll = $this->pollService->createPoll($validated, auth()->user());
        
        return redirect()
            ->route('polls.show', $poll)
            ->with('success', 'Poll created successfully!');
    }

    /**
     * Display a single poll
     */
    public function show(Poll $poll): View
    {
        $this->authorize('view', $poll);

        $poll->load(['options', 'user']);

        // Check if user has voted
        $userVote = auth()->check() ? $poll->getUserVote(auth()->user()) : null;
        $hasVoted = auth()->check() ? $poll->userHasVoted(auth()->user()) : false;

        // Get total votes
        $totalVotes = $poll->total_votes ?? 0;

        // Get results if user voted or results shown before vote
        $results = null;
        if ($userVote || $poll->show_results_before_vote) {
            $results = $this->pollService->getResults($poll);
        }

        return view('modules.forum.frontend.polls.show', compact('poll', 'userVote', 'hasVoted', 'totalVotes', 'results'));
    }

    /**
     * Show form to edit poll
     */
    public function edit(Poll $poll): View
    {
        $this->authorize('update', $poll);
        
        return view('modules.forum.frontend.polls.edit', compact('poll'));
    }

    /**
     * Update a poll (only before any votes)
     */
    public function update(Request $request, Poll $poll): RedirectResponse
    {
        $this->authorize('update', $poll);
        
        $validated = $request->validate([
            'question' => 'sometimes|string|min:5|max:255',
            'description' => 'nullable|string|max:1000',
            'allow_multiple_choices' => 'sometimes|boolean',
            'show_results_before_vote' => 'sometimes|boolean',
            'is_anonymous' => 'sometimes|boolean',
            'ends_at' => 'nullable|date|after:now',
        ]);
        
        $this->pollService->updatePoll($poll, $validated);
        
        return redirect()
            ->route('polls.show', $poll)
            ->with('success', 'Poll updated successfully!');
    }

    /**
     * Delete a poll
     */
    public function destroy(Poll $poll): RedirectResponse
    {
        $this->authorize('delete', $poll);
        
        $this->pollService->deletePoll($poll);
        
        return redirect()
            ->route('polls.index')
            ->with('success', 'Poll deleted successfully.');
    }

    /**
     * Vote on a poll
     */
    public function vote(Request $request, Poll $poll): RedirectResponse|JsonResponse
    {
        $this->authorize('vote', $poll);
        
        $validated = $request->validate([
            'options' => $poll->allow_multiple_choices 
                ? 'required|array|min:1' 
                : 'required|array|size:1',
            'options.*' => 'required|exists:poll_options,id',
        ]);
        
        try {
            $this->pollService->vote($poll, $validated['options'], auth()->user());
            
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Vote recorded successfully!',
                    'results' => $this->pollService->getResults($poll),
                ]);
            }
            
            return back()->with('success', 'Vote recorded successfully!');
        } catch (\Exception $e) {
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => $e->getMessage(),
                ], 422);
            }
            
            return back()->withErrors(['vote' => $e->getMessage()]);
        }
    }

    /**
     * Get poll results
     */
    public function results(Poll $poll): JsonResponse
    {
        $this->authorize('viewResults', $poll);
        
        $results = $this->pollService->getResults($poll);
        
        return response()->json($results);
    }

    /**
     * Close a poll (creator or moderator)
     */
    public function close(Poll $poll): RedirectResponse
    {
        $this->authorize('close', $poll);
        
        $this->pollService->closePoll($poll);
        
        return back()->with('success', 'Poll closed successfully.');
    }
}
