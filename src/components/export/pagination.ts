export type PageBlock = { height: number; keepWithNext?: boolean };

export function paginateBlocks(blocks: PageBlock[], top = 28, bottom = 278) {
  let page = 1;
  let y = top;
  const usable = bottom - top;
  const heights = blocks.map((block) => Math.min(Math.max(0, block.height), usable));
  return blocks.map((_, index) => {
    const height = heights[index];
    let required = height;
    for (let next = index; blocks[next]?.keepWithNext && next + 1 < blocks.length; next++) {
      required += 3 + heights[next + 1];
    }
    if (required > usable) required = height;
    if (y > top && y + required > bottom) {
      page++;
      y = top;
    }
    const placement = { page, y, height };
    y += height + 3;
    return placement;
  });
}
