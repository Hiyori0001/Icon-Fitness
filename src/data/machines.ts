export interface Machine {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
}

export const gymMachines: Machine[] = [
  {
    id: "1",
    name: "Treadmill Pro",
    description: "High-performance treadmill with incline and various workout programs. Perfect for cardio training.",
    price: 1200,
    imageUrl: "YOUR_NEW_TREADMILL_IMAGE_URL_HERE", // <--- Change this URL
  },
  {
    id: "2",
    name: "Elliptical Trainer",
    description: "Full-body workout elliptical, smooth motion, and low impact on joints. Integrated heart rate monitor.",
    price: 950,
    imageUrl: "https://via.placeholder.com/150/FF0000/FFFFFF?text=Elliptical+Trainer",
  },
  // ... rest of the machines
];