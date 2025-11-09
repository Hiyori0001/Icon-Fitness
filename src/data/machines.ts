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
    imageUrl: "https://via.placeholder.com/150/0000FF/FFFFFF?text=Treadmill+Pro",
  },
  {
    id: "2",
    name: "Elliptical Trainer",
    description: "Full-body workout elliptical, smooth motion, and low impact on joints. Integrated heart rate monitor.",
    price: 950,
    imageUrl: "https://via.placeholder.com/150/FF0000/FFFFFF?text=Elliptical+Trainer",
  },
  {
    id: "3",
    name: "Spin Bike",
    description: "Indoor cycling bike with adjustable resistance for intense cardio sessions. Ideal for all fitness levels.",
    price: 600,
    imageUrl: "https://via.placeholder.com/150/00FF00/FFFFFF?text=Spin+Bike",
  },
  {
    id: "4",
    name: "Rowing Machine",
    description: "Total body workout machine, simulating rowing motion. Great for strength and endurance.",
    price: 800,
    imageUrl: "https://via.placeholder.com/150/FFFF00/000000?text=Rowing+Machine",
  },
  {
    id: "5",
    name: "Weight Bench",
    description: "Adjustable weight bench for various strength training exercises. Sturdy and comfortable.",
    price: 250,
    imageUrl: "https://via.placeholder.com/150/FF00FF/FFFFFF?text=Weight+Bench",
  },
  {
    id: "6",
    name: "Dumbbell Set (5-50 lbs)",
    description: "Versatile dumbbell set for a wide range of strength exercises. Comes with a storage rack.",
    price: 400,
    imageUrl: "https://via.placeholder.com/150/00FFFF/000000?text=Dumbbell+Set",
  },
  {
    id: "7",
    name: "Barbell and Plate Set",
    description: "Standard barbell with a selection of weight plates for heavy lifting. Essential for power training.",
    price: 550,
    imageUrl: "https://via.placeholder.com/150/800000/FFFFFF?text=Barbell+Set",
  },
  {
    id: "8",
    name: "Leg Press Machine",
    description: "Isolate and strengthen leg muscles with this robust leg press machine. Adjustable seating.",
    price: 1500,
    imageUrl: "https://via.placeholder.com/150/008000/FFFFFF?text=Leg+Press",
  },
  {
    id: "9",
    name: "Cable Crossover",
    description: "Multi-functional cable machine for a full-body resistance workout. Smooth pulley system.",
    price: 2000,
    imageUrl: "https://via.placeholder.com/150/800080/FFFFFF?text=Cable+Crossover",
  },
  {
    id: "10",
    name: "Yoga Mat (Premium)",
    description: "Thick, non-slip yoga mat for comfortable and safe practice. Eco-friendly material.",
    price: 50,
    imageUrl: "https://via.placeholder.com/150/FFA500/FFFFFF?text=Yoga+Mat",
  },
];