
import React, { useState, useEffect } from "react";
import { Deal, User } from "@/api/entities"; // Added User entity
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search as SearchIcon, 
  SlidersHorizontal,
  Grid3X3,
  List,
  MapPin,
  Filter,
  Star, // Added Star icon
  Eye // Added Eye icon
} from "lucide-react";
import { motion } from "framer-motion";
import DealCard from "../components/common/DealCard";
import AdvancedFilters from "../components/search/AdvancedFilters";
import PaymentModal from "../components/payment/PaymentModal";
import { useLocation } from "../components/location/LocationProvider";
import AuthPrompt from "../components/auth/AuthPrompt"; // Import AuthPrompt

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    category: "all",
    city: "",
    sortBy: "newest",
    minPrice: 0,
    maxPrice: 1000,
    minRating: null,
    minDiscount: null,
    vipOnly: false,
    instantPurchase: false,
    nearbyOnly: false // Added new filter state
  });
  const [viewMode, setViewMode] = useState("grid");
  const [deals, setDeals] = useState([]);
  const [filteredDeals, setFilteredDeals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [paymentModal, setPaymentModal] = useState({ isOpen: false, deal: null });
  const [currentUser, setCurrentUser] = useState(null); // New state for current user
  const [isGuestMode, setIsGuestMode] = useState(false); // New state for guest mode
  const [showAuthPrompt, setShowAuthPrompt] = useState(false); // New state for auth prompt

  const { city, coordinates, calculateDistance } = useLocation();

  useEffect(() => {
    loadDeals();
    checkUserStatus(); // Call checkUserStatus on mount
    
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('q')) setSearchTerm(urlParams.get('q'));
    if (urlParams.get('category')) setFilters(prev => ({ ...prev, category: urlParams.get('category') }));
    if (urlParams.get('city')) setFilters(prev => ({ ...prev, city: urlParams.get('city') }));
  }, []);

  // New function to check user status
  const checkUserStatus = async () => {
    try {
      const user = await User.me(); // Attempt to fetch current user
      setCurrentUser(user);
      setIsGuestMode(false); // If user is logged in, not in guest mode
      localStorage.removeItem("guestMode"); // Ensure guest mode flag is cleared
    } catch (error) {
      setCurrentUser(null);
      const guestMode = localStorage.getItem("guestMode"); // Check local storage for guest mode preference
      setIsGuestMode(guestMode === "true");
    }
  };

  useEffect(() => {
    filterDeals();
  }, [deals, searchTerm, filters, coordinates]); // Added coordinates to dependency array

  const loadDeals = async () => {
    setIsLoading(true);
    try {
      const allDeals = await Deal.filter({ is_active: true }, "-created_date", 100);
      setDeals(allDeals);
    } catch (error) {
      console.error("Error loading deals:", error);
    }
    setIsLoading(false);
  };

  const filterDeals = () => {
    let filtered = [...deals];

    // Search term filter
    if (searchTerm) {
      filtered = filtered.filter(deal => 
        deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deal.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deal.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (filters.category !== "all") {
      filtered = filtered.filter(deal => deal.category === filters.category);
    }

    // City filter
    if (filters.city) {
      filtered = filtered.filter(deal => deal.city === filters.city);
    }

    // Location-based filtering - New
    if (filters.nearbyOnly && coordinates) {
      filtered = filtered.filter(deal => {
        // Fallback to city check if deal doesn't have coordinates
        if (!deal.coordinates || !deal.coordinates.lat || !deal.coordinates.lng) {
          return deal.city === city; 
        }
        const distance = calculateDistance(
          coordinates.lat,
          coordinates.lng,
          deal.coordinates.lat,
          deal.coordinates.lng
        );
        return distance <= 20; // 20km radius
      });
    }

    // Price range filter
    if (filters.minPrice || filters.maxPrice) {
      filtered = filtered.filter(deal => {
        const price = deal.discounted_price || 0;
        return price >= (filters.minPrice || 0) && price <= (filters.maxPrice || 1000);
      });
    }

    // Rating filter
    if (filters.minRating) {
      filtered = filtered.filter(deal => (deal.rating || 0) >= filters.minRating);
    }

    // Discount filter
    if (filters.minDiscount) {
      filtered = filtered.filter(deal => (deal.discount_percentage || 0) >= filters.minDiscount);
    }

    // VIP filter
    if (filters.vipOnly) {
      filtered = filtered.filter(deal => deal.tags?.includes('vip'));
    }

    // Instant Purchase filter (if applicable, based on previous outlines)
    if (filters.instantPurchase) {
      // Assuming 'instant_purchase' is a boolean field on the Deal
      filtered = filtered.filter(deal => deal.instant_purchase);
    }

    // Sort deals
    switch (filters.sortBy) {
      case "discount":
        filtered.sort((a, b) => (b.discount_percentage || 0) - (a.discount_percentage || 0));
        break;
      case "rating":
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "ending_soon":
        filtered.sort((a, b) => new Date(a.expiry_date) - new Date(b.expiry_date));
        break;
      case "popular":
        filtered.sort((a, b) => (b.current_uses || 0) - (a.current_uses || 0));
        break;
      case "price_low":
        filtered.sort((a, b) => (a.discounted_price || 0) - (b.discounted_price || 0));
        break;
      case "price_high":
        filtered.sort((a, b) => (b.discounted_price || 0) - (a.discounted_price || 0));
        break;
      case "cashback":
        filtered.sort((a, b) => ((b.discounted_price || 0) * 0.02) - ((a.discounted_price || 0) * 0.02));
        break;
      default: // newest
        filtered.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    }

    setFilteredDeals(filtered);
  };

  const handleSearch = () => {
    filterDeals();
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.category !== "all") count++;
    if (filters.city) count++;
    if (filters.minPrice > 0 || filters.maxPrice < 1000) count++; // Count if price range is not default
    if (filters.minRating) count++;
    if (filters.minDiscount) count++;
    if (filters.vipOnly) count++;
    if (filters.instantPurchase) count++;
    if (filters.nearbyOnly) count++; // New filter count
    // sortBy is not typically counted as an "active filter" in the same way
    return count;
  };

  const handlePurchase = (deal) => {
    // If no current user and not in guest mode, show authentication prompt
    if (!currentUser && !isGuestMode) {
      setShowAuthPrompt(true);
      return;
    }
    
    // If in guest mode, show authentication prompt to encourage login for purchase
    if (isGuestMode) {
      setShowAuthPrompt(true);
      return;
    }
    
    // If logged in, proceed with payment
    setPaymentModal({ isOpen: true, deal });
  };

  const handlePaymentSuccess = (deal, paymentData) => {
    console.log("Payment successful for:", deal.title);
    setPaymentModal({ isOpen: false, deal: null });
  };
  
  const handleLogin = () => {
    setShowAuthPrompt(false);
    localStorage.removeItem("guestMode");
    User.login(); // Assumes User.login() handles redirection/modal for login
  };

  const handleGuestMode = () => {
    setShowAuthPrompt(false);
    localStorage.setItem("guestMode", "true"); // Set guest mode in local storage
    setIsGuestMode(true); // Update state
    window.location.reload(); // Reload the page to apply guest mode state consistently
  };

  return (
    <div className="min-h-screen elegant-gradient p-4">
      <div className="max-w-7xl mx-auto">
        
        <AuthPrompt
          isOpen={showAuthPrompt && !currentUser} // Only show if prompt is active and no user is logged in
          onClose={() => setShowAuthPrompt(false)}
          onLogin={handleLogin}
          onGuestMode={handleGuestMode}
          isGuestUser={isGuestMode}
        />

        {/* Guest Mode Banner */}
        {isGuestMode && (
          <div className="mb-6">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                    <Eye className="w-5 h-5 text-amber-700" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-amber-800">מצב אורח פעיל</h3>
                    <p className="text-sm text-amber-700">
                      התחבר כדי לרכוש קופונים ולצבור DealPoints
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => handleLogin()} // Link to the new handleLogin function
                  className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  התחבר
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800 mb-1">חיפוש מתקדם - DEAL POINT</h1>
          <p className="text-slate-600 text-sm">מצא את ההטבות המושלמות עבורך</p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-2xl elegant-shadow p-4 mb-6 glass-effect border border-slate-200">
          <div className="flex flex-col gap-3">
            <div className="flex-1 relative">
              <Input
                placeholder="חפש הטבות, עסקים או מוצרים..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="ps-10 pe-4 py-3 text-base bg-white border-slate-300 focus:border-[#1A237E] focus:ring-2 focus:ring-[#1A237E]/20 rounded-xl w-full"
              />
              <SearchIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#37474F]" />
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleSearch}
                size="lg"
                className="flex-1 px-6 py-3 bg-[#1B5E20] hover:opacity-90 text-white rounded-xl"
              >
                חפש
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-3 border-slate-300 text-slate-600 hover:bg-slate-50 rounded-xl gap-2 relative"
              >
                <SlidersHorizontal className="w-5 h-5" />
                {getActiveFiltersCount() > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-blue-800 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs border-2 border-white">
                    {getActiveFiltersCount()}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>

        {showFilters ? (
          <AdvancedFilters
            filters={filters}
            onFiltersChange={setFilters}
            onReset={() => setFilters({
              category: "all",
              city: "",
              sortBy: "newest",
              minPrice: 0,
              maxPrice: 1000,
              minRating: null,
              minDiscount: null,
              vipOnly: false,
              instantPurchase: false,
              nearbyOnly: false
            })}
            activeFiltersCount={getActiveFiltersCount()}
          />
        ) : (
          <div>
            {/* Results Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-slate-800">
                נמצאו {filteredDeals.length} הטבות
              </h2>

              <div className="flex gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                  className="rounded-lg w-9 h-9"
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                  className="rounded-lg w-9 h-9"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Results Grid */}
            {isLoading ? (
              <div className="grid grid-cols-2 gap-4">
                {Array(8).fill(0).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl p-4 animate-pulse elegant-shadow">
                    <div className="bg-slate-200 h-32 rounded-lg mb-3" />
                    <div className="bg-slate-200 h-4 rounded mb-2" />
                    <div className="bg-slate-200 h-4 rounded w-2/3" />
                  </div>
                ))}
              </div>
            ) : filteredDeals.length > 0 ? (
              <div className={`grid gap-4 ${
                viewMode === "grid" 
                  ? "grid-cols-2" 
                  : "grid-cols-1"
              }`}>
                {filteredDeals.map((deal, index) => (
                  <motion.div
                    key={deal.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <DealCard 
                      deal={deal} 
                      onPurchase={handlePurchase}
                      onSave={() => console.log("Save deal:", deal.title)}
                      onShare={() => console.log("Share deal:", deal.title)}
                    />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <div className="w-20 h-20 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-6">
                  <SearchIcon className="w-10 h-10 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">לא נמצאו הטבות</h3>
                <p className="text-slate-600 mb-8 text-sm">נסה לשנות את הפילטרים או את מילות החיפוש</p>
                <Button
                  onClick={() => {
                    setSearchTerm("");
                    setFilters({
                      category: "all",
                      city: "",
                      sortBy: "newest",
                      minPrice: 0,
                      maxPrice: 1000,
                      minRating: null,
                      minDiscount: null,
                      vipOnly: false,
                      instantPurchase: false,
                      nearbyOnly: false
                    });
                  }}
                  variant="outline"
                  className="rounded-xl border-slate-300 text-slate-600 hover:bg-slate-50"
                >
                  נקה פילטרים
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={paymentModal.isOpen}
        onClose={() => setPaymentModal({ isOpen: false, deal: null })}
        deal={paymentModal.deal}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
}
