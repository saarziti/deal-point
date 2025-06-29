
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { User } from "@/api/entities";
import { createPageUrl } from "@/utils";
import LocationProvider from "../components/location/LocationProvider.jsx";
import BottomNavigation from "../components/navigation/BottomNavigation.jsx";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGuestMode, setIsGuestMode] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      try {
        const user = await User.me();
        setCurrentUser(user);
        setIsGuestMode(false);
      } catch (e) {
        setCurrentUser(null);
        // Check if user is in guest mode
        const guestMode = localStorage.getItem("guestMode");
        setIsGuestMode(guestMode === "true");
      }
      setIsLoading(false);
    };
    fetchUser();
  }, [location.pathname]);
  
  return (
    <LocationProvider>
      <style>
        {`
          :root {
            --primary: 26 35 126; /* Navy Blue #1A237E */
            --primary-foreground: 255 255 255;
            --secondary: 27 94 32; /* Dark Green #1B5E20 */
            --secondary-foreground: 255 255 255;
            --accent: 202 138 4; /* Matte Gold #ca8a04 */
            --accent-foreground: 255 255 255;
            --background: 248 250 252; /* Clean Light Background #F8FAFC */
            --foreground: 55 71 79; /* Charcoal Gray #37474F */
            --muted: 241 245 249;
            --muted-foreground: 100 116 139;
            --destructive: 185 28 28;
            --destructive-foreground: 255 255 255;
            --border: 226 232 240;
            --input: 226 232 240;
            --ring: 26 35 126; /* Navy Blue */
            --card: 255 255 255;
            --card-foreground: 55 71 79;
          }
          
          body {
            font-family: 'Inter', 'Segoe UI', 'Roboto', system-ui, sans-serif;
            background-color: #F8FAFC;
            color: #37474F;
            min-height: 100vh;
          }

          .elegant-gradient {
            background-color: #F8FAFC;
          }

          .luxury-gradient {
            background-color: #F8FAFC;
          }

          .premium-gradient, .professional-gradient {
            background: linear-gradient(135deg, #1A237E 0%, #1B5E20 100%);
          }

          .accent-gradient, .gold-accent {
            background: linear-gradient(135deg, #ca8a04 0%, #eab308 100%);
          }

          .navy-gradient {
            background-color: #1A237E;
          }

          .glass-effect {
            backdrop-filter: blur(20px);
            background: rgba(255, 255, 255, 0.95);
            border: 1px solid rgba(55, 71, 79, 0.08);
            box-shadow: 0 8px 32px rgba(55, 71, 79, 0.08);
          }

          .glass-dark {
            backdrop-filter: blur(20px);
            background: rgba(55, 71, 79, 0.95);
            border: 1px solid rgba(255, 255, 255, 0.2);
          }

          .hover-lift {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
          }

          .hover-lift:hover {
            transform: translateY(-4px);
            box-shadow: 0 20px 40px rgba(55, 71, 79, 0.12);
          }

          .luxury-shadow, .elegant-shadow {
            box-shadow: 0 10px 30px rgba(55, 71, 79, 0.08);
          }

          .text-gradient {
            background: linear-gradient(135deg, #1A237E 0%, #1B5E20 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
        `}
      </style>
      <div className="min-h-screen flex flex-col w-full elegant-gradient">
        <main className="flex-1 overflow-y-auto pb-24">
          {children}
        </main>
        <BottomNavigation />
      </div>
    </LocationProvider>
  );
}
