"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/** True ONLY when the page is opened with ?static=1 (layout review). The OS reduce-motion setting is never used:
 *  it is ON by default on many Windows machines and turned the live sites into flat static pages. */
export const prefersReducedMotion = () => typeof window !== "undefined" && new URLSearchParams(window.location.search).has("static");

export { gsap, ScrollTrigger };
