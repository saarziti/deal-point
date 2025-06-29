
import React, { useState, useEffect } from "react";
import { Deal, User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Clock,
  Star,
  Heart,
  Share2,
  Zap,
  Percent,
  Users,
  Calendar,
  ArrowLeft,
  Copy,
  MessageSquare,
  Phone,
  ShoppingCart,
  AlertCircle,
  CheckCircle,
  Navigation,
  TrendingUp, // New import
  Gift // New import
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";
import { motion } from "framer-motion";
import PaymentModal from "../components/payment/PaymentModal";

export default function DealPage() {
  const [deal, setDeal] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentModal, setPaymentModal] = useState({ isOpen: false, deal: null });
  const [isSaved, setIsSaved] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const dealId = urlParams.get('id');
    if (dealId) {
      loadDeal(dealId);
    } else {
      setIsLoading(false);
    }
  }, []);

  const loadDeal = async (id) => {
    setIsLoading(true);
    try {
      const fetchedDeal = await Deal.get(id);
      setDeal(fetchedDeal);
    } catch (error) {
      console.error("Error loading deal:", error);
    }
    setIsLoading(false);
  };

  const handlePurchase = (deal) => {
    setPaymentModal({ isOpen: true, deal });
  };

  const handlePaymentSuccess = () => {
    setPaymentModal({ isOpen: false, deal: null });
  };

  const handleNavigate = () => {
    if (deal?.business_address) {
      const address = encodeURIComponent(deal.business_address);
      window.open(`https://www.google.com/maps/search/?api=1&query=${address}`, '_blank');
    }
  };

  const handleShare = async () => {
    let shareText;
    if (deal.coupon_type === 'value_coupon') {
      shareText = `🎁 קופון שווה מבית ${deal.business_name}!\nשלם ₪${deal.coupon_price} וקבל שווי של ₪${deal.redemption_value}!\n${deal.title}`;
    } else {
      shareText = `🎯 הטבה מדהימה ב-${deal.business_name}!\n${deal.title}\n💰 ${deal.discount_percentage}% הנחה\nמחיר: ₪${deal.discounted_price}`;
    }
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: deal.title,
          text: shareText,
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback to WhatsApp
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText + '\n' + window.location.href)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  const toggleSave = () => {
    setIsSaved(!isSaved);
    // Here you would typically save to backend
  };

  if (isLoading) {
    return (
      <div className="p-4 min-h-screen elegant-gradient">
        <div className="animate-pulse max-w-md mx-auto">
          <div className="h-8 bg-slate-200 rounded w-3/4 mb-4"></div>
          <div className="h-48 bg-slate-200 rounded-lg mb-6"></div>
          <div className="h-6 bg-slate-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-slate-200 rounded"></div>
            <div className="h-4 bg-slate-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="min-h-screen elegant-gradient p-4">
        <div className="text-center py-16 max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">ההטבה לא נמצאה</h2>
          <Button onClick={() => navigate(createPageUrl("Homepage"))} className="bg-[#1B5E20] hover:opacity-90 text-white">
            חזור ל-DEAL POINT
          </Button>
        </div>
      </div>
    );
  }

  const daysUntilExpiry = deal.expiry_date ?
    Math.ceil((new Date(deal.expiry_date) - new Date()) / (1000 * 60 * 60 * 24)) : null;
  
  const remainingUses = deal.max_uses ? deal.max_uses - (deal.current_uses || 0) : null;
  
  // Determine coupon type and pricing
  const isValueCoupon = deal.coupon_type === 'value_coupon';
  const displayPrice = isValueCoupon ? deal.coupon_price : deal.discounted_price;
  const valuePercentage = isValueCoupon && deal.coupon_price && deal.redemption_value
    ? Math.round(((deal.redemption_value - deal.coupon_price) / deal.coupon_price) * 100)
    : null;

  return (
    <div className="min-h-screen elegant-gradient p-4">
      <div className="max-w-md mx-auto">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 gap-2 text-slate-600 px-0">
          <ArrowLeft className="w-4 h-4" />
          חזור
        </Button>

        {/* Value Badge for Value Coupons or Discount Badge for Regular Deals */}
        {isValueCoupon ? (
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-center mb-4"
          >
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-800 text-white px-6 py-3 rounded-2xl font-bold text-xl luxury-shadow">
              <TrendingUp className="w-6 h-6" />
              +{valuePercentage}% ערך מוסף
            </div>
            <p className="text-sm text-slate-600 mt-2 font-medium">שלם פחות, קבל יותר!</p>
          </motion.div>
        ) : deal.discount_percentage && (
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-center mb-4"
          >
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] text-white px-6 py-3 rounded-2xl font-bold text-xl luxury-shadow">
              <Percent className="w-6 h-6" />
              {deal.discount_percentage}% הנחה
            </div>
          </motion.div>
        )}

        <Card className="overflow-hidden elegant-shadow border-0 glass-effect border-slate-200 mb-4">
          {deal.image_url && (
            <div className="relative">
              <img src={deal.image_url} alt={deal.title} className="w-full h-48 object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 right-4 text-white">
                <h1 className="text-2xl font-bold">{deal.title}</h1>
                <p className="text-base opacity-90">{deal.business_name}</p>
              </div>
              
              {/* Urgency Badge */}
              {daysUntilExpiry !== null && daysUntilExpiry <= 3 && (
                <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {daysUntilExpiry <= 1 ? 'נגמר היום!' : `${daysUntilExpiry} ימים נותרו`}
                </div>
              )}
              
              {/* Coupon Type Badge */}
              {isValueCoupon && (
                <div className="absolute top-4 left-4 bg-gradient-to-r from-purple-600 to-purple-800 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                  <Gift className="w-4 h-4" />
                  קופון ערך מוסף
                </div>
              )}
            </div>
          )}
          
          <CardContent className="p-4">
            <div className="space-y-6">
              {/* Business Info Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold text-slate-900">{deal.title}</h1>
                  <Link 
                    to={createPageUrl(`BusinessPage?name=${encodeURIComponent(deal.business_name || '')}`)}
                    className="text-slate-600 hover:text-[#1A237E] font-medium"
                  >
                    {deal.business_name}
                  </Link>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={toggleSave}
                    className={`rounded-xl ${isSaved ? 'bg-red-50 text-red-600 border-red-200' : 'border-slate-300 text-slate-600'}`}
                  >
                    <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={handleShare}
                    className="rounded-xl border-slate-300 text-slate-600"
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Enhanced Price Section for Value Coupons */}
              {isValueCoupon ? (
                <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-xl border-2 border-purple-200 shadow-sm">
                  <div className="text-center space-y-4">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <Gift className="w-6 h-6 text-purple-700" />
                      <h3 className="text-lg font-bold text-purple-900">קופון ערך מוסף</h3>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white p-4 rounded-lg border border-purple-200">
                        <p className="text-sm text-slate-600 mb-1">מחיר הקופון</p>
                        <p className="text-2xl font-bold text-slate-900">₪{deal.coupon_price || 0}</p>
                        <p className="text-xs text-slate-500">מה שאתה משלם</p>
                      </div>
                      
                      <div className="bg-purple-600 text-white p-4 rounded-lg">
                        <p className="text-sm opacity-90 mb-1">ערך בעסק</p>
                        <p className="text-2xl font-bold">₪{deal.redemption_value || 0}</p>
                        <p className="text-xs opacity-80">מה שאתה מקבל</p>
                      </div>
                    </div>
                    
                    <div className="bg-green-100 p-3 rounded-lg border border-green-200">
                      <div className="flex items-center justify-center gap-2">
                        <TrendingUp className="w-5 h-5 text-green-700" />
                        <span className="font-bold text-green-800">
                          חיסכון של ₪{(deal.redemption_value || 0) - (deal.coupon_price || 0)} (+{valuePercentage}%)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // Regular discount pricing
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-600">מחיר לאחר הנחה:</span>
                    <div className="flex items-center gap-2">
                      {deal.original_price && (
                        <span className="text-sm text-slate-400 line-through">₪{deal.original_price}</span>
                      )}
                      <span className="text-2xl font-bold text-[#1B5E20]">₪{deal.discounted_price || 0}</span>
                    </div>
                  </div>
                  <div className="text-xs text-slate-500">
                    חיסכון: ₪{(deal.original_price - deal.discounted_price) || 0}
                  </div>
                </div>
              )}

              {/* Purchase Button */}
              <Button 
                size="lg" 
                className="w-full bg-[#1B5E20] hover:opacity-90 text-white gap-2 py-4 text-lg font-bold luxury-shadow"
                onClick={() => handlePurchase(deal)}
              >
                <ShoppingCart className="w-5 h-5" />
                {isValueCoupon 
                  ? `קנה קופון - ₪${deal.coupon_price || 0}` 
                  : `רכוש את הקופון - ₪${deal.discounted_price || 0}`
                }
              </Button>

              {/* Deal Description */}
              {deal.description && (
                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">תיאור ההטבה</h3>
                  <p className="text-slate-700 leading-relaxed text-sm bg-slate-50 p-3 rounded-lg">{deal.description}</p>
                </div>
              )}

              {/* Expiry and Usage Info */}
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl">
                <h3 className="text-base font-bold text-amber-800 mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  פרטי תוקף
                </h3>
                <div className="space-y-2 text-sm">
                  {deal.expiry_date && (
                    <div className="flex items-center justify-between text-amber-700">
                      <span>בתוקף עד:</span>
                      <span className="font-semibold">
                        {format(new Date(deal.expiry_date), 'dd/MM/yyyy')}
                      </span>
                    </div>
                  )}
                  {remainingUses && (
                    <div className="flex items-center justify-between text-amber-700">
                      <span>נותרו:</span>
                      <span className="font-semibold">{remainingUses} שימושים</span>
                    </div>
                  )}
                  {deal.current_uses > 0 && (
                    <div className="flex items-center justify-between text-amber-700">
                      <span>כבר השתמשו:</span>
                      <span className="font-semibold">{deal.current_uses} אנשים</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Rating Section */}
              {deal.rating > 0 && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-5 h-5 text-yellow-500 fill-current" />
                    <span className="font-bold text-slate-800">{deal.rating}</span>
                    <span className="text-slate-600 text-sm">({deal.total_reviews} דירוגים)</span>
                  </div>
                  <div className="text-xs text-slate-500">מבוסס על חוות דעת לקוחות</div>
                </div>
              )}

              {/* Business Details */}
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-3">פרטי העסק</h3>
                <div className="space-y-3 text-sm">
                  {deal.business_address && (
                    <div className="flex items-start gap-3 text-slate-600 bg-slate-50 p-3 rounded-lg">
                      <MapPin className="w-5 h-5 text-slate-700 mt-1 flex-shrink-0" />
                      <span>{deal.business_address}</span>
                    </div>
                  )}
                  {deal.business_phone && (
                    <div className="flex items-center gap-3 text-slate-600 bg-slate-50 p-3 rounded-lg">
                      <Phone className="w-5 h-5 text-slate-700" />
                      <span>{deal.business_phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  onClick={handleNavigate}
                  className="gap-2 bg-[#1A237E] hover:opacity-90 text-white"
                  disabled={!deal.business_address}
                >
                  <Navigation className="w-4 h-4" />
                  נווט לעסק
                </Button>
                <Button 
                  variant="outline" 
                  className="gap-2 border-slate-300 text-slate-600 hover:bg-slate-50"
                  onClick={() => window.open(`tel:${deal.business_phone}`, '_self')}
                  disabled={!deal.business_phone}
                >
                  <Phone className="w-4 h-4" />
                  התקשר
                </Button>
              </div>

              {/* Usage Terms */}
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
                <h3 className="text-base font-bold text-blue-800 mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  תנאי שימוש
                </h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• הקופון בתוקף עד התאריך הנקוב</li>
                  <li>• ניתן לשימוש חד פעמי בלבד</li>
                  <li>• יש להציג את הקופון בעסק</li>
                  <li>• לא ניתן להחזר כספי</li>
                  {deal.max_uses && <li>• מוגבל ל-{deal.max_uses} שימושים בסך הכל</li>}
                  {isValueCoupon && <li>• קופון ערך מוסף: שלם ₪{deal.coupon_price} וקבל ₪{deal.redemption_value} לשימוש בעסק</li>}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
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
