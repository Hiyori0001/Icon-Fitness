"use client";

import React from 'react';
import { useSession } from '@/contexts/SessionContext';
import { supabase } from '@/integrations/supabase/client';

export const useAdmin = () => {
  const { session, isLoading: isSessionLoading } = useSession();
  const [isAdmin, setIsAdmin] = React.useState<boolean>(false);
  const [isLoadingAdmin, setIsLoadingAdmin] = React.useState<boolean>(true);

  React.useEffect(() => {
    const checkAdminStatus = async () => {
      if (isSessionLoading) {
        setIsLoadingAdmin(true);
        return;
      }

      if (session?.user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', session.user.id)
          .single();

        if (error) {
          console.error('Error fetching admin status:', error);
          setIsAdmin(false);
        } else {
          setIsAdmin(data?.is_admin || false);
        }
      } else {
        setIsAdmin(false);
      }
      setIsLoadingAdmin(false);
    };

    checkAdminStatus();
  }, [session, isSessionLoading]);

  return { isAdmin, isLoadingAdmin };
};