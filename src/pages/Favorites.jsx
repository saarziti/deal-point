import React, { useState, useEffect } from "react";
import { SavedDeal, Deal, User } from "@/api/entities";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import DealCard from "../components/common/DealCard";

export default function FavoritesPage() {
  const [savedDeals, setSavedDeals] = useState([]);
  const [deals, setDeals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadSavedDeals();
  }, []);

  const loadSavedDeals = async () => {
    setIsLoading(true);
    try {
      const user = await User.me();
      const saved = await SavedDeal.filter({ user_email: user.email });
      setSavedDeals(saved);

      if (saved.length > 0) {
        const dealIds = saved.map(s => s.deal_id);
        const dealData = await Deal.filter({ id: { $in: dealIds } });
        setDeals(dealData);
      }
    } catch (error) {
      console.error("Error loading saved deals:", error);
      await User.login();
    }
    setIsLoading(false);
  };

  const handleUnsave = async (dealId) => {
    try {
      const user = await User.me();
      const savedDeal = savedDeals.find(s => s.deal_id === dealId && s.user_email === user.email);
      if (savedDeal) {
        await SavedDeal.delete(savedDeal.id);
        // Refresh list
        loadSavedDeals();
      }
    } catch (error) {
      console.error("Error unsaving deal:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen elegant-gradient p-4">
        <div className="animate-pulse space-y-4 max-w-md mx-auto">
          <div className="h-8 bg-slate-200 rounded w-1/2"></div>
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="h-48 bg-slate-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen elegant-gradient p-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)} className="p-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">המועדפים שלי</h1>
            <p className="text-sm text-slate-600">{deals.length} הטבות שמורות</p>
          </div>
        </div>

        {deals.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {deals.map(deal => (
              <div key={deal.id} className="relative group">
                <DealCard deal={deal} />
                <Button 
                  size="icon" 
                  variant="destructive"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleUnsave(deal.id)}
                >
                  <Heart className="w-4 h-4 fill-current" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Heart className="w-16 h-16 text-slate-300 mx-auto mb-6" />
            <h2 className="text-xl font-bold text-slate-800 mb-2">אין הטבות שמורות</h2>
            <p className="text-slate-600 mb-8">הוסף הטבות למועדפים כדי לראות אותן כאן</p>
            <Link to={createPageUrl("Search")}>
              <Button className="bg-[#1B5E20] text-white">חפש הטבות</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}