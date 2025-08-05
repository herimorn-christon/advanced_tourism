import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { 
  Crown, 
  Search, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  MapPin, 
  Camera,
  Globe,
  Image,
  XCircle,
  Save
} from 'lucide-react';

interface RoyalTour {
  id: string;
  title: string;
  description: string;
  country_id: string;
  country_name: string;
  featured_image?: string;
  vr_content: any;
  places_included: any[];
  is_active: boolean;
  created_at: string;
}

interface Country {
  id: string;
  name: string;
  code: string;
}

const RoyalToursManagement: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [royalTours, setRoyalTours] = useState<RoyalTour[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [filteredTours, setFilteredTours] = useState<RoyalTour[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTour, setEditingTour] = useState<RoyalTour | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [tourToDelete, setTourToDelete] = useState<RoyalTour | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    country_id: '',
    featured_image: '',
    places_included: [{ name: '', description: '', latitude: '', longitude: '' }],
    vr_content: { scenes: [{ name: '', description: '', media_url: '' }] }
  });

  useEffect(() => {
    fetchRoyalTours();
    fetchCountries();
  }, []);

  useEffect(() => {
    filterTours();
  }, [royalTours, searchTerm]);

  const fetchRoyalTours = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/royal-tours');
      if (response.ok) {
        const data = await response.json();
        setRoyalTours(data);
      }
    } catch (error) {
      console.error('Error fetching royal tours:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCountries = async () => {
    try {
      const response = await fetch('/api/countries');
      if (response.ok) {
        const data = await response.json();
        setCountries(data);
      }
    } catch (error) {
      console.error('Error fetching countries:', error);
    }
  };

  const filterTours = () => {
    let filtered = royalTours;

    if (searchTerm) {
      filtered = filtered.filter(tour =>
        tour.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tour.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tour.country_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredTours(filtered);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = editingTour ? `/api/royal-tours/${editingTour.id}` : '/api/royal-tours';
      const method = editingTour ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          countryId: formData.country_id,
          featuredImage: formData.featured_image,
          placesIncluded: formData.places_included,
          vrContent: formData.vr_content
        }),
      });

      if (response.ok) {
        fetchRoyalTours();
        setShowModal(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error saving royal tour:', error);
    }
  };

  const deleteTour = async (tourId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/royal-tours/${tourId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchRoyalTours();
        setShowDeleteConfirm(false);
        setTourToDelete(null);
      }
    } catch (error) {
      console.error('Error deleting royal tour:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      country_id: '',
      featured_image: '',
      places_included: [{ name: '', description: '', latitude: '', longitude: '' }],
      vr_content: { scenes: [{ name: '', description: '', media_url: '' }] }
    });
    setEditingTour(null);
  };

  const openEditModal = (tour: RoyalTour) => {
    setEditingTour(tour);
    setFormData({
      title: tour.title,
      description: tour.description,
      country_id: tour.country_id,
      featured_image: tour.featured_image || '',
      places_included: tour.places_included.length > 0 ? tour.places_included : [{ name: '', description: '', latitude: '', longitude: '' }],
      vr_content: tour.vr_content || { scenes: [{ name: '', description: '', media_url: '' }] }
    });
    setShowModal(true);
  };

  const addPlace = () => {
    setFormData({
      ...formData,
      places_included: [...formData.places_included, { name: '', description: '', latitude: '', longitude: '' }]
    });
  };

  const removePlace = (index: number) => {
    const newPlaces = formData.places_included.filter((_, i) => i !== index);
    setFormData({ ...formData, places_included: newPlaces });
  };

  const updatePlace = (index: number, field: string, value: string) => {
    const newPlaces = [...formData.places_included];
    newPlaces[index] = { ...newPlaces[index], [field]: value };
    setFormData({ ...formData, places_included: newPlaces });
  };

  const addVRScene = () => {
    setFormData({
      ...formData,
      vr_content: {
        ...formData.vr_content,
        scenes: [...formData.vr_content.scenes, { name: '', description: '', media_url: '' }]
      }
    });
  };

  const removeVRScene = (index: number) => {
    const newScenes = formData.vr_content.scenes.filter((_: any, i: number) => i !== index);
    setFormData({
      ...formData,
      vr_content: { ...formData.vr_content, scenes: newScenes }
    });
  };

  const updateVRScene = (index: number, field: string, value: string) => {
    const newScenes = [...formData.vr_content.scenes];
    newScenes[index] = { ...newScenes[index], [field]: value };
    setFormData({
      ...formData,
      vr_content: { ...formData.vr_content, scenes: newScenes }
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

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
          <h1 className="text-2xl font-bold text-gray-900">Royal Tours Management</h1>
          <p className="text-gray-600">Manage premium VR tourism experiences</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add Royal Tour</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-yellow-100">
              <Crown className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-gray-900">{royalTours.length}</h3>
              <p className="text-sm text-gray-600">Total Royal Tours</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-100">
              <Globe className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-gray-900">
                {royalTours.filter(t => t.is_active).length}
              </h3>
              <p className="text-sm text-gray-600">Active Tours</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-100">
              <Camera className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-gray-900">
                {royalTours.reduce((acc, tour) => acc + (tour.vr_content?.scenes?.length || 0), 0)}
              </h3>
              <p className="text-sm text-gray-600">VR Scenes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search royal tours..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Royal Tours Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTours.map((tour) => (
          <div key={tour.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-w-16 aspect-h-9 bg-gray-200">
              {tour.featured_image ? (
                <img 
                  src={tour.featured_image} 
                  alt={tour.title}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-48 bg-gradient-to-br from-yellow-100 to-orange-100">
                  <Crown className="w-16 h-16 text-yellow-400" />
                </div>
              )}
            </div>
            
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900 truncate">{tour.title}</h3>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  tour.is_active 
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {tour.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              <div className="flex items-center text-sm text-gray-600 mb-2">
                <MapPin className="w-4 h-4 mr-1" />
                <span className="truncate">{tour.country_name}</span>
              </div>
              
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {tour.description}
              </p>

              <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                <span>{tour.places_included?.length || 0} places</span>
                <span>{tour.vr_content?.scenes?.length || 0} VR scenes</span>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => openEditModal(tour)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-3 rounded-md text-sm transition-colors flex items-center justify-center space-x-1"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => {
                    setTourToDelete(tour);
                    setShowDeleteConfirm(true);
                  }}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white text-center py-2 px-3 rounded-md text-sm transition-colors flex items-center justify-center space-x-1"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTours.length === 0 && (
        <div className="text-center py-12">
          <Crown className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No royal tours found</h3>
          <p className="text-gray-600 mb-4">Create your first premium VR tourism experience.</p>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg inline-flex items-center space-x-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Add Royal Tour</span>
          </button>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
            <form onSubmit={handleSubmit} className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingTour ? 'Edit Royal Tour' : 'Add Royal Tour'}
                </h2>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter tour title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter tour description"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country *
                    </label>
                    <select
                      required
                      value={formData.country_id}
                      onChange={(e) => setFormData({...formData, country_id: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select a country</option>
                      {countries.map(country => (
                        <option key={country.id} value={country.id}>{country.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Featured Media
                    </label>
                    <div className="space-y-3">
                      {/* URL Input */}
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Media URL (Image/Video/YouTube)</label>
                        <input
                          type="url"
                          value={formData.featured_image}
                          onChange={(e) => setFormData({...formData, featured_image: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="https://example.com/image.jpg or YouTube URL"
                        />
                      </div>
                      
                      {/* File Upload */}
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Or Upload File</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center hover:border-blue-500 transition-colors">
                          <input
                            type="file"
                            accept="image/*,video/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                // Create object URL for preview
                                const url = URL.createObjectURL(file);
                                setFormData({...formData, featured_image: url, uploadedFile: file});
                              }
                            }}
                            className="hidden"
                            id="royal-media-upload"
                          />
                          <label htmlFor="royal-media-upload" className="cursor-pointer">
                            <div className="flex flex-col items-center">
                              <Camera className="w-6 h-6 text-gray-400 mb-1" />
                              <span className="text-xs text-gray-600">Upload Image/Video</span>
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Supports images, videos, and YouTube URLs. Auto-converted to VR format.
                    </p>
                  </div>
                </div>

                {/* Places & VR Content */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Places Included</h3>
                  
                  {formData.places_included.map((place, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Place {index + 1}</span>
                        {formData.places_included.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removePlace(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="Place name"
                          value={place.name}
                          onChange={(e) => updatePlace(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                        <textarea
                          placeholder="Place description"
                          rows={2}
                          value={place.description}
                          onChange={(e) => updatePlace(index, 'description', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="number"
                            step="any"
                            placeholder="Latitude"
                            value={place.latitude}
                            onChange={(e) => updatePlace(index, 'latitude', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          />
                          <input
                            type="number"
                            step="any"
                            placeholder="Longitude"
                            value={place.longitude}
                            onChange={(e) => updatePlace(index, 'longitude', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <button
                    type="button"
                    onClick={addPlace}
                    className="w-full py-2 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
                  >
                    <Plus className="w-4 h-4 inline mr-2" />
                    Add Place
                  </button>
                </div>
              </div>

              {/* VR Scenes */}
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">VR Scenes</h3>
                
                {formData.vr_content.scenes.map((scene: any, index: number) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">VR Scene {index + 1}</span>
                      {formData.vr_content.scenes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeVRScene(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <input
                        type="text"
                        placeholder="Scene name"
                        value={scene.name}
                        onChange={(e) => updateVRScene(index, 'name', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Scene description"
                        value={scene.description}
                        onChange={(e) => updateVRScene(index, 'description', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                      <input
                        type="url"
                        placeholder="Media URL"
                        value={scene.media_url}
                        onChange={(e) => updateVRScene(index, 'media_url', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={addVRScene}
                  className="w-full py-2 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-purple-500 hover:text-purple-600 transition-colors"
                >
                  <Camera className="w-4 h-4 inline mr-2" />
                  Add VR Scene
                </button>
              </div>

              {/* Submit Buttons */}
              <div className="flex space-x-3 pt-6 border-t border-gray-200 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingTour ? 'Update Tour' : 'Create Tour'}</span>
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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && tourToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Delete Royal Tour</h2>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <p className="text-gray-600 mb-6">
                Are you sure you want to delete <strong>{tourToDelete.title}</strong>? 
                This action cannot be undone.
              </p>

              <div className="flex space-x-3">
                <button
                  onClick={() => deleteTour(tourToDelete.id)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Delete Tour
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoyalToursManagement;