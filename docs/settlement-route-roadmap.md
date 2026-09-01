# Settlement route - what remains

## Purpose of the current implementation

The route gives Guides a clear job: help someone get settled in a chosen country. It is deliberately separate from discovery, because a person can explore places in one location while planning a move to another country.

The current release is an honest UK-first structure:

1. Status and documents
2. Home and address
3. Healthcare
4. Work and money
5. Everyday life

It also identifies optional paths for children and school, driving and a car, and study or qualifications. The country registry is ready for future routes, but no stage should look actionable until Mandrii has a real, reviewed guide for it.

## Content required before the route becomes useful on its own

### First UK guides - publish in this order

1. **Status and documents**
   - Explain the scope clearly - different arrival routes and circumstances need different steps.
   - Give a short, practical order of actions rather than a generic list of documents.
   - Avoid presenting immigration, legal or benefits information as universal or permanent.

2. **Home and address**
   - Cover the practical problem of establishing a home and an address without assuming a person is already renting long term.
   - Distinguish the useful actions from country or nation-specific rules only after they have been researched and reviewed.
   - Link internally to relevant Mandrii places or Community help only where that genuinely helps.

3. **Healthcare**
   - Be specific about the relevant UK nation only when the content has been researched for that nation.
   - Separate routine care, urgent care and emergency care in plain language.
   - Do not make clinical recommendations or rely on time-sensitive rules without a review process.

### Then add the remaining route content

- **Work and money** - only practical first steps that apply to the route and country. Avoid broad financial or employment advice without a clear scope.
- **Everyday life** - a useful orientation guide, not a duplicate directory of venues, events or Community posts.
- **Children and school** - make this a conditional path, with content separated where UK nations differ.
- **Driving and car** - publish only after country-specific requirements, timelines and terminology have been checked.
- **Study and qualifications** - explain routes and recognition only when the information is researched and can be kept current.

## Guide publication rules

Before changing a route stage from `coming-soon` to `published`:

- Create a real internal Mandrii guide page and give the stage its internal `href` in `settlementRoutes.ts`.
- Add English and Ukrainian content and translations together.
- Record an internal content owner and review date.
- Review any law, immigration, healthcare, tax, housing or benefits statement for scope and currency. Research may use primary sources, but the visitor experience does not need to send people away to official websites.
- State when a guide is limited to a nation, region, arrival route or other circumstance.
- Keep the guide task-focused: a person should leave knowing what to do next, not just what a topic means.
- Add a way to report inaccurate or outdated guidance before scaling the route.

## Functionality to add only after real guides exist

### Completion tracking

- Add `Read guide` only for a published internal guide.
- Let a user mark that guide as done only after it is available.
- Persist completion using stable guide IDs, scoped by country, for example `mndr.settlement-route.v1.gb`.
- Keep browser-only progress first. Sync it to a signed-in profile only when there is enough completed content to make multi-device continuity worthwhile.
- Do not treat reading a guide as proof that a legal, healthcare or immigration task is complete.

### Personalised optional paths

- Ask about children, driving, study or other circumstances only when the answer changes visible content.
- Keep these choices optional and avoid collecting sensitive immigration, health or family data merely for personalisation.
- Show optional stages as additions to the route, not as mandatory numbered steps.

### Country and location behaviour

- Keep the settlement country independent from the discovery location.
- Consider a shareable route URL only if it does not accidentally overwrite a person's saved choice.
- Add a country to the registry only when it has enough country-specific content to be useful. A route shell without content should remain clearly marked as in preparation.
- Introduce UK-nation selection only when a guide has genuinely different, reviewed content for England, Scotland, Wales or Northern Ireland.

### Contextual community help

- Let a completed guide link to Community with the selected settlement country prefilled.
- Consider a stage-specific Community prompt only if it makes the question clearer. Do not recreate Home's venue, event and discovery cards inside Guides.
- Make clear that community answers are personal experiences, not official or professional advice.

### Quality, safety and measurement

- Add feedback controls for "helpful", "unclear" and "needs review" once guides are live.
- Define an editorial review cadence for time-sensitive content.
- Measure route selection, guide starts, guide completion and feedback in a privacy-conscious way.
- Test the full route on mobile, in both themes, and in English and Ukrainian whenever a stage becomes published.

## Deliberately not included yet

- Checkboxes, progress totals and completion states for unfinished guides.
- External official-guidance links as a substitute for Mandrii content.
- Generic local discovery cards that duplicate Home.
- The current `registration-and-documents` / Renters' Rights content as a route stage. It needs a separate content and legal-scope review before it can be presented to new arrivals.

## Suggested delivery sequence

1. Research and publish the three first UK guides above.
2. Wire those guide URLs into the registry and enable per-guide completion.
3. Add the optional UK paths once they contain real content.
4. Add feedback and review metadata.
5. Repeat the same structure for the next country with its own reviewed content and ordering.
