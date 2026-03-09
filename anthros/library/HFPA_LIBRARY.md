# HFPA Master Library: The Global Presets
# Antigravity Agency — MASTER TEMPLATE

This library contains the **High-Fidelity Preset Array (HFPA)** definitions for all AI Builders.
Builders reference these presets by ID to ensure 100% visual fidelity and technical accuracy.

> ⚠️ **PROTECTED FILE** — This library is part of the Master Template system.  
> To add a new preset, a new benchmark must be audited in `Antigravity-Skills-Test` and approved by the Art Director before being promoted here.

---

## [ARCHETYPES OVERVIEW]
- **Editorial:** High-end magazines, luxury e-commerce (e.g., Anthropologie).
- **Cinematic:** High-impact, macro-photography, immersive (e.g., Apple, Nike).
- **SaaS/Tech:** Clean, data-rich, functional (e.g., Stripe, Linear).
- **Neo-Brutalist:** Bold, raw, typography-centric.

---

## 1. Editorial Presets

### [ID: EDIT-01-ANTHRO] — "The Seamless Curator" (Verified)
- **Atmospheric DNA:**
  - CanvasColor: `#FDFDF9` (Ivory Paper)
  - TextContrast: `Main: #26262C`, `Faded: #666666`
  - SurfaceDepth: `Flat`
- **Typography Engine:**
  - Display: `Family: 'Bodoni Moda'`, `Tracking: 0.25em`, `Transform: uppercase`
  - Body: `Family: 'Montserrat'`, `Weight: 300`, `Leading: 1.6`, `Measure: 70ch`
  - UI/Labels: `Family: 'Bodoni Moda'`, `Size: 11px`, `Tracking: 0.1em`, `Underline: offset 2px`
- **Structural Topology:**
  - Archetype: `Seamless Mosaic`
  - GapLogic: `0px`
  - Ratios: `28% / 72%` Asymmetry
  - Framing: `3:4 Vertical`
- **Component DNA:**
  - Header: `Height: 120px`, `Behavior: Static-to-Sticky-Hide`
  - Buttons: `Style: Ghost`, `Radius: 0px`, `Hover: Solid Fill`
- **Motion & Physics:**
  - Entrance: `GSAP Stagger (0.1s)`, `Duration: 1.2s`, `Ease: Power3.out`

---

## 2. Cinematic Presets (Awwwards Heritage)

### [ID: CINE-01-IWD] — "The Performance Cover" (Verified Replica v2)
- **Atmospheric DNA:**
  - CanvasColor: `#FFFFFF` (Pure White Frame)
  - HeroVessel: `10px Inset`, `Border-Radius: 10px`
  - TextContrast: `Main: #FFFFFF` (Over Hero), `Inverted: #1B1D1C` (Over Canvas)
- **Typography Engine:**
  - Display: `Family: 'Anton'`, `Weight: 400`, `Size: 140px`, `Leading: 140px` (Locked), `Transform: Uppercase`
  - Body: `Family: 'Proxima Nova'`, `Weight: 600`, `Size: 14px`
- **Structural Topology:**
  - Archetype: `Inset Fluid Banner`
  - Container: `Full-Width`, `Padding: 10px` (Reveals White Canvas)
  - Anchor Points: `Hero Text: Center-Right`
- **Component DNA:**
  - Nav Architecture: `Logo: Left (80px)`, `Links: Centered`, `CTA: Right (80px)`
  - Button Variants:
    - `Small / Filled`: `138px x 39px` (Nav)
    - `Large / Filled`: `225px x 44px` (Hero Primary)
    - `Large / Outline`: `258px x 44px` (Hero Secondary)
- **Motion & Physics:**
  - Entrance: `Weighted Cinematic reveals`, `High-impact typography masks`

### [ID: CINE-02-LW] — "Obsessive Minimalist" (Verified Replica v3)
- **Atmospheric DNA:**
  - CanvasColor: `#000000` (Obsidian)
  - TextContrast: `Main: #FFFFFF`, `Faded: rgba(255, 255, 255, 0.12)`
  - UI Accents: `Border-bottom` on Nav (1px, 12% alpha)
- **Typography Engine:**
  - Display: `Family: 'abcRepro' (Technical Sans)`, `Size: 51.4px`, `Leading: 56.5px`, `Tracking: -2.14px`, `Transform: Uppercase`
  - Body: `Family: 'abcRepro'`, `Size: 14px`, `Weight: 400`
  - UI/Labels: `Gap: 128.5px` (Between nav items)
- **Structural Topology:**
  - Archetype: `Technical Viewport / 3D Stage`
  - Container: `Full-Width`, `Gutter: 43px`
  - Pinned Nav: `Left-Rail Labels` (Philosophy, Craft, Innovation) at `41px` offset.
- **Component DNA:**
  - Nav Architecture: `Logo: L`, `Links: C (128.5px gap)`, `Search: R`
  - CTA Style: `Ghost Pill`, `1px Border (12% Alpha)`, `No ornaments`
- **Motion & Physics:**
  - Entrance: `Inertia-Heavy`, `Sequential Scanline revelations`

### [ID: CINE-03-TURB] — "The Architectural Bold" (Verified Replica)
- **Atmospheric DNA:**
  - CanvasColor: `#FFFFFF` (Stark White)
  - TextContrast: `Main: #1A1A1A`, `Accent: #000000`
  - SurfaceDepth: `Flat / Central Column`
- **Typography Engine:**
  - Display: `Family: 'GC EPICPRO' (Extended)`, `Weight: 800`, `Size: 50px`, `Leading: 45px` (Negative), `Transform: Uppercase`
  - Body: `Family: 'Inter'`, `Weight: 500`, `Size: 13px`
  - UI/Labels: `Family: 'Inter'`, `Weight: 600`, `Size: 12px`
- **Structural Topology:**
  - Archetype: `Centralized Column`
  - Container: `Max-Width: 1200px`, `Margin: 0 auto`
  - GapLogic: `Inner-Padding: 39px`, `Grid-Gap: 10px`
  - Grid: `4-Column Fixed (273px x 400px cards)`
- **Component DNA:**
  - Header: `Height: 100px`, `Pill-style labels`
  - Links: `Text + Arrow`, `Underline on hover`, `Glyph: ↗`
- **Motion & Physics:**
  - Entrance: `Snappy/Springy`, `Framer Motion DNA`

### [ID: CINE-04-BRAR] — "Boutique Energy" (Verified Replica v3)
- **Atmospheric DNA:**
  - CanvasColor: `#FCFAF8` (Warm Bone)
  - PrimaryAccent: `#E16139` (Boutique Orange)
  - HeaderVessel: `#231F20` (Dark Technical Bar, 20px radius)
- **Typography Engine:**
  - Display: `Family: 'Fraunces' (Black)`, `Weight: 900`, `Size: 140px`, `Leading: 120px`, `Tracking: -0.02em`, `Transform: None`
  - Body: `Family: 'Degular'`, `Weight: 400`, `Size: 16px`, `Leading: 1.5`
- **Structural Topology:**
  - Archetype: `Vertical Hero Sandwich (High Density)`
  - Container: `Max-Width: 1728px`, `Margin: 0 auto`
  - Layout: `Title (Extreme Top) -> Transparent Image (Center) -> CTAs (Bottom)`
  - Section Gaps: `120px`
- **Component DNA:**
  - Header: `Floating`, `Padding: 20px 40px`, `Logo: Center`, `Links: Left/Right Split`
  - Button Variants:
    - `Primary`: 12px Radius, Filled, 24px H-Padding, Weight: 700, Size: 16px, Icon: Arrow Right.
    - `Secondary`: 12px Radius, Outline (1px solid), 24px H-Padding, Weight: 700, Size: 16px, Icon: Arrow Right.
  - Hero Slider: `Circular Reveal (SVG clip-path)`, `Background Palette: [#F4B41A, #811A4A, #B7A9D1, #71869E]`
  - Image Vessel: `Background: Transparent`, `Filter: Drop-shadow (Product Pop)`
- **Motion & Physics:**
  - Entrance: `Circular mask expansion`, `Staggered vertical reveals`, `Organic spring physics`

### [ID: CINE-05-LUFT] — "Silky Luxury" (Verified Replica v4)
- **Atmospheric DNA:**
  - CanvasColor: `#000000` (Hero), `#F5F5F5` (Expanding Content)
  - PrimaryAccent: `#EB663C` (Lufte Orange)
  - Layout Transitions: `Hero-to-Content Overlap`, `Scaling Container (90vw to 100vw)`
- **Typography Engine:**
  - Display: `Family: 'Outfit'`, `Weight: 500`, `Size: 90px`, `Leading: 95px`, `Tracking: -3.2px`, `Transform: None`
  - Description: `Size: 20px`, `Leading: 1.5`, `Weight: 300`
  - UI/Nav: `Family: 'Outfit'`, `Weight: 500`, `Size: 14px`, `Transform: Uppercase`
  - CTA Labels: `Transform: Uppercase`, `Weight: 600`
- **Structural Topology:**
  - Archetype: `Overlapping Panoramic Slider`
  - Container (Initial): `Width: 90vw`, `Border-radius: 12px (Top)`, `Overlap: -100px`
  - Container (Scroll): `Transitions to 100vw`, `Radius to 0px`
  - Navigation: `Squircle Floating Capsule (rgba(0,0,0,0.6))`, `Active Element: Filled Rounded Rect`
- **Component DNA:**
  - Primary CTA: `Pill Shape`, `Icon: Arrow Right`, `Transform: Uppercase`, `Radius: 100px (Pill)`
  - Ghost CTA: `Radius: 12px`, `Transform: Uppercase`
  - Nav Architecture: `Logo: Left (Boxing: 1px)`, `Capsule: Center`, `Secondary CTA: Right`
- **Motion & Physics:**
  - Entrance: `GSAP ScrollTrigger for Container expansion`, `Smooth silky reveals`

### [ID: CINE-06-JOSH] — "Joshua's Magazine" (Verified Replica v2)
- **Atmospheric DNA:**
  - CanvasColor: `#D6F8D5` (Content), `#C3C2B9` (Menu), `#000000` (Hero Foundation)
  - Texture: `Analog Noise/Grain Overlay` (Persistent visibility)
  - Layout Transitions: `Full-bleed Visual to Overlapping Pale Content`
- **Typography Engine:**
  - Display: `Family: 'SeasonMix' (High-contrast Serif)`, `Weight: 300` (Ultra-light), `Size: 106px`, `Leading: 90px`, `Tracking: -2.6px`, `Transform: Uppercase`
  - Body: `Family: 'BasisGrotesquePro' (Sans)`, `Size: 20px`, `Leading: 1.35`
  - UI/Nav: `Menu Font Size: 18px`, `Weight: 500`, `Transform: Uppercase`, `Icon: Large +`
- **Structural Topology:**
  - Archetype: `Digital Magazine Editorial`
  - Header: `Fixed Corner Layout (Logo-Left, Menu-Right, Emblem-Center)`
  - Header Behavior: `Dynamic Color Switching (mix-blend-mode: difference)`
  - Menu: `Full-screen Modal overlay`, `Navigation Link Size: 72px (Serif)`
- **Component DNA:**
  - Buttons: `Glassmorphism Pill`, `Radius: 86px`, `Backdrop-filter: blur(10px)`
  - Form Inputs: `Pale Green Background (#D6F8D5)`, `Soft Radius`
- **Motion & Physics:**
  - Entrance: `Subtle Background Scale-up`, `Grain Flicker`
  - Scroll: `Hero remains fixed while Content Area rises over it (Z-index stacking)`
  - Interactive: `Centered Coral Ticker (#E26D5C) with Edge Fades`, `Continuous loop`

### [ID: CINE-07-TENB] — "Tenbin Labs" (Verified Replica v4)
- **Atmospheric DNA:**
  - CanvasColor: `#000000` (Pitch Black)
  - Visual Layer: `Pure Minimalist Black` (No glows, no textures)
- **Typography Engine:**
  - Headline: `Size: 110px`, `Line-height: 0.9`, `Tracking: -3.0px`, `Weight: 400`
  - Description: `Size: 18px`, `Color: rgba(255,255,255,0.6)`
  - Technical/UI: `Family: 'Berkeley Mono'`, `Size: 11px-14px`, `Transform: Uppercase`
- **Structural Topology:**
  - Archetype: `Spatial Brutalism (Technical)`
  - Layout: `Section 02 (Liquidate): Split Composition (L: Headline, C: Image Placeholder, R: Table)`
  - Global Frame: `Internal side margin (~80px)`
- **Component DNA:**
  - Data Table: `Monospace Type`, `Grid-based layout`, `Accent colors (#C8D8FF)`
  - Asset Slot: `Central Image Placeholder (Proxy for 3D/Shaders) with Reflection Logic`
- **Motion & Physics:**
  - Scroll: `Lenis Smooth Scroll integration`

### [ID: CINE-08-ZITA] — "Zita Fernandez" (Verified Replica v1)
- **Atmospheric DNA:**
  - CanvasColor: `#F5F1E6` (Warm Sand)
  - Layout Style: `High-End Editorial / Modern Magazine`
  - Texture: `Clean Matte Canvas`
- **Typography Engine:**
  - Display (Serif): `Family: 'Meno Text'`, `Size: 40px`, `Weight: 400`, `Leading: 40px`, `Tracking: -0.4px`
  - Body/UI (Sans): `Family: 'PP Neue Montreal'`, `Size: 18px-20px`, `Weight: 400`
  - Functional Tags: `Monospace-inspired Sans`, `Brackets [ 01 ] for archival feel`
- **Structural Topology:**
  - Header: `Fixed, Full-width (Logo-Left, Tagline-Center, Nav-Right, World Clock-End)`
  - Grid: `Asymmetrical Staggered Multi-column`, `Unconventional horizontal alignment`
  - Navigation: `Text-based links (No button containers)`
- **Component DNA:**
  - Interactivity: `Pure Typographic Links`, `Smooth Image Zoom on Hover`
  - Labels: `Upper-case Project Labels with Parentheses ( SELECTED WORK )`
- **Motion & Physics:**
  - Scroll: `Lenis Smooth Scroll Momentum`
  - Transitions: `Section Fade-ins`, `Typographic Micro-interactions`

### [ID: CINE-09-DADO] — "Studio Dado" (Verified Replica v2)
- **Atmospheric DNA:**
  - Canvas Palette: `Warm Stone (#5D5346)` & `Pure Off-White (#F5F5F5)`
  - UI Details: `Horizontal line divider (low opacity) at ~1/3 Hero height`
  - Texture: `None`
- **Typography Engine:**
  - Display (Serif): `Size: 191.42px`, `Line-height: 0.8`, `Tracking: -3.8px`, `Weight: 400`
  - UI & Project Names (Sans): `Family: 'Neue Haas Grotesk' (or Inter)`, `Size: 14px-18px`, `Weight: 400`
  - Featured Projects Header: `Paragraph style`, `Size: ~72px`, `Serif`, `Reduced from massive title`
- **Structural Topology:**
  - Header Nav: `3-column link structure (Col1: Projects/Approach/About, Col2: News/Blog, Col3: Contact)`
  - Hero Layout:
    - `Top: Divider line`
    - `Center: 'About' label + Central narrative paragraph`
    - `Bottom: 2-Row Headline (Row 1: 'FORM FOLLOWS', Row 2: 'FEELING' centered)`
  - Grid: `Mixed aspect ratio projects (Landscape vs Portrait)`
- **Component DNA:**
  - Project Cards: `Sans-serif typography for Project Names`, `Category in smaller Sans`
  - Navigation: `Arrow-based hover transitions (translate-x)`
- **Motion & Physics:**
  - Scroll: `High-inertia Smooth Scroll`
  - Transitions: `Subtle fade and scale components`

### [ID: CINE-10-AQUA] — "Aquamare" *(Pending Full Audit)*

### [ID: CINE-11-JESK] — "Jesko Jets" (Audited v1)
- **Atmospheric DNA:**
  - CanvasColor: `#1A1615` (Deep Espresso/Charcoal)
  - Focal Point: `Photorealistic Airplane Window (SVG/CSS Mask)`
  - Texture: `Heavy Vignette Gradient`
- **Typography Engine:**
  - Display: `Family: 'GT America Expanded'`, `Size: 103px`, `Weight: 500`, `Leading: 1.0`, `Tracking: -0.02em`
  - Body: `Family: 'GT America Expanded'`, `Size: 20px`, `Weight: 400`, `Leading: 1.4`
  - Nav/UI: `Weight: 500`, `Size: 16px`, `Transform: None`
- **Structural Topology:**
  - Archetype: `Asymmetrical Viewport (Diagonal Tension)`
  - Header: `Absolute`, `Logo: Center (Inside Window)`, `Split Links: Left (4 items) / Right (2 items)`
  - Hero Layout: `Headline 1: Top-Left`, `Headline 2: Bottom-Right`, `Subtext: Mid-Left`
- **Component DNA:**
  - CTA: `Pill Shape (Off-white #F5F5F5)`, `Text: Dark brown (#312726)`, `Icon: Small circle with airplane glyph`
  - Nav Architecture: `Logo: Center-pinned to viewport relative to window frame`
- **Motion & Physics:**
  - Entrance: `Cinematic depth parallax`, `Typography mask reveal`

---

## 3. SaaS / Tech Presets
*(Pending benchmark audits — see REFERENCE_LINKS.md)*

---

*Last synced from `Antigravity-Skills-Test` LIBRARY.md — 2026-02-26*
