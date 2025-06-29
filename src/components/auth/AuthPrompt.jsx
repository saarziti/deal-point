import React, { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Star, 
  Phone,
  MessageSquare,
  Mail
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AuthPrompt({ 
  isOpen, 
  onClose, 
  onLogin, 
  onGuestMode,
  isGuestUser = false
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState('options'); // 'options', 'phone', 'verify'
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');

  const handleLoginAction = async () => {
    setIsLoading(true);
    try {
      await onLogin();
    } catch (error) {
      console.error("Authentication error:", error);
    }
    setIsLoading(false);
  };

  const handleSendCode = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      setError("Please enter a valid phone number.");
      return;
    }
    setError("");
    setIsLoading(true);
    // This is a placeholder for the backend integration.
    console.log(`(Placeholder) Sending SMS to ${phoneNumber}`);
    setTimeout(() => {
      setIsLoading(false);
      setStep('verify');
    }, 1500);
  };

  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length < 4) {
      setError("Please enter a valid verification code.");
      return;
    }
    setError("");
    setIsLoading(true);
    // In a real implementation, you'd verify the code here.
    // For now, we proceed with the standard login flow.
    await onLogin();
    setIsLoading(false);
  };

  const resetAndClose = () => {
    onClose();
    // Delay state reset to allow for closing animation
    setTimeout(() => {
      setStep('options');
      setPhoneNumber('');
      setVerificationCode('');
      setError('');
    }, 300);
  };

  const renderContent = () => {
    switch (step) {
      case 'phone':
        return (
          <>
            <h3 className="font-bold text-lg text-center mb-4 text-slate-800">Enter Phone Number</h3>
            <p className="text-sm text-center text-slate-600 mb-6">We will send you a verification code.</p>
            <div className="relative mb-4">
              <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <Input
                placeholder="Phone number (+972...)"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="pl-4 pr-12 h-12 border-2 border-slate-300 rounded-xl bg-slate-50 font-medium text-slate-800"
                type="tel"
              />
            </div>
            {error && <p className="text-red-500 text-sm text-center mb-2">{error}</p>}
            <Button
              onClick={handleSendCode}
              disabled={isLoading}
              className="w-full h-12 bg-[#1B5E20] hover:bg-[#1B5E20]/90 text-white font-bold rounded-xl"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
              ) : (
                "Send Code"
              )}
            </Button>
            <Button variant="link" onClick={() => setStep('options')} className="w-full text-slate-600">
              Back to login options
            </Button>
          </>
        );
      
      case 'verify':
        return (
          <>
            <h3 className="font-bold text-lg text-center mb-4 text-slate-800">Enter Code</h3>
            <p className="text-sm text-center text-slate-600 mb-6">Enter the code sent to {phoneNumber}.</p>
            <div className="relative mb-4">
              <MessageSquare className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <Input
                placeholder="4-6 digit code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="pl-4 pr-12 h-12 border-2 border-slate-300 rounded-xl bg-slate-50 font-medium tracking-widest text-center"
                maxLength={6}
              />
            </div>
            {error && <p className="text-red-500 text-sm text-center mb-2">{error}</p>}
            <Button
              onClick={handleVerifyCode}
              disabled={isLoading}
              className="w-full h-12 bg-[#1A237E] hover:bg-[#1A237E]/90 text-white font-bold rounded-xl"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
              ) : (
                "Verify & Sign In"
              )}
            </Button>
            <Button variant="link" onClick={() => setStep('phone')} className="w-full text-slate-600">
              Back to phone number
            </Button>
          </>
        );

      default: // 'options'
        return (
          <div className="space-y-3">
            <Button 
              onClick={handleLoginAction}
              disabled={isLoading}
              className="w-full h-12 bg-white border-2 border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold rounded-xl flex items-center justify-center gap-3"
            >
               <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
              Continue with Google
            </Button>
            
            <Button 
              onClick={() => setStep('phone')}
              variant="outline"
              className="w-full h-12 border-2 border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold rounded-xl flex items-center justify-center gap-3"
            >
              <Phone className="w-4 h-4" />
              Continue with Phone
            </Button>

            {!isGuestUser && (
              <Button 
                onClick={onGuestMode}
                variant="outline"
                className="w-full h-12 border-2 border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold rounded-xl"
              >
                Continue as Guest
              </Button>
            )}
            
            <div className="text-center pt-6">
              <p className="text-sm text-slate-500 font-medium">
                Guest mode allows browsing only.
                <br />
                Login is required for full access.
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={resetAndClose}>
      <DialogContent className="max-w-sm bg-white rounded-3xl border-0 p-0 overflow-hidden">
        <div className="bg-white p-8">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-center mb-8"
          >
            <div className="w-20 h-20 mx-auto mb-6 bg-[#1A237E] rounded-full flex items-center justify-center shadow-lg">
              <div className="w-12 h-12 bg-[#1B5E20] rounded-full flex items-center justify-center">
                <Star className="w-6 h-6 text-white" />
              </div>
            </div>
            
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              {isGuestUser ? "Login Required" : "Welcome to DealHub"}
            </h1>
            <p className="text-slate-600 font-medium">
              {isGuestUser ? "Please log in to continue" : "Sign in or continue as a guest"}
            </p>
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}