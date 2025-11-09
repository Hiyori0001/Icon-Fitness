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
    name: "Spin Bike Elite",
    description: "Robust spin bike for intense cycling sessions. Adjustable resistance and comfortable seating.",
    price: 700,
    imageUrl: "https://via.placeholder.com/150/00FF00/FFFFFF?text=Spin+Bike+Elite",
  },
  {
    id: "4",
    name: "Weight Bench Adjustable",
    description: "Versatile weight bench with multiple incline and decline positions. Ideal for strength training.",
    price: 300,
    imageUrl: "https://via.placeholder.com/150/FFFF00/000000?text=Weight+Bench",
  },
  {
    id: "5",
    name: "Dumbbell Set (5-50 lbs)",
    description: "Complete set of high-quality dumbbells for progressive strength training. Includes storage rack.",
    price: 500,
    imageUrl: "https://via.placeholder.com/150/FF00FF/FFFFFF?text=Dumbbell+Set",
  },
  {
    id: "6",
    name: "Barbell & Plate Set",
    description: "Standard barbell with a variety of weight plates (100kg total). Perfect for squats, deadlifts, and bench press.",
    price: 650,
    imageUrl: "https://via.placeholder.com/150/00FFFF/000000?text=Barbell+Set",
  },
  {
    id: "7",
    name: "Leg Press Machine",
    description: "Heavy-duty leg press machine for targeting quadriceps, hamstrings, and glutes. Smooth sliding mechanism.",
    price: 1500,
    imageUrl: "https://via.placeholder.com/150/800000/FFFFFF?text=Leg+Press",
  },
  {
    id: "8",
    name: "Cable Crossover",
    description: "Multi-functional cable crossover machine for a wide range of upper body exercises. Adjustable pulleys.",
    price: 1800,
    imageUrl: "https://via.placeholder.com/150/008000/FFFFFF?text=Cable+Crossover",
  },
  {
    id: "9",
    name: "Rowing Machine",
    description: "Ergonomic rowing machine for a full-body, low-impact cardio workout. Digital display with metrics.",
    price: 800,
    imageUrl: "https://via.placeholder.com/150/800080/FFFFFF?text=Rowing+Machine",
  },
  {
    id: "10",
    name: "Punching Bag Heavy",
    description: "Durable heavy punching bag for boxing and martial arts training. Includes chain and swivel.",
    price: 250,
    imageUrl: "https://via.placeholder.com/150/FFA500/FFFFFF?text=Punching+Bag",
  },
  {
    id: "11",
    name: "Kettlebell Set (8-32 kg)",
    description: "Versatile kettlebell set for functional strength and conditioning. Various weights included.",
    price: 400,
    imageUrl: "https://via.placeholder.com/150/A52A2A/FFFFFF?text=Kettlebell+Set",
  },
  {
    id: "12",
    name: "Yoga Mat & Accessories",
    description: "Premium non-slip yoga mat with blocks and strap. Ideal for yoga, pilates, and stretching.",
    price: 80,
    imageUrl: "https://via.placeholder.com/150/000080/FFFFFF?text=Yoga+Mat",
  },
  {
    id: "13",
    name: "Resistance Band Set",
    description: "Set of five resistance bands with varying tension levels. Perfect for warm-ups, rehabilitation, and strength training.",
    price: 50,
    imageUrl: "https://via.placeholder.com/150/808000/FFFFFF?text=Resistance+Bands",
  },
  {
    id: "14",
    name: "Pull-Up Bar Doorway",
    description: "Easy-to-install doorway pull-up bar for upper body strength. No drilling required.",
    price: 70,
    imageUrl: "https://via.placeholder.com/150/4B0082/FFFFFF?text=Pull-Up+Bar",
  },
  {
    id: "15",
    name: "Ab Roller Wheel",
    description: "Compact and effective ab roller for core strength and stability. Ergonomic handles.",
    price: 30,
    imageUrl: "https://via.placeholder.com/150/FF1493/FFFFFF?text=Ab+Roller",
  },
];