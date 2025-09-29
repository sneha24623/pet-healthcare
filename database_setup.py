import sqlite3

DATABASE_NAME = 'pets_db.sqlite'

def initialize_db():
    conn = sqlite3.connect(DATABASE_NAME)
    cursor = conn.cursor()

    # 1. User Table (for login/signup)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS User (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL, -- In a real app, this would be hashed
            phone TEXT
        );
    """)

    # 2. Pet Table (for pet profiles)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS Pet (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            type TEXT NOT NULL,
            breed TEXT,
            gender TEXT,
            age TEXT,
            weight TEXT,
            health_status TEXT,
            allergies TEXT,
            vet_name TEXT,
            FOREIGN KEY (user_id) REFERENCES User (id)
        );
    """)

    # 3. Appointment Table (for vet appointments)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS Appointment (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            pet_id INTEGER NOT NULL,
            doctor_name TEXT NOT NULL,
            hospital_name TEXT NOT NULL,
            date TEXT NOT NULL,
            time TEXT NOT NULL,
            reason TEXT NOT NULL,
            status TEXT NOT NULL, -- e.g., 'Upcoming', 'Completed'
            FOREIGN KEY (user_id) REFERENCES User (id),
            FOREIGN KEY (pet_id) REFERENCES Pet (id)
        );
    """)

    # 4. Adoption Listing Table (for adoption.html)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS Adoption (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            breed TEXT NOT NULL,
            gender TEXT,
            age TEXT,
            status TEXT, -- e.g., 'Available'
            shelter TEXT,
            contact_phone TEXT
        );
    """)

    # --- Initial Data Insertion (Demo Data) ---
    
    # 1. Demo Users
    cursor.execute("SELECT id FROM User WHERE email = 'john.smith@example.com'")
    if cursor.fetchone() is None:
        cursor.execute("""
            INSERT INTO User (first_name, last_name, email, password, phone)
            VALUES ('John', 'Smith', 'john.smith@example.com', 'password123', '555-123-4567');
        """)
    
    # Get John Smith's ID (assuming it's 1 for simplicity if fresh)
    cursor.execute("SELECT id FROM User WHERE email = 'john.smith@example.com'")
    user_id = cursor.fetchone()[0]

    # 2. Demo Pets (Buddy, Luna, Max)
    pets_data = [
        (user_id, 'Buddy', 'Dog', 'Golden Retriever', 'Male', '2 years', '28 kg', 'excellent', 'None', 'Dr. Sarah Johnson'),
        (user_id, 'Luna', 'Cat', 'Persian Cat', 'Female', '1.5 years', '4.2 kg', 'perfect', 'Chicken protein', 'Dr. Michael Chen'),
        (user_id, 'Max', 'Dog', 'Labrador Mix', 'Male', '3 years', '32 kg', 'good', 'Flea medication', 'Dr. Emily Rodriguez'),
    ]
    for pet in pets_data:
        cursor.execute("SELECT id FROM Pet WHERE user_id = ? AND name = ?", (pet[0], pet[1]))
        if cursor.fetchone() is None:
            cursor.execute("""
                INSERT INTO Pet (user_id, name, type, breed, gender, age, weight, health_status, allergies, vet_name)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
            """, pet)

    # 3. Demo Adoption Listings
    adoption_data = [
        ('Buddy', 'Golden Retriever', 'Male', '2 years', 'Available', 'Happy Paws Rescue', '+1 (555) 123-4567'),
        ('Luna', 'Persian Cat', 'Female', '1.5 years', 'Available', 'Whiskers & Tails', '+1 (555) 987-6543'),
        ('Max', 'Labrador Mix', 'Male', '3 years', 'Available', 'Bay Area Animal Rescue', '+1 (555) 456-7890'),
    ]
    for pet in adoption_data:
        cursor.execute("SELECT id FROM Adoption WHERE name = ? AND shelter = ?", (pet[0], pet[5]))
        if cursor.fetchone() is None:
            cursor.execute("""
                INSERT INTO Adoption (name, breed, gender, age, status, shelter, contact_phone)
                VALUES (?, ?, ?, ?, ?, ?, ?);
            """, pet)

    conn.commit()
    conn.close()
    print("Database initialized successfully with schema and demo data.")

if __name__ == '__main__':
    initialize_db()