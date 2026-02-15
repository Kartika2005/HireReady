import * as React from "react"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

interface DialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    children: React.ReactNode
}

function Dialog({ open, onOpenChange, children }: DialogProps) {
    if (!open) return null

    return (
        <div className="dialog-overlay" onClick={() => onOpenChange(false)}>
            <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
                <button className="dialog-close" onClick={() => onOpenChange(false)}>
                    <X size={16} />
                </button>
                {children}
            </div>
        </div>
    )
}

const DialogHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props} />
    )
)
DialogHeader.displayName = "DialogHeader"

const DialogTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
    ({ className, ...props }, ref) => (
        <h3 ref={ref} className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props} />
    )
)
DialogTitle.displayName = "DialogTitle"

const DialogDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
    ({ className, ...props }, ref) => (
        <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
    )
)
DialogDescription.displayName = "DialogDescription"

const DialogFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props} />
    )
)
DialogFooter.displayName = "DialogFooter"

export { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter }
