const STREAMS = {
  "SUPER_TV_1": {
    url: "https://restream-app.super-stv.workers.dev/live/14855632920086.m3u8"
  },

  "SUPER_TV_2": {
    url: "https://restream-app.super-stv.workers.dev/live/14863707479574.m3u8"
  },

  "ALWAN_1": {
    url: "https://super-tv.pages.dev/ALWAN1.m3u8"
  },

  "ALWAN_2": {
    url: "https://player.kianezidi.workers.dev/play.m3u8?id=156588&cat=7193",
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36",
    referer:
      ""
  }
  "SUPER_TV_1": "https://restream-app.hima-sabry2015.workers.dev/live/14855632920086.m3u8",
  "SUPER_TV_2": "https://restream-app.hima-sabry2015.workers.dev/live/14863707479574.m3u8"
};

function cors(headers = {}) {
return {
...headers,
"Access-Control-Allow-Origin":"*",
"Access-Control-Allow-Methods":"GET,OPTIONS",
"Access-Control-Allow-Headers":"*",
"Cache-Control":"no-cache"
};
}

async function fetchProxy(url, ua, referer) {

return fetch(url,{
redirect:"follow",
headers:{
"User-Agent":
ua ||
"Mozilla/5.0",

"Referer":
referer ||
"https://live.kwikmotion.com/"
}
});

}

export default {

async fetch(request) {

if(request.method==="OPTIONS"){
return new Response("",{
headers:cors()
});
}

const reqUrl =
new URL(request.url);

// =================
// SEGMENTS PROXY
// =================

if(reqUrl.pathname==="/proxy"){

const target =
reqUrl.searchParams.get("url");

const ua =
reqUrl.searchParams.get("ua");

const referer =
reqUrl.searchParams.get("ref");

if(!target){

return new Response(
"Missing url",
{
status:400
}
);

}

try{

const res =
await fetchProxy(
target,
ua,
referer
);

return new Response(
res.body,
{
status:
res.status,

headers:
cors({
"Content-Type":
res.headers.get(
"content-type"
) ||
"video/mp2t"
})
}
);

}catch(e){

return new Response(
"Proxy Error",
{
status:500
}
);

}

}

// =================
// PLAYLIST
// =================

const id =
reqUrl.pathname
.replace("/","")
.replace(".m3u8","");

const cfg =
STREAMS[id];

if(!cfg){

return new Response(
"Channel Not Found",
{
status:404
}
);

}

try{

const upstream =
cfg.url;

const res =
await fetchProxy(
upstream,
cfg.userAgent,
cfg.referer
);

if(!res.ok){

return new Response(
"Upstream Error",
{
status:
res.status
}
);

}

let body =
await res.text();

const base =
new URL(
upstream
);

body =
body
.split("\n")
.map(line=>{

line =
line.trim();

if(
!line ||
line.startsWith("#")
){

return line;

}

try{

const abs =
new URL(
line,
base
).href;

return (
reqUrl.origin +
"/proxy?url=" +
encodeURIComponent(
abs
) +
"&ua=" +
encodeURIComponent(
cfg.userAgent ||
""
) +
"&ref=" +
encodeURIComponent(
cfg.referer ||
upstream
)
);

}catch{

return line;

}

})
.join("\n");

return new Response(
body,
{
headers:
cors({
"Content-Type":
"application/vnd.apple.mpegurl"
})
}
);

}catch(e){

return new Response(
"Worker Error\n\n"+
e.message,
{
status:500
}
);

}

}

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
