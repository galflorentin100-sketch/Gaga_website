// ============================================================
// עדכנו כאן את מספר הוואטסאפ של העסק (פורמט בינלאומי, בלי + ובלי 0 מוביל)
// לדוגמה: מספר ישראלי 050-1234567 -> "972501234567"
// ============================================================
const WHATSAPP_PHONE = "972525322721";

// תפריט מובייל
document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector("nav.main-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => nav.classList.toggle("open"));
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
