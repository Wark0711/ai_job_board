'use client'

import { Sheet } from "@/components/ui/sheet";
import { useRouter, useSearchParams } from "next/navigation";
import { ReactNode, useState } from "react";

export function ClientSheet({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(true)
    const router = useRouter()
    const searchParams = useSearchParams()

    function handleOpen(open: boolean) {
        if (open) return

        setIsOpen(false)
        router.push(`/?${searchParams.toString()}`)
    }

    return (
        <Sheet open={isOpen} onOpenChange={open => handleOpen(open)} modal>
            {children}
        </Sheet>
    )
}