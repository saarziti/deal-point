import Layout from "./Layout.jsx";

import Homepage from "./Homepage";

import Search from "./Search";

import Deal from "./Deal";

import Profile from "./Profile";

import Business from "./Business";

import BusinessPage from "./BusinessPage";

import MyCoupons from "./MyCoupons";

import Favorites from "./Favorites";

import RedeemCoupon from "./RedeemCoupon";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Homepage: Homepage,
    
    Search: Search,
    
    Deal: Deal,
    
    Profile: Profile,
    
    Business: Business,
    
    BusinessPage: BusinessPage,
    
    MyCoupons: MyCoupons,
    
    Favorites: Favorites,
    
    RedeemCoupon: RedeemCoupon,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Homepage />} />
                
                
                <Route path="/Homepage" element={<Homepage />} />
                
                <Route path="/Search" element={<Search />} />
                
                <Route path="/Deal" element={<Deal />} />
                
                <Route path="/Profile" element={<Profile />} />
                
                <Route path="/Business" element={<Business />} />
                
                <Route path="/BusinessPage" element={<BusinessPage />} />
                
                <Route path="/MyCoupons" element={<MyCoupons />} />
                
                <Route path="/Favorites" element={<Favorites />} />
                
                <Route path="/RedeemCoupon" element={<RedeemCoupon />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}