import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Filter, 
  MapPin, 
  Star, 
  Calendar,
  DollarSign,
  Percent,
  X
} from "lucide-react";
import { useLocation } from '../location/LocationProvider';

const categories = [
  { id: "all", name: "כל הקטגוריות" },
  { id: "food_restaurants", name: "מסעדות ואוכל" },
  { id: "fashion_clothing", name: "אופנה ובגדים" },
  { id: "electronics", name: "אלקטרוניקה" },
  { id: "beauty_health", name: "יופי ובריאות" },
  { id: "entertainment", name: "בידור" },
  { id: "travel", name: "נסיעות" },
  { id: "home_garden", name: "בית וגינה" },
  { id: "automotive", name: "רכב" },
  { id: "services", name: "שירותים" },
  { id: "sports_fitness", name: "ספורט וכושר" }
];

const cities = [
  "תל אביב", "ירושלים", "חיפה", "ראשון לציון", "פתח תקווה", 
  "אשדוד", "נתניה", "באר שבע", "חולון", "רמת גן"
];

const sortOptions = [
  { id: "newest", name: "החדשים ביותר" },
  { id: "discount", name: "ההנחה הגבוהה ביותר" },
  { id: "rating", name: "הדירוג הגבוה ביותר" },
  { id: "ending_soon", name: "נגמרים בקרוב" },
  { id: "popular", name: "הפופולריים ביותר" },
  { id: "price_low", name: "מחיר: נמוך לגבוה" },
  { id: "price_high", name: "מחיר: גבוה לנמוך" },
  { id: "cashback", name: "הכי הרבה cashback" }
];

export default function AdvancedFilters({ 
  filters, 
  onFiltersChange, 
  onReset,
  activeFiltersCount 
}) {
  const { city, coordinates } = useLocation();

  const handleFilterChange = (key, value) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const handlePriceRangeChange = (range) => {
    onFiltersChange({ 
      ...filters, 
      minPrice: range[0], 
      maxPrice: range[1] 
    });
  };

  const removeFilter = (key) => {
    const newFilters = { ...filters };
    
    switch(key) {
      case 'category':
        newFilters.category = "all";
        break;
      case 'city':
        newFilters.city = "";
        break;
      case 'minRating':
        newFilters.minRating = null;
        break;
      case 'minDiscount':
        newFilters.minDiscount = null;
        break;
      case 'vipOnly':
        newFilters.vipOnly = false;
        break;
      case 'instantPurchase':
        newFilters.instantPurchase = false;
        break;
      case 'nearbyOnly':
        newFilters.nearbyOnly = false;
        break;
      default:
        delete newFilters[key];
    }
    
    onFiltersChange(newFilters);
  };

  return (
    <Card className="border-0 elegant-shadow glass-effect border-slate-200">
      <CardHeader className="border-b border-slate-200 pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-slate-800" />
            <span className="text-slate-900">פילטרים מתקדמים</span>
            {activeFiltersCount > 0 && (
              <Badge className="bg-slate-200 text-slate-800 border-slate-300">
                {activeFiltersCount}
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="text-slate-500 hover:text-slate-800"
          >
            איפוס
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        {/* Active Filters */}
        {activeFiltersCount > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">פילטרים פעילים:</Label>
            <div className="flex flex-wrap gap-2">
              {filters.category && filters.category !== "all" && (
                <Badge 
                  variant="secondary" 
                  className="bg-slate-100 text-slate-700 border-slate-200 pr-2"
                >
                  {categories.find(c => c.id === filters.category)?.name}
                  <X 
                    className="w-3 h-3 ml-1 cursor-pointer" 
                    onClick={() => removeFilter('category')}
                  />
                </Badge>
              )}
              {filters.city && (
                <Badge 
                  variant="secondary" 
                  className="bg-slate-100 text-slate-700 border-slate-200 pr-2"
                >
                  {filters.city}
                  <X 
                    className="w-3 h-3 ml-1 cursor-pointer" 
                    onClick={() => removeFilter('city')}
                  />
                </Badge>
              )}
              {filters.minRating && (
                <Badge 
                  variant="secondary" 
                  className="bg-slate-100 text-slate-700 border-slate-200 pr-2"
                >
                  דירוג {filters.minRating}+ ⭐
                  <X 
                    className="w-3 h-3 ml-1 cursor-pointer" 
                    onClick={() => removeFilter('minRating')}
                  />
                </Badge>
              )}
              {filters.minDiscount && (
                <Badge 
                  variant="secondary" 
                  className="bg-slate-100 text-slate-700 border-slate-200 pr-2"
                >
                  הנחה {filters.minDiscount}%+
                  <X 
                    className="w-3 h-3 ml-1 cursor-pointer" 
                    onClick={() => removeFilter('minDiscount')}
                  />
                </Badge>
              )}
              {filters.vipOnly && (
                <Badge 
                  variant="secondary" 
                  className="accent-gradient text-white pr-2"
                >
                  VIP בלבד
                  <X 
                    className="w-3 h-3 ml-1 cursor-pointer" 
                    onClick={() => removeFilter('vipOnly')}
                  />
                </Badge>
              )}
              {filters.instantPurchase && (
                <Badge 
                  variant="secondary" 
                  className="bg-slate-100 text-slate-700 border-slate-200 pr-2"
                >
                  רכישה מיידית
                  <X 
                    className="w-3 h-3 ml-1 cursor-pointer" 
                    onClick={() => removeFilter('instantPurchase')}
                  />
                </Badge>
              )}
              {filters.nearbyOnly && (
                <Badge 
                  variant="secondary" 
                  className="bg-blue-100 text-blue-800 border-blue-200 pr-2"
                >
                  רק בקרבתי ({city})
                  <X 
                    className="w-3 h-3 ml-1 cursor-pointer" 
                    onClick={() => removeFilter('nearbyOnly')}
                  />
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Location-based Filter */}
        {city && (
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              מיקום נוכחי
            </Label>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">{city}</span>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filters.nearbyOnly || false}
                    onChange={(e) => handleFilterChange('nearbyOnly', e.target.checked)}
                    className="rounded border-slate-300 text-[#1A237E] focus:ring-[#1A237E]"
                  />
                  <span className="text-sm text-slate-600">רק בקרבתי</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Category Filter */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
            <Filter className="w-4 h-4" />
            קטגוריה
          </Label>
          <Select
            value={filters.category || "all"}
            onValueChange={(value) => handleFilterChange('category', value)}
          >
            <SelectTrigger className="border-slate-300 focus:border-[#1A237E] focus:ring-[#1A237E]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Location Filter */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            עיר
          </Label>
          <Select
            value={filters.city || ""}
            onValueChange={(value) => handleFilterChange('city', value)}
          >
            <SelectTrigger className="border-slate-300 focus:border-[#1A237E] focus:ring-[#1A237E]">
              <SelectValue placeholder={city ? `נוכחי: ${city}` : "בחר עיר"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={null}>כל הערים</SelectItem>
              {city && <SelectItem value={city}>🎯 {city} (נוכחי)</SelectItem>}
              {cities.filter(c => c !== city).map((cityOption) => (
                <SelectItem key={cityOption} value={cityOption}>
                  {cityOption}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Price Range */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            טווח מחירים
          </Label>
          <div className="px-2">
            <Slider
              value={[filters.minPrice || 0, filters.maxPrice || 1000]}
              onValueChange={handlePriceRangeChange}
              max={1000}
              step={10}
              className="w-full [&>span:first-child>span]:bg-[#1A237E] [&>span:last-child]:bg-slate-200"
            />
            <div className="flex justify-between text-sm text-slate-500 mt-1">
              <span>₪{filters.minPrice || 0}</span>
              <span>₪{filters.maxPrice || 1000}</span>
            </div>
          </div>
        </div>

        {/* Minimum Rating */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
            <Star className="w-4 h-4" />
            דירוג מינימלי
          </Label>
          <Select
            value={filters.minRating?.toString() || ""}
            onValueChange={(value) => handleFilterChange('minRating', value ? parseFloat(value) : null)}
          >
            <SelectTrigger className="border-slate-300 focus:border-[#1A237E] focus:ring-[#1A237E]">
              <SelectValue placeholder="בחר דירוג מינימלי" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={null}>כל הדירוגים</SelectItem>
              <SelectItem value="4.5">4.5+ ⭐⭐⭐⭐⭐</SelectItem>
              <SelectItem value="4">4.0+ ⭐⭐⭐⭐</SelectItem>
              <SelectItem value="3.5">3.5+ ⭐⭐⭐</SelectItem>
              <SelectItem value="3">3.0+ ⭐⭐</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Discount Percentage */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
            <Percent className="w-4 h-4" />
            אחוז הנחה מינימלי
          </Label>
          <Select
            value={filters.minDiscount?.toString() || ""}
            onValueChange={(value) => handleFilterChange('minDiscount', value ? parseInt(value) : null)}
          >
            <SelectTrigger className="border-slate-300 focus:border-[#1A237E] focus:ring-[#1A237E]">
              <SelectValue placeholder="בחר הנחה מינימלית" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={null}>כל ההנחות</SelectItem>
              <SelectItem value="50">50%+ הנחה</SelectItem>
              <SelectItem value="30">30%+ הנחה</SelectItem>
              <SelectItem value="20">20%+ הנחה</SelectItem>
              <SelectItem value="10">10%+ הנחה</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sort Order */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            מיון תוצאות
          </Label>
          <Select
            value={filters.sortBy || "newest"}
            onValueChange={(value) => handleFilterChange('sortBy', value)}
          >
            <SelectTrigger className="border-slate-300 focus:border-[#1A237E] focus:ring-[#1A237E]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Premium Features */}
        <div className="pt-4 border-t border-slate-200">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border border-yellow-200">
              <span className="text-sm font-medium text-slate-700">הטבות VIP בלבד</span>
              <input
                type="checkbox"
                checked={filters.vipOnly || false}
                onChange={(e) => handleFilterChange('vipOnly', e.target.checked)}
                className="rounded border-slate-300 text-[#1A237E] focus:ring-[#1A237E]"
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg border border-slate-200">
              <span className="text-sm font-medium text-slate-700">זמין לרכישה מיידית</span>
              <input
                type="checkbox"
                checked={filters.instantPurchase || false}
                onChange={(e) => handleFilterChange('instantPurchase', e.target.checked)}
                className="rounded border-slate-300 text-[#1A237E] focus:ring-[#1A237E]"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}