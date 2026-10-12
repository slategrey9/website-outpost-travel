"""Shared nav / mobile nav / footer markup for the Outpost site (v2).

Imported by build_pages.py to generate the Journal, thanks and 404 pages.
Running it directly was a ONE-OFF migration of the v1 pages (Oct 2026);
do not run it again on the current pages or it will fail / double-insert.
To change the IG handle site-wide, edit IG_HANDLE here, rebuild with
build_pages.py, and find-replace the handle in the five main pages.
"""
import re, sys, pathlib

IG_HANDLE = "outposttravelco"
IG_URL = f"https://www.instagram.com/{IG_HANDLE}/"

IG_SVG = ('<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" '
          'stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
          '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/>'
          '<circle cx="17.5" cy="6.5" r="0.7" fill="currentColor" stroke="none"/></svg>')
WA_SVG = ('<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" '
          'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 '
          '8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 '
          '0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>')

PAGES = {
    "index.html": None,
    "about.html": "about",
    "faq.html": "faq",
    "privacy.html": None,
    "start-planning.html": None,
}


def mobile_nav(p=""):
    return f'''<div class="mobile-nav" id="mobileNav" role="dialog" aria-modal="true" aria-label="Navigation menu">
    <button class="mobile-nav-close" id="mobileNavClose" aria-label="Close menu">&#x2715;</button>
    <a href="{p}about.html">About</a>
    <a href="{p}journal/">Journal</a>
    <a href="{p}faq.html">FAQ</a>
    <a href="{IG_URL}" class="mobile-nav-ig" target="_blank" rel="noopener noreferrer">Instagram @{IG_HANDLE}</a>
    <a href="{p}start-planning.html" class="mobile-nav-cta">Start Planning</a>
  </div>'''


def nav_left(active, p=""):
    def a(href, label, key):
        cls = ' class="active"' if active == key else ''
        return f'<a href="{p}{href}"{cls}>{label}</a>'
    return ('<div class="nav-left">\n      ' + a("about.html", "About", "about") + '\n      '
            + a("journal/", "Journal", "journal") + '\n      ' + a("faq.html", "FAQ", "faq") + '\n    </div>')


NAV_IG = (f'<a href="{IG_URL}" class="nav-ig" target="_blank" rel="noopener noreferrer" '
          f'aria-label="Outpost Travel on Instagram">{IG_SVG}</a>\n      ')


def newsletter_form(source, extra_class=""):
    return f'''<form class="footer-form js-newsletter{extra_class}" name="newsletter" method="POST" action="/thanks.html" data-netlify="true" netlify-honeypot="bot-field" aria-label="Newsletter signup">
          <input type="hidden" name="form-name" value="newsletter" />
          <input type="hidden" name="source" value="{source}" />
          <p hidden><label>Leave this empty <input name="bot-field" tabindex="-1" autocomplete="off" /></label></p>
          <input type="email" name="email" placeholder="Your email address" aria-label="Email address" autocomplete="email" required />
          <button type="submit">Subscribe</button>
        </form>
        <p class="form-status" role="status" aria-live="polite"></p>'''


AFFIL = ('A proud independent affiliate of '
         '<a href="https://www.alchemisttravel.com/" target="_blank" rel="noopener noreferrer">Alchemist Travel</a>')


def footer(source, p=""):
    return f'''<footer class="footer" role="contentinfo">
    <div class="footer-inner">
      <div class="footer-subscribe">
        <span class="footer-eyebrow">The Dispatch</span>
        <p>The hotels and destinations worth knowing, and the occasional reason to go now. Straight to your inbox, every so often.</p>
        {newsletter_form(source)}
        <p class="footer-micro">No spam. Unsubscribe any time.</p>
      </div>
      <div class="footer-info">
        <ul class="footer-nav-inline" role="list">
          <li><a href="{p}about.html">About</a></li>
          <li><a href="{p}journal/">Journal</a></li>
          <li><a href="{p}faq.html">FAQ</a></li>
          <li><a href="{p}start-planning.html">Start Planning</a></li>
        </ul>
        <div class="footer-socials">
          <a href="{IG_URL}" class="footer-ig" target="_blank" rel="noopener noreferrer">{IG_SVG}@{IG_HANDLE}</a>
          <a href="mailto:hello@outposttravel.co" class="footer-email">hello@outposttravel.co</a>
        </div>
        <div class="footer-affil">{AFFIL}</div>
      </div>
    </div>
    <div class="footer-bottom">
      <span>&copy; 2026 Outpost Travel</span>
      <a href="{p}privacy.html">Privacy Policy</a>
    </div>
  </footer>'''


def sub_once(pattern, repl, text, name, flags=re.S):
    new, n = re.subn(pattern, lambda m: repl, text, count=1, flags=flags)
    if n != 1:
        raise SystemExit(f"[{name}] pattern not found: {pattern[:60]}")
    return new


if __name__ == "__main__":
    ROOT = pathlib.Path(sys.argv[1])
    for fname, active in PAGES.items():
        path = ROOT / fname
        html = path.read_text()
        name = fname

        html = sub_once(r'<div class="mobile-nav" id="mobileNav".*?</div>', mobile_nav(), html, name)
        html = sub_once(r'<div class="nav-left">.*?</div>', nav_left(active), html, name)
        if 'class="nav-wa"' in html:
            html = sub_once(r'(<a href="https://wa\.me/6597514830" class="nav-wa")', NAV_IG + r'\1', html, name)
            html = html.replace(NAV_IG + r'\1', NAV_IG + '<a href="https://wa.me/6597514830" class="nav-wa"')
        else:
            html = sub_once(r'(<a href="start-planning\.html" class="nav-cta">)', NAV_IG + '<a href="start-planning.html" class="nav-cta">', html, name)

        source = "footer: " + fname.replace(".html", "")
        if fname == "start-planning.html":
            html = sub_once(
                r'<a href="mailto:hello@outposttravel\.co" class="footer-email">hello@outposttravel\.co</a>',
                '<a href="mailto:hello@outposttravel.co" class="footer-email">hello@outposttravel.co</a>\n'
                f'          <a href="{IG_URL}" class="footer-ig" target="_blank" rel="noopener noreferrer">{IG_SVG}@{IG_HANDLE}</a>',
                html, name)
            html = sub_once(r'<span>Independent affiliate of Alchemist Travel &middot; Serandipians member</span>',
                            f'<span class="footer-affil">{AFFIL}</span>', html, name)
            html = sub_once(r'<li><a href="faq\.html">FAQ</a></li>',
                            '<li><a href="journal/">Journal</a></li>\n            <li><a href="faq.html">FAQ</a></li>',
                            html, name)
        else:
            html = sub_once(r'<footer class="footer" role="contentinfo">.*?</footer>', footer(source), html, name)

        html = sub_once(r'</style>', '</style>\n  <link rel="stylesheet" href="assets/site.css?v=5" />', html, name)
        html = sub_once(r'</body>', '  <script src="assets/site.js" defer></script>\n</body>', html, name)

        if "Serandip" in html:
            raise SystemExit(f"[{name}] Serandipians still present")
        path.write_text(html)
        print("ok", fname)
