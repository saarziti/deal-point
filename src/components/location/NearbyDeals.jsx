import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLocation } from './LocationProvider';
import { Deal } from '@/api/entities';
import DealCard from '../common/DealCard';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function NearbyDeals({ maxDistance = 20, limit = 6, onPurchase }) {
  const { coordinates, city, calculateDistance } = useLocation();
  const [nearbyDeals, setNearbyDeals] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (city) {
      loadNearbyDeals();
    }
  }, [city, coordinates]);

  const loadNearbyDeals = async () => {
    setIsLoading(true);
    try {
      let deals;
      
      if (city) {
        // Filter by city first
        deals = await Deal.filter({ city: city, is_active: true }, '-created_date', 50);
      } else {
        // Fallback to all active deals
        deals = await Deal.filter({ is_active: true }, '-created_date', 50);
      }

      // If we have coordinates, sort by actual distance
      if (coordinates && deals.length > 0) {
        const dealsWithDistance = deals.map(deal => {
          let distance = 0;
          if (deal.coordinates) {
            distance = calculateDistance(
              coordinates.lat, 
              coordinates.lng,
              deal.coordinates.lat, 
              deal.coordinates.lng
            );
          }
          return { ...deal, distance };
        });

        // Sort by distance and filter within maxDistance
        const filtered = dealsWithDistance
          .filter(deal => deal.distance <= maxDistance)
          .sort((a, b) => a.distance - b.distance)
          .slice(0, limit);

        setNearbyDeals(filtered);
      } else {
        // Just show deals from the same city
        setNearbyDeals(deals.slice(0, limit));
      }
    } catch (error) {
      console.error('Error loading nearby deals:', error);
    }
    setIsLoading(false);
  };

  if (!city || nearbyDeals.length === 0 && !isLoading) return null;

  return (
    <Card className="glass-effect border-slate-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Navigation className="w-5 h-5 text-blue-800" />
          <Link to={createPageUrl(`Search?nearbyOnly=true`)} className="hover:text-blue-900">
            הטבות בקרבתך
          </Link>
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            {city}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="bg-slate-100 h-48 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {nearbyDeals.map((deal, index) => (
              <motion.div
                key={deal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <DealCard 
                  deal={deal}
                  onPurchase={onPurchase}
                />
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}