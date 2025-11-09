"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react"; // Import Eye and EyeOff icons
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button"; // Import Button component
import { cn } from "@/lib/utils";

interface PasswordInputWithToggleProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const PasswordInputWithToggle = React.forwardRef<HTMLInputElement, PasswordInputWithToggleProps>(
  ({ className, type, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);

    return (
      <div className="relative">
        <Input
          type={showPassword ? "text" : "password"} // Dynamically change input type
          className={cn("pr-12", className)} // Increased padding to the right for the button
          ref={ref}
          {...props}
        />
        <Button
          type="button" // Important: set type to "button" to prevent form submission
          variant="ghost" // Using ghost variant, but with explicit text color
          size="sm"
          className="absolute right-0 top-0 h-full px-3 py-2 flex items-center justify-center z-20 text-gray-600 hover:text-gray-900" // Added z-20 and explicit text color
          onClick={() => setShowPassword((prev) => !prev)}
          disabled={props.disabled}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
          <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
        </Button>
      </div>
    );
  }
);
PasswordInputWithToggle.displayName = "PasswordInputWithToggle";

export { PasswordInputWithToggle };