const STREAMS = {
  "SUPER_TV_1": "https://restream-app.hima-sabry2015.workers.dev/live/14855632920086.m3u8",
  "SUPER_TV_2": "https://restream-app.hima-sabry2015.workers.dev/live/14863707479574.m3u8"
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/^\\//, '').replace(/\\.m3u8$/, '');
    const upstream = STREAMS[path];
    
    if (!upstream) {
      return new Response('Not Found', { status: 404 });
    }

    const res = await fetch(upstream, {
      headers: {
        'Referer': 'https://live.kwikmotion.com/',
        'User-Agent': request.headers.get('User-Agent') || 'Mozilla/5.0'
      }
    });

    let body = await res.text();
    
    if (body.includes('https://')) {
      body = body.split('\\n').map(line => {
        if (line.startsWith('https://')) {
          return '/proxy?url=' + encodeURIComponent(line);
        }
        return line;
      }).join('\\n');
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
