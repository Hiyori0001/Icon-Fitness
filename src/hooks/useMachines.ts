import React, { useState, useEffect } from 'react';
import { gymMachines, Machine } from "@/data/machines";
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/contexts/SessionContext';
import { toast } from 'sonner';

// Extend Machine interface to include original_machine_id for internal tracking
export interface MachineWithOriginalId extends Machine {
  original_machine_id?: string | null;
  is_global?: boolean; // Added for UI representation, not directly stored in DB as a column
  user_id?: string | null; // Added to store the user_id from custom_machines table
}

export const useMachines = () => {
  const { user, isLoading: isSessionLoading } = useSession();
  const [allMachines, setAllMachines] = useState<MachineWithOriginalId[]>([]);
  const [isLoadingCustomMachines, setIsLoadingCustomMachines] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // New state to trigger re-fetch

  useEffect(() => {
    const fetchAndMergeMachines = async () => {
      setIsLoadingCustomMachines(true);
      let customMachinesFromDb: MachineWithOriginalId[] = [];

      // Fetch all custom machines relevant to the current user (global + user-specific)
      let query = supabase
        .from('custom_machines')
        .select('id, name, description, price, image_url, original_machine_id, user_id');

      if (user) {
        // If logged in, fetch global machines (user_id IS NULL) and user's own machines
        query = query.or(`user_id.is.null,user_id.eq.${user.id}`);
      } else {
        // If not logged in, only fetch global machines (user_id IS NULL)
        query = query.is('user_id', null);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching custom machines:", error);
        toast.error("Failed to load machine customizations.");
      } else {
        customMachinesFromDb = data.map(dbMachine => ({
          id: dbMachine.id,
          name: dbMachine.name,
          description: dbMachine.description,
          price: dbMachine.price,
          imageUrl: dbMachine.image_url || "https://via.placeholder.com/150/CCCCCC/000000?text=No+Image",
          original_machine_id: dbMachine.original_machine_id,
          is_global: dbMachine.user_id === null, // Determine is_global based on user_id
          user_id: dbMachine.user_id, // Keep user_id for internal logic
        }));
      }

      const globalOverrides = new Map<string, MachineWithOriginalId>(); // Key: original_machine_id
      const userOverrides = new Map<string, MachineWithOriginalId>();   // Key: original_machine_id
      const purelyGlobalMachines: MachineWithOriginalId[] = [];
      const purelyUserMachines: MachineWithOriginalId[] = [];

      customMachinesFromDb.forEach(cm => {
        if (cm.original_machine_id) {
          if (cm.is_global) {
            globalOverrides.set(cm.original_machine_id, cm);
          } else if (user && cm.user_id === user.id) { // Ensure it's the current user's override
            userOverrides.set(cm.original_machine_id, cm);
          }
        } else {
          if (cm.is_global) {
            purelyGlobalMachines.push(cm);
          } else if (user && cm.user_id === user.id) { // Ensure it's the current user's purely custom machine
            purelyUserMachines.push(cm);
          }
        }
      });

      // Start with predefined machines
      const mergedMachines: MachineWithOriginalId[] = gymMachines.map(gm => {
        let currentMachine: MachineWithOriginalId = { ...gm, is_global: false }; // Default to not global

        // Apply global override if it exists for this predefined machine
        if (globalOverrides.has(gm.id)) {
          const override = globalOverrides.get(gm.id)!;
          currentMachine = {
            ...currentMachine,
            id: override.id, // Use the custom machine's UUID as the primary ID for display
            name: override.name,
            description: override.description,
            price: override.price,
            imageUrl: override.imageUrl,
            original_machine_id: gm.id, // Ensure original_machine_id points to the predefined ID
            is_global: true, // Mark as globally overridden
          };
        }

        // Apply user override if it exists (takes precedence over global and predefined)
        if (user && userOverrides.has(gm.id)) {
          const override = userOverrides.get(gm.id)!;
          currentMachine = {
            ...currentMachine,
            id: override.id, // Use the user's custom machine UUID
            name: override.name,
            description: override.description,
            price: override.price,
            imageUrl: override.imageUrl,
            original_machine_id: gm.id, // Still points to the predefined ID
            is_global: false, // User override is never global
          };
        }
        return currentMachine;
      });

      // Add purely global and purely user-specific custom machines
      const finalMachines = [
        ...mergedMachines,
        ...purelyGlobalMachines,
        ...purelyUserMachines,
      ];

      setAllMachines(finalMachines);
      setIsLoadingCustomMachines(false);
    };

    if (!isSessionLoading) {
      fetchAndMergeMachines();
    }
  }, [user, isSessionLoading, refreshTrigger]); // Add refreshTrigger to dependencies

  const addMachine = async (newMachine: Omit<Machine, 'id'>, isGlobal: boolean) => {
    if (!user) {
      toast.error("You must be logged in to add custom machines.");
      return;
    }

    const userId = isGlobal ? null : user.id;

    const { data, error } = await supabase
      .from('custom_machines')
      .insert({
        user_id: userId,
        name: newMachine.name,
        description: newMachine.description,
        price: newMachine.price,
        image_url: newMachine.imageUrl,
        original_machine_id: null, // Purely new custom machines don't have an original_machine_id
      })
      .select();

    if (error) {
      console.error("Error adding custom machine:", error);
      toast.error(`Failed to add custom machine: ${error.message}`);
      return;
    }

    if (!data || data.length === 0) {
      console.error("Supabase insert returned no data.");
      toast.error("Failed to add custom machine: No data returned from database.");
      return;
    }

    // Trigger a re-fetch to ensure all machines are correctly merged and displayed
    setRefreshTrigger(prev => prev + 1); 
    toast.success(`Custom machine ${isGlobal ? 'globally' : 'personally'} added successfully!`);
  };

  const updateMachine = async (machineId: string, updates: Partial<Machine>, isGlobalUpdate: boolean) => {
    if (!user) {
      toast.error("You must be logged in to update machines.");
      return;
    }

    const isUUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(machineId);

    if (isUUID) {
      // This is an existing custom machine (either global or user-specific)
      const targetUserId = isGlobalUpdate ? null : user.id; 

      const { error } = await supabase
        .from('custom_machines')
        .update(updates)
        .eq('id', machineId)
        .is('user_id', targetUserId); // Ensure we update the correct scope

      if (error) {
        console.error("Error updating custom machine:", error);
        toast.error(`Failed to update machine: ${error.message}`);
        return;
      }

      // Trigger a re-fetch to ensure all machines are correctly merged and displayed
      setRefreshTrigger(prev => prev + 1); 
      toast.success(`Machine ${isGlobalUpdate ? 'global' : 'personal'} customization updated successfully!`);
    } else {
      // This is a predefined machine ID (e.g., "1", "2").
      // We need to either update an existing custom override or create a new one.

      const originalMachine = gymMachines.find(m => m.id === machineId);
      if (!originalMachine) {
        toast.error("Cannot update a machine that does not exist.");
        return;
      }

      const targetUserId = isGlobalUpdate ? null : user.id;

      // Check if a custom override for this original_machine_id already exists for the target scope
      const { data: existingCustom, error: fetchError } = await supabase
        .from('custom_machines')
        .select('id')
        .eq('original_machine_id', machineId)
        .is('user_id', targetUserId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 means "no rows found"
        console.error("Error checking for existing custom machine override:", fetchError);
        toast.error(`Failed to check machine customization: ${fetchError.message}`);
        return;
      }

      if (existingCustom) {
        // An override already exists for this scope, update it
        const { error } = await supabase
          .from('custom_machines')
          .update(updates)
          .eq('id', existingCustom.id)
          .is('user_id', targetUserId);

        if (error) {
          console.error("Error updating custom override:", error);
          toast.error(`Failed to update machine customization: ${error.message}`);
          return;
        }

        // Trigger a re-fetch
        setRefreshTrigger(prev => prev + 1); 
        toast.success(`Machine ${isGlobalUpdate ? 'global' : 'personal'} customization updated successfully!`);
      } else {
        // No existing override for this scope, create a new custom entry
        const { data: insertData, error: insertError } = await supabase
          .from('custom_machines')
          .insert({
            user_id: targetUserId,
            name: updates.name || originalMachine.name,
            description: updates.description || originalMachine.description,
            price: updates.price || originalMachine.price,
            image_url: updates.imageUrl || originalMachine.imageUrl,
            original_machine_id: machineId, // Link to the original predefined machine
          })
          .select();

        if (insertError) {
          console.error("Error creating custom version of machine:", insertError);
          toast.error(`Failed to customize machine: ${insertError.message}`);
          return;
        }

        if (!insertData || insertData.length === 0) {
          console.error("Supabase insert returned no data for customization.");
          toast.error("Failed to customize machine: No data returned from database.");
          return;
        }

        // Trigger a re-fetch
        setRefreshTrigger(prev => prev + 1); 
        toast.success(`Machine ${isGlobalUpdate ? 'globally' : 'personally'} customized successfully!`);
      }
    }
  };

  const deleteMachine = async (machineId: string, isCustomizedPredefined: boolean, isGlobal: boolean) => {
    if (!user) {
      toast.error("You must be logged in to delete machines.");
      return;
    }

    const targetUserId = isGlobal ? null : user.id;

    const { error } = await supabase
      .from('custom_machines')
      .delete()
      .eq('id', machineId)
      .is('user_id', targetUserId);

    if (error) {
      console.error("Error deleting custom machine:", error);
      toast.error(`Failed to delete machine: ${error.message}`);
      return;
    }

    // Trigger a re-fetch to ensure all machines are correctly merged and displayed
    setRefreshTrigger(prev => prev + 1); 
    toast.success(`Machine ${isCustomizedPredefined ? 'customization reverted' : 'deleted'} successfully!`);
  };

  return { allMachines, addMachine, updateMachine, deleteMachine, isLoadingCustomMachines };
};