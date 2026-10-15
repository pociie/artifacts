# Session UI adapter successor handoff

## Situation

Loop Architecture now projects a provider-neutral session title, worker label,
activity sentence, handoff sentence, UI observation, and abstract control
intent. It does not choose or invoke a provider command. The intended provider
owner paths currently overlap another in-flight change, so this session did not
edit them.

## Intended successor

The already existing task-local coordinator or session-control successor may
consume this handoff after the Workspace Agent Operations and Tool Capability
Resolution owners settle their current changes. This handoff does not create a
new Agent, Component, worker, session, supervised Run, or UI preflight.

The read-only preflight is
`.collab/artifacts/loop-architecture-orca-ui-projection-2026-09-22/preflight-v1/report.json`.
Its file SHA-256 is
`dc70e0037169d090af765cb467cbacf1cdf6a257fcb5e6795be693af85c3d443`,
and its canonical self-digest is
`2650311b868960561f4d47166896f2921c94e184f784a192fc6a0a3779b39c3b`.
Both digests were independently recomputed and match.

## Required mapping

For the installed Orca CLI 1.4.206 surface, map `rename_surface` to terminal
rename, `open_adjacent_surface` to terminal split, and `focus_surface` to
terminal switch. Verify each control through its exact effect receipt and the
appropriate UI inventory or read-back. Do not put a terminal or session handle
in tracked source.

The installed CLI does not expose resize, move, merge, or numeric ratio
operations. Map them to explicit unsupported dispositions. Preserve the current
layout, accept provider-default split geometry, and retain 65/35 only as
unapplied intent. Continue only when exact geometry is optional; otherwise hold
for another separately admitted surface. Do not simulate UI control by typing
text into a terminal, and do not infer success from terminal output.

The generic conformance cue is plan-only. A mutation additionally requires the
exact session scope, expected current topology revision, named UI-effect owner,
requested effect, least-capability and effect-admission evidence, and an exact
postcondition read-back. Keep at most three task panes, do not steal focus on
create or rename, use a sanitized title within 32 characters, and expose at
most one 96-character role/objective/stage summary line per session.

## Observation and control boundary

Terminal text is content, not a control plane. A terminal input receipt proves
only the stage named by that receipt. A UI inventory or UI effect receipt may
prove visibility, layout, or focus, but it does not prove that an Agent began a
turn, understood a handoff, applied an instruction, passed validation, or
settled a resource.

## Existing evidence

Reuse the exact preflight ref and digests above. Do not start a duplicate
preflight. Keep
raw prompts, transcripts, provider payloads, and runtime handles outside
tracked source and portable receipts.

## Completion condition

The successor must update only the four Plugin files named in the JSON handoff;
Tool Capability Resolution remains read-only. It is complete only when the
provider profile records all three supported mappings, the resize/move/merge
fallbacks, cue-only behavior, scope/revision/owner/effect/postcondition gates,
pane/title/focus/summary budgets, observation/control separation, and focused
negative checks. This handoff grants no activation, acceptance, integration,
publication, ownership, or settlement authority.
