"use client";

import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDownIcon } from "lucide-react";
import "../../styles/Accordion.css";

function Accordion({ ...props }) {
  return <AccordionPrimitive.Root data-slot="accordion" {...props} />;
}

function AccordionItem({ className, ...props }) {
  const itemClasses = ["accordion-item", className].filter(Boolean).join(" ");

  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={itemClasses}
      {...props}
    />
  );
}

function AccordionTrigger({ className, children, ...props }) {
  const triggerClasses = ["accordion-trigger", className].filter(Boolean).join(" ");

  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={triggerClasses}
        {...props}
      >
        {children}
        <ChevronDownIcon className="text-muted-foreground pointer-events-none size-4 shrink-0 translate-y-0.5 transition-transform duration-200" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

function AccordionContent({ className, children, ...props }) {
  const contentClasses = ["accordion-content", className].filter(Boolean).join(" ");

  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="accordion-content"
      {...props}
    >
      <div className={contentClasses}>{children}</div>
    </AccordionPrimitive.Content>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
