const feeds = [
  'https://feeds.bbci.co.uk/news/rss.xml',
  'https://www.theguardian.com/world/rss',
];

async function check(url) {
  const r = await fetch(url);
  const xml = await r.text();
  const items = [...xml.matchAll(/<item[\s\S]*?<\/item>/gi)].slice(0, 3);
  console.log('\n===', url, '===');
  items.forEach((m, i) => {
    const item = m[0];
    const titleMatch = item.match(/<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/i);
    const title = titleMatch?.[1]?.slice(0, 60);
    const mediaContent = item.match(/media:content[^>]+url="([^"]+)"/i);
    const mediaThumb = item.match(/media:thumbnail[^>]+url="([^"]+)"/i);
    const enclosure = item.match(/<enclosure[^>]+url="([^"]+)"[^>]*type="([^"]+)"/i);
    const img = item.match(/<img[^>]+src="([^"]+)"/i);
    console.log(JSON.stringify({
      i,
      title,
      mediaContent: mediaContent?.[1],
      mediaThumb: mediaThumb?.[1],
      enclosure: enclosure ? { url: enclosure[1], type: enclosure[2] } : null,
      img: img?.[1],
    }, null, 2));
  });
}

(async () => {
  for (const f of feeds) await check(f);
})();
