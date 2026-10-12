import Link from "next/link";
import { SALES_DISCLAIMER } from "@/lib/legal";

// Amber notice shown wherever members buy, sell or make offers.
export default function SalesDisclaimer({ className = "" }: { className?: string }) {
  return (
    <p role="note" className={`rounded border border-amber-700/25 bg-amber-100/60 px-3 py-2 text-xs leading-5 text-amber-800 ${className}`}>
      <span className="font-semibold">Disclaimer:</span> {SALES_DISCLAIMER} Deal at your own risk: verify the watch and the other person, and use a
      secure payment method or escrow.{" "}
      <Link href="/terms" className="font-semibold underline hover:text-ink">
        Terms & Disclaimers
      </Link>
    </p>
  );
}
