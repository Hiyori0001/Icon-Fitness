import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const About = () => {
  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <Card className="shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-extrabold text-primary">About Icon Fitness</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-lg text-gray-700">
          <p>
            Welcome to <span className="font-semibold text-primary">Icon Fitness</span>, your premier partner in building and equipping world-class fitness facilities. We specialize in providing high-quality gym equipment and innovative solutions for commercial gyms, home fitness enthusiasts, and corporate wellness programs.
          </p>
          <p>
            Founded with a passion for health and fitness, Icon Fitness is dedicated to empowering individuals and businesses to achieve their wellness goals. We believe that access to reliable, durable, and effective gym equipment is fundamental to a successful fitness journey.
          </p>
          <Separator />
          <h2 className="text-2xl font-bold text-secondary-foreground">Our Mission</h2>
          <p>
            Our mission is to be the leading provider of fitness equipment, known for our exceptional product quality, unparalleled customer service, and commitment to innovation. We strive to create inspiring fitness environments that promote health, strength, and well-being.
          </p>
          <Separator />
          <h2 className="text-2xl font-bold text-secondary-foreground">What We Offer</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>A comprehensive range of cardio machines (treadmills, ellipticals, bikes)</li>
            <li>Extensive selection of strength training equipment (free weights, benches, machines)</li>
            <li>Custom gym design and layout services</li>
            <li>Installation and maintenance support</li>
            <li>Expert advice and consultation</li>
          </ul>
          <Separator />
          <h2 className="text-2xl font-bold text-secondary-foreground">Our Commitment</h2>
          <p>
            At Icon Fitness, quality and customer satisfaction are at the heart of everything we do. We meticulously select our products from top manufacturers and ensure that every piece of equipment meets the highest standards of performance and safety. Our team of experienced professionals is always ready to assist you, from initial consultation to post-purchase support.
          </p>
          <p className="text-center mt-8 text-primary-foreground font-semibold">
            Join the Icon Fitness family and let us help you build your fitness legacy!
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default About;