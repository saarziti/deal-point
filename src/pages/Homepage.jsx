
import React, { useState, useEffect } from "react";
import { Deal, User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Gift,
  Star,
  ArrowRight,
  Percent,
  X,
  Flame,
  Clock,
  Trophy,
  ArrowUp,
  Eye
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import DealCard from "../components/common/DealCard";
import PaymentModal from "../components/payment/PaymentModal";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import LocationPermissionBanner from "../components/location/LocationPermissionBanner";
import NearbyDeals from "../components/location/NearbyDeals";
import { useLocation } from "../components/location/LocationProvider";
import AuthPrompt from "../components/auth/AuthPrompt";

const categories = [
  { id: "food_restaurants", name: "מסעדות", emoji: "🍽️", color: "bg-green-50 text-green-800 border-green-200" },
  { id: "fashion_clothing", name: "אופנה", emoji: "👗", color: "bg-blue-50 text-blue-800 border-blue-200" },
  { id: "electronics", name: "אלקטרוניקה", emoji: "📱", color: "bg-slate-50 text-slate-800 border-slate-200" },
  { id: "beauty_health", name: "יופי", emoji: "💎", color: "bg-slate-50 text-slate-800 border-slate-200" },
  { id: "entertainment", name: "בידור", emoji: "🎭", color: "bg-indigo-50 text-indigo-800 border-indigo-200" },
  { id: "travel", name: "נסיעות", emoji: "✈️", color: "bg-slate-50 text-slate-800 border-slate-200" },
  { id: "home_garden", name: "בית", emoji: "🏛️", color: "bg-green-50 text-green-800 border-green-200" },
  { id: "automotive", name: "רכב", emoji: "🚙", color: "bg-slate-50 text-slate-800 border-slate-200" },
  { id: "services", name: "שירותים", emoji: "⚙️", color: "bg-slate-50 text-slate-800 border-slate-200" },
  { id: "sports_fitness", name: "ספורט", emoji: "🏆", color: "bg-green-50 text-green-800 border-green-200" }
];

const filterTabs = [
  { id: "all", name: "הכל", icon: Star, color: "bg-slate-100 text-slate-800 border-slate-200" },
  { id: "best_sellers", name: "הנמכרים ביותר", icon: Trophy, color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  { id: "most_popular", name: "פופולרי", icon: Flame, color: "bg-slate-100 text-slate-800 border-slate-200" },
  { id: "highest_discounts", name: "הנחות גבוהות", icon: Percent, color: "bg-green-100 text-green-800 border-green-200" },
  { id: "ending_soon", name: "נגמרים בקרוב", icon: Clock, color: "bg-slate-100 text-slate-800 border-slate-200" }
];

export default function Homepage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [deals, setDeals] = useState([]);
  const [filteredDeals, setFilteredDeals] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [dealOfTheDay, setDealOfTheDay] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentModal, setPaymentModal] = useState({ isOpen: false, deal: null });
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  const { city, hasPermission } = useLocation();
  const [showLocationBanner, setShowLocationBanner] = useState(false);

  useEffect(() => {
    loadData();
    checkUserStatus(); 
    if (hasPermission === false || hasPermission === null) {
      setShowLocationBanner(true);
    } else {
      setShowLocationBanner(false);
    }

    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasPermission]);

  const checkUserStatus = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);
      setIsGuestMode(false);
    } catch (error) {
      setCurrentUser(null);
      const guestMode = localStorage.getItem("guestMode");
      setIsGuestMode(guestMode === "true");
      if (!guestMode) {
        setShowAuthPrompt(true);
      }
    }
  };

  useEffect(() => {
    filterDeals();
  }, [deals, activeFilter]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const allDeals = await Deal.list("-created_date", 50);
      setDeals(allDeals);

      if (allDeals.length > 0) {
        const randomIndex = Math.floor(Math.random() * allDeals.length);
        setDealOfTheDay(allDeals[randomIndex]);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setIsLoading(false);
  };

  const filterDeals = () => {
    let filtered = [...deals];
    switch (activeFilter) {
      case "best_sellers":
        filtered = filtered.filter(deal => deal.current_uses > 10).sort((a, b) => (b.current_uses || 0) - (a.current_uses || 0));
        break;
      case "most_popular":
        filtered = filtered.filter(deal => deal.current_uses > 5).sort((a, b) => (b.current_uses || 0) - (a.current_uses || 0));
        break;
      case "highest_discounts":
        filtered = filtered.filter(deal => (deal.discount_percentage || 0) > 20).sort((a, b) => (b.discount_percentage || 0) - (a.discount_percentage || 0));
        break;
      case "ending_soon":
        filtered = filtered.filter(deal => {
          if (!deal.expiry_date) return false;
          const daysLeft = Math.ceil((new Date(deal.expiry_date) - new Date()) / (1000 * 60 * 60 * 24));
          return daysLeft <= 7 && daysLeft > 0;
        }).sort((a, b) => new Date(a.expiry_date) - new Date(b.expiry_date));
        break;
      default:
        break;
    }
    setFilteredDeals(filtered.slice(0, 12));
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      window.location.href = createPageUrl(`Search?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  const handlePurchase = (deal) => {
    if (!currentUser && !isGuestMode) {
      setShowAuthPrompt(true);
      return;
    }
    
    if (isGuestMode) {
      setShowAuthPrompt(true);
      return;
    }
    
    setPaymentModal({ isOpen: true, deal });
  };

  const handleLogin = () => {
    setShowAuthPrompt(false);
    localStorage.removeItem("guestMode");
    User.login();
  };

  const handleGuestMode = () => {
    setShowAuthPrompt(false);
    localStorage.setItem("guestMode", "true");
    setIsGuestMode(true);
    window.location.reload();
  };

  const handlePaymentSuccess = () => {
    setPaymentModal({ isOpen: false, deal: null });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen elegant-gradient">
      {/* Header is removed */}

      <div className="p-4">
        <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 premium-gradient rounded-xl flex items-center justify-center luxury-shadow">
              <Star className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-slate-900 text-xl tracking-wide">DEAL POINT</span>
        </div>
        
        <AuthPrompt
          isOpen={showAuthPrompt && !currentUser}
          onClose={() => setShowAuthPrompt(false)}
          onLogin={handleLogin}
          onGuestMode={handleGuestMode}
          isGuestUser={isGuestMode}
        />
        
        {isGuestMode && (
          <div className="my-4">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                    <Eye className="w-5 h-5 text-amber-700" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-amber-800">אתה גולש כאורח</h3>
                    <p className="text-sm text-amber-700">
                      התחבר כדי לרכוש קופונים ולצבור DealPoints
                    </p>
                  </div>
                </div>
                <button 
                  onClick={handleLogin}
                  className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  התחבר עכשיו
                </button>
              </div>
            </div>
          </div>
        )}

        {showLocationBanner && (
          <div className="mt-4">
            <LocationPermissionBanner onDismiss={() => setShowLocationBanner(false)} />
          </div>
        )}

        {/* Categories Section */}
        <div className="bg-white/90 backdrop-blur-md -mx-4 px-4 py-3 border-y border-slate-200/80 mb-4">
          <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category) => (
              <Link key={category.id} to={createPageUrl(`Search?category=${category.id}`)}>
                <div className="flex-shrink-0 flex flex-col items-center justify-center gap-1.5 w-16">
                  <div className="w-12 h-12 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-xl hover:bg-slate-50 transition-colors luxury-shadow">
                    {category.emoji}
                  </div>
                  <div className="text-xs font-medium text-slate-800 text-center leading-tight">{category.name}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-4 space-y-6">
          {dealOfTheDay && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="text-center mb-3">
                <div className="inline-flex items-center gap-2 professional-gradient text-white px-3 py-1.5 rounded-xl font-bold text-xs luxury-shadow">
                  <Gift className="w-3.5 h-3.5" />
                  הדיל הבלעדי של היום
                </div>
              </div>
              <DealCard
                deal={dealOfTheDay}
                onPurchase={handlePurchase}
              />
            </motion.section>
          )}

          {city && <NearbyDeals onPurchase={handlePurchase} />}

          {filteredDeals.length > 0 && (
            <motion.section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-slate-900">
                  {filterTabs.find(tab => tab.id === activeFilter)?.name || "הטבות"}
                </h2>
                <Link to={createPageUrl(`Search?sort=${activeFilter}`)}>
                  <Button variant="outline" size="sm" className="gap-1.5 border-slate-300 text-slate-700 hover:bg-slate-50 text-xs h-8 rounded-xl">
                    הכל
                    <ArrowRight className="w-3 h-3" />
                  </Button>
                </Link>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-4">
                {filterTabs.map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <Button
                      key={tab.id}
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveFilter(tab.id)}
                      className={`flex-shrink-0 gap-2 rounded-full transition-all duration-300 text-xs h-9 ${
                        activeFilter === tab.id 
                          ? 'bg-[#1A237E] text-white luxury-shadow border-none' 
                          : `${tab.color} border hover:shadow-sm`
                      }`}
                    >
                      <IconComponent className="w-3 h-3" />
                      <span className="whitespace-nowrap">{tab.name}</span>
                    </Button>
                  );
                })}
              </div>

              <div className="grid grid-cols-2 gap-3">
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
                    />
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showScrollTop && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="fixed bottom-24 right-4 z-50"
          >
            <Button
              onClick={scrollToTop}
              className="w-12 h-12 rounded-full bg-[#1A237E] hover:opacity-90 text-white luxury-shadow"
            >
              <ArrowUp className="w-5 h-5" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <PaymentModal
        isOpen={paymentModal.isOpen}
        onClose={() => setPaymentModal({ isOpen: false, deal: null })}
        deal={paymentModal.deal}
        onPaymentSuccess={handlePaymentSuccess}
      />

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
