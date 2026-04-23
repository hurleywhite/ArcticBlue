"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { EASE } from "./primitives";

/*
  Route-level transitions. 250ms cross-fade + 10px upward slide on the
  incoming content. Keyed on pathname so client-side route changes
  animate. Not rendered by default to avoid wrapping every page —
  consumers opt-in by wrapping their page content in <PageTransition>.
*/

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.25, ease: EASE }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
