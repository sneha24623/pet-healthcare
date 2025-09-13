// Handle login form submission
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in
    checkExistingLogin();
    
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }

    // Initialize dropdown functionality
    initializeDropdown();
});

function checkExistingLogin() {
    const currentUser = localStorage.getItem('currentUser');
    const users = JSON.parse(localStorage.getItem('petHealthcareUsers') || '[]');
    
    // If user is logged in and on login/signup page, redirect to dashboard
    if (currentUser && (window.location.pathname.includes('index.html') || window.location.pathname.includes('signup.html') || window.location.pathname === '/' || window.location.pathname === '')) {
        window.location.href = 'dashboard.html';
        return;
    }
    
    // If on login page and user exists, show direct login options
    if ((window.location.pathname.includes('index.html') || window.location.pathname === '/' || window.location.pathname === '') && !currentUser) {
        if (users.length > 0) {
            showDirectLoginOptions(users);
        }
    }
}

function showDirectLoginOptions(users) {
    const loginCard = document.querySelector('.login-card');
    if (!loginCard) return;
    
    // Create direct login section
    const directLoginSection = document.createElement('div');
    directLoginSection.className = 'direct-login-section';
    directLoginSection.innerHTML = `
        <div class="direct-login-header">
            <h3>Welcome Back! 🐾</h3>
            <p>Choose your account to continue</p>
        </div>
        <div class="user-accounts">
            ${users.map(user => `
                <div class="user-account" onclick="directLogin('${user.email}')">
                    <div class="user-avatar">👤</div>
                    <div class="user-info">
                        <div class="user-name">${user.firstName} ${user.lastName}</div>
                        <div class="user-email">${user.email}</div>
                    </div>
                </div>
            `).join('')}
        </div>
        <div class="login-options">
            <button class="btn-outline" onclick="showManualLogin()">Use Different Account</button>
        </div>
    `;
    
    // Hide the original form and show direct login
    const originalForm = loginCard.querySelector('.form');
    originalForm.style.display = 'none';
    loginCard.appendChild(directLoginSection);
}

function directLogin(email) {
    const users = JSON.parse(localStorage.getItem('petHealthcareUsers') || '[]');
    const user = users.find(u => u.email === email);
    
    if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        showSuccess('Welcome back! Redirecting to dashboard...');
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
    }
}

function showManualLogin() {
    const directLoginSection = document.querySelector('.direct-login-section');
    const originalForm = document.querySelector('.form');
    
    if (directLoginSection) {
        directLoginSection.remove();
    }
    if (originalForm) {
        originalForm.style.display = 'flex';
    }
}

function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // Remove any existing messages
    removeMessages();
    
    if (!username || !password) {
        showError('Please fill in all fields');
        return;
    }
    
    // Simulate login process
    showLoadingState();
    
    setTimeout(() => {
        // Check against stored users
        const users = JSON.parse(localStorage.getItem('petHealthcareUsers') || '[]');
        const user = users.find(u => 
            (u.email.toLowerCase() === username.toLowerCase() || 
             u.firstName.toLowerCase() === username.toLowerCase() || 
             `${u.firstName} ${u.lastName}`.toLowerCase() === username.toLowerCase()) && 
            u.password === password
        );
        
        if (user) {
            localStorage.setItem('currentUser', JSON.stringify(user));
            showSuccess('Login successful! Redirecting...');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        } else if ((username === 'admin' || username === 'test') && (password === 'password' || password === 'test')) {
            // Keep admin login for demo purposes
            const adminUser = { firstName: 'Admin', lastName: 'User', email: 'admin@pethealthcare.com' };
            localStorage.setItem('currentUser', JSON.stringify(adminUser));
            showSuccess('Admin login successful! Redirecting...');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        } else {
            // Check if user exists but password is wrong
            const userExists = users.find(u => 
                u.email.toLowerCase() === username.toLowerCase() || 
                u.firstName.toLowerCase() === username.toLowerCase() || 
                `${u.firstName} ${u.lastName}`.toLowerCase() === username.toLowerCase()
            );
            if (userExists) {
                showError('Incorrect password. Please try again.');
            } else {
                showError('User not found. Please sign up for a new account or try admin/password for demo.');
            }
            hideLoadingState();
        }
    }, 1000);
}

function handleSignup(e) {
    e.preventDefault();
    
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const phone = document.getElementById('phone').value;
    
    // Remove any existing messages
    removeMessages();
    
    // Validation
    if (!firstName || !lastName || !email || !password || !confirmPassword || !phone) {
        showError('Please fill in all fields');
        return;
    }
    
    if (password !== confirmPassword) {
        showError('Passwords do not match');
        document.getElementById('confirmPassword').classList.add('input-error');
        return;
    }
    
    if (password.length < 6) {
        showError('Password must be at least 6 characters long');
        document.getElementById('signupPassword').classList.add('input-error');
        return;
    }
    
    if (!isValidEmail(email)) {
        showError('Please enter a valid email address');
        document.getElementById('email').classList.add('input-error');
        return;
    }
    
    // Simulate signup process
    showLoadingState();
    
    setTimeout(() => {
        // Store user data
        const users = JSON.parse(localStorage.getItem('petHealthcareUsers') || '[]');
        const newUser = {
            firstName,
            lastName,
            email,
            password,
            phone,
            registeredAt: new Date().toISOString()
        };
        
        // Check if user already exists
        if (users.find(u => u.email === email)) {
            showError('An account with this email already exists');
            hideLoadingState();
            return;
        }
        
        users.push(newUser);
        localStorage.setItem('petHealthcareUsers', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        
        showSuccess('Account created successfully! Redirecting to login...');
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
    }, 1000);
}

function showError(message) {
    const form = document.querySelector('.form');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    form.insertBefore(errorDiv, form.firstChild);
    
    // Remove error styling after 3 seconds
    setTimeout(() => {
        removeInputErrors();
    }, 3000);
}

function showSuccess(message) {
    const form = document.querySelector('.form');
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    form.insertBefore(successDiv, form.firstChild);
}

function removeMessages() {
    const messages = document.querySelectorAll('.error-message, .success-message');
    messages.forEach(message => message.remove());
    removeInputErrors();
}

function removeInputErrors() {
    const inputs = document.querySelectorAll('.input-error');
    inputs.forEach(input => input.classList.remove('input-error'));
}

function showLoadingState() {
    const submitBtn = document.querySelector('.btn-primary');
    submitBtn.textContent = 'Please wait...';
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.7';
}

function hideLoadingState() {
    const submitBtn = document.querySelector('.btn-primary');
    const isSignupPage = document.getElementById('signupForm');
    submitBtn.textContent = isSignupPage ? 'Sign Up' : 'Login';
    submitBtn.disabled = false;
    submitBtn.style.opacity = '1';
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function initializeDropdown() {
    const dropdown = document.querySelector('.dropdown');
    if (!dropdown) return;
    
    const dropdownBtn = dropdown.querySelector('.dropdown-btn');
    const dropdownContent = dropdown.querySelector('.dropdown-content');
    
    // Handle click events for mobile
    dropdownBtn.addEventListener('click', function(e) {
        e.preventDefault();
        dropdownContent.style.display = 
            dropdownContent.style.display === 'block' ? 'none' : 'block';
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!dropdown.contains(e.target)) {
            dropdownContent.style.display = 'none';
        }
    });
    
    // Handle dropdown links
    const dropdownLinks = dropdownContent.querySelectorAll('a');
    dropdownLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href && href !== '#adoption' && href !== '#vet' && href !== '#diet' && href !== '#dashboard') {
                // Allow navigation to actual pages
                return;
            }
            
            e.preventDefault();
            if (href === '#adoption') {
                window.location.href = 'adoption.html';
            } else {
                const feature = this.textContent;
                showFeatureAlert(feature);
            }
            dropdownContent.style.display = 'none';
        });
    });
}

// Adoption page functionality
function showContactModal(petName, petBreed) {
    const modal = document.getElementById('contactModal');
    const modalPetName = document.getElementById('modalPetName');
    
    if (modal && modalPetName) {
        modalPetName.textContent = `Interested in ${petName} (${petBreed})`;
        modal.style.display = 'block';
        
        // Add body scroll lock
        document.body.style.overflow = 'hidden';
    }
}

function closeContactModal() {
    const modal = document.getElementById('contactModal');
    if (modal) {
        modal.style.display = 'none';
        
        // Remove body scroll lock
        document.body.style.overflow = 'auto';
    }
}

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    const modal = document.getElementById('contactModal');
    if (event.target === modal) {
        closeContactModal();
    }
});

function showFeatureAlert(feature) {
    alert(`${feature} feature coming soon! 🐾\n\nThis feature will be available in the next update.`);
}

function logout() {
    localStorage.removeItem('currentUser');
    // Clear all user data
    localStorage.removeItem('petHealthcareUsers');
    // Redirect to login page
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 100);
}

// Dashboard functionality
document.addEventListener('DOMContentLoaded', function() {
    // Display user name on dashboard
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const userNameElement = document.getElementById('userName');
    if (userNameElement && currentUser.firstName) {
        userNameElement.textContent = currentUser.firstName;
    }
    
    // Handle dashboard card clicks
    const cardBtns = document.querySelectorAll('.card-btn');
    cardBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Skip if button has onclick handler
            if (!this.hasAttribute('onclick')) {
                const cardTitle = this.parentElement.querySelector('h3').textContent;
                showFeatureAlert(`${cardTitle} feature`);
            }
        });
    });
    
    // Handle quick action buttons
    const actionBtns = document.querySelectorAll('.action-btn');
    actionBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            if (this.classList.contains('emergency')) {
                alert('🚨 Emergency Contact\n\n24/7 Pet Emergency Hotline:\n📞 1-800-PET-HELP\n\nFor immediate assistance, contact your local veterinary emergency clinic.');
            } else if (this.classList.contains('reminder')) {
                alert('⏰ Reminder Set!\n\nYour pet care reminder has been scheduled. You\'ll receive notifications for:\n• Feeding times\n• Medication schedules\n• Vet appointments\n• Grooming sessions');
            } else if (this.classList.contains('add-pet')) {
                alert('➕ Add New Pet\n\nThis feature will allow you to:\n• Register a new pet profile\n• Add medical history\n• Set up care schedules\n• Upload photos\n\nComing soon! 🐾');
            }
        });
    });
});

// Emergency Contact Modal Functions
function showEmergencyContact() {
    document.getElementById('emergencyContactModal').style.display = 'block';
}

function closeEmergencyContactModal() {
    document.getElementById('emergencyContactModal').style.display = 'none';
}

// Set Reminder Modal Functions
function showSetReminder() {
    document.getElementById('setReminderModal').style.display = 'block';
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('reminderDate').min = today;
}

function closeSetReminderModal() {
    document.getElementById('setReminderModal').style.display = 'none';
    document.getElementById('reminderForm').reset();
}

// Add New Pet Modal Functions
function showAddNewPet() {
    document.getElementById('addNewPetModal').style.display = 'block';
}

function closeAddNewPetModal() {
    document.getElementById('addNewPetModal').style.display = 'none';
    document.getElementById('addPetForm').reset();
}

// Reminder Success Modal Functions
function closeReminderSuccessModal() {
    document.getElementById('reminderSuccessModal').style.display = 'none';
}

// Add Pet Success Modal Functions
function closeAddPetSuccessModal() {
    document.getElementById('addPetSuccessModal').style.display = 'none';
}

// SOS Emergency Functions
function triggerSOS() {
    document.getElementById('sosModal').style.display = 'block';
    // Simulate emergency countdown
    let countdown = 10;
    const timer = document.getElementById('countdownTimer');
    const interval = setInterval(() => {
        timer.textContent = `Emergency services contacted in ${countdown}s`;
        countdown--;
        if (countdown < 0) {
            timer.textContent = 'Emergency services contacted!';
            clearInterval(interval);
        }
    }, 1000);
}

function closeSosModal() {
    document.getElementById('sosModal').style.display = 'none';
}

// Form Submission Handlers
document.addEventListener('DOMContentLoaded', function() {
    // Reminder Form Handler
    const reminderForm = document.getElementById('reminderForm');
    if (reminderForm) {
        reminderForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const petName = document.getElementById('reminderPet').selectedOptions[0].text;
            const reminderType = document.getElementById('reminderType').selectedOptions[0].text;
            const reminderDate = document.getElementById('reminderDate').value;
            const reminderTime = document.getElementById('reminderTime').value;
            const reminderTitle = document.getElementById('reminderTitle').value;
            
            // Format date for display
            const formattedDate = new Date(reminderDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            // Update success modal with details
            document.getElementById('reminderSuccessDetails').innerHTML = 
                `${reminderType} reminder for ${petName}<br>
                 📅 ${formattedDate} at ${reminderTime}<br>
                 📝 ${reminderTitle}`;
            
            // Close reminder modal and show success
            closeSetReminderModal();
            document.getElementById('reminderSuccessModal').style.display = 'block';
        });
    }
    
    // Add Pet Form Handler
    const addPetForm = document.getElementById('addPetForm');
    if (addPetForm) {
        addPetForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const petName = document.getElementById('newPetName').value;
            const petType = document.getElementById('newPetType').selectedOptions[0].text;
            const petBreed = document.getElementById('newPetBreed').value;
            
            // Update success modal with details
            document.getElementById('addPetSuccessDetails').innerHTML = 
                `${petName} (${petBreed}) has been added to your pet family!`;
            
            // Close add pet modal and show success
            closeAddNewPetModal();
            document.getElementById('addPetSuccessModal').style.display = 'block';
        });
    }
});

// Health Records Modal Function
function showHealthRecords() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content health-records-modal">
            <div class="modal-header">
                <h2>📋 Complete Health Records</h2>
                <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
            </div>
            <div class="modal-body">
                <div class="health-records-tabs">
                    <button class="tab-btn active" onclick="showHealthTab('appointments')">🏥 Appointments</button>
                    <button class="tab-btn" onclick="showHealthTab('vaccinations')">💉 Vaccinations</button>
                    <button class="tab-btn" onclick="showHealthTab('medical')">📋 Medical History</button>
                </div>
                
                <div id="appointments" class="health-tab-content active">
                    <h3>🏥 Appointment History</h3>
                    <div class="health-record-item">
                        <div class="record-date">March 15, 2024</div>
                        <div class="record-details">
                            <h4>🐕 Buddy - Routine Checkup</h4>
                            <p><strong>Vet:</strong> Dr. Sarah Johnson</p>
                            <p><strong>Clinic:</strong> Happy Paws Veterinary Clinic</p>
                            <p><strong>Notes:</strong> Excellent health, all vitals normal</p>
                        </div>
                    </div>
                    <div class="health-record-item">
                        <div class="record-date">March 10, 2024</div>
                        <div class="record-details">
                            <h4>🐕 Max - Surgery Follow-up</h4>
                            <p><strong>Vet:</strong> Dr. Emily Rodriguez</p>
                            <p><strong>Clinic:</strong> Animal Health Hospital</p>
                            <p><strong>Notes:</strong> Recovery progressing well, stitches removed</p>
                        </div>
                    </div>
                    <div class="health-record-item">
                        <div class="record-date">February 28, 2024</div>
                        <div class="record-details">
                            <h4>🐱 Luna - Vaccination</h4>
                            <p><strong>Vet:</strong> Dr. Michael Chen</p>
                            <p><strong>Clinic:</strong> Pet Care Medical Center</p>
                            <p><strong>Notes:</strong> FVRCP vaccination administered, no adverse reactions</p>
                        </div>
                    </div>
                </div>
                
                <div id="vaccinations" class="health-tab-content">
                    <h3>💉 Vaccination Records</h3>
                    <div class="vaccination-record">
                        <h4>🐕 Buddy - Golden Retriever</h4>
                        <div class="vaccine-list">
                            <div class="vaccine-item">
                                <span class="vaccine-name">Rabies</span>
                                <span class="vaccine-date">March 15, 2024</span>
                                <span class="vaccine-status current">Current</span>
                            </div>
                            <div class="vaccine-item">
                                <span class="vaccine-name">DHPP</span>
                                <span class="vaccine-date">February 20, 2024</span>
                                <span class="vaccine-status current">Current</span>
                            </div>
                            <div class="vaccine-item">
                                <span class="vaccine-name">Bordetella</span>
                                <span class="vaccine-date">January 10, 2024</span>
                                <span class="vaccine-status current">Current</span>
                            </div>
                        </div>
                    </div>
                    <div class="vaccination-record">
                        <h4>🐱 Luna - Persian Cat</h4>
                        <div class="vaccine-list">
                            <div class="vaccine-item">
                                <span class="vaccine-name">FVRCP</span>
                                <span class="vaccine-date">February 28, 2024</span>
                                <span class="vaccine-status current">Current</span>
                            </div>
                            <div class="vaccine-item">
                                <span class="vaccine-name">Rabies</span>
                                <span class="vaccine-date">January 15, 2024</span>
                                <span class="vaccine-status current">Current</span>
                            </div>
                            <div class="vaccine-item">
                                <span class="vaccine-name">FeLV</span>
                                <span class="vaccine-date">March 5, 2024</span>
                                <span class="vaccine-status current">Current</span>
                            </div>
                        </div>
                    </div>
                    <div class="vaccination-record">
                        <h4>🐕 Max - Labrador Mix</h4>
                        <div class="vaccine-list">
                            <div class="vaccine-item">
                                <span class="vaccine-name">Rabies</span>
                                <span class="vaccine-date">March 20, 2024</span>
                                <span class="vaccine-status current">Current</span>
                            </div>
                            <div class="vaccine-item">
                                <span class="vaccine-name">DHPP</span>
                                <span class="vaccine-date">February 25, 2024</span>
                                <span class="vaccine-status current">Current</span>
                            </div>
                            <div class="vaccine-item">
                                <span class="vaccine-name">Bordetella</span>
                                <span class="vaccine-date">March 15, 2023</span>
                                <span class="vaccine-status overdue">Overdue</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div id="medical" class="health-tab-content">
                    <h3>📋 Medical History</h3>
                    <div class="medical-record">
                        <h4>🐕 Buddy - Golden Retriever</h4>
                        <div class="medical-timeline">
                            <div class="timeline-item">
                                <div class="timeline-date">March 2024</div>
                                <div class="timeline-content">
                                    <h5>Annual Health Checkup</h5>
                                    <p>Complete physical examination, blood work normal, dental cleaning recommended</p>
                                </div>
                            </div>
                            <div class="timeline-item">
                                <div class="timeline-date">December 2023</div>
                                <div class="timeline-content">
                                    <h5>Minor Ear Infection</h5>
                                    <p>Treated with antibiotic drops, fully recovered within 10 days</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="medical-record">
                        <h4>🐱 Luna - Persian Cat</h4>
                        <div class="medical-timeline">
                            <div class="timeline-item">
                                <div class="timeline-date">February 2024</div>
                                <div class="timeline-content">
                                    <h5>Spaying Surgery</h5>
                                    <p>Successful spaying procedure, recovery excellent, no complications</p>
                                </div>
                            </div>
                            <div class="timeline-item">
                                <div class="timeline-date">January 2024</div>
                                <div class="timeline-content">
                                    <h5>Grooming & Health Check</h5>
                                    <p>Professional grooming, nail trimming, overall health excellent</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="medical-record">
                        <h4>🐕 Max - Labrador Mix</h4>
                        <div class="medical-timeline">
                            <div class="timeline-item">
                                <div class="timeline-date">March 2024</div>
                                <div class="timeline-content">
                                    <h5>Leg Surgery Follow-up</h5>
                                    <p>Post-surgical examination, healing progressing well, activity restrictions lifted</p>
                                </div>
                            </div>
                            <div class="timeline-item">
                                <div class="timeline-date">February 2024</div>
                                <div class="timeline-content">
                                    <h5>Leg Fracture Surgery</h5>
                                    <p>Successful orthopedic surgery for fractured left hind leg, metal plate inserted</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
}

function showHealthTab(tabName) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.health-tab-content');
    tabContents.forEach(content => {
        content.classList.remove('active');
    });
    
    // Remove active class from all tab buttons
    const tabBtns = document.querySelectorAll('.health-records-tabs .tab-btn');
    tabBtns.forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab content
    const selectedTab = document.getElementById(tabName);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    // Add active class to clicked button
    event.target.classList.add('active');
}

// Diet Planner Modal Functions
function showDietPlanner() {
    const modal = document.getElementById('dietPlannerModal');
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Reset form
        document.getElementById('dietPlannerForm').reset();
        document.getElementById('dietResults').innerHTML = '';
    }
}

function closeDietPlannerModal() {
    const modal = document.getElementById('dietPlannerModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

function generateDietPlan() {
    const petName = document.getElementById('dietPetName').value;
    const petAge = document.getElementById('dietPetAge').value;
    const petBreed = document.getElementById('dietPetBreed').value;
    const petCondition = document.getElementById('dietPetCondition').value;
    const resultsDiv = document.getElementById('dietResults');
    
    if (!petName || !petAge || !petBreed || !petCondition) {
        alert('Please fill in all fields to generate a diet plan');
        return;
    }
    
    // Generate personalized diet plan based on inputs
    const dietPlan = generatePersonalizedDiet(petName, petAge, petBreed, petCondition);
    
    resultsDiv.innerHTML = `
        <div class="diet-plan-results">
            <div class="diet-header">
                <h3>🍖 Personalized Diet Plan for ${petName}</h3>
                <div class="pet-summary">
                    <span class="pet-detail">${petBreed}</span> • 
                    <span class="pet-detail">${petAge} old</span> • 
                    <span class="pet-detail">${petCondition}</span>
                </div>
            </div>
            
            <div class="diet-sections">
                <div class="diet-section">
                    <h4>📊 Daily Nutrition Requirements</h4>
                    <div class="nutrition-grid">
                        <div class="nutrition-item">
                            <span class="nutrition-icon">🥩</span>
                            <div class="nutrition-info">
                                <span class="nutrition-label">Daily Food Amount</span>
                                <span class="nutrition-value">${dietPlan.dailyAmount}</span>
                            </div>
                        </div>
                        <div class="nutrition-item">
                            <span class="nutrition-icon">🔥</span>
                            <div class="nutrition-info">
                                <span class="nutrition-label">Daily Calories</span>
                                <span class="nutrition-value">${dietPlan.calories}</span>
                            </div>
                        </div>
                        <div class="nutrition-item">
                            <span class="nutrition-icon">🍽️</span>
                            <div class="nutrition-info">
                                <span class="nutrition-label">Meals Per Day</span>
                                <span class="nutrition-value">${dietPlan.mealsPerDay}</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="diet-section">
                    <h4>⏰ Meal Schedule</h4>
                    <div class="meal-schedule">
                        ${dietPlan.mealSchedule.map(meal => `
                            <div class="meal-item">
                                <div class="meal-time">${meal.time}</div>
                                <div class="meal-details">
                                    <span class="meal-name">${meal.name}</span>
                                    <span class="meal-amount">${meal.amount}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="diet-section">
                    <h4>🥘 Recommended Foods</h4>
                    <div class="food-categories">
                        <div class="food-category">
                            <h5>✅ Recommended</h5>
                            <ul class="food-list recommended">
                                ${dietPlan.recommendedFoods.map(food => `<li>${food}</li>`).join('')}
                            </ul>
                        </div>
                        <div class="food-category">
                            <h5>❌ Avoid</h5>
                            <ul class="food-list avoid">
                                ${dietPlan.avoidFoods.map(food => `<li>${food}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                </div>
                
                <div class="diet-section">
                    <h4>💡 Special Recommendations</h4>
                    <div class="recommendations">
                        ${dietPlan.specialRecommendations.map(rec => `
                            <div class="recommendation-item">
                                <span class="rec-icon">💡</span>
                                <span class="rec-text">${rec}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="diet-section">
                    <h4>⚠️ Important Notes</h4>
                    <div class="important-notes">
                        ${dietPlan.importantNotes.map(note => `
                            <div class="note-item">
                                <span class="note-icon">⚠️</span>
                                <span class="note-text">${note}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
            
            <div class="diet-actions">
                <button class="diet-action-btn save" onclick="saveDietPlan('${petName}')">
                    💾 Save Diet Plan
                </button>
                <button class="diet-action-btn print" onclick="printDietPlan('${petName}')">
                    🖨️ Print Plan
                </button>
            </div>
        </div>
    `;
}

function generatePersonalizedDiet(name, age, breed, condition) {
    // Base diet plan that will be customized
    let dietPlan = {
        dailyAmount: "2-3 cups",
        calories: "800-1200 kcal",
        mealsPerDay: "2-3 meals",
        mealSchedule: [],
        recommendedFoods: [],
        avoidFoods: [],
        specialRecommendations: [],
        importantNotes: []
    };
    
    // Customize based on age
    if (age.includes('puppy') || age.includes('kitten') || parseInt(age) < 1) {
        dietPlan.dailyAmount = "1-2 cups";
        dietPlan.calories = "400-800 kcal";
        dietPlan.mealsPerDay = "3-4 meals";
        dietPlan.mealSchedule = [
            { time: "7:00 AM", name: "Breakfast", amount: "1/2 cup" },
            { time: "12:00 PM", name: "Lunch", amount: "1/2 cup" },
            { time: "5:00 PM", name: "Dinner", amount: "1/2 cup" },
            { time: "9:00 PM", name: "Evening Snack", amount: "1/4 cup" }
        ];
        dietPlan.recommendedFoods = [
            "High-quality puppy/kitten food",
            "Cooked chicken breast",
            "Cooked rice",
            "Puppy milk replacer",
            "Soft vegetables (carrots, sweet potato)"
        ];
        dietPlan.specialRecommendations = [
            "Feed smaller, frequent meals for better digestion",
            "Ensure food is age-appropriate and easy to chew",
            "Monitor weight gain regularly"
        ];
    } else if (parseInt(age) > 7) {
        dietPlan.dailyAmount = "1.5-2.5 cups";
        dietPlan.calories = "600-1000 kcal";
        dietPlan.mealsPerDay = "2 meals";
        dietPlan.mealSchedule = [
            { time: "8:00 AM", name: "Breakfast", amount: "1 cup" },
            { time: "6:00 PM", name: "Dinner", amount: "1 cup" }
        ];
        dietPlan.recommendedFoods = [
            "Senior pet food formula",
            "Lean proteins (chicken, fish)",
            "Joint support supplements",
            "Easily digestible grains",
            "Antioxidant-rich vegetables"
        ];
        dietPlan.specialRecommendations = [
            "Choose senior-specific formulas for joint health",
            "Monitor for weight management",
            "Consider softer foods if dental issues exist"
        ];
    } else {
        dietPlan.mealSchedule = [
            { time: "8:00 AM", name: "Breakfast", amount: "1.5 cups" },
            { time: "6:00 PM", name: "Dinner", amount: "1.5 cups" }
        ];
        dietPlan.recommendedFoods = [
            "High-quality adult pet food",
            "Lean meats (chicken, turkey, fish)",
            "Brown rice or sweet potato",
            "Fresh vegetables (carrots, green beans)",
            "Healthy fats (fish oil)"
        ];
    }
    
    // Customize based on breed
    if (breed.toLowerCase().includes('retriever') || breed.toLowerCase().includes('labrador')) {
        dietPlan.specialRecommendations.push("Monitor portion sizes - this breed is prone to overeating");
        dietPlan.specialRecommendations.push("Include omega-3 fatty acids for coat health");
    } else if (breed.toLowerCase().includes('persian') || breed.toLowerCase().includes('cat')) {
        dietPlan.recommendedFoods.push("Hairball control formula");
        dietPlan.specialRecommendations.push("Provide plenty of fresh water");
        dietPlan.specialRecommendations.push("Consider wet food for hydration");
    }
    
    // Customize based on condition
    switch (condition.toLowerCase()) {
        case 'overweight':
            dietPlan.dailyAmount = "Reduce by 20%";
            dietPlan.calories = "Reduce by 20%";
            dietPlan.recommendedFoods.push("Weight management formula");
            dietPlan.specialRecommendations.push("Increase exercise and reduce treats");
            dietPlan.specialRecommendations.push("Use measuring cups for accurate portions");
            break;
        case 'underweight':
            dietPlan.dailyAmount = "Increase by 15%";
            dietPlan.calories = "Increase by 15%";
            dietPlan.recommendedFoods.push("High-calorie, nutrient-dense food");
            dietPlan.specialRecommendations.push("Add healthy fats to meals");
            break;
        case 'allergies':
            dietPlan.recommendedFoods = [
                "Limited ingredient diet",
                "Novel protein sources (duck, venison)",
                "Grain-free options if grain allergic",
                "Hypoallergenic formulas"
            ];
            dietPlan.avoidFoods.push("Common allergens (chicken, beef, wheat, corn)");
            dietPlan.specialRecommendations.push("Introduce new foods gradually");
            break;
        case 'diabetes':
            dietPlan.recommendedFoods.push("High-fiber, low-carb diet");
            dietPlan.specialRecommendations.push("Feed at consistent times with medication");
            dietPlan.specialRecommendations.push("Monitor blood sugar levels regularly");
            break;
        case 'kidney disease':
            dietPlan.recommendedFoods.push("Low-phosphorus, moderate protein diet");
            dietPlan.specialRecommendations.push("Increase water intake");
            dietPlan.specialRecommendations.push("Work closely with veterinarian");
            break;
    }
    
    // Common foods to avoid
    dietPlan.avoidFoods = dietPlan.avoidFoods.concat([
        "Chocolate and caffeine",
        "Grapes and raisins",
        "Onions and garlic",
        "Xylitol (artificial sweetener)",
        "Cooked bones",
        "High-fat foods"
    ]);
    
    // Important notes
    dietPlan.importantNotes = [
        "Always transition to new foods gradually over 7-10 days",
        "Provide fresh water at all times",
        "Consult your veterinarian before making major diet changes",
        "Monitor your pet's weight and adjust portions as needed",
        "This plan is a general guideline - individual needs may vary"
    ];
    
    return dietPlan;
}

function saveDietPlan(petName) {
    alert(`Diet plan for ${petName} has been saved to your pet's profile! 💾`);
}

function printDietPlan(petName) {
    window.print();
}

function showDietPlan(petId) {
    const dietPlans = {
        buddy: {
            name: 'Buddy',
            type: 'Golden Retriever',
            plan: `
                <h3>🐕 Buddy's Personalized Diet Plan</h3>
                <div class="diet-overview">
                    <div class="diet-stat">
                        <span class="stat-number">2.5 cups</span>
                        <span class="stat-label">Daily Food</span>
                    </div>
                    <div class="diet-stat">
                        <span class="stat-number">1,200</span>
                        <span class="stat-label">Calories/Day</span>
                    </div>
                    <div class="diet-stat">
                        <span class="stat-number">2x</span>
                        <span class="stat-label">Meals/Day</span>
                    </div>
                </div>
                <div class="meal-schedule">
                    <h4>📅 Daily Meal Schedule</h4>
                    <div class="meal-item">
                        <span class="meal-time">8:00 AM</span>
                        <span class="meal-desc">Breakfast - 1.25 cups high-quality dry food + vitamins</span>
                    </div>
                    <div class="meal-item">
                        <span class="meal-time">6:00 PM</span>
                        <span class="meal-desc">Dinner - 1.25 cups dry food + occasional treats</span>
                    </div>
                </div>
                <div class="nutrition-tips">
                    <h4>💡 Nutrition Tips</h4>
                    <ul>
                        <li>High-protein diet for active Golden Retrievers</li>
                        <li>Omega-3 supplements for coat health</li>
                        <li>Avoid chocolate, grapes, and onions</li>
                        <li>Fresh water available at all times</li>
                    </ul>
                </div>
            `
        },
        luna: {
            name: 'Luna',
            type: 'Persian Cat',
            plan: `
                <h3>🐱 Luna's Personalized Diet Plan</h3>
                <div class="diet-overview">
                    <div class="diet-stat">
                        <span class="stat-number">1/2 cup</span>
                        <span class="stat-label">Daily Food</span>
                    </div>
                    <div class="diet-stat">
                        <span class="stat-number">300</span>
                        <span class="stat-label">Calories/Day</span>
                    </div>
                    <div class="diet-stat">
                        <span class="stat-number">3x</span>
                        <span class="stat-label">Meals/Day</span>
                    </div>
                </div>
                <div class="meal-schedule">
                    <h4>📅 Daily Meal Schedule</h4>
                    <div class="meal-item">
                        <span class="meal-time">7:00 AM</span>
                        <span class="meal-desc">Breakfast - 1/6 cup wet food + dry kibble</span>
                    </div>
                    <div class="meal-item">
                        <span class="meal-time">1:00 PM</span>
                        <span class="meal-desc">Lunch - 1/6 cup dry food</span>
                    </div>
                    <div class="meal-item">
                        <span class="meal-time">7:00 PM</span>
                        <span class="meal-desc">Dinner - 1/6 cup wet food + treats</span>
                    </div>
                </div>
                <div class="nutrition-tips">
                    <h4>💡 Nutrition Tips</h4>
                    <ul>
                        <li>High-quality protein for Persian cats</li>
                        <li>Hairball control formula recommended</li>
                        <li>Avoid dairy products and fish bones</li>
                        <li>Regular grooming to prevent hairballs</li>
                    </ul>
                </div>
            `
        },
        max: {
            name: 'Max',
            type: 'Labrador Mix',
            plan: `
                <h3>🐕 Max's Recovery Diet Plan</h3>
                <div class="diet-overview">
                    <div class="diet-stat">
                        <span class="stat-number">3 cups</span>
                        <span class="stat-label">Daily Food</span>
                    </div>
                    <div class="diet-stat">
                        <span class="stat-number">1,400</span>
                        <span class="stat-label">Calories/Day</span>
                    </div>
                    <div class="diet-stat">
                        <span class="stat-number">2x</span>
                        <span class="stat-label">Meals/Day</span>
                    </div>
                </div>
                <div class="meal-schedule">
                    <h4>📅 Recovery Meal Schedule</h4>
                    <div class="meal-item">
                        <span class="meal-time">8:00 AM</span>
                        <span class="meal-desc">Breakfast - 1.5 cups recovery formula + supplements</span>
                    </div>
                    <div class="meal-item">
                        <span class="meal-time">6:00 PM</span>
                        <span class="meal-desc">Dinner - 1.5 cups high-protein food + joint supplements</span>
                    </div>
                </div>
                <div class="nutrition-tips">
                    <h4>💡 Recovery Nutrition Tips</h4>
                    <ul>
                        <li>High-protein diet for muscle recovery</li>
                        <li>Glucosamine supplements for joint health</li>
                        <li>Anti-inflammatory foods like fish oil</li>
                        <li>Controlled portions to maintain healthy weight</li>
                    </ul>
                </div>
            `
        }
    };
    
    const dietPlanContent = document.getElementById('diet-plan-content');
    dietPlanContent.innerHTML = dietPlans[petId].plan;
    dietPlanContent.style.display = 'block';
    
    // Hide pet selection
    document.querySelector('.diet-pets-selection').style.display = 'none';
}

// AI Pet Care Function
function showAIPetCare() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content ai-care-modal">
            <div class="modal-header">
                <h2>🤖 AI Pet Care Assistant</h2>
                <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
            </div>
            <div class="modal-body">
                <div class="ai-features">
                    <div class="ai-feature-card" onclick="showAIFeature('diagnosis')">
                        <div class="ai-icon">🔬</div>
                        <h3>Smart Diagnosis</h3>
                        <p>AI-powered symptom analysis and health recommendations</p>
                    </div>
                    <div class="ai-feature-card" onclick="showAIFeature('behavior')">
                        <div class="ai-icon">🧠</div>
                        <h3>Behavior Analysis</h3>
                        <p>Understand your pet's behavior patterns and needs</p>
                    </div>
                    <div class="ai-feature-card" onclick="showAIFeature('nutrition')">
                        <div class="ai-icon">🍖</div>
                        <h3>Nutrition Advisor</h3>
                        <p>Personalized nutrition recommendations based on AI analysis</p>
                    </div>
                    <div class="ai-feature-card" onclick="showAIFeature('emergency')">
                        <div class="ai-icon">🚨</div>
                        <h3>Emergency Detection</h3>
                        <p>AI monitors for emergency situations and alerts</p>
                    </div>
                </div>
                
                <div id="ai-feature-content" class="ai-feature-content" style="display: none;">
                    <!-- AI feature content will be inserted here -->
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
}

function showAIFeature(featureType) {
    const features = {
        diagnosis: `
            <h3>🔬 AI Smart Diagnosis</h3>
            <div class="ai-diagnosis-form">
                <h4>Describe Your Pet's Symptoms</h4>
                <textarea placeholder="E.g., My dog has been lethargic and not eating well for 2 days..." rows="4"></textarea>
                <button class="ai-analyze-btn" onclick="analyzeSymptoms()">🤖 Analyze Symptoms</button>
            </div>
            <div id="diagnosis-result" class="diagnosis-result" style="display: none;">
                <h4>AI Analysis Results</h4>
                <div class="result-card">
                    <div class="severity-indicator moderate">Moderate Concern</div>
                    <h5>Possible Conditions:</h5>
                    <ul>
                        <li>Gastrointestinal upset (70% probability)</li>
                        <li>Stress or anxiety (20% probability)</li>
                        <li>Minor infection (10% probability)</li>
                    </ul>
                    <h5>Recommendations:</h5>
                    <ul>
                        <li>Monitor food and water intake</li>
                        <li>Provide bland diet (rice and chicken)</li>
                        <li>Schedule vet appointment if symptoms persist</li>
                        <li>Keep pet comfortable and stress-free</li>
                    </ul>
                    <div class="emergency-note">
                        ⚠️ If symptoms worsen or pet shows signs of severe distress, contact emergency vet immediately.
                    </div>
                </div>
            </div>
        `,
        behavior: `
            <h3>🧠 AI Behavior Analysis</h3>
            <div class="behavior-insights">
                <div class="insight-card">
                    <h4>🐕 Buddy's Behavior Pattern</h4>
                    <div class="behavior-metric">
                        <span class="metric-label">Activity Level:</span>
                        <div class="metric-bar">
                            <div class="metric-fill" style="width: 85%"></div>
                        </div>
                        <span class="metric-value">High (85%)</span>
                    </div>
                    <div class="behavior-metric">
                        <span class="metric-label">Social Interaction:</span>
                        <div class="metric-bar">
                            <div class="metric-fill" style="width: 90%"></div>
                        </div>
                        <span class="metric-value">Excellent (90%)</span>
                    </div>
                    <div class="ai-recommendation">
                        <strong>AI Insight:</strong> Buddy shows excellent social behavior and high energy. Consider increasing exercise time and mental stimulation activities.
                    </div>
                </div>
                <div class="insight-card">
                    <h4>🐱 Luna's Behavior Pattern</h4>
                    <div class="behavior-metric">
                        <span class="metric-label">Independence:</span>
                        <div class="metric-bar">
                            <div class="metric-fill" style="width: 95%"></div>
                        </div>
                        <span class="metric-value">Very High (95%)</span>
                    </div>
                    <div class="behavior-metric">
                        <span class="metric-label">Playfulness:</span>
                        <div class="metric-bar">
                            <div class="metric-fill" style="width: 60%"></div>
                        </div>
                        <span class="metric-value">Moderate (60%)</span>
                    </div>
                    <div class="ai-recommendation">
                        <strong>AI Insight:</strong> Luna displays typical Persian cat behavior with high independence. Interactive toys can help increase playfulness.
                    </div>
                </div>
            </div>
        `,
        nutrition: `
            <h3>🍖 AI Nutrition Advisor</h3>
            <div class="nutrition-analysis">
                <div class="nutrition-card">
                    <h4>Current Nutrition Status</h4>
                    <div class="nutrition-score">
                        <div class="score-circle">
                            <span class="score-number">92</span>
                            <span class="score-label">Nutrition Score</span>
                        </div>
                    </div>
                    <div class="nutrition-breakdown">
                        <div class="nutrient-item">
                            <span class="nutrient-name">Protein</span>
                            <div class="nutrient-bar">
                                <div class="nutrient-fill good" style="width: 85%"></div>
                            </div>
                            <span class="nutrient-status">Good</span>
                        </div>
                        <div class="nutrient-item">
                            <span class="nutrient-name">Carbohydrates</span>
                            <div class="nutrient-bar">
                                <div class="nutrient-fill excellent" style="width: 90%"></div>
                            </div>
                            <span class="nutrient-status">Excellent</span>
                        </div>
                        <div class="nutrient-item">
                            <span class="nutrient-name">Fats</span>
                            <div class="nutrient-bar">
                                <div class="nutrient-fill good" style="width: 80%"></div>
                            </div>
                            <span class="nutrient-status">Good</span>
                        </div>
                        <div class="nutrient-item">
                            <span class="nutrient-name">Vitamins</span>
                            <div class="nutrient-bar">
                                <div class="nutrient-fill needs-improvement" style="width: 70%"></div>
                            </div>
                            <span class="nutrient-status">Needs Improvement</span>
                        </div>
                    </div>
                    <div class="ai-nutrition-advice">
                        <h5>🤖 AI Recommendations:</h5>
                        <ul>
                            <li>Add vitamin supplements to improve overall nutrition</li>
                            <li>Consider omega-3 rich foods for coat health</li>
                            <li>Maintain current protein levels - excellent for active pets</li>
                            <li>Monitor portion sizes to prevent overfeeding</li>
                        </ul>
                    </div>
                </div>
            </div>
        `,
        emergency: `
            <h3>🚨 AI Emergency Detection</h3>
            <div class="emergency-monitoring">
                <div class="monitoring-status">
                    <div class="status-indicator active">
                        <div class="status-light"></div>
                        <span>AI Monitoring Active</span>
                    </div>
                </div>
                <div class="emergency-features">
                    <div class="emergency-feature">
                        <div class="feature-icon">📱</div>
                        <h4>Real-time Monitoring</h4>
                        <p>AI continuously monitors your pet's vital signs and behavior patterns through connected devices.</p>
                    </div>
                    <div class="emergency-feature">
                        <div class="feature-icon">⚡</div>
                        <h4>Instant Alerts</h4>
                        <p>Immediate notifications sent to your phone and emergency contacts when anomalies are detected.</p>
                    </div>
                    <div class="emergency-feature">
                        <div class="feature-icon">🏥</div>
                        <h4>Vet Connection</h4>
                        <p>Direct connection to emergency veterinary services with your pet's complete medical history.</p>
                    </div>
                </div>
                <div class="recent-alerts">
                    <h4>Recent AI Alerts</h4>
                    <div class="alert-item resolved">
                        <span class="alert-time">2 days ago</span>
                        <span class="alert-message">Buddy's heart rate slightly elevated - Resolved (post-exercise)</span>
                    </div>
                    <div class="alert-item resolved">
                        <span class="alert-time">1 week ago</span>
                        <span class="alert-message">Luna's eating pattern changed - Resolved (new food adjustment)</span>
                    </div>
                </div>
            </div>
        `
    };
    
    const aiFeatureContent = document.getElementById('ai-feature-content');
    aiFeatureContent.innerHTML = features[featureType];
    aiFeatureContent.style.display = 'block';
    
    // Hide AI features selection
    document.querySelector('.ai-features').style.display = 'none';
}

function analyzeSymptoms() {
    const diagnosisResult = document.getElementById('diagnosis-result');
    diagnosisResult.style.display = 'block';
    
    // Simulate AI analysis with loading effect
    const analyzeBtn = document.querySelector('.ai-analyze-btn');
    analyzeBtn.textContent = '🤖 Analyzing...';
    analyzeBtn.disabled = true;
    
    setTimeout(() => {
        analyzeBtn.textContent = '✅ Analysis Complete';
        setTimeout(() => {
            analyzeBtn.textContent = '🤖 Analyze Symptoms';
            analyzeBtn.disabled = false;
        }, 2000);
    }, 2000);
}

// Add smooth scrolling for better UX
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add form input animations
document.addEventListener('DOMContentLoaded', function() {
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            if (!this.value) {
                this.parentElement.classList.remove('focused');
            }
        });
    });
});

// Vet Appointment functionality
function showTab(tabName) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => {
        content.classList.remove('active');
    });
    
    // Remove active class from all tab buttons
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab content
    const selectedTab = document.getElementById(tabName);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    // Add active class to clicked button
    event.target.classList.add('active');
}

// Handle appointment form submission
document.addEventListener('DOMContentLoaded', function() {
    const appointmentForm = document.getElementById('appointmentForm');
    if (appointmentForm) {
        appointmentForm.addEventListener('submit', handleAppointmentSubmission);
    }
    
    // Handle appointment action buttons
    const actionBtns = document.querySelectorAll('.action-btn');
    actionBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            if (this.classList.contains('reschedule')) {
                alert('📅 Reschedule Appointment\n\nThis feature will allow you to:\n• Select a new date and time\n• Choose different doctor if needed\n• Update appointment details\n\nComing soon! 🐾');
            } else if (this.classList.contains('cancel')) {
                if (confirm('❌ Cancel Appointment\n\nAre you sure you want to cancel this appointment?')) {
                    alert('✅ Appointment cancelled successfully!\n\nYou will receive a confirmation email shortly.');
                }
            } else if (this.classList.contains('view-report')) {
                alert('📋 Medical Report\n\nThis feature will show:\n• Examination results\n• Treatment recommendations\n• Prescribed medications\n• Follow-up instructions\n\nComing soon! 🐾');
            }
        });
    });
});

function handleAppointmentSubmission(e) {
    e.preventDefault();
    
    const date = document.getElementById('appointmentDate').value;
    const time = document.getElementById('appointmentTime').value;
    const doctor = document.getElementById('doctorName').value;
    const hospital = document.getElementById('hospitalName').value;
    const pet = document.getElementById('petInfo').value;
    const reason = document.getElementById('appointmentReason').value;
    
    if (!date || !time || !doctor || !hospital || !pet || !reason) {
        alert('❌ Please fill in all required fields');
        return;
    }
    
    // Format the appointment details
    const appointmentDetails = `
        📅 Date: ${new Date(date).toLocaleDateString()}
        ⏰ Time: ${time}
        👨‍⚕️ Doctor: ${doctor}
        🏥 Hospital: ${hospital}
        🐾 Pet: ${pet}
    `;
    
    // Show success modal
    showAppointmentModal(appointmentDetails);
    
    // Reset form
    document.getElementById('appointmentForm').reset();
}

function showAppointmentModal(details) {
    const modal = document.getElementById('appointmentModal');
    const modalDetails = document.getElementById('modalAppointmentDetails');
    
    if (modal && modalDetails) {
        modalDetails.textContent = details;
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function closeAppointmentModal() {
    const modal = document.getElementById('appointmentModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// SOS Emergency functionality
function triggerSOS() {
    if (confirm('🚨 EMERGENCY ALERT\n\nThis will immediately contact emergency services and notify your registered contacts.\n\nProceed only if this is a real emergency!')) {
        showSosModal();
        
        // Simulate emergency response
        setTimeout(() => {
            const countdownTimer = document.getElementById('countdownTimer');
            if (countdownTimer) {
                let countdown = 30;
                const timer = setInterval(() => {
                    countdownTimer.textContent = `Emergency services ETA: ${countdown} seconds`;
                    countdown--;
                    
                    if (countdown < 0) {
                        clearInterval(timer);
                        countdownTimer.textContent = 'Emergency services have arrived!';
                    }
                }, 1000);
            }
        }, 1000);
    }
}

function showSosModal() {
    const modal = document.getElementById('sosModal');
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function closeSosModal() {
    const modal = document.getElementById('sosModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Close modals when clicking outside
window.addEventListener('click', function(event) {
    const appointmentModal = document.getElementById('appointmentModal');
    const sosModal = document.getElementById('sosModal');
    
    if (event.target === appointmentModal) {
        closeAppointmentModal();
    }
    
    if (event.target === sosModal) {
        closeSosModal();
    }
});

// Health Dashboard functionality
function showPetProfile(petId) {
    // Hide all pet profiles
    const petProfiles = document.querySelectorAll('.pet-profile');
    petProfiles.forEach(profile => {
        profile.classList.remove('active');
    });
    
    // Remove active class from all tab buttons
    const tabBtns = document.querySelectorAll('.pet-tab-btn');
    tabBtns.forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected pet profile
    const selectedProfile = document.getElementById(petId);
    if (selectedProfile) {
        selectedProfile.classList.add('active');
    }
    
    // Add active class to clicked button
    event.target.classList.add('active');
}

function editPetProfile(petId) {
    const modal = document.getElementById('editPetModal');
    const petData = getPetData(petId);
    
    // Populate form with current pet data
    document.getElementById('editPetName').value = petData.name;
    document.getElementById('editPetAge').value = petData.age;
    document.getElementById('editPetWeight').value = petData.weight;
    document.getElementById('editPetBreed').value = petData.breed;
    document.getElementById('editHealthStatus').value = petData.healthStatus;
    
    // Show modal