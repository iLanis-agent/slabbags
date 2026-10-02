var E = require('./engine.js'), n = 0, bad = 0;
function near(a, b, tol, m) { n++; if (!(Math.abs(a - b) <= tol)) { bad++; console.log('FAIL', m, a, b); } }
function is(a, b, m) { n++; if (a !== b) { bad++; console.log('FAIL', m, a, b); } }
// QUIKRETE data sheet yields: 40 lb .30, 50 lb .375, 60 lb .45, 80 lb .60, 90 lb .675 cu ft
near(E.YIELD[40], 0.30, 0, 'y40'); near(E.YIELD[50], 0.375, 0, 'y50'); near(E.YIELD[60], 0.45, 0, 'y60'); near(E.YIELD[80], 0.60, 0, 'y80'); near(E.YIELD[90], 0.675, 0, 'y90');
// 27 cu ft per cubic yard: 45 bags of 80 lb per yard (calculatingconcrete.com: "roughly 45")
near(E.plan(1, 80, 0).bagsPerYd, 45, 1e-9, '45 per yd'); near(E.plan(1, 60, 0).bagsPerYd, 60, 1e-9, '60 per yd'); near(E.plan(1, 40, 0).bagsPerYd, 90, 1e-9, '90 per yd');
// slab 10 x 10 x 4 in = 33.333 cu ft = 1.2346 yd
near(E.slab(10, 10, 4), 100 / 3, 1e-9, 'slab cuft'); near(E.plan(E.slab(10, 10, 4), 80, 0).cuyd, 1.2346, 0.0001, 'slab yd');
// 33.333 / 0.6 = 55.56 -> 56 bags; with 10% waste 36.667/.6 = 61.1 -> 62
is(E.plan(E.slab(10, 10, 4), 80, 0).bags, 56, '56 bags'); is(E.plan(E.slab(10, 10, 4), 80, 10).bags, 62, '62 bags waste');
// exact multiple does not round up: 0.6 cu ft = 1 bag of 80; 1.2 cu ft = 2 bags
is(E.plan(0.6, 80, 0).bags, 1, 'exact 1'); is(E.plan(1.2, 80, 0).bags, 2, 'exact 2'); is(E.plan(0.61, 80, 0).bags, 2, 'just over');
// 4 in slab 4x4 ft = 5.333 cu ft = 8.9 -> 9 bags of 80
is(E.plan(E.slab(4, 4, 4), 80, 0).bags, 9, '4x4');
// round: 10 in hole, 30 in deep = pi*25*30/1728 = 1.3635 cu ft; 4 holes
near(E.round(10, 30, 1), Math.PI * 25 * 30 / 1728, 1e-12, 'hole'); near(E.round(10, 30, 1), 1.3635, 0.0001, 'hole value'); near(E.round(10, 30, 4), 4 * E.round(10, 30, 1), 1e-12, 'four');
// 4x4 post (actual 3.5 in) in the hole displaces concrete
near(E.postHole(10, 30, 1, 3.5), E.round(10, 30, 1) - 3.5 * 3.5 * 30 / 1728, 1e-12, 'post displaces');
near(E.postHole(10, 30, 1, 0), E.round(10, 30, 1), 1e-12, 'no post'); is(E.postHole(2, 30, 1, 20) >= 0, true, 'floor zero');
// water: 6 to 9 pints per 80 lb bag; 2 bags = 12 to 18 pt; 60 lb bag = 4.5 to 6.75 pt
var p = E.plan(1.2, 80, 0); near(p.waterPtLo, 12, 1e-9, 'water lo'); near(p.waterPtHi, 18, 1e-9, 'water hi'); near(E.plan(0.45, 60, 0).waterPtLo, 4.5, 1e-9, '60 lo'); near(E.plan(0.45, 60, 0).waterPtHi, 6.75, 1e-9, '60 hi');
// dry weight and leftover
near(E.plan(33.3333333, 80, 0).dryLb, 56 * 80, 1e-9, 'dry lb'); near(E.plan(1.0, 80, 0).leftover, 2 * 0.6 - 1, 1e-9, 'leftover');
// price per cubic foot: $5.98 for 80 lb = 9.97, $4.38 for 60 lb = 9.73, $3.28 for 40 lb = 10.93
var b = E.bestSize({ 40: 3.28, 60: 4.38, 80: 5.98 }); is(b[0].lb, 60, 'best 60'); near(b[0].perCuft, 4.38 / 0.45, 1e-12, 'perCuft'); is(b.length, 3, 'three'); is(E.bestSize({ 40: '', 80: 0 }).length, 0, 'none');
// invalid input
is(E.slab(0, 5, 4), null, 'zero len'); is(E.slab(5, 5, -1), null, 'neg thick'); is(E.round(10, 0, 1), null, 'zero depth'); is(E.round(10, 30, 0), null, 'zero count'); is(E.plan(1, 70, 0), null, 'bad bag'); is(E.plan(0, 80, 0), null, 'zero vol'); is(E.plan(1, 80, -5), null, 'neg waste');
console.log((n - bad) + '/' + n + ' passed'); process.exit(bad ? 1 : 0);
