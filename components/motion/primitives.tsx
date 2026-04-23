"use client";

import { motion, type HTMLMotionProps, type Variants } from "framer-motion";
import { forwardRef } from "react";

/*
  Motion primitives — the house kinetic signature.

  - House easing curve: [0.2, 0.7, 0.2, 1]. Every motion uses it.
  - Entrance rise: 10px, 600ms, 60ms stagger between siblings.
  - Spring default: { stiffness: 180, damping: 22 } for physical feel.
  - One breathing element per screen (see .breathe in globals.css).
  - Hover lifts are 1px translate, never scale or bounce.
*/

export const EASE = [0.2, 0.7, 0.2, 1] as const;

export const spring = { type: "spring" as const, stiffness: 180, damping: 22 };

// Stagger container — animates children in sequence on mount
export const staggerParent: Variants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.08,
    },
  },
};

export const staggerChild: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE },
  },
};

/*
  <Stagger> — wrap a list of children to rise in sequence.
  Usage:
    <Stagger>
      <Reveal>…</Reveal>
      <Reveal>…</Reveal>
    </Stagger>
*/
export const Stagger = forwardRef<HTMLDivElement, HTMLMotionProps<"div">>(
  function Stagger(props, ref) {
    return (
      <motion.div
        ref={ref}
        initial="hidden"
        animate="visible"
        variants={staggerParent}
        {...props}
      />
    );
  }
);

/*
  <Reveal> — a single child that rises on mount. Use inside <Stagger>
  to animate in sequence, or standalone for a one-off reveal.
*/
export const Reveal = forwardRef<HTMLDivElement, HTMLMotionProps<"div">>(
  function Reveal(props, ref) {
    return (
      <motion.div
        ref={ref}
        variants={staggerChild}
        initial="hidden"
        animate="visible"
        {...props}
      />
    );
  }
);

/*
  <FadeIn> — pure fade, no translate. Used for ambient mounts that
  shouldn't pull the eye.
*/
export const FadeIn = forwardRef<HTMLDivElement, HTMLMotionProps<"div">>(
  function FadeIn(props, ref) {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: EASE }}
        {...props}
      />
    );
  }
);

/*
  <HoverLift> — subtle y translate + border glow on hover.
  For card surfaces only. Never for buttons (they have their own).
*/
export function HoverLift({
  children,
  className = "",
  ...rest
}: HTMLMotionProps<"div">) {
  return (
    <motion.div
      whileHover={{ y: -1 }}
      transition={{ duration: 0.2, ease: EASE }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
