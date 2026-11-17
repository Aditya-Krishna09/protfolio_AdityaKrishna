# Website Development Assignment — Submission Notes

## Website introduction

Aditya Krishna’s personal resume website presents an emerging business and technology professional pursuing a BBA in Digital Business & Entrepreneurship at IIM Bangalore. It brings together his education, experience, capabilities, selected projects, recognition, and contact details in a recruiter-friendly portfolio.

**Live website:** https://adityakrishna.info  
**GitHub repository:** https://github.com/Aditya-Krishna09/protfolio_AdityaKrishna

**GitHub Pages:** https://aditya-krishna09.github.io/protfolio_AdityaKrishna/ (available after Pages deployment completes).

## Website sections

- **Hero and navigation:** Name, professional positioning, concise introduction, portrait, and links to key sections.
- **About and snapshot:** Interests, context, and verified highlights, including HotelSarthi adoption and peer AI sessions.
- **Capabilities:** Business strategy and analysis, product and digital business, marketing and growth, and practical technology applications.
- **Experience:** HotelSarthi, Nemo Jewels LLP — MIRAVI, Krishna Palace, and AI peer learning.
- **Selected projects:** Four case and concept projects, plus HotelSarthi and Krishna Palace digital work, with dedicated case-study pages.
- **Education and skills:** IIM Bangalore programme and relevant skills and interests.
- **Recognition:** Confirmed finalist and final-round outcomes, with participation clearly identified as participation.
- **Contact and footer:** Professional contact path through LinkedIn and page navigation.

## CSS improvements and design decisions

The existing site was upgraded in place using its separate `styles.css` file and plain HTML/CSS/JavaScript structure. Deep navy, off-white, and teal provide a consistent palette. Manrope supports readable interface text, Playfair Display adds contrast to editorial headings, and DM Mono distinguishes labels and metadata.

The layout uses a responsive navigation bar, CSS Grid for capability and project cards, Flexbox for navigation and tag groups, and positioned decorative details and timeline elements. Spacing, type sizes, and card layouts adapt through media queries for tablet and mobile widths. Hover states add subtle feedback; reduced-motion preferences remain supported.

The stylesheet demonstrates element selectors (`body`, `a`), class selectors (`.capability-card`, `.project-card`), ID selectors (`#about`, `#contact`), custom properties in `:root`, display and positioning properties, typography, margin and padding, and responsive media queries.

## Hosting

The site is a static HTML/CSS/JavaScript project hosted through GitHub Pages from the repository root. Preserve the `assets/` and `work/` folders. The custom domain https://adityakrishna.info is documented as a separate DNS configuration; the GitHub Pages project URL is included above.
