# Rixl Documentation

Documentation site built with **TanStack Start**, **Fumadocs v16**, **Vite+**, **Tailwind CSS v4**, and **React 19**.

## 🚀 Quick Start

Install [Vite+](https://viteplus.dev) (`vp`) once; it manages Node and the package manager for you.

### Install Dependencies

```bash
vp install
```

### Development

```bash
vp dev
```

Visit: http://localhost:3000

### Build

```bash
vp run build
```

### Preview the production build

```bash
vp preview
```

## 📁 Project Structure

```
docs/
├── app/
│   ├── routes/          # TanStack Router routes
│   │   ├── __root.tsx   # Root layout
│   │   ├── index.tsx    # Home page
│   │   └── $lang.*.tsx  # Docs routes
│   ├── client.tsx       # Client entry
│   ├── server.tsx       # Server entry
│   └── global.css       # Global styles
├── components/          # React components
├── lib/                 # Utilities
├── content/             # MDX documentation
│   └── docs/
│       └── en/          # English docs
├── vite.config.ts       # Vite config
└── package.json
```

## 🛠️ Tech Stack

- **Framework**: TanStack Start
- **Build Tool**: Vite (⚡ fast HMR)
- **SSR**: Nitro
- **Router**: TanStack Router
- **Docs**: Fumadocs v16.2
- **Styling**: Tailwind CSS v4
- **Runtime**: Bun
- **Language**: TypeScript

## 📝 Available Scripts

```bash
vp dev              # Dev server with HMR
vp run build        # Clean + lint + production build
vp preview          # Preview the production build
vp run serve        # Serve the static build output
vp run lint         # Oxlint + fumadocs-mdx
vp run lint:fix     # Fix linting issues
vp run lint:links   # Check internal links in content
vp fmt              # Format code
```

## 📚 Documentation

- [TanStack Start](https://tanstack.com/start/latest)
- [TanStack Router](https://tanstack.com/router/latest)
- [Fumadocs](https://fumadocs.vercel.app/)
- [Tailwind CSS](https://tailwindcss.com/)

## 🚀 Deployment

Deployed to the **Cloudflare Worker `rixl-docs`** (`docs.rixl.com`) by Cloudflare Workers Builds:
every PR gets a preview URL, and merging to `main` uploads a tagged version that the
`rollout.yml` workflow smoke-tests and promotes. No manual deploy step.

## 📄 License

See LICENSE.md

---

Built with ❤️ by the Rixl team
