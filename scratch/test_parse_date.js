const parseDateFromReport = (timeStr) => {
  if (!timeStr) return null;
  const parts = timeStr.split('/');
  if (parts.length >= 3) {
    const p1 = parts[parts.length-3].trim();
    const p2 = parts[parts.length-2].trim();
    const p3 = parts[parts.length-1].trim();
    
    if (p3.length === 4) {
      let dStr = p1;
      if (dStr.includes(' ')) {
        const sub = dStr.split(' ');
        dStr = sub[sub.length-1];
      }
      return new Date(Number(p3), Number(p2)-1, Number(dStr));
    }
  }
  return null;
}

const d1 = parseDateFromReport("14:00 /6 /02/10/2026");
console.log(d1);
console.log(d1.toISOString());

const d2 = parseDateFromReport("09:15 /2 /21/4/2026");
console.log(d2);
