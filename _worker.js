const STREAMS = {
  "SUPER_TV_1": 
    "https://restream-app.super-stv.workers.dev/live/15459447873244.m3u8",
  "SUPER_TV_2": 
    "https://restream-app.super-stv.workers.dev/live/15458583715548.m3u8",
  "SUPER_TV_3": 
    "https://live-sub-global-cdn-v02.sooplive.com/live-stmc-37/295232895/auth_master_playlist.m3u8?aid=.A32.pxqRXFPZNcY9Qg1.wu37JxfiiRJm-XKrCLFd6FZmd7F8nA_8MkQBT1n4s1bzEKujBTZQQcSmE1p-WY309ZbX8zuOA5y10Yw0dV4ux4VP66hBTAfO7_uVbG8fCCeO6dB3VBHzITNWGmm8Zi2Xc8xlO39T4ZmvYB8tuEIpmMQX4t7ulSOLvMkz8RpliuCIJQcMdEIlrodHseoNQN-ZAyScajis5Pm57c5ucAKsgQ"
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/^\//, '').replace(/\.m3u8$/, '');
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
