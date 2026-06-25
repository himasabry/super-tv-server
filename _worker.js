const STREAMS = {
  "SUPER_TV_1": "https://restream-app.hima-sabry2015.workers.dev/live/14855632920086.m3u8",
  "SUPER_TV_2": "https://restream-app.hima-sabry2015.workers.dev/live/14863707479574.m3u8",
  "ALWAN_1": "https://super-tv.pages.dev/ALWAN1.m3u8",

  "ALWAN_2": {
    url: "https://player.kianezidi.workers.dev/play.m3u8?id=156588&cat=7193",
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"
  },

  "SSC_1": {
    url: "https://example.com/ssc1.m3u8",
    userAgent: "VLC/3.0.18 LibVLC/3.0.18",
    referer: "https://example.com/"
  }
};

export default {
async fetch(request) {

const reqUrl = new URL(request.url);

// ===== Proxy للـ segments =====
if (reqUrl.pathname === "/proxy") {

const target = reqUrl.searchParams.get("url");

if (!target) {
return new Response("Missing url",{status:400});
}

const res = await fetch(target, {
headers:{
"User-Agent":
request.headers.get("User-Agent") ||
"Mozilla/5.0"
}
});

return new Response(res.body,{
status:res.status,
headers:{
"Content-Type":
res.headers.get("content-type") ||
"video/mp2t",

"Access-Control-Allow-Origin":"*",

"Cache-Control":"no-cache"
}
});

}

// ===== القنوات =====
const key =
reqUrl.pathname
.replace(/^\//,"")
.replace(/\.m3u8$/,"");

const cfg = STREAMS[key];

if(!cfg){
return new Response("Not Found",{status:404});
}

let upstream;
let ua;
let referer;

if(typeof cfg==="string"){
upstream=cfg;
}else{
upstream=cfg.url;
ua=cfg.userAgent;
referer=cfg.referer;
}

const res=await fetch(upstream,{
headers:{
"User-Agent":
ua ||
request.headers.get("User-Agent") ||
"Mozilla/5.0",

"Referer":
referer ||
"https://live.kwikmotion.com/"
}
});

if(!res.ok){
return new Response("Upstream Error",{
status:res.status
});
}

const type=
res.headers.get("content-type") || "";

if(
type.includes("mpegurl") ||
upstream.endsWith(".m3u8")
){

let body=await res.text();

body=body
.split("\n")
.map(line=>{

if(
line.startsWith("http://") ||
line.startsWith("https://")
){

return `${reqUrl.origin}/proxy?url=${encodeURIComponent(line)}`;

}

return line;

})
.join("\n");

return new Response(body,{
headers:{
"Content-Type":
"application/vnd.apple.mpegurl",

"Access-Control-Allow-Origin":"*",

"Cache-Control":"no-cache"
}
});

}

// ملفات الفيديو مباشرة
return new Response(res.body,{
headers:{
"Content-Type":
type,

"Access-Control-Allow-Origin":"*"
}
});

}
};
