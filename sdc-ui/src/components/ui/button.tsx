import * as React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "default" | "secondary" };
export const Button = React.forwardRef<HTMLButtonElement, Props>(function Button(
  { className = "", variant = "default", ...props }, ref
) {
  const base = "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition";
  const theme =
    variant === "secondary"
      ? "bg-neutral-100 text-neutral-900 hover:bg-neutral-200"
      : "bg-blue-600 text-white hover:bg-blue-700";
  return <button ref={ref} className={`${base} ${theme} ${className}`} {...props} />;
});
