import { QuickLife } from "./QuickLife.ts";

/**
 * Entry point named after Golly’s “QuickLife” (`gollybase/qlifealgo.cpp` / `qlifealgo.h`).
 *
 * This project’s simulation uses the same **chunk map + padded neighborhood** core as
 * {@link QuickLife}, with **Golly-inspired micro-optimizations** already folded into that
 * class (per-chunk population to skip all-dead 3×3 neighborhoods, 18-byte next-state
 * table for outer-totalistic rules).
 *
 * A **full** port of Golly’s engine would additionally implement:
 * - **Bricks**: 4×8 “slices” in 32-bit words, even/odd generations per brick
 * - **Tiles**: 32×32 cell regions of four bricks, `c[]` change flags
 * - **Supertiles**: eight child pointers, alternating horizontal/vertical stacking by level
 * - **Stagger-step** slice updates and `ruletable` lookups as in `qlifealgo::p01` / `p10`
 *
 * That stack is on the order of thousands of lines of C++ and is not duplicated here;
 * use Golly or a WASM build when you need bit-identical performance characteristics.
 */
export class GollyQuickLife extends QuickLife {}
