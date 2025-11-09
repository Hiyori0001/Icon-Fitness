"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface PasswordInputWithToggleProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const PasswordInputWithToggle = React.forwardRef<HTMLInputElement, PasswordInputWithToggleProps>(
  ({ className, ...props }, ref) => {
    return (
      <div className={cn("relative", className)}>
        <Input
          type="password"
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);
PasswordInputWithToggle.displayName = "PasswordInputWithToggle";

export { PasswordInputWithToggle };