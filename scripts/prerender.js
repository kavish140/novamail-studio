import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.resolve(__dirname, "../dist");
const templatePath = path.join(distDir, "index.html");

if (!fs.existsSync(templatePath)) {
  console.error("❌ prerender.js: dist/index.html not found. Did you run vite build first?");
  process.exit(1);
}

const templateHtml = fs.readFileSync(templatePath, "utf-8");

const routes = [
  {
    path: "/docs",
    title: "Documentation — NovaMail API",
    description:
      "Quickstart, authentication, and reference for the NovaMail transactional email API.",
    url: "https://mail.sitenova.dev/docs",
  },
  {
    path: "/login",
    title: "Sign in — NovaMail",
    description: "Sign in to your NovaMail account to manage API keys, domains, and email logs.",
    url: "https://mail.sitenova.dev/login",
  },
  {
    path: "/signup",
    title: "Create your NovaMail account",
    description:
      "Create a NovaMail account and send your first transactional email in under five minutes.",
    url: "https://mail.sitenova.dev/signup",
  },
];

// Helper to replace meta tags in the template
function injectSEO(html, route) {
  let modified = html;

  // Replace title
  modified = modified.replace(/<title>.*?<\/title>/, `<title>${route.title}</title>`);

  // Replace standard description
  modified = modified.replace(
    /<meta name="description" content=".*?"\s*\/>/,
    `<meta name="description" content="${route.description}" />`,
  );

  // Replace canonical
  modified = modified.replace(
    /<link rel="canonical" href=".*?"\s*\/>/,
    `<link rel="canonical" href="${route.url}" />`,
  );

  // Replace Open Graph title, description, url
  modified = modified.replace(
    /<meta property="og:title" content=".*?"\s*\/>/,
    `<meta property="og:title" content="${route.title}" />`,
  );
  modified = modified.replace(
    /<meta property="og:description" content=".*?"\s*\/>/,
    `<meta property="og:description" content="${route.description}" />`,
  );
  modified = modified.replace(
    /<meta property="og:url" content=".*?"\s*\/>/,
    `<meta property="og:url" content="${route.url}" />`,
  );

  // Replace Twitter title, description, url
  modified = modified.replace(
    /<meta property="twitter:title" content=".*?"\s*\/>/,
    `<meta property="twitter:title" content="${route.title}" />`,
  );
  modified = modified.replace(
    /<meta property="twitter:description" content=".*?"\s*\/>/,
    `<meta property="twitter:description" content="${route.description}" />`,
  );
  modified = modified.replace(
    /<meta property="twitter:url" content=".*?"\s*\/>/,
    `<meta property="twitter:url" content="${route.url}" />`,
  );

  return modified;
}

console.log("🚀 Prerendering static HTML for SEO...");

routes.forEach((route) => {
  const routeDir = path.join(distDir, route.path);

  // Create directory if it doesn't exist
  if (!fs.existsSync(routeDir)) {
    fs.mkdirSync(routeDir, { recursive: true });
  }

  const finalHtml = injectSEO(templateHtml, route);
  const outputPath = path.join(routeDir, "index.html");

  fs.writeFileSync(outputPath, finalHtml, "utf-8");
  console.log(`✅ Generated: ${route.path}/index.html`);
});

// Create the GitHub Pages fallback
const fallbackPath = path.join(distDir, "404.html");
fs.writeFileSync(fallbackPath, templateHtml, "utf-8");
console.log(`✅ Generated: /404.html (Fallback)`);

console.log("✨ Prerendering complete.");
