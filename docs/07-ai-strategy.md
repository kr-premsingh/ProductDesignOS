# AI Strategy

## Principle: hybrid, open-weight first, adapter-driven

Goal from the brainstorm: use open-weight/open-source/local models where possible to optimize cost, without sacrificing time-to-market. The existing `services/ai` adapter pattern (deterministic stub today) is the right shape — we extend it, not replace it.

## Provider abstraction

```
interface AIProvider {
  capabilities: ('text2image' | 'image2image' | 'upscale' | 'inpaint' | 'text' | 'moderation')[]
  generate(job: AIJobRequest): Promise<AIJobResult>
}
```

- **Today (MVP/pilot):** hosted inference APIs that serve **open-weight** models — e.g., Flux/SDXL-class image models and Llama/Qwen/Mistral-class LLMs via providers like Together AI, Fireworks, Fal.ai, Replicate, Groq, or OpenRouter. No GPU ops burden, pay-per-call, fast to integrate, and still "open-weight" per the goal.
- **Narrow exceptions:** a proprietary model API (OpenAI/Anthropic/Gemini) may be used only for a specific high-value task where open-weight quality is clearly insufficient (e.g., safety/moderation classification, or complex prompt-rewriting) — kept behind the same adapter interface so swapping is trivial.
- **Later (self-hosted):** once daily generation volume crosses a cost break-even point (compute the crossover with actual per-call pricing vs. rented-GPU hourly cost once we have real usage data), stand up open-weight models on rented GPUs (RunPod/Vast.ai/Lambda) behind ComfyUI/Diffusers-based inference servers, still exposed through the same `AIProvider` interface — zero change needed in `catalog`/`commerce` modules.

## Job types & credit costs (tunable, see doc 08 for the ledger mechanics)

| Job type | Example | Relative cost |
|---|---|---|
| Prompt-assist / tagging (LLM) | Auto-generate tags/description for an upload | Low |
| text2image | Generate from a written brief | Medium |
| image2image / remix | Remix an existing pin | Medium |
| inpaint/edit region | Fix or change part of a design | Medium |
| upscale/hi-res export | Final usable/exportable asset | Higher |
| product mockup | Preview a design on a T-shirt, hoodie, cap, mug, gift, or wall poster | Medium-higher |

## Cost controls (so credits ≈ real cost, ready for real pricing later)

- Cache identical `(prompt, category, params)` requests for a short TTL to avoid duplicate spend on accidental double-submits.
- Tiered resolution: cheap low-res previews for the 3-variant browse step; only the chosen variant gets a full-res/upscale job (extra credit cost).
- Per-trust-tier rate limits and daily free-credit caps (ties into doc 04 trust tiers) to bound abuse cost.
- Queue with concurrency caps per provider to avoid bursty overage charges; backpressure returns a "queued, ~Ns" state to the user rather than failing.
- Track actual `$ cost per job` per provider in `AIJob` so we can compute real unit economics before turning on paid credits.

## Content safety & IP risk (carried over and formalized from `PROMPT_Claude.md`)

- Block/flag generation and publishing of copyrighted logos, trademarked characters, or clearly-branded IP; require explicit confirmation step for anything resembling derivative brand work.
- Lightweight moderation pass on generated output (open-weight vision-classifier or a keyword+CLIP-similarity check against a known-marks list) before a `Design` is eligible for public feed placement — failed items stay private with a user-facing explanation.
- User-facing report/flag action on any `Design`, feeding the `trust` module's review queue.
- Maintain an explicit ToS clause on AI-output ownership/usage rights (legal review needed before public launch — flagged in doc 10).

## Open questions to revisit

- Exact provider choice(s) for image generation (pricing/quality trial across 2-3 hosted open-weight providers before committing).
- Threshold (jobs/day or $/month) at which self-hosting becomes cheaper — needs real usage data from pilot.
