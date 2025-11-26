import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-2xl text-center shadow-xl">
        <CardHeader>
          <CardTitle className="text-5xl font-extrabold text-primary mb-4">Welcome to Icon Fitness</CardTitle>
          <p className="text-xl text-gray-700">Your ultimate partner in building world-class fitness facilities.</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-lg text-gray-600">
            Explore our range of high-quality gym equipment and generate custom brochures for your clients.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
            <Link to="/about">
              <Button className="w-full sm:w-auto px-8 py-3 text-lg">Learn About Us</Button>
            </Link>
            <Link to="/brochure-generator">
              <Button variant="outline" className="w-full sm:w-auto px-8 py-3 text-lg border-primary text-primary hover:bg-primary hover:text-white">
                Generate Brochure
              </Button>
            </Link>
            <Link to="/add-machine">
              <Button className="w-full sm:w-auto px-8 py-3 text-lg bg-green-600 hover:bg-green-700 text-white">
                Add Custom Machine
              </Button>
            </Link>
          </div>
          <p className="text-xs text-gray-400 mt-8">Version 1.1</p> {/* Added this line */}
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;