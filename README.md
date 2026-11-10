# Sunnah Halaqah waitlist

The waitlist landing page: "Find your teacher. Or become one." It's one static page (`index.html`). Signups go to a Google Sheet through a small Google Apps Script (`apps-script/Code.gs`).

## 1. Connect the Google Sheet (about 5 minutes, done once)

1. Signed in as sunnahhalaqah@gmail.com, create a new Google Sheet named **Sunnah Halaqah Waitlist**.
2. In the Sheet, go to **Extensions → Apps Script**. Delete what's there, paste all of `apps-script/Code.gs`, and save.
3. Click **Deploy → New deployment**. Choose the type **Web app**, then set:
   - **Execute as:** Me
   - **Who has access:** Anyone
4. Click **Deploy** and allow access when Google asks. If it says "Google hasn't verified this app", choose Advanced and continue: it's your own script.
5. Copy the **Web app URL**. It ends in `/exec`.
6. In `index.html`, paste it into `const ENDPOINT = "";` near the bottom of the file.

Each signup becomes a row in a **Waitlist** tab, with the path (Learner or Teacher), contact details, answers and source.

If you change `Code.gs` later, use **Deploy → Manage deployments → Edit → New version**, so the URL stays the same.

## 2. Put it online (GitHub Pages)

The repo `sunnahhalaqah/sunnah-halaqah-waitlist` must be public to use free GitHub Pages. There are no secrets in it, so that's fine. Under **Settings → Pages**, choose to deploy from the `main` branch, folder `/ (root)`. The page will be at `https://sunnahhalaqah.github.io/sunnah-halaqah-waitlist/`. You can add your own domain there later.

## Links

- `?src=reel-name` tags where a signup came from, for example `…/?src=ig-bio`. It shows in the Source column.
- `?path=teach` opens the page with "I want to teach" already chosen.

## Preview locally

    python -m http.server 8766 --directory sunnah-halaqah-waitlist

Until `ENDPOINT` is filled in, the form works but saves nothing, and the thank-you screen says so.
