// Dimensional Inference Engine (Submerged RAG)
// Maps proprietary playbooks to a 3D coordinate space (Execution, Aesthetic, Communication)

type Coordinates = [number, number, number]; // [Execution, Aesthetic, Communication] (-100 to 100)

interface DimensionalPlaybook {
  id: string;
  coords: Coordinates;
  content: string;
}

// The deep ocean of proprietary knowledge
const KNOWLEDGE_SPACE: DimensionalPlaybook[] = [
  // === Core Pillar Anchors ===
  {
    id: "high_execution",
    coords: [90, 0, 0],
    content: "High-Performance CTA Strategy: Always use active verbs (Manifest, Secure, Align). Mars energy requires direct movement. Avoid passive 'Submit' or 'Click Here'. Place primary CTAs above the fold, in contrasting colors, with no more than one primary action per viewport.",
  },
  {
    id: "high_aesthetic",
    coords: [0, 90, 0],
    content: "Visual Harmony Strategy: Venus demands beauty and harmony. Use glassmorphism and deep space gradients to create an 'alive' feeling. White space is breathing room for data. Typography hierarchy should use no more than 2 font families. Color palette: limit to 3 primary colors plus neutrals.",
  },
  {
    id: "high_communication",
    coords: [0, 0, 90],
    content: "Mercury Copywriting Framework: Communication must be clear but evocative. Use the 'Problem-Alignment-Manifestation' framework for all landing page copy. Headlines should pass the '5-second test' — a stranger must understand the value proposition within 5 seconds of landing.",
  },
  {
    id: "balanced_core",
    coords: [50, 50, 50],
    content: "The Golden Triad: Balance action, beauty, and clarity. Do not overwhelm the user with choices (reduce friction), ensure the primary CTA is the most visually striking element on the page, and articulate the value proposition within the first 3 seconds of scroll.",
  },
  {
    id: "technical_structure",
    coords: [80, -20, 20],
    content: "Technical Excellence Pillar: Saturn rules structure. Ensure H1-H3 hierarchy is perfectly aligned. Load times must be under 2s to maintain the cosmic flow. Schema.org markup is non-negotiable for serious entities. Implement canonical URLs, proper robots.txt, and XML sitemaps.",
  },

  // === E-Commerce & SaaS ===
  {
    id: "ecommerce_conversion",
    coords: [85, 40, 30],
    content: "E-Commerce Conversion Playbook: Product pages need high-quality images (minimum 3 angles), urgency signals (stock counters, limited-time pricing), social proof (reviews with photos), and a single primary 'Add to Cart' CTA. Reduce checkout friction to 3 steps maximum. Offer guest checkout — forced account creation kills 35% of conversions.",
  },
  {
    id: "saas_onboarding",
    coords: [70, 20, 80],
    content: "SaaS Onboarding Funnel: The homepage must answer three questions instantly: What is it? Who is it for? How do I start? Use a hero section with product screenshot/demo video, a subheadline with specific outcomes ('Save 4 hours per week'), and a primary CTA ('Start Free Trial — No Credit Card'). Feature comparison tables outperform feature lists by 2x.",
  },
  {
    id: "saas_pricing",
    coords: [75, 50, 60],
    content: "Pricing Page Architecture: Use 3-tier pricing with the middle tier visually highlighted as 'Most Popular'. Include a feature comparison matrix. Annual pricing toggle should default to annual with percentage savings shown. Add trust signals near the payment CTA: security badges, money-back guarantee, testimonial from a named customer.",
  },

  // === Personal Brand & Portfolio ===
  {
    id: "personal_brand",
    coords: [30, 80, 70],
    content: "Personal Brand Optimization: The hero must establish identity in under 2 seconds — professional headshot, name, title, and a one-line positioning statement. Social proof via logos ('Featured in'), follower counts, or client testimonials. Portfolio items need case study structure: Challenge → Approach → Result (with quantified metrics).",
  },
  {
    id: "portfolio_showcase",
    coords: [20, 95, 40],
    content: "Portfolio Visual Strategy: Use a grid layout with hover-to-reveal project details. Each project card needs a strong thumbnail image, project title, and one-line description. Case studies should lead with the visual outcome (final design/product) before showing process. Limit portfolio to 6-8 best pieces — quality over quantity.",
  },

  // === Content & Copy ===
  {
    id: "above_the_fold",
    coords: [60, 60, 80],
    content: "Above-the-Fold Optimization: The first viewport must contain: (1) A headline that speaks to the user's pain or desire, not the product's features, (2) A subheadline with specific, quantified value, (3) A primary CTA with action-oriented text, (4) A visual proof element (product image, demo, or social proof). Remove navigation clutter from landing pages.",
  },
  {
    id: "email_capture",
    coords: [80, 10, 60],
    content: "Lead Capture Strategy: Exit-intent popups convert 2-4% of abandoning visitors. Offer a specific lead magnet (not 'Subscribe to our newsletter'). Use 2-field forms maximum (name + email). Inline forms embedded within content outperform sidebar forms by 3x. Thank-you pages should include a secondary CTA (share, follow, explore).",
  },
  {
    id: "content_marketing",
    coords: [40, 20, 85],
    content: "Content Marketing Structure: Blog posts need the 'Skyscraper' format — be the most comprehensive resource on the topic. Use H2 subheadings every 300 words. Include a table of contents for posts over 1500 words. Internal linking: every post should link to 3-5 related posts. End with a relevant CTA, not a generic 'subscribe'.",
  },

  // === Trust & Social Proof ===
  {
    id: "trust_signals",
    coords: [50, 30, 70],
    content: "Trust Architecture: Display trust signals in proximity to decision points (CTAs, pricing, checkout). Effective trust elements ranked by impact: (1) Named customer testimonials with photos, (2) Recognizable client/press logos, (3) Specific metrics ('10,000+ users'), (4) Security badges and certifications, (5) Money-back guarantees. Generic stock photos destroy trust.",
  },
  {
    id: "testimonial_placement",
    coords: [55, 40, 75],
    content: "Testimonial Strategy: Place testimonials adjacent to the objection they counter. Near pricing: 'Worth every penny — ROI in 2 weeks.' Near signup: 'Setup took 5 minutes.' Use video testimonials when possible — they convert 25% better than text. Each testimonial needs: full name, title/company, specific result achieved. Anonymous quotes have near-zero impact.",
  },

  // === Technical SEO & Performance ===
  {
    id: "mobile_optimization",
    coords: [75, 50, 10],
    content: "Mobile-First Optimization: 60%+ of traffic is mobile. Test every page at 375px width. Touch targets must be minimum 44x44px. Font size minimum 16px to prevent iOS zoom. Simplify navigation to hamburger menu with max 6 items. Sticky CTAs on mobile increase conversion by 20%. Disable hover-dependent interactions.",
  },
  {
    id: "page_speed",
    coords: [90, -10, 0],
    content: "Page Speed Playbook: Target LCP under 2.5s, FID under 100ms, CLS under 0.1. Lazy-load below-fold images. Use WebP/AVIF format. Minimize render-blocking CSS/JS. Preconnect to critical third-party origins. Defer analytics and chat widgets. Use CDN for static assets. Each additional second of load time reduces conversion by 7%.",
  },
  {
    id: "seo_fundamentals",
    coords: [85, 0, 30],
    content: "SEO Foundation Checklist: Unique title tag (50-60 chars) and meta description (150-160 chars) per page. One H1 per page containing the primary keyword. Image alt text on all images. Internal linking structure with descriptive anchor text. Canonical URLs to prevent duplicate content. Submit XML sitemap to Google Search Console. Implement structured data for rich snippets.",
  },
  {
    id: "accessibility",
    coords: [60, 30, 40],
    content: "Accessibility Essentials: Color contrast ratio minimum 4.5:1 for normal text, 3:1 for large text (WCAG AA). All interactive elements keyboard-navigable. Form inputs need visible labels (not just placeholders). Images need descriptive alt text. Skip-to-content link for screen readers. Avoid conveying information through color alone. Test with a screen reader monthly.",
  },

  // === Navigation & UX ===
  {
    id: "navigation_ux",
    coords: [40, 70, 50],
    content: "Navigation Architecture: Primary navigation should have 5-7 items maximum. Use descriptive labels (not 'Solutions' or 'Resources' — say what it is). Breadcrumbs improve SEO and reduce bounce rate by 15%. Footer should contain full sitemap, contact info, and legal links. Search functionality is essential for sites with 50+ pages.",
  },
  {
    id: "friction_reduction",
    coords: [80, 30, 30],
    content: "Friction Elimination Playbook: Every additional form field reduces completion by 10%. Remove unnecessary steps between intent and action. Auto-fill where possible. Show progress indicators on multi-step processes. Provide inline validation (don't wait for submit). Error messages must tell users how to fix the problem, not just that one exists.",
  },

  // === Local Business ===
  {
    id: "local_business",
    coords: [70, 40, 60],
    content: "Local Business Digital Strategy: Google Business Profile is the #1 priority — complete every field, add photos weekly, respond to all reviews within 24 hours. NAP consistency (Name, Address, Phone) across all directories. Embed Google Map on contact page. Use 'near me' and city-name keywords in title tags. Collect and showcase Google reviews — businesses with 50+ reviews get 266% more leads.",
  },

  // === Social Media ===
  {
    id: "social_media_integration",
    coords: [50, 60, 80],
    content: "Social Media Integration: Display social proof through embedded feeds or follower counts. Social sharing buttons on content pages (not homepages). LinkedIn and Twitter/X for B2B, Instagram and TikTok for B2C. Profile bio should match website positioning statement. Cross-link between social profiles and website. User-generated content reposts build authenticity.",
  },
];

function calculateDistance(a: Coordinates, b: Coordinates): number {
  return Math.sqrt(
    Math.pow(a[0] - b[0], 2) +
    Math.pow(a[1] - b[1], 2) +
    Math.pow(a[2] - b[2], 2)
  );
}

function inferCoordinates(query: string): Coordinates {
  const lowerQuery = query.toLowerCase();
  let execution = 0;
  let aesthetic = 0;
  let communication = 0;

  // Execution (Mars/Saturn) — conversion, sales, speed, technical
  const executionTerms = ["conversion", "sales", "action", "grow", "revenue", "checkout", "cart", "purchase", "signup", "subscribe", "lead", "funnel", "pricing", "speed", "performance", "mobile", "local", "ecommerce", "e-commerce", "shop", "store", "saas", "onboard"];
  for (const term of executionTerms) {
    if (lowerQuery.includes(term)) execution += 25;
  }

  // Aesthetic (Venus) — design, brand, visual, portfolio
  const aestheticTerms = ["design", "brand", "look", "visual", "beauty", "portfolio", "creative", "art", "photo", "image", "color", "layout", "typography", "logo", "style", "ui", "ux", "navigation"];
  for (const term of aestheticTerms) {
    if (lowerQuery.includes(term)) aesthetic += 25;
  }

  // Communication (Mercury) — copy, content, trust, social
  const communicationTerms = ["copy", "message", "clear", "voice", "content", "blog", "write", "headline", "story", "trust", "testimonial", "review", "social", "email", "newsletter", "seo", "keyword", "accessibility", "a11y"];
  for (const term of communicationTerms) {
    if (lowerQuery.includes(term)) communication += 25;
  }

  // Cross-dimensional terms
  if (lowerQuery.includes("seo") || lowerQuery.includes("technical") || lowerQuery.includes("structure")) execution += 30;
  if (lowerQuery.includes("agency") || lowerQuery.includes("consultant")) { execution += 20; aesthetic += 20; }

  return [
    Math.min(100, Math.max(-100, execution)),
    Math.min(100, Math.max(-100, aesthetic)),
    Math.min(100, Math.max(-100, communication)),
  ];
}

export function getRelevantContext(query: string): string {
  const targetCoords = inferCoordinates(query);

  // Find the closest playbooks in the dimensional space
  const sortedPlaybooks = [...KNOWLEDGE_SPACE].sort((a, b) => {
    return calculateDistance(targetCoords, a.coords) - calculateDistance(targetCoords, b.coords);
  });

  // Return the top 3 closest conceptual neighbors
  const topMatches = sortedPlaybooks.slice(0, 3);

  return `\nPROPRIETARY DIMENSIONAL STRATEGY CONTEXT (Coordinates: ${targetCoords.join(", ")}):\n${topMatches.map(m => m.content).join("\n")}\n`;
}
