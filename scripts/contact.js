// ===== Contact Form Submission =====
document.addEventListener('DOMContentLoaded', function () {
    const contactForm = document.getElementById('contactForm');

    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Get form data
            const formData = new FormData(this);
            const data = {
                name: formData.get('name'),
                email: formData.get('email'),
                phone: formData.get('phone') || 'N/A',
                subject: formData.get('subject'),
                message: formData.get('message'),
                timestamp: new Date().toISOString()
            };

            // Validate
            if (!data.name || !data.email || !data.subject || !data.message) {
                alert('❌ Zəhmət olmasa bütün məcburi sahələri doldurun');
                return;
            }

            // Save to localStorage
            const submissions = JSON.parse(localStorage.getItem('contactSubmissions') || '[]');
            submissions.push(data);
            localStorage.setItem('contactSubmissions', JSON.stringify(submissions));

            // Show success message
            const successAlert = document.getElementById('successAlert');
            successAlert.classList.add('show');

            // Reset form
            this.reset();

            // Scroll to success message
            successAlert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

            // Hide success message after 5 seconds
            setTimeout(() => {
                successAlert.classList.remove('show');
            }, 5000);

            console.log('Contact form submitted:', data);
        });
    }
});

// ===== Character Counter =====
document.addEventListener('DOMContentLoaded', function () {
    const messageField = document.getElementById('contactMessage');
    const charCount = document.getElementById('charCount');

    if (messageField && charCount) {
        messageField.addEventListener('input', function () {
            const length = this.value.length;
            const maxLength = 500;

            charCount.textContent = `${length} / ${maxLength}`;

            if (length > maxLength) {
                charCount.style.color = 'var(--primary)';
            } else {
                charCount.style.color = 'var(--text-muted)';
            }

            // Enforce max length
            if (length > maxLength) {
                this.value = this.value.substring(0, maxLength);
                charCount.textContent = `${maxLength} / ${maxLength}`;
            }
        });
    }
});

// toggleFAQ is defined in main.js - no duplicate needed here

// ===== Auto-fill form from localStorage =====
document.addEventListener('DOMContentLoaded', function () {
    const userData = localStorage.getItem('alielUser');

    if (userData) {
        const user = JSON.parse(userData);

        // Auto-fill name and email if user is registered
        const nameField = document.getElementById('contactName');
        const emailField = document.getElementById('contactEmail');

        if (nameField && !nameField.value) {
            nameField.value = user.name || '';
        }

        if (emailField && !emailField.value) {
            emailField.value = user.email || '';
        }
    }
});

// ===== Phone Number Formatting =====
document.addEventListener('DOMContentLoaded', function () {
    const phoneField = document.getElementById('contactPhone');

    if (phoneField) {
        phoneField.addEventListener('input', function (e) {
            let value = e.target.value.replace(/\D/g, '');

            if (value.startsWith('994')) {
                value = value.substring(3);
            }

            if (value.length > 0) {
                if (value.length <= 2) {
                    value = `+994 ${value}`;
                } else if (value.length <= 5) {
                    value = `+994 ${value.substring(0, 2)} ${value.substring(2)}`;
                } else if (value.length <= 7) {
                    value = `+994 ${value.substring(0, 2)} ${value.substring(2, 5)} ${value.substring(5)}`;
                } else {
                    value = `+994 ${value.substring(0, 2)} ${value.substring(2, 5)} ${value.substring(5, 7)} ${value.substring(7, 9)}`;
                }
            }

            e.target.value = value;
        });
    }
});

// ===== Form Validation Hints =====
document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('contactForm');

    if (form) {
        const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');

        inputs.forEach(input => {
            input.addEventListener('blur', function () {
                if (this.value.trim() === '') {
                    this.style.borderColor = 'var(--primary)';
                } else {
                    this.style.borderColor = 'var(--success)';
                }
            });

            input.addEventListener('focus', function () {
                this.style.borderColor = 'var(--primary)';
            });
        });
    }
});

// ===== Track Contact Attempts =====
function trackContactAttempt(method) {
    const attempts = JSON.parse(localStorage.getItem('contactAttempts') || '[]');
    attempts.push({
        method: method,
        timestamp: new Date().toISOString()
    });
    localStorage.setItem('contactAttempts', JSON.stringify(attempts));
}

// ===== Add tracking to social links =====
document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.social-item, .social-link').forEach(link => {
        link.addEventListener('click', function () {
            const platform = this.textContent.toLowerCase().includes('instagram') ? 'instagram' :
                this.textContent.toLowerCase().includes('telegram') ? 'telegram' :
                    this.textContent.toLowerCase().includes('facebook') ? 'facebook' : 'email';

            trackContactAttempt(platform);
        });
    });
});