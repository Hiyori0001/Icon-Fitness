import React, { useState, useEffect } from 'react';
import { gymMachines, Machine } from "@/data/machines";
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/contexts/SessionContext';
import { toast } from 'sonner';

export const useMachines = () => {
  const { user, isLoading: isSessionLoading } = useSession();
  const [allMachines, setAllMachines] = useState<Machine[]>([]);
  const [isLoadingCustomMachines, setIsLoadingCustomMachines] = useState(true);

  useEffect(() => {
    const fetchCustomMachines = async () => {
      if (isSessionLoading || !user) {
        setIsLoadingCustomMachines(true);
        setAllMachines(gymMachines); // Only show static machines if not logged in or loading
        return;
      }

      setIsLoadingCustomMachines(true);
      const { data, error } = await supabase
        .from('custom_machines')
        .select('id, name, description, price, image_url')
        .eq('user_id', user.id);

      if (error) {
        console.error("Error fetching custom machines:", error);
        toast.error("Failed to load your custom machines.");
        setAllMachines(gymMachines);
      } else {
        const customMachines: Machine[] = data.map(dbMachine => ({
          id: dbMachine.id,
          name: dbMachine.name,
          description: dbMachine.description,
          price: dbMachine.price,
          imageUrl: dbMachine.image_url || "https://via.placeholder.com/150/CCCCCC/000000?text=No+Image",
        }));
        setAllMachines([...gymMachines, ...customMachines]);
      }
      setIsLoadingCustomMachines(false);
    };

    fetchCustomMachines();
  }, [user, isSessionLoading]);

  const addMachine = async (newMachine: Omit<Machine, 'id'>) => {
    if (!user) {
      toast.error("You must be logged in to add custom machines.");
      return;
    }

    const { data, error } = await supabase
      .from('custom_machines')
      .insert({
        user_id: user.id,
        name: newMachine.name,
        description: newMachine.description,
        price: newMachine.price,
        image_url: newMachine.imageUrl,
      })
      .select(); // Removed .single() to ensure we get an array response

    if (error) {
      console.error("Error adding custom machine:", error);
      toast.error(`Failed to add custom machine: ${error.message}`); // Display Supabase error message
      return;
    }

    if (!data || data.length === 0) {
      console.error("Supabase insert returned no data.");
      toast.error("Failed to add custom machine: No data returned from database.");
      return;
    }

    const addedMachineData = data[0]; // Get the first (and only) inserted row

    const addedMachine: Machine = {
      id: addedMachineData.id,
      name: addedMachineData.name,
      description: addedMachineData.description,
      price: addedMachineData.price,
      imageUrl: addedMachineData.image_url || "https://via.placeholder.com/150/CCCCCC/000000?text=No+Image",
    };

    setAllMachines(prevMachines => [...prevMachines, addedMachine]);
    toast.success("Custom machine added successfully!");
  };

  const updateMachine = async (machineId: string, updates: Partial<Machine>) => {
    if (!user) {
      toast.error("You must be logged in to update machines.");
      return;
    }

    // Only update if it's a custom machine (id starts with 'custom-' or is a UUID from DB)
    // Static machines from gymMachines array are not editable.
    const isCustomMachine = allMachines.some(m => m.id === machineId && !gymMachines.some(gm => gm.id === m.id));

    if (!isCustomMachine) {
      toast.error("Only custom machines can be updated.");
      return;
    }

    const { error } = await supabase
      .from('custom_machines')
      .update({
        name: updates.name,
        description: updates.description,
        price: updates.price,
        image_url: updates.imageUrl,
      })
      .eq('id', machineId)
      .eq('user_id', user.id); // Ensure only the owner can update

    if (error) {
      console.error("Error updating custom machine:", error);
      toast.error(`Failed to update custom machine: ${error.message}`); // Display Supabase error message
      return;
    }

    setAllMachines(prevMachines => {
      return prevMachines.map(machine =>
        machine.id === machineId ? { ...machine, ...updates } : machine
      );
    });
    toast.success("Custom machine updated successfully!");
  };

  return { allMachines, addMachine, updateMachine, isLoadingCustomMachines };
};