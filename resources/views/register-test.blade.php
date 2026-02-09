<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Registration Test - {{ config('app.name') }}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .container {
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            max-width: 500px;
            width: 100%;
            padding: 40px;
        }
        h1 { 
            color: #333;
            margin-bottom: 10px;
            font-size: 28px;
        }
        .subtitle {
            color: #666;
            margin-bottom: 30px;
            font-size: 14px;
        }
        .form-group {
            margin-bottom: 20px;
        }
        label {
            display: block;
            color: #444;
            font-weight: 600;
            margin-bottom: 8px;
            font-size: 14px;
        }
        input {
            width: 100%;
            padding: 12px 16px;
            border: 2px solid #e1e8ed;
            border-radius: 8px;
            font-size: 15px;
            transition: all 0.3s;
        }
        input:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        button {
            width: 100%;
            padding: 14px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
            margin-top: 10px;
        }
        button:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
        }
        button:active {
            transform: translateY(0);
        }
        button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
        }
        .alert {
            padding: 16px;
            border-radius: 8px;
            margin-bottom: 20px;
            font-size: 14px;
        }
        .alert-error {
            background: #fee;
            border: 2px solid #fcc;
            color: #c33;
        }
        .alert-success {
            background: #efe;
            border: 2px solid #cfc;
            color: #3c3;
        }
        .alert-info {
            background: #e3f2fd;
            border: 2px solid #bbdefb;
            color: #1976d2;
        }
        .alert h3 {
            margin-bottom: 10px;
            font-size: 16px;
        }
        .alert ul {
            margin-left: 20px;
            margin-top: 10px;
        }
        .alert li {
            margin: 5px 0;
        }
        pre {
            background: #f5f5f5;
            padding: 12px;
            border-radius: 6px;
            overflow-x: auto;
            font-size: 12px;
            margin-top: 10px;
        }
        .loading {
            display: inline-block;
            width: 16px;
            height: 16px;
            border: 3px solid rgba(255,255,255,0.3);
            border-radius: 50%;
            border-top-color: white;
            animation: spin 0.6s linear infinite;
            margin-right: 8px;
            vertical-align: middle;
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        .helper-text {
            font-size: 12px;
            color: #999;
            margin-top: 4px;
        }
        .back-link {
            text-align: center;
            margin-top: 20px;
        }
        .back-link a {
            color: #667eea;
            text-decoration: none;
            font-size: 14px;
        }
        .back-link a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🧪 Registration Test</h1>
        <p class="subtitle">Debug mode - shows exact validation errors</p>

        <div id="response"></div>

        <form id="regForm">
            <div class="form-group">
                <label for="name">Full Name *</label>
                <input 
                    type="text" 
                    name="name" 
                    id="name" 
                    placeholder="John Doe"
                    required
                >
            </div>

            <div class="form-group">
                <label for="email">Email Address *</label>
                <input 
                    type="email" 
                    name="email" 
                    id="email" 
                    placeholder="john@example.com"
                    required
                >
                <div class="helper-text">Must be unique and valid email format</div>
            </div>

            <div class="form-group">
                <label for="password">Password *</label>
                <input 
                    type="password" 
                    name="password" 
                    id="password" 
                    placeholder="Min 7 characters"
                    required
                    minlength="7"
                >
                <div class="helper-text">Minimum 7 characters</div>
            </div>

            <div class="form-group">
                <label for="password_confirmation">Confirm Password *</label>
                <input 
                    type="password" 
                    name="password_confirmation" 
                    id="password_confirmation" 
                    placeholder="Repeat your password"
                    required
                    minlength="7"
                >
                <div class="helper-text">Must match the password above</div>
            </div>

            <button type="submit" id="submitBtn">
                Register Account
            </button>
        </form>

        <div class="back-link">
            <a href="/register">← Back to normal registration</a>
        </div>
    </div>

    <script>
    (function() {
        const form = document.getElementById('regForm');
        const responseDiv = document.getElementById('response');
        const submitBtn = document.getElementById('submitBtn');
        const csrfToken = document.querySelector('meta[name="csrf-token"]').content;

        // Pre-fill with test data if requested
        if (window.location.search.includes('prefill')) {
            const timestamp = Date.now();
            document.getElementById('name').value = 'Test User ' + timestamp;
            document.getElementById('email').value = 'test' + timestamp + '@example.com';
            document.getElementById('password').value = 'password123';
            document.getElementById('password_confirmation').value = 'password123';
        }

        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Disable submit button
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="loading"></span> Submitting...';
            
            // Get form data
            const formData = new FormData(form);
            formData.append('_token', csrfToken);
            
            // Show loading state
            responseDiv.innerHTML = '<div class="alert alert-info">📤 Submitting registration request...</div>';
            
            console.log('=== REGISTRATION DEBUG ===');
            console.log('Form data:', Object.fromEntries(formData.entries()));
            console.log('CSRF Token:', csrfToken);
            
            try {
                const response = await fetch('/test-register-no-csrf', {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                    credentials: 'same-origin'
                });
                
                console.log('Response status:', response.status);
                console.log('Response OK:', response.ok);
                console.log('Response headers:', [...response.headers.entries()]);
                
                // Parse response
                let data;
                const contentType = response.headers.get('content-type');
                
                if (contentType && contentType.includes('application/json')) {
                    data = await response.json();
                } else {
                    const text = await response.text();
                    console.log('Non-JSON response:', text);
                    data = { message: 'Non-JSON response received', raw: text };
                }
                
                console.log('Response data:', data);
                
                // Handle different response codes
                if (response.status === 422) {
                    // Validation errors
                    let errorHtml = '<div class="alert alert-error">';
                    errorHtml += '<h3>❌ Validation Failed</h3>';
                    errorHtml += '<ul>';
                    
                    if (data.errors) {
                        for (const [field, messages] of Object.entries(data.errors)) {
                            if (Array.isArray(messages)) {
                                messages.forEach(msg => {
                                    errorHtml += `<li><strong>${field}:</strong> ${msg}</li>`;
                                });
                            } else {
                                errorHtml += `<li><strong>${field}:</strong> ${messages}</li>`;
                            }
                        }
                    } else {
                        errorHtml += '<li>Unknown validation error (no error details provided)</li>';
                    }
                    
                    errorHtml += '</ul>';
                    errorHtml += '<h4 style="margin-top: 15px;">Full Server Response:</h4>';
                    errorHtml += '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
                    errorHtml += '</div>';
                    
                    responseDiv.innerHTML = errorHtml;
                    
                } else if (response.ok) {
                    // Success
                    responseDiv.innerHTML = `
                        <div class="alert alert-success">
                            <h3>✅ Registration Successful!</h3>
                            <p>Account created successfully. Redirecting to dashboard...</p>
                        </div>
                    `;
                    
                    console.log('✅ Success! Redirecting...', data);
                    
                    // Force a full page reload to the dashboard to establish session
                    setTimeout(() => {
                        window.location.replace(data.redirect || '/dashboard');
                    }, 1500);
                    
                } else {
                    // Other errors
                    responseDiv.innerHTML = `
                        <div class="alert alert-error">
                            <h3>⚠️ Error ${response.status}</h3>
                            <p>${data.message || 'An unknown error occurred'}</p>
                            <pre>${JSON.stringify(data, null, 2)}</pre>
                        </div>
                    `;
                }
                
            } catch (error) {
                console.error('❌ Fetch error:', error);
                responseDiv.innerHTML = `
                    <div class="alert alert-error">
                        <h3>🔌 Network Error</h3>
                        <p><strong>Error:</strong> ${error.message}</p>
                        <p>This usually means:</p>
                        <ul>
                            <li>The server is not running</li>
                            <li>Network connection issue</li>
                            <li>CORS or security policy blocking the request</li>
                        </ul>
                        <p style="margin-top: 10px;"><strong>Check the browser console for more details.</strong></p>
                    </div>
                `;
            } finally {
                // Re-enable submit button
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Register Account';
            }
        });
    })();
    </script>
</body>
</html>
