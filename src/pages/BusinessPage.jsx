
import React, { useState, useEffect } from "react";
import { Deal } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Building2, 
  MapPin, 
  Phone, 
  Star, 
  Clock,
  Users,
  ArrowLeft,
  Mail,
  Globe
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import DealCard from "../components/common/DealCard";

export default function BusinessPage() {
  const [businessDeals, setBusinessDeals] = useState([]);
  const [businessName, setBusinessName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const name = urlParams.get('name');
    if (name) {
      setBusinessName(decodeURIComponent(name));
      loadBusinessDeals(name);
    } else {
      setIsLoading(false);
    }
  }, []);

  const loadBusinessDeals = async (name) => {
    setIsLoading(true);
    try {
      const deals = await Deal.filter({ business_name: decodeURIComponent(name) }, "-created_date");
      setBusinessDeals(deals);
    } catch (error) {
      console.error("Error loading business deals:", error);
    }
    setIsLoading(false);
  };

  const businessInfo = businessDeals.length > 0 ? businessDeals[0] : null;
  const totalRating = businessDeals.length > 0 
    ? (businessDeals.reduce((sum, deal) => sum + (deal.rating || 0), 0) / businessDeals.length).toFixed(1)
    : 0;
  const totalReviews = businessDeals.reduce((sum, deal) => sum + (deal.total_reviews || 0), 0);

  if (isLoading) {
    return (
      <div className="min-h-screen elegant-gradient p-4">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="h-48 bg-slate-200 rounded-lg"></div>
          <div className="grid grid-cols-2 gap-4">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="h-48 bg-slate-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!businessInfo) {
    return (
      <div className="min-h-screen elegant-gradient p-4 text-center py-20">
        <h2 className="text-xl font-bold text-slate-900 mb-4">העסק לא נמצא</h2>
        <Button onClick={() => navigate(createPageUrl("Homepage"))} variant="outline" className="border-slate-300 text-slate-600 hover:bg-slate-100">
          חזור ל-DEAL POINT
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen elegant-gradient p-4">
      <div className="max-w-md mx-auto">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)} 
          className="mb-4 gap-2 text-slate-600 px-0"
        >
          <ArrowLeft className="w-4 h-4" />
          חזור
        </Button>

        <Card className="glass-effect border-slate-200 mb-6">
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 premium-gradient rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              
              <div className="flex-1">
                <h1 className="text-xl font-bold text-slate-900 mb-1">{businessName}</h1>
                
                {businessInfo.business_address && (
                  <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                    <MapPin className="w-4 h-4" />
                    <span>{businessInfo.business_address}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2 text-sm">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="font-semibold text-slate-800">{totalRating}</span>
                  <span className="text-slate-500">({totalReviews} דירוגים)</span>
                </div>
              </div>
            </div>
             <div className="flex gap-2 mt-4">
                <Button variant="outline" className="flex-1 border-slate-300 text-slate-600 hover:bg-slate-100 gap-2">
                  <Phone className="w-4 h-4" />
                  התקשר
                </Button>
                <Button variant="outline" className="flex-1 border-slate-300 text-slate-600 hover:bg-slate-100 gap-2">
                  <MapPin className="w-4 h-4" />
                  נווט
                </Button>
              </div>
          </CardContent>
        </Card>

        {/* Business Deals */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">כל ההטבות מהעסק</h2>

          {businessDeals.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {businessDeals.map((deal, index) => (
                <motion.div
                  key={deal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <DealCard 
                    deal={deal}
                    onSave={() => console.log("Save deal:", deal.title)}
                    onShare={() => console.log("Share deal:", deal.title)}
                    onPurchase={() => console.log("Purchase deal:", deal.title)}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <Card className="glass-effect border-slate-200">
              <CardContent className="p-8 text-center">
                <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-base font-semibold text-slate-900 mb-1">אין הטבות זמינות</h3>
                <p className="text-slate-500 text-sm">העסק עדיין לא הוסיף הטבות</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
