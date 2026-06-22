export async function onRequest({ request }) {

  const url = new URL(request.url);

  // اسم القناة من الرابط
  const path = url.pathname.slice(1).replace(".m3u8", "");

  // ملف القنوات من GitHub
  const jsonURL =
    "https://raw.githubusercontent.com/himasabry/github-json-m3u8-proxy/main/channels.json";

  const res = await fetch(jsonURL);

  if (!res.ok) {
    return new Response("JSON Error", { status: 500 });
  }

  const channels = await res.json();

  // البحث عن القناة
  const streamURL = channels[path];

  if (!streamURL) {
    return new Response("Channel Not Found", { status: 404 });
  }

  // جلب البث
  const streamRes = await fetch(streamURL);

  if (!streamRes.ok) {
    return new Response("Stream Error", { status: 502 });
  }

  // رجوع البث
  return new Response(streamRes.body, {
    headers: {
      "Content-Type": "application/vnd.apple.mpegurl",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-cache"
    }
  });
}
