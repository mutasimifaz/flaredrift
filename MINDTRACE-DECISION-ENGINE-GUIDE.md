# MINDTRACE — Decision Engine guide

This release adds five connected decision-making tools to the existing local-first MINDTRACE workspace.

## 1. Decision matrix

1. Open **Map** and create at least two **Option** cards.
2. Add one or more **Criterion** cards. A criterion is something that matters when comparing options (for example: time, cost, learning, usefulness or reversibility).
3. Open **Decision matrix**.
4. Set each criterion's importance from 1–5 and score every option from 1–5. Use the criterion's **Edit** control to rename or describe it.

The base matrix score is the weighted average of entered scores, expressed as a percentage. Missing scores are not silently treated as facts; incomplete coverage lowers the adjusted indicator and is shown beside each option.

## 2. Evidence intelligence

Add **Evidence** and **Assumption** cards from the Map tab or the Evidence tab. Classify each as:

- **Verified** — you have checked a credible source or direct observation.
- **Disputed** — credible information conflicts or the claim is contested.
- **Assumed** — you are treating it as true without sufficient verification.
- **Unknown** — you do not yet know.

Link an item to an option in its inspector, or leave it unlinked to apply it to all options. MINDTRACE does not independently verify claims; these labels reflect your assessment.

## 3. Recommendation engine

The highest adjusted indicator is surfaced as the current strongest option. It combines the weighted matrix score with small, transparent adjustments for user-classified evidence, unresolved information, risk load and missing criterion scores. It is a decision aid, not a prediction or an objectively correct answer. Review the underlying notes and score coverage before acting.

## 4. Scenario explorer

Scenarios are temporary sensitivity tests. You can change how important each criterion is and apply a temporary score shift to an option to model a more favourable or difficult set of conditions. These changes do not overwrite the saved matrix. Return to the Matrix or Report tabs to see the baseline comparison.

## 5. Decision report

The Report tab summarizes options, criteria, current ranking, evidence gaps, assumptions and risks. Use **Export HTML** for a portable report, or **Print / Save PDF** and choose “Save as PDF” in the browser print dialog.

## Privacy and backups

Projects remain in this browser's local storage. No account or cloud sync is used. Export a JSON backup regularly; clearing browser site data or losing the device can erase local projects. Imported JSON files are size-limited and validated before they are added.
