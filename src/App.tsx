import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { StrictMode } from "react";
import Index from "./pages/Index";
import Intro from "./pages/Intro";
import Auth from "./pages/Auth";

const queryClient = new QueryClient();

function App() {
  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Intro />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/game" element={<Index />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </StrictMode>
  );
}

export default App;