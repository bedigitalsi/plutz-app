# Design Refresh — Plutz Band Management App

## Overview
Redesigned the frontend to match the Plutz band website (plutzband.com) aesthetic: warm, earthy, country/folk music vibe. Replaced the generic Laravel Breeze gray/white theme with a warm cream and dark brown palette accented by teal.

## Color Palette
| Token | Hex | Usage |
|-------|-----|-------|
| `plutz-cream` | `#fbfaf7` | Main background |
| `plutz-cream-dark` | `#f3f1eb` | Input backgrounds, subtle surfaces |
| `plutz-brown` | `#3D3328` | Primary text, headings |
| `plutz-dark` | `#181513` | Nav bar, dark sections |
| `plutz-teal` | `#29768a` | Primary accent (buttons, links, active states) |
| `plutz-teal-dark` | `#1f5d6e` | Hover state for teal |
| `plutz-accent` | `#2c5a71` | Secondary accent |
| `plutz-accent-light` | `#3e606f` | Tertiary accent |
| `plutz-warm-gray` | `#8a7e72` | Muted text, secondary labels |

## Files Changed

### `tailwind.config.js`
- Added all brand colors under `theme.extend.colors`
- Added `Playfair Display` serif font family
- Added warm box shadows (`shadow-warm`, `shadow-warm-md`, `shadow-warm-lg`)

### `resources/css/app.css`
- Imported Playfair Display from Google Fonts
- Set base body text color to `plutz-brown`
- Made h1/h2/h3 use serif font by default
- Added `.plutz-card` and `.plutz-section-title` component classes
- Updated contract preview styling to use brand colors (teal headings, warm borders)

### `resources/js/Layouts/AuthenticatedLayout.tsx`
- Background: `bg-gray-100` → `bg-plutz-cream`
- Nav bar: `bg-white` → `bg-plutz-dark` (dark brown)
- Logo: removed gray background wrapper, displayed directly on dark nav
- User dropdown: dark-themed button with cream text
- Mobile hamburger: cream-colored on dark background
- Mobile menu: dark-themed with cream text and teal accents
- Header: warm shadow instead of gray

### `resources/js/Pages/Dashboard.tsx`
- All cards: `rounded-lg` → `rounded-xl`, warm shadows
- Section headings: serif font (Playfair Display)
- Text colors: gray → `plutz-brown` and `plutz-warm-gray`
- Inputs: cream background with teal focus rings
- Buttons: teal primary, cream-dark secondary
- Preset filter buttons: cream background
- Mutual Fund card: teal-to-accent gradient (was indigo)
- Group Costs summary: teal-tinted background (was blue)
- Stat values: amber/emerald/red (warmer tones)
- Links: teal colored instead of indigo

### `resources/js/Pages/Welcome.tsx`
- Background: `bg-gray-900` → `bg-plutz-dark`
- Cards: cream background, rounded-xl, warm shadows
- Welcome heading: serif font
- Button: teal primary
- Text: warm gray tones
- Inputs: cream-dark borders, teal focus

### `resources/js/Components/NavLink.tsx`
- Active state: teal bottom border, cream text
- Inactive: semi-transparent cream text
- Hover: cream text with subtle border

### `resources/js/Components/ResponsiveNavLink.tsx`
- Active: teal left border, teal-tinted background
- Inactive: cream text, brown hover background

### `resources/js/Components/PrimaryButton.tsx`
- Background: `bg-gray-800` → `bg-plutz-teal`
- Hover: `bg-plutz-teal-dark`
- Border radius: `rounded-md` → `rounded-xl`
- Focus ring: teal

### `resources/js/Layouts/GuestLayout.tsx`
- Background: `bg-gray-900` → `bg-plutz-dark`
- Card: `bg-white rounded-lg` → `bg-plutz-cream rounded-xl` with warm shadow
- More padding for breathing room

## Design Principles Applied
- **Warm & inviting** — cream backgrounds, brown text, no cold grays
- **Country/folk vibe** — Playfair Display serif for headings, earthy tones
- **Good contrast** — dark brown text on cream, white text on dark/teal
- **Subtle shadows** — custom warm-toned box shadows
- **Rounded corners** — consistent `rounded-xl` on cards and buttons
- **Consistent palette** — all colors derived from plutzband.com
