import React from "react";
import { cn } from "@/lib/utils";

interface TypographyProps {
  children: React.ReactNode;
  className?: string;
}

// H1 Component
function TypographyH1({ children, className }: TypographyProps) {
  return (
    <h1
      className={cn(
        "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl",
        className
      )}
    >
      {children}
    </h1>
  );
}

// H2 Component
function TypographyH2({ children, className }: TypographyProps) {
  return (
    <h2
      className={cn(
        "scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0",
        className
      )}
    >
      {children}
    </h2>
  );
}

// H3 Component
function TypographyH3({ children, className }: TypographyProps) {
  return (
    <h3
      className={cn(
        "scroll-m-20 text-2xl font-semibold tracking-tight",
        className
      )}
    >
      {children}
    </h3>
  );
}

// H4 Component
function TypographyH4({ children, className }: TypographyProps) {
  return (
    <h4
      className={cn(
        "scroll-m-20 text-xl font-semibold tracking-tight",
        className
      )}
    >
      {children}
    </h4>
  );
}

// H5 Component
function TypographyH5({ children, className }: TypographyProps) {
  return (
    <h5
      className={cn(
        "scroll-m-20 text-lg font-semibold tracking-tight",
        className
      )}
    >
      {children}
    </h5>
  );
}

// H6 Component
function TypographyH6({ children, className }: TypographyProps) {
  return (
    <h6
      className={cn(
        "scroll-m-20 text-base font-semibold tracking-tight",
        className
      )}
    >
      {children}
    </h6>
  );
}

// Paragraph Component
function TypographyP({ children, className }: TypographyProps) {
  return (
    <p className={cn("leading-7 [&:not(:first-child)]:mt-6", className)}>
      {children}
    </p>
  );
}

// Blockquote Component
function TypographyBlockquote({ children, className }: TypographyProps) {
  return (
    <blockquote className={cn("mt-6 border-l-2 pl-6 italic", className)}>
      {children}
    </blockquote>
  );
}

// Table Component
interface TypographyTableProps {
  children: React.ReactNode;
  className?: string;
}

function TypographyTable({ children, className }: TypographyTableProps) {
  return (
    <div className="my-6 w-full overflow-y-auto">
      <table className={cn("w-full", className)}>{children}</table>
    </div>
  );
}

// Table Header Component
function TypographyTableHeader({ children, className }: TypographyProps) {
  return (
    <thead>
      <tr className={cn("m-0 border-t p-0 even:bg-muted", className)}>
        {children}
      </tr>
    </thead>
  );
}

// Table Row Component
function TypographyTableRow({ children, className }: TypographyProps) {
  return (
    <tr className={cn("m-0 border-t p-0 even:bg-muted", className)}>
      {children}
    </tr>
  );
}

// Table Head Cell Component
function TypographyTableHead({ children, className }: TypographyProps) {
  return (
    <th
      className={cn(
        "border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right",
        className
      )}
    >
      {children}
    </th>
  );
}

// Table Cell Component
function TypographyTableCell({ children, className }: TypographyProps) {
  return (
    <td
      className={cn(
        "border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right",
        className
      )}
    >
      {children}
    </td>
  );
}

// List Component
function TypographyList({ children, className }: TypographyProps) {
  return (
    <ul className={cn("my-6 ml-6 list-disc [&>li]:mt-2", className)}>
      {children}
    </ul>
  );
}

// Ordered List Component
function TypographyOrderedList({ children, className }: TypographyProps) {
  return (
    <ol className={cn("my-6 ml-6 list-decimal [&>li]:mt-2", className)}>
      {children}
    </ol>
  );
}

// List Item Component
function TypographyListItem({ children, className }: TypographyProps) {
  return <li className={className}>{children}</li>;
}

// Inline Code Component
function TypographyInlineCode({ children, className }: TypographyProps) {
  return (
    <code
      className={cn(
        "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold",
        className
      )}
    >
      {children}
    </code>
  );
}

// Lead Component (for intro paragraphs)
function TypographyLead({ children, className }: TypographyProps) {
  return (
    <p className={cn("text-xl text-muted-foreground", className)}>{children}</p>
  );
}

// Large Component
function TypographyLarge({ children, className }: TypographyProps) {
  return (
    <div className={cn("text-lg font-semibold", className)}>{children}</div>
  );
}

// Small Component
function TypographySmall({ children, className }: TypographyProps) {
  return (
    <small className={cn("text-sm font-medium leading-none", className)}>
      {children}
    </small>
  );
}

// Muted Component
function TypographyMuted({ children, className }: TypographyProps) {
  return (
    <p className={cn("text-sm text-muted-foreground", className)}>{children}</p>
  );
}

// Combined Typography component with all variants
interface TypographyVariantProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | "h1"
    | "h2"
    | "h3"
    | "h4"
    | "h5"
    | "h6"
    | "p"
    | "blockquote"
    | "lead"
    | "large"
    | "small"
    | "muted"
    | "code";
  children: React.ReactNode;
}

export function Typography({
  variant = "p",
  children,
  className,
  ...props
}: TypographyVariantProps) {
  const Component = {
    h1: TypographyH1,
    h2: TypographyH2,
    h3: TypographyH3,
    h4: TypographyH4,
    h5: TypographyH5,
    h6: TypographyH6,
    p: TypographyP,
    blockquote: TypographyBlockquote,
    lead: TypographyLead,
    large: TypographyLarge,
    small: TypographySmall,
    muted: TypographyMuted,
    code: TypographyInlineCode,
  }[variant];

  return (
    <Component className={className} {...props}>
      {children}
    </Component>
  );
}

// Export all components
export {
  TypographyH1,
  TypographyH2,
  TypographyH3,
  TypographyH4,
  TypographyH5,
  TypographyH6,
  TypographyP,
  TypographyBlockquote,
  TypographyTable,
  TypographyTableHeader,
  TypographyTableRow,
  TypographyTableHead,
  TypographyTableCell,
  TypographyList,
  TypographyOrderedList,
  TypographyListItem,
  TypographyInlineCode,
  TypographyLead,
  TypographyLarge,
  TypographySmall,
  TypographyMuted,
};
