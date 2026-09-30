# FastBlitz — Premium Onboarding

Ek hi cheez banayenge, ekdam top-class: FastBlitz ka onboarding flow. Screenshots wala dark look rakhenge, par "AI slop" hata kar Lovable-jaisa refined, animated experience banayenge. Sab demo par chalega — koi login ya save nahi.

## Screens (7 steps, ek hi flow)

1. Welcome — logo, naam, company name, optional logo upload
2. Analyze your website — website URL ya "use description instead" toggle
3. Tell us about your company — guided description box with character counter
4. Tell us about yourself — team size + monthly revenue chips
5. What describes you best? — role chips
6. What type of business do you run? — B2B/B2C/Both + category chips (multi-select)
7. Why did you sign up? — goal + expectations (multi-select)

Last step ke baad ek short "Setting up your workspace" moment aur phir ek clean summary screen jisme sab answers dikhenge.

## Design direction

- Deep near-black base, ek dheemi aurora glow jo slowly move karti hai, bareek grain texture, aur hairline borders — flat purple gradient wala look nahi.
- Ek hi accent family (electric blue se violet), soft glow sirf active element par. Har cheez par gradient nahi.
- Typography: ek confident display face headings ke liye, clean grotesk body ke liye. Screenshots ki generic default type nahi.
- Progress: neeche dots ki jagah ek slim segmented progress rail with step labels.
- Motion: har step ka content stagger ho kar aata hai, forward/backward direction ke hisaab se slide hota hai, chips select par ek chhota physical snap, Continue button par light sweep. Sab restrained — kuch bhi bounce nahi karega.
- Keyboard support: Enter se aage, Esc/Back se peeche, chips arrow keys se.
- Mobile par full-height single column, thumb-friendly chips aur bottom-anchored Continue.

## Functionality (demo)

- Saare steps ka state ek jagah rakha jayega; Back/Continue se values wapas dikhengi.
- Validation: required fields ke bina Continue disabled, URL ka basic check, description ka min length counter.
- Logo upload: drag & drop + click, preview, 5MB limit, PNG/JPG/WebP/GIF check — sirf browser me, upload kahin nahi hoga.
- "Analyse Website" par ek realistic 2–3 second analysing animation aur demo brand summary (product, audience, tone) jo step 3 ko pre-fill kar de.
- Refresh par sab reset (jaisa aapne chaha — demo only).

## Technical notes

- New route `/` = onboarding flow; ek `OnboardingProvider` (React context + reducer) saara state, step navigation, aur validation handle karega. Har step apna component.
- Animated background ek dedicated `AuroraBackground` component: CSS/SVG layered gradients + grain, GPU-friendly transforms, `prefers-reduced-motion` respect karega. Koi WebGL nahi.
- Motion for React se step transitions (`AnimatePresence`, directional variants) aur stagger.
- Design tokens (`src/styles.css`) me nayi dark palette, glow shadows, radius aur fonts — components me hardcoded colors nahi.
- Uploaded horse logo ko Lovable asset pointer ke through use karenge; uska blue square background trim kar ke transparent version banayenge taaki header par clean baithe.
- Route head() me FastBlitz-specific title/description/og tags.
- Baad me jab bahut screens (Blitz feed, editor, settings, billing) banayenge to yahi token system aur layout shell reuse hoga.

## Is round me nahi

Blitz swipe feed, content editor, Blitz settings, billing — ye abhi nahi; aapne sirf onboarding chuna hai.
