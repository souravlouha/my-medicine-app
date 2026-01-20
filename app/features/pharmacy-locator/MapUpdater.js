import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

export default function MapUpdater({ center }) {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.flyTo(center, 15, {
        animate: true,
        duration: 1.5 // Smooth animation
      });
    }
  }, [center, map]);

  return null;
}