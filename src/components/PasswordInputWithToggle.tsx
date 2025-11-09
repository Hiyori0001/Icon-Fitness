"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox"; // Import Checkbox
import { Label } from "@/components/ui/label";     // Import Label
import { cn } from "@/lib/utils";

interface PasswordInputWithToggleProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const PasswordInputWithToggle = React.forwardRef<HTMLInputElement, PasswordInputWithToggleProps>(
  ({ className, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);

    return (
      <div className={cn("flex flex-col space-y-2", className)}>
        <Input
          type={showPassword ? "text" : "password"} // Dynamically change input type
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
          <Label htmlFor="show-password" className="text-sm font-medium leading-none cursor-pointer">
            Show Password
          </Label>
        </div>
      </div>
    );
  }
);
PasswordInputWithToggle.displayName = "PasswordInputWithToggle";

export { PasswordInputWithToggle };