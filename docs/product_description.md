# Pickup Basketball Statistics & Game History App ( Scratcho )

## 1. PRODUCT OVERVIEW

The product is a lightweight, web-first basketball statistics and game-history application designed specifically for informal pickup basketball runs.

Its purpose is not to become a full basketball league-management system, tournament platform, or sophisticated basketball analytics product.

The core purpose is simple:

> **Make it extremely easy for a group playing pickup basketball to record a game, track the statistics they care about, preserve the results, and build persistent player histories over time.**

The application should be optimized primarily for phones and designed for use courtside.

The experience should require very little setup. A group should be able to open the application, select or create their recurring run, confirm the players and teams, start scoring, and record the game without interrupting the flow of basketball.

The product's long-term value comes from the accumulation of data.

A player can appear in many different games, recorded by different people and devices, while maintaining one persistent player identity and one continuous history.

The central architectural concepts are therefore:

* Player identity
* Recurring runs
* Individual games
* Teams within games
* Scoring authority
* Configurable statistics
* Statistical events
* Player history
* Game history
* Shareable results

---

# 2. CORE PRODUCT PRINCIPLE

The product should answer a simple need:

> "We play pickup basketball regularly. We want an easy way to record what happened and keep the history."

It should not try to solve every basketball-management problem.

The application should deliberately avoid becoming:

* A full league-management system
* A tournament-management system
* An NBA-style analytics platform
* A sophisticated player-rating system
* A complex substitution/game-clock application
* A multi-scorer collaborative editing system in the initial version

The product should prioritize:

**Speed → simplicity → reliable records → persistent history → sharing**

---

# 3. PLAYER PROFILES

Players have persistent profiles that can eventually contain:

* Profile photo
* Name
* Nickname
* Optional jersey number
* Games played
* Wins/losses
* Statistical averages
* Career totals
* Recent games
* Other statistics supported by the application

A player profile belongs to the player rather than to the person who happens to record a particular game.

Players should not be required to create an account before participating in a game.

A scorer should be able to create a player quickly using only a name.

For example:

Brian

The system can initially create a lightweight player record.

Later, Brian can claim that identity.

He can open a profile link or scan a QR code and select:

"Claim your player profile"

He can then add:

* Photo
* Nickname
* Account
* Other profile information

The same player identity can subsequently be reused in future games.

This creates gradual onboarding:

First game:

Brian

Later:

Brian + profile photo

Eventually:

Brian + complete game history and statistics

The user does not need to complete a lengthy registration process simply to play one game.

---

# 4. PLAYER PROFILE SHARING AND LINKING

Every claimed player profile can have a shareable link and QR code.

For example:

Basketball Profile

Brian

@brian23

[Profile Photo]

[Share Profile]

A scorer can scan Brian's QR code while creating a game.

The scorer's device then associates the player with Brian's existing persistent player identity.

This prevents duplicate player records such as:

Brian
Brian K.
Brian Mwangi
Brian #23

from being unnecessarily created across different games.

The system should not require the scorer to own or control another player's profile.

The player owns their identity.

The scorer simply associates that identity with the game.

---

# 5. RECURRING RUNS

Recurring runs are an important part of the product.

Many pickup groups repeatedly play together:

* Every Friday
* Every Wednesday
* Every Sunday
* At the same court
* With roughly the same group
* Often using recurring teams

The application should therefore allow users to create a persistent **Run** or **Series**.

For example:

FRIDAY NIGHT RUN

This run can contain many individual games:

* Friday, Sept 25
* Friday, Oct 2
* Friday, Oct 9
* Friday, Oct 16

The run provides continuity between games.

A user should not need to recreate the entire structure every time.

---

# 6. RUN CONFIGURATION

A recurring run can contain:

* Run name
* Optional location
* Players who commonly participate
* Default teams or previous team configuration
* Statistics being tracked
* Game history
* Run-level results

For example:

FRIDAY NIGHT RUN

Common players:

Brian
Kevin
James
Mark
John
Peter
Chris
Sam

Tracked statistics:

Points
Rebounds
Assists
Steals

When a new game is started, the application can reuse the previous configuration.

The user can modify the players or teams before starting the new game.

---

# 7. TEAMS

The product does not need to determine or balance teams automatically.

Team selection is left to the players.

This is intentional.

The application is primarily a statistics application, not a team-management or team-balancing application.

When creating a game, the participants can manually decide:

TEAM A

Brian
Kevin
James
Mark
David

TEAM B

John
Peter
Chris
Sam
Mike

The application simply records the teams that the players chose.

The user should be able to modify the teams before the game starts.

For recurring games, previous team configurations can be reused rather than rebuilt from scratch.

However, the actual teams used in each game should be stored independently.

A player may be on:

Team A in one game

and

Team B in another.

Teams are therefore a property of the particular game rather than a permanent property of the player.

---

# 8. RUNS VS GAMES

The application should distinguish between a recurring run and an individual game.

For example:

FRIDAY NIGHT RUN

contains:

Game 1
Team A 21 — 18 Team B

Game 2
Team A 17 — 21 Team B

Game 3
Team A 21 — 15 Team B

The same run can therefore provide a history of repeated games.

This allows the product to answer two different questions:

### Player history

"How am I performing?"

### Run history

"How has our recurring run been going?"

This is more useful than treating every game as an isolated record.

---

# 9. GAME CREATION

A new game can be created from an existing run or independently.

For an existing run:

Select:

FRIDAY NIGHT RUN

Then:

[Start New Game]

The application can pre-populate:

* Players
* Previous teams
* Statistics configuration
* Other recurring settings

The user can make changes before starting.

For a completely new game:

Create Game

Enter:

* Game name
* Date/time
* Optional location
* Players
* Teams
* Statistics to track

Then:

[Start Game]

---

# 10. CUSTOMIZABLE STATISTICS

The application should allow users to decide which basketball statistics they want to track.

The product should not permanently hardcode one set of statistics.

The default configuration could be:

* Points
* Rebounds
* Assists
* Blocks

However, a group may prefer:

* Points
* Rebounds
* Assists
* Steals

Another group may want:

* Points
* Rebounds
* Assists
* Fouls

Another may want:

* Points
* Rebounds
* Assists
* Steals
* Blocks
* Turnovers

The user can therefore customize the statistics tracked by a run.

---

# 11. STATISTIC CATALOG

The initial application should provide a controlled catalog of supported statistics rather than allowing completely arbitrary statistics.

Possible categories include:

### Scoring

* Points
* 2PT made
* 3PT made
* Free throws

### Rebounding

* Rebounds
* Offensive rebounds
* Defensive rebounds

### Playmaking

* Assists

### Defense

* Steals
* Blocks

### Possession

* Turnovers

### Discipline

* Fouls

The initial MVP does not need to implement every statistic.

The important architectural decision is that the system should support adding statistics later without redesigning the entire database.

Points should remain a core game statistic because the application needs a primary scoring mechanism.

---

# 12. STAT CONFIGURATION BELONGS TO THE RUN

If a group has decided that their Friday run tracks:

Points
Rebounds
Assists
Steals

they should not have to configure those statistics every Friday.

The run stores its preferred statistical configuration.

For example:

FRIDAY NIGHT RUN

Tracked statistics:

PTS
REB
AST
STL

Every new game inherits this configuration.

The user can optionally customize the statistics for an individual game if necessary.

This provides both convenience and flexibility.

---

# 13. LIVE GAME SCORING

During the game, one phone acts as the primary scoring device.

The interface should prioritize speed.

The application should avoid forcing the scorer through forms or complicated menus.

A player card might look like:

TEAM A

21 POINTS

Brian

12 PTS
4 REB
2 AST
1 STL

Kevin

5 PTS
7 REB
1 STL

James

4 PTS
2 REB
3 AST

The interface should adapt to the statistics configured for the game.

If the game tracks blocks instead of steals, the UI automatically reflects that.

---

# 14. QUICK STAT ACTIONS

Tapping a player can expose quick actions.

For example:

+1 PT

+2 PTS

+3 PTS

REB +

AST +

STL +

The scorer should be able to record most events with a single tap.

The application should also provide an obvious undo mechanism.

For example:

"Undo +2 PTS"

This is particularly important during fast-paced games because accidental taps are inevitable.

---

# 15. STATISTICS AS EVENTS

Statistics should preferably be stored as events rather than simply overwriting aggregate totals.

For example, instead of only storing:

Brian = 12 points

the system records:

Brian +2 points
Brian +2 points
Brian +3 points
Brian +3 points
Brian +2 points

The application can calculate the current total:

Brian = 12 points

Each event receives a unique event ID.

Example:

event_id = abc123

If the scorer's device retries the same request because of a network problem:

event_id = abc123

the server recognizes that the event already exists and does not count it twice.

This provides idempotency.

---

# 16. IDEMPOTENCY

Idempotency protects the application against duplicate network requests.

Example:

First request:

Brian +2 points
event_id = abc123

Network retry:

Brian +2 points
event_id = abc123

Final result:

Brian +2 points

not:

Brian +4 points

Idempotency is therefore an important reliability mechanism for live scoring.

It is not intended to solve conflicts between multiple simultaneous scorers.

---

# 17. ONE ACTIVE SCORER

The initial product should use one active scorer at a time.

The roles should be clearly separated:

### Game owner

Controls the game and its configuration.

### Active scorer

The person/device currently recording statistics.

### Player

Participates in the game.

### Viewer

Can see the game but cannot modify it.

A player does not automatically receive editing permissions simply because they are participating.

---

# 18. GAME OWNERSHIP

The person who creates the game becomes its owner.

For example:

Game owner: Brian

Active scorer: Kevin

Kevin can record the game's statistics.

Brian remains the authoritative owner.

The owner can:

* Configure the game
* Transfer scoring
* Finish the game
* Correct completed-game records
* Manage game access

The scorer primarily performs live recording.

---

# 19. TRANSFERRING THE SCORER

If the active scorer needs to stop scoring, the owner can transfer scoring authority.

Example:

Kevin is currently scoring.

Kevin's phone dies.

Brian opens the game and selects:

"Take over scoring"

The server changes:

active_scorer_id = Brian

Brian can immediately continue recording the same game.

There is no need to merge two separate scoring databases.

The game remains one authoritative record.

---

# 20. SCORER DISCONNECTION

The active scoring session can maintain a lightweight heartbeat.

The game can maintain information such as:

active_scorer_id
scorer_session_id
last_seen_at

The scorer's device periodically communicates with the server.

If the connection disappears, the game can indicate:

"Scorer disconnected"

The owner can then choose:

"Take over scoring"

The system should not automatically transfer the scoring role after a few seconds of inactivity.

The owner deliberately decides when control should change.

---

# 21. PLAYTIME

Playtime should not be part of the initial product.

The game clock may be running on:

* Another phone
* A scoreboard
* A physical clock
* Another application

Trying to synchronize with that clock introduces unnecessary complexity.

The data model can nevertheless reserve the possibility of storing:

seconds_played

later.

A future system could support:

SUB IN
timestamp

SUB OUT
timestamp

and calculate playtime from those intervals.

This would not require the application to control the actual basketball game clock.

---

# 22. GAME COMPLETION

When the game ends, the owner or authorized scorer selects:

"Finish Game"

The application records the final state.

The completed game contains:

* Game information
* Teams
* Players
* Final score
* Configured statistics
* Individual player statistics
* Statistical events
* Date/time
* Optional location
* Player identities

The game becomes a permanent historical record.

---

# 23. COMPLETED GAME CORRECTIONS

Completed games should not be freely editable by everyone.

The game owner should be able to select:

"Edit completed game"

This is intended for legitimate corrections.

For example:

Brian was accidentally given 2 points that belonged to Kevin.

The owner can correct the record.

The system should preserve an internal history of the correction rather than silently rewriting the past.

The final displayed statistics reflect the corrected result, while the system can retain an audit trail of what changed.

---

# 24. PLAYER ACCESS TO GAMES

Players can view games they participated in.

For example:

FRIDAY NIGHT RUN

TEAM A 18
TEAM B 16

Brian

10 PTS
3 REB
2 AST

Brian can see his statistics but cannot edit them simply because he is a participant.

This protects the integrity of the game record.

---

# 25. PUBLIC/SHAREABLE GAME PAGES

Every completed game can have a shareable read-only URL.

For example:

app.example.com/games/friday-run-123

The page can show:

FRIDAY NIGHT RUN

TEAM A 21 — 18 TEAM B

GAME LEADERS

Brian
12 PTS
4 REB
2 AST

Kevin
8 PTS
7 REB
1 STL

James
7 PTS
2 REB
3 AST

The public page should only expose information permitted by the game's sharing settings.

The shareable game page is part of the product experience rather than simply an export mechanism.

---

# 26. SHAREABLE SCORE SHEET

After a game, the application should generate a visually appealing result that can be shared through:

* WhatsApp
* Social media
* Direct link
* Other messaging platforms

Example:

FRIDAY NIGHT RUN

TEAM A 21 — 18 TEAM B

[Brian Photo]

Brian

12 PTS · 4 REB · 2 AST

[Kevin Photo]

Kevin

8 PTS · 7 REB · 1 STL

[James Photo]

James

7 PTS · 2 REB · 3 AST

Player profile photos can appear automatically once players have claimed their profiles.

The result becomes a social artifact from the game.

---

# 27. PLAYER HISTORY

Every completed game contributes to the relevant players' histories.

A profile can eventually show:

Brian

27 Games

11.4 PPG
5.8 RPG
3.2 APG
0.8 BPG

Recent Games:

Friday Run

12 PTS · 4 REB · 2 AST

Wednesday Run

9 PTS · 7 REB · 4 AST

Sunday Run

15 PTS · 3 REB · 2 AST

The application should distinguish between:

* Statistics that were actually tracked
* Statistics that were not tracked

If one run records steals and another does not, the second game should not be interpreted as:

"Brian had 0 steals."

It means:

"Steals were not recorded for this game."

This distinction is important when calculating historical averages.

---

# 28. CUSTOM STATISTICS AND PLAYER HISTORY

Because statistics are configurable, player profiles should dynamically display statistics that have sufficient historical data.

For example:

Brian's profile might show:

27 Games

11.4 PPG
5.8 RPG
3.2 APG
1.1 SPG

if steals have been consistently tracked.

If steals were only tracked in two games, the application should avoid presenting an apparently comprehensive career average without making the sample clear.

The system should therefore preserve the relationship between:

Player
Game
Stat type
Recorded value

rather than assuming every player/game contains every statistic.

---

# 29. RUN HISTORY

A recurring run should have its own history.

Example:

FRIDAY NIGHT RUN

12 Games

Team A
7 wins

Team B
5 wins

Recent games:

Game 12
Team A 21 — 18 Team B

Game 11
Team A 17 — 21 Team B

Game 10
Team A 21 — 19 Team B

This gives recurring groups a reason to keep returning to the same run.

The run becomes the persistent home for their basketball history.

---

# 30. RUN STATISTICS

The application can eventually provide run-level statistics such as:

* Games played
* Total points
* Average game score
* Team wins
* Player participation
* Individual averages within the run
* Recent results
* Win streaks

These should remain descriptive statistics rather than being converted into an artificial overall player rating.

---

# 31. RANKINGS AND LEADERBOARDS

Once enough games exist, the application can provide statistical leaderboards.

Possible measurements include:

* Total points
* Points per game
* Rebounds per game
* Assists per game
* Blocks per game
* Steals per game
* Games played
* Wins
* Win percentage
* MVP count
* Current streak

The system should initially present these as individual statistics.

It does not need to create a single:

"Player Rating = 87"

number.

A single rating would require assumptions about how different basketball contributions should be weighted.

The product can remain focused on recording and presenting the underlying statistics.

---

# 32. GAME MVP

An MVP feature can eventually be added if the group wants it.

However, the MVP should not necessarily be based on a hidden proprietary rating.

Possible approaches could include:

* Organizer selection
* Player vote
* Clearly documented statistical formula

The initial product does not need this feature.

---

# 33. PERMISSIONS MODEL

The system should separate four concepts:

### Player identity

Who the person is.

### Game ownership

Who controls the game.

### Scoring authority

Who is currently allowed to record statistics.

### Game history

What actually happened during the game.

These should not be conflated.

For example:

Brian can own a game.

Kevin can be the active scorer.

James can be a participating player.

A fourth person can be a viewer.

All four can interact with the same game in different ways without receiving the same permissions.

---

# 34. DATA MODEL PRINCIPLE

The architecture should separate persistent identity from individual game participation.

Conceptually:

PLAYER

↓

RUN

↓

GAME

↓

GAME TEAM

↓

PLAYER PARTICIPATION

↓

STAT EVENTS

This allows the same player to appear across:

* Different runs
* Different teams
* Different games
* Different scorers
* Different devices

while maintaining one continuous identity.

A player does not become a different player simply because someone else records their next game.

---

# 35. CORE DATA ENTITIES

A conceptual data model can include:

### Player

* id
* name
* nickname
* photo
* jersey number
* account/claim information

### Run

* id
* name
* location
* owner
* default statistics configuration

### Game

* id
* run_id
* owner_id
* date/time
* location
* status
* active_scorer_id
* scorer_session_id
* last_seen_at

### Team

* id
* game_id
* name

### Game Player

* game_id
* player_id
* team_id

### Stat Definition

* id
* code
* name
* category
* unit

### Run Stat Configuration

* run_id
* stat_id
* display order
* enabled

### Stat Event

* id
* game_id
* player_id
* stat_id
* value
* scorer/session information
* timestamp

### Game Correction / Audit Record

* id
* game_id
* original event
* correction
* actor
* timestamp

This structure allows new statistics to be introduced without adding a new database column every time.

---

# 36. PRODUCT LOOP

The core product loop is:

CREATE OR SELECT RUN

↓

Add or select players

↓

Confirm teams

↓

Confirm statistics

↓

START GAME

↓

One phone becomes the active scorer

↓

Record statistics

↓

Transfer scorer if necessary

↓

FINISH GAME

↓

Generate final result

↓

Share result

↓

Update player history

↓

Update run history

↓

Return for the next game

The recurring run makes the loop repeat naturally.

---

# 37. FIRST-TIME PLAYER EXPERIENCE

A new player should not be forced through registration.

Example:

A scorer starts a game.

Adds:

Brian

The game proceeds.

Afterward Brian receives:

"You played in Friday Night Run."

[Claim Your Player Profile]

Brian opens the link.

Adds:

* Profile photo
* Nickname
* Account

His previous game is automatically associated with the newly claimed profile.

From then onward:

Brian

has a persistent history.

This makes onboarding progressive rather than front-loaded.

---

# 38. DIFFERENT DEVICES AND SCORERS

The application should not assume that one person always owns the group's data.

A game might look like:

Game 1

Brian creates and scores.

Game 2

Kevin creates and scores.

Game 3

James creates the game and Kevin scores.

The same player identities can still be reused.

The persistent data belongs to the application and the relevant players/runs, not to a single scorer's device.

---

# 39. OFFLINE/NETWORK CONSIDERATIONS

Because scoring occurs courtside, network reliability is important.

The application should ideally tolerate short periods of unreliable connectivity.

The scoring client can maintain a local pending event queue.

For example:

Brian +2
event_id = abc123

The event is stored locally immediately.

When connectivity returns, the client synchronizes the event with the server.

The unique event ID prevents duplicate submission.

The exact offline architecture can be decided during implementation, but the product should prioritize not losing a scorer's taps because of a temporary network problem.

---

# 40. WHAT IS NOT REQUIRED FOR MVP

The initial product does not need:

* Automatic team balancing
* Sophisticated player ratings
* Game-clock synchronization
* Playtime tracking
* Substitution management
* Multiple simultaneous scorers
* Full league management
* Tournament brackets
* Advanced basketball analytics
* Every possible basketball statistic
* Complex social networking
* Automatic scouting reports

These features can be added if actual users demonstrate demand.

---

# 41. MVP FOCUS

The first usable version should focus on:

### Player

* Create player
* Claim player
* Player profile
* Profile link/QR

### Run

* Create recurring run
* Save players
* Save statistic configuration
* View run history

### Game

* Create game
* Reuse a previous run
* Assign players to teams
* Start/finish game

### Scoring

* One active scorer
* Points
* Configurable additional stats
* Quick actions
* Undo
* Idempotent events
* Transfer scoring

### Results

* Final score
* Player statistics
* Shareable game page
* Shareable score sheet

### History

* Player history
* Run history
* Basic statistical averages

This is enough to establish the core product.

---

# 42. LONG-TERM PRODUCT VALUE

The scoring screen itself is relatively easy to reproduce.

The more valuable asset is the accumulated structured history.

Over time, the system can know:

* Which players regularly play together
* Which runs are recurring
* How many games a player has played
* How a player's statistics have changed
* Which statistics different groups care about
* Which games belong to which recurring runs
* Which players have played together
* Historical team results
* Individual game performances

The product becomes more useful as the group's history grows.

This creates a natural retention mechanism:

**One game → useful**

**Ten games → history becomes useful**

**Fifty games → the app becomes the group's basketball record**

---

# 43. THE CENTRAL PRODUCT MODEL

The simplest way to understand the product is:

**PLAYER**

Who are you?

↓

**RUN**

Which recurring basketball group/session are you part of?

↓

**GAME**

What happened today?

↓

**TEAMS**

Who played on which side today?

↓

**STAT EVENTS**

What did each player do?

↓

**HISTORY**

What has happened across all previous games?

↓

**SHARING**

What can the group show everyone afterward?

This keeps the product focused.

The application does not decide who should play with whom.

It does not decide who is the best player.

It does not attempt to replace a league-management system.

It provides the infrastructure for a group to **record, preserve, understand, and share its pickup basketball history.**

# 44. CORE PRODUCT PROMISE

The product should ultimately deliver this experience:

> **Open the app. Pick your run. Start the game. Record the stats you care about. Finish. Share the result. Your history takes care of itself.**

The user should spend almost no time managing the software.

The basketball game should remain the focus.
