# meetagent.ai landing page

Single static page (`index.html`, no build step) served by GitHub Pages. `.nojekyll` skips Jekyll. No forms yet (decided 2026-10-18).

- Code repo: `C:\Users\user\Desktop\Bobs\Projects\alignPath\meetagent` → GitHub `negentropist/meetagent-site`
- This vault folder is a mirror; edit in the repo, copy back here.

## Point meetagent.ai at it (when ready)
1. Namecheap → Domain List → meetagent.ai → turn off the "for sale" / marketplace parking.
2. Advanced DNS: delete the parking records, then add:
   - `A` `@` → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - `CNAME` `www` → `negentropist.github.io.`
3. Add a `CNAME` file containing `meetagent.ai` to the repo (or set the custom domain under Settings → Pages), wait for the DNS check, then tick **Enforce HTTPS**.
