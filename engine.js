(function (root) {
  'use strict';
  // QUIKRETE Concrete Mix data sheet (1101): yield per bag in cubic feet, and 6 to 9 pints of water per 80 lb bag.
  var YIELD = { 40: 0.30, 50: 0.375, 60: 0.45, 80: 0.60, 90: 0.675 };
  var WATER_PER_LB = { lo: 6 / 80, hi: 9 / 80 };
  var IN3_PER_FT3 = 1728, FT3_PER_YD3 = 27;
  function slab(lenFt, widFt, thickIn) {
    lenFt = +lenFt; widFt = +widFt; thickIn = +thickIn;
    if (!(lenFt > 0 && widFt > 0 && thickIn > 0)) return null;
    return lenFt * widFt * (thickIn / 12);
  }
  function round(diaIn, depthIn, count) {
    diaIn = +diaIn; depthIn = +depthIn; count = count === '' || count === undefined ? 1 : +count;
    if (!(diaIn > 0 && depthIn > 0 && count >= 1)) return null;
    var r = diaIn / 2;
    return Math.PI * r * r * depthIn * count / IN3_PER_FT3;
  }
  // post hole: the hole minus the post that sits in it (square post side in inches, 0 for none)
  function postHole(diaIn, depthIn, count, postSideIn) {
    var hole = round(diaIn, depthIn, count); if (hole === null) return null;
    var side = +postSideIn || 0; if (side < 0) return null;
    var c = count === '' || count === undefined ? 1 : +count;
    var post = side * side * depthIn * c / IN3_PER_FT3;
    return Math.max(0, hole - post);
  }
  function plan(cuft, bagLb, wastePct) {
    var y = YIELD[bagLb]; if (!y || !(cuft > 0)) return null;
    var w = +wastePct || 0; if (w < 0) return null;
    var need = cuft * (1 + w / 100);
    var bags = Math.ceil(need / y - 1e-9);
    var lb = bags * bagLb;
    return {
      cuft: cuft, cuyd: cuft / FT3_PER_YD3, need: need, bags: bags, dryLb: lb, yieldCuft: bags * y,
      leftover: bags * y - need, waterPtLo: lb * WATER_PER_LB.lo, waterPtHi: lb * WATER_PER_LB.hi,
      bagsPerYd: FT3_PER_YD3 / y
    };
  }
  // cost per cubic foot of finished concrete for each bag size, given prices
  function bestSize(prices) {
    var out = [];
    Object.keys(prices).forEach(function (k) { var p = +prices[k]; if (p > 0 && YIELD[k]) out.push({ lb: +k, perCuft: p / YIELD[k] }); });
    out.sort(function (a, b) { return a.perCuft - b.perCuft; });
    return out;
  }
  var api = { YIELD: YIELD, slab: slab, round: round, postHole: postHole, plan: plan, bestSize: bestSize, WATER_PER_LB: WATER_PER_LB };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.SlabBags = api;
})(typeof window !== 'undefined' ? window : this);
