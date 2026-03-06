import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-[#EB9D2A] text-[#FDFDF8] font-bold border-b-[3px] border-[#B17816] shadow-[0_2px_0_#CD8407] hover:translate-y-[-1px] hover:shadow-[0_3px_0_#CD8407] active:translate-y-0 active:shadow-none",
        destructive:
          "bg-[#F54E00] text-white font-bold border-b-[3px] border-[#C73E00] shadow-[0_2px_0_#D94400] hover:translate-y-[-1px] active:translate-y-0 active:shadow-none",
        outline:
          "border border-[#BFC1B7] bg-[#FDFDF8] text-[#4D4F46] shadow-xs hover:bg-[#EEEFE9] hover:text-[#23251D]",
        secondary:
          "bg-[#EEEFE9] text-[#4D4F46] border border-[#D2D3CC] hover:bg-[#E5E7E0]",
        ghost:
          "hover:bg-[#E5E7E0] hover:text-[#23251D] dark:hover:bg-[#2D2E37]",
        link: "text-[#2F80FA] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        xs: "h-6 gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 rounded-md px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-xs": "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
