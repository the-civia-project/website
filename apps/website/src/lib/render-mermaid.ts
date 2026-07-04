import { createHash } from 'node:crypto';
import {
  createMermaidRenderer,
  type MermaidRenderer,
} from 'mermaid-isomorphic';
import type { MermaidConfig } from 'mermaid';

export type MermaidTheme = 'light' | 'dark';

let renderer: MermaidRenderer | undefined;
const cache = new Map<string, string>();

const sharedNodeCss = `
  .node rect { stroke-width: 1px; }
  .node .label { font-family: arial, sans-serif; }
`;

const themeConfigs: Record<MermaidTheme, MermaidConfig> = {
  light: {
    theme: 'base',
    themeVariables: {
      darkMode: false,
      background: 'transparent',
      primaryColor: '#f4f4f5',
      primaryBorderColor: '#52525b',
      primaryTextColor: '#09090b',
      secondaryColor: '#e4e4e7',
      secondaryBorderColor: '#52525b',
      secondaryTextColor: '#09090b',
      tertiaryColor: '#fafafa',
      tertiaryBorderColor: '#a1a1aa',
      tertiaryTextColor: '#3f3f46',
      lineColor: '#52525b',
      textColor: '#09090b',
      mainBkg: '#f4f4f5',
      nodeBorder: '#52525b',
      clusterBkg: '#fafafa',
      clusterBorder: '#a1a1aa',
      titleColor: '#52525b',
      edgeLabelBackground: '#ffffff',
    },
    themeCSS: `
      ${sharedNodeCss}
      .node rect { fill: #f4f4f5 !important; stroke: #52525b !important; }
      .node .label { color: #09090b !important; }
      .cluster rect { fill: #fafafa !important; stroke: #a1a1aa !important; }
      .cluster-label .nodeLabel { color: #52525b !important; }
      .edgeLabel .label rect { fill: #ffffff !important; stroke: #52525b !important; }
      .edgeLabel .label text { fill: #3f3f46 !important; }
      .marker { fill: #52525b !important; stroke: #52525b !important; }
      .flowchartTitleText { fill: #52525b !important; }
    `,
  },
  dark: {
    theme: 'base',
    themeVariables: {
      darkMode: true,
      background: 'transparent',
      primaryColor: '#09090b',
      primaryBorderColor: '#52525b',
      primaryTextColor: '#fafafa',
      secondaryColor: '#18181b',
      secondaryBorderColor: '#52525b',
      secondaryTextColor: '#fafafa',
      tertiaryColor: '#27272a',
      tertiaryBorderColor: '#3f3f46',
      tertiaryTextColor: '#a1a1aa',
      lineColor: '#a1a1aa',
      textColor: '#fafafa',
      mainBkg: '#09090b',
      nodeBorder: '#52525b',
      clusterBkg: '#18181b',
      clusterBorder: '#3f3f46',
      titleColor: '#71717a',
      edgeLabelBackground: '#09090b',
    },
    themeCSS: `
      ${sharedNodeCss}
      .node rect { fill: #09090b !important; stroke: #52525b !important; }
      .node .label { color: #fafafa !important; }
      .cluster rect { fill: #18181b !important; stroke: #3f3f46 !important; }
      .cluster-label .nodeLabel { color: #71717a !important; }
      .edgeLabel .label rect { fill: #09090b !important; stroke: #52525b !important; }
      .edgeLabel .label text { fill: #a1a1aa !important; }
      .marker { fill: #a1a1aa !important; stroke: #a1a1aa !important; }
      .flowchartTitleText { fill: #71717a !important; }
    `,
  },
};

function getRenderer(): MermaidRenderer {
  renderer ??= createMermaidRenderer();
  return renderer;
}

function cacheKey(source: string, theme: MermaidTheme): string {
  return `${theme}:${source.trim()}`;
}

function diagramPrefix(source: string, theme: MermaidTheme): string {
  const hash = createHash('sha256')
    .update(cacheKey(source, theme))
    .digest('hex')
    .slice(0, 10);
  return `mermaid-${theme}-${hash}`;
}

/** Scope any un-prefixed rules in the SVG style block to the diagram id. */
function isolateSvgStyles(svg: string): string {
  const idMatch = svg.match(/<svg[^>]*\sid="([^"]+)"/);
  if (!idMatch) return svg;

  const id = idMatch[1];

  return svg.replace(/<style>([\s\S]*?)<\/style>/, (_match, css: string) => {
    const scoped = css.replace(
      /([^{}@/][^{]*?)\{/g,
      (ruleMatch: string, selector: string) => {
        const sel = selector.trim();
        if (!sel || sel.startsWith('@') || sel.includes(`#${id}`)) {
          return ruleMatch;
        }
        return `#${id} ${sel}{`;
      },
    );
    return `<style>${scoped}</style>`;
  });
}

export async function renderMermaid(
  source: string,
  theme: MermaidTheme,
): Promise<string> {
  const key = cacheKey(source, theme);
  const cached = cache.get(key);
  if (cached) return cached;

  const results = await getRenderer()([source.trim()], {
    mermaidConfig: themeConfigs[theme],
    prefix: diagramPrefix(source, theme),
  });
  const result = results[0];

  if (!result) {
    throw new Error('Mermaid render returned no results');
  }

  if (result.status === 'rejected') {
    throw result.reason;
  }

  const svg = isolateSvgStyles(result.value.svg);
  cache.set(key, svg);
  return svg;
}

export async function renderMermaidThemes(
  source: string,
): Promise<Record<MermaidTheme, string>> {
  const light = await renderMermaid(source, 'light');
  const dark = await renderMermaid(source, 'dark');
  return { light, dark };
}
