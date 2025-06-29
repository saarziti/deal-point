import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Building2, User, Search } from "lucide-react";
import { createPageUrl } from "@/utils";

const navigationItems = [
  {
    id: "home",
    title: "בית",
    icon: Home,
    url: createPageUrl("Homepage"),
  },
  {
    id: "businesses",
    title: "עסקים",
    icon: Building2,
    url: createPageUrl("Business"),
  },
  {
    id: "profile",
    title: "פרופיל",
    icon: User,
    url: createPageUrl("Profile"),
  },
  {
    id: "search",
    title: "חיפוש",
    icon: Search,
    url: createPageUrl("Search"),
  },
];

export default function BottomNavigation() {
  const location = useLocation();

  const isActive = (url) => {
    if (url === createPageUrl("Homepage")) {
      return location.pathname === "/" || location.pathname === createPageUrl("Homepage");
    }
    return location.pathname.startsWith(url);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto px-2">
        {navigationItems.map((item) => {
          const IconComponent = item.icon;
          const active = isActive(item.url);
          
          return (
            <Link
              key={item.id}
              to={item.url}
              className="flex flex-col items-center justify-center py-2 min-w-0 flex-1 h-full"
            >
              <div className={`p-2 rounded-xl transition-all duration-300 ${
                active 
                  ? 'bg-[#1A237E] text-white shadow-lg' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}>
                <IconComponent className={`w-5 h-5 transition-transform duration-300 ${active ? 'scale-110' : ''}`} />
              </div>
              <span className={`text-xs font-medium mt-1 transition-colors duration-300 ${
                active ? 'text-[#1A237E]' : 'text-slate-500'
              }`}>
                {item.title}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}