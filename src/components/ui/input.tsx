import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-9 w-full min-w-0 rounded-md border border-[#D2D3CC] bg-[#EEEFE9] px-3 py-1 text-[15px] shadow-xs transition-[color,box-shadow] outline-none selection:bg-[#EB9D2A]/20 selection:text-[#23251D] file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-[#9EA096] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-[13px] dark:border-[#3E424F] dark:bg-[#25262B] dark:text-[#EAECF6]",
        "focus-visible:border-[#EB9D2A] focus-visible:ring-[3px] focus-visible:ring-[#EB9D2A]/20",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
}

export { Input }
