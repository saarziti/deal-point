
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, X } from 'lucide-react';
import { useLocation } from './LocationProvider';

export default function LocationPermissionBanner({ onDismiss }) {
  const { requestLocation, hasPermission, isLoading } = useLocation();

  if (hasPermission === true) return null;

  return (
    <Card className="border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50 mb-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <MapPin className="w-5 h-5 text-blue-700" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">מצא הטבות בקרבתך</h3>
              <p className="text-sm text-slate-600">
                אפשר גישה למיקום כדי לראות הטבות רלוונטיות באזור שלך
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={requestLocation}
              disabled={isLoading}
              className="bg-blue-800 hover:bg-blue-900 text-white"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  מאתר...
                </>
              ) : (
                <>
                  <MapPin className="w-4 h-4 mr-2" />
                  אפשר מיקום
                </>
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onDismiss}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
