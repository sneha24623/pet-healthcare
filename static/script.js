/**
 * Pet Healthcare Management System - Front-end Logic
 * -------------------------------------------------
 * Handles modal visibility, navigation toggles, and form submissions to the Flask API.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Attempt to fetch user data and dashboard stats immediately upon loading dashboard.
    if (document.body.classList.contains('dashboard-main')) {
        fetchDashboardStats();
    }
});

// --- API Calls ---

async function fetchDashboardStats() {
    try {
        const response = await fetch('/api/dashboard/stats');
        const data = await response.json();

        if (response.ok) {
            document.getElementById('userName').textContent = data.user_name || 'User';
            // Update Dashboard cards (using the stat-number class)
            const stats = document.querySelectorAll('.stat-number');
            if (stats.length >= 3) {
                stats[0].textContent = data.registered_pets || 0;
                stats[1].textContent = data.upcoming_appointments || 0;
                stats[2].textContent = data.available_adoption || 0;
                // Note: Health Records stat is often hardcoded/mocked in your HTML,
                // but if dynamic, it would be stats[3] or stats[4] depending on the HTML order.
            }
        } else {
            console.error('Failed to load dashboard stats:', data.error);
        }
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
    }
}

// --- General Functions ---

function logout() {
    // In a real application, this would send an API request to clear the server session/cookie.
    console.log('Logging out...');
    window.location.href = '/'; 
}


// --- Modal Control Functions (Generic Handlers for Modals) ---

function showEmergencyContact() {
    document.getElementById('emergencyContactModal').style.display = 'block';
}
function closeEmergencyContactModal() {
    document.getElementById('emergencyContactModal').style.display = 'none';
}
function showSetReminder() {
    document.getElementById('setReminderModal').style.display = 'block';
}
function closeSetReminderModal() {
    document.getElementById('setReminderModal').style.display = 'none';
}
function showAddNewPet() {
    document.getElementById('addNewPetModal').style.display = 'block';
}
function closeAddNewPetModal() {
    document.getElementById('addNewPetModal').style.display = 'none';
}
function showDietPlanner() {
    document.getElementById('dietPlannerModal').style.display = 'block';
}
function closeDietPlannerModal() {
    document.getElementById('dietPlannerModal').style.display = 'none';
}
function showDietPlannerFromHome() {
    // Placeholder function for the home page link (assuming it opens the modal)
    showDietPlanner();
}

// Adoption Page Modals
function showContactModal(petName, petBreed) {
    document.getElementById('modalPetName').textContent = `${petName} (${petBreed})`;
    document.getElementById('contactModal').style.display = 'block';
}
function closeContactModal() {
    document.getElementById('contactModal').style.display = 'none';
}
function showAdoptionRegisterModal() {
    document.getElementById('adoptionRegisterModal').style.display = 'block';
}
function closeAdoptionRegisterModal() {
    document.getElementById('adoptionRegisterModal').style.display = 'none';
}
function closeAdoptionSuccessModal() {
    document.getElementById('adoptionSuccessModal').style.display = 'none';
}
function closeAppointmentModal() {
    document.getElementById('appointmentModal').style.display = 'none';
}

// Vet Page Tab Control (if needed, based on your HTML structure)
function showTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    document.getElementById(tabId).classList.add('active');
    document.querySelector(`.tab-btn[onclick*="${tabId}"]`).classList.add('active');

    if (tabId === 'view') {
        fetchAppointments();
    }
}

async function fetchAppointments() {
    const appointmentsListDiv = document.querySelector('#view .appointments-list');
    
    // Clear the existing content (the mock data)
    appointmentsListDiv.innerHTML = `
        <div class="card-header">
            <h2>👁️ Your Appointments</h2>
            <p>View and manage your scheduled appointments</p>
        </div>
    `;

    try {
        const response = await fetch('/api/appointments');
        const appointments = await response.json();

        if (response.ok && appointments.length > 0) {
            appointments.forEach(appt => {
                const itemHtml = createAppointmentItem(appt);
                appointmentsListDiv.insertAdjacentHTML('beforeend', itemHtml);
            });
        } else {
            appointmentsListDiv.insertAdjacentHTML('beforeend', 
                '<p style="text-align: center; color: #fff; padding: 20px;">No appointments found. Schedule one!</p>'
            );
        }
    } catch (error) {
        console.error('Error fetching appointments:', error);
        appointmentsListDiv.insertAdjacentHTML('beforeend', 
            '<p style="text-align: center; color: #ff4757; padding: 20px;">Failed to load appointments due to a server error.</p>'
        );
    }
}

// --- NEW FUNCTION: Render single appointment item HTML ---
function createAppointmentItem(appt) {
    const statusClass = appt.status.toLowerCase();
    const actions = statusClass === 'completed' 
        ? '<button class="action-btn view-report">📋 View Report</button>'
        : '<button class="action-btn reschedule">📝 Reschedule</button><button class="action-btn cancel">❌ Cancel</button>';
        
    return `
        <div class="appointment-item">
            <div class="appointment-status ${statusClass}">${appt.status}</div>
            <div class="appointment-details">
                <div class="appointment-info">
                    <h3>${appt.pet_id} - ${appt.reason}</h3> 
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-icon">📅</span>
                            <span>Date: ${appt.date}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-icon">⏰</span>
                            <span>Time: ${appt.time}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-icon">👨‍⚕️</span>
                            <span>${appt.doctor_name}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-icon">🏥</span>
                            <span>${appt.hospital_name}</span>
                        </div>
                    </div>
                </div>
                <div class="appointment-actions">
                    ${actions}
                </div>
            </div>
        </div>
    `;
}


// Health Dashboard Tab Control
function showPetProfile(petId) {
    document.querySelectorAll('.pet-profile').forEach(profile => {
        profile.classList.remove('active');
    });
    document.querySelectorAll('.pet-tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(petId).classList.add('active');
    document.querySelector(`.pet-tab-btn[onclick*="${petId}"]`).classList.add('active');
}

function showLearnMore() {
    document.getElementById('learnMoreSection').style.display = 'block';
}
function hideLearnMore() {
    document.getElementById('learnMoreSection').style.display = 'none';
}

// SOS Emergency Modal Toggle (Placeholder for triggerSOS)
function triggerSOS() {
    console.log('SOS EMERGENCY triggered!');
    // In a real app, this would send an urgent ping to the vet.
    document.getElementById('emergencyContactModal').style.display = 'none';
    document.getElementById('sosModal').style.display = 'block';
}
function closeSosModal() {
    document.getElementById('sosModal').style.display = 'none';
}


// --- Form Submission Handlers ---

// Handler for Add New Pet Form
document.getElementById('addPetForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const form = event.target;
    const petName = document.getElementById('newPetName').value;

    const formData = {
        newPetName: petName,
        newPetType: document.getElementById('newPetType').value,
        newPetBreed: document.getElementById('newPetBreed').value,
        newPetGender: document.getElementById('newPetGender').value,
        newPetAge: document.getElementById('newPetAge').value,
        newPetWeight: document.getElementById('newPetWeight').value,
        newPetHealthStatus: document.getElementById('newPetHealthStatus').value,
        newPetAllergies: document.getElementById('newPetAllergies').value,
        newPetVet: document.getElementById('newPetVet').value
        // Note: NewPetMedications, NewPetEmergencyContact, NewPetNotes are ignored for simple API
    };

    try {
        const response = await fetch('/api/pets', { // API route defined in app.py
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        const result = await response.json();
        
        closeAddNewPetModal();
        if (response.ok) {
            document.getElementById('addPetSuccessDetails').textContent = `Welcome ${petName} to the Family!`;
            document.getElementById('addPetSuccessModal').style.display = 'block';
            form.reset();
            fetchDashboardStats(); // Refresh stats
        } else {
            alert(`Error adding pet: ${result.error}`);
        }

    } catch (error) {
        console.error('Error submitting pet form:', error);
        alert('An error occurred. Please try again.');
    }
});


// Handler for Vet Appointment Form
document.getElementById('appointmentForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const form = event.target;
    
    const formData = {
        appointmentDate: document.getElementById('appointmentDate').value,
        appointmentTime: document.getElementById('appointmentTime').value,
        doctorName: document.getElementById('doctorName').value,
        hospitalName: document.getElementById('hospitalName').value,
        petInfo: document.getElementById('petInfo').value, // Send full string to backend for simplicity
        appointmentReason: document.getElementById('appointmentReason').value
    };

    try {
        const response = await fetch('/api/appointments/schedule', { // API route defined in app.py
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        const result = await response.json();
        
        if (response.ok) {
            document.getElementById('modalAppointmentDetails').textContent = `${formData.petInfo} - ${formData.appointmentDate}`;
            document.getElementById('appointmentModal').style.display = 'block';
            form.reset();
            fetchDashboardStats(); // Refresh stats
        } else {
            alert(`Error scheduling appointment: ${result.error}`);
        }

    } catch (error) {
        console.error('Error submitting appointment form:', error);
        alert('An error occurred. Please check the console.');
    }
});


// Handler for Adoption Register Form (New Feature)
const adoptionRegisterForm = document.getElementById('adoptionRegisterForm');

if (adoptionRegisterForm) {
    adoptionRegisterForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        const form = event.target;
        const petName = document.getElementById('adoptionPetName').value;

        const formData = {
            adoptionPetName: petName,
            adoptionPetBreed: document.getElementById('adoptionPetBreed').value,
            adoptionPetGender: document.getElementById('adoptionPetGender').value,
            adoptionPetAge: document.getElementById('adoptionPetAge').value,
            adoptionShelter: document.getElementById('adoptionShelter').value,
            adoptionContact: document.getElementById('adoptionContact').value
        };

        try {
            const response = await fetch('/api/adoption/register', { // API route defined in app.py
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (response.ok) {
                closeAdoptionRegisterModal();
                document.getElementById('adoptionModalPetName').textContent = petName;
                document.getElementById('adoptionSuccessModal').style.display = 'block';
                form.reset();
            } else {
                alert(`Error: ${result.error || 'Failed to register pet for adoption.'}`);
            }
        } catch (error) {
            console.error('Network or submission error:', error);
            alert('An unexpected error occurred during adoption submission.');
        }
    });
}