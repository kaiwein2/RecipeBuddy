import { useState, useEffect } from 'react';
import { ArrowLeft, MapPin } from 'lucide-react';
import { motion } from 'motion/react';

interface StoreMapScreenProps {
  ingredient: string;
  stores: string[];
  onBack: () => void;
}

export function StoreMapScreen({ ingredient, stores, onBack }: StoreMapScreenProps) {
  const [iframeLoading, setIframeLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [userRegion, setUserRegion] = useState<string>('');

  useEffect(() => {
    let active = true;

    const fallbackToIP = async () => {
      try {
        const res = await fetch('https://ipapi.co/json/');
        const data = await res.json();
        if (active && data.latitude && data.longitude) {
          setUserLocation([data.latitude, data.longitude]);
          setUserRegion(data.region || data.city || 'Philippines');
        }
      } catch (err) {
        console.warn("IP Geolocation blocked.");
      }
    };

    if (!navigator.geolocation) {
      fallbackToIP();
      return;
    }
    
    // Request precise physical GPS (Capacitor WebViews may silently drop this without plugins)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (active) {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        }
      },
      (err) => {
        fallbackToIP();
      },
      { enableHighAccuracy: false, timeout: 3000, maximumAge: 0 }
    );

    return () => { active = false; };
  }, []);

  // Use the principal store specified by the user's tap action
  const primaryStore = stores.length > 0 ? stores[0] : 'Supermarket';
  
  // Construct dynamic "near <lat,lng>" query to force Google to center on them natively without permissions
  const locationString = userLocation ? `near ${userLocation[0]},${userLocation[1]}` : 'near me';
  const mapsQuery = encodeURIComponent(`${primaryStore} ${locationString}`);

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col h-screen overflow-hidden">
      {/* Floating Header */}
      <div className="absolute top-0 left-0 right-0 z-[1000] p-4 pointer-events-none">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white/95 backdrop-blur-xl shadow-lg rounded-2xl p-4 flex items-center gap-4 pointer-events-auto border border-gray-100/50"
        >
          <button 
            onClick={onBack}
            className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors shrink-0"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-gray-900 truncate">
              Finding <span className="text-primary">{ingredient}</span>
            </h2>
            <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">
                {userRegion ? `Navigating near ${userRegion}` : 'Scanning Location...'}
              </span>
            </div>
          </div>
          
          {iframeLoading && (
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin shrink-0 shadow-sm" />
          )}
        </motion.div>
      </div>

      {/* Google Maps Embed Target */}
      <div className="flex-1 relative bg-gray-100 z-0">
        <iframe
          title="Google Maps Store Locator"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          allowFullScreen
          allow="geolocation"
          onLoad={() => setIframeLoading(false)}
          src={`https://maps.google.com/maps?q=${mapsQuery}&hl=en&z=13&output=embed`}
          className="w-full h-full absolute inset-0"
        />
      </div>
      
      {/* Bottom Floating App Intent (Optional) */}
      <div className="absolute bottom-6 left-0 right-0 z-[1000] px-4 pointer-events-none flex justify-center">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-blue-600 shadow-xl shadow-blue-500/30 rounded-full py-3 px-6 pointer-events-auto"
        >
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white text-sm font-bold tracking-wide text-center block w-full"
          >
            Open in Native Google Maps App
          </a>
        </motion.div>
      </div>
    </div>
  );
}
