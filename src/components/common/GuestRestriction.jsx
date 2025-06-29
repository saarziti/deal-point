import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { User, Eye, AlertCircle } from "lucide-react";

export default function GuestRestriction({ 
  message = "התחברות נדרשת לביצוע פעולה זו",
  onLogin,
  className = ""
}) {
  return (
    <Alert className={`border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 ${className}`}>
      <AlertCircle className="h-4 w-4 text-amber-600" />
      <AlertDescription className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-amber-700" />
            <span className="font-semibold text-amber-800">מצב אורח</span>
          </div>
          <span className="text-amber-700">{message}</span>
        </div>
        <Button 
          onClick={onLogin}
          size="sm"
          className="bg-amber-600 hover:bg-amber-700 text-white"
        >
          <User className="w-4 h-4 mr-1" />
          התחבר
        </Button>
      </AlertDescription>
    </Alert>
  );
}