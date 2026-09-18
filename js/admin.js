const loginScreen = document.getElementById("login-screen");
const adminScreen = document.getElementById("admin-screen");

// ---------- אימות ----------
async function checkSession() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (session) {
    showAdmin();
  } else {
    showLogin();
  }
}

function showLogin() {
  loginScreen.style.display = "block";
  adminScreen.style.display = "none";
}

function showAdmin() {
  loginScreen.style.display = "none";
  adminScreen.style.display = "flex";
  loadOrders();
  loadEvents();
  loadRaffles();
  loadProductsAdmin();
}

document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;
  const msg = document.getElementById("login-msg");

  const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
  if (error) {
    showFormMessage(msg, "error", "התחברות נכשלה: " + error.message);
    return;
  }
  showAdmin();
});

document.getElementById("logout-btn").addEventListener("click", async () => {
  await supabaseClient.auth.signOut();
  showLogin();
});

checkSession();

// ---------- ניווט בין טאבים ----------
document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    document.querySelectorAll(".tab-panel").forEach(p => p.style.display = "none");
    document.getElementById("tab-" + btn.dataset.tab).style.display = "block";
  });
});

// ---------- הזמנות ----------
const ORDER_STATUSES = ["new", "confirmed", "shipped", "done", "cancelled"];
const ORDER_STATUS_LABELS = { new: "חדש", confirmed: "אושר", shipped: "נשלח", done: "הושלם", cancelled: "בוטל" };

async function loadOrders() {
  const el = document.getElementById("orders-table");
  const { data, error } = await supabaseClient.from("orders").select("*").order("created_at", { ascending: false });
  if (error) { el.innerHTML = `<div class="empty-state">שגיאה בטעינה: ${error.message}</div>`; return; }
  if (!data.length) { el.innerHTML = `<div class="empty-state">אין הזמנות עדיין.</div>`; return; }

  el.innerHTML = `<table class="data-table"><thead><tr>
    <th>תאריך</th><th>מוצר</th><th>שם</th><th>טלפון</th><th>אימייל</th><th>כתובת</th><th>הערות</th><th>סטטוס</th>
  </tr></thead><tbody>
    ${data.map(o => `
      <tr>
        <td>${formatDate(o.created_at)}</td>
        <td>${o.product_name}</td>
        <td>${o.buyer_name}</td>
        <td>${o.phone}</td>
        <td>${o.email || "-"}</td>
        <td>${o.address || "-"}</td>
        <td>${o.notes || "-"}</td>
        <td>
          <select data-id="${o.id}" class="order-status">
            ${ORDER_STATUSES.map(s => `<option value="${s}" ${s===o.status?"selected":""}>${ORDER_STATUS_LABELS[s]}</option>`).join("")}
          </select>
        </td>
      </tr>
    `).join("")}
  </tbody></table>`;

  el.querySelectorAll(".order-status").forEach(sel => {
    sel.addEventListener("change", async () => {
      await supabaseClient.from("orders").update({ status: sel.value }).eq("id", sel.dataset.id);
    });
  });
}

// ---------- פניות הופעות ----------
const EVENT_STATUSES = ["new", "contacted", "confirmed", "done", "cancelled"];
const EVENT_STATUS_LABELS = { new: "חדש", contacted: "יצרנו קשר", confirmed: "אושר", done: "הושלם", cancelled: "בוטל" };
const EVENT_TYPE_LABELS = { performance: "הופעה", birthday: "יום הולדת" };

async function loadEvents() {
  const el = document.getElementById("events-table");
  const { data, error } = await supabaseClient.from("event_requests").select("*").order("created_at", { ascending: false });
  if (error) { el.innerHTML = `<div class="empty-state">שגיאה בטעינה: ${error.message}</div>`; return; }
  if (!data.length) { el.innerHTML = `<div class="empty-state">אין פניות עדיין.</div>`; return; }

  el.innerHTML = `<table class="data-table"><thead><tr>
    <th>תאריך פנייה</th><th>סוג</th><th>שם</th><th>טלפון</th><th>עיר</th><th>תאריך מבוקש</th><th>פרטים</th><th>סטטוס</th>
  </tr></thead><tbody>
    ${data.map(r => `
      <tr>
        <td>${formatDate(r.created_at)}</td>
        <td>${EVENT_TYPE_LABELS[r.request_type] || r.request_type}</td>
        <td>${r.full_name}</td>
        <td>${r.phone}</td>
        <td>${r.city || "-"}</td>
        <td>${r.event_date || "-"}</td>
        <td>${r.details || "-"}</td>
        <td>
          <select data-id="${r.id}" class="event-status">
            ${EVENT_STATUSES.map(s => `<option value="${s}" ${s===r.status?"selected":""}>${EVENT_STATUS_LABELS[s]}</option>`).join("")}
          </select>
        </td>
      </tr>
    `).join("")}
  </tbody></table>`;

  el.querySelectorAll(".event-status").forEach(sel => {
    sel.addEventListener("change", async () => {
      await supabaseClient.from("event_requests").update({ status: sel.value }).eq("id", sel.dataset.id);
    });
  });
}

// ---------- הגרלות ונרשמים ----------
async function loadRaffles() {
  const el = document.getElementById("raffles-table");
  const { data: raffles, error } = await supabaseClient.from("raffles").select("*").order("created_at", { ascending: false });
  if (error) { el.innerHTML = `<div class="empty-state">שגיאה בטעינה: ${error.message}</div>`; return; }
  if (!raffles.length) { el.innerHTML = `<div class="empty-state">אין הגרלות עדיין.</div>`; return; }

  let html = "";
  for (const raffle of raffles) {
    const { data: entries } = await supabaseClient
      .from("raffle_entries").select("*").eq("raffle_id", raffle.id).order("created_at", { ascending: false });

    html += `<div class="card" style="margin-bottom:28px;"><div class="card-body">
      <h3>${raffle.title} ${raffle.active ? '<span class="status-pill">פעילה</span>' : '<span class="status-pill">סגורה</span>'}
        <button class="btn btn-secondary toggle-raffle-btn" data-id="${raffle.id}" data-active="${raffle.active}" style="padding:4px 12px; font-size:0.8rem; margin-right:10px;">
          ${raffle.active ? "סגור הגרלה" : "פתח הגרלה"}
        </button>
      </h3>
      <p>נרשמים: ${entries ? entries.length : 0}${raffle.winner_entry_id ? " · יש זוכה נבחר" : ""}</p>
      <table class="data-table"><thead><tr><th>תאריך</th><th>שם</th><th>טלפון</th><th>אימייל</th><th></th></tr></thead>
      <tbody>
        ${(entries || []).map(en => `
          <tr>
            <td>${formatDate(en.created_at)}</td>
            <td>${en.full_name} ${raffle.winner_entry_id === en.id ? "🏆" : ""}</td>
            <td>${en.phone}</td>
            <td>${en.email || "-"}</td>
            <td><button class="btn btn-secondary pick-winner-btn" data-raffle="${raffle.id}" data-entry="${en.id}" style="padding:6px 14px; font-size:0.85rem;">בחר/י כזוכה</button></td>
          </tr>
        `).join("") || `<tr><td colspan="5" class="empty-state">אין נרשמים עדיין.</td></tr>`}
      </tbody></table>
    </div></div>`;
  }
  el.innerHTML = html;

  el.querySelectorAll(".pick-winner-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      await supabaseClient.from("raffles").update({ winner_entry_id: btn.dataset.entry }).eq("id", btn.dataset.raffle);
      loadRaffles();
    });
  });

  el.querySelectorAll(".toggle-raffle-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const isActive = btn.dataset.active === "true";
      await supabaseClient.from("raffles").update({ active: !isActive }).eq("id", btn.dataset.id);
      loadRaffles();
    });
  });
}

// ---------- מוצרים (תצוגה בלבד) ----------
async function loadProductsAdmin() {
  const el = document.getElementById("products-table");
  const { data, error } = await supabaseClient.from("products").select("*").order("sort_order", { ascending: true });
  if (error) { el.innerHTML = `<div class="empty-state">שגיאה בטעינה: ${error.message}</div>`; return; }
  if (!data.length) { el.innerHTML = `<div class="empty-state">אין מוצרים עדיין.</div>`; return; }

  el.innerHTML = `<table class="data-table"><thead><tr>
    <th>תמונה</th><th>שם</th><th>מחיר</th><th>תיאור</th><th>slug</th>
  </tr></thead><tbody>
    ${data.map(p => `
      <tr>
        <td><img src="${p.image_url || ''}" alt="${p.name}" style="width:48px; height:48px; object-fit:cover; border-radius:8px; border:1px solid var(--line);"></td>
        <td>${p.name}</td>
        <td>₪${p.price}</td>
        <td style="max-width:280px;">${p.description}</td>
        <td>${p.slug}</td>
      </tr>
    `).join("")}
  </tbody></table>`;
}
