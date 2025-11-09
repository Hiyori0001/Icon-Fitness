"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile'; // Assuming this hook exists for responsiveness

const Navbar = () => {
  const isMobile = useIsMobile();

  const navLinks = (
    <>
      <Link to="/" className="text-lg font-medium hover:text-primary transition-colors">
        Home
      </Link>
      <Link to="/about" className="text-lg font-medium hover:text-primary transition-colors">
        About
      </Link>
      <Link to="/brochure-generator" className="text-lg font-medium hover:text-primary transition-colors">
        Brochure Generator
      </Link>
      <Link to="/add-machine">
        <Button className="text-lg px-6 py-2">Add Custom Machine</Button>
      </Link>
    </>
  );

  return (
    <nav className="bg-white shadow-md p-4 sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-primary">
          Icon Fitness
        </Link>

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
              </div>
            </SheetContent>
          </Sheet>
        ) : (
          <div className="flex items-center space-x-6">
            {navLinks}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;