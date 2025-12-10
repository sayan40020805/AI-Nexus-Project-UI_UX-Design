"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import "../../styles/Tabs.css";

function Tabs({
  className,
  ...props
}) {
  const tabsClasses = ["tabs", className].filter(Boolean).join(" ");

  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={tabsClasses}
      {...props}
    />
  );
}

function TabsList({
  className,
  ...props
}) {
  const listClasses = ["tabs-list", className].filter(Boolean).join(" ");

  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={listClasses}
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  ...props
}) {
  const triggerClasses = ["tabs-trigger", className].filter(Boolean).join(" ");

  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={triggerClasses}
      {...props}
    />
  );
}

function TabsContent({
  className,
  ...props
}) {
  const contentClasses = ["tabs-content", className].filter(Boolean).join(" ");

  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={contentClasses}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
