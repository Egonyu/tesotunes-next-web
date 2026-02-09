<!DOCTYPE html>
<html>
<head>
    <title>Registration Debug</title>
    <style>
        body { font-family: Arial; padding: 20px; max-width: 600px; margin: 0 auto; }
        .error { color: #d32f2f; padding: 10px; background: #ffebee; margin: 10px 0; border-radius: 4px; }
        .success { color: #388e3c; padding: 10px; background: #e8f5e9; margin: 10px 0; border-radius: 4px; }
        .info { color: #1976d2; padding: 10px; background: #e3f2fd; margin: 10px 0; border-radius: 4px; }
        input { padding: 10px; margin: 5px 0; width: 100%; box-sizing: border-box; border: 1px solid #ddd; border-radius: 4px; }
        button { padding: 12px 24px; background: #4CAF50; color: white; border: none; cursor: pointer; border-radius: 4px; width: 100%; margin-top: 10px; }
        button:hover { background: #45a049; }
        label { font-weight: bold; display: block; margin-top: 10px; }
        pre { background: #f5f5f5; padding: 10px; border-radius: 4px; overflow-x: auto; }
    </style>
</head>
<body>
    <h1>Registration Debug Form</h1>
    <p class="info">This form shows you the exact validation errors from the server.</p>
    
    <form id="regForm">
        <input type="hidden" name="_token" value="{{ csrf_token() }}">
        
        <label>Name:</label>
        <input type="text" name="name" id="name" placeholder="Your Full Name" required>
        
        <label>Email:</label>
        <input type="email" name="email" id="email" placeholder="you@example.com" required>
        
        <label>Password (min 7 characters):</label>
        <input type="password" name="password" id="password" placeholder="Enter password" required>
        
        <label>Confirm Password:</label>
        <input type="password" name="password_confirmation" id="password_confirmation" placeholder="Repeat password" required>
        
        <button type="submit">Register</button>
    </form>

    <div id="response"></div>

    <script>
    document.getElementById('regForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const responseDiv = document.getElementById('response');
        
        // Show loading
        responseDiv.innerHTML = '<div class="info">Submitting registration...</div>';
        
        try {
            const response = await fetch('/register', {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                credentials: 'same-origin'
            });
            
            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok);
            
            // Try to parse JSON
            let data;
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                data = { message: await response.text() };
            }
            
            console.log('Response data:', data);
            
            if (response.status === 422) {
                // Validation errors
                let errorHtml = '<div class="error"><h3>Validation Errors:</h3><ul>';
                
                if (data.errors) {
                    for (const [field, messages] of Object.entries(data.errors)) {
                        messages.forEach(msg => {
                            errorHtml += `<li><strong>${field}:</strong> ${msg}</li>`;
                        });
                    }
                } else {
                    errorHtml += `<li>Unknown validation error</li>`;
                }
                
                errorHtml += '</ul><h4>Full Response:</h4><pre>' + JSON.stringify(data, null, 2) + '</pre></div>';
                responseDiv.innerHTML = errorHtml;
                
            } else if (response.ok) {
                responseDiv.innerHTML = '<div class="success"><h3>✓ Registration Successful!</h3><p>Redirecting to dashboard...</p></div>';
                console.log('Success! Redirecting...', data);
                
                if (data.redirect) {
                    setTimeout(() => window.location.href = data.redirect, 1500);
                } else {
                    setTimeout(() => window.location.href = '/dashboard', 1500);
                }
                
            } else {
                responseDiv.innerHTML = '<div class="error"><h3>Error ' + response.status + ':</h3><pre>' + JSON.stringify(data, null, 2) + '</pre></div>';
            }
            
        } catch (error) {
            console.error('Fetch error:', error);
            responseDiv.innerHTML = '<div class="error"><h3>Network Error:</h3><p>' + error.message + '</p><p>Check console for details.</p></div>';
        }
    });
    
    // Pre-fill with test data
    if (window.location.search.includes('prefill')) {
        document.getElementById('name').value = 'Test User ' + Date.now();
        document.getElementById('email').value = 'test' + Date.now() + '@example.com';
        document.getElementById('password').value = 'password123';
        document.getElementById('password_confirmation').value = 'password123';
    }
    </script>
</body>
</html>
