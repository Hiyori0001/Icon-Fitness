import React, { useState, useEffect } from 'react';
import { gymMachines, Machine } from "@/data/machines";

const LOCAL_STORAGE_KEY = 'customGymMachines';

export const useMachines = () => {
  const [allMachines, setAllMachines] = useState<Machine[]>([]);

  useEffect(() => {
    const storedCustomMachines = localStorage.getItem(LOCAL_STORAGE_KEY);
    let customMachines: Machine[] = [];
    if (storedCustomMachines) {
      try {
        customMachines = JSON.parse(storedCustomMachines);
      } catch (error) {
        console.error("Failed to parse custom machines from local storage:", error);
        localStorage.removeItem(LOCAL_STORAGE_KEY); // Clear corrupted data
      }
    }
    setAllMachines([...gymMachines, ...customMachines]);
  }, []);

  const addMachine = (newMachine: Omit<Machine, 'id'>) => {
    const machineWithId: Machine = {
      ...newMachine,
      id: `custom-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, // Unique ID for custom machines
    };

    setAllMachines(prevMachines => {
      const updatedMachines = [...prevMachines, machineWithId];
      const customOnly = updatedMachines.filter(m => m.id.startsWith('custom-'));
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(customOnly));
      return updatedMachines;
    });
  };

  return { allMachines, addMachine };
};