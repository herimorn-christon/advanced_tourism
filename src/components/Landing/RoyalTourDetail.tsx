import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  MapPin, 
  Crown, 
  Camera,
  Play,
  Eye,
  ArrowLeft,
  Calendar,
  Globe,
  Star
} from 'lucide-react';
import VRViewer from '../VRViewer';

interface RoyalTour {
  id: string;
  title: string;
  description: string;
  country_name: string;
  featured_image?: string;
  places_included: Place[];
  vr_content: VRContent;
  media?: Media[];
}

interface Place {
  name: string;
  description: string;
  latitude: string;
  longitude: string;
}

interface VRContent {
  scenes: VRScene[];
}

interface VRScene {
  name: string;
  description: string;
  media_url: string;
}

interface Media {
  id: string;
  file_path: string;
  vr_file_path?: string;
  file_type: string;
  is_vr: boolean;
}

const RoyalTourDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [royalTour, setRoyalTour] = useState<RoyalTour | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<{media: Media, isVR: boolean} | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchRoyalTour(id);
    }
  }, [id]);

  const fetchRoyalTour = async (tourId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/royal-tours/${tourId}`);
      if (response.ok) {
        const data = await response.json();
        setRoyalTour(data);
      }
    } catch (error) {
      console.error('Error fetching royal tour:', error);
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

  if (!royalTour) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Royal Tour not found</h1>
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
            Back to Royal Tours
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative h-96 bg-gray-200">
        {royalTour.featured_image ? (
          <img 
            src={royalTour.featured_image} 
            alt={royalTour.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-yellow-100 to-orange-100">
            <Crown className="w-24 h-24 text-yellow-400" />
          </div>
        )}
        
        {/* VR Badge */}
        <div className="absolute top-6 right-6 bg-yellow-600 text-white px-4 py-2 rounded-full font-medium flex items-center space-x-2">
          <Crown className="w-4 h-4" />
          <span>Royal VR Experience</span>
        </div>

        {/* Media Controls */}
        {royalTour.media && royalTour.media.length > 0 && (
          <div className="absolute bottom-6 left-6 flex space-x-2">
            {royalTour.media.slice(0, 4).map((media, index) => (
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
                    className="bg-yellow-600 hover:bg-yellow-700 text-white p-3 rounded-lg transition-all"
                    title="View in VR"
                  >
                    <Camera className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-8">
              <div className="flex items-center space-x-3 mb-4">
                <Crown className="w-8 h-8 text-yellow-600" />
                <h1 className="text-3xl font-bold text-gray-900">{royalTour.title}</h1>
              </div>
              
              <div className="flex items-center space-x-6 text-gray-600 mb-6">
                <div className="flex items-center">
                  <Globe className="w-5 h-5 mr-2" />
                  <span>{royalTour.country_name}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  <span>{royalTour.places_included?.length || 0} destinations</span>
                </div>
              </div>

              <div className="prose max-w-none mb-8">
                <p className="text-gray-700 leading-relaxed">{royalTour.description}</p>
              </div>

              {/* Places Included */}
              {royalTour.places_included && royalTour.places_included.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Places Included</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {royalTour.places_included.map((place, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">{place.name}</h4>
                        <p className="text-gray-600 text-sm mb-2">{place.description}</p>
                        {place.latitude && place.longitude && (
                          <div className="text-xs text-gray-500">
                            <MapPin className="w-3 h-3 inline mr-1" />
                            {place.latitude}, {place.longitude}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* VR Scenes */}
              {royalTour.vr_content?.scenes && royalTour.vr_content.scenes.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">VR Experiences</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {royalTour.vr_content.scenes.map((scene, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">{scene.name}</h4>
                        <p className="text-gray-600 text-sm mb-3">{scene.description}</p>
                        {scene.media_url && (
                          <button
                            onClick={() => openMediaViewer({
                              id: `scene-${index}`,
                              file_path: scene.media_url,
                              vr_file_path: scene.media_url,
                              file_type: 'image/jpeg',
                              is_vr: true
                            }, true)}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm flex items-center space-x-1"
                          >
                            <Camera className="w-3 h-3" />
                            <span>View in VR</span>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Crown className="w-8 h-8 text-yellow-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Premium VR Experience</h3>
                <p className="text-gray-600 text-sm">Immersive royal heritage tour</p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Country:</span>
                  <span className="font-medium text-gray-900">{royalTour.country_name}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Destinations:</span>
                  <span className="font-medium text-gray-900">{royalTour.places_included?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">VR Scenes:</span>
                  <span className="font-medium text-gray-900">{royalTour.vr_content?.scenes?.length || 0}</span>
                </div>
              </div>

              <Link
                to="/auth"
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
              >
                <Calendar className="w-5 h-5" />
                <span>Book Experience</span>
              </Link>

              <p className="text-xs text-gray-500 text-center mt-3">
                Sign in required to book royal tour
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

export default RoyalTourDetail;