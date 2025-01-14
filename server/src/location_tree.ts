import {
  Location, Region, centroid, isInRegion,
  locationsInRegion, overlap, distanceMoreThan,
  distance,
  squaredDistance
} from "./locations";


export type LocationTree =
  | {readonly kind: "empty"}
  | {readonly kind: "single", readonly loc: Location}
  | {readonly kind: "split", readonly at: Location,
     readonly nw: LocationTree, readonly ne: LocationTree,
     readonly sw: LocationTree, readonly se: LocationTree};


/**
* Returns a tree containing exactly the given locations. Some effort is made to
* try to split the locations evenly so that the resulting tree has low height.
*/
export const buildTree = (locs: Array<Location>): LocationTree => {
if (locs.length === 0) {
  return {kind: "empty"};
} else if (locs.length === 1) {
  return {kind: "single", loc: locs[0]};
} else {
  // We must be careful to include each point in *exactly* one subtree. The
  // regions created below touch on the boundary, so we exlude them from the
  // lower side of each boundary.
  const c: Location = centroid(locs);
  return {kind: "split", at: c,
      nw: buildTree(locationsInRegion(locs,
          {x1: -Infinity, x2: c.x, y1: -Infinity, y2: c.y})
          .filter(loc => loc.x !== c.x && loc.y !== c.y)),  // exclude boundaries
      ne: buildTree(locationsInRegion(locs,
          {x1: c.x, x2: Infinity, y1: -Infinity, y2: c.y})
          .filter(loc => loc.y !== c.y)),  // exclude Y boundary
      sw: buildTree(locationsInRegion(locs,
          {x1: -Infinity, x2: c.x, y1: c.y, y2: Infinity})
          .filter(loc => loc.x !== c.x)),  // exclude X boundary
      se: buildTree(locationsInRegion(locs,
          {x1: c.x, x2: Infinity, y1: c.y, y2: Infinity})),
    };
}
}


/** Returns all the locations in the given tree that fall within the region. */
export const findLocationsInRegion =
  (tree: LocationTree, region: Region): Array<Location> => {
const locs: Array<Location> = [];
addLocationsInRegion(tree, region,
    {x1: -Infinity, x2: Infinity, y1: -Infinity, y2: Infinity}, locs);
return locs;
};

/**
* Adds all locations in the given tree that fall within the given region
* to the end of the given array.
* @param tree The (subtree) in which to search
* @param region Find locations inside this region
* @param bounds A region that contains all locations in the tree
* @param locs Array in which to add all the locations found
* @modifies locs
* @effects locs = locs_0 ++ all locations in the tree within this region
*/
const addLocationsInRegion =
  (tree: LocationTree, region: Region, bounds: Region, locs: Array<Location>): void => {

if (tree.kind === "empty") {
  // nothing to add

} else if (tree.kind === "single") {
  if (isInRegion(tree.loc, region))
    locs.push(tree.loc);

} else if (!overlap(bounds, region)) {
  // no points are within the region

} else {
  addLocationsInRegion(tree.nw, region,
    {x1: bounds.x1, x2: tree.at.x, y1: bounds.y1, y2: tree.at.y}, locs);
    addLocationsInRegion(tree.ne, region,
    {x1: tree.at.x, x2: bounds.x2, y1: bounds.y1, y2: tree.at.y}, locs);
    addLocationsInRegion(tree.sw, region,
    {x1: bounds.x1, x2: tree.at.x, y1: tree.at.y, y2: bounds.y2}, locs);
    addLocationsInRegion(tree.se, region,
    {x1: tree.at.x, x2: bounds.x2, y1: tree.at.y, y2: bounds.y2}, locs);
}
};


/**
* Returns closest of any locations in the tree to any of the given location.
* @param tree A tree containing locations to compare to
* @param loc The location to which to cmopare them
* @returns the closest point in the tree to that location, paired with its
*     distance to the closest location in locs
*/
export const findClosestInTree =
  (tree: LocationTree, locs: Array<Location>): [Location, number] => {
if (locs.length === 0)
  throw new Error('no locations passed in');
if (tree.kind === "empty")
  throw new Error('no locations in the tree passed in');

let closest = closestInTree(tree, locs[0], EVERYWHERE, NO_INFO);
for (const loc of locs) {
  const cl = closestInTree(tree, loc, EVERYWHERE, NO_INFO);
  if (cl.dist < closest.dist)
    closest = cl;
}
if (closest.loc === undefined)
  throw new Error('impossible: no closest found');
return [closest.loc, closest.dist];
};


/** Bounds that include the entire plane. */
export const EVERYWHERE: Region = {x1: -Infinity, x2: Infinity, y1: -Infinity, y2: Infinity};


/**
* A record containing the closest point found in the tree to reference point
* (or undefined if the tree is empty), the distance of that point to the
* reference point (or infinity if the tree is empty), and the number of
* distance calculations made during this process.
*/
type ClosestInfo = {loc: Location | undefined, dist: number, calcs: number};


/** A record that stores no closest point and no calculations performed. */
export const NO_INFO: ClosestInfo = {loc: undefined, dist: Infinity, calcs: 0};


/**
* Like above but also tracks all the information in a ClosestInfo record.
* The closest point returned is now the closer of the point found in the tree
* and the one passed in as an argument and the number of calculations is the
* sum of the number performed and the number passed in.
*/
export const closestInTree =
  (tree: LocationTree, loc: Location, bounds: Region, closest: ClosestInfo): ClosestInfo => {
  // TODO: implement in Task 4
  if (distanceMoreThan(loc, bounds, closest.dist)) {
    return closest;
  }

  if (tree.kind === "empty") {
    return closest;
  } else if (tree.kind === "single") {
    const distToSingle = distance(tree.loc, loc);
    if (distToSingle >= closest.dist) {
      return {loc: closest.loc, dist: closest.dist, calcs: closest.calcs + 1};
    } else {
      return {loc: tree.loc, dist: distToSingle, calcs: closest.calcs + 1};
    }
  } else { // tree.kind === "split"
    // First branch: loc is in first quadrant
    if (loc.x >= tree.at.x && loc.y < tree.at.y) {
      // (first > fourth > second > third)
      if (isNextQuadrantVertical(tree, loc, bounds)) {
        return closestInTree(tree.sw, loc, SW(tree.at, bounds),
                 closestInTree(tree.nw, loc, NW(tree.at, bounds),
                    closestInTree(tree.se, loc, SE(tree.at, bounds),
                      closestInTree(tree.ne, loc, NE(tree.at, bounds), closest))));
      // (first > second > fourth > third)
      } else {
        return closestInTree(tree.sw, loc, SW(tree.at, bounds),
                 closestInTree(tree.se, loc, SE(tree.at, bounds),
                    closestInTree(tree.nw, loc, NW(tree.at, bounds),
                      closestInTree(tree.ne, loc, NE(tree.at, bounds), closest))));
      }
    // Second branch: loc is in second quadrant
    } else if (loc.x < tree.at.x && loc.y < tree.at.y) {
      // (second > third > first > fourth)
      if (isNextQuadrantVertical(tree, loc, bounds)) {
        return closestInTree(tree.se, loc, SE(tree.at, bounds),
                  closestInTree(tree.ne, loc, NE(tree.at, bounds),
                      closestInTree(tree.sw, loc, SW(tree.at, bounds),
                        closestInTree(tree.nw, loc, NW(tree.at, bounds), closest))));
      // (second > first > third > fourth)
      } else {
        return closestInTree(tree.se, loc, SE(tree.at, bounds),
                  closestInTree(tree.sw, loc, SW(tree.at, bounds),
                      closestInTree(tree.ne, loc, NE(tree.at, bounds),
                        closestInTree(tree.nw, loc, NW(tree.at, bounds), closest))));
      }
    // Third branch: loc is in third quadrant
    } else if (loc.x < tree.at.x && loc.y >= tree.at.y) {
      // (third > second > fourth > first)
      if (isNextQuadrantVertical(tree, loc, bounds)) {
        return closestInTree(tree.ne, loc, NE(tree.at, bounds),
                  closestInTree(tree.se, loc, SE(tree.at, bounds),
                      closestInTree(tree.nw, loc, NW(tree.at, bounds),
                        closestInTree(tree.sw, loc, SW(tree.at, bounds), closest))));
      // (third > fourth > second > first)
      } else {
        return closestInTree(tree.ne, loc, NE(tree.at, bounds),
                  closestInTree(tree.nw, loc, NW(tree.at, bounds),
                      closestInTree(tree.se, loc, SE(tree.at, bounds),
                        closestInTree(tree.sw, loc, SW(tree.at, bounds), closest))));
      }
    // Fourth branch: loc is in fourth quadrant
    // loc.x >= tree.at.x && loc.y >= tree.at.y
    } else {
      // (fourth > first > third > second)
      if (isNextQuadrantVertical(tree, loc, bounds)) {
        return closestInTree(tree.nw, loc, NW(tree.at, bounds),
                  closestInTree(tree.sw, loc, SW(tree.at, bounds),
                      closestInTree(tree.ne, loc, NE(tree.at, bounds),
                        closestInTree(tree.se, loc, SE(tree.at, bounds), closest))));
      // (fourth > third > first > second)
      } else {
        return closestInTree(tree.nw, loc, NW(tree.at, bounds),
                  closestInTree(tree.ne, loc, NE(tree.at, bounds),
                      closestInTree(tree.sw, loc, SW(tree.at, bounds),
                        closestInTree(tree.se, loc, SE(tree.at, bounds), closest))));
      }
    }
  }
};

const isNextQuadrantVertical = (tree: LocationTree, loc: Location, bounds: Region): Boolean => {
  if (tree.kind === "empty" || tree.kind === "single") {
    throw new Error("Assumed tree is split but is empty or single");
  }

  // loc inside region
  if (bounds.x1 <= loc.x && loc.x <= bounds.x2 && bounds.y1 <= loc.y && loc.y <= bounds.y2) {
    return Math.abs(loc.x - tree.at.x) >= Math.abs(loc.y - tree.at.y);
  } else { // loc outside region
    const closestX = Math.max(bounds.x1, Math.min(loc.x, bounds.x2));
    const closestY = Math.max(bounds.y1, Math.min(loc.y, bounds.y2));

    // closest point to quadrant vertical to closest quadrant
    const closestToVertical: Location = {x: closestX, y: tree.at.y};
    // closest point to quadrant horizontal to closest quadrant
    const closestToHorizontal: Location = {x: tree.at.x, y: closestY};
    return squaredDistance(loc, closestToVertical) <= squaredDistance(loc, closestToHorizontal);
  }
}

/**
 * Returns the Northeast region of the given bounds with the given location at the center.
 * @param {Location} at - the location at the center
 * @param {Region} bounds - the bounds of the region
 * @returns {Region} the Northeast region
 */
const NE = (at: Location, bounds: Region): Region => {
  return { x1: at.x, y1: bounds.y1, x2: bounds.x2, y2: at.y };
};

/**
 * Returns the Northwest region of the given bounds with the given location at the center.
 * @param {Location} at - the location at the center
 * @param {Region} bounds - the bounds of the region
 * @returns {Region} the Northwest region
 */
const NW = (at: Location, bounds: Region): Region => {
  return { x1: bounds.x1, y1: bounds.y1, x2: at.x, y2: at.y };
};

/**
 * Returns the Southeast region of the given bounds with the given location at the center.
 * @param {Location} at - the location at the center
 * @param {Region} bounds - the bounds of the region
 * @returns {Region} the Southeast region
 */
const SE = (at: Location, bounds: Region): Region => {
  return { x1: at.x, y1: at.y, x2: bounds.x2, y2: bounds.y2 };
};

/**
 * Returns the Southwest region of the given bounds with the given location at the center.
 * @param {Location} at - the location at the center
 * @param {Region} bounds - the bounds of the region
 * @returns {Region} the Southwest region
 */
const SW = (at: Location, bounds: Region): Region => {
  return { x1: bounds.x1, y1: at.y, x2: at.x, y2: bounds.y2 };
};