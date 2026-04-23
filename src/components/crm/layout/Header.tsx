"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/crm/ui/input";

export function Header() {
  return (
    <header className="flex h-14 items-center border-b bg-background px-6">
      <div className="relative w-72">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search customers..."
          className="pl-9"
        />
      </div>
    </header>
  );
}
