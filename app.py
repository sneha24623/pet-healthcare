from flask import Flask, request, jsonify, g, render_template, url_for, redirect
import sqlite3
import os

# --- Configuration for Flask ---
# Flask automatically looks for HTML files in 'templates' 
# and static assets (CSS, JS, images) in 'static'.
app = Flask(__name__) 
app.config['SECRET_KEY'] = 'a_secure_secret_key_for_sessions'

# The database file is in the same folder as app.py
DATABASE_NAME = 'pets_db.sqlite' 

# --- Database Helper Functions ---
def get_db():
    """Opens a new database connection for the current request."""
    db = getattr(g, '_database', None)
    if db is None:
        # Construct the absolute path to the database file (in the same dir as app.py)
        db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), DATABASE_NAME)
        db = g._database = sqlite3.connect(db_path)
        db.row_factory = sqlite3.Row
    return db

@app.teardown_appcontext
def close_connection(exception):
    """Closes the database connection at the end of the request."""
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

def query_db(query, args=(), one=False):
    """Utility function to execute a query and return results."""
    cur = get_db().execute(query, args)
    rv = cur.fetchall()
    cur.close()
    return (rv[0] if rv else None) if one else rv

# --- User Session (Simplified) ---
session_data = {} 

@app.before_request
def load_logged_in_user():
    # Simulate user login; defaults to user_id 1 (John Smith) for demo API calls
    g.user_id = session_data.get('user_id', 1) 

# --- Frontend Serving (Template Routes) ---

@app.route('/')
def index():
    """Default route, renders the login/index page."""
    # Assuming 'index.html' is your login page.
    return render_template('index.html') 

@app.route('/<page_name>.html')
def render_page(page_name):
    """Renders any HTML file found in the templates folder, e.g., /dashboard.html."""
    # Note: This requires all internal links in your HTML to use 
    # {{ url_for('render_page', page_name='home') }}
    return render_template(f'{page_name}.html')

# --- API Endpoints ---

@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.json
    try:
        db = get_db()
        db.execute(
            "INSERT INTO User (first_name, last_name, email, password, phone) VALUES (?, ?, ?, ?, ?)",
            (data['firstName'], data['lastName'], data['email'], data['signupPassword'], data['phone'])
        )
        db.commit()
        return jsonify({"message": "User created successfully"}), 201
    except sqlite3.IntegrityError:
        return jsonify({"error": "Email already exists"}), 409
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/login', methods=['POST'])
def login_api():
    # Renamed to login_api to avoid conflict with the potential template route
    data = request.json
    user = query_db("SELECT * FROM User WHERE email = ? AND password = ?", 
                    (data.get('email'), data.get('password')), one=True)
    
    if user:
        # Set simulated session data
        session_data['user_id'] = user['id']
        return jsonify({"message": "Login successful", "user_id": user['id']}), 200
    else:
        return jsonify({"error": "Invalid email or password"}), 401

# --- Dashboard & Stats API ---

@app.route('/api/dashboard/stats', methods=['GET'])
def get_dashboard_stats():
    user_id = g.user_id
    
    user_info = query_db("SELECT first_name FROM User WHERE id = ?", (user_id,), one=True)
    if not user_info:
        return jsonify({"error": "User not logged in"}), 401
    
    pet_count = query_db("SELECT COUNT(id) FROM Pet WHERE user_id = ?", (user_id,), one=True)[0]
    
    # Get upcoming appointments
    upcoming_appointments = query_db("SELECT COUNT(id) FROM Appointment WHERE user_id = ? AND status = 'Upcoming'", (user_id,), one=True)[0]

    # Get available adoption pets
    available_adoption = query_db("SELECT COUNT(id) FROM Adoption WHERE status = 'Available'", one=True)[0]

    return jsonify({
        "user_name": user_info['first_name'],
        "registered_pets": pet_count,
        "upcoming_appointments": upcoming_appointments,
        "available_adoption": available_adoption,
        "health_records": 24, # Hardcoded to match frontend demo
    })

# --- Pet Management (Health Dashboard) API ---

@app.route('/api/pets/all', methods=['GET'])
def get_user_pets():
    user_id = g.user_id
    pets = query_db("SELECT id, name FROM Pet WHERE user_id = ?", (user_id,))
    # In a real app, this should return full pet details including vaccinations.
    return jsonify([dict(pet) for pet in pets])

@app.route('/api/pets/add', methods=['POST'])
def add_new_pet():
    data = request.json
    user_id = g.user_id
    
    db = get_db()
    db.execute(
        "INSERT INTO Pet (user_id, name, type, breed, gender, age, weight, health_status, allergies, vet_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        (user_id, data['newPetName'], data['newPetType'], data['newPetBreed'], data['newPetGender'], 
         data['newPetAge'], data['newPetWeight'], data['newPetHealthStatus'], 
         data.get('newPetAllergies', 'None'), data.get('newPetVet', ''))
    )
    db.commit()
    return jsonify({"message": "Pet added successfully"}), 201

# --- Appointment API ---

@app.route('/api/appointments/schedule', methods=['POST'])
def schedule_appointment():
    data = request.json
    user_id = g.user_id
    
    # Simple mapping logic: finds pet ID based on pet name selected in the dropdown
    pet_name = data['petInfo'].split(' - ')[0]
    pet_record = query_db("SELECT id FROM Pet WHERE user_id = ? AND name = ?", (user_id, pet_name), one=True)
    
    if not pet_record:
        return jsonify({"error": "Selected pet not found in user records"}), 404
    
    pet_id = pet_record['id']

    db = get_db()
    db.execute(
        "INSERT INTO Appointment (user_id, pet_id, doctor_name, hospital_name, date, time, reason, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        (user_id, pet_id, data['doctorName'], data['hospitalName'], data['appointmentDate'], data['appointmentTime'], data['appointmentReason'], 'Upcoming')
    )
    db.commit()
    return jsonify({"message": "Appointment scheduled successfully"}), 201

# Add this new route to your existing app.py:

@app.route('/api/adoption/register', methods=['POST'])
def register_for_adoption():
    data = request.json
    
    # Extract data from the request body
    name = data.get('adoptionPetName')
    breed = data.get('adoptionPetBreed')
    gender = data.get('adoptionPetGender')
    age = data.get('adoptionPetAge')
    shelter = data.get('adoptionShelter') # Assuming this is the current owner/shelter name
    contact_phone = data.get('adoptionContact')

    if not all([name, breed, gender, age, shelter, contact_phone]):
        return jsonify({"error": "Missing required fields"}), 400

    try:
        db = get_db()
        db.execute(
            """
            INSERT INTO Adoption (name, breed, gender, age, status, shelter, contact_phone)
            VALUES (?, ?, ?, ?, ?, ?, ?);
            """,
            (name, breed, gender, age, 'Available', shelter, contact_phone)
        )
        db.commit()
        return jsonify({"message": f"{name} registered for adoption successfully!"}), 201
    except Exception as e:
        app.logger.error(f"Database error on adoption registration: {e}")
        return jsonify({"error": "Failed to register pet for adoption."}), 500

@app.route('/api/appointments', methods=['GET'])
def get_appointments():
    user_id = g.user_id
    
    appointments = query_db(
        "SELECT * FROM Appointment WHERE user_id = ? ORDER BY date DESC, time DESC",
        (user_id,)
    )

    # Convert SQLite rows to a list of dictionaries for JSON serialization
    appointments_list = [dict(row) for row in appointments]
    
    return jsonify(appointments_list), 200

# --- Run the App ---
if __name__ == '__main__':
    print("Starting Flask server...")
    app.run(debug=True, port=5000)