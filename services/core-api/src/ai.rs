use serde::Serialize;

/// One generated variant produced by an AI job.
#[derive(Serialize, Clone)]
pub struct GeneratedVariant {
    pub title: String,
    pub rationale: String,
    pub svg: String,
}

/// AI generation provider (docs/07). Hosted open-weight APIs plug in here later —
/// callers stay unchanged; only the adapter implementation swaps.
#[async_trait::async_trait]
pub trait AIProvider: Send + Sync {
    fn name(&self) -> &'static str;
    async fn remix(&self, prompt: &str) -> Result<Vec<GeneratedVariant>, String>;
}

/// Deterministic zero-cost provider so the full job pipeline is testable
/// without any API keys (same spirit as the old services/ai stub).
pub struct StubProvider;

const PALETTES: [[&str; 3]; 4] = [
    ["#00E5FF", "#FF4DA6", "#0B0F14"],
    ["#A7F3D0", "#93C5FD", "#111827"],
    ["#F7C948", "#F7F8FA", "#0B0F14"],
    ["#F7F8FA", "#9AA3B2", "#0B0F14"],
];

fn hash_prompt(prompt: &str) -> usize {
    prompt.bytes().fold(0usize, |acc, b| acc.wrapping_add(b as usize))
}

fn variant_svg(index: usize, colors: [&str; 3], seed: usize) -> String {
    let (accent, secondary, bg) = (colors[0], colors[1], colors[2]);
    let r = 48i32 - (index as i32 * 6) - ((seed % 8) as i32);
    format!(
        r#"<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 144 144"><rect width="144" height="144" rx="24" fill="{bg}"/><circle cx="72" cy="72" r="{r}" fill="{accent}"/><circle cx="{cx}" cy="{cy}" r="14" fill="{secondary}" opacity="0.78"/></svg>"#,
        bg = bg,
        r = r.max(24),
        accent = accent,
        secondary = secondary,
        cx = 30 + ((seed + index * 12) % 40),
        cy = 30 + ((seed + index * 8) % 32)
    )
}

#[async_trait::async_trait]
impl AIProvider for StubProvider {
    fn name(&self) -> &'static str {
        "stub"
    }

    async fn remix(&self, prompt: &str) -> Result<Vec<GeneratedVariant>, String> {
        let seed = hash_prompt(prompt);
        let palette = PALETTES[seed % PALETTES.len()];
        let titles = ["Signal Mark", "Orbit Badge", "Signature Glyph"];
        Ok((0..3)
            .map(|i| GeneratedVariant {
                title: titles[i].to_string(),
                rationale: format!("Variant {} derived from \"{}\" — distinct direction, same brief.", i + 1, prompt),
                svg: variant_svg(i, palette, seed),
            })
            .collect())
    }
}
