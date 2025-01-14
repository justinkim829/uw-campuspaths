import * as assert from 'assert';
import {
    buildTree, findLocationsInRegion, findClosestInTree, NO_INFO, EVERYWHERE, closestInTree
  } from './location_tree';


describe('location_tree', function() {

  it('buildTree', function() {
    assert.deepStrictEqual(buildTree([]), {kind: "empty"});

    assert.deepStrictEqual(buildTree([{x: 1, y: 1}]),
        {kind: "single", loc: {x: 1, y: 1}});
    assert.deepStrictEqual(buildTree([{x: 2, y: 2}]),
        {kind: "single", loc: {x: 2, y: 2}});

    assert.deepStrictEqual(buildTree([{x: 1, y: 1}, {x: 3, y: 3}]),
        {kind: "split", at: {x: 2, y: 2},
         nw: {kind: "single", loc: {x: 1, y: 1}},
         ne: {kind: "empty"},
         sw: {kind: "empty"},
         se: {kind: "single", loc: {x: 3, y: 3}}});
    assert.deepStrictEqual(buildTree([{x: 1, y: 3}, {x: 3, y: 1}]),
        {kind: "split", at: {x: 2, y: 2},
         nw: {kind: "empty"},
         ne: {kind: "single", loc: {x: 3, y: 1}},
         sw: {kind: "single", loc: {x: 1, y: 3}},
         se: {kind: "empty"}});

    assert.deepStrictEqual(buildTree(
        [{x: 1, y: 1}, {x: 3, y: 3}, {x: 5, y: 5}, {x: 7, y: 7}]),
        {kind: "split", at: {x: 4, y: 4},
         nw: {kind: "split", at: {x: 2, y: 2},
              nw: {kind: "single", loc: {x: 1, y: 1}},
              ne: {kind: "empty"},
              sw: {kind: "empty"},
              se: {kind: "single", loc: {x: 3, y: 3}}},
         ne: {kind: "empty"},
         sw: {kind: "empty"},
         se: {kind: "split", at: {x: 6, y: 6},
              nw: {kind: "single", loc: {x: 5, y: 5}},
              ne: {kind: "empty"},
              sw: {kind: "empty"},
              se: {kind: "single", loc: {x: 7, y: 7}}}});
    assert.deepStrictEqual(buildTree(
        [{x: 1, y: 1}, {x: 3, y: 3}, {x: 5, y: 3}, {x: 7, y: 1},
         {x: 1, y: 7}, {x: 3, y: 5}, {x: 5, y: 5}, {x: 7, y: 7}]),
        {kind: "split", at: {x: 4, y: 4},
         nw: {kind: "split", at: {x: 2, y: 2},
              nw: {kind: "single", loc: {x: 1, y: 1}},
              ne: {kind: "empty"},
              sw: {kind: "empty"},
              se: {kind: "single", loc: {x: 3, y: 3}}},
         ne: {kind: "split", at: {x: 6, y: 2},
              nw: {kind: "empty"},
              sw: {kind: "single", loc: {x: 5, y: 3}},
              ne: {kind: "single", loc: {x: 7, y: 1}},
              se: {kind: "empty"}},
         sw: {kind: "split", at: {x: 2, y: 6},
              nw: {kind: "empty"},
              ne: {kind: "single", loc: {x: 3, y: 5}},
              sw: {kind: "single", loc: {x: 1, y: 7}},
              se: {kind: "empty"}},
         se: {kind: "split", at: {x: 6, y: 6},
              nw: {kind: "single", loc: {x: 5, y: 5}},
              ne: {kind: "empty"},
              sw: {kind: "empty"},
              se: {kind: "single", loc: {x: 7, y: 7}}}});
  });

  it('findLocationsInRegion', function() {
    assert.deepStrictEqual(findLocationsInRegion(
        buildTree([]),
        {x1: 1, x2: 2, y1: 1, y2: 2}),
      []);

    assert.deepStrictEqual(findLocationsInRegion(
        buildTree([{x: 0, y: 0}]),
        {x1: 1, x2: 3, y1: 1, y2: 3}),
      []);
    assert.deepStrictEqual(findLocationsInRegion(
        buildTree([{x: 2, y: 2}]),
        {x1: 1, x2: 3, y1: 1, y2: 3}),
      [{x: 2, y: 2}]);

    assert.deepStrictEqual(findLocationsInRegion(
        buildTree([{x: 0, y: 0}, {x: 2, y: 2}]),
        {x1: 1, x2: 3, y1: 1, y2: 3}),
      [{x: 2, y: 2}]);
    assert.deepStrictEqual(findLocationsInRegion(
        buildTree([{x: 0, y: 0}, {x: 1, y: 1}, {x: 2, y: 2}, {x: 3, y: 3},
                   {x: 4, y: 4}]),
        {x1: 1, x2: 3, y1: 1, y2: 3}),
      [{x: 1, y: 1}, {x: 2, y: 2}, {x: 3, y: 3}]);
    assert.deepStrictEqual(findLocationsInRegion(
        buildTree([{x: 0, y: 4}, {x: 1, y: 3}, {x: 2, y: 2}, {x: 3, y: 4},
                   {x: 4, y: 0}]),
        {x1: 1, x2: 3, y1: 1, y2: 3}),
      [{x: 2, y: 2}, {x: 1, y: 3}]);
  });

  it('closestInTree', function() {
    // TODO: implement this in Task 4
    // Loop/Recursion 0 times
    assert.deepStrictEqual(closestInTree(
        buildTree([]), {x: 1, y: 1}, EVERYWHERE, NO_INFO),
        NO_INFO);
    assert.deepStrictEqual(closestInTree(
        buildTree([{x: 2, y: 1}]), {x: 1, y: 1}, EVERYWHERE, NO_INFO),
        {loc: {x: 2, y: 1}, dist: 1, calcs: 1});
    assert.deepStrictEqual(closestInTree(
        buildTree([{x: 3, y: 1}]), {x: 1, y: 1}, EVERYWHERE, {loc: {x: 1.5, y: 1}, dist: 0.5, calcs: 0}),
        {loc: {x: 1.5, y: 1}, dist: 0.5, calcs: 1});

    // Loop/Recursion 1 time
    // 8 cases below make sure all branches inside the else branch (i.e. when tree is split) is covered
    // First branch: loc is in First quadrant
    assert.deepStrictEqual(closestInTree(
      buildTree([{x: 2, y: 3}, {x: 6, y: 3}, {x: 2, y: 5}, {x: 6, y: 5}]),
      {x: 9, y: 3}, EVERYWHERE, NO_INFO),
      {loc: {x: 6, y: 3}, dist: 3, calcs: 2});
    assert.deepStrictEqual(closestInTree(
      buildTree([{x: 2, y: 3}, {x: 6, y: 3}, {x: 2, y: 5}, {x: 6, y: 5}]),
      {x: 6, y: 1}, EVERYWHERE, NO_INFO),
      {loc: {x: 6, y: 3}, dist: 2, calcs: 2});

    // Second branch: loc is in Second quadrant
    assert.deepStrictEqual(closestInTree(
      buildTree([{x: 2, y: 3}, {x: 6, y: 3}, {x: 2, y: 5}, {x: 6, y: 5}]),
      {x: 2, y: 1}, EVERYWHERE, NO_INFO),
      {loc: {x: 2, y: 3}, dist: 2, calcs: 2});
    assert.deepStrictEqual(closestInTree(
      buildTree([{x: 2, y: 3}, {x: 6, y: 3}, {x: 2, y: 5}, {x: 6, y: 5}]),
      {x: 1, y: 3}, EVERYWHERE, NO_INFO),
      {loc: {x: 2, y: 3}, dist: 1, calcs: 2});

    // Third branch: loc is in Third quadrant
    assert.deepStrictEqual(closestInTree(
        buildTree([{x: 2, y: 3}, {x: 6, y: 3}, {x: 2, y: 5}, {x: 6, y: 5}]),
        {x: 2, y: 7}, EVERYWHERE, NO_INFO),
        {loc: {x: 2, y: 5}, dist: 2, calcs: 2});
    assert.deepStrictEqual(closestInTree(
        buildTree([{x: 2, y: 3}, {x: 6, y: 3}, {x: 2, y: 5}, {x: 6, y: 5}]),
        {x: 1, y: 5}, EVERYWHERE, NO_INFO),
        {loc: {x: 2, y: 5}, dist: 1, calcs: 2});

    // Fourth branch: loc is in Fourth quadrant
    assert.deepStrictEqual(closestInTree(
        buildTree([{x: 2, y: 3}, {x: 6, y: 3}, {x: 2, y: 5}, {x: 6, y: 5}]),
        {x: 6, y: 7}, EVERYWHERE, NO_INFO),
        {loc: {x: 6, y: 5}, dist: 2, calcs: 2});
    assert.deepStrictEqual(closestInTree(
      buildTree([{x: 2, y: 3}, {x: 6, y: 3}, {x: 2, y: 5}, {x: 6, y: 5}]),
      {x: 9, y: 9}, EVERYWHERE, NO_INFO),
      {loc: {x: 6, y: 5}, dist: 5, calcs: 3});

    // Loop/Recursion 2 or more times
    assert.deepStrictEqual(closestInTree(
      buildTree([{x: 1, y: 2}, {x: 7, y: 1}, {x: 4.5, y: 6}, {x: 4.5, y: 6.5}, {x: 4.5, y: 7}]),
      {x: 2, y: 6.2}, EVERYWHERE, NO_INFO),
      {loc: {x: 4.5, y: 6}, dist: Math.sqrt(2.5 * 2.5 + 0.04), calcs: 2});
    assert.deepStrictEqual(closestInTree(
      {kind: "split", at: {x: 4, y: 4},
        nw: {kind: "single", loc: {x: 1, y: 2}},
        ne: {kind: "single", loc: {x: 3, y: 1}},
        sw: {kind: "empty"},
        se: {kind: 'split', at: {x: 5, y: 10},
            nw: {kind: "single", loc: {x: 5, y: 9}},
            ne: {kind: "empty"},
            se: {kind: "empty"},
            sw: {kind: "single", loc: {x: 5, y: 11}},
        }
      },
      {x: 3.5, y: 9}, EVERYWHERE, NO_INFO),
      {loc: {x: 5, y: 9}, dist: 1.5, calcs: 2});
  });

  // TODO: uncomment these in Task 4
  it('findClosestInTree', function() {
    assert.deepStrictEqual(findClosestInTree(
        buildTree([{x: 2, y: 1}]),
        [{x: 1, y: 1}]),
      [{x: 2, y: 1}, 1]);
    assert.deepStrictEqual(findClosestInTree(
        buildTree([{x: 3, y: 1}, {x: 2, y: 1}, {x: 1, y: 3}]),
        [{x: 1, y: 1}]),
      [{x: 2, y: 1}, 1]);
    assert.deepStrictEqual(findClosestInTree(
        buildTree([{x: 1, y: 1}, {x: 1, y: 5}, {x: 5, y: 1}, {x: 5, y: 5}]),
        [{x: 2, y: 1}]),
      [{x: 1, y: 1}, 1]);
    assert.deepStrictEqual(findClosestInTree(
        buildTree([{x: 1, y: 1}, {x: 1, y: 5}, {x: 5, y: 1}, {x: 5, y: 5}]),
        [{x: 2, y: 1}, {x: 4.9, y: 4.9}]),
      [{x: 5, y: 5}, Math.sqrt((5-4.9)**2+(5-4.9)**2)]);
    assert.deepStrictEqual(findClosestInTree(
        buildTree([{x: 1, y: 1}, {x: 1, y: 5}, {x: 5, y: 1}, {x: 5, y: 5}]),
        [{x: 2, y: 1}, {x: -1, y: -1}]),
      [{x: 1, y: 1}, 1]);
    assert.deepStrictEqual(findClosestInTree(
        buildTree([{x: 1, y: 1}, {x: 1, y: 5}, {x: 5, y: 1}, {x: 5, y: 5}]),
        [{x: 4, y: 1}, {x: -1, y: -1}, {x: 10, y: 10}]),
      [{x: 5, y: 1}, 1]);
  });


});
