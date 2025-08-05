import pool from '../config/database.js';

const addSampleData = async () => {
  try {
    console.log('Adding comprehensive sample data...');

    // Sample users with different roles
    const users = [
      {
        email: 'admin@tourism.com',
        password: '$2a$12$LQv3c1yqBw2LeOI.UH/mLO8Jq9Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8', // password123
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        phone: '+255123456789',
        country: 'Tanzania'
      },
      {
        email: 'hotel@tourism.com',
        password: '$2a$12$LQv3c1yqBw2LeOI.UH/mLO8Jq9Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8', // password123
        firstName: 'Hotel',
        lastName: 'Owner',
        role: 'hotel_owner',
        phone: '+255987654321',
        country: 'Tanzania'
      },
      {
        email: 'tour@tourism.com',
        password: '$2a$12$LQv3c1yqBw2LeOI.UH/mLO8Jq9Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8', // password123
        firstName: 'Tour',
        lastName: 'Operator',
        role: 'tour_operator',
        phone: '+255555666777',
        country: 'Tanzania'
      },
      {
        email: 'tourist@tourism.com',
        password: '$2a$12$LQv3c1yqBw2LeOI.UH/mLO8Jq9Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8', // password123
        firstName: 'John',
        lastName: 'Tourist',
        role: 'tourist',
        phone: '+255111222333',
        country: 'USA'
      }
    ];

    let userCount = 0;
    for (const user of users) {
      try {
        await pool.query(
          `INSERT INTO users (email, password, first_name, last_name, role, phone, country, is_verified) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, true)`,
          [user.email, user.password, user.firstName, user.lastName, user.role, user.phone, user.country]
        );
        userCount++;
      } catch (error) {
        if (error.code === '23505') {
          console.log(`User ${user.email} already exists, skipping...`);
        } else {
          console.error(`Error adding user ${user.email}:`, error.message);
        }
      }
    }
    console.log(`Users processed: ${userCount}`);

    // Get country IDs
    const tanzaniaResult = await pool.query("SELECT id FROM countries WHERE name = 'Tanzania'");
    const tanzaniaId = tanzaniaResult.rows[0]?.id;

    // Sample destinations
    const destinations = [
      {
        name: 'Serengeti National Park',
        description: 'World-famous safari destination with the Great Migration',
        countryId: tanzaniaId,
        latitude: -2.3333,
        longitude: 34.8333
      },
      {
        name: 'Zanzibar',
        description: 'Tropical paradise with pristine beaches and rich culture',
        countryId: tanzaniaId,
        latitude: -6.1659,
        longitude: 39.2026
      },
      {
        name: 'Mount Kilimanjaro',
        description: 'Africa\'s highest peak and iconic climbing destination',
        countryId: tanzaniaId,
        latitude: -3.0674,
        longitude: 37.3556
      },
      {
        name: 'Ngorongoro Crater',
        description: 'UNESCO World Heritage site with incredible wildlife',
        countryId: tanzaniaId,
        latitude: -3.2000,
        longitude: 35.5000
      },
      {
        name: 'Dar es Salaam',
        description: 'Tanzania\'s largest city and economic hub',
        countryId: tanzaniaId,
        latitude: -6.7924,
        longitude: 39.2083
      }
    ];

    let destCount = 0;
    const destIds = [];
    for (const dest of destinations) {
      try {
        const result = await pool.query(
          `INSERT INTO destinations (name, description, country_id, latitude, longitude) 
           VALUES ($1, $2, $3, $4, $5) RETURNING id`,
          [dest.name, dest.description, dest.countryId, dest.latitude, dest.longitude]
        );
        destIds.push(result.rows[0].id);
        destCount++;
      } catch (error) {
        if (error.code === '23505') {
          const existing = await pool.query('SELECT id FROM destinations WHERE name = $1', [dest.name]);
          if (existing.rows.length > 0) {
            destIds.push(existing.rows[0].id);
          }
        } else {
          console.error(`Error adding destination ${dest.name}:`, error.message);
        }
      }
    }
    console.log(`Destinations processed: ${destCount}`);

    // Get hotel owner ID
    const hotelOwnerResult = await pool.query("SELECT id FROM users WHERE email = 'hotel@tourism.com'");
    const hotelOwnerId = hotelOwnerResult.rows[0]?.id;

    // Sample hotels with comprehensive data
    const hotels = [
      {
        name: 'Serengeti Safari Lodge',
        description: 'Luxury safari lodge with panoramic views of the Serengeti plains. Experience wildlife like never before with our VR-enhanced rooms.',
        address: 'Serengeti National Park, Tanzania',
        destinationId: destIds[0],
        ownerId: hotelOwnerId,
        amenities: ['WiFi', 'Restaurant', 'Bar', 'Pool', 'Spa', 'Game Drives', 'VR Experiences'],
        contactPhone: '+255123456789',
        contactEmail: 'info@serengetisafari.com'
      },
      {
        name: 'Zanzibar Beach Resort',
        description: 'Beachfront paradise with crystal clear waters and white sand beaches. Our VR rooms offer immersive ocean experiences.',
        address: 'Stone Town, Zanzibar, Tanzania',
        destinationId: destIds[1],
        ownerId: hotelOwnerId,
        amenities: ['WiFi', 'Restaurant', 'Beach Access', 'Water Sports', 'Spa', 'VR Ocean Tours'],
        contactPhone: '+255987654321',
        contactEmail: 'info@zanzibarresort.com'
      },
      {
        name: 'Kilimanjaro View Hotel',
        description: 'Mountain lodge with spectacular views of Mount Kilimanjaro. VR climbing experiences available in select rooms.',
        address: 'Moshi, Kilimanjaro Region, Tanzania',
        destinationId: destIds[2],
        ownerId: hotelOwnerId,
        amenities: ['WiFi', 'Restaurant', 'Mountain Views', 'Hiking Tours', 'VR Climbing'],
        contactPhone: '+255555666777',
        contactEmail: 'info@kilimanjaroview.com'
      }
    ];

    let hotelCount = 0;
    const hotelIds = [];
    for (const hotel of hotels) {
      try {
        const result = await pool.query(
          `INSERT INTO hotels (name, description, address, destination_id, owner_id, amenities, contact_phone, contact_email) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
          [hotel.name, hotel.description, hotel.address, hotel.destinationId, hotel.ownerId, 
           JSON.stringify(hotel.amenities), hotel.contactPhone, hotel.contactEmail]
        );
        hotelIds.push(result.rows[0].id);
        hotelCount++;
      } catch (error) {
        if (error.code === '23505') {
          const existing = await pool.query('SELECT id FROM hotels WHERE name = $1', [hotel.name]);
          if (existing.rows.length > 0) {
            hotelIds.push(existing.rows[0].id);
          }
        } else {
          console.error(`Error adding hotel ${hotel.name}:`, error.message);
        }
      }
    }
    console.log(`Hotels processed: ${hotelCount}`);

    // Add hotel media
    const hotelMediaData = [
      // Serengeti Safari Lodge
      [
        { url: 'https://images.pexels.com/photos/1320684/pexels-photo-1320684.jpeg?auto=compress&cs=tinysrgb&w=1600', type: 'image/jpeg', isPrimary: true },
        { url: 'https://images.pexels.com/photos/2356045/pexels-photo-2356045.jpeg?auto=compress&cs=tinysrgb&w=1600', type: 'image/jpeg', isPrimary: false },
        { url: 'https://images.pexels.com/photos/1320686/pexels-photo-1320686.jpeg?auto=compress&cs=tinysrgb&w=1600', type: 'image/jpeg', isPrimary: false },
        { url: 'https://images.pexels.com/photos/2356059/pexels-photo-2356059.jpeg?auto=compress&cs=tinysrgb&w=1600', type: 'image/jpeg', isPrimary: false }
      ],
      // Zanzibar Beach Resort
      [
        { url: 'https://images.pexels.com/photos/1320687/pexels-photo-1320687.jpeg?auto=compress&cs=tinysrgb&w=1600', type: 'image/jpeg', isPrimary: true },
        { url: 'https://images.pexels.com/photos/2356061/pexels-photo-2356061.jpeg?auto=compress&cs=tinysrgb&w=1600', type: 'image/jpeg', isPrimary: false },
        { url: 'https://images.pexels.com/photos/1320688/pexels-photo-1320688.jpeg?auto=compress&cs=tinysrgb&w=1600', type: 'image/jpeg', isPrimary: false },
        { url: 'https://images.pexels.com/photos/2356063/pexels-photo-2356063.jpeg?auto=compress&cs=tinysrgb&w=1600', type: 'image/jpeg', isPrimary: false }
      ],
      // Kilimanjaro View Hotel
      [
        { url: 'https://images.pexels.com/photos/1320689/pexels-photo-1320689.jpeg?auto=compress&cs=tinysrgb&w=1600', type: 'image/jpeg', isPrimary: true },
        { url: 'https://images.pexels.com/photos/2356065/pexels-photo-2356065.jpeg?auto=compress&cs=tinysrgb&w=1600', type: 'image/jpeg', isPrimary: false },
        { url: 'https://images.pexels.com/photos/1320690/pexels-photo-1320690.jpeg?auto=compress&cs=tinysrgb&w=1600', type: 'image/jpeg', isPrimary: false },
        { url: 'https://images.pexels.com/photos/2356067/pexels-photo-2356067.jpeg?auto=compress&cs=tinysrgb&w=1600', type: 'image/jpeg', isPrimary: false }
      ]
    ];

    // Add hotel media
    for (let i = 0; i < hotelIds.length; i++) {
      const hotelId = hotelIds[i];
      const mediaList = hotelMediaData[i];
      
      for (const media of mediaList) {
        try {
          await pool.query(
            `INSERT INTO media (entity_type, entity_id, file_name, original_name, file_path, vr_file_path, file_type, is_vr, is_primary) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            ['hotel', hotelId, `hotel-${hotelId}-${Date.now()}`, 'hotel-image', media.url, media.url, media.type, true, media.isPrimary]
          );
        } catch (error) {
          if (error.code !== '23505') {
            console.error(`Error adding hotel media:`, error.message);
          }
        }
      }
    }

    // Sample rooms for each hotel
    const roomsData = [
      // Serengeti Safari Lodge rooms
      [
        { number: '101', type: 'Safari Suite', description: 'Luxury suite with panoramic savanna views and VR wildlife experiences', capacity: 2, price: 450, hasVr: true },
        { number: '102', type: 'Wildlife View Room', description: 'Comfortable room with direct wildlife viewing and VR safari tours', capacity: 2, price: 350, hasVr: true },
        { number: '103', type: 'Standard Safari Room', description: 'Cozy room with basic amenities and VR nature experiences', capacity: 2, price: 250, hasVr: false }
      ],
      // Zanzibar Beach Resort rooms
      [
        { number: '201', type: 'Ocean Villa', description: 'Beachfront villa with private beach access and VR diving experiences', capacity: 4, price: 600, hasVr: true },
        { number: '202', type: 'Beach Suite', description: 'Elegant suite with ocean views and VR underwater tours', capacity: 2, price: 400, hasVr: true },
        { number: '203', type: 'Garden Room', description: 'Peaceful room with garden views and VR cultural experiences', capacity: 2, price: 300, hasVr: false }
      ],
      // Kilimanjaro View Hotel rooms
      [
        { number: '301', type: 'Mountain Suite', description: 'Premium suite with Kilimanjaro views and VR climbing experiences', capacity: 2, price: 500, hasVr: true },
        { number: '302', type: 'Alpine Room', description: 'Mountain-themed room with VR hiking adventures', capacity: 2, price: 380, hasVr: true },
        { number: '303', type: 'Standard Mountain Room', description: 'Comfortable room with mountain views', capacity: 2, price: 280, hasVr: false }
      ]
    ];

    const roomIds = [];
    for (let i = 0; i < hotelIds.length; i++) {
      const hotelId = hotelIds[i];
      const rooms = roomsData[i];
      
      for (const room of rooms) {
        try {
          const result = await pool.query(
            `INSERT INTO rooms (hotel_id, room_number, room_type, description, capacity, price_per_night, has_vr, amenities) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
            [hotelId, room.number, room.type, room.description, room.capacity, room.price, room.hasVr, JSON.stringify(['WiFi', 'AC', 'TV'])]
          );
          roomIds.push(result.rows[0].id);
        } catch (error) {
          if (error.code !== '23505') {
            console.error(`Error adding room ${room.number}:`, error.message);
          }
        }
      }
    }

    // Add room media
    const roomMediaUrls = [
      'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=1600',
      'https://images.pexels.com/photos/271618/pexels-photo-271618.jpeg?auto=compress&cs=tinysrgb&w=1600',
      'https://images.pexels.com/photos/271619/pexels-photo-271619.jpeg?auto=compress&cs=tinysrgb&w=1600',
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      'https://www.youtube.com/watch?v=ScMzIvxBSi4'
    ];

    for (const roomId of roomIds) {
      for (let j = 0; j < roomMediaUrls.length; j++) {
        const mediaUrl = roomMediaUrls[j];
        const isVideo = mediaUrl.includes('youtube.com');
        const fileType = isVideo ? 'video/mp4' : 'image/jpeg';
        
        try {
          await pool.query(
            `INSERT INTO media (entity_type, entity_id, file_name, original_name, file_path, vr_file_path, file_type, is_vr, is_primary) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            ['room', roomId, `room-${roomId}-${j}`, `room-media-${j}`, mediaUrl, mediaUrl, fileType, true, j === 0]
          );
        } catch (error) {
          if (error.code !== '23505') {
            console.error(`Error adding room media:`, error.message);
          }
        }
      }
    }

    // Get tour operator ID
    const tourOperatorResult = await pool.query("SELECT id FROM users WHERE email = 'tour@tourism.com'");
    const tourOperatorId = tourOperatorResult.rows[0]?.id;

    // Sample tours
    const tours = [
      {
        title: 'Great Migration Safari',
        description: 'Witness the spectacular wildebeest migration in the Serengeti with VR-enhanced wildlife viewing',
        destinationId: destIds[0],
        operatorId: tourOperatorId,
        durationHours: 8,
        maxCapacity: 12,
        price: 299,
        includes: ['Transportation', 'Professional Guide', 'Lunch', 'VR Wildlife Experience'],
        excludes: ['Accommodation', 'Personal Items'],
        hasVr: true,
        difficultyLevel: 'Easy'
      },
      {
        title: 'Zanzibar Spice Tour',
        description: 'Explore the aromatic spice plantations of Zanzibar with immersive VR cultural experiences',
        destinationId: destIds[1],
        operatorId: tourOperatorId,
        durationHours: 6,
        maxCapacity: 15,
        price: 89,
        includes: ['Transportation', 'Guide', 'Spice Tasting', 'VR Cultural Tour'],
        excludes: ['Meals', 'Tips'],
        hasVr: true,
        difficultyLevel: 'Easy'
      },
      {
        title: 'Kilimanjaro Base Camp Trek',
        description: 'Day trek to Kilimanjaro base camp with VR summit experience for those who want to see the top',
        destinationId: destIds[2],
        operatorId: tourOperatorId,
        durationHours: 10,
        maxCapacity: 8,
        price: 199,
        includes: ['Guide', 'Equipment', 'Lunch', 'VR Summit Experience'],
        excludes: ['Transportation', 'Accommodation'],
        hasVr: true,
        difficultyLevel: 'Moderate'
      }
    ];

    let tourCount = 0;
    for (const tour of tours) {
      try {
        await pool.query(
          `INSERT INTO tours (title, description, destination_id, operator_id, duration_hours, max_capacity, price, includes, excludes, has_vr, difficulty_level) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [tour.title, tour.description, tour.destinationId, tour.operatorId, tour.durationHours, 
           tour.maxCapacity, tour.price, JSON.stringify(tour.includes), JSON.stringify(tour.excludes), 
           tour.hasVr, tour.difficultyLevel]
        );
        tourCount++;
      } catch (error) {
        if (error.code !== '23505') {
          console.error(`Error adding tour ${tour.title}:`, error.message);
        }
      }
    }
    console.log(`Tours processed: ${tourCount}`);

    // Sample royal tours
    const royalTours = [
      {
        title: 'Royal Palaces of Tanzania VR Experience',
        description: 'Immersive virtual reality tour of Tanzania\'s historic royal palaces and cultural heritage sites',
        countryId: tanzaniaId,
        featuredImage: 'https://images.pexels.com/photos/1320691/pexels-photo-1320691.jpeg?auto=compress&cs=tinysrgb&w=1600',
        placesIncluded: [
          {
            name: 'Sultan\'s Palace Museum',
            description: 'Historic palace showcasing Zanzibar\'s royal heritage',
            latitude: '-6.1659',
            longitude: '39.2026'
          },
          {
            name: 'Kilwa Kisiwani Ruins',
            description: 'Ancient Swahili trading city with royal connections',
            latitude: '-8.9667',
            longitude: '39.5167'
          }
        ]
      },
      {
        title: 'Cultural Heritage VR Journey',
        description: 'Virtual reality exploration of Tanzania\'s rich cultural heritage and traditional royal sites',
        countryId: tanzaniaId,
        featuredImage: 'https://images.pexels.com/photos/1320692/pexels-photo-1320692.jpeg?auto=compress&cs=tinysrgb&w=1600',
        placesIncluded: [
          {
            name: 'Olduvai Gorge',
            description: 'Cradle of mankind with archaeological significance',
            latitude: '-2.9833',
            longitude: '35.3500'
          },
          {
            name: 'Rock Art Sites',
            description: 'Ancient rock paintings depicting royal ceremonies',
            latitude: '-3.3667',
            longitude: '35.7500'
          }
        ]
      }
    ];

    let royalTourCount = 0;
    for (const royalTour of royalTours) {
      try {
        await pool.query(
          `INSERT INTO royal_tours (title, description, country_id, featured_image, places_included) 
           VALUES ($1, $2, $3, $4, $5)`,
          [royalTour.title, royalTour.description, royalTour.countryId, 
           royalTour.featuredImage, JSON.stringify(royalTour.placesIncluded)]
        );
        royalTourCount++;
      } catch (error) {
        if (error.code !== '23505') {
          console.error(`Error adding royal tour ${royalTour.title}:`, error.message);
        }
      }
    }
    console.log(`Royal tours processed: ${royalTourCount}`);

    console.log('✅ Sample data added successfully!');
    console.log('\n🔑 Login Credentials:');
    console.log('Admin: admin@tourism.com / password123');
    console.log('Hotel Owner: hotel@tourism.com / password123');
    console.log('Tour Operator: tour@tourism.com / password123');
    console.log('Tourist: tourist@tourism.com / password123');

  } catch (error) {
    console.error('❌ Error adding sample data:', error);
  } finally {
    await pool.end();
  }
};

addSampleData();