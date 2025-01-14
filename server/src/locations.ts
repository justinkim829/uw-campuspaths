/** Represents a location on the map. */
export type Location = {x: number, y: number};


/** Determines whether the two given locations are the same. */
export const sameLocation = (loc1: Location, loc2: Location): boolean => {
  return loc1.x === loc2.x && loc1.y === loc2.y;
}


/** Returns the squared distance between the two given locations */
export const squaredDistance = (loc1: Location, loc2: Location): number => {
  const dx = loc1.x - loc2.x;
  const dy = loc1.y - loc2.y;
  return dx*dx + dy*dy;
};


/** Returns the distance between the two given locations */
export const distance = (loc1: Location, loc2: Location): number => {
  return Math.sqrt(squaredDistance(loc1, loc2));
};


/**
 * Returns the locations in the given array but ordered so that they are
 * increasing in the given dimension.
 * @param locs The list of locations to sort
 * @param dim The coordinate to sort on
 * @returns The same locations as in locs but now in sorted order.
 */
export const sortedLocations =
    (locs: Array<Location>, dim: 'x' | 'y'): Array<Location> => {
  locs = locs.slice(0)
  if (dim === 'x') {
    locs.sort((a, b) => a.x - b.x);
  } else {
    locs.sort((a, b) => a.y - b.y);
  }
  return locs;
}


/**
 * Returns the average position of the given locations.
 * @requires locs.length >= 1
 */
export const centroid = (locs: Array<Location>): Location => {
  let sx = 0;
  let sy = 0;
  let i = 0;

  // Inv: sx = sum of locs[j].x for j = 0 .. i-1 and
  //      sy = sum of locs[j].y for j = 0 .. i-1
  while (i !== locs.length) {
    sx += locs[i].x;
    sy += locs[i].y;
    i = i + 1;
  }

  return {x: sx / locs.length, y: sy / locs.length};;
};


/**
 * Represents a rectangular range of space on the map. Note that infinite values
 * (Infinity and -Infinity) are allowed for the ends of either dimension.
 * Inv: x1 <= x2 and y1 <= y2
 */
export type Region = {x1: number, x2: number, y1: number, y2: number};


/** Determines whether the given location falls inside the given region. */
export const isInRegion = (loc: Location, region: Region): boolean => {
  return region.x1 <= loc.x && loc.x <= region.x2 &&
  region.y1 <= loc.y && loc.y <= region.y2;
}


/** Returns the subset of the given locations inside the given region. */
export const locationsInRegion =
    (locs: Array<Location>, region: Region): Array<Location> => {
  const inLocs: Array<Location> = [];

  // Inv: inLocs = locationsInRegion(locs[0 .. i-1], region)
  for (const loc of locs) {
    if (isInRegion(loc, region))
      inLocs.push(loc);
  }

  return inLocs;
};


/** Determines if the two given regions overlap. */
export const overlap = (region1: Region, region2: Region): boolean => {
  const noOverlapX = (region1.x2 < region2.x1) || (region2.x2 < region1.x1);
  const noOverlapY = (region1.y2 < region2.y1) || (region2.y2 < region1.y1);
  return !noOverlapX && !noOverlapY;
};


/**
 * Determines whether the distance of the given location to the closest point in
 * the given region is more than the given amount. Note that this calculation is
 * done without any calls to "distance" above (i.e., with no square roots).
 */
export const distanceMoreThan = (loc: Location, region: Region, dist: number): boolean => {
  // TODO: implement this in Task 3
  if (dist < 0) {
      throw new Error(`dist has to be non-negative: ${dist}`);
  }

  // loc is inside region
  if (region.x1 <= loc.x && loc.x <= region.x2 && region.y1 <= loc.y && loc.y <= region.y2) {
    return false;
  }

  const squaredDist = dist * dist;

  const closestX = Math.max(region.x1, Math.min(loc.x, region.x2));
  const closestY = Math.max(region.y1, Math.min(loc.y, region.y2));

  const squaredDistToClosestPoint = squaredDistance(loc, {x: closestX, y: closestY});

  return squaredDistToClosestPoint > squaredDist;

  // // First branch: loc is inside region
  // if (region.x1 <= loc.x && loc.x <= region.x2 && region.y1 <= loc.y && loc.y <= region.y2) {
  //     return false;
  // // Second branch: loc is in line with the region vertically
  // } else if (region.x1 <= loc.x && loc.x <= region.x2 && (loc.y > region.y2 || loc.y < region.y1)) {
  //     if (loc.y >= region.y2) {
  //         return loc.y - region.y2 > dist
  //     } else { // loc.y < region.y1
  //         return region.y1 - loc.y > dist
  //     }
  // // Third branch: loc is in line with the region vertically
  // } else if (region.y1 <= loc.y && loc.y <= region.y2 && (loc.x > region.x2 || loc.x < region.x1)) {
  //     if (loc.x >= region.x2) {
  //         return loc.x - region.x2 > dist
  //     } else { // loc.x < region.x1
  //         return region.x1 - loc.x > dist
  //     }
  // // Fourth branch: loc is in a diagonal position from the region bounds
  // } else {
  //     const squaredDist: number = dist * dist;
  //     const xCorner: number = loc.x > region.x2 ? loc.x - region.x2 : region.x1 - loc.x;
  //     const yCorner: number = loc.y > region.y2 ? loc.y - region.y2 : region.x1 - loc.x;
  //     const cornerLoc: Location = {x: xCorner, y: yCorner};
  //     if (squaredDistance(loc, cornerLoc) < 1) {
  //       return squaredDistance(loc, cornerLoc) < squaredDist
  //     } else {
  //       return squaredDistance(loc, cornerLoc) > squaredDist
  //     }
  // }
};
