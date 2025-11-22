import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { useMachines } from "@/hooks/useMachines";
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAdmin } from '@/hooks/useAdmin'; // Import useAdmin

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
  imageUrl: z.string().url({
    message: "Please enter a valid URL for the image.",
  }).optional().or(z.literal("")),
});

const AddMachine = () => {
  const { addMachine } = useMachines();
  const navigate = useNavigate();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const { isAdmin, isLoadingAdmin } = useAdmin(); // Use the useAdmin hook

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      imageUrl: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!isAdmin) {
      toast.error("You do not have permission to add machines.");
      return;
    }

    let finalImageUrl = values.imageUrl || '';

    if (imageFile) {
      toast.loading("Uploading image...", { id: "image-upload" });
      const fileExtension = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExtension}`;
      const filePath = `public/${fileName}`;

      const { data, error } = await supabase.storage
        .from('machine-images')
        .upload(filePath, imageFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        toast.error(`Image upload failed: ${error.message}`, { id: "image-upload" });
        console.error("Supabase image upload error:", error);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from('machine-images')
        .getPublicUrl(filePath);

      if (publicUrlData) {
        finalImageUrl = publicUrlData.publicUrl;
        toast.success("Image uploaded successfully!", { id: "image-upload" });
      } else {
        toast.error("Could not get public URL for uploaded image.", { id: "image-upload" });
        console.error("Supabase getPublicUrl error: No data returned.");
        return;
      }
    } else if (!finalImageUrl) {
      finalImageUrl = "https://via.placeholder.com/150/CCCCCC/000000?text=No+Image";
    }

    addMachine({ ...values, imageUrl: finalImageUrl });
    toast.success("Machine added successfully!");
    form.reset();
    setImageFile(null);
    navigate('/brochure-generator');
  };

  if (isLoadingAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-lg text-gray-600">Loading admin status...</p>
      </div>
    );
  }

  // The ProtectedRoute component already handles redirection if not admin,
  // but this provides an explicit message if somehow accessed directly.
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Access Denied</h1>
          <p className="text-xl text-gray-600 mb-4">You do not have administrative privileges to add machines.</p>
          <Button onClick={() => navigate('/')}>Go to Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center text-primary">Add New Custom Machine</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Machine Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Advanced Squat Rack" {...field} />
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
                    <FormLabel>Price (INR)</FormLabel> {/* Updated label */}
                    <FormControl>
                      <Input type="number" placeholder="e.g., 75000" {...field} onChange={event => field.onChange(parseFloat(event.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormItem>
                <FormLabel>Upload Image</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)}
                  />
                </FormControl>
                <p className="text-sm text-muted-foreground">
                  Or provide an image URL below if you prefer.
                </p>
              </FormItem>
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., https://via.placeholder.com/150" {...field} disabled={!!imageFile} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">Add Machine</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddMachine;