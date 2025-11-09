"use client";

import React from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSession } from '@/contexts/SessionContext';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input'; // Import shadcn Input for non-password fields
import { PasswordInputWithToggle } from '@/components/PasswordInputWithToggle'; // Import custom password input

const Login: React.FC = () => {
  const { session, isLoading } = useSession();
  const navigate = useNavigate();

  // If already logged in and not loading, redirect to home
  React.useEffect(() => {
    if (!isLoading && session) {
      navigate('/');
    }
  }, [session, isLoading, navigate]);

  if (isLoading || session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-lg text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary">Sign In to Icon Fitness</CardTitle>
        </CardHeader>
        <CardContent>
          <Auth
            supabaseClient={supabase}
            providers={[]} // You can add 'google', 'github', etc. here if desired
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: 'hsl(var(--primary))',
                    brandAccent: 'hsl(var(--primary-foreground))',
                  },
                },
              },
            }}
            theme="light"
            redirectTo={window.location.origin + '/'} // Redirect to home after successful auth
            components={{
              Input: (props) => {
                // Use our custom PasswordInputWithToggle for password fields
                if (props.type === 'password') {
                  return <PasswordInputWithToggle {...props} />;
                }
                // Use the default shadcn Input for all other types
                return <Input {...props} />;
              },
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;