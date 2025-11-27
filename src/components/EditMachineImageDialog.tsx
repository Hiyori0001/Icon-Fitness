import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';
import { Machine } from '@/data/machines';
import { useAdmin } from '@/hooks/useAdmin';
import { Checkbox } from '@/components/ui/checkbox'; // Import Checkbox
import { MachineWithOriginalId } from '@/hooks/useMachines'; // Use extended interface

interface EditMachineImageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  machine: MachineWithOriginalId; // Use extended interface
  onSave: (machineId: string, newImageUrl: string, isGlobal: boolean) => void;
}

const EditMachineImageDialog: React.FC<EditMachineImageDialogProps> = ({ isOpen, onClose, machine, onSave }) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrlInput, setImageUrlInput] = useState<string>(machine.imageUrl);
  const [isUploading, setIsUploading] = useState(false);
  const [isGlobalUpdate, setIsGlobalUpdate] = useState(machine.is_global || false); // State for global checkbox
  const { isAdmin } = useAdmin();

  React.useEffect(() => {
    if (isOpen) {
      setImageFile(null);
      setImageUrlInput(machine.imageUrl);
      setIsGlobalUpdate(machine.is_global || false); // Set initial state based on machine
    }
  }, [isOpen, machine.imageUrl, machine.is_global]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
      setImageUrlInput('');
    } else {
      setImageFile(null);
    }
  };

  const handleImageUrlInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageUrlInput(e.target.value);
    setImageFile(null);
  };

  const handleSubmit = async () => {
    if (!isAdmin) {
      toast.error("You do not have permission to edit machine images.");
      return;
    }
    if (!isAdmin && isGlobalUpdate) {
      toast.error("You do not have permission to make global updates.");
      return;
    }

    setIsUploading(true);
    let finalImageUrl = imageUrlInput;

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
        setIsUploading(false);
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
        setIsUploading(false);
        return;
      }
    } else if (!finalImageUrl) {
      finalImageUrl = "https://via.placeholder.com/150/CCCCCC/000000?text=No+Image";
    }

    onSave(machine.id, finalImageUrl, isGlobalUpdate);
    toast.success("Machine image updated successfully!");
    setIsUploading(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Image for {machine.name}</DialogTitle>
          <DialogDescription>
            Update the image for this machine by uploading a new file or providing a URL.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col space-y-2">
            <Label htmlFor="image-upload">Upload Image</Label>
            <Input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={isUploading || !isAdmin}
            />
            <p className="text-sm text-muted-foreground">
              Or provide an image URL below if you prefer.
            </p>
          </div>
          <div className="flex flex-col space-y-2">
            <Label htmlFor="image-url">Image URL</Label>
            <Input
              id="image-url"
              placeholder="https://example.com/image.jpg"
              value={imageUrlInput}
              onChange={handleImageUrlInputChange}
              disabled={isUploading || !!imageFile || !isAdmin}
            />
          </div>
          {machine.imageUrl && (
            <div className="mt-4">
              <Label>Current Image:</Label>
              <div className="w-32 h-32 flex items-center justify-center bg-gray-100 rounded-md mt-2">
                <img src={machine.imageUrl} alt="Current Machine" className="max-w-full max-h-full object-contain" />
              </div>
            </div>
          )}
          {isAdmin && (
            <div className="flex items-center space-x-2 mt-2">
              <Checkbox
                id="is-global-image-update"
                checked={isGlobalUpdate}
                onCheckedChange={(checked) => setIsGlobalUpdate(checked as boolean)}
                disabled={isUploading || !isAdmin}
              />
              <Label htmlFor="is-global-image-update">Apply this as a global update (visible to all users)</Label>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isUploading}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isUploading || !isAdmin}>
            {isUploading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditMachineImageDialog;