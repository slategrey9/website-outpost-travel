"""Generate v2 utility pages (journal index, thanks, 404) with the shared chrome.
Usage (from the repo root): python3 tools/build_pages.py .
To add a Journal article: copy journal/_drafts/_template-list-article.html,
or add an article(...) call below, then move it out of _drafts to publish.
"""
import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from chrome import mobile_nav, nav_left, NAV_IG, footer, newsletter_form, IG_URL, IG_HANDLE

ROOT = pathlib.Path(sys.argv[1])

FONTS = ('<link rel="preconnect" href="https://fonts.googleapis.com" />\n'
         '  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />\n'
         '  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=Jost:wght@300;400;500&display=swap" rel="stylesheet" />')

SCRIPT = '''<script>
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
      });
    }, { threshold: 0.08 });
    document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));

    const mainNav = document.getElementById('mainNav');
    function updateNav() { mainNav.classList.toggle('nav--scrolled', window.scrollY > 48); }
    updateNav();
    window.addEventListener('scroll', updateNav, { passive: true });

    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const mobileNav = document.getElementById('mobileNav');
    const mobileNavClose = document.getElementById('mobileNavClose');
    hamburgerBtn.addEventListener('click', () => {
      mobileNav.classList.add('open');
      hamburgerBtn.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    });
    function closeMobileNav() {
      mobileNav.classList.remove('open');
      hamburgerBtn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
    mobileNavClose.addEventListener('click', closeMobileNav);
    mobileNav.addEventListener('click', e => { if (e.target === mobileNav) closeMobileNav(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMobileNav(); });
  </script>'''


def nav(p, active=None, solid=False):
    cls = "nav nav--solid" if solid else "nav"
    return f'''<nav class="{cls}" id="mainNav" role="navigation" aria-label="Main navigation">
    {nav_left(active, p)}
    <a href="{p}index.html" class="nav-logo" aria-label="Outpost Travel, home">
      <span class="nav-logo-outpost">OUTPOST</span>
      <span class="nav-logo-travel">TRAVEL</span>
    </a>
    <div class="nav-right">
      {NAV_IG}<a href="https://wa.me/6597514830" class="nav-wa" target="_blank" rel="noopener noreferrer">WhatsApp</a>
      <a href="{p}start-planning.html" class="nav-cta">Start Planning</a>
      <button class="hamburger" id="hamburgerBtn" aria-label="Open menu" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>
    </div>
  </nav>'''


def page(*, p, title, description, canonical, body, styles, active=None, solid=False, robots=None, og_image="https://outposttravel.co/images/og-image.jpg", source="footer"):
    robots_tag = f'\n  <meta name="robots" content="{robots}" />' if robots else ''
    canon = f'\n  <link rel="canonical" href="{canonical}" />' if canonical else ''
    return f'''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{title}</title>
  <meta name="description" content="{description}" />{robots_tag}{canon}
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="Outpost Travel" />
  <meta property="og:title" content="{title}" />
  <meta property="og:description" content="{description}" />
  <meta property="og:image" content="{og_image}" />
  <meta name="twitter:card" content="summary_large_image" />
  {FONTS}
  <link rel="icon" href="{p}favicon.svg" type="image/svg+xml" />
  <link rel="stylesheet" href="{p}assets/base.css" />
  <style>
{styles}
  </style>
  <link rel="stylesheet" href="{p}assets/site.css?v=3" />
</head>
<body>

  {mobile_nav(p)}

  {nav(p, active, solid)}

{body}

  {footer(source, p)}

  {SCRIPT}
  <script src="{p}assets/site.js" defer></script>
</body>
</html>
'''


# ---------------------------------------------------------------- JOURNAL
ARTICLES = [
    ("Families", "maldives.jpg", "A boat on a turquoise lagoon",
     "Toddler-friendly places that still feel like a holiday",
     "Short transfers, proper kids' clubs, and somewhere for the adults to exhale."),
    ("Stays", "amankora-punakha-pool.jpg", "Pool terrace at a private lodge in Bhutan",
     "Private estates and villas for the whole family",
     "Whole-house buyouts and villas with a chef, for when everyone's coming."),
    ("Families", "safari.jpg", "Savanna at golden hour",
     "First safaris with children: where, when and how",
     "Malaria-free options, family tents, and which camps welcome younger guests."),
    ("Celebrations", "capella-lord-howe-hero.jpg", "Aerial view of Lord Howe Island",
     "Where to honeymoon, month by month",
     "Twelve months, twelve places at their best. Plan backwards from the date."),
    ("Families", "service-hotel-bookings.jpg", "Wooden boathouse on an alpine lake",
     "Three generations, one trip: hotels that get it right",
     "Connecting rooms, step-free paths and a pool the grandparents will actually use."),
    ("Ideas", "amankora-paro-lodge.jpg", "Lodge in the Paro valley, Bhutan",
     "Why a human still books your holiday",
     "Notes from the world's biggest luxury travel show, on judgement, light switches and AI."),
]

JOURNAL_STYLES = '''
    .j-hero {
      position: relative;
      min-height: 78vh;
      display: flex;
      align-items: flex-end;
      overflow: hidden;
      background: var(--navy);
    }
    .j-hero-bg {
      position: absolute; inset: 0;
      background: url('../images/hero.jpg') center 40% / cover no-repeat;
    }
    .j-hero::after {
      content: ''; position: absolute; inset: 0;
      background: linear-gradient(110deg, rgba(18,24,36,0.82) 0%, rgba(18,24,36,0.5) 55%, rgba(18,24,36,0.2) 100%);
    }
    .j-hero-content {
      position: relative; z-index: 1;
      padding: 0 56px 80px;
      max-width: 760px;
    }
    .j-hero .eyebrow { color: rgba(246,241,232,0.7); }
    .j-hero h1 {
      font-size: clamp(2.8rem, 6vw, 5rem);
      font-weight: 300;
      color: var(--cream);
      line-height: 1.05;
      margin-bottom: 1.3rem;
    }
    .j-hero p {
      font-weight: 300;
      font-size: 1rem;
      color: rgba(246,241,232,0.72);
      max-width: 460px;
      line-height: 1.75;
    }
    .j-soon {
      background: var(--cream-mid);
      padding: 72px 52px;
      border-bottom: 1px solid var(--sand);
    }
    .j-soon-inner {
      max-width: 1100px; margin: 0 auto;
      display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center;
    }
    .j-soon h2 { font-size: clamp(1.7rem, 3vw, 2.3rem); color: var(--navy); margin-bottom: 12px; }
    .j-soon p { font-weight: 300; font-size: 0.9rem; color: var(--text-mid); line-height: 1.8; }
    .j-soon .footer-form input {
      background: #fff;
      border-color: var(--sand);
      color: var(--text);
    }
    .j-soon .footer-form input::placeholder { color: var(--text-light); }
    .j-soon .footer-form input:focus { border-color: var(--gold); }
    .j-soon .form-micro { font-weight: 300; font-size: 0.72rem; color: var(--text-light); margin-top: 6px; }
    .j-list { background: var(--cream); padding: 96px 52px 104px; }
    .j-list-inner { max-width: 1100px; margin: 0 auto; }
    .j-list-header {
      display: flex; align-items: flex-end; justify-content: space-between; gap: 24px;
      padding-bottom: 24px; margin-bottom: 44px; border-bottom: 1px solid var(--sand);
    }
    .j-list-header h2 { font-size: clamp(1.9rem, 3.4vw, 2.6rem); color: var(--navy); }
    .j-topics { font-weight: 300; font-size: 0.8rem; letter-spacing: 0.04em; color: var(--text-light); }
    .j-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 56px 32px; }
    .j-card-img { height: 260px; overflow: hidden; margin-bottom: 20px; position: relative; }
    .j-card-img img { width: 100%; height: 100%; object-fit: cover; filter: saturate(0.92); }
    .j-badge {
      position: absolute; top: 14px; left: 14px;
      font-weight: 500; font-size: 0.58rem; letter-spacing: 0.2em; text-transform: uppercase;
      background: rgba(246,241,232,0.92); color: var(--navy);
      padding: 5px 11px; border-radius: 100px;
    }
    .j-cat {
      display: block; font-weight: 500; font-size: 0.62rem; letter-spacing: 0.22em;
      text-transform: uppercase; color: var(--gold); margin-bottom: 10px;
    }
    .j-card h3 { font-size: 1.5rem; color: var(--navy); line-height: 1.2; margin-bottom: 10px; }
    .j-card p { font-weight: 300; font-size: 0.86rem; color: var(--text-mid); line-height: 1.75; }
    .j-ask {
      background: var(--cream-mid); padding: 72px 52px; text-align: center;
      border-top: 1px solid var(--sand);
    }
    .j-ask h2 { font-size: clamp(1.5rem, 2.6vw, 2rem); color: var(--navy); margin-bottom: 12px; }
    .j-ask p { font-weight: 300; font-size: 0.9rem; color: var(--text-mid); margin: 0 auto 24px; max-width: 520px; line-height: 1.8; }
    .j-ask-links { display: flex; gap: 28px; justify-content: center; flex-wrap: wrap; }
    @media (max-width: 1100px) {
      .j-hero-content { padding: 0 40px 72px; }
      .j-soon, .j-ask { padding: 64px 40px; }
      .j-list { padding: 80px 40px; }
      .j-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 768px) {
      .j-hero { min-height: 70vh; }
      .j-hero-content { padding: 0 24px 56px; }
      .j-soon, .j-ask { padding: 56px 20px; }
      .j-soon-inner { grid-template-columns: 1fr; gap: 28px; }
      .j-list { padding: 64px 20px; }
      .j-list-header { flex-direction: column; align-items: flex-start; gap: 8px; }
      .j-grid { grid-template-columns: 1fr; gap: 44px; }
      .j-card-img { height: 58vw; }
    }
'''


def journal():
    cards = "\n".join(f'''        <article class="j-card" data-animate>
          <div class="j-card-img">
            <img src="../images/{img}" alt="{alt}" loading="lazy" />
            <span class="j-badge">Coming soon</span>
          </div>
          <span class="j-cat">{cat}</span>
          <h3>{title}</h3>
          <p>{dek}</p>
        </article>''' for cat, img, alt, title, dek in ARTICLES)
    body = f'''  <header class="j-hero" aria-labelledby="journal-heading">
    <div class="j-hero-bg" role="img" aria-label="Northern lights over a still fjord"></div>
    <div class="j-hero-content">
      <span class="eyebrow" data-animate>Coming Soon</span>
      <h1 id="journal-heading" data-animate>The Journal</h1>
      <p data-animate>Where to go, where to stay, and how to make it work: for families, celebrations and the curious. The first pieces are on their way.</p>
    </div>
  </header>

  <section class="j-soon on-light" aria-labelledby="soon-heading">
    <div class="j-soon-inner">
      <div data-animate>
        <span class="eyebrow">The Dispatch</span>
        <h2 id="soon-heading">Be the first to read it</h2>
        <p>New pieces go to The Dispatch first, along with the hotels and destinations worth knowing. Only when there's something worth sending.</p>
      </div>
      <div data-animate class="delay-1">
        {newsletter_form("journal: coming soon")}
        <p class="form-micro">No spam. Unsubscribe any time. See our <a href="../privacy.html" style="border-bottom:1px solid var(--sand)">privacy policy</a>.</p>
      </div>
    </div>
  </section>

  <section class="j-list" aria-labelledby="works-heading">
    <div class="j-list-inner">
      <div class="j-list-header" data-animate>
        <div>
          <span class="eyebrow">In the Works</span>
          <h2 id="works-heading">What we're writing</h2>
        </div>
        <p class="j-topics">Families &middot; Stays &middot; Celebrations &middot; Ideas</p>
      </div>
      <div class="j-grid">
{cards}
      </div>
    </div>
  </section>

  <section class="j-ask" aria-labelledby="ask-heading">
    <div data-animate>
      <h2 id="ask-heading">A question you'd like answered?</h2>
      <p>Tell us what you're trying to figure out. If it's useful to you, it's probably useful to someone else, and we'll write it up.</p>
      <div class="j-ask-links">
        <a href="mailto:hello@outposttravel.co?subject=An%20idea%20for%20the%20Journal" class="text-link">Email us &rarr;</a>
        <a href="{IG_URL}" class="text-link" target="_blank" rel="noopener noreferrer">Follow @{IG_HANDLE} &rarr;</a>
      </div>
    </div>
  </section>'''
    return page(p="../", title="The Journal | Outpost Travel",
                description="Coming soon: toddler-friendly places, private estates, first safaris, honeymoons and more. Coming soon from Outpost Travel.",
                canonical="https://outposttravel.co/journal/", body=body, styles=JOURNAL_STYLES,
                active="journal", source="footer: journal")


# ---------------------------------------------------------------- THANKS + 404
SIMPLE_STYLES = '''
    .simple {
      min-height: 72vh;
      display: flex; align-items: center; justify-content: center;
      padding: calc(var(--nav-h) + 72px) 24px 96px;
      text-align: center;
    }
    .simple-inner { max-width: 560px; }
    .simple h1 { font-size: clamp(2.4rem, 5vw, 3.6rem); font-weight: 300; color: var(--navy); margin-bottom: 18px; }
    .simple p { font-weight: 300; font-size: 0.95rem; color: var(--text-mid); line-height: 1.8; margin-bottom: 14px; }
    .simple-links { display: flex; gap: 14px 28px; justify-content: center; flex-wrap: wrap; margin-top: 28px; }
'''


def simple(*, title, eyebrow, heading, paras, links, canonical=None, robots="noindex", p="/"):
    ps = "\n".join(f"      <p>{x}</p>" for x in paras)
    ls = "\n".join(links)
    body = f'''  <main class="simple">
    <div class="simple-inner">
      <span class="eyebrow">{eyebrow}</span>
      <h1>{heading}</h1>
{ps}
      <div class="simple-links">
{ls}
      </div>
    </div>
  </main>'''
    return page(p=p, title=title, description=heading, canonical=canonical, body=body,
                styles=SIMPLE_STYLES, solid=True, robots=robots, source="footer: " + eyebrow.lower())


THANKS = simple(
    title="Thank you | Outpost Travel", eyebrow="Received", heading="Thank you. We'll be in touch.",
    paras=["Your message has reached us. If you sent an enquiry, Kristin will reply within 24 hours, usually much sooner.",
           "If you subscribed to The Dispatch, the next one will find you."],
    links=['        <a href="/" class="btn-gold">Back to the homepage</a>',
           '        <a href="https://wa.me/6597514830" class="text-link" target="_blank" rel="noopener noreferrer">Chat on WhatsApp &rarr;</a>'])

NOT_FOUND = simple(
    title="Page not found | Outpost Travel", eyebrow="Off the map", heading="This page has wandered off.",
    paras=["The link may be old, or the page may have moved. Everything else is right where you left it."],
    links=['        <a href="/" class="btn-gold">Back to the homepage</a>',
           '        <a href="/start-planning.html" class="text-link">Start planning &rarr;</a>',
           '        <a href="/journal/" class="text-link">The Journal &rarr;</a>'])

if __name__ == "__main__":
    (ROOT / "journal").mkdir(exist_ok=True)
    (ROOT / "journal" / "index.html").write_text(journal())
    (ROOT / "thanks.html").write_text(THANKS)
    (ROOT / "404.html").write_text(NOT_FOUND)
    print("built journal/index.html, thanks.html, 404.html")


# ---------------------------------------------------------------- ARTICLES
ARTICLE_STYLES = '''
    .a-head {
      padding: calc(var(--nav-h) + 72px) 24px 48px;
      text-align: center;
      max-width: 820px;
      margin: 0 auto;
    }
    .a-cat { font-weight: 500; font-size: 0.63rem; letter-spacing: 0.24em; text-transform: uppercase; color: var(--gold); }
    .a-head h1 { font-size: clamp(2.4rem, 5vw, 3.8rem); font-weight: 300; color: var(--navy); margin: 18px 0 18px; line-height: 1.08; }
    .a-dek { font-family: 'Cormorant Garamond', serif; font-style: italic; font-size: 1.3rem; color: var(--text-mid); line-height: 1.5; }
    .a-meta { font-weight: 300; font-size: 0.76rem; letter-spacing: 0.06em; color: var(--text-light); margin-top: 22px; }
    .a-cover { max-width: 1200px; margin: 0 auto 64px; padding: 0 24px; }
    .a-cover img { width: 100%; height: clamp(280px, 52vw, 620px); object-fit: cover; }
    .a-cover figcaption, .a-entry figcaption { font-weight: 300; font-size: 0.72rem; color: var(--text-light); margin-top: 10px; }
    .a-body { max-width: 680px; margin: 0 auto; padding: 0 24px 40px; }
    .a-body p { font-weight: 300; font-size: 1.02rem; color: var(--text); line-height: 1.9; margin-bottom: 1.4em; }
    .a-body > p:first-of-type::first-letter {
      font-family: 'Cormorant Garamond', serif; float: left; font-size: 4.2rem; line-height: 0.85;
      padding: 6px 10px 0 0; color: var(--gold);
    }
    .a-body h2 { font-size: clamp(1.7rem, 3vw, 2.2rem); color: var(--navy); margin: 2.2em 0 0.6em; }
    .a-body blockquote {
      font-family: 'Cormorant Garamond', serif; font-style: italic; font-size: 1.5rem; line-height: 1.45;
      color: var(--navy); border-left: 1px solid var(--gold); padding: 4px 0 4px 24px; margin: 2em 0;
    }
    .a-entry { margin: 56px 0; padding-top: 40px; border-top: 1px solid var(--sand); }
    .a-entry-num { font-family: 'Cormorant Garamond', serif; font-size: 3rem; font-weight: 300; color: var(--sand); line-height: 1; }
    .a-entry h2 { margin-top: 8px; }
    .a-entry-where { font-weight: 500; font-size: 0.66rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--gold); margin-bottom: 18px; display: block; }
    .a-entry img { width: 100%; height: clamp(240px, 44vw, 420px); object-fit: cover; margin-bottom: 4px; }
    .a-facts {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;
      background: var(--cream-mid); padding: 18px 20px; margin: 22px 0 8px;
    }
    .a-facts dt { font-weight: 500; font-size: 0.6rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--text-light); }
    .a-facts dd { font-weight: 300; font-size: 0.86rem; color: var(--text); margin-top: 4px; }
    .a-perk { font-weight: 400; font-size: 0.86rem; color: var(--text-mid); }
    .a-perk::before { content: '\\2726'; color: var(--gold); margin-right: 8px; }
    .a-sign { font-family: 'Cormorant Garamond', serif; font-style: italic; font-size: 1.2rem; color: var(--text-mid); }
    .a-cta {
      max-width: 680px; margin: 24px auto 96px; padding: 40px 36px; text-align: center;
      background: var(--navy); color: var(--cream);
    }
    .a-cta h2 { font-size: 1.9rem; font-weight: 300; margin-bottom: 10px; }
    .a-cta p { font-weight: 300; font-size: 0.9rem; color: rgba(246,241,232,0.7); margin-bottom: 24px; line-height: 1.7; }
    .a-draft {
      position: fixed; bottom: 16px; left: 16px; z-index: 3000;
      background: #9A3D25; color: #fff; font-size: 0.72rem; letter-spacing: 0.08em;
      padding: 8px 14px; border-radius: 100px;
    }
    @media (max-width: 768px) {
      .a-head { padding-top: calc(var(--nav-h) + 40px); }
      .a-cover { padding: 0; margin-bottom: 44px; }
      .a-facts { grid-template-columns: 1fr; }
      .a-cta { margin: 24px 20px 72px; padding: 32px 22px; }
    }
'''


def article(*, slug, cat, title, dek, meta, cover, cover_alt, cover_caption, content, cta_dest, draft_note):
    body = f'''  <div class="a-draft" aria-hidden="true">{draft_note}</div>
  <article>
    <header class="a-head">
      <span class="a-cat">{cat}</span>
      <h1>{title}</h1>
      <p class="a-dek">{dek}</p>
      <p class="a-meta">{meta}</p>
    </header>
    <figure class="a-cover">
      <img src="../../images/{cover}" alt="{cover_alt}" />
      <figcaption>{cover_caption}</figcaption>
    </figure>
    <div class="a-body">
{content}
    </div>
    <aside class="a-cta">
      <h2>Want this turned into a trip?</h2>
      <p>Tell us who's going and when. We'll come back with a clear recommendation, Virtuoso perks included.</p>
      <a href="../../start-planning.html?type=trip&amp;dest={cta_dest}" class="btn-gold">Start Planning</a>
    </aside>
  </article>'''
    html = page(p="../../", title=f"{title} | Outpost Travel Journal", description=dek,
                canonical=f"https://outposttravel.co/journal/{slug}", body=body, styles=ARTICLE_STYLES,
                active="journal", solid=True, robots="noindex, nofollow", source=f"footer: journal/{slug}")
    return html


ESSAY = '''      <p>I spent last week at the world's biggest luxury travel show. Fifty meetings, four days, a lot of coffee. I went expecting to hear about new hotels and new islands, and I did. What I did not expect was to hear the same quiet argument made twice, from two different stages, by people who had never met.</p>
      <p>Both said the same thing. In a world filling up with artificial intelligence, the value of a human has gone up.</p>
      <p>That sounds like the sort of thing a room full of travel advisors wants to hear about itself. So I paid close attention to the reasoning, because comforting ideas are usually the ones worth checking.</p>
      <h2>More choice, harder decisions</h2>
      <p>The way people plan has stretched at both ends. Some now book eighteen months out, because they have realised time is the scarcest thing they have and they want something worth looking forward to. Others book inside a week, on impulse, because they can. What has grown in the middle is not certainty. It is noise. There has never been more information about where to go, and it has never been harder to choose. When everything is available and everything looks the same, a moodboard is easy and a decision is hard.</p>
      <p>Artificial intelligence is very good at the moodboard. It will give you a hundred beautiful options in a second. What it cannot give you is the phone call that gets you the table, the room, the guide who is actually good, the afternoon that was never listed anywhere. It cannot tell you that the photo is doing a lot of work, or that the quiet season is the better season, or that the second hotel is worth twice the first for reasons the website will never mention. That part still runs on relationships, and relationships still run on people.</p>
      <blockquote>A brand is not what you say about it. It is what people feel and remember and repeat when you are not in the room.</blockquote>
      <p>One of the speakers put it more simply than I can. Then she turned it on the advisors: your recommendation carries more weight than any campaign. When someone knows you, and trusts you, they book what you suggest. Your judgement travels with you.</p>
      <p>I have felt the truth of this from the other side. The trips my clients remember are almost never the ones with the longest list of inclusions. They are the ones with a moment in them. A door that opened. A dinner that should not have been possible. A morning that was planned so lightly it felt like luck. None of that is a product you can add to a cart. It is judgement, applied on your behalf, by someone who has been there.</p>
      <h2>The light switch</h2>
      <p>The other speaker, who thinks about the psychology of experience for a living, said something that has stayed with me. When he books a holiday, he is not looking at the palm trees. He knows what the sea looks like. He is looking, without quite realising it, at the quality of the light switch. The small thing that tells him whether the rest of the place was cared for. That is the work I love most, and it is the work a search cannot do. Reading the small things, so you never have to.</p>
      <p>So no, I do not think the machines are coming for this. If anything they are clearing the ground. They will happily handle the noise, the comparing, the first hundred options. What is left is the part that was always the point. Someone who knows you, knows the places, and quietly makes the two fit.</p>
      <p>That is what we do. You tell us where you are dreaming of going. We take it from there.</p>
      <p class="a-sign">Kristin</p>'''

LIST_TEMPLATE = '''      <!-- TEMPLATE: list article. Intro: 2-3 short paragraphs on who this list is for and how we chose. -->
      <p>[Intro. Who this shortlist is for, and the test every place had to pass. Two or three short paragraphs, first person plural, no superlatives.]</p>
      <p>[How we chose: e.g. under five hours from Singapore, a kids' club that takes under-fours, cots and high chairs without asking twice.]</p>

      <!-- Copy one .a-entry block per place. Keep 5 to 10 entries. -->
      <section class="a-entry">
        <span class="a-entry-num">01</span>
        <h2>[Hotel or place name]</h2>
        <span class="a-entry-where">[Region, Country]</span>
        <figure>
          <img src="../../images/maldives.jpg" alt="[Describe the photo]" loading="lazy" />
          <figcaption>[Photo credit: Hotel media kit]</figcaption>
        </figure>
        <dl class="a-facts">
          <div><dt>Best for</dt><dd>[Toddlers, 2 to 5]</dd></div>
          <div><dt>From Singapore</dt><dd>[4h 30m direct]</dd></div>
          <div><dt>Best months</dt><dd>[Nov to Apr]</dd></div>
        </dl>
        <p>[Why it's on the list. The specific detail that earns it a place: the shallow lagoon, the villa layout, the nanny service. Two short paragraphs.]</p>
        <p>[Good to know: the honest caveat. Transfer length, room to book, when to avoid.]</p>
        <p class="a-perk">[Book with us: Virtuoso amenities include daily breakfast, a USD 100 credit and an upgrade when available.]</p>
      </section>

      <section class="a-entry">
        <span class="a-entry-num">02</span>
        <h2>[Hotel or place name]</h2>
        <span class="a-entry-where">[Region, Country]</span>
        <p>[Repeat the structure above.]</p>
      </section>

      <h2>[Closing thought]</h2>
      <p>[One paragraph: how to choose between them, and an invitation to ask.]</p>'''

if __name__ == "__main__":
    d = ROOT / "journal" / "_drafts"
    d.mkdir(parents=True, exist_ok=True)
    (d / "why-a-human-still-books-your-holiday.html").write_text(article(
        slug="why-a-human-still-books-your-holiday", cat="Ideas",
        title="Why a human still books your holiday",
        dek="Notes from the world's biggest luxury travel show, on judgement, light switches and artificial intelligence.",
        meta="By Kristin Lim &middot; 4 min read",
        cover="amankora-paro-lodge.jpg", cover_alt="A lodge in the Paro valley, Bhutan", cover_caption="Amankora Paro, Bhutan",
        content=ESSAY, cta_dest="", draft_note="DRAFT &middot; not linked or indexed"))
    (d / "_template-list-article.html").write_text(article(
        slug="TEMPLATE", cat="Families",
        title="[Toddler-friendly places that still feel like a holiday]",
        dek="[One line on who this is for and what makes the list different.]",
        meta="By Kristin Lim &middot; [X] min read",
        cover="maldives.jpg", cover_alt="[Describe the cover photo]", cover_caption="[Place, Country]",
        content=LIST_TEMPLATE, cta_dest="", draft_note="TEMPLATE &middot; copy, then fill the [brackets]"))
    print("built journal drafts")
