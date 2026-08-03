import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useMapStore, MapLocation } from '../store/mapStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Star, Navigation, X } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import './ExploreMap.css';

// Fix Leaflet marker icons issue in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// HCMC Center roughly
const DEFAULT_CENTER: [number, number] = [10.7769, 106.7009];
const DEFAULT_ZOOM = 14;

// Component to recenter map when a location is selected
const MapUpdater: React.FC<{ selectedLocation: MapLocation | null }> = ({ selectedLocation }) => {
  const map = useMap();
  React.useEffect(() => {
    if (selectedLocation) {
      map.flyTo([selectedLocation.lat, selectedLocation.lng], 16, {
        animate: true,
        duration: 1
      });
    }
  }, [selectedLocation, map]);
  return null;
};

const ExploreMap: React.FC = () => {
  const { locations, selectedLocation, setSelectedLocation } = useMapStore();
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <div className="map-page-container">
      {/* Top Search Bar */}
      <div className="map-search-bar glass-panel">
        <Search size={20} color="var(--text-secondary)" />
        <input type="text" placeholder="Search for restaurants, cuisines..." className="search-input" />
      </div>

      {/* Map View */}
      <div className="map-wrapper">
        <MapContainer 
          center={DEFAULT_CENTER} 
          zoom={DEFAULT_ZOOM} 
          scrollWheelZoom={true} 
          className="leaflet-container-override"
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
          
          {locations.map((loc) => (
            <Marker 
              key={loc.id} 
              position={[loc.lat, loc.lng]}
              eventHandlers={{
                click: () => {
                  setSelectedLocation(loc);
                  setSheetOpen(true);
                }
              }}
            >
              <Popup className="custom-popup">
                <strong>{loc.name}</strong><br/>
                {loc.category}
              </Popup>
            </Marker>
          ))}
          
          <MapUpdater selectedLocation={selectedLocation} />
        </MapContainer>
      </div>

      {/* Map Action Buttons */}
      <div className="map-actions">
        <button className="map-fab" onClick={() => setSheetOpen(!sheetOpen)}>
          <MapPin size={24} />
        </button>
        <button className="map-fab" onClick={() => {
          setSelectedLocation(null);
          // Optional: re-center to default
        }}>
          <Navigation size={24} />
        </button>
      </div>

      {/* Bottom Sheet for Nearby / Selected Place */}
      <AnimatePresence>
        {sheetOpen && (
          <>
            <motion.div 
              className="bottom-sheet-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSheetOpen(false)}
            />
            <motion.div 
              className="bottom-sheet glass-panel"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              onDragEnd={(e, info) => {
                if (info.offset.y > 100) setSheetOpen(false);
              }}
            >
              <div className="sheet-handle"></div>
              
              {selectedLocation ? (
                <div className="selected-place-details">
                  <div className="sheet-header">
                    <h2>{selectedLocation.name}</h2>
                    <button className="close-btn" onClick={() => setSelectedLocation(null)}><X size={20} /></button>
                  </div>
                  <img src={selectedLocation.imageUrl} alt={selectedLocation.name} className="place-img-large" />
                  <div className="place-info-row">
                    <span className="tag-category">{selectedLocation.category}</span>
                    <div className="place-rating">
                      <Star size={16} fill="#FFC371" color="#FFC371" />
                      <span>{selectedLocation.rating}</span>
                    </div>
                  </div>
                  <p className="place-address"><MapPin size={16} /> {selectedLocation.address}</p>
                  <button className="primary-action-btn">Book a Table</button>
                </div>
              ) : (
                <div className="nearby-list">
                  <h3 className="list-title">Trending Nearby</h3>
                  <div className="list-items">
                    {locations.map(loc => (
                      <div key={loc.id} className="list-item" onClick={() => setSelectedLocation(loc)}>
                        <img src={loc.imageUrl} alt={loc.name} className="list-item-img" />
                        <div className="list-item-info">
                          <h4>{loc.name}</h4>
                          <p>{loc.category}</p>
                        </div>
                        <div className="list-item-rating">
                          <Star size={14} fill="#FFC371" color="#FFC371" />
                          <span>{loc.rating}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExploreMap;
