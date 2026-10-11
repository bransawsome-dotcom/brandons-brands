"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { requestVault } from "@/lib/vault";

// A link to the Collection page that plays the vault-door intro when clicked.
export default function VaultLink(props: ComponentProps<typeof Link>) {
  return (
    <Link
      {...props}
      onClick={(e) => {
        requestVault();
        props.onClick?.(e);
      }}
    />
  );
}
