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
import Login from "./pages/Login";
import UpdatePassword from "./pages/UpdatePassword"; // Import the new UpdatePassword page
import { SessionContextProvider } from "./contexts/SessionContext";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SessionContextProvider>
          <Navbar />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Login />} />

            {/* Protected routes for authenticated users */}
            <Route element={<ProtectedRoute />}>
              <Route path="/brochure-generator" element={<BrochureGenerator />} />
              <Route path="/update-password" element={<UpdatePassword />} /> {/* Add the UpdatePassword route */}
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