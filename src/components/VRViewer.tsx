import React, { useEffect, useRef, useState } from 'react';

interface VRViewerProps {
  mediaUrl: string;
  mediaType: 'image' | 'video';
  isVRMode: boolean;
  onModeChange: (isVR: boolean) => void;
  className?: string;
  isRealVR?: boolean;
  roomName?: string;
  hotelName?: string;
}

const VRViewer: React.FC<VRViewerProps> = ({
  mediaUrl,
  mediaType,
  isVRMode,
  onModeChange,
  className = '',
  isRealVR = false,
  roomName,
  hotelName
}) => {
  const sceneRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [aframeLoaded, setAframeLoaded] = useState(false);
  const [processedUrl, setProcessedUrl] = useState(mediaUrl);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showInfo, setShowInfo] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Process YouTube URLs
  useEffect(() => {
    if (mediaUrl.includes('youtube.com') || mediaUrl.includes('youtu.be')) {
      let videoId = '';
      if (mediaUrl.includes('youtube.com/watch?v=')) {
        videoId = mediaUrl.split('v=')[1].split('&')[0];
      } else if (mediaUrl.includes('youtu.be/')) {
        videoId = mediaUrl.split('youtu.be/')[1].split('?')[0];
      }
      
      if (videoId) {
        if (isVRMode) {
          setProcessedUrl(`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`);
        } else {
          setProcessedUrl(`https://www.youtube.com/embed/${videoId}?autoplay=0&controls=1&rel=0`);
        }
      }
    } else {
      setProcessedUrl(mediaUrl);
    }
  }, [mediaUrl, isVRMode]);

  useEffect(() => {
    if (isVRMode && !aframeLoaded && typeof window !== 'undefined') {
      if (!window.AFRAME) {
        const script = document.createElement('script');
        script.src = 'https://aframe.io/releases/1.4.0/aframe.min.js';
        script.onload = () => {
          setAframeLoaded(true);
        };
        document.head.appendChild(script);
      } else {
        setAframeLoaded(true);
      }
    }
  }, [isVRMode, aframeLoaded]);

  useEffect(() => {
    if (isVRMode) {
      fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: 'vr_view',
          metadata: { mediaType, mediaUrl: processedUrl, isRealVR, roomName, hotelName }
        })
      }).catch(console.error);
    }
  }, [isVRMode, mediaType, processedUrl, isRealVR, roomName, hotelName]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  if (!isVRMode) {
    return (
      <div className={`relative ${className}`}>
        {mediaType === 'image' ? (
          <img 
            src={processedUrl} 
            alt="Property view" 
            className="w-full h-full object-cover rounded-lg"
            style={{ 
              imageRendering: 'high-quality',
              filter: 'contrast(1.1) saturate(1.1) brightness(1.05)'
            }}
          />
        ) : mediaUrl.includes('youtube') ? (
          <iframe
            src={processedUrl}
            className="w-full h-full rounded-lg"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className="relative">
            <video 
              ref={videoRef}
              src={processedUrl} 
              className="w-full h-full object-cover rounded-lg"
              poster=""
              style={{ 
                imageRendering: 'high-quality',
                filter: 'contrast(1.1) saturate(1.1) brightness(1.05)'
              }}
              controls
              preload="metadata"
            />
          </div>
        )}
        
        <button
          onClick={() => onModeChange(true)}
          className="absolute top-4 right-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-full flex items-center space-x-2 transition-all shadow-lg backdrop-blur-sm transform hover:scale-105"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <span className="font-medium">Enter VR Tour</span>
        </button>
      </div>
    );
  }

  if (!aframeLoaded) {
    return (
      <div className={`relative ${className} flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900`}>
        <div className="text-white text-center">
          <div className="relative mb-6">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-white border-t-transparent mx-auto"></div>
            <div className="absolute inset-0 rounded-full h-20 w-20 border-4 border-purple-400 border-t-transparent mx-auto animate-ping"></div>
          </div>
          <h3 className="text-2xl font-bold mb-2">Loading VR Experience</h3>
          <p className="text-lg opacity-75 mb-2">Preparing immersive 360° tour</p>
          {roomName && <p className="text-sm opacity-60">{roomName}</p>}
          {hotelName && <p className="text-sm opacity-60">{hotelName}</p>}
        </div>
        <button
          onClick={() => onModeChange(false)}
          className="absolute top-6 right-6 text-white hover:text-gray-300 z-50 bg-black bg-opacity-50 rounded-full p-3 transition-all hover:bg-opacity-70"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className={`relative ${className} bg-black`}>
      <a-scene 
        ref={sceneRef}
        embedded 
        style={{ height: '100%', width: '100%' }}
        background="color: #000011"
        vr-mode-ui="enabled: true"
        loading-screen="enabled: false"
        renderer="antialias: true; colorManagement: true; sortObjects: true; physicallyCorrectLights: true; highRefreshRate: true; precision: highp"
        shadow="type: pcfsoft; autoUpdate: true"
        fog="type: exponential; color: #000011; density: 0.0001"
      >
        {mediaType === 'image' ? (
          <a-sky 
            src={processedUrl} 
            rotation="0 -90 0"
            material="shader: flat; transparent: false; side: back; roughness: 0; metalness: 0"
            geometry="primitive: sphere; radius: 500; segmentsWidth: 64; segmentsHeight: 32"
          />
        ) : (
          <>
            <a-assets>
              <video 
                id={`vrVideo-${Date.now()}`} 
                src={processedUrl} 
                loop={!isRealVR} 
                crossOrigin="anonymous"
                playsInline
                muted={!isRealVR}
                autoPlay={!isRealVR}
                preload="auto"
                controls={isRealVR}
              />
            </a-assets>
            <a-videosphere 
              src={`#vrVideo-${Date.now()}`} 
              rotation="0 180 0"
              material="shader: flat; side: back; roughness: 0; metalness: 0"
              geometry="primitive: sphere; radius: 500; segmentsWidth: 64; segmentsHeight: 32"
            />
          </>
        )}
        
        {/* Enhanced Camera with professional controls */}
        <a-camera 
          look-controls="enabled: true; reverseMouseDrag: false; reverseTouchDrag: false; touchEnabled: true; mouseEnabled: true; pointerLockEnabled: false; magicWindowTrackingEnabled: true"
          wasd-controls="enabled: false"
          position="0 1.6 0"
          fov="75"
          near="0.1"
          far="1000"
          camera="active: true"
        >
          <a-cursor
            animation__click="property: scale; startEvents: click; from: 0.1 0.1 0.1; to: 1 1 1; dur: 150"
            animation__fusing="property: scale; startEvents: fusing; from: 1 1 1; to: 0.1 0.1 0.1; dur: 1500"
            geometry="primitive: ring; radiusInner: 0.015; radiusOuter: 0.025"
            material="color: #ffffff; shader: flat; opacity: 0.9"
            raycaster="objects: .clickable; far: 20; interval: 100"
            position="0 0 -1"
          />
        </a-camera>

        {/* Professional lighting setup */}
        <a-light type="ambient" color="#404040" intensity="0.4" />
        <a-light type="directional" position="2 4 2" color="#ffffff" intensity="0.6" castShadow="true" />
        <a-light type="point" position="0 3 0" color="#ffffff" intensity="0.3" />
        
        {/* Room information hotspots */}
        {showInfo && roomName && (
          <a-text
            value={roomName}
            position="0 2.5 -4"
            align="center"
            color="#ffffff"
            font="kelsonsans"
            geometry="primitive: plane; width: 6; height: 1.2"
            material="color: #000000; opacity: 0.8; transparent: true"
            animation__fadeIn="property: material.opacity; from: 0; to: 0.8; dur: 1000; delay: 500"
          />
        )}
      </a-scene>

      {/* Professional VR Controls */}
      <div className="absolute top-6 left-6 right-6 flex justify-between items-start z-50">
        <div className="bg-black bg-opacity-80 text-white px-6 py-3 rounded-xl backdrop-blur-md border border-white border-opacity-20">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-pulse"></div>
            <div>
              <div className="text-sm font-medium">
                {isRealVR ? 'Professional VR Tour' : 'Enhanced 360° Experience'}
              </div>
              {roomName && <div className="text-xs opacity-75">{roomName}</div>}
              {hotelName && <div className="text-xs opacity-60">{hotelName}</div>}
            </div>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="bg-black bg-opacity-80 hover:bg-opacity-90 text-white p-3 rounded-xl transition-all backdrop-blur-md border border-white border-opacity-20"
            title="Toggle Information"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          
          <button
            onClick={toggleFullscreen}
            className="bg-black bg-opacity-80 hover:bg-opacity-90 text-white p-3 rounded-xl transition-all backdrop-blur-md border border-white border-opacity-20"
            title="Toggle Fullscreen"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>
          
          <button
            onClick={() => onModeChange(false)}
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-3 rounded-xl flex items-center space-x-2 transition-all shadow-lg backdrop-blur-md"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span className="font-medium">Exit VR</span>
          </button>
        </div>
      </div>

      {/* Enhanced VR Instructions */}
      <div className="absolute bottom-6 left-6 right-6 bg-black bg-opacity-80 text-white px-6 py-4 rounded-xl z-50 backdrop-blur-md border border-white border-opacity-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                </svg>
              </div>
              <div>
                <div className="text-sm font-medium">Look Around</div>
                <div className="text-xs opacity-75">Drag to rotate • Scroll to zoom</div>
              </div>
            </div>
            
            {mediaType === 'video' && isRealVR && (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"/>
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-medium">Interactive Video</div>
                  <div className="text-xs opacity-75">Click controls to play/pause</div>
                </div>
              </div>
            )}
          </div>
          
          <div className="text-right">
            <div className="text-sm font-medium">Ultra High-Quality VR</div>
            <div className="text-xs opacity-75">
              {isRealVR ? 'Professional 360° Content' : 'AI Enhanced Experience'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VRViewer;