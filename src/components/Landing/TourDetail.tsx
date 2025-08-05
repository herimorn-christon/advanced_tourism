import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  MapPin, 
  Clock, 
  Users, 
  Star, 
  Calendar,
  Camera,
  Play,
  Eye,
  ArrowLeft,
  Check,
  X
} from 'lucide-react';
import VRViewer from '../VRViewer';

interface Tour {
  id: string;
  title: string;
  description: string;
  destination_name: string;
  duration_hours: number;
  max_capacity: number;
  price: number;
  includes: string[];
  excludes: string[];
  has_vr: boolean;
  difficulty_level: string;
  media?: Media[];
}

interface Media {
  id: string;
  file_path: string;
  vr_file_path?: string;
  file_type: string;
  is_vr: boolean;
}

const TourDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [tour, setTour] = useState<Tour | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<{media: Media, isVR: boolean} | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchTour(id);
    }
  }, [id]);

  const fetchTour = async (tourId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/tours/${tourId}`);
      if (response.ok) {
        const data = await response.json();
        setTour(data);
      }
    } catch (error) {
      console.error('Error fetching tour:', error);
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

  if (!tour) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Tour not found</h1>
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
            Back to Tours
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative h-96 bg-gray-200">
        {tour.media && tour.media.length > 0 ? (
          <img 
            src={tour.media[0].file_path} 
            alt={tour.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-green-100 to-blue-100">
            <Camera className="w-24 h-24 text-gray-400" />
          </div>
        )}
        
        {/* Media Controls */}
        {tour.media && tour.media.length > 0 && (
          <div className="absolute bottom-6 left-6 flex space-x-2">
            {tour.media.slice(0, 4).map((media, index) => (
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
        {tour.has_vr && (
          <div className="absolute top-6 right-6 bg-purple-600 text-white px-4 py-2 rounded-full font-medium">
            VR Experience Available
          </div>
        )}
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{tour.title}</h1>
              
              <div className="flex items-center space-x-6 text-gray-600 mb-6">
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  <span>{tour.destination_name}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  <span>{tour.duration_hours} hours</span>
                </div>
                <div className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  <span>Max {tour.max_capacity} people</span>
                </div>
              </div>

              <div className="prose max-w-none mb-8">
                <p className="text-gray-700 leading-relaxed">{tour.description}</p>
              </div>

              {/* Includes & Excludes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {tour.includes && tour.includes.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">What's Included</h3>
                    <ul className="space-y-2">
                      {tour.includes.map((item, index) => (
                        <li key={index} className="flex items-start">
                          <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {tour.excludes && tour.excludes.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">What's Not Included</h3>
                    <ul className="space-y-2">
                      {tour.excludes.map((item, index) => (
                        <li key={index} className="flex items-start">
                          <X className="w-5 h-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  ${tour.price}
                  <span className="text-lg font-normal text-gray-600"> per person</span>
                </div>
                {tour.difficulty_level && (
                  <div className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {tour.difficulty_level} Level
                  </div>
                )}
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of People
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    {Array.from({ length: tour.max_capacity }, (_, i) => i + 1).map(num => (
                      <option key={num} value={num}>{num} {num === 1 ? 'person' : 'people'}</option>
                    ))}
                  </select>
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

export default TourDetail;