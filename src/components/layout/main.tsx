import React from "react";
import { cn } from "@/lib/utils";

interface MainProps extends React.HTMLAttributes<HTMLElement> {
  fixed?: boolean;
  ref?: React.Ref<HTMLElement>;
}

export const Main = ({ className, ...props }: MainProps) => {
  return (
    <main
      className={cn(
        "peer-[.header-fixed]/header:mt-16 max-w-7xl mx-auto w-full",
        "px-4 py-6",
        className,
      )}
      {...props}
    />
  );
};

Main.displayName = "Main";
