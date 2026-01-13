"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface NavLinkProps {
  to: string;
  className?: string;
  activeClassName?: string;
  children: ReactNode;
  onClick?: () => void;
}

export function NavLink({
  to,
  className,
  activeClassName,
  children,
  onClick,
}: NavLinkProps) {
  const pathname = usePathname();
  const isActive =
    pathname === to || (to !== "/admin" && pathname.startsWith(`/admin${to}`));

  return (
    <Link href={to} className={cn(className, isActive && activeClassName)} onClick={onClick}>
      {children}
    </Link>
  );
}
