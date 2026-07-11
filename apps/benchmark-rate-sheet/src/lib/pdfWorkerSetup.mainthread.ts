/**
 * Forces pdf.js into its documented main-thread ("fake worker") mode by
 * executing the worker module directly instead of inside a dedicated
 * Worker (importing it makes it set `globalThis.pdfjsWorker`, which pdf.js
 * checks for before ever attempting `new Worker(...)`).
 *
 * Used only for the single-file artifact/demo build. There, the worker
 * script has to be inlined as a `data:` URL, and constructing a dedicated
 * `Worker` with `type: "module"` from a `data:` URL has been observed to
 * silently hang on iOS Safari — no error event fires, so pdf.js's own
 * Worker-failure fallback never triggers, and the import just times out.
 * Profiling showed no meaningful speed difference between real-worker and
 * main-thread parsing for realistic documents, so for this build it's
 * worth trading a background thread for behavior that doesn't depend on
 * Safari's handling of module Workers from data: URLs.
 */
import 'pdfjs-dist/build/pdf.worker.mjs'
