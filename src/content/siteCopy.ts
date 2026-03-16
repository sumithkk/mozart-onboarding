export interface Feature {
    id: string
    title: string
    body?: string
    points: string[]
    image: string
    reverse?: boolean
}

export const hero = {
    headline: "Take control of AI",
    tagline: "Mozart: Orchestrate AI",
    cta: "Request Demo",
}

export const features: Feature[] = [
    {
        id: "control",
        title: "Full Model Control",
        body: "Choose the right brain for every job.",
        points: ["Effortlessly switch between GPT-4o, Claude, Gemini, Mistral, and open-source models.", "Vendor-agnostic routing keeps you in control of cost and performance.", "Smart orchestration sends each prompt to the best model automatically."],
        image: `<svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="400" fill="#f3f4f6"/>
  <rect x="50" y="50" width="500" height="300" fill="#e5e7eb" stroke="#d1d5db" stroke-width="2"/>
  <text x="300" y="200" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="#6b7280">Full Model Control</text>
  <text x="300" y="230" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="#9ca3af">Feature Image</text>
</svg>`,
        reverse: false,
    },
    {
        id: "connections",
        title: "Your Data, One Chat",
        body: "Ask once, answer everywhere.",
        points: ["Connect Google Drive, Office 365, Shopify, HubSpot, Google Ads, Meta Ads.", "Query live cross-platform data in a single prompt—no ETL required.", "Real-time sync keeps answers fresh & secure via OAuth scopes."],
        image: `<svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="400" fill="#f3f4f6"/>
  <rect x="50" y="50" width="500" height="300" fill="#e5e7eb" stroke="#d1d5db" stroke-width="2"/>
  <text x="300" y="200" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="#6b7280">Your Data, One Chat</text>
  <text x="300" y="230" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="#9ca3af">Feature Image</text>
</svg>`,
        reverse: true,
    },
    {
        id: "collaboration",
        title: "Work Together, Faster",
        body: "AI that's truly team-friendly.",
        points: ["Shared conversations and files update for everyone in real time.", "Comment, assign tasks, and co-edit with teammates in-context.", "Every chat becomes searchable team knowledge."],
        image: `<svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="400" fill="#f3f4f6"/>
  <rect x="50" y="50" width="500" height="300" fill="#e5e7eb" stroke="#d1d5db" stroke-width="2"/>
  <text x="300" y="200" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="#6b7280">Work Together, Faster</text>
  <text x="300" y="230" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="#9ca3af">Feature Image</text>
</svg>`,
        reverse: false,
    },
    {
        id: "citations",
        title: "Verify Every Answer",
        body: "Trust through transparency.",
        points: ["Retrieval-Augmented Generation anchors each insight to original sources.", "One-click citations for instant verification and audit readiness."],
        image: `<svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="400" fill="#f3f4f6"/>
  <rect x="50" y="50" width="500" height="300" fill="#e5e7eb" stroke="#d1d5db" stroke-width="2"/>
  <text x="300" y="200" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="#6b7280">Verify Every Answer</text>
  <text x="300" y="230" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="#9ca3af">Feature Image</text>
</svg>`,
        reverse: true,
    },
]
