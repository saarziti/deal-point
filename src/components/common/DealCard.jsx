import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Clock, 
  Star, 
  Percent,
  Users,
  ShoppingCart,
  Building2,
  Zap,
  TrendingUp,
  Gift
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function DealCard({ deal, onPurchase }) {
  if (!deal) return null;

  // Determine pricing based on coupon type
  const isValueCoupon = deal.coupon_type === 'value_coupon';
  const displayPrice = isValueCoupon ? deal.coupon_price : deal.discounted_price;
  const cashbackAmount = Math.round((displayPrice || 0) * 0.02);
  
  // Calculate value percentage for value coupons
  const valuePercentage = isValueCoupon && deal.coupon_price && deal.redemption_value
    ? Math.round(((deal.redemption_value - deal.coupon_price) / deal.coupon_price) * 100)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      className="group h-full"
    >
      <Card className="overflow-hidden glass-effect border-slate-200 hover:border-slate-300 transition-all duration-300 hover-lift flex flex-col h-full">
        <div className="relative">
          <Link to={createPageUrl(`Deal?id=${deal.id}`)}>
            {deal.image_url ? (
              <div className="relative overflow-hidden">
                <img 
                  src={deal.image_url} 
                  alt={deal.title || 'Deal image'}
                  className="w-full h-28 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>
            ) : (
              <div className="w-full h-28 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                <Zap className="w-8 h-8 text-slate-500" />
              </div>
            )}
          </Link>
          
          {isValueCoupon ? (
            <div className="absolute top-2 right-2 bg-gradient-to-r from-purple-600 to-purple-800 text-white px-2 py-0.5 rounded-full font-bold text-[10px] luxury-shadow">
              <TrendingUp className="w-2.5 h-2.5 inline mr-0.5" />
              +{valuePercentage}% ערך
            </div>
          ) : deal.discount_percentage && (
            <div className="absolute top-2 right-2 professional-gradient text-white px-2 py-0.5 rounded-full font-bold text-[10px] luxury-shadow">
              <Percent className="w-2.5 h-2.5 inline mr-0.5" />
              {deal.discount_percentage}%
            </div>
          )}

          {deal.tags?.includes('extra_value') && (
            <div className="absolute top-2 left-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white px-2 py-0.5 rounded-full font-bold text-[10px] luxury-shadow">
              <Gift className="w-2.5 h-2.5 inline mr-0.5" />
              ערך מוסף
            </div>
          )}

          {deal.tags?.includes('vip') && (
            <div className="absolute top-8 left-2 gold-accent text-white px-2 py-0.5 rounded-full font-bold text-[10px] luxury-shadow">
              VIP
            </div>
          )}
        </div>

        <CardContent className="p-2 flex-grow flex flex-col justify-between">
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-slate-900 line-clamp-1 leading-tight">
              <Link to={createPageUrl(`Deal?id=${deal.id}`)} className="hover:text-slate-700">
                {deal.title || "הטבה מדהימה"}
              </Link>
            </h3>
            
            <Link 
              to={createPageUrl(`BusinessPage?name=${encodeURIComponent(deal.business_name || '')}`)}
              className="text-xs text-slate-600 hover:text-slate-800 transition-colors line-clamp-1"
            >
              {deal.business_name || "עסק מקומי"}
            </Link>

            <div className="flex items-baseline gap-1.5 pt-1">
              {isValueCoupon ? (
                <div className="space-y-1">
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm font-bold text-slate-900">
                      שלם ₪{deal.coupon_price || 0}
                    </span>
                  </div>
                  <div className="text-xs text-purple-700 font-medium">
                    קבל ₪{deal.redemption_value || 0} בעסק
                  </div>
                </div>
              ) : (
                <>
                  <span className="text-lg font-bold text-slate-900">
                    ₪{deal.discounted_price || 0}
                  </span>
                  {(deal.original_price && deal.original_price > (deal.discounted_price || 0)) && (
                    <span className="text-xs text-slate-500 line-through">
                      ₪{deal.original_price}
                    </span>
                  )}
                </>
              )}
            </div>

            {cashbackAmount > 0 && 
              <div className="flex items-center gap-1.5 text-yellow-700">
                <Star className="w-3 h-3" />
                <span className="text-xs font-medium">
                  +₪{cashbackAmount} cashback
                </span>
              </div>
            }
          </div>

          <div className="flex gap-1.5 mt-2">
            <Link to={createPageUrl(`Deal?id=${deal.id}`)} className="flex-1">
              <Button 
                size="xs"
                className="w-full bg-[#1A237E] text-white hover:opacity-90 transition-opacity h-8"
              >
                פרטים
              </Button>
            </Link>
            <Button 
              size="xs"
              className="flex-1 bg-[#1B5E20] hover:opacity-90 text-white font-medium luxury-shadow h-8"
              onClick={() => onPurchase?.(deal)}
            >
              <ShoppingCart className="w-3.5 h-3.5 mr-1" />
              {isValueCoupon ? 'קנה' : 'קנה'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}