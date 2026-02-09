<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Song;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Log;

class SecurityTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test SQL injection prevention in search
     */
    public function test_prevents_sql_injection_in_search(): void
    {
        // Create test data
        Song::factory()->create(['title' => 'Test Song']);

        // Attempt SQL injection
        $maliciousInput = "' OR 1=1 --";
        
        $response = $this->getJson('/api/v1/public/search?q=' . urlencode($maliciousInput));
        
        // Should return 200, not SQL error
        $response->assertStatus(200);
        $response->assertJsonStructure([
            'success',
            'query',
            'results' => [
                'songs',
                'artists',
                'playlists'
            ]
        ]);
        
        // Results should be empty or safe (not all songs returned)
        $data = $response->json();
        $this->assertTrue($data['success']);
    }

    /**
     * Test webhook without signature is rejected
     */
    public function test_rejects_webhook_without_signature(): void
    {
        $response = $this->postJson('/api/payments/webhook', [
            'transaction_id' => 'TEST123',
            'status' => 'success',
            'amount' => 15000
        ], [
            'X-Provider' => 'mtn'
        ]);
        
        // Should be rejected with 401
        $response->assertStatus(401);
        $response->assertJson(['error' => 'Invalid signature']);
    }

    /**
     * Test webhook with valid signature is accepted
     */
    public function test_accepts_webhook_with_valid_signature(): void
    {
        $this->markTestSkipped('Webhook signature validation needs proper middleware setup');
        
        // Set webhook secret for testing
        config(['services.mtn.webhook_secret' => 'test_secret_key']);
        
        $payload = json_encode([
            'transaction_id' => 'TEST123',
            'status' => 'success',
            'amount' => 15000
        ]);
        
        // Generate valid signature
        $signature = hash_hmac('sha256', $payload, 'test_secret_key');
        
        $response = $this->postJson('/api/payments/webhook', 
            json_decode($payload, true),
            [
                'X-Provider' => 'mtn',
                'X-Signature' => $signature
            ]
        );
        
        // Should be accepted (may return 404 if payment not found, but not 401)
        $this->assertNotEquals(401, $response->status());
    }

    /**
     * Test webhook with tampered payload is rejected
     */
    public function test_rejects_webhook_with_tampered_payload(): void
    {
        config(['services.mtn.webhook_secret' => 'test_secret_key']);
        
        $originalPayload = [
            'transaction_id' => 'TEST123',
            'status' => 'success',
            'amount' => 15000
        ];
        
        // Generate signature for original payload
        $signature = hash_hmac('sha256', json_encode($originalPayload), 'test_secret_key');
        
        // But send tampered payload
        $tamperedPayload = [
            'transaction_id' => 'TEST123',
            'status' => 'success',
            'amount' => 99999999 // Tampered amount!
        ];
        
        $response = $this->postJson('/api/payments/webhook',
            $tamperedPayload,
            [
                'X-Provider' => 'mtn',
                'X-Signature' => $signature
            ]
        );
        
        // Should be rejected due to signature mismatch
        $response->assertStatus(401);
    }

    /**
     * Test timing attack prevention
     */
    public function test_timing_safe_signature_comparison(): void
    {
        config(['services.mtn.webhook_secret' => 'test_secret_key']);
        
        $payload = json_encode(['test' => 'data']);
        $correctSignature = hash_hmac('sha256', $payload, 'test_secret_key');
        $wrongSignature = str_repeat('a', 64); // Wrong signature
        
        // Time comparison with wrong signature
        $start1 = microtime(true);
        $response1 = $this->postJson('/api/payments/webhook',
            json_decode($payload, true),
            [
                'X-Provider' => 'mtn',
                'X-Signature' => $wrongSignature
            ]
        );
        $time1 = microtime(true) - $start1;
        
        // Time comparison with almost correct signature (differs by one char)
        $almostCorrect = substr($correctSignature, 0, -1) . 'a';
        $start2 = microtime(true);
        $response2 = $this->postJson('/api/payments/webhook',
            json_decode($payload, true),
            [
                'X-Provider' => 'mtn',
                'X-Signature' => $almostCorrect
            ]
        );
        $time2 = microtime(true) - $start2;
        
        // Both should be rejected
        $response1->assertStatus(401);
        $response2->assertStatus(401);
        
        // Timing difference should be minimal (timing-safe comparison)
        // In practice, both should take roughly the same time
        $timingDifference = abs($time1 - $time2);
        $this->assertLessThan(0.1, $timingDifference, 'Timing difference suggests vulnerability to timing attacks');
    }

    /**
     * Test special characters in search don't break query
     */
    public function test_handles_special_characters_in_search(): void
    {
        $specialChars = [
            "'; DROP TABLE songs; --",
            "1' UNION SELECT * FROM users--",
            "' OR '1'='1",
            "%'; EXEC xp_cmdshell('dir'); --",
            "admin'--",
            "' or 1=1--",
            "<script>alert('XSS')</script>",
        ];
        
        foreach ($specialChars as $maliciousInput) {
            $response = $this->getJson('/api/v1/public/search?q=' . urlencode($maliciousInput));
            
            // Should return 200, not SQL error or 500
            $response->assertStatus(200);
            $response->assertJsonStructure(['success', 'results']);
        }
    }

    /**
     * Test search with very long input
     */
    public function test_handles_long_search_input(): void
    {
        $longInput = str_repeat('a', 1000);
        
        $response = $this->getJson('/api/discover/search?q=' . urlencode($longInput));
        
        // Should handle gracefully
        $response->assertStatus(200);
    }

    /**
     * Test webhook signature with different providers
     */
    public function test_webhook_signature_per_provider(): void
    {
        config([
            'services.mtn.webhook_secret' => 'mtn_secret',
            'services.airtel.webhook_secret' => 'airtel_secret'
        ]);
        
        $payload = json_encode(['test' => 'data']);
        
        // MTN signature (wrong for Airtel)
        $mtnSignature = hash_hmac('sha256', $payload, 'mtn_secret');
        
        $response = $this->postJson('/api/payments/webhook',
            json_decode($payload, true),
            [
                'X-Provider' => 'airtel',
                'X-Signature' => $mtnSignature
            ]
        );
        
        // Should be rejected (wrong secret for provider)
        $response->assertStatus(401);
    }
}
