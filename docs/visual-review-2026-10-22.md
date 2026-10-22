# Visual review and complete cases

## Direction and baseline

This is a technical reading document for reviewing a distributed-systems assignment. Preserve the Asteria mark, navy/blue identity, Spanish content, existing routes, SVG subsystem colors and native controls. Native HTML/CSS remains the foundation; no dependencies, external assets or marketing design system are needed. Design variance 3, motion intensity 2, visual density 5.

The baseline was commit `8c8ebf1`. Its large framed case heading delayed the actual content, case navigation competed with reading panels, long trade-offs formed one vertical list, and all diagrams shared more horizontal space than their participants needed. Existing corrected content and keyboard/URL behavior were already useful.

## Changes

- Compact, unboxed case headings, clearer title sizes and quieter metadata.
- A simple case index with a distinct selected state, plus a wrapping grid on mobile.
- Consistent spacing, reading widths, controls, borders and light/dark tokens.
- Capabilities and limitations sit beside each other on wide screens and stack on phones.
- Full-width datacenter diagrams followed by the selected scenario details.
- Sequence diagrams use the width of their actual participants and retain their natural height without internal scrollbars.
- New `#cases` navigation retains the selected case and shows Problem, Failures, Guarantees, all Solutions, then all Trade-offs. Saturation shows S1 and S2 consecutively. Its failures are static reading entries; the separate Failure tab retains selectable responses.
- Fixed an existing malformed print selector; navigation stays hidden when printing.

The complete-case renderer uses the same corrected source data as the individual tabs. A comparison against the pre-change snapshot confirmed every problem, failure, guarantee, full solution and trade-off remained unchanged. Existing individual URLs and legacy process links remain supported. The search and export/print buttons remain removed.

## Verification

`node scripts/check.mjs` checks script syntax, unique IDs, corrected-source counts and phrases, route roundtrips, complete-case section order, all original full solution texts in the aggregate renderer, both saturation variants, unchanged variant selection and architecture route geometry.

Browser verification covered all nine navigation entries at a 390px viewport, all seven complete cases, both saturation variants, URL reload/Back, individual failure selection, fullscreen architecture Escape/restoration and diagram containment. No page or graph horizontal overflow was found. Light, print and reduced-motion fixtures exercised their CSS. Sampled light-mode text contrast exceeded 4.5:1; existing focus outlines and native keyboard controls are retained.

Limits: viewport emulation and CSS fixtures are not physical-device or physical-printer tests. Small-screen diagrams remain overviews with module and step selectors for reading details; no new graph scrolling was introduced. No Lighthouse or field performance score is claimed.
