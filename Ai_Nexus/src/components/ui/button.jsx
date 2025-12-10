import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import "../../styles/Button.css";

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot : "button";

  const buttonClasses = [
    "button",
    `button-${variant}`,
    `button-${size}`,
    className
  ].filter(Boolean).join(" ");

  return (
    <Comp
      data-slot="button"
      className={buttonClasses}
      {...props}
    />
  );
}

export { Button };
