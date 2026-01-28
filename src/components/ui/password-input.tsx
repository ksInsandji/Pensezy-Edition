"use client";

import * as React from "react";
import { Input } from "./input";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "./button";

export const PasswordInput = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);

    return (
      <div className="relative">
        <Input
          type={showPassword ? "text" : "password"}
          className={`pr-10 ${className || ''}`}
          ref={ref}
          {...props}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
          onClick={() => setShowPassword((prev) => !prev)}
          tabIndex={-1}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4 text-gray-500" aria-hidden="true" />
          ) : (
            <Eye className="h-4 w-4 text-gray-500" aria-hidden="true" />
          )}
          <span className="sr-only">{showPassword ? "Masquer" : "Afficher"} le mot de passe</span>
        </Button>
      </div>
    );
  }
);
PasswordInput.displayName = "PasswordInput";
