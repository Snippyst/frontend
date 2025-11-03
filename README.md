# Snippyst

A community platform for discovering and sharing Typst code snippets.

## What is Snippyst?

Snippyst is a web application where users can browse, share, and explore Typst snippets. Whether you're looking for reusable code for your documents or want to contribute your own creations, Snippyst makes it easy to collaborate with the Typst community.
It allows compiling Typst code directly in the browser for the latest Typst version. The backed even allows to contribute snippets in older Typst versions.

## Features

- Browse and search Typst snippets by tags
- Live preview of Typst code rendering
- Code syntax highlighting with Monaco editor
- User authentication via OAuth providers
- Vote on snippets to highlight the best content

## Getting Started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Building for Production

```bash
npm run build
node .output/server/index.js
```

## Development

Lint and format code:

```bash
npm run check
```

## License

This project is licensed under the AGPLv3 license.
