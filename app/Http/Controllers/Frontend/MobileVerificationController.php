<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class MobileVerificationController extends Controller
{
    public function show()
    {
        if (!Setting::isMobileVerificationEnabled()) {
            return redirect()->route('frontend.profile.edit')
                ->with('error', 'Mobile verification is currently disabled.');
        }

        $user = Auth::user();

        if ($user->isPhoneVerified()) {
            return redirect()->route('frontend.profile.edit')
                ->with('success', 'Your phone number is already verified.');
        }

        if (!$user->phone) {
            return redirect()->route('frontend.profile.edit')
                ->with('error', 'Please add a phone number to your profile first.');
        }

        return view('frontend.auth.verify-phone', compact('user'));
    }

    public function sendCode(Request $request)
    {
        if (!Setting::isMobileVerificationEnabled()) {
            return redirect()->back()
                ->with('error', 'Mobile verification is currently disabled.');
        }

        $user = Auth::user();

        if ($user->isPhoneVerified()) {
            return redirect()->route('frontend.profile.edit')
                ->with('success', 'Your phone number is already verified.');
        }

        if (!$user->phone) {
            return redirect()->route('frontend.profile.edit')
                ->with('error', 'Please add a phone number to your profile first.');
        }

        try {
            $code = $user->generatePhoneVerificationCode();

            // Here you would integrate with your SMS service
            // For now, we'll just log it and show a success message
            Log::info('Phone verification code generated', [
                'user_id' => $user->id,
                'phone_number' => $user->phone,
                'code' => $code
            ]);

            // In production, you would send the SMS here
            // Example: $this->sendSms($user->phone, "Your verification code is: {$code}");

            return redirect()->back()
                ->with('success', 'Verification code has been sent to your phone number.')
                ->with('code_sent', true);

        } catch (\Exception $e) {
            Log::error('Failed to generate verification code', [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);

            return redirect()->back()
                ->with('error', 'Failed to send verification code. Please try again.');
        }
    }

    public function verify(Request $request)
    {
        if (!Setting::isMobileVerificationEnabled()) {
            return redirect()->back()
                ->with('error', 'Mobile verification is currently disabled.');
        }

        $request->validate([
            'verification_code' => 'required|string|size:6'
        ]);

        $user = Auth::user();

        if ($user->isPhoneVerified()) {
            return redirect()->route('frontend.profile.edit')
                ->with('success', 'Your phone number is already verified.');
        }

        try {
            $verified = $user->verifyPhone($request->verification_code);

            if ($verified) {
                Log::info('Phone verification successful', [
                    'user_id' => $user->id,
                    'phone_number' => $user->phone
                ]);

                return redirect()->route('frontend.profile.edit')
                    ->with('success', 'Phone number verified successfully!');
            } else {
                return redirect()->back()
                    ->with('error', 'Invalid or expired verification code. Please try again.')
                    ->withInput();
            }

        } catch (\Exception $e) {
            Log::error('Phone verification failed', [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);

            return redirect()->back()
                ->with('error', 'Verification failed. Please try again.')
                ->withInput();
        }
    }

    public function updatePhone(Request $request)
    {
        $request->validate([
            'phone_number' => 'required|string|regex:/^[0-9+\-\s()]+$/'
        ]);

        $user = Auth::user();

        try {
            $user->update([
                'phone_number' => $request->phone_number,
                'phone_verified_at' => null, // Reset verification when phone changes
                'phone_verification_code' => null,
                'phone_verification_expires_at' => null
            ]);

            Log::info('Phone number updated', [
                'user_id' => $user->id,
                'new_phone' => $request->phone_number
            ]);

            return redirect()->back()
                ->with('success', 'Phone number updated successfully. Please verify your new number.');

        } catch (\Exception $e) {
            Log::error('Failed to update phone number', [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);

            return redirect()->back()
                ->with('error', 'Failed to update phone number. Please try again.')
                ->withInput();
        }
    }

    // Helper method to send SMS (implement based on your SMS provider)
    private function sendSms(string $phoneNumber, string $message): bool
    {
        $provider = Setting::getSmsProvider();

        switch ($provider) {
            case 'twilio':
                return $this->sendTwilioSms($phoneNumber, $message);
            case 'africastalking':
                return $this->sendAfricasTalkingSms($phoneNumber, $message);
            case 'local':
            default:
                // Local/development mode - just log
                Log::info('SMS sent (local mode)', [
                    'phone' => $phoneNumber,
                    'message' => $message
                ]);
                return true;
        }
    }

    private function sendTwilioSms(string $phoneNumber, string $message): bool
    {
        // Implement Twilio SMS sending
        // This would require Twilio SDK and configuration
        Log::info('Would send Twilio SMS', [
            'phone' => $phoneNumber,
            'message' => $message
        ]);
        return true;
    }

    private function sendAfricasTalkingSms(string $phoneNumber, string $message): bool
    {
        // Implement Africa's Talking SMS sending
        // This would require Africa's Talking SDK and configuration
        Log::info('Would send Africa\'s Talking SMS', [
            'phone' => $phoneNumber,
            'message' => $message
        ]);
        return true;
    }
}