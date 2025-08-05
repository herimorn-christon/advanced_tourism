import pool from '../config/database.js';

const createTables = async () => {
  try {
    // Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        role VARCHAR(50) DEFAULT 'tourist',
        country VARCHAR(100),
        avatar_url TEXT,
        is_verified BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Countries table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS countries (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL,
        code VARCHAR(3) NOT NULL,
        currency VARCHAR(10),
        language VARCHAR(50),
        timezone VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Destinations table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS destinations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(200) NOT NULL,
        description TEXT,
        country_id UUID REFERENCES countries(id),
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        is_royal_tour BOOLEAN DEFAULT false,
        featured_image TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Hotels table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS hotels (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(200) NOT NULL,
        description TEXT,
        address TEXT NOT NULL,
        destination_id UUID REFERENCES destinations(id),
        owner_id UUID REFERENCES users(id),
        rating DECIMAL(2,1) DEFAULT 0,
        amenities JSONB,
        contact_phone VARCHAR(20),
        contact_email VARCHAR(255),
        check_in_time TIME DEFAULT '14:00',
        check_out_time TIME DEFAULT '11:00',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Rooms table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS rooms (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        hotel_id UUID REFERENCES hotels(id),
        room_number VARCHAR(20) NOT NULL,
        room_type VARCHAR(100) NOT NULL,
        description TEXT,
        capacity INTEGER NOT NULL,
        price_per_night DECIMAL(10,2) NOT NULL,
        amenities JSONB,
        has_vr BOOLEAN DEFAULT false,
        is_available BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tours table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tours (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(200) NOT NULL,
        description TEXT,
        destination_id UUID REFERENCES destinations(id),
        operator_id UUID REFERENCES users(id),
        duration_hours INTEGER,
        max_capacity INTEGER,
        price DECIMAL(10,2) NOT NULL,
        includes JSONB,
        excludes JSONB,
        has_vr BOOLEAN DEFAULT false,
        is_royal_tour BOOLEAN DEFAULT false,
        difficulty_level VARCHAR(50),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Media table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS media (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        entity_type VARCHAR(50) NOT NULL,
        entity_id UUID NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        original_name VARCHAR(255) NOT NULL,
        file_path TEXT NOT NULL,
        vr_file_path TEXT,
        file_type VARCHAR(50) NOT NULL,
        file_size BIGINT,
        is_vr BOOLEAN DEFAULT false,
        is_primary BOOLEAN DEFAULT false,
        alt_text TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Bookings table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id),
        booking_type VARCHAR(50) NOT NULL,
        room_id UUID REFERENCES rooms(id),
        tour_id UUID REFERENCES tours(id),
        check_in_date DATE,
        check_out_date DATE,
        tour_date DATE,
        guests INTEGER NOT NULL,
        total_price DECIMAL(10,2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        payment_status VARCHAR(50) DEFAULT 'pending',
        special_requests TEXT,
        booking_reference VARCHAR(50) UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Reviews table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id),
        entity_type VARCHAR(50) NOT NULL,
        entity_id UUID NOT NULL,
        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
        title VARCHAR(200),
        comment TEXT,
        is_approved BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Royal tours table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS royal_tours (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(200) NOT NULL,
        description TEXT,
        country_id UUID REFERENCES countries(id),
        featured_image TEXT,
        vr_content JSONB,
        places_included JSONB,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Analytics table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS analytics (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        event_type VARCHAR(100) NOT NULL,
        entity_type VARCHAR(50),
        entity_id UUID,
        user_id UUID REFERENCES users(id),
        metadata JSONB,
        ip_address INET,
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Insert sample countries
    await pool.query(`
      INSERT INTO countries (name, code, currency, language, timezone) VALUES
      ('Tanzania', 'TZA', 'TZS', 'Swahili', 'Africa/Dar_es_Salaam'),
      ('Kenya', 'KEN', 'KES', 'Swahili', 'Africa/Nairobi'),
      ('Uganda', 'UGA', 'UGX', 'English', 'Africa/Kampala')
      ON CONFLICT DO NOTHING;
    `);

    console.log('Database tables created successfully!');
  } catch (error) {
    console.error('Error creating database tables:', error);
  } finally {
    await pool.end();
  }
};

createTables();