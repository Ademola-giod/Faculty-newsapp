export const config = {
  matcher: '/post/:path*',
};

const BOT_UA_REGEX = /whatsapp|facebookexternalhit|twitterbot|linkedinbot|telegrambot|slackbot|discordbot/i;

export default async function middleware(request) {
  const userAgent = request.headers.get('user-agent') || '';

  // not a bot? let it pass through to the normal React app
  if (!BOT_UA_REGEX.test(userAgent)) {
    return;
  }

  const url = new URL(request.url);
  const id = url.pathname.split('/').pop();

  try {
    const res = await fetch(`${process.env.BACKEND_URL}/api/posts/${id}`);
    if (!res.ok) return; // fall through if post fetch fails

    const post = await res.json();

    const title = escapeHtml(post.title);
    const description = escapeHtml(
      post.content.replace(/<[^>]*>?/gm, '').slice(0, 150)
    );
    

    const buildOgImage = (cloudinaryUrl, fallback) => {
  if (!cloudinaryUrl) return fallback;

  // insert Cloudinary transform params right after '/upload/'
  return cloudinaryUrl.replace(
    '/upload/',
    '/upload/w_1200,h_630,c_fill,g_auto,f_jpg,q_auto/'
  );
};

const image = buildOgImage(post.image?.url, `${url.origin}/default-og-image.jpg`);

    const html = `<!DOCTYPE html>
<html>
  <head>
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:url" content="${url.href}" />
    <meta property="og:type" content="article" />
    <meta name="twitter:card" content="summary_large_image" />
  </head>
  <body>${title}</body>
</html>`;

    return new Response(html, {
      headers: { 'content-type': 'text/html' }
    });
  } catch (err) {
    return; // on any error, just let the normal app load
  }
}

function escapeHtml(str = '') {
  return str.replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[c]);
}