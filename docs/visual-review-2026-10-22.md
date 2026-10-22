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

## Follow-up: whole-site navigation cleanup

The follow-up audit started from `565dfc6` and covered Enunciado, all six case views, Arquitectura and Datacenters. The nine primary links mixed site sections with case-specific views; on phones the seven-item case grid pushed the content down. Generic introductions, repeated guarantees and repeated solution leads added reading without new information.

- Four primary destinations: Enunciado, Casos, Arquitectura and Datacenters. The six case views now form a sticky contextual navigation under the selected case title. Existing hashes remain supported.
- A labeled native case selector replaces the long mobile case grid. Desktop retains its case index. The primary Casos link stays selected across its six views.
- Removed repeated introductory headings, counts, hints and the case-to-architecture shortcut. Technical content remains in its relevant section.
- Complete cases use simple section separators and show guarantees once. Individual Trade-off retains its guarantee summary. Expanding a solution adds its development without repeating its opening paragraph.
- Datacenter scenarios show their explanation above the chart; the secondary storage table is a native disclosure, collapsed initially.
- Native links retain the case, failure, variant and applicable process step when opened separately. Case changes add browser history and return to the beginning; choosing the current case preserves its variant and reading position.
- Fixed navigation selection/listeners to target anchors only, so the record section itself no longer acquires link state.

Follow-up verification: all 42 combinations of seven cases and six views passed in a 390px browser viewport without page overflow. All seven desktop case-index choices, both saturation variants, development expansion, process selection, Back/reload, architecture module selection/fullscreen Escape restoration, and all three datacenter scenarios were checked. The diagrams fit their containers without internal scrollbars, the module selector remains below its chart, and all seven storage rows remain available. A long-page case switch was reproduced and verified to return to the top after the fix.

Light-mode samples for case text and navigation ranged from 5.31:1 to 13.26:1; keyboard navigation retained its 3px focus outline. Print and reduced-motion CSS fixtures hid navigation and disabled transitions respectively. Automated checks cover unchanged full solution text, the absence of duplicate guarantee groups, native route state and the case-change guard/history behavior. The corrected seven-case source data was compared against the pre-cleanup snapshot and remained identical.

These checks use browser viewport emulation and CSS fixtures; they do not claim physical-device, printer, screen-reader or Lighthouse certification.
