import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { RootState, AppDispatch } from '../../store/store';
import { fetchHotels } from '../../store/slices/hotelSlice';
import { Eye, Edit, MapPin, Star, Camera, Plus, Building2, Users, Wifi, Car, Coffee, Phone, Mail, Save, X, Upload, Play } from 'lucide-react';

interface Hotel {
  id: string;
  name: string;
  description: string;
  address: string;
  destination_name: string;
  total_rooms: number;
  vr_rooms: number;
  avg_rating: number;
  contact_phone: string;
  contact_email: string;
  amenities: string[];
  media?: Media[];
}

interface Media {
  id: string;
  file_path: string;
  vr_file_path?: string;
  file_type: string;
  is_vr: boolean;
  is_primary: boolean;
}

const HotelManagement: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);
  const [viewingHotel, setViewingHotel] = useState<Hotel | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [filters, setFilters] = useState({
    hasVr: false,
    destination: '',
  });

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    destinationId: '',
    contactPhone: '',
    contactEmail: '',
    amenities: ['WiFi', 'Restaurant'],
    mediaUrl: '',
    mediaType: 'image'
  });

  const [destinations, setDestinations] = useState<any[]>([]);

  useEffect(() => {
    fetchHotelsData();
    fetchDestinations();
  }, [filters]);

  const fetchHotelsData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams();
      if (filters.destination) queryParams.append('destination', filters.destination);
      if (filters.hasVr) queryParams.append('hasVr', 'true');

      const response = await fetch(`/api/hotels?${queryParams.toString()}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      
      if (response.ok) {
        const data = await response.json();
        setHotels(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching hotels:', error);
      setHotels([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDestinations = async () => {
    try {
      const response = await fetch('/api/destinations');
      if (response.ok) {
        const data = await response.json();
        setDestinations(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching destinations:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = editingHotel ? `/api/hotels/${editingHotel.id}` : '/api/hotels';
      const method = editingHotel ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          address: formData.address,
          destinationId: formData.destinationId,
          contactPhone: formData.contactPhone,
          contactEmail: formData.contactEmail,
          amenities: formData.amenities
        }),
      });

      if (response.ok) {
        const hotel = await response.json();
        
        // Upload media if provided
        if (formData.mediaUrl) {
          await uploadMediaUrl(hotel.id, formData.mediaUrl, formData.mediaType);
        }
        
        fetchHotelsData();
        setShowModal(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error saving hotel:', error);
    }
  };

  const uploadMediaUrl = async (hotelId: string, mediaUrl: string, mediaType: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/media/upload-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          entityType: 'hotel',
          entityId: hotelId,
          mediaUrl,
          mediaType,
          isVRConversion: true
        }),
      });
    } catch (error) {
      console.error('Error uploading media:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      address: '',
      destinationId: '',
      contactPhone: '',
      contactEmail: '',
      amenities: ['WiFi', 'Restaurant'],
      mediaUrl: '',
      mediaType: 'image'
    });
    setEditingHotel(null);
  };

  const openEditModal = (hotel: Hotel) => {
    setEditingHotel(hotel);
    setFormData({
      name: hotel.name,
      description: hotel.description,
      address: hotel.address,
      destinationId: '', // You'd need to get this from the hotel data
      contactPhone: hotel.contact_phone,
      contactEmail: hotel.contact_email,
      amenities: hotel.amenities || ['WiFi', 'Restaurant'],
      mediaUrl: '',
      mediaType: 'image'
    });
    setShowModal(true);
  };

  const openViewModal = async (hotel: Hotel) => {
    try {
      const response = await fetch(`/api/hotels/${hotel.id}`);
      if (response.ok) {
        const detailedHotel = await response.json();
        setViewingHotel(detailedHotel);
        setShowViewModal(true);
      }
    } catch (error) {
      console.error('Error fetching hotel details:', error);
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const addAmenity = () => {
    setFormData(prev => ({
      ...prev,
      amenities: [...prev.amenities, '']
    }));
  };

  const updateAmenity = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.map((amenity, i) => i === index ? value : amenity)
    }));
  };

  const removeAmenity = (index: number) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.filter((_, i) => i !== index)
    }));
  };

  // Role-based access control
  const canManageHotels = user?.role === 'admin' || user?.role === 'hotel_owner';
  const canViewAll = user?.role === 'admin';

  if (!canManageHotels) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600">You don't have permission to manage hotels.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hotel Management</h1>
          <p className="text-gray-600">Manage your hotels and room inventory</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add Hotel</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.hasVr}
                onChange={(e) => handleFilterChange('hasVr', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">VR Enabled</span>
            </label>
          </div>
          <div>
            <input
              type="text"
              placeholder="Search destination..."
              value={filters.destination}
              onChange={(e) => handleFilterChange('destination', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Hotels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hotels.map((hotel) => (
          <div key={hotel.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-w-16 aspect-h-9 bg-gray-200">
              {hotel.media && hotel.media.length > 0 ? (
                <img 
                  src={hotel.media[0].file_path} 
                  alt={hotel.name}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-48 bg-gray-100">
                  <Camera className="w-12 h-12 text-gray-400" />
                </div>
              )}
            </div>
            
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900 truncate">{hotel.name}</h3>
                {parseInt(hotel.vr_rooms?.toString() || '0') > 0 && (
                  <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                    VR
                  </span>
                )}
              </div>
              
              <div className="flex items-center text-sm text-gray-600 mb-2">
                <MapPin className="w-4 h-4 mr-1" />
                <span className="truncate">{hotel.destination_name}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                <span>{hotel.total_rooms} rooms</span>
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-400 mr-1" />
                  <span>{hotel.avg_rating ? parseFloat(hotel.avg_rating.toString()).toFixed(1) : 'New'}</span>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => openViewModal(hotel)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-3 rounded-md text-sm transition-colors flex items-center justify-center space-x-1"
                >
                  <Eye className="w-4 h-4" />
                  <span>View</span>
                </button>
                <button
                  onClick={() => openEditModal(hotel)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white text-center py-2 px-3 rounded-md text-sm transition-colors flex items-center justify-center space-x-1"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {hotels.length === 0 && (
        <div className="text-center py-12">
          <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hotels found</h3>
          <p className="text-gray-600 mb-4">Get started by adding your first hotel property.</p>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg inline-flex items-center space-x-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Add Hotel</span>
          </button>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
            <form onSubmit={handleSubmit} className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingHotel ? 'Edit Hotel' : 'Add Hotel'}
                </h2>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hotel Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter hotel name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Destination
                  </label>
                  <select
                    value={formData.destinationId}
                    onChange={(e) => setFormData({...formData, destinationId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select destination</option>
                    {destinations.map(dest => (
                      <option key={dest.id} value={dest.id}>{dest.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter hotel description"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address *
                </label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter hotel address"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({...formData, contactPhone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+255 123 456 789"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({...formData, contactEmail: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="hotel@example.com"
                  />
                </div>
              </div>

              {/* Media Upload */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hotel Media
                </label>
                <div className="space-y-4">
                  {/* URL Input */}
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Media URL (Image/Video/YouTube)</label>
                    <input
                      type="url"
                      value={formData.mediaUrl}
                      onChange={(e) => setFormData({...formData, mediaUrl: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://example.com/image.jpg or YouTube URL"
                    />
                  </div>
                  
                  {/* File Upload */}
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Or Upload File</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition-colors">
                      <input
                        type="file"
                        accept="image/*,video/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setFormData({...formData, uploadedFile: file});
                          }
                        }}
                        className="hidden"
                        id="media-upload"
                      />
                      <label htmlFor="media-upload" className="cursor-pointer">
                        <div className="flex flex-col items-center">
                          <Upload className="w-8 h-8 text-gray-400 mb-2" />
                          <span className="text-sm text-gray-600">Click to upload or drag and drop</span>
                          <span className="text-xs text-gray-500">Images, Videos (Max 100MB)</span>
                        </div>
                      </label>
                      {formData.uploadedFile && (
                        <div className="mt-2 text-sm text-green-600">
                          Selected: {formData.uploadedFile.name}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Media Type Selection */}
                  <input
                    type="hidden"
                    value={formData.mediaType}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Media will be automatically enhanced and converted to high-quality VR format
                </p>
              </div>

              {/* Amenities */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amenities
                </label>
                {formData.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      value={amenity}
                      onChange={(e) => updateAmenity(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter amenity"
                    />
                    <button
                      type="button"
                      onClick={() => removeAmenity(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addAmenity}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  + Add Amenity
                </button>
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingHotel ? 'Update Hotel' : 'Create Hotel'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && viewingHotel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Hotel Details</h2>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">{viewingHotel.name}</h3>
                  <p className="text-gray-600 mb-4">{viewingHotel.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm">
                      <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{viewingHotel.address}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Phone className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{viewingHotel.contact_phone}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Mail className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{viewingHotel.contact_email}</span>
                    </div>
                  </div>

                  {viewingHotel.amenities && viewingHotel.amenities.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Amenities</h4>
                      <div className="flex flex-wrap gap-2">
                        {viewingHotel.amenities.map((amenity, index) => (
                          <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm">
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  {viewingHotel.media && viewingHotel.media.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Media</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {viewingHotel.media.map((media, index) => (
                          <div key={index} className="relative">
                            {media.file_type.startsWith('image/') ? (
                              <img 
                                src={media.file_path} 
                                alt="Hotel media"
                                className="w-full h-24 object-cover rounded"
                              />
                            ) : (
                              <div className="w-full h-24 bg-gray-200 rounded flex items-center justify-center">
                                <Play className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                            {media.is_vr && (
                              <span className="absolute top-1 right-1 bg-purple-600 text-white text-xs px-1 py-0.5 rounded">
                                VR
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HotelManagement;