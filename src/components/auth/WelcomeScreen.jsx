import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Star, 
  Eye, 
  Shield,
  Phone,
  Mail,
  Lock,
  CheckCircle,
  TrendingUp,
  Gift
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function WelcomeScreen() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkCurrentUser();
  }, []);

  const checkCurrentUser = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);
      // If user is already logged in, redirect to homepage
      navigate(createPageUrl("Homepage"));
    } catch (error) {
      // User not logged in, stay on welcome screen
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await User.login();
    } catch (error) {
      console.error("Google login error:", error);
    }
    setIsLoading(false);
  };

  const handleFacebookLogin = async () => {
    setIsLoading(true);
    try {
      await User.login();
    } catch (error) {
      console.error("Facebook login error:", error);
    }
    setIsLoading(false);
  };

  const handlePhoneLogin = async () => {
    if (!phoneNumber) return;
    setIsLoading(true);
    try {
      await User.login();
    } catch (error) {
      console.error("Phone login error:", error);
    }
    setIsLoading(false);
  };

  const handleEmailLogin = async () => {
    if (!phoneNumber || !password) return;
    setIsLoading(true);
    try {
      await User.login();
    } catch (error) {
      console.error("Email login error:", error);
    }
    setIsLoading(false);
  };

  const handleGuestMode = () => {
    localStorage.setItem("guestMode", "true");
    navigate(createPageUrl("Homepage"));
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <Card className="bg-white rounded-3xl border-0 shadow-xl overflow-hidden">
          <CardContent className="p-8">
            {/* Logo and Header */}
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-center mb-8"
            >
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-slate-800 to-slate-900 rounded-full flex items-center justify-center shadow-lg">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                  <Star className="w-6 h-6 text-white" />
                </div>
              </div>
              
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Welcome to DEAL POINT</h1>
              <p className="text-slate-600 font-medium">Sign in to continue</p>
            </motion.div>

            <div className="space-y-4">
              {/* Google Login Button */}
              <Button 
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full h-12 bg-white border-2 border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold rounded-xl flex items-center justify-center gap-3"
              >
                <div className="w-5 h-5 bg-gradient-to-r from-blue-500 via-green-500 via-yellow-500 to-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">G</span>
                </div>
                Continue with Google
              </Button>

              {/* OR Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-slate-500 font-medium">OR</span>
                </div>
              </div>

              {/* Phone Number Input */}
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <Input
                  placeholder="Phone number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="pl-12 h-12 border-2 border-slate-300 focus:border-slate-600 rounded-xl bg-slate-50 font-medium"
                />
              </div>

              {/* Password Input */}
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-12 h-12 border-2 border-slate-300 focus:border-slate-600 rounded-xl bg-slate-50 font-medium"
                />
              </div>

              {/* Sign In Button */}
              <Button 
                onClick={handleEmailLogin}
                disabled={isLoading || !phoneNumber || !password}
                className="w-full h-12 bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 text-white font-bold rounded-xl"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                ) : (
                  "Sign in"
                )}
              </Button>

              {/* Facebook Login Button */}
              <Button 
                onClick={handleFacebookLogin}
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold rounded-xl flex items-center justify-center gap-3"
              >
                <div className="w-5 h-5 bg-white rounded flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-sm">f</span>
                </div>
                Continue with Facebook
              </Button>

              {/* Continue as Guest Button */}
              <Button 
                onClick={handleGuestMode}
                variant="outline"
                className="w-full h-12 border-2 border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold rounded-xl"
              >
                Continue as Guest
              </Button>

              {/* Guest Mode Info */}
              <div className="text-center pt-2">
                <p className="text-sm text-slate-500 font-medium">
                  You can explore as a guest,<br />
                  but purchases require login
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Benefits Preview */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-sm font-bold text-slate-800">2% Cashback</span>
            </div>
            <p className="text-xs text-slate-600">על כל רכישה</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Gift className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-bold text-slate-800">הטבות VIP</span>
            </div>
            <p className="text-xs text-slate-600">ועסקאות בלעדיות</p>
          </div>
        </div>
      </div>
    </div>
  );
}