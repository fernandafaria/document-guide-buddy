import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-lg font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95 [&_svg]:pointer-events-none [&_svg]:size-5 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-coral text-white shadow-button hover:shadow-elevated hover:brightness-110",
        outline: "border-2 border-coral bg-white text-coral hover:bg-coral hover:text-white",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        secondary: "bg-gray-light text-black-soft hover:bg-gray-medium/20",
        ghost: "hover:bg-gray-light hover:text-black-soft",
        link: "text-coral underline-offset-4 hover:underline",
        gradient: "bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white shadow-button hover:shadow-elevated",
        success: "bg-mint text-white shadow-card hover:brightness-110",
      },
      size: {
        default: "h-14 px-6 py-2",
        sm: "h-10 rounded-xl px-4 text-base",
        lg: "h-16 rounded-2xl px-10 text-xl",
        icon: "h-14 w-14",
        xl: "h-20 rounded-3xl px-12 text-2xl font-bold",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
