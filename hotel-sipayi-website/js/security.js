// ========== SECURITY & VALIDATION ==========

// Sanitize user input to prevent XSS
function sanitizeInput(input) {
    if (typeof input !== 'string') {
        return input;
    }

    // Create a temporary div to use browser's HTML parser
    const temp = document.createElement('div');
    temp.textContent = input;

    // Replace dangerous characters
    return temp.innerHTML
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}

// Validate email format
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validate phone number (Indian format)
function validatePhone(phone) {
    // Remove spaces and special characters
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');

    // Check if it's a valid Indian phone number
    // Accepts: 10 digits, or +91 followed by 10 digits
    const phoneRegex = /^(\+91)?[6-9]\d{9}$/;
    return phoneRegex.test(cleanPhone);
}

// Validate required fields
function validateRequired(value) {
    return value !== null && value !== undefined && value.trim().length > 0;
}

// Validate string length
function validateLength(value, min, max) {
    const length = value.trim().length;
    return length >= min && length <= max;
}

// Validate number range
function validateRange(value, min, max) {
    const num = parseFloat(value);
    return !isNaN(num) && num >= min && num <= max;
}

// Rate limiting for API calls
class RateLimiter {
    constructor(maxRequests, timeWindow) {
        this.maxRequests = maxRequests;
        this.timeWindow = timeWindow; // in milliseconds
        this.requests = [];
    }

    canMakeRequest() {
        const now = Date.now();

        // Remove old requests outside time window
        this.requests = this.requests.filter(
            time => now - time < this.timeWindow
        );

        // Check if under limit
        if (this.requests.length < this.maxRequests) {
            this.requests.push(now);
            return true;
        }

        return false;
    }

    getRemainingTime() {
        if (this.requests.length < this.maxRequests) {
            return 0;
        }

        const oldestRequest = Math.min(...this.requests);
        const timeUntilReset = this.timeWindow - (Date.now() - oldestRequest);
        return Math.max(0, timeUntilReset);
    }
}

// Create rate limiter for contact form (5 requests per minute)
const contactFormLimiter = new RateLimiter(5, 60000);

// Prevent SQL injection in search queries
function sanitizeSearchQuery(query) {
    if (typeof query !== 'string') {
        return '';
    }

    // Remove SQL keywords and special characters
    return query
        .replace(/[\'\";]/g, '')
        .replace(/(\b)(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)(\b)/gi, '')
        .trim();
}

// Generate secure random token
function generateToken(length = 32) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';

    for (let i = 0; i < length; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return token;
}

// Hash data (simple client-side hashing)
async function hashData(data) {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Secure localStorage with encryption (basic implementation)
class SecureStorage {
    constructor(key) {
        this.key = key;
    }

    // Simple XOR encryption (for demo - use proper encryption in production)
    encrypt(data) {
        const text = JSON.stringify(data);
        let encrypted = '';

        for (let i = 0; i < text.length; i++) {
            encrypted += String.fromCharCode(
                text.charCodeAt(i) ^ this.key.charCodeAt(i % this.key.length)
            );
        }

        return btoa(encrypted);
    }

    decrypt(encrypted) {
        try {
            const text = atob(encrypted);
            let decrypted = '';

            for (let i = 0; i < text.length; i++) {
                decrypted += String.fromCharCode(
                    text.charCodeAt(i) ^ this.key.charCodeAt(i % this.key.length)
                );
            }

            return JSON.parse(decrypted);
        } catch (error) {
            console.error('Decryption error:', error);
            return null;
        }
    }

    setItem(key, value) {
        const encrypted = this.encrypt(value);
        localStorage.setItem(key, encrypted);
    }

    getItem(key) {
        const encrypted = localStorage.getItem(key);
        return encrypted ? this.decrypt(encrypted) : null;
    }
}

// Detect and prevent common attacks
function detectXSSAttempt(input) {
    const xssPatterns = [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi,
        /<iframe/gi,
        /<object/gi,
        /<embed/gi
    ];

    return xssPatterns.some(pattern => pattern.test(input));
}

// Log security events (in production, send to server)
function logSecurityEvent(event, details) {
    const logEntry = {
        timestamp: new Date().toISOString(),
        event,
        details,
        userAgent: navigator.userAgent,
        url: window.location.href
    };

    console.warn('Security Event:', logEntry);

    // In production, send to server
    // fetch('/api/security-log', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(logEntry)
    // });
}

// Content Security Policy helper
function enforceCSP() {
    // Check if CSP is properly configured
    const meta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');

    if (!meta) {
        console.warn('Content Security Policy not configured');
    }
}

// Initialize security on page load
document.addEventListener('DOMContentLoaded', function() {
    // Enforce CSP
    enforceCSP();

    // Add CSRF token to all forms
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        if (!form.querySelector('input[name="csrf_token"]')) {
            const csrfInput = document.createElement('input');
            csrfInput.type = 'hidden';
            csrfInput.name = 'csrf_token';
            csrfInput.value = generateToken();
            form.appendChild(csrfInput);
        }
    });

    // Monitor for suspicious activity
    let clickCount = 0;
    document.addEventListener('click', function() {
        clickCount++;

        // If more than 100 clicks per second, might be bot
        setTimeout(() => {
            if (clickCount > 100) {
                logSecurityEvent('Suspicious Activity', {
                    type: 'Rapid Clicks',
                    count: clickCount
                });
            }
            clickCount = 0;
        }, 1000);
    });
});

// Export functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        sanitizeInput,
        validateEmail,
        validatePhone,
        validateRequired,
        validateLength,
        validateRange,
        RateLimiter,
        contactFormLimiter,
        sanitizeSearchQuery,
        generateToken,
        hashData,
        SecureStorage,
        detectXSSAttempt,
        logSecurityEvent
    };
}