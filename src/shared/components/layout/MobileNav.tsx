import { AppLogo } from '@/shared/components/common/AppLogo'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/shared/components/ui/sheet'
import { SidebarNav } from './SidebarNav'

interface MobileNavProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Mobile navigation drawer (Sheet). Mirrors the desktop sidebar's navigation
 * and closes automatically when a destination is chosen.
 */
export function MobileNav({ open, onOpenChange }: MobileNavProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="h-16 justify-center border-b border-border px-4 text-left">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <AppLogo />
        </SheetHeader>
        <div className="overflow-y-auto p-3">
          <SidebarNav onNavigate={() => onOpenChange(false)} />
        </div>
      </SheetContent>
    </Sheet>
  )
}
