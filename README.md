# Badminton Tournament (static, GitHub Pages version)

Same app as before — add players with a level (1 = strongest, 3 = weakest), generate a level-balanced round schedule, enter scores, see live rankings — but with no server. Everything runs in your browser and is stored there (via `localStorage`), so this can be hosted for free on GitHub Pages while your tournament data never leaves your device.

**Privacy note:** the code (this HTML/CSS/JS) is public once hosted, but your data (player names, levels, scores) is not — it's saved only in the browser you use to enter it, on your device. Different browsers/devices won't share data. Clearing your browser's site data will erase it. Use **Export to Excel** to save or share results externally.

## Try it locally first

Just open `index.html` directly in a browser (double-click it), no install needed.

## Publish it on GitHub Pages

1. **Create a GitHub account** if you don't have one: https://github.com/signup
2. **Create a new repository**: on github.com, click the `+` (top right) → *New repository*. Name it something like `badminton-tournament`, keep it Public, don't add a README (we already have one), click *Create repository*.
3. **Push this folder to it.** Open Terminal:
   ```bash
   cd ~/Documents/badminton-tournament-site
   rm -rf .git   # clean slate, in case this folder has a leftover/partial git setup
   git init
   git add .
   git commit -m "Badminton tournament app"
   git branch -M main
   git remote add origin https://github.com/<your-username>/badminton-tournament.git
   git push -u origin main
   ```
   (Replace `<your-username>` with your actual GitHub username. GitHub will prompt you to sign in the first time you push.)
4. **Turn on GitHub Pages**: on your repo's page on github.com, go to *Settings* → *Pages* (left sidebar). Under "Build and deployment", set Source to **Deploy from a branch**, Branch to **main** and folder to **/(root)**, then click *Save*.
5. Wait a minute, then refresh that Pages settings page — it'll show your live URL, something like:
   `https://<your-username>.github.io/badminton-tournament/`

That link is what you open (and can share) to use the app. Remember: since data is per-browser, whoever opens that link enters and sees only their own data — it won't sync between different people's phones/computers.

## Updating it later

Whenever you edit the files locally and want to update the live site:
```bash
cd ~/Documents/badminton-tournament-site
git add .
git commit -m "Update"
git push
```
# badminton-lluisos-torneo
