import React, { useState, useEffect } from 'react';
import { gymMachines, Machine } from "@/data/machines";
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/contexts/SessionContext';
import { toast } from 'sonner';

// Extend Machine interface to include original_machine_id for internal tracking
export interface MachineWithOriginalId extends Machine {
  original_machine_id?: string | null;
}

export const useMachines = () => {
  const { user, isLoading: isSessionLoading } = useSession();
  const [allMachines, setAllMachines] = useState<MachineWithOriginalId[]>([]);
  const [isLoadingCustomMachines, setIsLoadingCustomMachines] = useState(true);

  useEffect(() => {
    const fetchAndMergeMachines = async () => {
      setIsLoadingCustomMachines(true);
      let customMachines: MachineWithOriginalId[] = [];

      if (user) {
        const { data, error } = await supabase
          .from('custom_machines')
          .select('id, name, description, price, image_url, original_machine_id')
          .eq('user_id', user.id);

        if (error) {
          console.error("Error fetching custom machines:", error);
          toast.error("Failed to load your custom machines.");
        } else {
          customMachines = data.map(dbMachine => ({
            id: dbMachine.id,
            name: dbMachine.name,
            description: dbMachine.description,
            price: dbMachine.price,
            imageUrl: dbMachine.image_url || "https://via.placeholder.com/150/CCCCCC/000000?text=No+Image",
            original_machine_id: dbMachine.original_machine_id,
          }));
        }
      }

      // Create a map for quick lookup of custom machines by their original_machine_id
      const customMachineOverrides = new Map<string, MachineWithOriginalId>();
      const purelyCustomMachines: MachineWithOriginalId[] = [];

      customMachines.forEach(cm => {
        if (cm.original_machine_id) {
          customMachineOverrides.set(cm.original_machine_id, cm);
        } else {
          purelyCustomMachines.push(cm);
        }
      });

      // Merge gymMachines with custom overrides, maintaining original order
      const mergedMachines = gymMachines.map(gm => {
        if (customMachineOverrides.has(gm.id)) {
          const override = customMachineOverrides.get(gm.id)!;
          return {
            ...gm, // Start with original machine data
            ...override, // Override with custom data
            original_machine_id: gm.id, // Ensure original_machine_id points to the predefined ID
          };
        }
        return gm;
      });

      setAllMachines([...mergedMachines, ...purelyCustomMachines]);
      setIsLoadingCustomMachines(false);
    };

    if (!isSessionLoading) {
      fetchAndMergeMachines();
    }
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
    };

    setAllMachines(prevMachines => [...prevMachines, addedMachine]);
    toast.success("Custom machine added successfully!");
  };

  const updateMachine = async (machineId: string, updates: Partial<Machine>) => {
    if (!user) {
      toast.error("You must be logged in to update machines.");
      return;
    }

    // Determine if the machineId is a UUID (existing custom machine) or a string (predefined gymMachine)
    const isUUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(machineId);

    if (isUUID) {
      // This is an existing custom machine (or a customized predefined machine that now has a UUID)
      const { error } = await supabase
        .from('custom_machines')
        .update(updates)
        .eq('id', machineId)
        .eq('user_id', user.id);

      if (error) {
        console.error("Error updating custom machine:", error);
        toast.error(`Failed to update machine: ${error.message}`);
        return;
      }

      setAllMachines(prevMachines => {
        return prevMachines.map(machine =>
          machine.id === machineId ? { ...machine, ...updates } : machine
        );
      });
      toast.success("Machine updated successfully!");
    } else {
      // This is a predefined machine ID (e.g., "1", "2").
      // We need to either update an existing custom override or create a new one.

      const originalMachine = gymMachines.find(m => m.id === machineId);
      if (!originalMachine) {
        toast.error("Cannot update a machine that does not exist.");
        return;
      }

      // Check if a custom override for this original_machine_id already exists for the user
      const { data: existingCustom, error: fetchError } = await supabase
        .from('custom_machines')
        .select('id')
        .eq('original_machine_id', machineId)
        .eq('user_id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 means "no rows found"
        console.error("Error checking for existing custom machine override:", fetchError);
        toast.error(`Failed to check machine customization: ${fetchError.message}`);
        return;
      }

      if (existingCustom) {
        // An override already exists, update it
        const { error } = await supabase
          .from('custom_machines')
          .update(updates)
          .eq('id', existingCustom.id)
          .eq('user_id', user.id);

        if (error) {
          console.error("Error updating custom override:", error);
          toast.error(`Failed to update machine customization: ${error.message}`);
          return;
        }

        setAllMachines(prevMachines => {
          return prevMachines.map(machine =>
            machine.id === existingCustom.id ? { ...machine, ...updates } : machine
          );
        });
        toast.success("Machine customization updated successfully!");
      } else {
        // No existing override, create a new custom entry for this user
        const { data: insertData, error: insertError } = await supabase
          .from('custom_machines')
          .insert({
            user_id: user.id,
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
        toast.success("Machine customized successfully!");
      }
    }
  };

  return { allMachines, addMachine, updateMachine, isLoadingCustomMachines };
};