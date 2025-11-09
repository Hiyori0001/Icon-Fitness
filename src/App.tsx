import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import About from "./pages/About";
import BrochureGenerator from "./pages/BrochureGenerator";
import AddMachine from "./pages/AddMachine";
import Navbar from "./components/Navbar";
import Login from "./pages/Login"; // Import the Login page
import { SessionContextProvider } from "./contexts/SessionContext"; // Import the SessionContextProvider
import ProtectedRoute from "./components/ProtectedRoute"; // Import ProtectedRoute

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SessionContextProvider> {/* Wrap the entire app with SessionContextProvider */}
          <Navbar />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Login />} /> {/* Add the Login route */}

            {/* Protected routes for authenticated users */}
            <Route element={<ProtectedRoute />}>
              <Route path="/brochure-generator" element={<BrochureGenerator />} />
            </Route>

            {/* Protected routes for admin users */}
            <Route element={<ProtectedRoute adminOnly />}>
              <Route path="/add-machine" element={<AddMachine />} />
            </Route>

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </SessionContextProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;