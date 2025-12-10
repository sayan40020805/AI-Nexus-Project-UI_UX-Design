import * as React from "react";
import "../../styles/Card.css";

function Card({ className, ...props }) {
  const cardClasses = ["card", className].filter(Boolean).join(" ");

  return (
    <div
      data-slot="card"
      className={cardClasses}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }) {
  const headerClasses = ["card-header", className].filter(Boolean).join(" ");

  return (
    <div
      data-slot="card-header"
      className={headerClasses}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }) {
  const titleClasses = ["card-title", className].filter(Boolean).join(" ");

  return (
    <h4
      data-slot="card-title"
      className={titleClasses}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }) {
  const descClasses = ["card-description", className].filter(Boolean).join(" ");

  return (
    <p
      data-slot="card-description"
      className={descClasses}
      {...props}
    />
  );
}

function CardAction({ className, ...props }) {
  return (
    <div
      data-slot="card-action"
      className={className}
      {...props}
    />
  );
}

function CardContent({ className, ...props }) {
  const contentClasses = ["card-content", className].filter(Boolean).join(" ");

  return (
    <div
      data-slot="card-content"
      className={contentClasses}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }) {
  const footerClasses = ["card-footer", className].filter(Boolean).join(" ");

  return (
    <div
      data-slot="card-footer"
      className={footerClasses}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};
