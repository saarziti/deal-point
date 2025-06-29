
import React, { useState, useEffect } from "react";
import { User, UserCoupon, Transaction } from "@/api/entities"; // Added UserCoupon and Transaction
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  User as UserIcon,
  Star,
  TrendingUp,
  Heart,
  History,
  Settings,
  Gift, // Ensure Gift is imported for the new section
  MapPin,
  Calendar,
  Award,
  CreditCard,
  LogOut,
  ChevronLeft // Add ChevronLeft
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from 'date-fns'; // Added for date formatting

export default function ProfilePage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userCoupons, setUserCoupons] = useState([]); // New state for user coupons
  const [recentTransactions, setRecentTransactions] = useState([]); // New state for recent transactions

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setIsLoading(true);
    try {
      const user = await User.me();
      setCurrentUser(user);

      // Load user coupons
      // Assuming UserCoupon.filter takes query, orderBy, and limit
      const coupons = await UserCoupon.filter({ user_email: user.email }, '-purchase_date', 10);
      setUserCoupons(coupons);

      // Load recent transactions
      // Assuming Transaction.filter takes query, orderBy, and limit
      const transactions = await Transaction.filter({ user_email: user.email }, '-created_date', 5);
      setRecentTransactions(transactions);

    } catch (error) {
      console.error("Error loading user data:", error);
      // Redirect to built-in login if not authenticated or error
      await User.login();
    }
    setIsLoading(false);
  };

  const handleLogout = async () => {
    await User.logout();
    localStorage.removeItem("guestMode");
    window.location.reload();
  };

  if (isLoading) {
    return (
      <div className="elegant-gradient min-h-screen p-4">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="h-32 bg-slate-200 rounded-lg"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-24 bg-slate-200 rounded-lg"></div>
            <div className="h-24 bg-slate-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="elegant-gradient min-h-screen p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-slate-900">הפרופיל שלי</h1>

        {/* User Info Card */}
        <Card className="glass-effect border-slate-200 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-slate-900">
              <div className="w-12 h-12 premium-gradient rounded-xl flex items-center justify-center">
                <UserIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-lg">{currentUser?.full_name || "משתמש DEAL POINT"}</span>
                <p className="text-sm text-slate-600 font-normal">{currentUser?.email}</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <Card className="bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200">
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Star className="w-5 h-5 text-yellow-600" />
                    <span className="text-sm font-bold text-yellow-800">DealPoints</span>
                  </div>
                  <p className="text-2xl font-bold text-yellow-700">{currentUser?.total_points || 0}</p>
                  <p className="text-xs text-yellow-600 mt-1">נקודות זמינות</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-bold text-green-800">סה"כ חיסכון</span>
                  </div>
                  <p className="text-2xl font-bold text-green-700">₪{currentUser?.total_savings || 0}</p>
                  <p className="text-xs text-green-600 mt-1">חסכת עד כה</p>
                </CardContent>
              </Card>
            </div>

            {/* User Status */}
            <div className="flex items-center gap-2 mb-4">
              <Badge className="bg-slate-100 text-slate-800 border-slate-300">
                <Award className="w-3 h-3 mr-1" />
                חבר רגיל
              </Badge>
              {currentUser?.city && (
                <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                  <MapPin className="w-3 h-3 mr-1" />
                  {currentUser.city}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="space-y-1">
          <Link to={createPageUrl("MyCoupons")}>
            <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 p-2 rounded-lg"><History className="w-5 h-5 text-blue-600" /></div>
                <span className="font-semibold text-slate-800">היסטוריית רכישות</span>
              </div>
              <ChevronLeft className="w-5 h-5 text-slate-400" />
            </div>
          </Link>

          <Link to={createPageUrl("Favorites")}>
            <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="bg-red-100 p-2 rounded-lg"><Heart className="w-5 h-5 text-red-600" /></div>
                <span className="font-semibold text-slate-800">הטבות שמורות</span>
              </div>
              <ChevronLeft className="w-5 h-5 text-slate-400" />
            </div>
          </Link>

          <Link to={createPageUrl("Business")}>
             <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="bg-purple-100 p-2 rounded-lg"><Gift className="w-5 h-5 text-purple-600" /></div>
                <span className="font-semibold text-slate-800">לבעלי עסקים</span>
              </div>
              <ChevronLeft className="w-5 h-5 text-slate-400" />
            </div>
          </Link>

          <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="bg-slate-100 p-2 rounded-lg"><Settings className="w-5 h-5 text-slate-600" /></div>
              <span className="font-semibold text-slate-800">הגדרות חשבון</span>
            </div>
            <ChevronLeft className="w-5 h-5 text-slate-400" />
          </div>
        </div>

        {/* Logout Button */}
        <div className="mt-6">
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full justify-center gap-3 border-red-200 bg-red-50 text-red-700 hover:bg-red-100 h-12"
          >
            <LogOut className="w-5 h-5" />
            התנתק מהחשבון
          </Button>
        </div>
      </div>
    </div>
  );
}
