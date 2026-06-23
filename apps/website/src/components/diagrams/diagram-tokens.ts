/** Shared layout tokens for technical-paper SVG diagrams. */
export const W = 720;

export const P = 16;
export const ZONE_INSET = 16;
export const ZONE_HEADER = 28;
export const ZONE_FOOTER = 20;
export const ZONE_GAP = 20;

export const NODE_H = 48;
export const NODE_H_SM = 40;
export const NODE_RX = 12;
export const NODE_RX_SM = 8;
export const ARROW_GAP = 12;

export const FONT_ZONE = 11;
export const FONT_NODE = 10;
export const FONT_SUB = 9;
export const FONT_CAPTION = 9;
export const FONT_SMALL = 8;

export const C = {
  nodeFill: '#09090b',
  nodeStroke: '#52525b',
  zoneStroke: '#3f3f46',
  arrow: '#a1a1aa',
  text: '#fafafa',
  subtext: '#a1a1aa',
  label: '#71717a',
} as const;

/** Y baseline for a horizontally centered node row inside a zone. */
export function nodeRowY(zoneY: number): number {
  return zoneY + ZONE_HEADER + 8;
}

/** Center Y of a node row (for arrow alignment). */
export function nodeCenterY(zoneY: number, height = NODE_H): number {
  return nodeRowY(zoneY) + height / 2;
}

/** Zone label Y baseline. */
export function zoneLabelY(zoneY: number): number {
  return zoneY + ZONE_INSET + 4;
}

/** Footnote Y baseline inside a zone. */
export function zoneFootnoteY(zoneY: number, zoneHeight: number): number {
  return zoneY + zoneHeight - ZONE_INSET;
}

/** Zone height for a single node row, with optional footnote area. */
export function zoneHeight(nodeHeight = NODE_H, withFootnote = false): number {
  return (
    ZONE_HEADER + 8 + nodeHeight + (withFootnote ? ZONE_FOOTER : ZONE_INSET)
  );
}

/** Zone height for two stacked node rows plus optional footnote. */
export function zoneHeightDoubleRow(
  nodeHeight = NODE_H,
  rowGap = 20,
  withFootnote = false,
): number {
  return (
    ZONE_HEADER +
    8 +
    nodeHeight +
    rowGap +
    nodeHeight +
    (withFootnote ? ZONE_FOOTER : ZONE_INSET)
  );
}
