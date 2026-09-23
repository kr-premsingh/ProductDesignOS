// Try candidate replacements for the dead IDs.
const candidates = {
  // Merch replacement for photo-1529374255404-311a2a4f95c7
  merch: ["photo-1523381210434-271e8be1f52b", "photo-1509942774463-acf339cf87d5", "photo-1583743814966-8936f5b7be1a", "photo-1618677831708-0e7fda3148b8"],
  // Print replacements for the four dead IDs
  print: [
    "photo-1603484477859-abe6a73f9366", "photo-1544716278-ca5e3f4abd8c", "photo-1589998059171-988d887df646",
    "photo-1544441893-675973e31985", "photo-1554902843-260acd8b61a4", "photo-1611270629569-8b357cb88da9",
    "photo-1598620617148-c9e8ddee6711", "photo-1512314889357-e157c22f938d", "photo-1541345023926-55d6e0853f4b",
    "photo-1616627561950-9f746e330187", "photo-1607083206869-4c7672e72a8a", "photo-1602293589930-45aad59ba3ab"
  ]
};
(async () => {
  for (const [group, ids] of Object.entries(candidates)) {
    console.log(`--- ${group} ---`);
    for (const id of ids) {
      try {
        const res = await fetch(`https://images.unsplash.com/${id}?auto=format&fit=crop&w=50&h=50&q=50`, { method: "HEAD" });
        console.log(res.ok ? `OK   ${id}` : `DEAD ${id} (${res.status})`);
      } catch {
        console.log(`ERR  ${id}`);
      }
    }
  }
})();
