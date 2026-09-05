export default async function handler(req, res) {
  const SITE_URL = 'https://faculty-newsapp-client.vercel.app';
  const BACKEND_URL = process.env.BACKEND_URL;

  try {
    // fetch every published post, paging through since backend caps at 50/page
    let allPosts = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const res2 = await fetch(`${BACKEND_URL}/api/posts?page=${page}&limit=50`);
      const data = await res2.json();
      allPosts = allPosts.concat(data.posts || []);
      hasMore = Boolean(data.hasMore);
      page += 1;
      if (page > 50) break; // safety cap, ~2500 posts max
    }

    const staticUrls = [
      { loc: `${SITE_URL}/`, changefreq: 'daily', priority: '1.0' },
      { loc: `${SITE_URL}/feed`, changefreq: 'hourly', priority: '0.9' },
    ];

    const postUrls = allPosts.map((post) => ({
      loc: `${SITE_URL}/post/${post._id}`,
      lastmod: new Date(post.updatedAt || post.createdAt).toISOString(),
      changefreq: 'weekly',
      priority: '0.7'
    }));

    const allUrls = [...staticUrls, ...postUrls];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map((u) => `  <url>
    <loc>${u.loc}</loc>
    ${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    res.setHeader('Content-Type', 'application/xml');
    res.status(200).send(xml);

  } catch (err) {
    console.error('Sitemap error:', err);
    res.status(500).send('Error generating sitemap');
  }
}