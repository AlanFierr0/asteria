# Asteria UX/UI review

Reviewed and implemented on 2026-10-15. Scope: all six sections of the interactive document at https://asteria.alanfierro.dev.

## Design direction

Preserve the technical document, its Spanish voice, navigation labels, Asteria mark, and navy/blue identity. Use native HTML/CSS and the existing SVG diagrams. Design variance 3, motion 2, visual density 5. Marketing layouts, stock imagery, decorative animation, and framework changes would distract from this document's purpose.

Baseline tokens: navy `#101c30`, accent `#376bcb`, ink `#192b42`, light background `#f3f6fb`, white panels. The original declared Inter without loading it; the implementation uses the existing system-font fallback explicitly. Panels use a 12px radius and controls use 8px. Diagram colors continue identifying subsystems.

Information architecture remains Enunciado, Problemas · fallas · soluciones, Arquitectura, Procesos y fallas, Datacenters, and Garantías y límites. The essential journeys are reading a case, inspecting its failures and guarantees, opening the related process, exploring a module, and comparing datacenter scenarios.

## Audit and implementation plan

| Priority | Finding | Location in the original HTML | Implemented improvement |
| --- | --- | --- | --- |
| High | Phone navigation showed roughly 366px of a 916px-wide strip, hiding several sections. | Main navigation and mobile styles | A labeled menu reveals all six links in a two-column grid. It reports expanded state and closes with Escape or selection. |
| High | Refresh reset the document to its opening section; cases could not be linked directly. | `switchView`, case and scenario handlers | Validated URL hashes retain section, case, failure, solution, process step, module, scenario, and search. Browser Back restores the previous section. |
| High | Architecture text became tiny beside its inspector and on phones. Zoom controls were small. | Architecture layout and diagram controls | The diagram uses the available content width. A labeled module selector offers an accessible alternative to picking small nodes. Controls have 44px minimum heights. Fullscreen uses a native modal dialog with Escape and focus restoration. |
| High | Comparison tables required horizontal scrolling on phones. | Storage and guarantees tables | Mobile rows stack with visible column labels; desktop and print retain tables. |
| Medium | Much of the interface used 10–13px type and faint secondary text. | Shared styles | Larger reading text, stronger contrast, consistent spacing, system typography, and explicit focus styling. |
| Medium | Steps depended on small diagram targets or repeated Next clicks. | Sequence viewer | A labeled step selector supports direct access. Captions identify sender and receiver. SVG step targets also support the keyboard. |
| Medium | A failed search left an unrelated case visible. Accent differences impeded matches. | Case search | Accent-insensitive matching, a clear-search action, announced result counts, and a dedicated empty state. |
| Medium | Selection was conveyed mainly through color. | Cases, failures, solutions, scenarios and modules | Selected controls expose `aria-pressed`; navigation exposes `aria-current`. Updated responses are announced politely. |
| Medium | No dedicated print layout or system dark appearance. | Shared styles | System light/dark colors, reduced-motion handling, and a print stylesheet that removes controls and fits diagrams. |

The opening grid now keeps its three supporting facts together beside the context. Decorative navigation symbols are hidden from assistive technology. The redundant opening subheading remains available to screen readers without competing visually with the page title.

## Preservation and SEO

The original `sourceCases` definitions and embedded `originalPdfs` payloads were compared with the initial Git commit and are unchanged. The document still contains 7 problems, 22 failures, and 8 solutions. No backend, accounts, dependencies, external fonts, analytics, or new content sources were added.

The public root URL remains unchanged. Section and element IDs are preserved. New state lives in hash fragments, so there is no server-route migration. The original title had no description or social metadata; a description and context-aware document titles now identify the active section. No ranking or analytics dataset was available for comparison.

## Verification

Run `node scripts/check.mjs` for JavaScript syntax, duplicate IDs, source-data counts, URL serialization, and Mermaid/PDF payload assertions. Optional `--fixtures` generates ignored `.qa/` pages for reviewing light, print, and reduced-motion CSS without changing OS preferences.

Browser checks cover all six sections on desktop and at 390px, every process and its summarized fault responses, both saturation variants, step selection, URL reload/Back, module selection, fullscreen Escape/focus restoration, and empty/accent-insensitive search. Mobile layouts had no page overflow; visible buttons, inputs, and selectors met the 44px height target. Text contrast was sampled from computed foreground/background colors in both appearances; the case-number and counter failures found during that check were corrected.

Limits: browser emulation is not real-device testing. Media fixtures exercise CSS rather than changing OS preferences. Export payloads are validated; the browser connector did not return a completed download event. No Lighthouse score or physical printer output is claimed. Diagrams remain spatial documents: small screens use the module/step selectors and zoom controls to inspect detail.
