
import React, { useState, useEffect } from "react";
import { UserCoupon, Deal, User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Gift, 
  Search, 
  Calendar, 
  Clock, 
  Star,
  ArrowLeft,
  QrCode,
  MapPin,
  Phone,
  Check, // Added icon
  XCircle, // Added icon
  RefreshCw // Added icon
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format, isBefore } from "date-fns"; // Added isBefore
import { motion } from "framer-motion";

export default function MyCouponsPage() {
  const [userCoupons, setUserCoupons] = useState([]);
  const [deals, setDeals] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    loadUserCoupons();
  }, []);

  const loadUserCoupons = async () => {
    setIsLoading(true);
    try {
      const user = await User.me();
      const coupons = await UserCoupon.filter({ user_email: user.email }, '-purchase_date');
      setUserCoupons(coupons);
      
      // Load deal details for each coupon
      const dealIds = [...new Set(coupons.map(coupon => coupon.deal_id))];
      const dealsData = {};
      
      for (const dealId of dealIds) {
        try {
          const deal = await Deal.get(dealId);
          dealsData[dealId] = deal;
        } catch (error) {
          console.error(`Error loading deal ${dealId}:`, error);
        }
      }
      
      setDeals(dealsData);
    } catch (error) {
      console.error("Error loading user coupons:", error);
      await User.login();
    }
    setIsLoading(false);
  };

  const getCouponStatus = (coupon) => {
    if (coupon.is_redeemed) {
      return { text: "נוצל", color: "bg-blue-100 text-blue-800 border-blue-200", icon: Check };
    }
    if (isBefore(new Date(coupon.expiry_date), new Date())) {
      return { text: "פג תוקף", color: "bg-gray-100 text-gray-800 border-gray-200", icon: XCircle };
    }
    return { text: "פעיל", color: "bg-green-100 text-green-800 border-green-200", icon: Star };
  };

  const filteredCoupons = userCoupons.filter(coupon => {
    const deal = deals[coupon.deal_id];
    const status = getCouponStatus(coupon).text; // Use the new status logic
    
    const matchesSearch = !searchTerm || 
      (deal?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       deal?.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       coupon.coupon_code.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Update status filtering logic to match new button texts
    const matchesStatus = filterStatus === "all" || 
      (filterStatus === 'active' && status === 'פעיל') ||
      (filterStatus === 'redeemed' && status === 'נוצל') ||
      (filterStatus === 'expired' && status === 'פג תוקף');
    
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen elegant-gradient p-4">
        <div className="max-w-md mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-slate-200 rounded w-3/4"></div>
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="h-32 bg-slate-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen elegant-gradient p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)} className="p-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">הקופונים שלי</h1>
            <p className="text-sm text-slate-600">{userCoupons.length} קופונים בסך הכל</p>
          </div>
        </div>

        {/* Search and Filter */}
        <Card className="glass-effect border-slate-200 mb-6">
          <CardContent className="p-4">
            <div className="relative mb-4">
              <Input
                placeholder="חפש קופון..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            </div>
            
            <div className="flex gap-2">
              {['all', 'active', 'redeemed', 'expired'].map((status) => (
                <Button
                  key={status}
                  variant={filterStatus === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus(status)}
                  className={`text-xs rounded-full h-8 ${
                    filterStatus === status ? 'bg-[#1A237E] text-white' : 'bg-white text-slate-700'
                  }`}
                >
                  {status === 'all' ? 'הכל' : 
                   status === 'active' ? 'פעילים' :
                   status === 'redeemed' ? 'שנוצלו' : 'פגי תוקף'}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Coupons List */}
        <div className="space-y-4">
          {filteredCoupons.length > 0 ? (
            filteredCoupons.map((coupon, index) => {
              const deal = deals[coupon.deal_id];
              if (!deal) return null;
              
              const statusInfo = getCouponStatus(coupon);
              const StatusIcon = statusInfo.icon; // Get the icon component

              return (
                <motion.div
                  key={coupon.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="glass-effect border-slate-200 hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="font-bold text-slate-900 mb-1">{deal.title}</h3>
                          <p className="text-sm text-slate-600 mb-2">{deal.business_name}</p>
                          <div className="flex items-center gap-2">
                            <QrCode className="w-4 h-4 text-slate-500" />
                            <span className="text-sm font-mono text-slate-700">{coupon.coupon_code}</span>
                          </div>
                        </div>
                        <Badge className={statusInfo.color}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusInfo.text}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-slate-50 p-3 rounded-lg">
                          <p className="text-xs text-slate-600">שילמת</p>
                          <p className="text-lg font-bold text-slate-900">₪{coupon.amount_paid}</p>
                        </div>
                        <div className="bg-purple-50 p-3 rounded-lg">
                          <p className="text-xs text-purple-600">ערך בעסק</p>
                          <p className="text-lg font-bold text-purple-700">₪{coupon.redemption_value}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm text-slate-600 mb-4">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>נרכש: {format(new Date(coupon.purchase_date), 'dd/MM/yyyy')}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>תוקף: {format(new Date(coupon.expiry_date), 'dd/MM/yyyy')}</span>
                        </div>
                      </div>

                      {statusInfo.text === 'פעיל' && ( // Use statusInfo.text here
                        <div className="flex gap-2">
                          <Button size="sm" className="flex-1 bg-[#1B5E20] text-white">
                            הצג קופון למימוש
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1">
                            <MapPin className="w-4 h-4 mr-1" />
                            נווט לעסק
                          </Button>
                        </div>
                      )}
                      {statusInfo.text === 'נוצל' && ( // New condition for redeemed coupons
                         <Button size="sm" variant="outline" className="w-full">
                           <Star className="w-4 h-4 mr-1 text-yellow-500" />
                           דרג את החוויה
                         </Button>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })
          ) : (
            <div className="text-center py-12">
              <Gift className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-900 mb-2">אין קופונים</h3>
              <p className="text-slate-600 mb-6">
                {searchTerm || filterStatus !== 'all' 
                  ? 'לא נמצאו קופונים התואמים לחיפוש'
                  : 'עדיין לא רכשת קופונים'}
              </p>
              <Link to={createPageUrl("Search")}>
                <Button className="bg-[#1B5E20] text-white">
                  עבור לחיפוש הטבות
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
