# Emiracle CWS

A modern web guide for Emiracles' Cast When Stunned (CWS) build for Path of Exile 1.

## Tech Stack

- **Framework**: [Astro](https://astro.build/) - Lightweight, fast, content-focused
- **Styling**: CSS with custom properties and animations
- **TypeScript**: For type-safe data management

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
emiracle-cws/
├── public/              # Static assets
├── src/
│   ├── assets/         # Images, fonts
│   ├── components/     # Reusable Astro components
│   ├── data/           # Build data (gear, gems, FAQ)
│   ├── layouts/        # Page layouts
│   ├── pages/          # Route pages
│   ├── styles/
│   │   ├── animations/ # Animation utilities
│   │   └── global.css  # Global styles & CSS variables
│   └── utils/          # Helper functions
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

## Adding Custom Animations

1. Open `src/styles/animations/custom.css`
2. Paste your animation CSS
3. Use the class names in your components

## Adding Content

Build data is managed in `src/data/build-data.ts`. Update the following:

- `gearItems` - Equipment recommendations
- `gemSetups` - Skill gem configurations
- `levelingSteps` - Leveling guide progression
- `faqItems` - Frequently asked questions
- `buildInfo` - General build metadata

## Credits

Build guide content by **Emiracles**
Website by a friend
