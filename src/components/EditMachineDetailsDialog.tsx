"use client";

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { MachineWithOriginalId } from '@/hooks/useMachines';
import { useAdmin } from '@/hooks/useAdmin';
import { Checkbox } from '@/components/ui/checkbox'; // Import Checkbox

interface EditMachineDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  machine: MachineWithOriginalId;
  onSave: (machineId: string, updates: { name?: string; description?: string; price?: number }, isGlobal: boolean) => void;
}

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Machine name must be at least 2 characters.",
  }).max(50, {
    message: "Machine name must not exceed 50 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }).max(500, {
    message: "Description must not exceed 500 characters.",
  }),
  price: z.coerce.number().min(1, {
    message: "Price must be at least 1.",
  }),
});

const EditMachineDetailsDialog: React.FC<EditMachineDetailsDialogProps> = ({ isOpen, onClose, machine, onSave }) => {
  const { isAdmin } = useAdmin();
  const [isGlobalUpdate, setIsGlobalUpdate] = React.useState(machine.is_global || false); // State for global checkbox

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: machine.name,
      description: machine.description,
      price: machine.price,
    },
  });

  React.useEffect(() => {
    if (isOpen && machine) {
      form.reset({
        name: machine.name,
        description: machine.description,
        price: machine.price,
      });
      setIsGlobalUpdate(machine.is_global || false); // Set initial state based on machine
    }
  }, [isOpen, machine, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!isAdmin) {
      toast.error("You do not have permission to edit machine details.");
      return;
    }
    if (!isAdmin && isGlobalUpdate) {
      toast.error("You do not have permission to make global updates.");
      return;
    }
    onSave(machine.id, values, isGlobalUpdate);
    toast.success("Machine details updated successfully!");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Details for {machine.name}</DialogTitle>
          <DialogDescription>
            Make changes to the machine's name, description, and price here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Machine Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Advanced Squat Rack" {...field} disabled={!isAdmin} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Provide a detailed description of the machine..."
                      className="resize-y min-h-[100px]"
                      {...field}
                      disabled={!isAdmin}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price (INR)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="e.g., 75000"
                      {...field}
                      onChange={event => field.onChange(parseFloat(event.target.value))}
                      disabled={!isAdmin}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {isAdmin && (
              <div className="flex items-center space-x-2 mt-2">
                <Checkbox
                  id="is-global-update"
                  checked={isGlobalUpdate}
                  onCheckedChange={(checked) => setIsGlobalUpdate(checked as boolean)}
                  disabled={!isAdmin}
                />
                <Label htmlFor="is-global-update">Apply this as a global update (visible to all users)</Label>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={onClose} type="button">Cancel</Button>
              <Button type="submit" disabled={!isAdmin}>Save Changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditMachineDetailsDialog;