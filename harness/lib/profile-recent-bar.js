"use strict";

/**
 * Visual bar for a company Profile is that company's official *work/case*
 * pages (external https URLs on the VI source host).
 *
 * Never our live portfolio (ai.drsfilms.com). Never a timestamp-newest-3
 * of public/{company}/index.html. Never a frozen pair of our routes.
 *
 * Record lives on the package manifest as compared_to. One checker.
 */

const {
  officialWorkBarOk,
  recordedComparedTo,
  sameSlugSet,
} = require("./profile-frame");

function recentBarOk(pkg) {
  const ev = officialWorkBarOk(pkg);
  return {
    ok: ev.ok,
    compared_to: ev.compared_to || recordedComparedTo(pkg),
    recorded: recordedComparedTo(pkg),
    reason: ev.reason,
  };
}

function profileRecentBarGate(pkg) {
  const ev = recentBarOk(pkg);
  return {
    ok: ev.ok,
    detail: ev.reason,
    compared_to: ev.compared_to,
  };
}

module.exports = {
  recordedComparedTo,
  sameSlugSet,
  recentBarOk,
  profileRecentBarGate,
  officialWorkBarOk,
};
