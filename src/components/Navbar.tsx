"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, LogOut, KeyRound } from 'lucide-react'; // Import KeyRound icon
import { useIsMobile } from '@/hooks/use-mobile';
import { useSession } from '@/contexts/SessionContext';
import { useAdmin } from '@/hooks/useAdmin';

const Navbar = () => {
  const isMobile = useIsMobile();
  const { session, signOut, isLoading: isSessionLoading } = useSession();
  const { isAdmin, isLoadingAdmin } = useAdmin();

  const navLinks = (
    <>
      <Link to="/" className="text-lg font-medium hover:text-primary transition-colors">
        Home
      </Link>
      <Link to="/about" className="text-lg font-medium hover:text-primary transition-colors">
        About
      </Link>
      {session && (
        <Link to="/brochure-generator" className="text-lg font-medium hover:text-primary transition-colors">
          Brochure Generator
        </Link>
      )}
      {session && isAdmin && (
        <Link to="/add-machine">
          <Button className="text-lg px-6 py-2">Add Custom Machine</Button>
        </Link>
      )}
    </>
  );

  return (
    <nav className="bg-white shadow-md p-4 sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-primary">
          Icon Fitness
        </Link>

        <div className="flex items-center space-x-4">
          {isMobile ? (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex flex-col space-y-4 mt-6">
                  {navLinks}
                  {!isSessionLoading && session && (
                    <>
                      <Link to="/update-password">
                        <Button variant="ghost" className="text-lg px-6 py-2 justify-start w-full">
                          <KeyRound className="mr-2 h-5 w-5" /> Update Password
                        </Button>
                      </Link>
                      <Button onClick={signOut} variant="ghost" className="text-lg px-6 py-2 justify-start w-full">
                        <LogOut className="mr-2 h-5 w-5" /> Sign Out
                      </Button>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          ) : (
            <div className="flex items-center space-x-6">
              {navLinks}
              {!isSessionLoading && session && (
                <>
                  <Link to="/update-password">
                    <Button variant="ghost" className="text-lg px-6 py-2">
                      <KeyRound className="mr-2 h-5 w-5" /> Update Password
                    </Button>
                  </Link>
                  <Button onClick={signOut} variant="ghost" className="text-lg px-6 py-2">
                    <LogOut className="mr-2 h-5 w-5" /> Sign Out
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;