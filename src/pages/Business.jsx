
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // Added Link import for navigation
import { Deal, User, BusinessBalance, Transaction } from "@/api/entities"; // Added BusinessBalance, Transaction
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  PlusCircle,
  BarChart2,
  Upload,
  Calendar,
  Percent,
  MapPin,
  Star,
  Eye,
  Users,
  TrendingUp,
  Edit,
  Trash2,
  CreditCard,
  QrCode // Added QrCode
} from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns"; // Added date-fns format

const categories = [
  { id: "food_restaurants", name: "מסעדות ואוכל" },
  { id: "fashion_clothing", name: "אופנה ובגדים" },
  { id: "electronics", name: "אלקטרוניקה" },
  { id: "beauty_health", name: "יופי ובריאות" },
  { id: "entertainment", name: "בידור" },
  { id: "travel", "name": "נסיעות" },
  { id: "home_garden", name: "בית וגינה" },
  { id: "automotive", name: "רכב" },
  { id: "services", name: "שירותים" },
  { id: "sports_fitness", name: "ספורט וכושר" }
];

const cities = [
  "תל אביב", "ירושלים", "חיפה", "ראשון לציון", "פתח תקווה",
  "אשדוד", "נתניה", "באר שבע", "חולון", "רמת גן"
];

// Helper function to create URLs based on page names
// In a real application, this would typically come from a central routing configuration
const createPageUrl = (pageName) => {
  switch (pageName) {
    case "RedeemCoupon":
      return "/redeem-coupon"; // Assumed path for the Redeem Coupon page
    // Add other page mappings here if needed
    default:
      return "/"; // Fallback to home or a default path
  }
};

export default function BusinessPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [myDeals, setMyDeals] = useState([]);
  const [businessBalance, setBusinessBalance] = useState(null); // New state
  const [recentTransactions, setRecentTransactions] = useState([]); // New state
  const [newDeal, setNewDeal] = useState({
    title: "",
    description: "",
    business_name: "",
    business_address: "",
    business_phone: "",
    category: "",
    coupon_type: "percentage_discount",
    discount_percentage: "",
    original_price: "",
    discounted_price: "",
    coupon_price: "",
    redemption_value: "",
    coupon_code: "",
    expiry_date: "",
    max_uses: "",
    image_url: "",
    city: "",
    area: "",
    tags: []
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (activeTab === "dashboard") {
      loadDashboardData(); // Changed from loadMyDeals
    }
  }, [activeTab]);

  const loadDashboardData = async () => { // New function, replaces loadMyDeals
    setIsLoading(true);
    try {
      const user = await User.me();
      
      // Load deals
      const deals = await Deal.filter({ business_owner: user.email }, "-created_date");
      setMyDeals(deals);
      
      // Load business balance
      const balanceData = await BusinessBalance.filter({ business_owner: user.email });
      setBusinessBalance(balanceData.length > 0 ? balanceData[0] : null);
      
      // Load recent transactions
      const transactions = await Transaction.filter({ business_owner: user.email }, "-created_date", 10);
      setRecentTransactions(transactions);
      
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      setMyDeals([]); // Reset deals on error
      setBusinessBalance(null); // Reset balance on error
      setRecentTransactions([]); // Reset transactions on error
    }
    setIsLoading(false);
  };

  const handleInputChange = (field, value) => {
    setNewDeal(prev => ({ ...prev, [field]: value }));
  };

  const handleTagToggle = (tag) => {
    setNewDeal(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const handleCreateDeal = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const user = await User.me();
      const dealData = {
        ...newDeal,
        business_owner: user.email,
        current_uses: 0,
        is_active: true,
        rating: 0,
        total_reviews: 0
      };

      // Handle different coupon types
      if (newDeal.coupon_type === 'value_coupon') {
        dealData.coupon_price = parseFloat(newDeal.coupon_price) || 0;
        dealData.redemption_value = parseFloat(newDeal.redemption_value) || 0;
        dealData.max_uses = parseInt(newDeal.max_uses) || 100;
        // Add extra_value tag for value coupons
        if (!dealData.tags.includes('extra_value')) {
          dealData.tags = [...dealData.tags, 'extra_value'];
        }
        // Clear percentage/original price fields if not applicable
        dealData.discount_percentage = 0;
        dealData.original_price = 0;
        dealData.discounted_price = 0;
      } else { // percentage_discount
        dealData.discount_percentage = parseFloat(newDeal.discount_percentage) || 0;
        dealData.original_price = parseFloat(newDeal.original_price) || 0;
        dealData.discounted_price = parseFloat(newDeal.discounted_price) || 0;
        dealData.max_uses = parseInt(newDeal.max_uses) || 100;
        // Clear value coupon fields if not applicable
        dealData.coupon_price = 0;
        dealData.redemption_value = 0;
        dealData.tags = newDeal.tags.filter(tag => tag !== 'extra_value'); // Ensure extra_value tag is removed
      }

      await Deal.create(dealData);

      // Reset form
      setNewDeal({
        title: "",
        description: "",
        business_name: "",
        business_address: "",
        business_phone: "",
        category: "",
        coupon_type: "percentage_discount",
        discount_percentage: "",
        original_price: "",
        discounted_price: "",
        coupon_price: "",
        redemption_value: "",
        coupon_code: "",
        expiry_date: "",
        max_uses: "",
        image_url: "",
        city: "",
        area: "",
        tags: []
      });

      setActiveTab("dashboard");
      loadDashboardData(); // Changed to loadDashboardData
    } catch (error) {
      console.error("Error creating deal:", error);
    }
    setIsLoading(false);
  };

  const getStats = () => {
    const totalViews = myDeals.reduce((sum, deal) => sum + (deal.current_uses * 10), 0); // Estimate views
    const totalUses = myDeals.reduce((sum, deal) => sum + (deal.current_uses || 0), 0);
    const avgRating = myDeals.length > 0
      ? (myDeals.reduce((sum, deal) => sum + (deal.rating || 0), 0) / myDeals.length).toFixed(1)
      : 0;

    return { totalViews, totalUses, avgRating };
  };

  const stats = getStats(); // Kept for consistency, although its values are not used in the new dashboard stat cards.

  return (
    <div className="min-h-screen elegant-gradient p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">מרכז עסקים - DEAL POINT</h1>
          <p className="text-slate-600 text-sm">נהל את ההטבות שלך וצפה בנתונים</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            onClick={() => setActiveTab("dashboard")}
            className={`gap-2 rounded-xl flex-1 ${activeTab === 'dashboard' ? 'bg-[#1A237E] text-white' : 'bg-white text-slate-700 border border-slate-200'}`}
          >
            <BarChart2 className="w-4 h-4" />
            דשבורד
          </Button>
          <Button
            onClick={() => setActiveTab("create")}
            className={`gap-2 rounded-xl flex-1 ${activeTab === 'create' ? 'bg-[#1A237E] text-white' : 'bg-white text-slate-700 border border-slate-200'}`}
          >
            <PlusCircle className="w-4 h-4" />
            הוסף הטבה
          </Button>
          <Link to={createPageUrl("RedeemCoupon")} className="flex-1">
            <Button
              variant="outline"
              className="gap-2 rounded-xl w-full bg-white text-slate-700 border border-slate-200"
            >
              <QrCode className="w-4 h-4" />
              ממש קופון
            </Button>
          </Link>
        </div>

        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            {/* Enhanced Stats Cards with Financial Data */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="border-0 elegant-shadow glass-effect">
                <CardContent className="p-4">
                  <p className="text-xs text-slate-600">הטבות פעילות</p>
                  <p className="text-2xl font-bold text-slate-800">{myDeals.length}</p>
                </CardContent>
              </Card>

              <Card className="border-0 elegant-shadow glass-effect">
                <CardContent className="p-4">
                  <p className="text-xs text-slate-600">מכירות</p>
                  <p className="text-2xl font-bold text-green-700">{businessBalance?.total_transactions || 0}</p>
                </CardContent>
              </Card>

              <Card className="border-0 elegant-shadow glass-effect">
                <CardContent className="p-4">
                  <p className="text-xs text-slate-600">הכנסות</p>
                  <p className="text-2xl font-bold text-green-700">₪{businessBalance?.total_earnings?.toFixed(2) || 0}</p>
                </CardContent>
              </Card>

              <Card className="border-0 elegant-shadow glass-effect">
                <CardContent className="p-4">
                  <p className="text-xs text-slate-600">ממתין לתשלום</p>
                  <p className="text-2xl font-bold text-amber-600">₪{businessBalance?.pending_balance?.toFixed(2) || 0}</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Transactions */}
            <Card className="border-0 elegant-shadow glass-effect">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <CreditCard className="w-5 h-5 text-slate-800" />
                  עסקאות אחרונות
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentTransactions.length > 0 ? (
                  <div className="space-y-3">
                    {recentTransactions.slice(0, 5).map((transaction) => (
                      <div key={transaction.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            ₪{transaction.amount_paid?.toFixed(2)}
                          </p>
                          <p className="text-xs text-slate-600">
                            {format(new Date(transaction.created_date), 'dd/MM/yyyy HH:mm')}
                          </p>
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-semibold text-green-700">
                            +₪{transaction.business_earnings?.toFixed(2)}
                          </p>
                          <p className="text-xs text-slate-500">
                            עמלה: ₪{transaction.commission_amount?.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <CreditCard className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-slate-600 text-sm">עדיין אין עסקאות</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* My Deals */}
            <Card className="border-0 elegant-shadow glass-effect">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp className="w-5 h-5 text-slate-800" />
                  ההטבות שלי
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    {Array(3).fill(0).map((_, i) => (
                      <div key={i} className="animate-pulse bg-slate-100 h-16 rounded-lg" />
                    ))}
                  </div>
                ) : myDeals.length > 0 ? (
                  <div className="space-y-3">
                    {myDeals.map((deal) => (
                      <motion.div
                        key={deal.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border border-slate-200 rounded-lg p-3 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex-1">
                            <h4 className="font-semibold text-slate-900 text-sm">{deal.title}</h4>
                            <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-1">
                              {deal.coupon_type === 'value_coupon' ? (
                                <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-xs">
                                  ₪{deal.coupon_price} ב-₪{deal.redemption_value}
                                </Badge>
                              ) : (
                                <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                                  {deal.discount_percentage}% הנחה
                                </Badge>
                              )}
                              <span className="text-xs text-slate-500">
                                {deal.current_uses} שימושים
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="icon" variant="outline" className="rounded-lg h-8 w-8">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="icon" variant="outline" className="rounded-lg h-8 w-8 text-red-600 hover:text-red-700">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-base font-semibold text-slate-900 mb-1">עדיין אין הטבות</h3>
                    <p className="text-slate-600 mb-4 text-sm">הוסף את ההטבה הראשונה שלך</p>
                    <Button
                      onClick={() => setActiveTab("create")}
                      className="bg-[#1B5E20] hover:opacity-90 text-white gap-2"
                    >
                      <PlusCircle className="w-4 h-4" />
                      הוסף הטבה
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Create Deal Tab */}
        {activeTab === "create" && (
          <Card className="border-0 elegant-shadow glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <PlusCircle className="w-5 h-5 text-slate-800" />
                הוסף הטבה חדשה
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateDeal} className="space-y-4">
                
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm">כותרת ההטבה *</Label>
                  <Input
                    id="title"
                    value={newDeal.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="פיצה משפחתית + שתייה"
                    required
                    className="border-slate-300 focus:border-slate-600 focus:ring-slate-600"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="business_name" className="text-sm">שם העסק *</Label>
                  <Input
                    id="business_name"
                    value={newDeal.business_name}
                    onChange={(e) => handleInputChange('business_name', e.target.value)}
                    placeholder="שם העסק שלך"
                    required
                    className="border-slate-300 focus:border-slate-600 focus:ring-slate-600"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm">תיאור ההטבה</Label>
                  <Textarea
                    id="description"
                    value={newDeal.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="פרט על ההטבה..."
                    rows={3}
                    className="border-slate-300 focus:border-slate-600 focus:ring-slate-600"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-sm">קטגוריה *</Label>
                  <Select value={newDeal.category} onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger className="border-slate-300 focus:border-slate-600 focus:ring-slate-600">
                      <SelectValue placeholder="בחר קטגוריה" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* New Coupon Type Selection */}
                <div className="space-y-2">
                  <Label htmlFor="coupon_type" className="text-sm">סוג הטבה *</Label>
                  <Select value={newDeal.coupon_type} onValueChange={(value) => handleInputChange('coupon_type', value)}>
                    <SelectTrigger className="border-slate-300 focus:border-slate-600 focus:ring-slate-600">
                      <SelectValue placeholder="בחר סוג הטבה" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage_discount">הנחה באחוזים</SelectItem>
                      <SelectItem value="value_coupon">קופון ערך מוסף (שלם פחות, קבל יותר)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Conditional Fields Based on Coupon Type */}
                {newDeal.coupon_type === 'value_coupon' ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="coupon_price" className="text-sm">מחיר הקופון *</Label>
                      <Input
                        id="coupon_price"
                        type="number"
                        value={newDeal.coupon_price}
                        onChange={(e) => handleInputChange('coupon_price', e.target.value)}
                        placeholder="50"
                        required
                        className="border-slate-300 focus:border-slate-600 focus:ring-slate-600"
                      />
                      <p className="text-xs text-slate-500">מה שהלקוח ישלם</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="redemption_value" className="text-sm">ערך בעסק *</Label>
                      <Input
                        id="redemption_value"
                        type="number"
                        value={newDeal.redemption_value}
                        onChange={(e) => handleInputChange('redemption_value', e.target.value)}
                        placeholder="80"
                        required
                        className="border-slate-300 focus:border-slate-600 focus:ring-slate-600"
                      />
                      <p className="text-xs text-slate-500">מה שהלקוח יקבל</p>
                    </div>
                  </div>
                ) : ( // percentage_discount
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="original_price" className="text-sm">מחיר מקורי</Label>
                      <Input
                        id="original_price"
                        type="number"
                        value={newDeal.original_price}
                        onChange={(e) => handleInputChange('original_price', e.target.value)}
                        placeholder="100"
                        className="border-slate-300 focus:border-slate-600 focus:ring-slate-600"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="discounted_price" className="text-sm">מחיר מוזל *</Label>
                      <Input
                        id="discounted_price"
                        type="number"
                        value={newDeal.discounted_price}
                        onChange={(e) => handleInputChange('discounted_price', e.target.value)}
                        placeholder="75"
                        required
                        className="border-slate-300 focus:border-slate-600 focus:ring-slate-600"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="expiry_date" className="text-sm">תאריך תפוגה *</Label>
                  <Input
                    id="expiry_date"
                    type="date"
                    value={newDeal.expiry_date}
                    onChange={(e) => handleInputChange('expiry_date', e.target.value)}
                    required
                    className="border-slate-300 focus:border-slate-600 focus:ring-slate-600"
                  />
                </div>

                <div className="pt-4">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#1B5E20] hover:opacity-90 py-3 text-base gap-2 text-white"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                        יוצר הטבה...
                      </>
                    ) : (
                      <>
                        <PlusCircle className="w-5 h-5" />
                        צור הטבה
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
