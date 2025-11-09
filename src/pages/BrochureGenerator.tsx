import React, { useState, useRef } from 'react';
import { Machine } from "@/data/machines";
import MachineCard from "@/components/MachineCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { toast } from "sonner";
import { useMachines } from "@/hooks/useMachines"; // Import the new hook

const BrochureGenerator = () => {
  const { allMachines } = useMachines(); // Use the hook to get all machines
  const [selectedMachineIds, setSelectedMachineIds] = useState<Set<string>>(new Set());
  const brochureRef = useRef<HTMLDivElement>(null);

  const handleSelectMachine = (machineId: string, isSelected: boolean) => {
    setSelectedMachineIds(prev => {
      const newSet = new Set(prev);
      if (isSelected) {
        newSet.add(machineId);
      } else {
        newSet.delete(machineId);
      }
      return newSet;
    });
  };

  const selectedMachines = allMachines.filter(machine => selectedMachineIds.has(machine.id));
  const totalPrice = selectedMachines.reduce((sum, machine) => sum + machine.price, 0);

  const generatePdf = async () => {
    if (selectedMachines.length === 0) {
      toast.error("Please select at least one machine to generate a brochure.");
      return;
    }

    toast.loading("Generating brochure...");

    const doc = new jsPDF('p', 'pt', 'a4');
    const margin = 40; // Margin for the PDF page
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yOffset = margin;

    // Add a title page
    doc.setFontSize(24);
    doc.text("Icon Fitness Equipment Brochure", pageWidth / 2, pageHeight / 2 - 50, { align: 'center' });
    doc.setFontSize(12);
    doc.text("Your Partner in Fitness Excellence", pageWidth / 2, pageHeight / 2, { align: 'center' });
    doc.addPage();
    yOffset = margin; // Reset yOffset for the new page

    const brochureContentDiv = document.createElement('div');
    brochureContentDiv.style.width = `${pageWidth - 2 * margin}pt`; // Set width to fit PDF page
    brochureContentDiv.style.padding = '20pt';
    brochureContentDiv.style.boxSizing = 'border-box';
    brochureContentDiv.style.backgroundColor = 'white'; // Ensure background is white for PDF

    selectedMachines.forEach((machine, index) => {
      const machineItemDiv = document.createElement('div');
      machineItemDiv.className = 'brochure-item mb-6 p-4 border rounded-lg shadow-sm flex items-center space-x-4';
      machineItemDiv.style.display = 'flex';
      machineItemDiv.style.alignItems = 'center';
      machineItemDiv.style.marginBottom = '24px';
      machineItemDiv.style.padding = '16px';
      machineItemDiv.style.border = '1px solid #e2e8f0';
      machineItemDiv.style.borderRadius = '8px';
      machineItemDiv.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';

      const img = document.createElement('img');
      img.src = machine.imageUrl;
      img.alt = machine.name;
      img.style.width = '100px';
      img.style.height = '100px';
      img.style.objectFit = 'cover';
      img.style.borderRadius = '4px';
      img.style.marginRight = '16px';
      machineItemDiv.appendChild(img);

      const textContentDiv = document.createElement('div');
      textContentDiv.style.flexGrow = '1';

      const name = document.createElement('h3');
      name.className = 'text-lg font-bold text-primary';
      name.style.fontSize = '18px';
      name.style.fontWeight = 'bold';
      name.style.color = 'hsl(var(--primary))';
      name.textContent = machine.name;
      textContentDiv.appendChild(name);

      const description = document.createElement('p');
      description.className = 'text-sm text-gray-700 mt-1';
      description.style.fontSize = '14px';
      description.style.color = '#4a5568';
      description.style.marginTop = '4px';
      description.textContent = machine.description;
      textContentDiv.appendChild(description);

      const price = document.createElement('p');
      price.className = 'text-md font-semibold text-secondary-foreground mt-2';
      price.style.fontSize = '16px';
      price.style.fontWeight = 'semibold';
      price.style.color = 'hsl(var(--secondary-foreground))';
      price.style.marginTop = '8px';
      price.textContent = `Price: $${machine.price.toLocaleString()}`;
      textContentDiv.appendChild(price);

      machineItemDiv.appendChild(textContentDiv);
      brochureContentDiv.appendChild(machineItemDiv);
    });

    // Add total price to the end
    const totalPriceDiv = document.createElement('div');
    totalPriceDiv.className = 'text-2xl font-bold text-right mt-8 p-4 bg-gray-50 rounded-lg';
    totalPriceDiv.style.fontSize = '24px';
    totalPriceDiv.style.fontWeight = 'bold';
    totalPriceDiv.style.textAlign = 'right';
    totalPriceDiv.style.marginTop = '32px';
    totalPriceDiv.style.padding = '16px';
    totalPriceDiv.style.backgroundColor = '#f9fafb';
    totalPriceDiv.style.borderRadius = '8px';
    totalPriceDiv.textContent = `Total Estimated Price: $${totalPrice.toLocaleString()}`;
    brochureContentDiv.appendChild(totalPriceDiv);

    document.body.appendChild(brochureContentDiv); // Temporarily add to DOM for html2canvas

    const canvas = await html2canvas(brochureContentDiv, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const imgWidth = pageWidth - 2 * margin;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    doc.addImage(imgData, 'PNG', margin, yOffset, imgWidth, imgHeight);
    heightLeft -= (pageHeight - yOffset);

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      doc.addPage();
      doc.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    document.body.removeChild(brochureContentDiv); // Remove from DOM

    doc.save('IconFitness_Brochure.pdf');
    toast.success("Brochure generated successfully!");
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-6 shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center text-primary">Generate Your Custom Brochure</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-lg text-gray-700 mb-6">
            Select the gym equipment you'd like to include in your personalized brochure.
          </p>
          <div className="flex justify-center mb-6">
            <Button onClick={generatePdf} className="px-8 py-3 text-lg">
              Generate Brochure ({selectedMachines.length} items)
            </Button>
          </div>
          <Separator className="my-8" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {allMachines.map((machine) => ( // Use allMachines from the hook
              <MachineCard
                key={machine.id}
                machine={machine}
                isSelected={selectedMachineIds.has(machine.id)}
                onSelect={handleSelectMachine}
              />
            ))}
          </div>
          {selectedMachines.length > 0 && (
            <div className="mt-10 p-6 bg-card rounded-lg shadow-md border">
              <h2 className="text-2xl font-bold text-secondary-foreground mb-4">Selected Machines Summary</h2>
              <ul className="space-y-2 mb-4">
                {selectedMachines.map(machine => (
                  <li key={machine.id} className="flex justify-between items-center text-lg">
                    <span>{machine.name}</span>
                    <span className="font-semibold">${machine.price.toLocaleString()}</span>
                  </li>
                ))}
              </ul>
              <Separator className="my-4" />
              <div className="flex justify-between items-center text-2xl font-bold text-primary">
                <span>Total Estimated Price:</span>
                <span>${totalPrice.toLocaleString()}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BrochureGenerator;