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
import { supabase } from '@/integrations/supabase/client'; // Import Supabase client

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
  // imageUrl is now optional, as it can come from an upload or be a direct URL
  imageUrl: z.string().url({
    message: "Please enter a valid URL for the image.",
  }).optional().or(z.literal("")), // Allow empty string if no URL is provided
});

const AddMachine = () => {
  const { addMachine } = useMachines();
  const navigate = useNavigate();
  const [imageFile, setImageFile] = useState<File | null>(null); // State to hold the selected image file

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
    let finalImageUrl = values.imageUrl || ''; // Start with URL from form, if any

    if (imageFile) {
      toast.loading("Uploading image...", { id: "image-upload" });
      const fileExtension = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExtension}`;
      const filePath = `public/${fileName}`; // Store in a 'public' folder within the bucket

      const { data, error } = await supabase.storage
        .from('machine-images')
        .upload(filePath, imageFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        toast.error(`Image upload failed: ${error.message}`, { id: "image-upload" });
        console.error("Supabase image upload error:", error);
        return; // Stop submission if upload fails
      }

      // Get public URL
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
      // If no file uploaded and no URL provided, use a default placeholder
      finalImageUrl = "https://via.placeholder.com/150/CCCCCC/000000?text=No+Image";
    }

    addMachine({ ...values, imageUrl: finalImageUrl });
    toast.success("Machine added successfully!");
    form.reset();
    setImageFile(null); // Clear the file input
    navigate('/brochure-generator'); // Redirect to brochure generator to see the new machine
  };

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
                    <FormLabel>Price ($)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 750" {...field} onChange={event => field.onChange(parseFloat(event.target.value))} />
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