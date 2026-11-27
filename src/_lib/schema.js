// Structured data (JSON-LD) builders. Every page gets one @graph.
// The organisation, founder and website nodes come from site.yaml with the
// same @ids everywhere, so Google and AI engines see one consistent Outpost.
//
// Rules (from the build brief): mark up only what the page visibly says.
// Never Review / AggregateRating, never FAQPage without a visible Q&A,
// no Hotel markup yet, and no memberOf claim for Virtuoso.

const ORG_ID = (site) => `${site.url}/#organization`;
const PERSON_ID = (site) => `${site.url}/about#kristin-lim`;
const WEBSITE_ID = (site) => `${site.url}/#website`;

export function organization(site) {
  return {
    "@type": "TravelAgency",
    "@id": ORG_ID(site),
    name: site.name,
    url: `${site.url}/`,
    logo: site.logo,
    image: site.image,
    // Affiliation in text only (Decision 1).
    description: `${site.description} ${site.affiliation}.`,
    slogan: site.tagline,
    email: site.email,
    telephone: site.phone,
    areaServed: site.areaServed,
    address: { "@type": "PostalAddress", addressLocality: site.address.locality, addressCountry: site.address.country },
    founder: { "@id": PERSON_ID(site) },
    sameAs: site.sameAs,
  };
}

export function person(site) {
  return {
    "@type": "Person",
    "@id": PERSON_ID(site),
    name: site.founder.name,
    jobTitle: site.founder.jobTitle,
    url: site.founder.url,
    worksFor: { "@id": ORG_ID(site) },
  };
}

export function website(site) {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID(site),
    url: `${site.url}/`,
    name: site.name,
    publisher: { "@id": ORG_ID(site) },
    inLanguage: "en",
  };
}

// The three nodes every page carries.
export function base(site) {
  return [organization(site), person(site), website(site)];
}

export function webPage(site, { url, name, description, dateModified, image }) {
  const node = {
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name,
    description,
    isPartOf: { "@id": WEBSITE_ID(site) },
    publisher: { "@id": ORG_ID(site) },
    inLanguage: "en",
  };
  if (dateModified) node.dateModified = dateModified;
  if (image) node.primaryImageOfPage = image;
  return node;
}

// crumbs: [{ name, url }] from Home down to the current page.
export function breadcrumb(site, crumbs, pageUrl) {
  return {
    "@type": "BreadcrumbList",
    "@id": `${pageUrl}#breadcrumb`,
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: new URL(c.url, site.url).href,
    })),
  };
}

export { ORG_ID as orgId };
