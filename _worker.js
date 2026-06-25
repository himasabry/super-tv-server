const STREAMS = {
  // قنوات عادية (رابط مباشر)
  "SUPER_TV_1": "https://restream-app.hima-sabry2015.workers.dev/live/14855632920086.m3u8",
  "SUPER_TV_2": "https://restream-app.hima-sabry2015.workers.dev/live/14863707479574.m3u8",
  "ALWAN_1": "https://super-tv.pages.dev/ALWAN1.m3u8",
  
  // قنوات بتحتاج User-Agent مخصص
  "ALWAN_2": {
    url: "https://player.kianezidi.workers.dev/play.m3u8?id=156588&cat=7193",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"
  },
  "SSC_1": {
    url: "https://example.com/ssc1.m3u8",
    userAgent: "VLC/3.0.18 LibVLC/3.0.18",
    referer: "https://example.com/"  // ممكن تضيف Referer كمان لو محتاج
  }
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/^\//, '').replace(/\.m3u8$/, '');
    
    const streamConfig = STREAMS[path];
    if (!streamConfig) {
      return new Response('Not Found', { status: 404 });
    }

    // لو الرابط string مباشر، ولو object نفككه
    let upstream, customUA, customReferer;
    if (typeof streamConfig === 'string') {
      upstream = streamConfig;
    } else {
      upstream = streamConfig.url;
      customUA = streamConfig.userAgent;
      customReferer = streamConfig.referer;
    }

    const res = await fetch(upstream, {
      headers: {
        'Referer': customReferer || 'https://live.kwikmotion.com/',
        'User-Agent': customUA || request.headers.get('User-Agent') || 'Mozilla/5.0'
      }
    });

    let body = await res.text();
    
    if (body.includes('https://')) {
      body = body.split('\n').map(line => {
        if (line.startsWith('https://')) {
          return '/proxy?url=' + encodeURIComponent(line);
        }
        return line;
      }).join('\n');
    }

    return new Response(body, {
      status: res.status,
      headers: {
        'Content-Type': 'application/vnd.apple.mpegurl',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': '*',
        'Cache-Control': 'no-cache'
      }
    });
  }
};
