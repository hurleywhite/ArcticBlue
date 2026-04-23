"use client";

import { motion } from "framer-motion";
import { EASE } from "@/components/motion/primitives";

/*
  Page header — serif H1, mono kicker, frost underline rail.
  The header sits on the base ink canvas; the underline is a thin
  frost-tinted rule that separates it from content without heavy chrome.
*/

export function PageHeader({
  kicker,
  title,
  right,
  description,
}: {
  kicker: string;
  title: string;
  right?: React.ReactNode;
  description?: string;
}) {
  return (
    <div
      className="border-b pb-10 pt-12"
      style={{ borderBottomColor: "var(--fg-16)" }}
    >
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="kicker"
          >
            {kicker}
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.08 }}
            className="serif-tight mt-3 text-[44px] leading-[1.05] md:text-[52px]"
            style={{ color: "var(--fg-100)" }}
          >
            {title}
          </motion.h1>
          {description && (
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.16 }}
              className="mt-4 text-[15px] leading-[1.55]"
              style={{ color: "var(--fg-52)" }}
            >
              {description}
            </motion.p>
          )}
        </div>
        {right && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.2 }}
            className="shrink-0"
          >
            {right}
          </motion.div>
        )}
      </div>
    </div>
  );
}
