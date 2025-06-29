import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation } from 'lucide-react';
import { useLocation } from './LocationProvider';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function DealsMap({ deals = [] }) {
  const { coordinates, city } = useLocation();
  const [mapCenter, setMapCenter] = useState([32.0853, 34.7818]); // Default to Tel Aviv

  useEffect(() => {
    if (coordinates) {
      setMapCenter([coordinates.lat, coordinates.lng]);
    }
  }, [coordinates]);

  // Israeli cities coordinates for mapping deals
  const cityCoordinates = {
    'תל אביב': [32.0853, 34.7818],
    'ירושלים': [31.7683, 35.2137],
    'חיפה': [32.7940, 34.9896],
    'ראשון לציון': [31.9730, 34.8066],
    'פתח תקווה': [32.0878, 34.8878],
    'אשדוד': [31.8044, 34.6553],
    'נתניה': [32.3215, 34.8532],
    'באר שבע': [31.2518, 34.7915],
    'חולון': [32.0117, 34.7725],
    'רמת גן': [32.0719, 34.8229]
  };

  const getMarkerPosition = (deal) => {
    if (deal.coordinates) {
      return [deal.coordinates.lat, deal.coordinates.lng];
    }
    return cityCoordinates[deal.city] || mapCenter;
  };

  const filteredDeals = deals.filter(deal => deal.city && cityCoordinates[deal.city]);

  return (
    <Card className="glass-effect border-slate-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-800" />
          מפת הטבות
          {city && (
            <Badge className="bg-blue-100 text-blue-800 border-blue-200">
              {city}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-96 w-full rounded-b-lg overflow-hidden">
          <MapContainer
            center={mapCenter}
            zoom={coordinates ? 12 : 8}
            style={{ height: '100%', width: '100%' }}
            className="rounded-b-lg"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* User location marker */}
            {coordinates && (
              <Marker position={[coordinates.lat, coordinates.lng]}>
                <Popup>
                  <div className="text-center">
                    <Navigation className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <strong>המיקום שלך</strong>
                    <br />
                    <span className="text-sm text-gray-600">{city}</span>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Deal markers */}
            {filteredDeals.map((deal) => (
              <Marker
                key={deal.id}
                position={getMarkerPosition(deal)}
              >
                <Popup maxWidth={300}>
                  <div className="p-2">
                    {deal.image_url && (
                      <img 
                        src={deal.image_url} 
                        alt={deal.title}
                        className="w-full h-24 object-cover rounded mb-2"
                      />
                    )}
                    <h3 className="font-bold text-sm mb-1">{deal.title}</h3>
                    <p className="text-xs text-gray-600 mb-2">{deal.business_name}</p>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-slate-800">₪{deal.discounted_price}</span>
                      {deal.discount_percentage && (
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          {deal.discount_percentage}% הנחה
                        </Badge>
                      )}
                    </div>
                    <Link to={createPageUrl(`Deal?id=${deal.id}`)}>
                      <Button size="sm" className="w-full professional-gradient text-white">
                        צפה בהטבה
                      </Button>
                    </Link>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </CardContent>
    </Card>
  );
}