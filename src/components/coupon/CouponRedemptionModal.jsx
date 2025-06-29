import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  XCircle, 
  QrCode,
  Calendar,
  MapPin,
  Star,
  AlertTriangle
} from "lucide-react";
import { format } from "date-fns";

export default function CouponRedemptionModal({ 
  isOpen, 
  onClose, 
  coupon, 
  deal, 
  onConfirmRedemption 
}) {
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redemptionResult, setRedemptionResult] = useState(null);

  if (!coupon || !deal) return null;

  const handleConfirmRedemption = async () => {
    setIsRedeeming(true);
    try {
      await onConfirmRedemption(coupon);
      setRedemptionResult({ success: true, message: "Coupon redeemed successfully!" });
    } catch (error) {
      setRedemptionResult({ success: false, message: "Failed to redeem coupon. Please try again." });
    }
    setIsRedeeming(false);
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setRedemptionResult(null);
    }, 300);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md bg-white rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <QrCode className="w-6 h-6 text-[#1A237E]" />
            אישור מימוש קופון
          </DialogTitle>
        </DialogHeader>

        {!redemptionResult ? (
          <div className="space-y-6 pt-4">
            {/* Coupon Details */}
            <Card className="border-2 border-slate-200 bg-gradient-to-br from-slate-50 to-white">
              <CardContent className="p-4">
                <div className="text-center mb-4">
                  <h3 className="font-bold text-lg text-slate-900">{deal.title}</h3>
                  <p className="text-slate-600 font-medium">{deal.business_name}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-xs text-slate-600">שולם</p>
                    <p className="text-xl font-bold text-slate-900">₪{coupon.amount_paid}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-600">ערך למימוש</p>
                    <p className="text-xl font-bold text-green-700">₪{coupon.redemption_value}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-slate-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>תוקף עד: {format(new Date(coupon.expiry_date), 'dd/MM/yyyy')}</span>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-slate-100 rounded-lg text-center">
                  <p className="text-xs text-slate-600 mb-1">קוד קופון</p>
                  <p className="font-mono font-bold text-lg text-slate-900 tracking-widest">
                    {coupon.coupon_code}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Warning */}
            <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <div>
                  <p className="font-semibold text-amber-800">שים לב!</p>
                  <p className="text-sm text-amber-700">
                    לאחר אישור המימוש, הקופון יסומן כמומש ולא ניתן יהיה להשתמש בו שוב.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleConfirmRedemption}
                disabled={isRedeeming}
                className="flex-1 bg-[#1B5E20] hover:opacity-90 text-white h-12 text-base font-bold"
              >
                {isRedeeming ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2" />
                    ממש...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    אשר מימוש
                  </>
                )}
              </Button>
              <Button
                onClick={handleClose}
                variant="outline"
                className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-50 h-12 text-base font-bold"
              >
                ביטול
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-6 pt-4 pb-2">
            <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${
              redemptionResult.success ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {redemptionResult.success ? (
                <CheckCircle className="w-10 h-10 text-green-600" />
              ) : (
                <XCircle className="w-10 h-10 text-red-600" />
              )}
            </div>
            
            <div>
              <h3 className={`text-xl font-bold mb-2 ${
                redemptionResult.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {redemptionResult.success ? 'מימוש הצליח!' : 'מימוש נכשל'}
              </h3>
              <p className="text-slate-600">{redemptionResult.message}</p>
            </div>

            <Button 
              onClick={handleClose}
              className="w-full bg-[#1A237E] hover:opacity-90 text-white h-12 text-base font-bold"
            >
              סגור
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}