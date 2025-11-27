import React, { useState, useEffect } from 'react';
import { gymMachines, Machine } from "@/data/machines";
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/contexts/SessionContext';
import { toast } from 'sonner';

// Extend Machine interface to include original_machine_id for internal tracking
export interface MachineWithOriginalId extends Machine {
  original_machine_id?: string | null;
  is_global?: boolean; // Added for UI representation, not directly stored in DB as a column
}

export const useMachines = () => {
  const { user, isLoading: isSessionLoading } = useSession();
  const [allMachines, setAllMachines] = useState<MachineWithOriginalId[]>([]);
  const [isLoadingCustomMachines, setIsLoadingCustomMachines] = useState(true);

  useEffect(() => {
    const fetchAndMergeMachines = async () => {
      setIsLoadingCustomMachines(true);
      let globalCustomMachines: MachineWithOriginalId[] = [];
      let userCustomMachines: MachineWithOriginalId[] = [];

      // Fetch global custom machines (user_id IS NULL)
      const { data: globalData, error: globalError } = await supabase
        .from('custom_machines')
        .select('id, name, description, price, image_url, original_machine_id')
        .is('user_id', null);

      if (globalError) {
        console.error("Error fetching global custom machines:", globalError);
        toast.error("Failed to load global machine customizations.");
      } else {
        globalCustomMachines = globalData.map(dbMachine => ({
          id: dbMachine.id,
          name: dbMachine.name,
          description: dbMachine.description,
          price: dbMachine.price,
          imageUrl: dbMachine.image_url || "https://via.placeholder.com/150/CCCCCC/000000?text=No+Image",
          original_machine_id: dbMachine.original_machine_id,
          is_global: true,
        }));
      }

      // Fetch user-specific custom machines (user_id = current_user_id)
      if (user) {
        const { data: userData, error: userError } = await supabase
          .from('custom_machines')
          .select('id, name, description, price, image_url, original_machine_id')
          .eq('user_id', user.id);

        if (userError) {
          console.error("Error fetching user custom machines:", userError);
          toast.error("Failed to load your personal custom machines.");
        } else {
          userCustomMachines = userData.map(dbMachine => ({
            id: dbMachine.id,
            name: dbMachine.name,
            description: dbMachine.description,
            price: dbMachine.price,
            imageUrl: dbMachine.image_url || "https://via.placeholder.com/150/CCCCCC/000000?text=No+Image",
            original_machine_id: dbMachine.original_machine_id,
            is_global: false,
          }));
        }
      }

      // Create maps for quick lookup
      const globalOverrides = new Map<string, MachineWithOriginalId>(); // Key: original_machine_id or custom_id
      const userOverrides = new Map<string, MachineWithOriginalId>(); // Key: original_machine_id or custom_id
      const purelyGlobalMachines: MachineWithOriginalId[] = [];
      const purelyUserMachines: MachineWithOriginalId[] = [];

      globalCustomMachines.forEach(cm => {
        if (cm.original_machine_id) {
          globalOverrides.set(cm.original_machine_id, cm);
        } else {
          purelyGlobalMachines.push(cm);
        }
      });

      userCustomMachines.forEach(cm => {
        if (cm.original_machine_id) {
          userOverrides.set(cm.original_machine_id, cm);
        } else {
          purelyUserMachines.push(cm);
        }
      });

      // Merge gymMachines with global overrides, then with user overrides
      const mergedMachines = gymMachines.map(gm => {
        let currentMachine = { ...gm, is_global: false }; // Default to not global

        // Apply global override if exists
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

        // Apply user override if exists (takes precedence over global)
        if (userOverrides.has(gm.id)) {
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
  }, [user, isSessionLoading]);

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

    const addedMachineData = data[0];
    const addedMachine: MachineWithOriginalId = {
      id: addedMachineData.id,
      name: addedMachineData.name,
      description: addedMachineData.description,
      price: addedMachineData.price,
      imageUrl: addedMachineData.image_url || "https://via.placeholder.com/150/CCCCCC/000000?text=No+Image",
      original_machine_id: addedMachineData.original_machine_id,
      is_global: isGlobal,
    };

    setAllMachines(prevMachines => [...prevMachines, addedMachine]);
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
      const targetUserId = isGlobalUpdate ? null : user.id; // If global update, target user_id=NULL, else current user

      const { error } = await supabase
        .from('custom_machines')
        .update(updates)
        .eq('id', machineId)
        .eq('user_id', targetUserId); // Ensure we update the correct scope

      if (error) {
        console.error("Error updating custom machine:", error);
        toast.error(`Failed to update machine: ${error.message}`);
        return;
      }

      setAllMachines(prevMachines => {
        return prevMachines.map(machine =>
          machine.id === machineId ? { ...machine, ...updates, is_global: isGlobalUpdate } : machine
        );
      });
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

        setAllMachines(prevMachines => {
          return prevMachines.map(machine =>
            machine.id === existingCustom.id ? { ...machine, ...updates, is_global: isGlobalUpdate } : machine
          );
        });
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

        const customizedMachineData = insertData[0];
        const customizedMachine: MachineWithOriginalId = {
          id: customizedMachineData.id, // This will be a new UUID
          name: customizedMachineData.name,
          description: customizedMachineData.description,
          price: customizedMachineData.price,
          imageUrl: customizedMachineData.image_url || "https://via.placeholder.com/150/CCCCCC/000000?text=No+Image",
          original_machine_id: customizedMachineData.original_machine_id,
          is_global: isGlobalUpdate,
        };

        // Find the index of the original predefined machine and replace it
        setAllMachines(prevMachines => {
          const index = prevMachines.findIndex(m => m.id === machineId);
          if (index !== -1) {
            const newMachines = [...prevMachines];
            newMachines[index] = customizedMachine;
            return newMachines;
          }
          return [...prevMachines, customizedMachine]; // Fallback if not found (shouldn't happen for predefined)
        });
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

    if (isCustomizedPredefined) {
      // If it's a customized predefined machine, delete the custom override
      const { error } = await supabase
        .from('custom_machines')
        .delete()
        .eq('id', machineId)
        .is('user_id', targetUserId); // Ensure we delete the correct scope

      if (error) {
        console.error("Error reverting custom machine:", error);
        toast.error(`Failed to revert customization: ${error.message}`);
        return;
      }

      // Revert to the original predefined machine in the state
      setAllMachines(prevMachines => {
        const originalMachine = gymMachines.find(gm => gm.id === prevMachines.find(pm => pm.id === machineId)?.original_machine_id);
        if (originalMachine) {
          return prevMachines.map(m => m.id === machineId ? originalMachine : m);
        }
        return prevMachines.filter(m => m.id !== machineId); // Should not happen for predefined
      });
      toast.success(`Machine ${isGlobal ? 'global' : 'personal'} customization reverted successfully!`);
    } else {
      // If it's a purely custom machine, delete it entirely
      const { error } = await supabase
        .from('custom_machines')
        .delete()
        .eq('id', machineId)
        .is('user_id', targetUserId); // Ensure we delete the correct scope

      if (error) {
        console.error("Error deleting custom machine:", error);
        toast.error(`Failed to delete custom machine: ${error.message}`);
        return;
      }

      setAllMachines(prevMachines => prevMachines.filter(machine => machine.id !== machineId));
      toast.success(`Custom machine ${isGlobal ? 'globally' : 'personally'} deleted successfully!`);
    }
  };

  return { allMachines, addMachine, updateMachine, deleteMachine, isLoadingCustomMachines };
};