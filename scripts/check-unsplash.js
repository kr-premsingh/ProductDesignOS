const fs = require("fs");
const src = fs.readFileSync("apps/web/src/lib/artwork.ts", "utf8");
const ids = [...new Set([...src.matchAll(/"(photo-[0-9a-f-]+)"/g)].map((m) => m[1]))];
(async () => {
  const dead = [];
  for (const id of ids) {
    try {
      const res = await fetch(`https://images.unsplash.com/${id}?auto=format&fit=crop&w=50&h=50&q=50`, { method: "HEAD" });
      if (!res.ok) dead.push(`${id} -> ${res.status}`);
    } catch {
      dead.push(`${id} -> ERR`);
    }
  }
  console.log("total:", ids.length);
  console.log(dead.length ? "DEAD:\n" + dead.join("\n") : "all alive");
})();
