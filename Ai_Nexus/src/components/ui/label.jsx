"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import "../../styles/Label.css";

function Label({ className, ...props }) {
  const labelClasses = ["label", className].filter(Boolean).join(" ");

  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={labelClasses}
      {...props}
    />
  );
}

export { Label };
