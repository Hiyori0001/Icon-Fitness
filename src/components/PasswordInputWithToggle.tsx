"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface PasswordInputWithToggleProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const PasswordInputWithToggle = React.forwardRef<HTMLInputElement, PasswordInputWithToggleProps>(
  ({ className, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);

    return (
      // Added a bright background and border to this container for debugging visibility
      <div className={cn("flex flex-col space-y-2 p-2 border-2 border-red-500 bg-yellow-100", className)}>
        <Input
          type={showPassword ? "text" : "password"}
          ref={ref}
          {...props}
        />
        <div className="flex items-center space-x-2 mt-2">
          <Checkbox
            id="show-password"
            checked={showPassword}
            onCheckedChange={(checked) => setShowPassword(checked as boolean)}
            disabled={props.disabled}
          />
          {/* Added bright text color to the label for debugging visibility */}
          <Label htmlFor="show-password" className="text-sm font-medium leading-none cursor-pointer text-blue-700">
            Show Password
          </Label>
        </div>
      </div>
    );
  }
);
PasswordInputWithToggle.displayName = "PasswordInputWithToggle";

export { PasswordInputWithToggle };