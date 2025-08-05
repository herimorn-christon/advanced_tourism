import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  Star, 
  Users, 
  Calendar,
  Crown,
  Building2,
  Camera,
  Play,
  Eye,
  Filter,
  ChevronRight,
  Phone,
  Mail,
  Facebook,
  Twitter,
  Instagram
} from 'lucide-react';
import VRViewer from '../VRViewer';

interface Hotel {
  id: string;
  name: string;
  description: string;
  address: string;
  destination_name: string;
  total_rooms: number;
  vr_rooms: number;
  avg_rating: number;
  featured_image?: string;
  media?: Media[];
}

interface Tour {
  id: string;
  title: string;
  description: string;
  destination_name: string;
  duration_hours: number;
  price: number;
  has_vr: boolean;
  featured_image?: string;
  media?: Media[];
}

interface RoyalTour {
  id: string;
  title: string;
  description: string;
  country_name: string;
  featured_image?: string;
  places_included: any[];
  media?: Media[];
}

interface Media {
  id: string;
  file_path: string;
  vr_file_path?: string;
  file_type: string;
  is_vr: boolean;
}

const LandingPage: React.FC = () => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);
  const [royalTours, setRoyalTours] = useState<RoyalTour[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedMedia, setSelectedMedia] = useState<{media: Media, isVR: boolean} | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [hotelsRes, toursRes, royalToursRes] = await Promise.all([
        fetch('/api/hotels'),
        fetch('/api/tours'),
        fetch('/api/royal-tours')
      ]);

      // Handle responses with error checking
      const hotelsData = hotelsRes.ok ? await hotelsRes.json() : [];
      const toursData = toursRes.ok ? await toursRes.json() : [];
      const royalToursData = royalToursRes.ok ? await royalToursRes.json() : [];

      // Ensure arrays
      setHotels(Array.isArray(hotelsData) ? hotelsData : []);
      setTours(Array.isArray(toursData) ? toursData : []);
      setRoyalTours(Array.isArray(royalToursData) ? royalToursData : []);

    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load content. Please try again later.');
      // Set empty arrays as fallback
      setHotels([]);
      setTours([]);
      setRoyalTours([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredContent = () => {
    let content: any[] = [];
    
    if (activeFilter === 'all' || activeFilter === 'hotels') {
      content = [...content, ...hotels.map(h => ({ ...h, type: 'hotel' }))];
    }
    if (activeFilter === 'all' || activeFilter === 'tours') {
      content = [...content, ...tours.map(t => ({ ...t, type: 'tour' }))];
    }
    if (activeFilter === 'all' || activeFilter === 'royal-tours') {
      content = [...content, ...royalTours.map(r => ({ ...r, type: 'royal-tour' }))];
    }

    if (searchTerm) {
      content = content.filter(item => 
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.destination_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return content;
  };

  const openMediaViewer = (media: Media, isVR: boolean = false) => {
    setSelectedMedia({ media, isVR });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Tanzania Tourism VR...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Tanzania Tourism VR</span>
            </div>
            
            <nav className="hidden md:flex space-x-8">
              <a href="#accommodations" className="text-gray-700 hover:text-blue-600 transition-colors">Accommodations</a>
              <a href="#tours" className="text-gray-700 hover:text-blue-600 transition-colors">Tours</a>
              <a href="#royal-tours" className="text-gray-700 hover:text-blue-600 transition-colors">Royal Tours</a>
              <a href="#contact" className="text-gray-700 hover:text-blue-600 transition-colors">Contact</a>
            </nav>

            <Link
              to="/auth"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-purple-700 text-white py-20">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Experience Tanzania in <span className="text-yellow-400">Virtual Reality</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Discover the breathtaking beauty of Tanzania through immersive VR experiences. 
            From the Serengeti to Zanzibar, explore before you travel.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#search" className="bg-yellow-500 hover:bg-yellow-600 text-black px-8 py-3 rounded-lg font-semibold transition-colors">
              Start Exploring
            </a>
            <a href="#royal-tours" className="border-2 border-white hover:bg-white hover:text-blue-600 px-8 py-3 rounded-lg font-semibold transition-colors">
              Royal Tours
            </a>
          </div>
        </div>
      </section>

      {/* Search & Filter Section */}
      <section id="search" className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}
          <div className="bg-gray-50 rounded-2xl p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search destinations, hotels, tours..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex gap-2">
                {[
                  { key: 'all', label: 'All', icon: Filter },
                  { key: 'hotels', label: 'Hotels', icon: Building2 },
                  { key: 'tours', label: 'Tours', icon: Users },
                  { key: 'royal-tours', label: 'Royal Tours', icon: Crown }
                ].map(filter => (
                  <button
                    key={filter.key}
                    onClick={() => setActiveFilter(filter.key)}
                    className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                      activeFilter === filter.key
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <filter.icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{filter.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredContent().map((item) => (
              <div key={`${item.type}-${item.id}`} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                {/* Image/Media Section */}
                <div className="relative h-64 bg-gray-200">
                  {item.featured_image ? (
                    <img 
                      src={item.featured_image} 
                      alt={item.name || item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-100 to-purple-100">
                      <Camera className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                  
                  {/* VR Badge */}
                  {(item.vr_rooms > 0 || item.has_vr) && (
                    <div className="absolute top-4 right-4 bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      VR Available
                    </div>
                  )}

                  {/* Media Controls */}
                  {item.media && item.media.length > 0 && (
                    <div className="absolute bottom-4 left-4 flex space-x-2">
                      {item.media.slice(0, 3).map((media, index) => (
                        <div key={index} className="flex space-x-1">
                          <button
                            onClick={() => openMediaViewer(media, false)}
                            className="bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-lg transition-all"
                            title="View Normal"
                          >
                            {media.file_type.startsWith('video/') ? (
                              <Play className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                          {media.is_vr && (
                            <button
                              onClick={() => openMediaViewer(media, true)}
                              className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-lg transition-all"
                              title="View in VR"
                            >
                              <Camera className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Type Badge */}
                  <div className="absolute top-4 left-4">
                    {item.type === 'hotel' && (
                      <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                        <Building2 className="w-3 h-3" />
                        <span>Hotel</span>
                      </div>
                    )}
                    {item.type === 'tour' && (
                      <div className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                        <Users className="w-3 h-3" />
                        <span>Tour</span>
                      </div>
                    )}
                    {item.type === 'royal-tour' && (
                      <div className="bg-yellow-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                        <Crown className="w-3 h-3" />
                        <span>Royal Tour</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {item.name || item.title}
                  </h3>
                  
                  <div className="flex items-center text-gray-600 mb-3">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span className="text-sm">{item.destination_name || item.country_name}</span>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {item.description}
                  </p>

                  {/* Hotel specific info */}
                  {item.type === 'hotel' && (
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                      <span>{item.total_rooms} rooms</span>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 mr-1" />
                        <span>{item.avg_rating ? parseFloat(item.avg_rating).toFixed(1) : 'New'}</span>
                      </div>
                    </div>
                  )}

                  {/* Tour specific info */}
                  {item.type === 'tour' && (
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>{item.duration_hours}h</span>
                      </div>
                      <span className="font-semibold text-green-600">
                        ${item.price}
                      </span>
                    </div>
                  )}

                  {/* Royal tour specific info */}
                  {item.type === 'royal-tour' && item.places_included && (
                    <div className="text-sm text-gray-600 mb-4">
                      <span>{item.places_included.length} destinations included</span>
                    </div>
                  )}

                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2">
                    <Link 
                      to={item.type === 'hotel' ? `/hotel/${item.id}` : item.type === 'tour' ? `/tour/${item.id}` : `/royal-tour/${item.id}`}
                      className="flex items-center justify-center space-x-2 w-full"
                    >
                      <span>View Details</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredContent().length === 0 && (
            <div className="text-center py-12">
              <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </section>

      {/* Featured Sections */}
      <section id="tours" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">VR Tours & Experiences</h2>
            <p className="text-xl text-gray-600">Immersive virtual reality adventures</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {tours.slice(0, 3).map(tour => (
              <div key={tour.id} className="bg-white rounded-xl p-6 text-center shadow-lg">
                <div className="relative mb-4">
                  {tour.media && tour.media[0] ? (
                    <img 
                      src={tour.media[0].file_path} 
                      alt={tour.title}
                      className="w-full h-32 object-cover rounded-lg mb-4"
                    />
                  ) : (
                    <div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
                      <Users className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                </div>
                <h3 className="text-xl font-semibold mb-2">{tour.title}</h3>
                <p className="text-gray-600 mb-4">{tour.destination_name}</p>
                <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
                  <span>{tour.duration_hours}h duration</span>
                  {tour.has_vr && (
                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                      VR Experience
                    </span>
                  )}
                </div>
                <Link
                  to={`/tour/${tour.id}`}
                  className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  View Details
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Royal Tours Section */}
      <section id="royal-tours" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Royal Heritage Tours</h2>
            <p className="text-xl text-gray-600">Explore Tanzania's royal palaces and cultural heritage</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {royalTours.slice(0, 3).map(royalTour => (
              <div key={royalTour.id} className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 text-center border border-yellow-200">
                <div className="relative mb-4">
                  {royalTour.featured_image ? (
                    <img 
                      src={royalTour.featured_image} 
                      alt={royalTour.title}
                      className="w-full h-32 object-cover rounded-lg mb-4"
                    />
                  ) : (
                    <div className="w-full h-32 bg-yellow-200 rounded-lg flex items-center justify-center mb-4">
                      <Crown className="w-12 h-12 text-yellow-600" />
                    </div>
                  )}
                </div>
                <h3 className="text-xl font-semibold mb-2">{royalTour.title}</h3>
                <p className="text-gray-600 mb-4">{royalTour.country_name}</p>
                <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
                  <span>{royalTour.places_included?.length || 0} places</span>
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                    Royal VR
                  </span>
                </div>
                <Link
                  to={`/royal-tour/${royalTour.id}`}
                  className="mt-4 inline-block bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  View Details
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Get in Touch</h2>
            <p className="text-xl text-gray-300">Ready to experience Tanzania in VR?</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Call Us</h3>
              <p className="text-gray-300">+255 123 456 789</p>
              <p className="text-gray-300">Available 24/7</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Email Us</h3>
              <p className="text-gray-300">info@tanzania-tourism.com</p>
              <p className="text-gray-300">support@tanzania-tourism.com</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Visit Us</h3>
              <p className="text-gray-300">Dar es Salaam, Tanzania</p>
              <p className="text-gray-300">East Africa</p>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Link
              to="/auth"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors inline-flex items-center space-x-2"
            >
              <Calendar className="w-5 h-5" />
              <span>Start Your VR Journey</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Crown className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">Tanzania Tourism VR</span>
              </div>
              <p className="text-gray-400">
                Experience the beauty of Tanzania through immersive virtual reality before you travel.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#accommodations" className="hover:text-white transition-colors">Accommodations</a></li>
                <li><a href="#tours" className="hover:text-white transition-colors">Tours</a></li>
                <li><a href="#royal-tours" className="hover:text-white transition-colors">Royal Tours</a></li>
                <li><Link to="/auth" className="hover:text-white transition-colors">Sign In</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>+255 123 456 789</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>info@tanzania-tourism.com</span>
                </li>
                <li className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>Dar es Salaam, Tanzania</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Facebook className="w-6 h-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Twitter className="w-6 h-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Instagram className="w-6 h-6" />
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Tanzania Tourism VR. All rights reserved.</p>
          </div>
        </div>
      </footer>

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

export default LandingPage;