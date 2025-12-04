import React, { useState } from "react";
import { Link } from "react-router-dom";
import { LogOut, MessageSquare, Settings, User, Grip, Search, Users } from "lucide-react";
import { useAuthStore } from "../stores/useAuthStore";

const Navbar = () => {
  const {authUser, logout, accessToken} = useAuthStore();
  const isAuthenticated = authUser || accessToken; // Check cả authUser và accessToken
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className=" border-b border-base-300 fixed w-full top-0 z-40 backdrop-blur-lg bg-base-100/80">
      <div className="container mx-auto px-4 h-16">
        <div className="flex items-center justify-between  h-full">
          <div className="flex items-center gap-8">
            <Link
              to="/"
              className="flex items-center gap-2.5 hover:opacity-80 transition-all"
            >
              <div className="size-9 w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-lg font-bold">ChatWave</h1>
            </Link>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            
            {/* Menu Button & Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${
                  isMenuOpen 
                    ? 'bg-primary/20 text-primary' 
                    : 'bg-base-200 hover:bg-base-300'
                }`}
                title="Menu"
              >
                <Grip size={20} />
              </button>

              {/* Dropdown Menu */}
              {isMenuOpen && (
                <>
                  {/* Backdrop to close menu when clicking outside */}
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsMenuOpen(false)}
                  />
                  
                  <div className="absolute top-12 right-0 w-[360px] bg-base-100 rounded-xl shadow-2xl p-4 border border-base-300 z-50 animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                    <h2 className="text-2xl font-bold mb-3">Menu</h2>
                    {/* Section: Social */}
                    <h3 className="font-semibold text-[17px] mb-2">Social</h3>
                    
                    {/* Item: Friends */}
                    <Link 
                      to="/friends"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-start gap-3 p-2 rounded-lg hover:bg-base-200 cursor-pointer transition-all"
                    >
                      {/* Icon */}
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0 mt-1">
                        <Users size={20} className="text-primary-content" />
                      </div>
                      
                      {/* Text */}
                      <div className="flex-1">
                        <h4 className="text-[16px] font-medium leading-snug">Friends</h4>
                        <p className="text-[13px] text-base-content/60 leading-snug mt-1">
                          Search for friends or people you may know.
                        </p>
                      </div>
                    </Link>
                  </div>
                </>
              )}
            </div>

            <Link
              to={"/profile"}
              className={`btn btn-sm gap-2 transition-colors`}
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Profile</span>
            </Link>

            <Link
              to={"/settings"}
              className={`btn btn-sm gap-2 transition-colors`}
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </Link>

            {isAuthenticated && (
              <>
                <button className="flex gap-2 items-center" onClick={logout}>
                  <LogOut className="size-5"/>
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
