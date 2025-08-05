import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  MapPin, 
  Star, 
  Users, 
  Wifi,
  Car,
  Coffee,
  Camera,
  Play,
  Eye,
  ArrowLeft,
  Calendar,
  Phone,
  Mail
} from 'lucide-react';
import VRViewer from '../VRViewer';

interface Hotel {
  id: string;
  name: string;
  description: string;
  address: string;
  destination_name: string;
  contact_phone: string;
  contact_email: string;
  amenities: string[];
  rooms?: Room[];
  media?: Media[];
  reviews?: Review[];
}

interface Room {
  id: string;
  room_number: string;
  room_type: string;
  description: string;
  capacity: number;
  price_per_night: number;
  has_vr: boolean;
  amenities: string[];
}

interface Media {
  id: string;
  file_path: string;
  vr_file_path?: string;
  file_type: string;
  is_vr: boolean;
}

interface Review {
  id: string;
  rating: number;
  title: string;
  comment: string;
  first_name: string;
  last_name: string;
  created_at: string;
}

const HotelDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<{media: Media, isVR: boolean} | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchHotel(id);
    }
  }, [id]);

  const fetchHotel = async (hotelId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/hotels/${hotelId}`);
      if (response.ok) {
        const data = await response.json();
        setHotel(data);
      }
    } catch (error) {
      console.error('Error fetching hotel:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const openMediaViewer = (media: Media, isVR: boolean = false) => {
    setSelectedMedia({ media, isVR });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Hotel not found</h1>
          <Link to="/" className="text-blue-600 hover:text-blue-700">
            Return to homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link 
            to="/" 
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Hotels
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative h-96 bg-gray-200">
        {hotel.media && hotel.media.length > 0 ? (
          <img 
            src={hotel.media[0].file_path} 
            alt={hotel.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-100 to-purple-100">
            <Camera className="w-24 h-24 text-gray-400" />
          </div>
        )}
        
        {/* Media Controls */}
        {hotel.media && hotel.media.length > 0 && (
          <div className="absolute bottom-6 left-6 flex space-x-2">
            {hotel.media.slice(0, 4).map((media, index) => (
              <div key={index} className="flex space-x-1">
                <button
                  onClick={() => openMediaViewer(media, false)}
                  className="bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-3 rounded-lg transition-all"
                  title="View Normal"
                >
                  {media.file_type.startsWith('video/') ? (
                    <Play className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
                {media.is_vr && (
                  <button
                    onClick={() => openMediaViewer(media, true)}
                    className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-lg transition-all"
                    title="View in VR"
                  >
                    <Camera className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* VR Badge */}
        {hotel.rooms && hotel.rooms.some(room => room.has_vr) && (
          <div className="absolute top-6 right-6 bg-purple-600 text-white px-4 py-2 rounded-full font-medium">
            VR Room Tours Available
          </div>
        )}
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{hotel.name}</h1>
              
              <div className="flex items-center space-x-6 text-gray-600 mb-6">
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  <span>{hotel.destination_name}</span>
                </div>
                <div className="flex items-center">
                  <Star className="w-5 h-5 mr-2 text-yellow-400" />
                  <span>4.8 (124 reviews)</span>
                </div>
              </div>

              <div className="prose max-w-none mb-8">
                <p className="text-gray-700 leading-relaxed">{hotel.description}</p>
              </div>

              {/* Amenities */}
              {hotel.amenities && hotel.amenities.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Amenities</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {hotel.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                        <span className="text-gray-700">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Rooms */}
              {hotel.rooms && hotel.rooms.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Rooms</h3>
                  <div className="space-y-4">
                    {hotel.rooms.map((room) => (
                      <div key={room.id} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h4 className="text-lg font-medium text-gray-900">{room.room_type}</h4>
                            <p className="text-sm text-gray-600">Room {room.room_number}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-gray-900">
                              ${room.price_per_night}
                              <span className="text-sm font-normal text-gray-600"> /night</span>
                            </div>
                            {room.has_vr && (
                              <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full mt-1">
                                VR Tour Available
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-gray-600 mb-4">{room.description}</p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm text-gray-600">
                            <Users className="w-4 h-4 mr-1" />
                            <span>Up to {room.capacity} guests</span>
                          </div>
                          <Link
                            to="/auth"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                          >
                            Book Now
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Hotel Media Gallery */}
          {hotel.media && hotel.media.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Hotel Gallery</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {hotel.media.map((media, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-lg overflow-hidden">
                      {media.file_type.startsWith('image/') ? (
                        <img 
                          src={media.file_path} 
                          alt={`Hotel media ${index + 1}`}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                          <Play className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                    </div>
                    
                    {/* Media Controls */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 rounded-lg flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex space-x-2">
                        <button
                          onClick={() => openMediaViewer(media, false)}
                          className="bg-white text-gray-900 p-2 rounded-full hover:bg-gray-100 transition-colors"
                          title="View Normal"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {media.is_vr && (
                          <button
                            onClick={() => openMediaViewer(media, true)}
                            className="bg-purple-600 text-white p-2 rounded-full hover:bg-purple-700 transition-colors"
                            title="View in VR"
                          >
                            <Camera className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {/* VR Badge */}
                    {media.is_vr && (
                      <div className="absolute top-2 right-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
                        VR
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center">
                  <Phone className="w-4 h-4 text-gray-400 mr-3" />
                  <span className="text-gray-700">{hotel.contact_phone}</span>
                </div>
                <div className="flex items-center">
                  <Mail className="w-4 h-4 text-gray-400 mr-3" />
                  <span className="text-gray-700">{hotel.contact_email}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 text-gray-400 mr-3" />
                  <span className="text-gray-700">{hotel.address}</span>
                </div>
              </div>

              <Link
                to="/auth"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
              >
                <Calendar className="w-5 h-5" />
                <span>Book Now</span>
              </Link>

              <p className="text-xs text-gray-500 text-center mt-3">
                Sign in required to complete booking
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Media Viewer Modal */}
      {selectedMedia && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="relative w-full h-full max-w-6xl max-h-4xl">
            <button
              onClick={() => setSelectedMedia(null)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <VRViewer
              mediaUrl={selectedMedia.isVR && selectedMedia.media.vr_file_path 
                ? selectedMedia.media.vr_file_path 
                : selectedMedia.media.file_path}
              mediaType={selectedMedia.media.file_type.startsWith('video/') ? 'video' : 'image'}
              isVRMode={selectedMedia.isVR}
              onModeChange={(isVR) => setSelectedMedia({...selectedMedia, isVR})}
              className="w-full h-full"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default HotelDetail;