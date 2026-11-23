---
---
{% raw %}---
name: mini-setup
description: Walks someone through building their own always-on personal assistant on a Mac mini (Telegram bot + Claude CLI + Obsidian "brain" wiki + scheduled tasks + optional browser, TripIt and remote access), from an empty Mac to a working bot. Use only when someone is setting up a NEW machine or asks how to build a stack like this one ("set up my assistant", "walk me through the mini setup"). Not for day-to-day requests on an already-running assistant.
---

# Mini assistant setup

You are guiding a person, at the terminal of their own Mac (ideally a Mac mini that stays on),
through building a personal assistant they talk to from their phone. When it's done:

- They text a private **Telegram** bot; the bot hands each message to the **Claude CLI**
  (`claude -p`) running in a project folder with their instructions and skills, and sends the
  answer back. One conversation continues until it's been quiet for 2 hours.
- Everything the assistant learns lives in an **Obsidian** vault (the "brain"), synced to their
  phone and backed up to GitHub.
- A **task runner** wakes every 15 minutes and runs scheduled prompts ("every Friday, find me
  happy hours"), messaging them only when there's something worth saying.
- Optional connectors: a real **Chrome** the assistant drives (OpenTable, Resy, sites that
  block fetching), **TripIt**, and **Tailscale + Screen Sharing** for the rare hands-on fix.

Everything you install comes from `templates/` next to this file. Read a template right before
you use it, fill in the `{{PLACEHOLDERS}}`, and write it to its destination.

## How to run this

- **Go one phase at a time.** Say what the phase is for in a sentence, do what you can yourself,
  give exact click-by-click instructions for what only they can do (GUI, sign-ins, payments),
  then **verify it worked** before moving on. Never pile up several manual steps in one message.
- **Keep a progress file** at `~/assistant/SETUP.md` (create it after the survey): the survey
  answers, then a checklist of phases. Tick items as they're verified. If the session ends,
  the next one reads it and resumes where they left off.
- **Secrets never pass through you.** Tokens (Claude, Telegram, TripIt URL) go straight into
  `~/assistant/scripts/.env`, typed or pasted by the person in an editor
  (`open -e ~/assistant/scripts/.env`). Don't ask them to paste a token into the chat, don't
  `cat` the .env, and don't echo tokens in commands. To check a value is set, use
  `grep -c '^TELEGRAM_BOT_TOKEN=.\+' ~/assistant/scripts/.env`.
- **Ask before anything that costs money or is hard to undo** (subscriptions, turning off
  FileVault, deleting files). Explain the trade-off in one line and let them choose.
- Plain language. Assume they're comfortable following instructions, not that they know what
  launchd or a venv is; explain a term the first time it comes up.

## Phase 0: Survey (do this first, before installing anything)

Ask these in one friendly message, grouped, with your suggested default in brackets so they
can just say "defaults":

1. **About them**: their first name, and what to call the assistant [a name they like; it
   signs emails as "<name>, <owner>'s assistant"]. Their time zone and home city.
2. **The machine**: Is this a Mac that can stay on and logged in all the time? [a Mac mini].
   Apple silicon? Is FileVault on? (Auto-login, needed so everything restarts after a power
   cut, doesn't work with FileVault on; explain the trade-off and let them decide.)
3. **Claude**: Do they have a Claude Pro or Max subscription? [Max if they'll use it heavily;
   the bot uses their subscription through a long-lived login token].
4. **Phone**: iPhone or Android? (Telegram works on both; Obsidian Sync works on both.)
5. **What they want help with**: list the areas of their life. Offer examples: restaurants and
   bars, travel, fitness, real estate, lists and notes, a hobby, kids' schedules, fantasy sports.
   Each area becomes a skill.
6. **Connections** (explain each in one line, mark required ones):
   - Telegram bot (**required**, free): how they talk to it.
   - Obsidian brain (**required**, free app) + **Obsidian Sync** to read/edit it on the phone
     (optional, paid, ~$4–5/mo) + **GitHub** backup (optional, free private repo).
   - Scheduled tasks (**recommended**, no extra cost).
   - Tailscale + Screen Sharing (**recommended**, free): reach the mini's screen from a laptop
     or phone when a login expires or macOS asks for permission.
   - Browser connector (optional): real Chrome for live reservations and sites that block bots.
     Which sites would they sign in to? (OpenTable, Resy, others.)
   - TripIt (optional): if they use TripIt, the assistant knows where they'll be.
   - Gmail and calendars (optional, advanced): see Phase 8.

Then write `~/assistant/SETUP.md` with their answers and a checklist of only the phases that
apply, and show them the plan in a short list with rough time (most setups take 1–2 hours,
much of it waiting on downloads and sign-ins).

Placeholder values you'll use from here on:

| Placeholder | Meaning | Example |
|---|---|---|
| `{{OWNER}}` | Their first name | Alex |
| `{{ASSISTANT}}` | The assistant's name | Juno |
| `{{HOME}}` | Their home folder, from `echo $HOME` | /Users/alex |
| `{{LABEL}}` | Reverse-DNS prefix for background jobs, from their username | com.alex |
| `{{CITY}}` / `{{TZ}}` | Home city / time zone | Denver / America/Denver |
| `{{SKILLS}}` | The skill names you'll create, comma-separated | brain, tasks, eats, tripp |
| `{{TODAY}}` | Today's date | 2026-12-01 |

When you've filled a template, check none are left: `grep -rn '{{' <the file>`.

## Phase 1: Prepare the Mac

Goal: the Mac stays awake, logs itself in, and comes back after a power cut.

They do (System Settings):
1. **Energy** (or Battery > Options on laptops): turn on "Prevent automatic sleeping when the
   display is off" and "Start up automatically after a power failure". Display can sleep.
2. **Users & Groups > Automatically log in as** their account (only if FileVault is off and
   they chose that in the survey). Without it, after a reboot nothing runs until someone logs in.
3. **General > Software Update > Automatic updates**: suggest leaving security updates on but
   turning off automatic macOS installs, so the mini doesn't restart into an update unattended.

You do:
- Check for the Xcode command line tools (`xcode-select -p`); if missing, run
  `xcode-select --install` and have them click Install.
- Install Homebrew if `brew` isn't found (the official one-liner from brew.sh; it asks for
  their password, which they type, not you). Then
  `brew install python@3.12 git gh node` (python must be 3.10+; the system one is too old).
- Create the folders: `mkdir -p ~/assistant/{scripts,services,project/skills} ~/logs ~/mcp`.

Verify: `python3.12 --version`, `git --version`, `node --version`.

## Phase 2: Tailscale and Screen Sharing (if chosen)

Goal: they can see and control the mini's screen from their laptop or phone, from anywhere,
without opening it to the internet. Tailscale is a private network between their own devices.

They do:
1. Install Tailscale on the mini (tailscale.com/download, or the Mac App Store), open it, sign
   in (Google/Apple/Microsoft account), and allow the VPN configuration when macOS asks.
2. In Tailscale's menu bar settings, turn on "Launch at login".
3. In the Tailscale admin console (login.tailscale.com > Machines), click the mini's "…" menu
   and choose **Disable key expiry**. Otherwise the mini silently drops off the network in a
   few months and needs a human to log in again.
4. Install Tailscale on their laptop and/or phone and sign in with the same account.
5. On the mini: System Settings > General > Sharing > turn on **Screen Sharing** (and
   **Remote Login** if they want SSH).
6. From their laptop: Finder > Go > Connect to Server > `vnc://<mini's Tailscale name>`
   (shown in the Tailscale menu; MagicDNS makes the short name work). From an iPhone or
   Android, a VNC app such as Screens or RealVNC Viewer, pointed at the same name.

Verify: they connect from another device and see the mini's screen. Note the mini's Tailscale
name in SETUP.md.

## Phase 3: Claude CLI and the long-lived token

Goal: the `claude` command works on the mini without anyone signed in at the keyboard.

You do:
1. If `claude` isn't installed yet: `curl -fsSL https://claude.ai/install.sh | bash`
   (it lands in `~/.local/bin/claude`). Confirm with `~/.local/bin/claude --version`.

They do:
2. In a **separate** Terminal window (not inside this Claude session), run `claude setup-token`.
   It opens a browser to sign in to their Claude account and then prints a token that lasts
   about a year. Tell them to copy it and keep that window open for Phase 5. Don't ask them to
   paste it here.

Write down in SETUP.md the date the token was made; it needs redoing about a year later (the
task runner's daily health check warns them when it stops working).

## Phase 4: Telegram bot

Goal: a private bot only they can talk to.

They do, on their phone:
1. Install Telegram and sign up if needed.
2. Open a chat with **@BotFather**, send `/newbot`, give it a display name ({{ASSISTANT}}) and
   a username ending in `bot`. BotFather replies with a **token** (looks like `123456:ABC…`).
   Keep it handy for Phase 5.
3. Open a chat with **@userinfobot** and send anything; it replies with their numeric **user
   ID**. The bot will ignore everyone else.
4. Open a chat with their new bot and press **Start** (a bot can't message someone who hasn't
   started it).

## Phase 5: The assistant's code and secrets

Goal: the bot, the runner and their config, in a git repo so every change can be undone.

You do:
1. Copy the scripts from `templates/scripts/` into `~/assistant/scripts/`: `claude_cli.py`,
   `telegram_bot.py`, `task_runner.py`, `requirements.txt`, `tasks.json`, and `tripit_sync.py`
   only if they chose TripIt. These are generic; only `{{PLACEHOLDERS}}` need filling.
2. Create the virtual environment (a private Python install just for the assistant):
   `python3.12 -m venv ~/assistant/scripts/venv && ~/assistant/scripts/venv/bin/pip install -r ~/assistant/scripts/requirements.txt`
3. Copy `templates/scripts/env.example` to `~/assistant/scripts/.env` and
   `chmod 600 ~/assistant/scripts/.env`. Fill in `BOT_LABEL` and `BRAIN_DIR` yourself.
4. Have them open it (`open -e ~/assistant/scripts/.env`) and paste in the Claude token, the
   Telegram token and their user ID. Verify each line is filled with the `grep -c` check above.
5. `cd ~/assistant && git init`, copy `templates/gitignore` to `~/assistant/.gitignore`, and
   confirm the secrets are ignored (`git check-ignore -q scripts/.env && echo ignored` prints
   `ignored`) before the first commit. If they want a GitHub copy, `gh auth login` and create a
   **private** repo.

## Phase 6: The project: instructions, skills, permissions

Goal: the folder Claude runs in, which defines who the assistant is and what it may touch.

You do:
1. `templates/project/CLAUDE.md` > `~/assistant/project/CLAUDE.md`. Fill placeholders, and
   **delete the sections for connectors they didn't choose** (browser, TripIt). Keep the rules
   sections (gather context, learn from feedback, ask before anything irreversible) as they are;
   they're what make it good.
2. `templates/project/settings.json` > `~/assistant/project/.claude/settings.json`. Remove the
   `mcp__browser` lines and `enabledMcpjsonServers` if there's no browser; remove the TripIt
   read line if no TripIt.
3. `templates/project/mcp.json` > `~/assistant/project/.mcp.json` (browser only; skip the file
   otherwise).
4. Skills: copy `templates/skills/brain` and `templates/skills/tasks` into
   `~/assistant/project/skills/`. For each area from the survey, write
   `skills/<short-name>/SKILL.md` from `templates/skills/area-example/SKILL.md`. Short one-word
   names work best (eats, tripp, coach…). The `description` line decides when Claude uses it,
   so list the kinds of requests it covers. Keep area skills short; the brain will hold their
   preferences, which grow over time.
5. `ln -s ../skills ~/assistant/project/.claude/skills` so Claude Code finds the skills.
6. Commit.

Explain the permission model in two lines: in the bot, Claude can only do what
`settings.json` allows, anything else is refused silently, and it can't edit its own settings,
CLAUDE.md, scripts or `.env`, so it can't widen its own access or read the tokens. It can edit
its skills, the brain and tasks.json, which is how it learns and schedules from Telegram. To give it a new ability later, they (or you, in an
interactive session like this one) edit `settings.json`.

## Phase 7: The brain (Obsidian)

Goal: a folder of linked notes that is the assistant's only memory, readable on their phone.

You do:
1. Create the vault from `templates/brain/`: copy it to `~/Documents/brain/` (the
   `BRAIN_DIR` in .env), filling placeholders. That gives `index.md`, `log.md`,
   `BRAIN_SCHEMA.md` and `wiki/personal/assistant-preferences.md`.
2. Seed it from the survey: `wiki/personal/profile.md` (name, city, time zone, anything they
   told you), and a `wiki/<area>/<area>-preferences.md` stub per area. Add them to `index.md`.

They do:
3. Install Obsidian (obsidian.md), choose **Open folder as vault**, and pick `~/Documents/brain`.
4. System Settings > General > Login Items: add Obsidian, so it reopens after a reboot.
5. *Obsidian Sync* (if chosen): Obsidian Settings > Core plugins > turn on Sync; sign in or
   buy Sync; create a remote vault (end-to-end encryption on, with a password they keep) and
   connect. On the phone: install Obsidian, sign in, and connect to the same remote vault.
   Note: Sync only runs while Obsidian is open on the mini.
6. *GitHub backup* (if chosen): you run `cd ~/Documents/brain && git init`, copy
   `templates/brain/gitignore` to `.gitignore`, commit, and (with `gh`) create a private repo
   and push. They install the community plugin **Git** (Settings > Community plugins > Browse),
   and in its settings set auto commit-and-sync to every 10 minutes. If they use Sync on the
   phone, turn the Git plugin off there (it's a mini-only job).

Verify: they edit a note on the phone and you see the change on the mini within a minute.

## Phase 8: Optional connectors

Only the ones they chose. Each needs a line in CLAUDE.md (already in the template) and a
permission in settings.json.

**Browser (Chrome driven by Playwright).**
1. Make sure Google Chrome is installed. `mkdir -p ~/mcp/playwright && cd ~/mcp/playwright && npm install @playwright/mcp`.
2. Copy `templates/mcp/browser-mcp.sh` and `templates/mcp/sign-in-browser.sh` to
   `~/assistant/scripts/mcp/`, fill `{{HOME}}`, `chmod +x` them.
3. Sign-ins: they run `~/assistant/scripts/mcp/sign-in-browser.sh https://www.opentable.com/signin https://resy.com`
   (any sites), sign in in the window that opens, then quit Chrome with Cmd-Q. The
   `--use-mock-keychain` flag in that script matters: without it the saved logins are
   unreadable to the assistant. Never ask for or type their passwords.
4. The browser needs the mini logged in with a screen session (Phase 1 auto-login).

**TripIt.** In TripIt on the web: Settings > Calendar Feeds > turn on the feed and copy its
private URL; they paste it into `.env` as `TRIPIT_FEED_URL`. The runner syncs it hourly to
`~/mcp/tripit/trips.md`. Test now: `~/assistant/scripts/venv/bin/python ~/assistant/scripts/tripit_sync.py`.

**Calendars, read-only (simple).** Google Calendar > Settings > the calendar > "Secret address
in iCal format" works like the TripIt feed; you can adapt `tripit_sync.py` into a second sync.

**Gmail and calendars, read and write (advanced).** The reference setup uses *macbridge*, a small
Swift helper that talks to the Mail and Calendar apps (with the Google account added under
System Settings > Internet Accounts) and enforces "only these calendars" and "send only an
approved draft" in code. It isn't in this kit; if they want it, they can ask whoever shared
this kit for a copy, and it plugs in as a second entry in `.mcp.json`.

## Phase 9: Background jobs (launchd)

Goal: the bot runs all the time and the runner every 15 minutes, surviving reboots. launchd is
macOS's built-in job scheduler; each job is a small `.plist` file.

You do:
1. Fill `templates/services/telegrambot.plist` and `taskrunner.plist`, save them as
   `~/assistant/services/{{LABEL}}.telegrambot.plist` and `{{LABEL}}.taskrunner.plist`, commit,
   and copy them to `~/Library/LaunchAgents/`.
2. Load them: `launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/{{LABEL}}.telegrambot.plist`
   (same for the runner).
3. Check: `launchctl print gui/$(id -u)/{{LABEL}}.telegrambot | grep -E 'state|last exit'` and
   `tail ~/assistant/scripts/logs/telegram_bot.log`. Their phone should get "✅ Bot is back up."

If macOS shows a prompt like "python3.12 wants to access your Documents folder" (on the mini's
screen, so they may need Screen Sharing), they click Allow. If reads of the brain fail silently
from the bot but work here, add the venv's Python and `~/.local/bin/claude` under System
Settings > Privacy & Security > Full Disk Access.

## Phase 10: Smoke test and handoff

Have them send these from their phone, one at a time, and check each answer:
1. "hi, who are you?" (bot works, CLAUDE.md loaded)
2. "what do you know about me?" (brain readable)
3. "remember I'm allergic to shellfish" then check the right page changed (brain writable)
4. "every morning at 8, send me one good quote" then `/status` (tasks skill + tasks.json)
5. If browser: "is there a table for 2 at <a local place> Friday at 7?" (browser + sign-in)
6. `/new`, `/undo` (it will show the last commit and ask), `/restart`

Then finish SETUP.md with a short "how to fix things" table (token expired: `claude
setup-token`, update .env, send /restart; a site logged out: sign in again with
sign-in-browser.sh over Screen Sharing; Obsidian closed: reopen it), and tell them the one habit
that matters most: **just tell it what you liked and didn't, every time**. It writes that down
and gets better; they shouldn't need to edit prompts.
{% endraw %}