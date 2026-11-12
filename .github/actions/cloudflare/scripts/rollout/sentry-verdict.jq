# Decides from Sentry's numbers whether the new version hurts users enough to
# roll back. Prints the reason to roll back, or "" when it is healthy.
#
# Input:
#   {
#     new: {issue_users, sessions, error_sessions},  # issue_users: distinct users
#     old: {sessions, error_sessions},               #   hit by issues first seen in `new`
#     min_users: 3,       # users (or sessions) an error must reach before it counts
#     max_rate_ratio: 2   # share of sessions with an error allowed, as a multiple
#   }                     #   of the old release's; null skips it (old release gone)
#
# Sessions, not users, carry the rate: the app sets no Sentry user, so Sentry
# counts sessions but not who had them. Both versions served in the same soak
# window, so their shares compare like for like; a backend outage raises both
# and does not count against the new version.

def rate(v): if v.sessions > 0 then v.error_sessions / v.sessions else 0 end;
def pct(x): (x * 1000 | round) / 10 | tostring + "%";

if .new.issue_users >= .min_users then
  "\(.new.issue_users) users hit errors first seen in this release (limit \(.min_users))"
elif .max_rate_ratio != null and .new.error_sessions >= .min_users
     and rate(.new) > .max_rate_ratio * rate(.old) then
  "\(pct(rate(.new))) of sessions on this release hit an error, \(pct(rate(.old))) on the old one (limit \(.max_rate_ratio)x)"
else
  ""
end
