// ============================================================
// עדכנו כאן את מספר הוואטסאפ של העסק (פורמט בינלאומי, בלי + ובלי 0 מוביל)
// לדוגמה: מספר ישראלי 050-1234567 -> "972501234567"
// ============================================================
const WHATSAPP_PHONE = "972500000000";

// תפריט מובייל
document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector("nav.main-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => nav.classList.toggle("open"));
  }

  // כפתור צף להזמנת הופעה (בכל עמוד חוץ מ-events.html עצמו ומ-admin.html)
  const path = location.pathname;
  if (!path.endsWith("events.html") && !path.endsWith("admin.html")) {
    const fab = document.createElement("a");
    fab.href = "events.html";
    fab.className = "floating-cta";
    fab.innerHTML = "🎪 הזמינו הופעה";
    document.body.appendChild(fab);
  }
});

// מציג הודעת הצלחה/שגיאה מתחת לטופס
function showFormMessage(el, type, text) {
  el.textContent = text;
  el.className = "form-message show " + type;
}

// בונה קישור לוואטסאפ עם טקסט מוכן מראש
function buildWhatsAppLink(text) {
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(text)}`;
}

// עיצוב תאריך בעברית
function formatDate(isoString) {
  if (!isoString) return "";
  const d = new Date(isoString);
  return d.toLocaleDateString("he-IL", { year: "numeric", month: "2-digit", day: "2-digit" });
}

// קונפטי חגיגי - קוראים לזה אחרי הצלחה בטופס
function confettiBurst() {
  const colors = ["#FF5A5F", "#FFC93C", "#1E8FC4", "#3CB878"];
  for (let i = 0; i < 36; i++) {
    const el = document.createElement("div");
    el.className = "confetti-piece";
    el.style.left = Math.random() * 100 + "vw";
    el.style.background = colors[i % colors.length];
    el.style.animationDuration = (1.8 + Math.random() * 1.4) + "s";
    el.style.animationDelay = (Math.random() * 0.35) + "s";
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3600);
  }
}
