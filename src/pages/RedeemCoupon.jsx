import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QrCode, ArrowLeft, CheckCircle, XCircle, Camera, AlertTriangle } from "lucide-react";
import { UserCoupon, Transaction, User } from "@/api/entities";
import { useNavigate } from "react-router-dom";
import { format, isBefore } from "date-fns";

export default function RedeemCouponPage() {
  const [couponCode, setCouponCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [showCameraMessage, setShowCameraMessage] = useState(false);
  const navigate = useNavigate();

  const handleRedeem = async () => {
    if (!couponCode) {
      setResult({ success: false, message: "Please enter a coupon code." });
      return;
    }
    setIsLoading(true);
    setResult(null);

    try {
      const businessUser = await User.me();

      // Find the coupon
      const coupons = await UserCoupon.filter({ coupon_code: couponCode.trim() });
      if (coupons.length === 0) {
        setResult({ success: false, message: "Coupon code not found." });
        setIsLoading(false);
        return;
      }
      
      const coupon = coupons[0];

      // Check if business owner matches
      const transactions = await Transaction.filter({ id: coupon.transaction_id });
      if (transactions.length === 0 || transactions[0].business_owner !== businessUser.email) {
         setResult({ success: false, message: "This coupon does not belong to your business." });
         setIsLoading(false);
         return;
      }

      // Check status
      if (coupon.is_redeemed) {
        setResult({ success: false, message: `Coupon already redeemed on ${format(new Date(coupon.redemption_date), 'dd/MM/yyyy')}.` });
        setIsLoading(false);
        return;
      }
      if (isBefore(new Date(coupon.expiry_date), new Date())) {
        setResult({ success: false, message: "This coupon has expired." });
        setIsLoading(false);
        return;
      }

      // Update coupon status
      await UserCoupon.update(coupon.id, {
        is_redeemed: true,
        redemption_date: new Date().toISOString()
      });

      // Update transaction status
      await Transaction.update(coupon.transaction_id, {
        redemption_status: "redeemed",
        redemption_date: new Date().toISOString()
      });

      setResult({ success: true, message: "Coupon redeemed successfully!", coupon });
      setCouponCode("");

    } catch (error) {
      console.error("Error redeeming coupon:", error);
      setResult({ success: false, message: "An unexpected error occurred. Please try again." });
    }
    setIsLoading(false);
  };

  const handleCameraClick = () => {
    setShowCameraMessage(true);
    setTimeout(() => setShowCameraMessage(false), 3000);
  };
  
  return (
    <div className="min-h-screen elegant-gradient p-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)} className="p-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">מימוש קופון</h1>
            <p className="text-sm text-slate-600">הזן את קוד הקופון של הלקוח</p>
          </div>
        </div>

        <Card className="glass-effect border-slate-200 mb-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <QrCode className="w-5 h-5" />
              סרוק או הזן קוד
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Camera Feature Notice */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <Camera className="w-5 h-5 text-blue-700" />
                <h4 className="font-semibold text-blue-900">סריקת מצלמה</h4>
              </div>
              <p className="text-sm text-blue-800 mb-3">
                תכונת סריקה במצלמה תתווסף בגרסה הבאה של האפליקציה.
              </p>
              <Button 
                onClick={handleCameraClick}
                variant="outline" 
                className="w-full border-blue-300 text-blue-700 hover:bg-blue-100"
                disabled
              >
                <Camera className="w-4 h-4 mr-2" />
                פתח מצלמה (בקרוב)
              </Button>
            </div>

            {showCameraMessage && (
              <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <p className="text-sm text-amber-800 font-medium">
                    תכונה זו תהיה זמינה בקרוב במשך שבועיים הקרובים
                  </p>
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="couponCode">קוד קופון</Label>
              <Input
                id="couponCode"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="DP123ABC456"
                className="text-center tracking-widest font-mono h-12 text-lg"
              />
            </div>
            <Button
              onClick={handleRedeem}
              disabled={isLoading}
              className="w-full h-12 bg-[#1B5E20] text-white text-base"
            >
              {isLoading ? 'ממש...' : 'ממש קופון'}
            </Button>
          </CardContent>
        </Card>

        {result && (
          <Card className={`mt-6 ${result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <CardContent className="p-4 flex items-center gap-4">
              {result.success ? 
                <CheckCircle className="w-8 h-8 text-green-600" /> :
                <XCircle className="w-8 h-8 text-red-600" />
              }
              <div>
                <p className={`font-bold ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                  {result.success ? "הצלחה!" : "שגיאה"}
                </p>
                <p className="text-sm">
                  {result.message}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions Card */}
        <Card className="glass-effect border-slate-200 mt-4">
          <CardContent className="p-4">
            <h3 className="font-semibold text-slate-900 mb-3">איך לממש קופון:</h3>
            <div className="space-y-2 text-sm text-slate-600">
              <div className="flex items-start gap-2">
                <span className="bg-[#1A237E] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
                <p>בקש מהלקוח להציג את הקופון שלו</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="bg-[#1A237E] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
                <p>הזן את הקוד המופיע על הקופון</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="bg-[#1A237E] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
                <p>לחץ על "ממש קופון" כדי לסמן אותו כמומש</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}