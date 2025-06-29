
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard, 
  Shield, 
  Star, 
  Lock,
  CheckCircle,
  X,
  Calendar,
  Percent,
  HelpCircle,
  Smartphone,
  Gift,
  ArrowRight // Added ArrowRight
} from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom"; // Added Link
import { createPageUrl } from "@/utils"; // Added createPageUrl

// Mock API or utility classes to make the component runnable.
// In a real application, these would be proper API calls, database interactions, or context providers.
const mockDelay = (ms) => new Promise(res => setTimeout(res, ms));

class MockUser {
  static async me() {
    await mockDelay(100); // Simulate API call
    return {
      email: "user@example.com", // Placeholder user email
      total_points: 100,
      total_savings: 500
    };
  }
  static async updateMyUserData(data) {
    await mockDelay(100);
    console.log("MockUser.updateMyUserData called with:", data);
  }
}

class MockCommissionSettings {
  static async filter({ business_owner }) {
    await mockDelay(100);
    // Simulate different commission rates based on business_owner or default
    if (business_owner === "business_id_with_special_commission") {
      return [{ commission_rate: 0.10 }]; // Example: 10% for a specific business
    }
    return [{ commission_rate: 0.15 }]; // Default global commission rate
  }
}

class MockTransaction {
  static async create(data) {
    await mockDelay(100);
    console.log("MockTransaction.create called with:", data);
    return { id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`, ...data };
  }
}

class MockUserCoupon {
  static async create(data) {
    await mockDelay(100);
    console.log("MockUserCoupon.create called with:", data);
  }
}

class MockBusinessBalance {
  static async filter({ business_owner }) {
    await mockDelay(100);
    // Simulate existing business balance for a specific owner
    if (business_owner === "some_business_id") { // Replace with actual business owner ID for testing
      return [{
        id: "bb_1",
        business_owner: "some_business_id",
        total_earnings: 1000,
        total_commission_paid: 150,
        total_transactions: 10,
        pending_balance: 500
      }];
    }
    return []; // No existing balance for this business owner
  }
  static async update(id, data) {
    await mockDelay(100);
    console.log(`MockBusinessBalance.update called for ${id} with:`, data);
  }
  static async create(data) {
    await mockDelay(100);
    console.log("MockBusinessBalance.create called with:", data);
  }
}

class MockDeal {
  static async update(id, data) {
    await mockDelay(100);
    console.log(`MockDeal.update called for ${id} with:`, data);
  }
}

// Map mock classes to the names used in the outline for the component.
const User = MockUser;
const CommissionSettings = MockCommissionSettings;
const Transaction = MockTransaction;
const UserCoupon = MockUserCoupon;
const BusinessBalance = MockBusinessBalance;
const Deal = MockDeal;


export default function PaymentModal({ 
  isOpen, 
  onClose, 
  deal, 
  onPaymentSuccess 
}) {
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    holderName: '',
    email: '',
    phone: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState(1);
  const [transactionDetails, setTransactionDetails] = useState(null); // State to store transaction details for success screen

  if (!deal) return null;

  // Determine pricing based on coupon type
  const isValueCoupon = deal.coupon_type === 'value_coupon';
  const finalPrice = isValueCoupon ? (deal.coupon_price || 0) : (deal.discounted_price || 0);
  const cashbackAmount = Math.round(finalPrice * 0.02); // This is for display, pointsEarned is for logic
  
  // Adjusted savingsAmount calculation
  const savingsAmount = isValueCoupon 
    ? (deal.redemption_value || 0) - (deal.coupon_price || 0)
    : (deal.original_price || 0) - finalPrice;
  
  // Calculate valuePercentage for value coupons
  const valuePercentage = isValueCoupon && deal.coupon_price && deal.redemption_value && deal.coupon_price > 0
    ? Math.round(((deal.redemption_value - deal.coupon_price) / deal.coupon_price) * 100)
    : null;

  const handleInputChange = (field, value) => {
    setPaymentData(prev => ({ ...prev, [field]: value }));
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    
    try {
      // Get current user
      const currentUser = await User.me();
      
      // Get commission settings
      const globalCommission = await CommissionSettings.filter({ business_owner: null });
      const businessCommission = await CommissionSettings.filter({ business_owner: deal.business_owner });
      
      const commissionRate = businessCommission.length > 0 
        ? businessCommission[0].commission_rate 
        : (globalCommission.length > 0 ? globalCommission[0].commission_rate : 0.15); // Default to 15% if no settings
      
      // Calculate amounts
      const amountPaid = isValueCoupon ? (deal.coupon_price || 0) : (deal.discounted_price || 0);
      const commissionAmount = Math.round(amountPaid * commissionRate * 100) / 100;
      const businessEarnings = Math.round((amountPaid - commissionAmount) * 100) / 100;
      const pointsEarned = Math.floor(amountPaid); // 1 point per ₪1
      
      // Generate unique coupon code
      const couponCode = `DP${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      
      // Create transaction record
      const transactionData = {
        deal_id: deal.id,
        user_email: currentUser.email,
        business_owner: deal.business_owner,
        amount_paid: amountPaid,
        commission_rate: commissionRate,
        commission_amount: commissionAmount,
        business_earnings: businessEarnings,
        points_earned: pointsEarned,
        payment_method: "credit_card", // Assuming this is the payment method
        coupon_code: couponCode,
        redemption_status: "pending",
        transaction_date: new Date().toISOString()
      };
      
      const transaction = await Transaction.create(transactionData);
      setTransactionDetails(transaction); // Store transaction details for success screen
      
      // Create user coupon
      const userCouponData = {
        user_email: currentUser.email,
        deal_id: deal.id,
        transaction_id: transaction.id,
        coupon_code: couponCode,
        amount_paid: amountPaid,
        redemption_value: isValueCoupon ? (deal.redemption_value || amountPaid) : amountPaid,
        purchase_date: new Date().toISOString(),
        expiry_date: deal.expiry_date,
        points_earned: pointsEarned,
        is_redeemed: false
      };
      
      await UserCoupon.create(userCouponData);
      
      // Update user points and savings
      await User.updateMyUserData({
        total_points: (currentUser.total_points || 0) + pointsEarned,
        total_savings: (currentUser.total_savings || 0) + (isValueCoupon ? 
          ((deal.redemption_value || 0) - (deal.coupon_price || 0)) : 
          ((deal.original_price || 0) - amountPaid))
      });
      
      // Update business balance
      const existingBalances = await BusinessBalance.filter({ business_owner: deal.business_owner });
      if (existingBalances.length > 0) {
        const balance = existingBalances[0];
        await BusinessBalance.update(balance.id, {
          total_earnings: balance.total_earnings + businessEarnings,
          total_commission_paid: balance.total_commission_paid + commissionAmount,
          total_transactions: balance.total_transactions + 1,
          pending_balance: balance.pending_balance + businessEarnings // Assuming all earnings are pending until payout
        });
      } else {
        await BusinessBalance.create({
          business_owner: deal.business_owner,
          total_earnings: businessEarnings,
          total_commission_paid: commissionAmount,
          total_transactions: 1,
          pending_balance: businessEarnings
        });
      }
      
      // Update deal usage count
      await Deal.update(deal.id, {
        current_uses: (deal.current_uses || 0) + 1
      });
      
      // Simulate network delay before showing success
      setTimeout(() => {
        setIsProcessing(false);
        setStep(3); // Set to success step
        onPaymentSuccess?.(deal, paymentData, { couponCode, transaction });
      }, 1000);
      
    } catch (error) {
      console.error("Payment processing error:", error);
      setIsProcessing(false);
      // Implement more robust error handling (e.g., show an error message to the user)
    }
  };

  const formatCardNumber = (value) => {
    return value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
        setTimeout(() => setStep(1), 300);
      }
    }}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto bg-white rounded-2xl">
        <DialogHeader className="border-b border-slate-100 pb-6 bg-gradient-to-r from-slate-50 to-white rounded-t-2xl">
          <DialogTitle className="flex items-center gap-4 text-2xl font-bold text-slate-900">
            <div className="w-12 h-12 bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] rounded-xl flex items-center justify-center shadow-lg">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div>
              {step === 1 && "פרטי הזמנה ותשלום"}
              {step === 2 && "תשלום מאובטח"}
              {step === 3 && "רכישה בוצעה בהצלחה!"}
              {step === 3 ? (
                <p className="text-sm font-normal text-slate-600 mt-1">
                  הקופון שלך מוכן למימוש
                </p>
              ) : (
                <p className="text-sm font-normal text-slate-600 mt-1">
                  {isValueCoupon ? 'רכוש קופון ערך מוסף' : 'בצע את התשלום בצורה מאובטחת ומהירה'}
                </p>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        {step === 1 && (
          <div className="grid lg:grid-cols-5 gap-8 pt-8 px-2">
            {/* Left Side - Order Summary */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-700">1</span>
                  </div>
                  סיכום ההזמנה
                </h3>
                
                {/* Enhanced Coupon Card */}
                <Card className="border-2 border-slate-200 bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      {deal.image_url && (
                        <div className="relative">
                          <img 
                            src={deal.image_url} 
                            alt={deal.title}
                            className="w-24 h-24 rounded-xl object-cover shadow-md"
                          />
                          {isValueCoupon ? (
                            <div className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-600 to-purple-800 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
                              {valuePercentage !== null ? `+${valuePercentage}%` : ''}
                            </div>
                          ) : deal.discount_percentage && (
                            <div className="absolute -top-2 -right-2 bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
                              -{deal.discount_percentage}%
                            </div>
                          )}
                        </div>
                      )}
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-900 text-lg mb-2">{deal.title}</h4>
                        <p className="text-slate-700 font-medium mb-3">{deal.business_name}</p>
                        
                        {/* Coupon Type Badge */}
                        {isValueCoupon && (
                          <div className="flex items-center gap-2 text-purple-700 bg-purple-50 px-3 py-2 rounded-lg border border-purple-200 mb-3">
                            <Gift className="w-4 h-4" />
                            <span className="text-sm font-medium">קופון ערך מוסף</span>
                          </div>
                        )}
                        
                        {deal.expiry_date && (
                          <div className="flex items-center gap-2 text-amber-700 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
                            <Calendar className="w-4 h-4" />
                            <span className="text-sm font-medium">
                              בתוקף עד: {format(new Date(deal.expiry_date), 'dd/MM/yyyy')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Enhanced Price Breakdown */}
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 border border-slate-200 shadow-sm">
                  <h4 className="font-bold text-slate-900 mb-4 text-lg">פירוט מחיר</h4>
                  <div className="space-y-4">
                    {isValueCoupon ? (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-700 font-medium">מחיר הקופון:</span>
                          <span className="text-slate-900 font-bold text-lg">₪{deal.coupon_price || 0}</span>
                        </div>
                        <div className="flex justify-between items-center text-purple-700">
                          <span className="font-medium">ערך בעסק:</span>
                          <span className="font-bold text-lg">₪{deal.redemption_value || 0}</span>
                        </div>
                        {savingsAmount > 0 && valuePercentage !== null && (
                          <div className="flex justify-between items-center text-green-700">
                            <span className="font-medium">ערך מוסף:</span>
                            <span className="font-bold text-lg">+₪{savingsAmount} ({valuePercentage}%)</span>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-700 font-medium">מחיר מקורי:</span>
                          <span className="text-slate-500 line-through font-medium">₪{deal.original_price || finalPrice}</span>
                        </div>
                        {savingsAmount > 0 && (
                          <div className="flex justify-between items-center text-green-700">
                            <span className="font-medium">חיסכון:</span>
                            <span className="font-bold text-lg">-₪{savingsAmount}</span>
                          </div>
                        )}
                      </>
                    )}
                    
                    <div className="flex justify-between items-center text-amber-700">
                      <span className="font-medium">Cashback (2%):</span>
                      <span className="font-bold">+₪{cashbackAmount}</span>
                    </div>
                    <hr className="border-slate-300" />
                    <div className="flex justify-between items-center text-xl font-bold text-slate-900 bg-white px-4 py-3 rounded-lg border-2 border-[#1B5E20]">
                      <span>סה"כ לתשלום:</span>
                      <span className="text-[#1B5E20]">₪{finalPrice}</span>
                    </div>
                  </div>
                </div>

                {/* Enhanced Terms */}
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                  <h5 className="font-bold text-blue-900 mb-3 text-base">תנאי שימוש:</h5>
                  <ul className="text-sm text-blue-800 space-y-2 font-medium">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      הקופון בתוקף עד התאריך הנקוב
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      ניתן לשימוש חד פעמי בלבד
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      יש להציג את הקופון בעסק
                    </li>
                    {isValueCoupon && (
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        ערך הקופון: ₪{deal.redemption_value} לשימוש בעסק
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            {/* Right Side - Customer Details */}
            <div className="lg:col-span-3 space-y-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-green-700">2</span>
                  </div>
                  פרטי קשר
                </h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="email" className="text-base font-bold text-slate-900">
                      כתובת אימייל *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={paymentData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="הכנס את כתובת האימייל שלך"
                      className="h-12 text-base font-medium text-slate-900 placeholder:text-slate-500 placeholder:font-medium border-2 border-slate-300 focus:border-[#1A237E] focus:ring-4 focus:ring-[#1A237E]/20 rounded-xl bg-white shadow-sm"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="phone" className="text-base font-bold text-slate-900">
                      מספר טלפון *
                    </Label>
                    <Input
                      id="phone"
                      value={paymentData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="הכנס מספר טלפון"
                      className="h-12 text-base font-medium text-slate-900 placeholder:text-slate-500 placeholder:font-medium border-2 border-slate-300 focus:border-[#1A237E] focus:ring-4 focus:ring-[#1A237E]/20 rounded-xl bg-white shadow-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button 
                  onClick={() => setStep(2)}
                  className="w-full h-14 bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] hover:from-[#1B5E20]/90 hover:to-[#2E7D32]/90 text-white text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                  disabled={!paymentData.email || !paymentData.phone}
                >
                  <Lock className="w-5 h-5 mr-3" />
                  המשך לתשלום מאובטח
                </Button>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="grid lg:grid-cols-5 gap-8 pt-8 px-2">
            {/* Left Side - Compact Order Summary */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4">סיכום הזמנה</h3>
                <Card className="border-2 border-slate-200 bg-gradient-to-br from-slate-50 to-white shadow-lg">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] rounded-xl flex items-center justify-center shadow-lg">
                        {isValueCoupon ? <Gift className="w-8 h-8 text-white" /> : <Percent className="w-8 h-8 text-white" />}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-900 text-base">{deal.title}</h4>
                        <p className="text-slate-700 font-medium text-sm">{deal.business_name}</p>
                        <p className="text-2xl font-bold text-[#1B5E20] mt-1">₪{finalPrice}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Enhanced Security Banner */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <Shield className="w-6 h-6 text-green-700" />
                  <div>
                    <p className="font-bold text-green-900">תשלום מאובטח</p>
                    <p className="text-sm text-green-700 font-medium">הצפנת SSL 256-bit</p>
                  </div>
                </div>
                
                <div>
                  <p className="font-bold text-slate-900 mb-2 text-sm">אמצעי תשלום מקובלים:</p>
                  <div className="flex gap-2">
                    <div className="px-3 py-2 bg-white border-2 border-blue-200 text-blue-800 rounded-lg text-sm font-bold shadow-sm">
                      Visa
                    </div>
                    <div className="px-3 py-2 bg-white border-2 border-red-200 text-red-800 rounded-lg text-sm font-bold shadow-sm">
                      MasterCard
                    </div>
                    <div className="px-3 py-2 bg-white border-2 border-slate-200 text-slate-800 rounded-lg text-sm font-bold shadow-sm flex items-center gap-1">
                      <Smartphone className="w-3 h-3" />
                      Apple Pay
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Enhanced Payment Form */}
            <div className="lg:col-span-3 space-y-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-700">3</span>
                  </div>
                  פרטי תשלום
                </h3>
                
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="holderName" className="text-base font-bold text-slate-900">
                      שם בעל הכרטיס *
                    </Label>
                    <Input
                      id="holderName"
                      value={paymentData.holderName}
                      onChange={(e) => handleInputChange('holderName', e.target.value)}
                      placeholder="הכנס שם מלא כפי שמופיע על הכרטיס"
                      className="h-12 text-base font-medium text-slate-900 placeholder:text-slate-500 placeholder:font-medium border-2 border-slate-300 focus:border-[#1A237E] focus:ring-4 focus:ring-[#1A237E]/20 rounded-xl bg-white shadow-sm"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="cardNumber" className="text-base font-bold text-slate-900">
                      מספר כרטיס אשראי *
                    </Label>
                    <div className="relative">
                      <Input
                        id="cardNumber"
                        value={formatCardNumber(paymentData.cardNumber)}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\s/g, '');
                          if (value.length <= 16) {
                            handleInputChange('cardNumber', value);
                          }
                        }}
                        placeholder="1234 5678 9012 3456"
                        className="h-12 text-base font-medium text-slate-900 placeholder:text-slate-500 placeholder:font-medium border-2 border-slate-300 focus:border-[#1A237E] focus:ring-4 focus:ring-[#1A237E]/20 rounded-xl bg-white shadow-sm pl-12"
                      />
                      <CreditCard className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="expiryDate" className="text-base font-bold text-slate-900">
                        תאריך תפוגה *
                      </Label>
                      <Input
                        id="expiryDate"
                        value={paymentData.expiryDate}
                        onChange={(e) => {
                          let value = e.target.value.replace(/\D/g, '');
                          if (value.length >= 2) {
                            value = value.substring(0, 2) + '/' + value.substring(2, 4);
                          }
                          handleInputChange('expiryDate', value);
                        }}
                        placeholder="MM/YY"
                        maxLength={5}
                        className="h-12 text-base font-medium text-slate-900 placeholder:text-slate-500 placeholder:font-medium border-2 border-slate-300 focus:border-[#1A237E] focus:ring-4 focus:ring-[#1A237E]/20 rounded-xl bg-white shadow-sm"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="cvv" className="text-base font-bold text-slate-900">
                        CVV *
                      </Label>
                      <Input
                        id="cvv"
                        value={paymentData.cvv}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          if (value.length <= 3) {
                            handleInputChange('cvv', value);
                          }
                        }}
                        placeholder="123"
                        maxLength={3}
                        className="h-12 text-base font-medium text-slate-900 placeholder:text-slate-500 placeholder:font-medium border-2 border-slate-300 focus:border-[#1A237E] focus:ring-4 focus:ring-[#1A237E]/20 rounded-xl bg-white shadow-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4 pt-4">
                <Button 
                  onClick={handlePayment}
                  disabled={isProcessing || !paymentData.cardNumber || !paymentData.expiryDate || !paymentData.cvv || !paymentData.holderName}
                  className="w-full h-16 text-xl font-bold bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] hover:from-[#1B5E20]/90 hover:to-[#2E7D32]/90 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-3 border-white border-t-transparent mr-3" />
                      מעבד תשלום...
                    </>
                  ) : (
                    <>
                      <Lock className="w-6 h-6 mr-3" />
                      השלם רכישה - ₪{finalPrice}
                    </>
                  )}
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => setStep(1)}
                  className="w-full h-12 border-2 border-slate-300 text-slate-700 hover:bg-slate-50 font-bold rounded-xl"
                >
                  חזור לפרטי הזמנה
                </Button>

                <div className="text-center pt-2">
                  <p className="text-sm text-slate-600 flex items-center justify-center gap-2 font-medium">
                    <HelpCircle className="w-4 h-4" />
                    זקוק לעזרה? צור קשר: 
                    <span className="font-bold text-[#1A237E]">support@dealpoint.co.il</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="text-center space-y-8 pt-8 pb-4">
            <div className="w-24 h-24 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto shadow-lg">
              <CheckCircle className="w-12 h-12 text-green-700" />
            </div>
            
            <div>
              <h3 className="text-3xl font-bold text-slate-900 mb-3">רכישה בוצעה בהצלחה!</h3>
              <p className="text-lg text-slate-600 font-medium">הקופון שלך מוכן למימוש</p>
            </div>

            {/* QR Code Section */}
            <Card className="border-2 border-slate-200 bg-white max-w-sm mx-auto shadow-xl">
              <CardContent className="p-6 text-center">
                <h4 className="font-bold text-slate-900 text-lg mb-2">{deal.title}</h4>
                <p className="text-slate-700 font-medium mb-4">{deal.business_name}</p>
                
                <div className="flex justify-center mb-4">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${transactionDetails?.coupon_code || ''}`}
                    alt="Coupon QR Code"
                    className="w-36 h-36 rounded-lg border-4 border-slate-200"
                  />
                </div>
                
                <Badge className="bg-slate-100 text-slate-800 text-lg font-mono px-4 py-2 tracking-widest">
                  {transactionDetails?.coupon_code}
                </Badge>
                <p className="text-xs text-slate-500 mt-2">הצג קוד זה או את ה-QR בעסק</p>
              </CardContent>
            </Card>

            <div className="space-y-3 max-w-sm mx-auto">
              <Link to={createPageUrl("MyCoupons")}>
                <Button className="w-full h-12 bg-[#1A237E] hover:opacity-90 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 gap-2">
                  צפה בקופונים שלי
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Button 
                onClick={onClose}
                variant="outline"
                className="w-full h-12 border-2 border-slate-300 text-slate-700 hover:bg-slate-50 font-bold rounded-xl"
              >
                סגור
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
