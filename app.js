/* ========================================
   GROVOLUT — Interactive Application Logic
   Autonomous Creative Production Engine
   ======================================== */

// ── State ──
const state = {
  mode: 'simulated',     // 'simulated' | 'genius'
  geniusAI: 'grok',      // 'grok' | 'gemini' | 'claude' | 'chatgpt' (only used when mode === 'genius')
  activeTab: 'home',
  currentLocale: 'ES',
  generatedAsset: null,
  wipMode: false,
  assemblyRunning: false,
  iterationCount: 1,
  agentLogs: [],
};

// ── Provider / Mode Selector (new UX: Mode first, then AI when Genius) ──
const modeSelect = document.getElementById('modeSelect');
const geniusAISelect = document.getElementById('geniusAISelect');
const geniusAIWrapper = document.getElementById('geniusAIWrapper');
const providerBadge = document.getElementById('providerBadge');
const geniusStatus = document.getElementById('geniusStatus');

// Helper: current effective AI
function getEffectiveAI() {
  return state.mode === 'genius' ? state.geniusAI : 'simulated';
}

// Helper: is in Genius mode (rich prompts + custom previews)
function isGeniusMode() {
  return state.mode === 'genius';
}

function updateModeUI() {
  const isGenius = isGeniusMode();
  const ai = getEffectiveAI();

  // Show/hide AI sub selector
  if (geniusAIWrapper) {
    geniusAIWrapper.style.display = isGenius ? 'flex' : 'none';
  }

  // Main badge
  let badgeText = '🧪 Simulated Mode';
  let badgeClass = 'badge-lime';
  if (isGenius) {
    const aiLabel = {
      grok: 'Grok xAI',
      gemini: 'Gemini',
      claude: 'Claude',
      chatgpt: 'ChatGPT'
    }[ai] || 'Grok xAI';
    // No API box here anymore — keys live in Integration Hub
    badgeText = `✦ Genius • ${aiLabel} (Connected)`;
    badgeClass = (ai === 'gemini') ? 'badge-blue' : 'badge-lime';
  }
  if (providerBadge) {
    providerBadge.textContent = badgeText;
    providerBadge.className = 'badge ' + badgeClass;
  }

  // GENIUS indicator
  if (geniusStatus) {
    geniusStatus.style.display = isGenius ? 'inline' : 'none';
  }

  // No more API input in main UI — "Connected" status only
  // (API keys/secrets managed exclusively in Integration Hub)

  // Live update Home tab status (if present) — slim elegant bar
  const homeMode = document.getElementById('home-mode-badge');
  const homeAI = document.getElementById('home-ai-badge');
  if (homeMode) {
    homeMode.textContent = isGenius ? '✦ GENIUS' : '🧪 SIMULATED';
    homeMode.style.color = isGenius ? '#b8f03e' : '#a8b1c0';
  }
  if (homeAI) {
    if (!isGenius) {
      homeAI.textContent = '— MOCK';
      homeAI.style.color = '#555';
    } else {
      const aiName = {
        grok: 'GROK xAI',
        gemini: 'GEMINI',
        claude: 'CLAUDE',
        chatgpt: 'CHATGPT'
      }[ai] || 'GROK xAI';
      homeAI.textContent = aiName;
      homeAI.style.color = (ai === 'gemini') ? '#67e8f9' : '#b8f03e';
    }
  }
}

// Mode select listener
if (modeSelect) {
  modeSelect.addEventListener('change', function () {
    state.mode = this.value;
    if (state.mode === 'genius' && !state.geniusAI) state.geniusAI = 'grok';

    // sync sub-select value if needed
    if (geniusAISelect && state.mode === 'genius') {
      geniusAISelect.value = state.geniusAI;
    }

    updateModeUI();
    showToast(state.mode === 'genius' ? '✦ Genius mode enabled' : '🧪 Switched to Simulated', 'info');
  });
}

// Genius AI sub-select listener
if (geniusAISelect) {
  geniusAISelect.addEventListener('change', function () {
    if (state.mode === 'genius') {
      state.geniusAI = this.value;
      updateModeUI();
      showToast(`Genius now using ${this.value === 'grok' ? 'Grok xAI' : this.value}`, 'info');
    }
  });
}

// Initialize UI on load
function initModeUI() {
  // default to simulated
  if (modeSelect) modeSelect.value = state.mode;
  if (geniusAISelect) geniusAISelect.value = state.geniusAI;
  updateModeUI();
}
setTimeout(initModeUI, 50);

// ── Target Market Change — auto-update brief ──
const marketSelect = document.getElementById('targetMarket');
const marketLabels = {
  UK: 'the United Kingdom',
  US: 'the United States',
  ES: 'Spain',
  MX: 'Mexico',
  FR: 'France',
  DE: 'Germany',
  PT_PT: 'Portugal',
  PT_BR: 'Brazil',
  BG: 'Bulgaria',
  HR: 'Croatia',
  CS: 'Czech Republic',
  DA: 'Denmark',
  NL: 'the Netherlands',
  EL: 'Greece',
  HU: 'Hungary',
  IT: 'Italy',
  JA: 'Japan',
  LV: 'Latvia',
  LT: 'Lithuania',
  NO: 'Norway',
  PL: 'Poland',
  RO: 'Romania',
  RU: 'Russia',
  SK: 'Slovakia',
  SV: 'Sweden',
  UA: 'Ukraine'
};
marketSelect.addEventListener('change', function () {
  const market = this.value;
  const country = marketLabels[market] || market;
  document.getElementById('assetPrompt').value =
    `Create a Revolut Premium card upgrade ad targeting millennials in ${country}. Emphasize: cashback rewards, fee-free international transfers, and premium metal card design. Tone: confident, modern, aspirational.`;
  showToast(`🌍 Target market changed to ${country}`, 'info');
});

// ── Asset Format Change — no auto-generate; only on button press ──
const formatSelect = document.getElementById('assetFormat');
// Format change now only affects the next manual generate; no auto-regen here.

// ── Test Connection ──
function testConnection() {
  // Test button removed from main UI. Kept for backward compat (no-op now).
  showToast('API testing now handled in Integration Hub.', 'info');
}

// ── AI Provider Keys (now only in Integration Hub) ──
const AI_KEY_PREFIX = 'ai_key_';

function getAIKey(provider) {
  return localStorage.getItem(AI_KEY_PREFIX + provider) || '';
}

function saveAIKey(provider) {
  const input = document.getElementById('aiKey' + (provider.charAt(0).toUpperCase() + provider.slice(1)));
  if (!input) return;
  const value = input.value.trim();
  if (!value) {
    showToast('Please enter a key', 'warning');
    return;
  }
  localStorage.setItem(AI_KEY_PREFIX + provider, value);
  updateAIKeyStatus(provider);
  showToast(`${provider.toUpperCase()} API key saved.`, 'success');
  // If currently using this provider in Genius, update main UI badge
  if (state.mode === 'genius' && state.geniusAI === provider) {
    updateModeUI();
  }
}

function updateAIKeyStatus(provider) {
  const statusEl = document.getElementById('aiStatus' + (provider.charAt(0).toUpperCase() + provider.slice(1)));
  if (!statusEl) return;
  const hasKey = !!getAIKey(provider);
  statusEl.textContent = hasKey ? 'Connected' : 'Disconnected';
  statusEl.style.color = hasKey ? '#22c55e' : '#888';
}

function loadAIKeysToHub() {
  const providers = ['grok', 'gemini', 'claude', 'chatgpt'];
  providers.forEach(p => {
    const input = document.getElementById('aiKey' + (p.charAt(0).toUpperCase() + p.slice(1)));
    if (input) {
      input.value = getAIKey(p);
    }
    updateAIKeyStatus(p);
  });
}

// Hook into DOM ready for loading keys when Integration Hub might be shown
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    if (document.getElementById('aiKeyGrok')) {
      loadAIKeysToHub();
    }
  }, 300);
});

// ── Tab Navigation ──
function attachTabListeners() {
  document.querySelectorAll('.tab-btn').forEach((btn) => {
    // Prevent duplicate listeners
    btn.onclick = null;
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });
}

// Attach immediately (script is at end of body, DOM ready)
attachTabListeners();

function switchTab(tabId) {
  try {
    state.activeTab = tabId;

    document.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach((c) => c.classList.remove('active'));

    const tabBtn = document.querySelector(`[data-tab="${tabId}"]`);
    const tabContent = document.getElementById(`content-${tabId}`);
    if (tabBtn) tabBtn.classList.add('active');
    if (tabContent) tabContent.classList.add('active');

    // Reinitialise charts when dashboard is shown
    if (tabId === 'dashboard') {
      initCharts();
    }

    // Keep home status and mode UI in sync when switching tabs
    if (typeof updateModeUI === 'function') {
      updateModeUI();
    }

    // Auto Hub
    if (tabId === 'auto-hub' && typeof renderAutoHub === 'function') {
      renderAutoHub();
    }
  } catch (e) {
    console.error('switchTab error for', tabId, e);
    // Fallback: try to at least show the requested content
    const fallback = document.getElementById(`content-${tabId}`);
    if (fallback) {
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      fallback.classList.add('active');
    }
  }
}

// ── Toast System ──
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
  toast.innerHTML = `<span>${icons[type] || ''}</span><span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('toast-exit');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ═══════════════════════════════════════════
// TAB 1: ASSET GENERATOR + LOCALISER
// ═══════════════════════════════════════════

const localisedContent = {
  UK: {
    headline: 'Upgrade Your Financial Power',
    body: 'Premium metal card • Unlimited fee-free transfers • Exclusive cashback on every purchase.',
    cta: 'Upgrade Now →',
    disclaimer: 'Capital at risk. Revolut Ltd is authorised by the FCA.',
  },
  US: {
    headline: 'Upgrade Your Financial Power',
    body: 'Premium metal card • Unlimited fee-free transfers • Exclusive cashback on every purchase.',
    cta: 'Upgrade Now →',
    disclaimer: 'Capital at risk. Subject to Revolut US terms and FDIC insurance rules.',
  },
  EN: {
    headline: 'Upgrade Your Financial Power',
    body: 'Premium metal card • Unlimited fee-free transfers • Exclusive cashback on every purchase.',
    cta: 'Upgrade Now →',
    disclaimer: 'Capital at risk. Revolut Ltd is authorised by the FCA.',
  },
  ES: {
    headline: 'Mejora Tu Poder Financiero',
    body: 'Tarjeta metálica premium • Transferencias ilimitadas sin comisiones • Cashback exclusivo en todas tus compras.',
    cta: 'Actualízate Ahora →',
    disclaimer: 'Capital en riesgo. Revolut Ltd está autorizada por el Banco de España.',
  },
  MX: {
    headline: 'Eleva Tu Poder Financiero',
    body: 'Tarjeta metálica premium • Transferencias ilimitadas sin comisiones • Cashback exclusivo en tus compras.',
    cta: 'Cámbiate a Premium →',
    disclaimer: 'Capital en riesgo. Sujeto a términos y regulaciones de la CNBV en México.',
  },
  FR: {
    headline: 'Boostez Votre Puissance Financière',
    body: 'Carte métal premium • Transferts illimités sans frais • Cashback exclusif sur tous vos achats.',
    cta: 'Passez au Premium →',
    disclaimer: 'Capital à risque. Revolut Ltd est autorisée par l\'ACPR.',
  },
  DE: {
    headline: 'Verbessern Sie Ihre Finanzkraft',
    body: 'Premium-Metallkarte • Unbegrenzte gebührenfreie Überweisungen • Exklusives Cashback bei jedem Einkauf.',
    cta: 'Jetzt Upgraden →',
    disclaimer: 'Kapital ist gefährdet. Revolut Ltd ist von der BaFin zugelassen.',
  },
  PT_PT: {
    headline: 'Aumente o Seu Poder Financeiro',
    body: 'Cartão metálico premium • Transferências ilimitadas sem taxas • Cashback exclusivo em todas as compras.',
    cta: 'Atualize Agora →',
    disclaimer: 'Capital em risco. Revolut Ltd é autorizada pelo Banco de Portugal.',
  },
  PT_BR: {
    headline: 'Eleve Seu Poder Financeiro',
    body: 'Cartão de metal premium • Transferências internacionais ilimitadas sem taxas • Cashback exclusivo em todas as compras.',
    cta: 'Obtenha o Premium Já →',
    disclaimer: 'Capital em risco. Sujeito aos termos e condições do Revolut Brasil.',
  },
  PT: {
    // Backward compatibility
    headline: 'Aumente o Seu Poder Financeiro',
    body: 'Cartão metálico premium • Transferências ilimitadas sem taxas • Cashback exclusivo em todas as compras.',
    cta: 'Atualize Agora →',
    disclaimer: 'Capital em risco. Revolut Ltd é autorizada pelo Banco de Portugal.',
  },
  BG: {
    headline: 'Подобрете финансовата си сила',
    body: 'Премиум метална карта • Неограничени безплатни трансфери • Ексклузивен кешбек при всяка покупка.',
    cta: 'Надградете сега →',
    disclaimer: 'Капиталът е изложен на риск. Револют е лицензиран от БНБ и КФН.',
  },
  HR: {
    headline: 'Povećajte svoju financijsku moć',
    body: 'Premium metalna kartica • Neograničeni besplatni prijenosi • Ekskluzivni povrat novca pri svakoj kupnji.',
    cta: 'Nadogradite sada →',
    disclaimer: 'Kapital je pod rizikom. Revolut je reguliran od strane HNB-a.',
  },
  CS: {
    headline: 'Zvyšte svou finanční sílu',
    body: 'Prémiová kovová karta • Neomezené převody bez poplatků • Exkluzivní cashback z každého nákupu.',
    cta: 'Přejít na Premium →',
    disclaimer: 'Váš kapitál je v riziku. Revolut je licencován Českou národní bankou.',
  },
  DA: {
    headline: 'Styrk din økonomiske magt',
    body: 'Premium metalkort • Ubegrænsede gebyrfrie overførsler • Eksklusiv cashback på alle køb.',
    cta: 'Opgrader nu →',
    disclaimer: 'Kapital på spil. Revolut Ltd er godkendt af det britiske finanstilsyn FCA.',
  },
  NL: {
    headline: 'Verhoog je financiële kracht',
    body: 'Premium metalen kaart • Onbeperkte gratis overschrijvingen • Exclusieve cashback op elke aankoop.',
    cta: 'Nu Upgraden →',
    disclaimer: 'Je kapitaal loopt risico. Revolut is onder toezicht van de AFM en DNB.',
  },
  EL: {
    headline: 'Αναβαθμίστε την οικονομική σας ισχύ',
    body: 'Premium μεταλλική κάρτα • Απεριόριστες δωρεάν μεταφορές • Αποκλειστικό cashback σε κάθε αγορά.',
    cta: 'Αναβάθμιση τώρα →',
    disclaimer: 'Το κεφάλαιο είναι σε κίνδυνο. Η Revolut ελέγχεται από την Τράπεζα της Ελλάδος.',
  },
  HU: {
    headline: 'Növelje pénzügyi erejét',
    body: 'Prémium fémkártya • Korlátlan díjmentes utalások • Exkluzív pénzvisszafizetés minden vásárlás után.',
    cta: 'Frissítsen most →',
    disclaimer: 'A tőkéje kockázatnak van kitéve. A Revolutot az MNB szabályozza.',
  },
  IT: {
    headline: 'Potenzia Il Tuo Potere Finanziario',
    body: 'Carta di metallo premium • Trasferimenti gratuiti illimitati • Cashback esclusivo su ogni acquisto.',
    cta: 'Passa a Premium →',
    disclaimer: 'Capitale a rischio. Revolut Ltd è autorizzata dalla Banca d\'Italia.',
  },
  JA: {
    headline: '金融の力を引き出す',
    body: 'プレミアムメタルカード • 手数料無料の海外送金が使い放題 • すべてのお買い物で限定キャッシュバック。',
    cta: '今すぐアップグレード →',
    disclaimer: '資金はリスクにさらされます。Revolut Technologies Japan株式会社は関東財務局に登録されています。',
  },
  LV: {
    headline: 'Uzlabojiet savu finansiālo jaudu',
    body: 'Premium metāla karte • Neierobežoti bezmaksas pārskaitījumi • Ekskluzīva naudas atmaksa par katru pirkumu.',
    cta: 'Uzlabot tagad →',
    disclaimer: 'Kapitāls ir pakļauts riskam. Revolut ir licencējusi Latvijas Banka.',
  },
  LT: {
    headline: 'Padidinkite savo finansinę galią',
    body: 'Premium metalinė kortelė • Neriboti nemokami pervedimai • Išskirtinis pinigų grąžinimas už kiekvieną pirkinį.',
    cta: 'Užsisakyti dabar →',
    disclaimer: 'Kyla rizika kapitalui. Revolut yra licencijuotas Lietuvos banko.',
  },
  NO: {
    headline: 'Oppgrader din økonomiske kraft',
    body: 'Premium metallkort • Ubegrensede gebyrfrie overføringer • Eksklusiv cashback på alle kjøp.',
    cta: 'Oppgrader nå →',
    disclaimer: 'Kapital er utsatt for risiko. Revolut Ltd er autorisert av Finanstilsynet.',
  },
  PL: {
    headline: 'Zwiększ swoją moc finansową',
    body: 'Karta metalowa Premium • Nielimitowane bezpłatne przelewy • Ekskluzywny cashback za każdy zakup.',
    cta: 'Przejdź na Premium →',
    disclaimer: 'Twój kapitał jest narażony na ryzyko. Revolut jest licencjonowany przez KNF.',
  },
  RO: {
    headline: 'Îmbunătățește-ți puterea financiară',
    body: 'Card metalic premium • Transferuri nelimitate fără comision • Cashback exclusiv la fiecare achiziție.',
    cta: 'Treci la Premium →',
    disclaimer: 'Capitalul este expus riscului. Revolut este autorizată de BNR.',
  },
  RU: {
    headline: 'Увеличьте свои финансовые возможности',
    body: 'Премиальная металлическая карта • Безлимитные переводы без комиссий • Эксклюзивный кэшбэк с каждой покупки.',
    cta: 'Перейти на Premium →',
    disclaimer: 'Ваш капитал подвергается риску. Условия обслуживания Revolut Ltd.',
  },
  SK: {
    headline: 'Zvýšte svoju finančnú silu',
    body: 'Prémiová kovová karta • Neobmedzené prevody bez poplatků • Exkluzívny cashback z každého nákupu.',
    cta: 'Prejsť na Premium →',
    disclaimer: 'Váš kapitál je v riziku. Revolut podlieha dohľadu Národnej banky Slovenska.',
  },
  SV: {
    headline: 'Maximera din finansiella kraft',
    body: 'Premium metalkort • Obegränsade avgiftsfria överföringar • Exklusiv cashback på alla köp.',
    cta: 'Uppgradera nu →',
    disclaimer: 'Risk för kapitalförlust. Revolut övervakas av Finansinspektionen.',
  },
  UA: {
    headline: 'Збільште свої фінансові можливості',
    body: 'Преміальна металева картка • Безлімітні перекази без комісій • Ексклюзивний кешбек за кожну покупку.',
    cta: 'Оновити зараз →',
    disclaimer: 'Ваш капітал під загрозою. Послуги надаються Revolut Ltd відповідно до ліцензії.',
  },
  LATAM: {
    // Backward compatibility
    headline: 'Mejora Tu Poder Financiero',
    body: 'Tarjeta metálica premium • Transferencias internacionales sin comisiones • Cashback en cada compra.',
    cta: 'Mejora Ahora →',
    disclaimer: 'Sujeto a términos y condiciones. Consulta tarifas locales.',
  },
};

// Short body versions for asset preview (translated short style for consistency with Creator Tool)
const shortBody = {
  UK: 'Metal card • Unlimited transfers • Premium cashback',
  US: 'Metal card • Unlimited transfers • Premium cashback',
  EN: 'Metal card • Unlimited transfers • Premium cashback',
  ES: 'Tarjeta metálica premium • Transferencias ilimitadas sin comisiones • Cashback exclusivo en todas tus compras.',
  MX: 'Tarjeta metálica premium • Transferencias ilimitadas sin comisiones • Cashback exclusivo en tus compras.',
  FR: 'Carte métal premium • Transferts illimités sans frais • Cashback exclusif sur tous vos achats.',
  DE: 'Premium-Metallkarte • Unbegrenzte gebührenfreie Überweisungen • Exklusives Cashback bei jedem Einkauf.',
  PT_PT: 'Cartão metálico premium • Transferências ilimitadas sem taxas • Cashback exclusivo em todas as compras.',
  PT_BR: 'Cartão de metal premium • Transferências internacionais ilimitadas sem taxas • Cashback exclusivo em todas as compras.',
  PT: 'Cartão metálico premium • Transferências ilimitadas sem taxas • Cashback exclusivo em todas as compras.',
  BG: 'Премиум метална карта • Неограничени безплатни трансфери • Ексклузивен кешбек при всяка покупка.',
  HR: 'Premium metalna kartica • Neograničeni besplatni prijenosi • Ekskluzivni povrat novca pri svakoj kupnji.',
  CS: 'Prémiová kovová karta • Neomezené převody bez poplatků • Exkluzivní cashback z každého nákupu.',
  DA: 'Premium metalkort • Ubegrænsede gebyrfrie overførsler • Eksklusiv cashback på alle køb.',
  NL: 'Premium metalen kaart • Onbeperkte gratis overschrijvingen • Exclusieve cashback op elke aankoop.',
  EL: 'Premium μεταλλική κάρτα • Απεριόριστες δωρεάν μεταφορές • Αποκλειστικό cashback σε κάθε αγορά.',
  HU: 'Prémium fémkártya • Korlátlan díjmentes utalások • Exkluzív pénzvisszafizetés minden vásárlás után.',
  IT: 'Carta di metallo premium • Trasferimenti gratuiti illimitati • Cashback esclusivo su ogni acquisto.',
  JA: 'プレミアムメタルカード • 手数料無料の海外送金が使い放題 • すべてのお買い物で限定キャッシュバック。',
  LV: 'Premium metāla karte • Neierobežoti bezmaksas pārskaitījumi • Ekskluzīva naudas atmaksa par katru pirkumu.',
  LT: 'Premium metalinė kortelė • Neriboti nemokami pervedimai • Išskirtinis pinigų grąžinimas už kiekvieną pirkinį.',
  NO: 'Premium metallkort • Ubegrensede gebyrfrie overføringer • Eksklusiv cashback på alle kjøp.',
  PL: 'Karta metalowa Premium • Nielimitowane bezpłatne przelewy • Ekskluzywny cashback za każdy zakup.',
  RO: 'Card metalic premium • Transferuri nelimitate fără comision • Cashback exclusiv la fiecare achiziție.',
  RU: 'Премиальная металлическая карта • Безлимитные переводы без комиссий • Эксклюзивный кэшбэк с каждой покупки.',
  SK: 'Prémiová kovová karta • Neobmedzené prevody bez poplatků • Exkluzívny cashback z každého nákupu.',
  SV: 'Premium metalkort • Obegränsade avgiftsfria överföringar • Exklusiv cashback på alla köp.',
  UA: 'Преміальна металева картка • Безлімітні перекази без комісій • Ексклюзивний кешбек за кожну покупку.',
  LATAM: 'Tarjeta metálica premium • Transferencias internacionales sin comisiones • Cashback en cada compra.',
};

function generateAsset() {
  const btn = document.getElementById('generateBtn');
  const output = document.getElementById('assetOutput');
  const prompt = document.getElementById('assetPrompt').value;
  const format = document.getElementById('assetFormat').value;
  const market = document.getElementById('targetMarket').value;
  const logoFile = document.getElementById('productLogo').value;

  console.log('[Grovolut] Generating asset — market:', market, '| logo:', logoFile, '| format:', format);

  if (!prompt.trim()) {
    showToast('Please enter a creative brief first.', 'warning');
    return;
  }

  btn.classList.add('loading');
  btn.disabled = true;
  output.classList.add('generating');
  output.innerHTML = `
    <div class="output-placeholder">
      <div class="ph-icon" style="animation: spin 1s linear infinite;">⚙️</div>
      <div>Generating with <strong>${getEffectiveAI() === 'simulated' ? 'Simulated Engine' : getEffectiveAI() === 'gemini' ? 'Gemini' : getEffectiveAI() === 'claude' ? 'Claude' : getEffectiveAI() === 'chatgpt' ? 'ChatGPT' : 'Grok xAI'}</strong>...</div>
      <div class="text-xs text-muted mt-sm">Processing creative brief for ${market} market</div>
    </div>
  `;

  const delay = (getEffectiveAI() === 'gemini') ? 2000 : 1500;

  setTimeout(() => {
    btn.classList.remove('loading');
    btn.disabled = false;
    output.classList.remove('generating');

    const locale = localisedContent[market] || localisedContent['EN'];
    const providerNote = `<div class="badge badge-green" style="margin-bottom:12px;">GENERATION COMPLETE</div>`;

    let sizeStyles = getSizeStyles(format);
    let contentHTML = '';

    let displayHeadline = locale.headline;
    let displayBody = shortBody[market] || locale.body;
    let displayCta = locale.cta;
    let displayDisclaimer = locale.disclaimer;

    // Helper for consistent logo rendering
    const isBigLogo = logoFile.includes('wordmark') || logoFile.includes('business');
    let logoMaxHeight;
    if (isBigLogo) {
      if (format === 'banner') logoMaxHeight = '42px';
      else if (format === 'email') logoMaxHeight = '38px';
      else if (format === 'video') logoMaxHeight = '26px';
      else logoMaxHeight = '50px';
    } else {
      if (format === 'banner') logoMaxHeight = '26px';
      else if (format === 'email') logoMaxHeight = '24px';
      else if (format === 'video') logoMaxHeight = '18px';
      else logoMaxHeight = '38px';
    }
    const logoStyle = `height:auto; max-height: ${logoMaxHeight}; width:auto; object-fit:contain; flex-shrink:0;`;

    if (format === 'story') {
      // Story is already excellent — keep close to original but add safety
      contentHTML = `
        <div style="display:flex; flex-direction:column; flex:1; min-height:0;">
          <div>
            <img src="${logoFile}?v=${Date.now()}" style="${logoStyle} margin-bottom:20px;" alt="Revolut Logo" onerror="this.style.display='none'" />
            <div style="font-size:0.7rem;text-transform:uppercase;letter-spacing:0.2em;color:var(--accent-lime);margin-bottom:10px;font-weight:700;opacity:0.9;">Revolut Premium</div>
            <div style="font-size:1.45rem;font-weight:800;margin-bottom:14px;line-height:1.15;color:#fff;">${displayHeadline}</div>
            <div style="font-size:0.92rem;color:var(--text-tertiary);line-height:1.4;">${displayBody}</div>
          </div>
          <div>
            <div style="display:block;text-align:center;background:var(--accent-lime);color:#0a1018;padding:13px 26px;border-radius:9999px;font-weight:700;font-size:0.9rem;margin:18px 0 10px;">${displayCta}</div>
            <div style="font-size:0.58rem;color:var(--text-muted);padding-top:8px;border-top:1px solid rgba(255,255,255,0.1);line-height:1.3;">${displayDisclaimer}</div>
          </div>
        </div>
      `;
    } else if (format === 'banner') {
      // Horizontal banner — extremely constrained height
      contentHTML = `
        <div style="display:flex; align-items:center; gap:10px; flex:1; min-width:0; overflow:hidden;">
          <img src="${logoFile}?v=${Date.now()}" style="${logoStyle}" alt="Logo" onerror="this.style.display='none'" />
          <div style="flex:1; min-width:0; overflow:hidden;">
            <div style="font-size:13px; font-weight:800; color:#fff; line-height:1.05; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${displayHeadline}</div>
            <div style="font-size:10px; color:#a8b1c0; margin-top:1px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; line-height:1.1;">${displayBody}</div>
          </div>
        </div>
        <div style="display:flex; flex-direction:column; align-items:flex-end; flex-shrink:0; gap:1px;">
          <div style="background:var(--accent-lime); color:#0a1018; padding:3px 12px; border-radius:9999px; font-weight:700; font-size:10px; white-space:nowrap; line-height:1;">${displayCta}</div>
          <div style="font-size:7.5px; color:#5a6578; white-space:nowrap; text-align:right; line-height:1;">${displayDisclaimer}</div>
        </div>
      `;
    } else if (format === 'email') {
      // Email header — balanced vertical
      contentHTML = `
        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:12px;">
          <div style="flex:1; min-width:0;">
            <div style="font-size:10px; text-transform:uppercase; letter-spacing:1.5px; color:var(--accent-lime); font-weight:700; margin-bottom:2px;">Revolut Premium</div>
            <div style="font-size:17px; font-weight:800; color:#fff; line-height:1.15;">${displayHeadline}</div>
          </div>
          <img src="${logoFile}?v=${Date.now()}" style="${logoStyle}" alt="Logo" onerror="this.style.display='none'" />
        </div>
        <div style="font-size:12px; color:#b8c0d0; line-height:1.35; margin:4px 0 6px;">${displayBody}</div>
        <div style="display:flex; align-items:center; justify-content:space-between; border-top:1px solid rgba(255,255,255,0.1); padding-top:8px;">
          <div style="font-size:8.5px; color:#5a6578; max-width:58%; line-height:1.2;">${displayDisclaimer}</div>
          <div style="background:var(--accent-lime); color:#0a1018; padding:5px 13px; border-radius:9999px; font-size:10px; font-weight:700; white-space:nowrap;">${displayCta}</div>
        </div>
      `;
    } else if (format === 'video') {
      contentHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:4px;">
          <div style="font-size:11px; color:var(--accent-lime); font-weight:700; letter-spacing:0.5px;">VIDEO SCRIPT • 15s</div>
          <img src="${logoFile}?v=${Date.now()}" style="${logoStyle}" alt="Logo" onerror="this.style.display='none'" />
        </div>
        <div style="flex:1; display:flex; align-items:center; padding:6px 0;">
          <div style="font-size:13px; color:#c5d0e0; line-height:1.4;">
            <span style="color:#67e8f9; font-weight:600;">[Visual]</span> Premium metal card catching dramatic light.<br>
            <span style="color:#5eead4; font-weight:600;">[VO]</span> ${displayHeadline}. ${displayBody}
          </div>
        </div>
        <div style="font-size:9px; color:#6b778a; display:flex; justify-content:space-between; align-items:center;">
          <span>${displayDisclaimer}</span>
          <span style="color:var(--accent-lime); font-weight:600;">${displayCta}</span>
        </div>
      `;
    } else {
      // === SOCIAL (square) — now properly laid out like a good ad ===
      contentHTML = `
        <div style="display:flex; flex-direction:column; flex:1; justify-content:space-between;">
          <div>
            <img src="${logoFile}?v=${Date.now()}" style="${logoStyle} margin-bottom:14px;" alt="Revolut Logo" onerror="this.style.display='none'" />
            <div style="font-size:11px; text-transform:uppercase; letter-spacing:1.8px; color:var(--accent-lime); font-weight:700; margin-bottom:6px; opacity:0.95;">REVOLUT PREMIUM</div>
            <div style="font-size:22px; font-weight:800; line-height:1.1; color:#fff; margin-bottom:10px;">${displayHeadline}</div>
            <div style="font-size:13.5px; color:#a8b5c9; line-height:1.35;">${displayBody}</div>
          </div>
          <div>
            <div style="display:inline-flex; align-items:center; background:var(--accent-lime); color:#0a1018; padding:9px 22px; border-radius:9999px; font-weight:700; font-size:13px; margin-top:6px; margin-bottom:8px;">${displayCta}</div>
            <div style="font-size:9px; color:#5a6578; line-height:1.25; padding-top:8px; border-top:1px solid rgba(255,255,255,0.08);">${displayDisclaimer}</div>
          </div>
        </div>
      `;
    }

    output.innerHTML = `
      ${providerNote}
      <div class="creative-preview" data-format="${format}" style="background:linear-gradient(135deg, #0d0d1a 0%, #1a1a2e 50%, #16213e 100%);border-radius:16px;border:1px solid var(--border-hover);position:relative;overflow:hidden;margin:0 auto; box-shadow: 0 10px 30px rgba(0,0,0,0.3); ${sizeStyles}">
        <div style="position:absolute;top:-40px;right:-40px;width:200px;height:200px;background:radial-gradient(circle,rgba(184,240,62,0.07),transparent);border-radius:50%;pointer-events:none;"></div>
        ${contentHTML}
      </div>
      <div class="flex items-center justify-between mt-md">
        <div class="flex gap-sm">
          <span class="badge badge-green">✓ Brand Compliant</span>
          <span class="badge badge-lime">${format.toUpperCase()}</span>
          <span class="badge badge-cyan">${market}</span>
        </div>
        <div class="text-xs font-mono text-muted">ID: GRV-${Date.now().toString(36).toUpperCase()}</div>
      </div>
      <div class="flex gap-xs mt-sm" style="justify-content:flex-end;">
        <button class="btn btn-xs btn-outline" onclick="addCurrentGenerationToGallery()">💡 Add to Inspiration Gallery</button>
      </div>
    `;

    // Store last generated data for fast high-quality export (always uses clean standard preview text)
    window.lastCreative = {
      headline: displayHeadline,
      body: displayBody,
      cta: displayCta,
      disclaimer: displayDisclaimer,
      logo: logoFile,
      format: format
    };

    // GENIUS real AI section
    const isGeniusReal = isGeniusMode();
    if (isGeniusReal) {
      const assetBriefForPrompt = prompt || document.getElementById('assetPrompt').value;
      const geniusPrompt = buildGeniusImagePrompt(assetBriefForPrompt, format, market, locale);
      const geniusDiv = document.createElement('div');
      geniusDiv.style.cssText = 'margin-top:10px; padding:8px 10px; background:#0a0f1a; border:1px solid #334; border-radius:6px; font-size:0.72rem;';
      geniusDiv.innerHTML = `
        <div style="color:#b8f03e; font-weight:700; font-size:0.65rem;">GENIUS — Real API Prompt</div>
        <textarea style="width:100%; margin:6px 0; background:#111; color:#ddd; font-size:0.7rem; border:1px solid #444;" rows="3">${geniusPrompt}</textarea>
        <button onclick="navigator.clipboard.writeText(this.parentNode.querySelector('textarea').value); showToast('Copied for real API', 'success')" class="btn btn-sm btn-outline" style="font-size:0.65rem; padding:2px 8px;">📋 Copy for real API</button>
        <div style="font-size:0.6rem; color:#666; margin-top:4px;">When connected to a real API, this prompt would generate the actual image via real API.</div>
      `;
      output.appendChild(geniusDiv);
    }

    // Enable iterate
    document.getElementById('iterateBtn').disabled = false;
    state.generatedAsset = true;

    // Also set current locale to match the market
    state.currentLocale = market;
    // Update active locale button
    document.querySelectorAll('.locale-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.locale === market);
    });

    // Show compliance
    showComplianceScore(96);

    // Show variants
    showVariants(market);

    // Update localised copy
    updateLocalisedCopy();

    showToast(`🎨 Asset generated successfully for ${market} market!`, 'success');
  }, delay);
}

function iterateAsset() {
  const btn = document.getElementById('iterateBtn');
  btn.classList.add('loading');
  btn.disabled = true;

  state.iterationCount++;

  setTimeout(() => {
    btn.classList.remove('loading');
    btn.disabled = false;
    showToast(`🔄 Iteration ${state.iterationCount} applied — refined copy tone and visual contrast`, 'success');

    // Bump compliance
    const newScore = Math.min(99, 94 + state.iterationCount);
    showComplianceScore(newScore);
  }, 1200);
}

function showComplianceScore(score) {
  const section = document.getElementById('complianceSection');
  const ring = document.getElementById('complianceRing');
  const scoreEl = document.getElementById('complianceScore');
  const badge = document.getElementById('complianceBadge');

  section.style.display = 'flex';
  badge.style.display = 'inline-flex';
  scoreEl.textContent = score + '%';

  const circumference = 2 * Math.PI * 34;
  const offset = circumference * (1 - score / 100);
  ring.style.strokeDashoffset = offset;

  if (score >= 95) {
    ring.className.baseVal = 'ring-fill';
    badge.textContent = '✓ Compliant';
    badge.className = 'badge badge-green';
  } else if (score >= 80) {
    ring.className.baseVal = 'ring-fill warning';
    badge.textContent = '⚠ Review';
    badge.className = 'badge badge-orange';
  } else {
    ring.className.baseVal = 'ring-fill danger';
    badge.textContent = '✗ Non-Compliant';
    badge.className = 'badge badge-red';
  }
}

function showVariants(market) {
  const card = document.getElementById('variantsCard');
  const grid = document.getElementById('variantsGrid');
  card.style.display = 'block';

  const formats = ['Social', 'Story', 'Banner'];
  grid.innerHTML = formats
    .map(
      (f) => `
    <div class="asset-preview-card">
      <div class="asset-preview-header" style="min-height:80px;font-size:0.9rem;background:linear-gradient(135deg, rgba(184,240,62,0.1), rgba(77,141,247,0.1));">
        ${f} — ${market}
      </div>
      <div class="asset-preview-body">
        <div class="text-sm font-bold">${f} Format</div>
        <div class="asset-preview-meta">
          <span class="badge badge-green badge-sm">✓ Compliant</span>
          <span class="badge badge-lime badge-sm">${market}</span>
        </div>
      </div>
    </div>
  `
    )
    .join('');
}

function getSizeStyles(format) {
  switch (format) {
    case 'story':
      return 'width:360px;height:640px;max-width:100%;aspect-ratio:9/16;border-radius:var(--radius-lg);overflow:hidden;position:relative;display:flex;flex-direction:column;justify-content:space-between;padding:28px 24px;box-sizing:border-box;';
    case 'banner':
      // Tight but clean banner — keep very compact
      return 'width:100%;max-width:728px;height:90px;border-radius:10px;overflow:hidden;position:relative;display:flex;align-items:center;gap:12px;padding:8px 14px;box-sizing:border-box;';
    case 'email':
      return 'width:100%;max-width:560px;height:200px;border-radius:var(--radius-lg);overflow:hidden;position:relative;display:flex;flex-direction:column;justify-content:space-between;padding:16px 20px;box-sizing:border-box;';
    case 'video':
      return 'width:100%;max-width:520px;aspect-ratio:16/9;border-radius:var(--radius-lg);overflow:hidden;position:relative;display:flex;flex-direction:column;justify-content:space-between;padding:18px 22px;box-sizing:border-box;background:#0a0f1a;';
    case 'social':
    default:
      // Comfortable preview size + proper internal layout
      return 'width:100%;max-width:420px;aspect-ratio:1/1;border-radius:var(--radius-lg);overflow:hidden;position:relative;display:flex;flex-direction:column;justify-content:space-between;padding:28px 26px;box-sizing:border-box;';
  }
}

function setLocale(el) {
  document.querySelectorAll('.locale-btn').forEach((b) => b.classList.remove('active'));
  el.classList.add('active');
  state.currentLocale = el.dataset.locale;
  updateLocalisedCopy();
}

function updateLocalisedCopy() {
  const container = document.getElementById('localisedCopy');
  const content = localisedContent[state.currentLocale] || localisedContent['EN'];

  if (!state.generatedAsset) {
    container.innerHTML = '<div class="text-sm" style="color:var(--text-tertiary);">Localised copy will appear after generation...</div>';
    return;
  }

  container.innerHTML = `
    <div style="background:var(--bg-secondary);border:1px solid var(--border-default);border-radius:var(--radius-md);padding:var(--space-md);">
      <div class="flex items-center gap-sm mb-sm">
        <span class="badge badge-lime">${state.currentLocale}</span>
        <span class="text-xs text-muted">Auto-translated</span>
      </div>
      <div class="text-sm font-bold" style="color:var(--accent-lime);">${content.headline}</div>
      <div class="text-sm mt-sm" style="color:var(--text-secondary);">${content.body}</div>
      <div class="text-sm mt-sm font-bold" style="color:var(--accent-cyan);">${content.cta}</div>
      <div class="text-xs text-muted mt-sm" style="padding-top:8px;border-top:1px solid var(--border-default);">${content.disclaimer}</div>
    </div>
  `;
}

// ═══════════════════════════════════════════
// TAB 2: SYSTEM HEALTH DASHBOARD
// ═══════════════════════════════════════════

function initCharts() {
  buildBarChart('volumeChart', [
    { label: 'Mon', value: 78 },
    { label: 'Tue', value: 92 },
    { label: 'Wed', value: 65 },
    { label: 'Thu', value: 88 },
    { label: 'Fri', value: 95 },
    { label: 'Sat', value: 42 },
    { label: 'Sun', value: 38 },
  ]);

  buildBarChart(
    'qualityChart',
    [
      { label: '🇪🇸 ES', value: 97 },
      { label: '🇬🇧 UK', value: 95 },
      { label: '🇫🇷 FR', value: 93 },
      { label: '🇩🇪 DE', value: 91 },
      { label: '🇵🇹 PT', value: 96 },
      { label: '🌎 LATAM', value: 89 },
    ],
    'var(--accent-cyan)'
  );
}

function buildBarChart(containerId, data, color) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const maxVal = Math.max(...data.map((d) => d.value));
  container.innerHTML = data
    .map(
      (d) => `
    <div class="bar" style="height:0%;${color ? `background:linear-gradient(to top, rgba(34,211,238,0.15), ${color});` : ''}" 
         data-value="${d.value}" title="${d.label}: ${d.value}">
      <div class="bar-label">${d.label}</div>
    </div>
  `
    )
    .join('');

  // Animate bars
  requestAnimationFrame(() => {
    container.querySelectorAll('.bar').forEach((bar) => {
      const val = parseInt(bar.dataset.value);
      bar.style.height = (val / maxVal) * 100 + '%';
    });
  });
}

function updateChart() {
  const period = document.getElementById('chartPeriod').value;
  const data = {
    week: [
      { label: 'Mon', value: 78 },
      { label: 'Tue', value: 92 },
      { label: 'Wed', value: 65 },
      { label: 'Thu', value: 88 },
      { label: 'Fri', value: 95 },
      { label: 'Sat', value: 42 },
      { label: 'Sun', value: 38 },
    ],
    month: [
      { label: 'W1', value: 420 },
      { label: 'W2', value: 580 },
      { label: 'W3', value: 510 },
      { label: 'W4', value: 640 },
    ],
    quarter: [
      { label: 'Jan', value: 1820 },
      { label: 'Feb', value: 2140 },
      { label: 'Mar', value: 2580 },
    ],
  };
  buildBarChart('volumeChart', data[period]);
  showToast(`📊 Chart updated for ${period}`, 'info');
}

function updateSlider(type, value) {
  const configs = {
    temp: { el: 'tempValue', format: (v) => (v / 100).toFixed(1) },
    comp: { el: 'compThresholdValue', format: (v) => v + '%' },
    batch: { el: 'batchValue', format: (v) => v },
    iter: { el: 'iterValue', format: (v) => v },
    locConf: { el: 'locConfValue', format: (v) => v + '%' },
    riskSens: {
      el: 'riskSensValue',
      format: (v) => ['Low', 'Medium', 'High'][v - 1],
    },
  };

  const config = configs[type];
  if (config) {
    document.getElementById(config.el).textContent = config.format(value);
  }
}

// ── SQL Simulator ──
function runSQL() {
  const btn = document.getElementById('runSqlBtn');
  const results = document.getElementById('sqlResults');

  btn.classList.add('loading');
  btn.disabled = true;

  results.innerHTML = `
    <div class="flex items-center gap-sm" style="padding:var(--space-md);">
      <div class="spinner" style="display:block;width:16px;height:16px;border:2px solid transparent;border-top-color:var(--accent-lime);border-radius:50%;animation:spin 0.6s linear infinite;"></div>
      <span class="text-sm text-muted">Executing query against grovolut.creative_assets...</span>
    </div>
  `;

  setTimeout(() => {
    btn.classList.remove('loading');
    btn.disabled = false;

    results.innerHTML = `
      <div class="flex items-center justify-between mb-sm">
        <span class="badge badge-green">✓ 7 rows returned</span>
        <span class="text-xs font-mono text-muted">Execution time: 0.034s</span>
      </div>
      <div style="overflow-x:auto;">
        <table class="results-table">
          <thead>
            <tr>
              <th>Market</th>
              <th>Asset Type</th>
              <th>Total</th>
              <th>Avg Compliance</th>
              <th>Avg CTR</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>🇪🇸 ES</td><td>Social</td><td class="num">3,247</td><td class="num">97.8%</td><td class="num">4.2%</td></tr>
            <tr><td>🇬🇧 UK</td><td>Social</td><td class="num">2,891</td><td class="num">96.5%</td><td class="num">3.8%</td></tr>
            <tr><td>🇪🇸 ES</td><td>Display</td><td class="num">1,654</td><td class="num">98.1%</td><td class="num">2.1%</td></tr>
            <tr><td>🇫🇷 FR</td><td>Social</td><td class="num">1,482</td><td class="num">95.3%</td><td class="num">3.5%</td></tr>
            <tr><td>🇩🇪 DE</td><td>Story</td><td class="num">1,203</td><td class="num">94.7%</td><td class="num">5.1%</td></tr>
            <tr><td>🇬🇧 UK</td><td>Email</td><td class="num">987</td><td class="num">97.2%</td><td class="num">6.3%</td></tr>
            <tr><td>🌎 LATAM</td><td>Social</td><td class="num">876</td><td class="num">93.4%</td><td class="num">4.7%</td></tr>
          </tbody>
        </table>
      </div>
    `;

    showToast('📊 Query executed — 7 rows returned in 0.034s', 'success');
  }, 1800);
}

function resetSQL() {
  document.getElementById('sqlResults').innerHTML = '';
  showToast('↺ Query reset', 'info');
}

// ═══════════════════════════════════════════
// TAB 3: CREATOR TOOL + WIP
// ═══════════════════════════════════════════

function toggleWIP() {
  state.wipMode = document.getElementById('wipToggle').checked;
  const banner = document.getElementById('wipBanner');
  banner.classList.toggle('visible', state.wipMode);

  const status = document.getElementById('canvasStatus');
  if (state.wipMode) {
    status.textContent = 'WIP Mode';
    status.className = 'badge badge-orange';
    showToast('🚧 WIP mode enabled — asset marked as work in progress', 'warning');
  } else {
    status.textContent = 'Editing';
    status.className = 'badge badge-purple';
    showToast('✏️ WIP mode disabled — asset in editing mode', 'info');
  }
}

function canvasAction(type) {
  if (type === 'logo') {
    const creatorLogo = document.getElementById('creatorProductLogo').value;
    const canvasContent = document.getElementById('canvasContent');
    const imgWrapper = document.createElement('div');
    imgWrapper.style.cssText = 'position:absolute; top:20px; left:20px; z-index:10; cursor:move;';
    imgWrapper.innerHTML = `<img src="${creatorLogo}" style="height: 48px; width: auto; object-fit: contain;" alt="Placed Logo"/>`;
    canvasContent.appendChild(imgWrapper);
    showToast('◆ Revolut logo placed on canvas', 'success');
    return;
  }

  const actions = {
    text: '📝 Text layer added to canvas',
    shape: '◻ Shape element added',
    image: '🖼 Image placeholder inserted',
  };
  showToast(actions[type] || 'Action performed', 'success');
}

function updateLayerProp(type, value) {
  const canvas = document.getElementById('canvasBody');
  if (type === 'opacity') {
    canvas.style.opacity = value / 100;
  } else if (type === 'blur') {
    canvas.style.filter = `blur(${value}px)`;
  }
}

function creatorAction(action) {
  const btnMap = {
    save: 'saveDraftBtn',
    iterate: 'iterateCreatorBtn',
    approve: 'approveBtn',
  };
  const btn = document.getElementById(btnMap[action]);
  btn.classList.add('loading');
  btn.disabled = true;

  const delays = { save: 800, iterate: 1500, approve: 1200 };

  setTimeout(() => {
    btn.classList.remove('loading');
    btn.disabled = false;

    if (action === 'save') {
      showToast('💾 Draft saved — version updated', 'success');
      addVersionEntry('Draft saved');
    } else if (action === 'iterate') {
      state.iterationCount++;
      document.getElementById('iterationCount').textContent = state.iterationCount;
      document.getElementById('aiConfidence').textContent = Math.min(99, 92 + state.iterationCount) + '%';
      showToast(`🔄 Iteration ${state.iterationCount} — AI refined the creative direction`, 'success');
      addVersionEntry(`AI Iteration v${state.iterationCount}`);
    } else if (action === 'approve') {
      const status = document.getElementById('canvasStatus');
      status.textContent = 'Approved ✓';
      status.className = 'badge badge-green';
      showToast('✅ Asset approved and ready for deployment!', 'success');
      addVersionEntry('Approved for deployment');
    }
  }, delays[action]);
}

function addVersionEntry(label) {
  const history = document.getElementById('versionHistory');
  const now = new Date();
  const timeStr = 'Just now';
  const entry = document.createElement('div');
  entry.className = 'flex items-center gap-sm';
  entry.style.cssText = 'padding:8px 0;border-bottom:1px solid var(--border-default);animation:fadeSlideIn 0.3s ease-out;';
  entry.innerHTML = `
    <div class="status-dot online"></div>
    <div class="text-sm">v${state.iterationCount}.0 — ${label}</div>
    <div class="text-xs text-muted" style="margin-left:auto;">${timeStr}</div>
  `;
  history.prepend(entry);
}

// ═══════════════════════════════════════════
// TAB 4: AI AGENTS & ROADMAP
// ═══════════════════════════════════════════

const agentOutputs = {
  copywriter: [
    '📝 Generated 3 headline variants for ES market:',
    '   1. "Tu dinero, sin fronteras. Revolut Premium."',
    '   2. "Cashback real. Transferencias sin límites."',
    '   3. "El metal que transforma tus finanzas."',
    '✓ All variants passed brand tone check (97% confidence)',
  ],
  designer: [
    '🎨 Created visual composition (1080×1080):',
    '   - Background: Deep navy gradient (#0d0d1a → #16213e)',
    '   - Hero: Revolut Premium metal card — 30° rotation',
    '   - Typography: Inter Bold, 48px headline',
    '   - CTA: Lime green (#b8f03e) pill button',
    '✓ Layout passes WCAG AA contrast requirements',
  ],
  compliance: [
    '🛡️ Compliance scan completed:',
    '   ✓ FCA disclaimer present and correctly formatted',
    '   ✓ No prohibited claims detected',
    '   ✓ Risk warnings visible (min 8pt font verified)',
    '   ✓ Logo usage follows brand guidelines v3.2',
    '   ✓ Colour palette within approved range',
    '📊 Overall compliance score: 98.4%',
  ],
  localiser: [
    '🌍 Localisation complete for 5 markets:',
    '   🇪🇸 ES — Translated (confidence: 97%)',
    '   🇬🇧 EN — Original (baseline)',
    '   🇫🇷 FR — Translated (confidence: 95%)',
    '   🇩🇪 DE — Translated (confidence: 94%)',
    '   🇵🇹 PT — Translated (confidence: 96%)',
    '✓ Cultural adaptation applied for ES market (informal "tú" form)',
  ],
  analytics: [
    '📊 Performance prediction analysis:',
    '   Predicted CTR: 4.2% (above 3.5% benchmark)',
    '   Predicted engagement rate: 6.8%',
    '   Best performing market: DE (Story format)',
    '   Recommended optimisation: Increase CTA contrast by 15%',
    '⚡ A/B test recommendation: Test lime vs cyan CTA colour',
  ],
  orchestrator: [
    '🧠 Orchestration cycle complete:',
    '   1. Copywriter Agent → 3 variants generated ✓',
    '   2. Visual Designer Agent → composition created ✓',
    '   3. Compliance Agent → all checks passed ✓',
    '   4. Localiser Agent → 5 markets ready ✓',
    '   5. Performance Agent → CTR prediction: 4.2% ✓',
    '📦 Pipeline complete — 15 final assets ready for deployment',
  ],
};

function triggerAgent(agentName) {
  const card = event?.target?.closest('.agent-card') || document.querySelector(`.agent-card`);
  const btn = card?.querySelector('.btn');
  if (btn) {
    btn.classList.add('loading');
    btn.disabled = true;
  }

  const logContainer = document.getElementById('agentLog');
  const ai = getEffectiveAI();
  const providerLabel = ai === 'simulated' ? '🧪 Simulated' : ai === 'gemini' ? '✦ Gemini' : ai === 'claude' ? '✦ Claude' : ai === 'chatgpt' ? '✦ ChatGPT' : '✦ Grok xAI';

  // Clear placeholder
  if (state.agentLogs.length === 0) {
    logContainer.innerHTML = '';
  }

  const delay = (getEffectiveAI() === 'gemini') ? 1800 : 1200;

  // Add processing message
  const processingId = `proc-${Date.now()}`;
  logContainer.innerHTML += `
    <div id="${processingId}" class="flex items-center gap-sm" style="padding:8px var(--space-md);color:var(--accent-lime);font-size:0.82rem;animation:fadeSlideIn 0.3s ease-out;">
      <div class="spinner" style="display:block;width:12px;height:12px;border:2px solid transparent;border-top-color:var(--accent-lime);border-radius:50%;animation:spin 0.6s linear infinite;"></div>
      Running ${agentName} agent via ${providerLabel}...
    </div>
  `;
  logContainer.scrollTop = logContainer.scrollHeight;

  setTimeout(() => {
    if (btn) {
      btn.classList.remove('loading');
      btn.disabled = false;
    }

    // Remove processing
    const procEl = document.getElementById(processingId);
    if (procEl) procEl.remove();

    // Add output
    const output = agentOutputs[agentName] || ['✓ Agent executed successfully.'];
    const timestamp = new Date().toLocaleTimeString();

    logContainer.innerHTML += `
      <div style="padding:var(--space-sm) var(--space-md);border-bottom:1px solid var(--border-default);animation:fadeSlideIn 0.3s ease-out;">
        <div class="flex items-center justify-between mb-sm">
          <span class="badge badge-${agentName === 'compliance' ? 'purple' : agentName === 'copywriter' ? 'lime' : agentName === 'designer' ? 'blue' : agentName === 'localiser' ? 'cyan' : agentName === 'analytics' ? 'orange' : 'red'}">${agentName}</span>
          <span class="text-xs text-muted">${timestamp} • ${providerLabel}</span>
        </div>
        <pre style="font-family:'JetBrains Mono',monospace;font-size:0.75rem;color:var(--text-secondary);white-space:pre-wrap;line-height:1.6;margin:0;">${output.join('\n')}</pre>
      </div>
    `;

    state.agentLogs.push(agentName);
    logContainer.scrollTop = logContainer.scrollHeight;

    showToast(`🤖 ${agentName.charAt(0).toUpperCase() + agentName.slice(1)} agent completed successfully`, 'success');
  }, delay);
}

function clearAgentLog() {
  document.getElementById('agentLog').innerHTML = `
    <div class="text-sm text-muted" style="padding:var(--space-md);text-align:center;">
      Click "Run Agent" to see real-time agent outputs...
    </div>
  `;
  state.agentLogs = [];
  showToast('🗑️ Agent log cleared', 'info');
}

// ═══════════════════════════════════════════
// TAB 5: BRAND GUARDIAN (0% DEFECT)
// ═══════════════════════════════════════════

function handleDragOver(e) {
  e.preventDefault();
  document.getElementById('uploadArea').classList.add('dragover');
}

function handleDragLeave(e) {
  document.getElementById('uploadArea').classList.remove('dragover');
}

function handleDrop(e) {
  e.preventDefault();
  document.getElementById('uploadArea').classList.remove('dragover');
  loadDemoAsset('good');
}

function handleFileSelect(e) {
  loadDemoAsset('good');
}

function loadDemoAsset(type) {
  const uploadArea = document.getElementById('uploadArea');
  const scoreSection = document.getElementById('guardianScore');
  const violationList = document.getElementById('violationList');
  const fixBtn = document.getElementById('fixAllBtn');
  const previewCard = document.getElementById('guardianPreviewCard');
  const previewImg = document.getElementById('guardianPreviewImg');
  const imgWrapper = previewCard.querySelector('.guardian-image-wrapper');

  uploadArea.innerHTML = `
    <div class="upload-icon" style="animation:spin 1s linear infinite;">⏳</div>
    <div class="upload-text">Analysing asset...</div>
    <div class="upload-hint">Running 47 brand compliance checks</div>
  `;

  // Show preview container with scanning animation
  previewCard.style.display = 'block';
  imgWrapper.classList.add('scanning');
  
  if (type === 'good') {
    previewImg.src = 'logo2.jpg';
    previewImg.style.filter = 'none';
  } else {
    // Bad example shows logo1.jpg (unapproved plain logo style) and we apply a warning-tinted filter for realism
    previewImg.src = 'logo1.jpg';
    previewImg.style.filter = 'hue-rotate(320deg) saturate(1.5)';
  }

  setTimeout(() => {
    uploadArea.innerHTML = `
      <div class="upload-icon">✅</div>
      <div class="upload-text">${type === 'good' ? 'revolut_premium_es_social.png' : 'unapproved_creative_v3.png'}</div>
      <div class="upload-hint">Asset loaded — see compliance report →</div>
    `;

    imgWrapper.classList.remove('scanning');
    scoreSection.style.display = 'block';

    if (type === 'good') {
      animateGuardianScore(96);
      document.getElementById('guardianVerdict').textContent = 'Brand Compliant ✓';
      document.getElementById('guardianVerdict').style.color = 'var(--accent-green)';
      document.getElementById('guardianSummary').textContent = 'Asset passes 45/47 checks. 2 minor suggestions.';
      document.getElementById('guardianBadge').textContent = '✓ Approved';
      document.getElementById('guardianBadge').className = 'badge badge-green';

      violationList.innerHTML = `
        <div class="violation-item">
          <span class="violation-severity severity-low">Low</span>
          <div class="violation-details">
            <div class="violation-title">Font size suggestion</div>
            <div class="violation-desc">Disclaimer text at 7pt — recommend minimum 8pt for Spanish regulatory compliance (BdE guidelines).</div>
          </div>
        </div>
        <div class="violation-item">
          <span class="violation-severity severity-low">Low</span>
          <div class="violation-details">
            <div class="violation-title">Contrast ratio</div>
            <div class="violation-desc">Secondary text contrast ratio 4.3:1 — passes AA but below AAA threshold (7:1). Consider lightening text colour.</div>
          </div>
        </div>
      `;
      fixBtn.style.display = 'inline-flex';
    } else {
      animateGuardianScore(42);
      document.getElementById('guardianVerdict').textContent = 'Non-Compliant ✗';
      document.getElementById('guardianVerdict').style.color = 'var(--accent-red)';
      document.getElementById('guardianSummary').textContent = 'Asset fails 8/47 checks. Immediate action required.';
      document.getElementById('guardianBadge').textContent = '✗ Failed';
      document.getElementById('guardianBadge').className = 'badge badge-red';

      violationList.innerHTML = `
        <div class="violation-item">
          <span class="violation-severity severity-high">Critical</span>
          <div class="violation-details">
            <div class="violation-title">Missing regulatory disclaimer</div>
            <div class="violation-desc">FCA/BdE capital at risk warning is absent. Required for all financial product promotions.</div>
          </div>
        </div>
        <div class="violation-item">
          <span class="violation-severity severity-high">Critical</span>
          <div class="violation-details">
            <div class="violation-title">Incorrect logo usage</div>
            <div class="violation-desc">Revolut logo appears in unapproved colour (#FF0000). Must use official brand colours only.</div>
          </div>
        </div>
        <div class="violation-item">
          <span class="violation-severity severity-high">Critical</span>
          <div class="violation-details">
            <div class="violation-title">Prohibited claim detected</div>
            <div class="violation-desc">"Guaranteed returns" — this claim is prohibited by FCA regulations for financial products.</div>
          </div>
        </div>
        <div class="violation-item">
          <span class="violation-severity severity-medium">Medium</span>
          <div class="violation-details">
            <div class="violation-title">Non-approved font</div>
            <div class="violation-desc">Comic Sans detected. Brand guidelines require Inter or Revolut Sans exclusively.</div>
          </div>
        </div>
        <div class="violation-item">
          <span class="violation-severity severity-medium">Medium</span>
          <div class="violation-details">
            <div class="violation-title">Colour palette violation</div>
            <div class="violation-desc">Background uses #FF69B4 — not in approved brand colour palette.</div>
          </div>
        </div>
        <div class="violation-item">
          <span class="violation-severity severity-medium">Medium</span>
          <div class="violation-details">
            <div class="violation-title">Safe area violation</div>
            <div class="violation-desc">Text elements extend beyond the designated safe area margins (20px required).</div>
          </div>
        </div>
        <div class="violation-item">
          <span class="violation-severity severity-low">Low</span>
          <div class="violation-details">
            <div class="violation-title">Accessibility: Missing alt text</div>
            <div class="violation-desc">Product image lacks descriptive alt text for screen readers (WCAG 2.1 Level A).</div>
          </div>
        </div>
        <div class="violation-item">
          <span class="violation-severity severity-low">Low</span>
          <div class="violation-details">
            <div class="violation-title">Low contrast CTA button</div>
            <div class="violation-desc">CTA button contrast ratio 2.8:1 — below WCAG AA minimum of 4.5:1.</div>
          </div>
        </div>
      `;
      fixBtn.style.display = 'inline-flex';
    }

    showToast(`🛡️ Brand analysis complete — ${type === 'good' ? '96% compliant' : '42% — violations detected'}`, type === 'good' ? 'success' : 'warning');
  }, 2000);
}

function animateGuardianScore(targetScore) {
  const ring = document.getElementById('guardianRing');
  const scoreEl = document.getElementById('guardianScoreValue');

  const circumference = 2 * Math.PI * 42;
  const offset = circumference * (1 - targetScore / 100);

  if (targetScore >= 90) {
    ring.className.baseVal = 'ring-fill';
  } else if (targetScore >= 70) {
    ring.className.baseVal = 'ring-fill warning';
  } else {
    ring.className.baseVal = 'ring-fill danger';
  }

  ring.style.strokeDashoffset = offset;
  scoreEl.textContent = targetScore + '%';
}

function fixAllViolations() {
  const btn = document.getElementById('fixAllBtn');
  const previewImg = document.getElementById('guardianPreviewImg');
  const previewCard = document.getElementById('guardianPreviewCard');
  const imgWrapper = previewCard.querySelector('.guardian-image-wrapper');

  btn.classList.add('loading');
  btn.disabled = true;
  
  // Show scan animation while auto-fixing
  imgWrapper.classList.add('scanning');

  setTimeout(() => {
    btn.classList.remove('loading');
    btn.disabled = false;
    imgWrapper.classList.remove('scanning');

    // Load fixed asset preview (logo2.jpg is fully compliant)
    previewImg.src = 'logo2.jpg';
    previewImg.style.filter = 'none';

    // Mark all violations as fixed
    document.querySelectorAll('.violation-item').forEach((item) => {
      item.classList.add('fixed');
      const severity = item.querySelector('.violation-severity');
      severity.textContent = '✓ Fixed';
      severity.className = 'violation-severity';
      severity.style.cssText = 'background:var(--accent-green-dim);color:var(--accent-green);';
    });

    // Update score
    animateGuardianScore(100);
    document.getElementById('guardianVerdict').textContent = 'Fully Compliant ✓';
    document.getElementById('guardianVerdict').style.color = 'var(--accent-green)';
    document.getElementById('guardianSummary').textContent = 'All violations auto-fixed. Asset passes 47/47 checks.';
    document.getElementById('guardianBadge').textContent = '✓ Protected';
    document.getElementById('guardianBadge').className = 'badge badge-green';

    // Show protection card
    document.getElementById('protectionCard').style.display = 'block';

    showToast('🛡️ All violations fixed! Asset is now 100% brand compliant.', 'success');
  }, 2500);
}

// ═══════════════════════════════════════════
// TAB 6: ASSEMBLY LOGIC
// ═══════════════════════════════════════════

function runAssembly() {
  if (state.assemblyRunning) return;
  state.assemblyRunning = true;

  const btn = document.getElementById('assembleBtn');
  const progress = document.getElementById('assemblyProgress');
  const fill = document.getElementById('assemblyProgressFill');
  const stage = document.getElementById('assemblyStage');

  btn.classList.add('loading');
  btn.disabled = true;
  progress.style.display = 'block';

  const nodes = ['flow-brief', 'flow-ai', 'flow-localise', 'flow-comply', 'flow-review', 'flow-deploy'];
  const stages = [
    'Processing creative brief...',
    'AI generating assets via ' + (getEffectiveAI() === 'simulated' ? 'Simulated Engine' : getEffectiveAI() === 'gemini' ? 'Gemini' : getEffectiveAI() === 'claude' ? 'Claude' : getEffectiveAI() === 'chatgpt' ? 'ChatGPT' : 'Grok xAI') + '...',
    'Localising for 5 markets...',
    'Running compliance checks...',
    'Preparing for review...',
    'Deploying to production...',
  ];

  let current = 0;

  function activateStep() {
    if (current >= nodes.length) {
      // Complete
      btn.classList.remove('loading');
      btn.disabled = false;
      state.assemblyRunning = false;
      fill.style.width = '100%';
      stage.textContent = '✅ Pipeline complete — 15 assets deployed across 5 markets!';
      stage.style.color = 'var(--accent-green)';
      showToast('🚀 Full assembly pipeline complete! 15 assets deployed.', 'success');
      return;
    }

    // Activate current node
    nodes.forEach((n) => document.getElementById(n).classList.remove('active'));
    document.getElementById(nodes[current]).classList.add('active');

    fill.style.width = ((current + 1) / nodes.length) * 100 + '%';
    stage.textContent = stages[current];
    stage.style.color = '';

    current++;
    setTimeout(activateStep, 1200);
  }

  activateStep();
}

// ═══════════════════════════════════════════
// INITIALISATION
// ═══════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  // Re-attach tab listeners inside DOMContentLoaded for max safety
  attachTabListeners();

  // Init dashboard charts (they'll be re-built when tab opens)
  // Animate KPI values
  animateCounters();

  // ── Intro Video Logic ──
  const introOverlay = document.getElementById('introOverlay');
  const introVideo = document.getElementById('introVideo');
  const introSkipBtn = document.getElementById('introSkipBtn');

  let introFaded = false;

  function fadeOutIntro() {
    if (introFaded) return;
    introFaded = true;

    if (introOverlay && !introOverlay.classList.contains('fade-out')) {
      introOverlay.classList.add('fade-out');

      // Pause video if playing to free resources
      if (introVideo) {
        try { introVideo.pause(); } catch (e) {}
      }

      // After transition completes, remove elements to free resources
      setTimeout(() => {
        if (introOverlay && introOverlay.parentNode) {
          introOverlay.parentNode.removeChild(introOverlay);
        }
      }, 1200);
    } else if (introOverlay) {
      // Immediate removal if no transition
      if (introOverlay.parentNode) introOverlay.parentNode.removeChild(introOverlay);
    }
  }

  // Make it extremely hard to get stuck on the intro
  function setupIntroSkip() {
    if (!introOverlay) return;

    // Click anywhere on the overlay to skip (except if clicking the button itself)
    introOverlay.addEventListener('click', (e) => {
      if (e.target !== introSkipBtn) {
        fadeOutIntro();
      }
    });

    // Keyboard support: any key or Escape/Space
    const keyHandler = (e) => {
      if (['Escape', ' ', 'Enter'].includes(e.key)) {
        fadeOutIntro();
        document.removeEventListener('keydown', keyHandler);
      }
    };
    document.addEventListener('keydown', keyHandler, { once: true });

    // Super hard timeout - never stay stuck longer than 6 seconds
    setTimeout(() => {
      if (!introFaded) {
        console.warn('Intro video timeout - forcing skip');
        fadeOutIntro();
      }
    }, 6000);
  }

  if (introVideo && introOverlay) {
    setupIntroSkip();

    // Skip button (also calls fadeOutIntro)
    if (introSkipBtn) {
      introSkipBtn.addEventListener('click', (e) => {
        e.stopImmediatePropagation();
        fadeOutIntro();
      });
    }

    // Attempt playback
    const tryPlay = () => {
      introVideo.play().catch(err => {
        console.log('Autoplay prevented or video issue:', err);
        // Don't block the UI - fade out so user can use the app
        fadeOutIntro();
      });
    };

    tryPlay();

    // If video loads, try play again (some browsers are picky)
    introVideo.addEventListener('loadedmetadata', tryPlay, { once: true });
    introVideo.addEventListener('canplay', tryPlay, { once: true });

    // When video naturally ends
    introVideo.addEventListener('ended', fadeOutIntro);

    // Video failed to load or decode
    introVideo.addEventListener('error', () => {
      console.warn('Intro video failed to load. Skipping...');
      fadeOutIntro();
    });

    // Extra safety: if the video element exists but never reports ended, force after a while
    // (the 6s hard timeout above already covers this)
  } else {
    // No intro elements found - just ensure body is visible
    document.body.style.opacity = '1';
  }
});

function animateCounters() {
  // Simple counter animation for KPI cards (runs when visible)
  const kpis = [
    { id: 'kpiVolume', target: 12847, prefix: '', suffix: '', decimal: false },
    { id: 'kpiQuality', target: 97.3, prefix: '', suffix: '%', decimal: true },
    { id: 'kpiRisk', target: 0.4, prefix: '', suffix: '%', decimal: true },
    { id: 'kpiSpeed', target: 1.2, prefix: '', suffix: 's', decimal: true },
  ];

  kpis.forEach(({ id, target, prefix, suffix, decimal }) => {
    const el = document.getElementById(id);
    if (!el) return;

    let current = 0;
    const step = target / 40;
    const interval = setInterval(() => {
      current += step;
      if (current >= target) {
        current = target;
        clearInterval(interval);
      }
      el.textContent = prefix + (decimal ? current.toFixed(1) : Math.floor(current).toLocaleString()) + suffix;
    }, 30);
  });
}

// ── Keyboard Shortcut ──
document.addEventListener('keydown', (e) => {
  if (e.altKey) {
    const tabMap = {
      '1': 'generator',
      '2': 'dashboard',
      '3': 'creator',
      '4': 'agents',
      '5': 'guardian',
      '6': 'assembly',
    };
    if (tabMap[e.key]) {
      e.preventDefault();
      switchTab(tabMap[e.key]);
      showToast(`Switched to ${tabMap[e.key]} (Alt+${e.key})`, 'info');
    }
  }
});

// ── NEW TAB CONTROLLERS & INTERACTIVE SIMULATORS ──

// 1. Prompt Generator
function addChipText(text) {
  const textarea = document.getElementById('advancedPromptText');
  if (textarea) {
    if (textarea.value.endsWith(' ') || textarea.value.length === 0) {
      textarea.value += text + ', ';
    } else {
      textarea.value += ' ' + text + ', ';
    }
    textarea.focus();
    showToast(`Added: ${text}`, 'info');
  }
}

// ── Saved Prompts Storage ──
function getSavedPrompts() {
  try {
    return JSON.parse(localStorage.getItem('grovolut_saved_prompts') || '[]');
  } catch { return []; }
}

function setSavedPrompts(prompts) {
  localStorage.setItem('grovolut_saved_prompts', JSON.stringify(prompts));
}

function updateSavedPromptsUI() {
  const list = document.getElementById('savedPromptsList');
  const empty = document.getElementById('savedPromptsEmpty');
  const countEl = document.getElementById('savedPromptCount');
  const usageEl = document.getElementById('promptLibraryUsage');
  const barEl = document.getElementById('promptLibraryBar');
  const prompts = getSavedPrompts();
  
  if (countEl) countEl.textContent = `${prompts.length} prompt${prompts.length !== 1 ? 's' : ''} saved`;
  if (usageEl) usageEl.textContent = `${prompts.length} / 50 slots`;
  if (barEl) barEl.style.width = `${(prompts.length / 50) * 100}%`;
  
  if (prompts.length === 0) {
    if (empty) empty.style.display = 'flex';
    if (list) { list.style.display = 'none'; list.innerHTML = ''; }
    return;
  }
  
  if (empty) empty.style.display = 'none';
  if (list) list.style.display = 'flex';
  
  // Color palette for prompt cards
  const colors = [
    { accent: 'var(--accent-teal)', bg: 'rgba(0,212,170,0.06)', border: 'rgba(0,212,170,0.15)' },
    { accent: 'var(--accent-blue)', bg: 'rgba(77,141,247,0.06)', border: 'rgba(77,141,247,0.15)' },
    { accent: 'var(--accent-purple)', bg: 'rgba(139,92,246,0.06)', border: 'rgba(139,92,246,0.15)' },
    { accent: 'var(--accent-cyan)', bg: 'rgba(34,211,238,0.06)', border: 'rgba(34,211,238,0.15)' },
    { accent: 'var(--accent-orange)', bg: 'rgba(245,158,11,0.06)', border: 'rgba(245,158,11,0.15)' },
  ];
  
  list.innerHTML = prompts.map((p, i) => {
    const c = colors[i % colors.length];
    const date = new Date(p.timestamp);
    const timeStr = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) + ' · ' + date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    const previewText = p.prompt.substring(0, 120).replace(/\n/g, ' ') + (p.prompt.length > 120 ? '...' : '');
    
    return `<div class="saved-prompt-card" style="padding:14px; background:${c.bg}; border:1px solid ${c.border}; border-radius:10px; transition: all 0.2s ease; cursor:pointer;" onmouseenter="this.style.borderColor='${c.accent}'; this.style.transform='translateY(-1px)'" onmouseleave="this.style.borderColor='${c.border}'; this.style.transform='none'">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">
        <div style="font-size:0.82rem; font-weight:700; color:${c.accent}; line-height:1.3; flex:1; padding-right:8px;">${p.title}</div>
        <div style="font-size:0.65rem; color:var(--text-muted); white-space:nowrap;">${timeStr}</div>
      </div>
      <div style="font-size:0.75rem; color:var(--text-tertiary); line-height:1.45; margin-bottom:10px; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">${previewText}</div>
      <div style="display:flex; gap:6px;">
        <button class="btn btn-sm btn-secondary" onclick="event.stopPropagation(); loadSavedPrompt(${i})" style="font-size:0.65rem; padding:4px 10px;">📥 Load</button>
        <button class="btn btn-sm btn-secondary" onclick="event.stopPropagation(); copySavedPrompt(${i})" style="font-size:0.65rem; padding:4px 10px;">📋 Copy</button>
        <button class="btn btn-sm btn-secondary" onclick="event.stopPropagation(); deleteSavedPrompt(${i})" style="font-size:0.65rem; padding:4px 10px; color:var(--accent-red);">✕</button>
      </div>
    </div>`;
  }).join('');
}

function generateMasterPrompt() {
  const roughPrompt = document.getElementById('advancedPromptText').value;
  const resultContainer = document.getElementById('masterPromptResultContainer');
  const outputText = document.getElementById('masterPromptOutputText');
  const btn = document.getElementById('generateMasterPromptBtn') || document.querySelector('.btn-grok');
  
  if (!roughPrompt.trim()) {
    showToast('⚠️ Please write a rough idea first!', 'warning');
    return;
  }
  
  btn.classList.add('loading');
  btn.disabled = true;
  showToast('🧠 Generating your Master Prompt...', 'info');
  
  setTimeout(() => {
    btn.classList.remove('loading');
    btn.disabled = false;
    
    // Build a smart, enhanced master prompt from the rough idea
    const keywords = roughPrompt.toLowerCase();
    
    // Detect context clues from the rough prompt
    const isVideo = /video|reel|tiktok|story|stories|clip|motion|animate/i.test(keywords);
    const isStatic = /banner|poster|static|image|display|carousel/i.test(keywords);
    const isSpain = /spain|spanish|es|españa|madrid|barcelona/i.test(keywords);
    const isPremium = /premium|metal|ultra|exclusive|luxury/i.test(keywords);
    const isB2B = /business|b2b|sme|corporate|linkedin|enterprise/i.test(keywords);
    const isCrypto = /crypto|web3|blockchain|bitcoin|eth/i.test(keywords);
    const isCashback = /cashback|reward|saving|discount/i.test(keywords);
    
    let enhancedSections = [];
    
    // Core creative direction
    enhancedSections.push(`You are a world-class creative director at a premium fintech brand. Create compelling marketing content based on the following direction:\n\n"${roughPrompt.trim()}"`);
    
    // Visual style intelligence
    if (isPremium) {
      enhancedSections.push(`VISUAL DIRECTION:\n- Use deep navy-to-black gradients as the primary backdrop\n- Feature the physical card with dramatic 3D rotation, catching light on brushed metal textures\n- Typography: Bold, clean sans-serif (Aeonik Pro or similar) with generous letter-spacing\n- Color palette: Deep navy (#0a1628), polished silver, bright teal (#00d4aa) accent highlights\n- Lighting: Cinematic rim-light on card edges, subtle lens flare on metal surfaces`);
    } else if (isCrypto) {
      enhancedSections.push(`VISUAL DIRECTION:\n- Dark mode interface aesthetic with neon accent gradients (electric purple → cyan)\n- Floating UI elements showing real-time crypto price tickers\n- Glassmorphism card overlays with subtle backdrop blur\n- Particle effects or data-stream animations in the background\n- Modern, tech-forward typography with monospaced price displays`);
    } else {
      enhancedSections.push(`VISUAL DIRECTION:\n- Clean, modern fintech aesthetic with premium dark or light theme\n- Strong brand consistency — use official brand colours and approved typography\n- High contrast between text and background for instant readability\n- Professional photography or 3D renders, never stock-photo generic\n- Whitespace-driven layout that breathes confidence and clarity`);
    }
    
    // Format-specific guidance
    if (isVideo) {
      enhancedSections.push(`FORMAT GUIDANCE:\n- Hook viewers in the first 0.5 seconds with motion or bold typography\n- Keep text overlays minimal — max 6 words per frame\n- Use smooth easing transitions between scenes (no hard cuts)\n- End with a clear, single CTA and brand lockup\n- Sound design: subtle whoosh on transitions, satisfying click on card reveals\n- Pacing: fast enough to hold attention, slow enough to read every word`);
    } else if (isStatic) {
      enhancedSections.push(`FORMAT GUIDANCE:\n- Create a clear visual hierarchy: hero image → headline → subtext → CTA\n- Headline should be 5-8 words maximum, punchy and benefit-driven\n- Use one dominant focal point — avoid visual clutter\n- CTA button should use the brand accent colour with strong contrast\n- Ensure all text is readable at the smallest expected display size`);
    } else {
      enhancedSections.push(`FORMAT GUIDANCE:\n- Adapt the creative for maximum impact on the target platform\n- Lead with the most compelling visual or statement\n- Maintain a clear content hierarchy that guides the viewer's eye\n- Include a single, unmissable call-to-action\n- Design for mobile-first viewing without losing impact on desktop`);
    }
    
    // Audience & tone
    if (isB2B) {
      enhancedSections.push(`AUDIENCE & TONE:\n- Target: CFOs, founders, and finance teams at SMEs and startups\n- Tone: Confident, professional, data-backed — avoid consumer-style hype\n- Emphasise ROI, time-saving, and operational efficiency\n- Use credibility markers: numbers, case studies, trust badges\n- Language style: Direct, authoritative, jargon-appropriate for finance professionals`);
    } else {
      enhancedSections.push(`AUDIENCE & TONE:\n- Target: Digitally-native millennials and Gen Z who expect premium experiences\n- Tone: Confident and aspirational but never arrogant — speak as a trusted insider\n- Emphasise lifestyle elevation, seamless UX, and smart money management\n- Use conversational language that feels personal, not corporate\n- Create FOMO through exclusivity cues without being pushy`);
    }
    
    // Localisation
    if (isSpain) {
      enhancedSections.push(`LOCALISATION (SPAIN):\n- All user-facing copy must be in native Castilian Spanish\n- Use € currency formatting with Spanish conventions (1.000,00 €)\n- Reference culturally relevant moments, cities, or lifestyle touchpoints\n- Include mandatory financial disclaimer per Spanish GdE regulations\n- Adapt humour and idioms to resonate with Spanish-speaking audiences`);
    }
    
    // Cashback specific
    if (isCashback) {
      enhancedSections.push(`OFFER MESSAGING:\n- Lead with the exact cashback percentage or amount — make it the hero\n- Show a tangible use case: "Get €X back on your daily coffee"\n- Use before/after or comparison framing to amplify perceived value\n- Add urgency if applicable: limited time, exclusive to plan tier\n- Visualise the reward with satisfying animations or bold number typography`);
    }
    
    // Final quality standards
    enhancedSections.push(`QUALITY STANDARDS:\n- Every element must feel intentional — no filler content or generic placeholders\n- The final output should look like it came from a top-tier creative agency\n- Ensure brand consistency across all touchpoints and variations\n- Prioritise clarity over cleverness — the message should land in under 3 seconds`);
    
    let masterPrompt = enhancedSections.join('\n\n');
    
    const isGeniusRealPrompt = isGeniusMode();
    if (isGeniusRealPrompt) {
      // GENIUS + real provider: output a direct, rich, ready-to-paste image prompt exactly as if generated by Grok app for Imagine.
      // No meta instructions ("create a prompt", "output only..."). Just the vivid final prompt.
      const directBrief = roughPrompt.trim();
      const hasMetal = isPremium || /metal|card|premium/i.test(directBrief);
      const hasCash = isCashback || /cashback|reward/i.test(directBrief);
      const hasCrypt = isCrypto || /crypto|bitcoin|eth|web3/i.test(directBrief);
      const hasBank = /open.?banking|banking|transfer/i.test(directBrief);

      masterPrompt = `Ultra-premium cinematic marketing visual for Revolut. ${directBrief}. ` +
        `Centerpiece: an exquisitely detailed Revolut Premium metal card in luxurious brushed titanium, precision-engraved logo and chip details catching dramatic cinematic lighting with crisp specular highlights and elegant rim light. The card floats at a sophisticated angle against a rich deep-navy to void-black gradient. ` +
        (hasMetal ? `Hyper-realistic metal texture, micro surface reflections and authentic physical depth. ` : ``) +
        (hasCash ? `Floating refined cashback reward elements in vibrant lime — crisp percentage badges and delicate glowing benefit particles orbit the card with perfect balance. ` : ``) +
        (hasCrypt ? `Subtle translucent crypto data streams and blockchain constellation accents in electric cyan and purple, layered elegantly in the mid-ground. ` : ``) +
        (hasBank ? `Delicate open-banking connection motifs and secure abstract lines integrated tastefully into the deep background. ` : ``) +
        `Modern luxury fintech aesthetic, bold clean sans typography space in lower third and right, electric teal highlights, sophisticated commercial photography meets moody cinematic lighting, flawless composition with generous negative space for text, razor-sharp focus, 8K photoreal detail, confident aspirational atmosphere, no people, premium advertising quality.`;
    }
    
    if (outputText) outputText.value = masterPrompt;
    if (resultContainer) {
      resultContainer.style.display = 'block';
      resultContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    showToast('✅ Master Prompt generated! Save it or copy to use in other tools.', 'success');
  }, 1800);
}

function copyMasterPrompt() {
  const text = document.getElementById('masterPromptOutputText').value;
  if (text) {
    navigator.clipboard.writeText(text);
    showToast('📋 Prompt copied to clipboard! Paste it into any studio tool.', 'success');
  }
}

function copySavedPrompt(index) {
  const prompts = getSavedPrompts();
  if (prompts[index]) {
    navigator.clipboard.writeText(prompts[index].prompt);
    showToast('📋 Saved prompt copied to clipboard!', 'success');
  }
}

function saveMasterPrompt() {
  const promptText = document.getElementById('masterPromptOutputText').value;
  if (!promptText.trim()) {
    showToast('⚠️ No prompt to save!', 'warning');
    return;
  }
  
  const prompts = getSavedPrompts();
  if (prompts.length >= 50) {
    showToast('⚠️ Library full! Delete some prompts first.', 'warning');
    return;
  }
  
  // Extract a smart title from the rough idea or first line of prompt
  const roughIdea = document.getElementById('advancedPromptText').value.trim();
  let title = roughIdea.substring(0, 50) || 'Master Prompt';
  if (title.length >= 50) title = title.substring(0, 47) + '...';
  
  prompts.unshift({
    title: title,
    prompt: promptText,
    roughIdea: roughIdea,
    timestamp: Date.now()
  });
  
  setSavedPrompts(prompts);
  updateSavedPromptsUI();
  showToast('💾 Prompt saved to library!', 'success');
}

function loadSavedPrompt(index) {
  const prompts = getSavedPrompts();
  if (prompts[index]) {
    const textarea = document.getElementById('advancedPromptText');
    const outputText = document.getElementById('masterPromptOutputText');
    const resultContainer = document.getElementById('masterPromptResultContainer');
    
    // Load rough idea back into the input
    if (textarea && prompts[index].roughIdea) {
      textarea.value = prompts[index].roughIdea;
    }
    
    // Show the saved master prompt in the output area
    if (outputText) outputText.value = prompts[index].prompt;
    if (resultContainer) resultContainer.style.display = 'block';
    
    showToast(`📥 Loaded: "${prompts[index].title}"`, 'info');
    
    // Scroll to the output
    if (resultContainer) resultContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function deleteSavedPrompt(index) {
  const prompts = getSavedPrompts();
  const deleted = prompts.splice(index, 1);
  setSavedPrompts(prompts);
  updateSavedPromptsUI();
  showToast(`🗑️ Deleted: "${deleted[0]?.title || 'prompt'}"`, 'info');
}

function clearAllSavedPrompts() {
  if (getSavedPrompts().length === 0) {
    showToast('Library is already empty.', 'info');
    return;
  }
  setSavedPrompts([]);
  updateSavedPromptsUI();
  showToast('🗑️ All saved prompts cleared.', 'info');
}

function usePromptIn(targetTab) {
  const promptText = document.getElementById('masterPromptOutputText').value;
  if (!promptText) {
    showToast('⚠️ Generate a prompt first!', 'warning');
    return;
  }
  
  // Copy to clipboard first
  navigator.clipboard.writeText(promptText);
  
  // Navigate to the target tab
  const tabMap = {
    'asset-generator': 'tab-asset-gen',
    'creator-tool': 'tab-creator-tool',
    'ab-test': 'tab-ab-test'
  };
  
  const tabBtn = document.getElementById(tabMap[targetTab]);
  if (tabBtn) {
    tabBtn.click();
    showToast(`📋 Prompt copied & switched to ${tabBtn.textContent.trim()}. Paste it in!`, 'success');
  }
}

// Initialize saved prompts and dynamic components on page load
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(() => {
    updateSavedPromptsUI();
    if (typeof renderCampaigns === 'function') renderCampaigns();
    if (typeof renderTeamTasks === 'function') renderTeamTasks();
    if (typeof renderAgentQueue === 'function') renderAgentQueue();
    if (typeof setCreatorTemplate === 'function') setCreatorTemplate('story');
  }, 100);
});

// ── Academy Guide Tab Switching ──
function showGuide(guideId) {
  // Hide all guide content panels
  document.querySelectorAll('.academy-guide-content').forEach(panel => {
    panel.style.display = 'none';
    panel.classList.remove('active');
  });
  // Show the selected guide
  const target = document.getElementById('guide-' + guideId);
  if (target) {
    target.style.display = 'block';
    target.classList.add('active');
  }
  // Update tab button active states
  document.querySelectorAll('.academy-guide-tab').forEach(tab => {
    tab.classList.toggle('active', tab.getAttribute('data-guide') === guideId);
  });
}

// 2. Inspiration Gallery
function filterGallery(category) {
  const cards = document.querySelectorAll('#galleryGrid .mockup-card');
  cards.forEach(card => {
    const cats = card.getAttribute('data-category').split(' ');
    if (category === 'all' || cats.includes(category)) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
  
  // Update button highlights
  const filterBtns = document.querySelectorAll('#content-inspiration button');
  filterBtns.forEach(btn => {
    const btnText = btn.textContent.toLowerCase();
    if (btnText === category) {
      btn.className = 'btn btn-sm btn-primary';
    } else if (['all', 'video', 'static', 'stories', 'spain', 'web3', 'metal cards'].includes(btnText)) {
      btn.className = 'btn btn-sm btn-secondary';
    }
  });
  showToast(`Filtering gallery: ${category}`, 'info');
}

function searchGallery(query) {
  const cards = document.querySelectorAll('#galleryGrid .mockup-card');
  const lowerQuery = query.toLowerCase();
  cards.forEach(card => {
    const title = card.querySelector('.mockup-title').textContent.toLowerCase();
    if (title.includes(lowerQuery)) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
}

function saveVisibleGalleryToLibrary() {
  const container = document.getElementById('galleryGrid');
  if (!container) return;

  const visibleCards = Array.from(container.querySelectorAll('.mockup-card')).filter(c => c.style.display !== 'none');
  if (visibleCards.length === 0) {
    showToast('No visible gallery items to save.', 'warning');
    return;
  }

  const camps = getCampaigns();

  let added = 0;
  visibleCards.forEach(card => {
    const titleEl = card.querySelector('.mockup-title');
    const tagsEl = card.querySelector('.mockup-tags');
    const title = titleEl ? titleEl.textContent.trim() : 'Untitled Inspiration';
    const tagsText = tagsEl ? tagsEl.textContent.trim() : '';
    const cats = (card.getAttribute('data-category') || '').split(' ').filter(Boolean);
    const market = cats.includes('spain') ? 'ES' : cats.includes('web3') ? 'Multi' : 'UK';

    // Avoid exact duplicates
    if (camps.some(c => c.name === title)) return;

    let imageSrc = '';
    const img = card.querySelector('.mockup-media img');
    if (img) {
      imageSrc = img.getAttribute('src') || '';
      if (imageSrc.includes('/')) imageSrc = imageSrc.split('/').pop();
    }

    const newCamp = {
      id: 'GRV-' + Date.now().toString(36).toUpperCase() + '-' + added,
      name: title,
      market: market,
      status: 'Draft',
      assets: imageSrc ? [imageSrc] : (tagsText ? [tagsText] : []),
      created: new Date().toISOString().split('T')[0],
      prompt: `Inspired by gallery item: ${title}. Tags: ${tagsText}`,
      views: 0, ctr: 0, conversions: 0,
      source: 'inspiration-gallery',
      image: imageSrc
    };
    camps.unshift(newCamp);
    added++;
  });

  if (added > 0) {
    setCampaigns(camps);
    renderCampaigns();
    showToast(`Saved ${added} item(s) to Campaign Library!`, 'success');
    setTimeout(() => switchTab('campaigns'), 600);
  } else {
    showToast('These items are already in the Campaign Library.', 'info');
  }
}

function saveGalleryCardToLibrary(btnOrCard) {
  let card = null;
  if (btnOrCard && btnOrCard.closest) {
    card = btnOrCard.closest('.mockup-card');
  } else if (btnOrCard && btnOrCard.classList && btnOrCard.classList.contains('mockup-card')) {
    card = btnOrCard;
  }
  if (!card) {
    showToast('Could not find card', 'warning');
    return;
  }

  const titleEl = card.querySelector('.mockup-title');
  const tagsEl = card.querySelector('.mockup-tags');
  const title = titleEl ? titleEl.textContent.trim() : 'Untitled Inspiration';
  const tagsText = tagsEl ? tagsEl.textContent.trim() : '';
  const cats = (card.getAttribute('data-category') || '').split(' ').filter(Boolean);
  const market = cats.includes('spain') ? 'ES' : cats.includes('web3') ? 'Multi' : 'UK';

  let imageSrc = '';
  const img = card.querySelector('.mockup-media img');
  if (img) {
    imageSrc = img.getAttribute('src') || '';
    if (imageSrc.includes('/')) imageSrc = imageSrc.split('/').pop();
  }

  const camps = getCampaigns();

  if (camps.some(c => c.name === title)) {
    showToast('Already saved to library', 'info');
    switchTab('campaigns');
    return;
  }

  const newCamp = {
    id: 'GRV-' + Date.now().toString(36).toUpperCase(),
    name: title,
    market: market,
    status: 'Draft',
    assets: imageSrc ? [imageSrc] : (tagsText ? [tagsText] : []),
    created: new Date().toISOString().split('T')[0],
    prompt: `Inspired by gallery item: ${title}. Tags: ${tagsText}`,
    views: 0, ctr: 0, conversions: 0,
    source: 'inspiration-gallery',
    image: imageSrc
  };

  camps.unshift(newCamp);
  setCampaigns(camps);
  renderCampaigns();
  showToast(`Saved "${title}" to Campaign Library`, 'success');
  setTimeout(() => switchTab('campaigns'), 500);
}

// Add current Asset Generator result to the Inspiration Gallery (dynamic)
function addToInspirationGallery(title, category, tags, icon = '✨', logo = 'logo_wordmark_white.png') {
  const grid = document.getElementById('galleryGrid');
  if (!grid) return;

  const safeTitle = (title || 'New Inspiration').replace(/'/g, "\\'");
  const safeTags = (tags || '').replace(/'/g, "\\'");

  const card = document.createElement('div');
  card.className = 'mockup-card';
  card.setAttribute('data-category', category || 'static');

  card.innerHTML = `
    <div class="mockup-media">
      <div style="font-size:2rem;">${icon}</div>
      <div class="mockup-overlay">
        <button class="btn btn-sm btn-primary" onclick="remixTemplate('${safeTitle}', '${safeTags}', '${logo}')">Remix</button>
        <button class="btn btn-sm btn-secondary" onclick="openAddToCampaignModal('${safeTitle.replace(/\s+/g,'_')}.png')">Use in Campaign</button>
        <button class="btn btn-xs btn-outline" onclick="saveGalleryCardToLibrary(this)" style="margin-top:4px; font-size:0.65rem; padding:2px 6px;">💾 Save to Library</button>
      </div>
    </div>
    <div class="mockup-details">
      <div class="mockup-title">${title || 'New Inspiration'}</div>
      <div class="mockup-tags">
        ${(tags || '').split('•').map(t => `<span class="mockup-tag">${t.trim()}</span>`).join('')}
      </div>
    </div>
  `;

  grid.appendChild(card);
  showToast('Added to Inspiration Gallery!', 'success');

  // Optionally auto-filter to show it
  setTimeout(() => filterGallery('all'), 300);
}

function addCurrentGenerationToGallery() {
  if (!window.lastCreative) {
    showToast('Generate an asset first.', 'warning');
    return;
  }

  const title = window.lastCreative.headline || 'New Generated Asset';
  const format = window.lastCreative.format || 'static';
  const market = document.getElementById('targetMarket') ? document.getElementById('targetMarket').value : 'UK';
  const category = `${format} ${market.toLowerCase()}`;

  const tags = `${format} • ${market} • Generated`;
  const icon = format === 'video' ? '🎥' : format === 'story' ? '📱' : '🖼️';

  // Use current logo if available
  const logo = window.lastCreative.logo || 'logo_wordmark_white.png';

  addToInspirationGallery(title, category, tags, icon, logo);
}

// Add current Creator Tool preview as an inspiration item
function saveCreatorToInspiration() {
  const h = document.getElementById('creatorHeadlineInput')?.value || 'Creator Draft';
  const s = document.getElementById('creatorSubtextInput')?.value || '';
  const logoSel = document.getElementById('creatorProductLogo');
  const logo = logoSel ? logoSel.value : 'logo_wordmark_white.png';

  const title = h;
  const tags = s || 'Creator Tool • Custom';
  const category = 'static custom';

  addToInspirationGallery(title, category, tags, '🖌️', logo);
}

// 3. Voice & Tone Lab
const voiceProfiles = {
  confident: { confidence: 95, empathy: 40, urgency: 75, safety: 85, suggestion: '"Obtén lo que te mereces. Revolut Metal te devuelve hasta un 1.6% de cashback y te permite viajar sin límites de cambio de divisa los fines de semana. Eleva tu poder financiero."' },
  playful: { confidence: 80, empathy: 75, urgency: 65, safety: 80, suggestion: '"¡Dale un subidón a tu cartera! 🚀 Con Revolut Metal tienes 1.6% de cashback y cero dramas con el cambio de divisa los findes. Únete al club del metal."' },
  authoritative: { confidence: 90, empathy: 50, urgency: 50, safety: 95, suggestion: '"Optimice su rentabilidad corporativa y personal. Revolut Metal le ofrece una tasa de reembolso preferencial del 1.6% y transacciones de divisas sin comisiones añadidas los fines de semana."' },
  friendly: { confidence: 75, empathy: 90, urgency: 35, safety: 95, suggestion: '"¿Planeando tu próxima escapada? Viaja con tranquilidad y cambia divisa sin comisiones los fines de semana con Revolut Metal. Además, disfruta de reembolsos en tus compras."' }
};

function setVoicePreset(preset) {
  const data = voiceProfiles[preset];
  if (!data) return;
  
  document.getElementById('toneConfidence').value = data.confidence;
  document.getElementById('toneEmpathy').value = data.empathy;
  document.getElementById('toneUrgency').value = data.urgency;
  document.getElementById('toneSafety').value = data.safety;
  
  document.getElementById('sliderVal1').textContent = data.confidence + '%';
  document.getElementById('sliderVal2').textContent = data.empathy + '%';
  document.getElementById('sliderVal3').textContent = data.urgency + '%';
  document.getElementById('sliderVal4').textContent = data.safety + '%';
  
  document.getElementById('voiceRewriteSuggestions').textContent = data.suggestion;
  
  // Highlight buttons
  const btns = document.querySelectorAll('[id^="btn-voice-"]');
  btns.forEach(btn => {
    btn.className = (btn.id === `btn-voice-${preset}`) ? 'btn btn-sm btn-primary' : 'btn btn-sm btn-secondary';
  });
  
  showToast(`Applied preset: ${preset}`, 'success');
}

function rewriteTextWithTone() {
  const original = document.getElementById('voiceTextToRewrite').value;
  showToast('🔬 Rewriting text via AI and analyzing compliance...', 'info');
  
  setTimeout(() => {
    const currentSuggestion = document.getElementById('voiceRewriteSuggestions').textContent;
    document.getElementById('voiceTextToRewrite').value = currentSuggestion.replace(/"/g, '');
    showToast('✅ Text rewritten successfully and brand verified!', 'success');
  }, 1000);
}

function copyRewriteText() {
  const text = document.getElementById('voiceTextToRewrite').value;
  navigator.clipboard.writeText(text);
  showToast('📋 Copied to clipboard!', 'success');
}

// ── Voice Playback using Web Speech API (browser built-in) ──
let currentUtterance = null;
let availableVoices = [];

function populateVoiceSelect() {
  const select = document.getElementById('voiceSelect');
  if (!select) return;

  // Get voices (some browsers load them asynchronously)
  availableVoices = window.speechSynthesis ? window.speechSynthesis.getVoices() : [];

  select.innerHTML = '<option value="">Default voice</option>';

  availableVoices.forEach((voice, i) => {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = `${voice.name} (${voice.lang})`;
    // Prefer Spanish or English voices for this demo
    if (voice.lang.startsWith('es') || voice.lang.startsWith('en')) {
      opt.textContent = '★ ' + opt.textContent;
    }
    select.appendChild(opt);
  });

  if (availableVoices.length === 0) {
    const opt = document.createElement('option');
    opt.textContent = 'No voices found (browser may load them async)';
    opt.disabled = true;
    select.appendChild(opt);
    // Retry once in case voices are still loading
    setTimeout(() => {
      if (document.getElementById('voiceSelect') && availableVoices.length === 0) {
        populateVoiceSelect();
      }
    }, 600);
  }
}

function getSelectedVoice() {
  const select = document.getElementById('voiceSelect');
  if (!select || !select.value || !availableVoices[select.value]) return null;
  return availableVoices[select.value];
}

function getToneParamsForSpeech() {
  // Read current sliders to influence speech
  const conf = parseInt(document.getElementById('toneConfidence')?.value || 80);
  const empathy = parseInt(document.getElementById('toneEmpathy')?.value || 60);
  const urgency = parseInt(document.getElementById('toneUrgency')?.value || 50);

  // Map to rate and pitch
  let rate = 1.0;
  let pitch = 1.0;

  // Higher urgency + confidence → slightly faster, slightly lower pitch (more authoritative)
  rate = 0.85 + (urgency / 100) * 0.5 + (conf / 100) * 0.15;
  pitch = 0.85 + (empathy / 100) * 0.5 - (urgency / 100) * 0.15;

  // Clamp
  rate = Math.max(0.7, Math.min(1.8, rate));
  pitch = Math.max(0.7, Math.min(1.6, pitch));

  return { rate, pitch };
}

function playVoice(text, hintPreset = null) {
  if (!('speechSynthesis' in window)) {
    showToast('Your browser does not support speech synthesis.', 'warning');
    return;
  }

  stopVoice(); // stop any current

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'es-ES'; // default for the demo text; will be overridden by chosen voice

  const selectedVoice = getSelectedVoice();
  if (selectedVoice) {
    utterance.voice = selectedVoice;
    utterance.lang = selectedVoice.lang;
  }

  // Apply tone-influenced params
  const tone = getToneParamsForSpeech();

  // Further adjust based on preset hint if provided (called from preset buttons)
  if (hintPreset) {
    if (hintPreset === 'playful') {
      tone.rate = Math.min(1.6, tone.rate + 0.15);
      tone.pitch = Math.min(1.5, tone.pitch + 0.25);
    } else if (hintPreset === 'authoritative') {
      tone.rate = Math.max(0.75, tone.rate - 0.1);
      tone.pitch = Math.max(0.7, tone.pitch - 0.2);
    } else if (hintPreset === 'friendly') {
      tone.pitch = Math.min(1.45, tone.pitch + 0.15);
    } else if (hintPreset === 'confident') {
      tone.pitch = Math.max(0.8, tone.pitch - 0.1);
    }
  }

  utterance.rate = tone.rate;
  utterance.pitch = tone.pitch;
  utterance.volume = 0.95;

  currentUtterance = utterance;

  utterance.onend = () => { currentUtterance = null; };
  utterance.onerror = () => {
    showToast('Voice playback error', 'warning');
    currentUtterance = null;
  };

  window.speechSynthesis.speak(utterance);
  showToast('🔊 Playing voice preview...', 'info');
}

function playSuggestionVoice() {
  const el = document.getElementById('voiceRewriteSuggestions');
  if (!el) return;
  let text = el.textContent || el.innerText || '';
  // Clean quotes
  text = text.replace(/^["']|["']$/g, '').trim();
  if (!text) {
    showToast('No suggestion text to play.', 'warning');
    return;
  }
  playVoice(text);
}

function playInputVoice() {
  const el = document.getElementById('voiceTextToRewrite');
  if (!el) return;
  const text = (el.value || '').trim();
  if (!text) {
    showToast('Enter some text first.', 'warning');
    return;
  }
  playVoice(text);
}

function stopVoice() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  currentUtterance = null;
}

// Initialize voices (call this on load)
function initVoiceLab() {
  // Populate voices now + when they load (some browsers are async)
  if ('speechSynthesis' in window) {
    populateVoiceSelect();
    window.speechSynthesis.onvoiceschanged = populateVoiceSelect;
  } else {
    const sel = document.getElementById('voiceSelect');
    if (sel) sel.style.display = 'none';
  }

  // Optional: make preset buttons also speak a quick preview when double-clicked (discoverable)
  ['confident', 'playful', 'authoritative', 'friendly'].forEach(preset => {
    const btn = document.getElementById(`btn-voice-${preset}`);
    if (btn) {
      btn.setAttribute('title', btn.getAttribute('title') || `Apply ${preset} tone. Double-click to preview voice.`);
      btn.addEventListener('dblclick', (e) => {
        e.preventDefault();
        const data = voiceProfiles[preset];
        if (data && data.suggestion) {
          let sample = data.suggestion.replace(/"/g, '');
          playVoice(sample, preset);
        }
      });
    }
  });
}

// Auto-init a bit after load (and when switching to the tab)
setTimeout(initVoiceLab, 800);

// Ensure voices are populated when user visits the Voice & Tone tab
setTimeout(() => {
  const voiceTabBtn = document.getElementById('tab-voice-tone');
  if (voiceTabBtn) {
    voiceTabBtn.addEventListener('click', () => {
      setTimeout(populateVoiceSelect, 250);
    });
  }
}, 1200);

// 4. A/B Test Studio — main logic is the enhanced version below
let simInterval = null;
let abCurrentWinner = null;
let abVotes = { A: { like: 0, dislike: 0 }, B: { like: 0, dislike: 0 } };

// Force initial display of vote counts (0) 
setTimeout(function() {
  if (typeof updateABVoteDisplays === 'function') {
    updateABVoteDisplays();
  }
}, 200);

function resetABSimulation() {
  if (simInterval) {
    clearInterval(simInterval);
    simInterval = null;
  }
  const aEl = document.getElementById('predictedCtrA');
  const bEl = document.getElementById('predictedCtrB');
  const log = document.getElementById('abSimLog');
  if (aEl) aEl.textContent = '4.8%';
  if (bEl) bEl.textContent = '3.9%';
  if (log) log.textContent = 'Simulation reset. Ready for next run.';
  // reset chart if exists
  try {
    document.getElementById('ctrChartLineA').setAttribute('points', '0,80 50,60 100,50 150,30 200,20 250,15 300,10');
    document.getElementById('ctrChartLineB').setAttribute('points', '0,85 50,75 100,65 150,55 200,45 250,42 300,40');
  } catch(e){}
  abCurrentWinner = null;
  abVotes = { A: { like: 0, dislike: 0 }, B: { like: 0, dislike: 0 } };
  if (typeof updateABVoteDisplays === 'function') updateABVoteDisplays();
  const summary = document.getElementById('abWinnerSummary');
  if (summary) summary.textContent = 'Run simulation or vote to determine winner.';
  showToast('Simulation data cleared.', 'info');
}

// Real A/B vote functions (called by HTML buttons)

function voteAB(version, isLike) {
  if (typeof abVotes === 'undefined' || abVotes === null) {
    abVotes = { A: { like: 0, dislike: 0 }, B: { like: 0, dislike: 0 } };
  }
  if (!abVotes[version]) abVotes[version] = { like: 0, dislike: 0 };
  if (isLike) abVotes[version].like++; else abVotes[version].dislike++;
  updateABVoteDisplays();
  showToast(`${isLike ? '👍' : '👎'} Vote recorded for Version ${version}`, 'info');
}

function updateABVoteDisplays() {
  if (typeof abVotes === 'undefined' || abVotes === null) {
    abVotes = { A: { like: 0, dislike: 0 }, B: { like: 0, dislike: 0 } };
  }
  const aL = document.getElementById('abVotesALikes');
  const aD = document.getElementById('abVotesADislikes');
  const bL = document.getElementById('abVotesBLikes');
  const bD = document.getElementById('abVotesBDislikes');
  if (aL) aL.textContent = abVotes.A.like;
  if (aD) aD.textContent = abVotes.A.dislike;
  if (bL) bL.textContent = abVotes.B.like;
  if (bD) bD.textContent = abVotes.B.dislike;
}

// Initialize vote displays to 0 on load
setTimeout(() => {
  if (typeof updateABVoteDisplays === 'function') {
    updateABVoteDisplays();
  }
}, 500);

// 5. Campaign Library filtering (by name and market)
function filterCampaigns() {
  // Delegate to the active rich implementation (defined later)
  if (typeof renderCampaigns === 'function' && document.getElementById('campaignSearchInput')) {
    // The full filterCampaigns defined later will handle re-render + filtering
    // Call the detailed version by name (it will be the last definition)
    const activeFilter = window.__activeCampaignFilter || null;
    if (activeFilter) activeFilter(); else renderCampaigns(); // fallback
  }
}

// 6. Content Calendar
let currentMonthOffset = 0;
const calendarMonths = ['June 2026', 'July 2026', 'August 2026'];
function shiftCalendar(direction) {
  currentMonthOffset = (currentMonthOffset + direction + calendarMonths.length) % calendarMonths.length;
  document.getElementById('calendarMonthTitle').textContent = calendarMonths[currentMonthOffset];
  showToast(`Switched calendar view to ${calendarMonths[currentMonthOffset]}`, 'info');
}

// 7. Integration Hub
function toggleIntegration(name, checked) {
  showToast(`${name} integration ${checked ? 'enabled & active' : 'disabled & offline'}.`, checked ? 'success' : 'info');
}

// ── NEW TAB INTERACTIVE CONTROLLERS & INTEGRATIONS ──

// 1. Quick Localisation flag buttons (Asset Generator)
function quickLocalise(locale) {
  const marketSelect = document.getElementById('targetMarket');
  const mapping = { 'ES': 'ES', 'UK': 'UK', 'EN': 'UK', 'FR': 'FR', 'DE': 'DE', 'PT': 'PT', 'IT': 'IT' };
  const val = mapping[locale] || 'UK';
  if (marketSelect) {
    marketSelect.value = val;
  }
  state.currentLocale = locale;
  updateLocalisedCopy();
  
  // Update flag active classes in the toggles row
  const toggles = document.querySelectorAll('#localeToggles .locale-btn');
  toggles.forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-locale') === locale || (locale === 'UK' && btn.getAttribute('data-locale') === 'EN'));
  });

  showToast(`📍 Preview language set to ${locale}`, 'success');
  if (state.generatedAsset) {
    generateAsset();
  }
}

// 2. Add Asset to Campaign functionality
let pendingAssetToAdd = null;
function addAssetToCampaign() {
  const market = document.getElementById('targetMarket').value;
  const format = document.getElementById('assetFormat').value;
  const name = `${market}_${format}_${Date.now().toString(36).toUpperCase()}.png`;
  openAddToCampaignModal(name);
}

function addCreatorAssetToCampaign() {
  const headline = document.getElementById('creatorHeadlineInput').value || 'Asset';
  const cleanHeadline = headline.replace(/[^a-z0-9]/gi, '_').substring(0, 15);
  const name = `${cleanHeadline}_Creator_${Date.now().toString(36).toUpperCase()}.png`;
  openAddToCampaignModal(name);
}

function openAddToCampaignModal(assetName) {
  pendingAssetToAdd = assetName;
  const select = document.getElementById('addToCampaignSelect');
  if (select) {
    const camps = getCampaigns();
    select.innerHTML = camps.map(cam => `<option value="${cam.id}">${cam.name} (${cam.market})</option>`).join('');
  }
  document.getElementById('addToCampaignModal').style.display = 'flex';
}

function closeAddToCampaignModal() {
  document.getElementById('addToCampaignModal').style.display = 'none';
  pendingAssetToAdd = null;
}

function submitAddToCampaign() {
  const camId = document.getElementById('addToCampaignSelect').value;
  const camps = getCampaigns();
  const cam = camps.find(c => c.id === camId);
  if (cam && pendingAssetToAdd) {
    if (!Array.isArray(cam.assets)) cam.assets = [];
    cam.assets.push(pendingAssetToAdd);
    setCampaigns(camps);
    renderCampaigns();
    closeAddToCampaignModal();
    showToast(`Successfully added ${pendingAssetToAdd} to campaign: ${cam.name}`, 'success');
  }
}

// 3. Creator Tool Canvas templates & controls
let creatorCustomBgUrl = null;  // for custom uploaded or gallery bg images

function setCreatorTemplate(template) {
  const btns = document.querySelectorAll('[id^="btn-tmpl-"]');
  btns.forEach(btn => btn.classList.toggle('active', btn.id === `btn-tmpl-${template}`));

  const card = document.getElementById('creatorPreviewCard');
  if (!card) return;

  card.style.width = '';
  card.style.height = '';
  card.style.aspectRatio = '';
  card.style.display = 'flex';
  card.style.flexDirection = 'column';
  card.style.justifyContent = 'space-between';
  card.style.textAlign = 'center';

  if (template === 'story') {
    card.style.maxWidth = '300px';
    card.style.aspectRatio = '9/16';
    card.style.padding = '40px 20px';
    showToast('📱 Switched to Stories format (9:16)', 'info');
  } else if (template === 'banner') {
    card.style.maxWidth = '550px';
    card.style.height = '120px';
    card.style.padding = '12px 20px';
    card.style.flexDirection = 'row';
    card.style.alignItems = 'center';
    card.style.textAlign = 'left';
    showToast('🖥️ Switched to Display Banner format (728:90)', 'info');
  } else if (template === 'carousel') {
    card.style.maxWidth = '360px';
    card.style.aspectRatio = '4/5';
    card.style.padding = '30px 20px';
    showToast('🎠 Switched to Carousel format (4:5)', 'info');
  } else if (template === 'blank') {
    card.style.maxWidth = '400px';
    card.style.aspectRatio = '';
    card.style.padding = '40px';
    document.getElementById('creatorHeadlineInput').value = '';
    document.getElementById('creatorSubtextInput').value = '';
    document.getElementById('creatorCTAInput').value = '';
    updateCreatorCanvas();
    showToast('⬜ Cleared canvas template', 'info');
    return;
  }
  
  if (template !== 'blank') {
    if (document.getElementById('creatorHeadlineInput').value === '') {
      document.getElementById('creatorHeadlineInput').value = 'Upgrade Your Financial Power';
      document.getElementById('creatorSubtextInput').value = 'Metal card • Unlimited transfers • Premium cashback';
      document.getElementById('creatorCTAInput').value = 'Upgrade Now →';
    }
  }

  // Handle banner specific inner layouts
  if (template === 'banner') {
    card.innerHTML = `
      <img id="creatorPreviewLogo" src="logo_wordmark_white.png" style="height:28px; width:auto; object-fit:contain; margin-right:10px; flex-shrink:0; align-self:center;" alt="Logo" />
      <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 4px;">
        <div style="font-size:0.5rem;text-transform:uppercase;letter-spacing:0.12em;color:var(--accent-teal);font-weight:700;">Revolut Premium</div>
        <h2 id="creatorPreviewHeadline" style="font-size:1.1rem;font-weight:800;margin:0;color:#fff;">Upgrade Your Financial Power</h2>
        <p id="creatorPreviewSubtext" style="font-size:0.7rem;color:var(--text-muted);margin:0;">Metal card • Unlimited transfers • Premium cashback</p>
      </div>
      <div id="creatorPreviewCTA" style="display:inline-block;background:var(--accent-teal);color:#0b1018;padding:6px 16px;border-radius:var(--radius-full);font-weight:700;font-size:0.75rem;white-space:nowrap;margin-left:8px;cursor:pointer;">Upgrade Now →</div>
    `;
  } else {
    card.innerHTML = `
      <img id="creatorPreviewLogo" src="logo_wordmark_white.png" style="height:36px; width:auto; object-fit:contain; margin:0 auto 8px; display:block;" alt="Logo" />
      <div style="font-size:0.65rem;text-transform:uppercase;letter-spacing:0.15em;color:var(--accent-teal);margin-bottom:8px;">Revolut Premium</div>
      <h2 id="creatorPreviewHeadline" style="font-size:1.6rem;font-weight:800;margin-bottom:8px;background:linear-gradient(135deg, #fff, var(--accent-teal));-webkit-background-clip:text;-webkit-text-fill-color:transparent;line-height:1.2;">Upgrade Your Financial Power</h2>
      <p id="creatorPreviewSubtext" style="font-size:0.82rem;color:var(--text-muted);margin-bottom:16px;line-height:1.45;">Metal card • Unlimited transfers • Premium cashback</p>
      <div id="creatorPreviewCTA" style="display:inline-block;background:var(--accent-teal);color:#0b1018;padding:8px 24px;border-radius:var(--radius-full);font-weight:700;font-size:0.85rem;margin-top:auto;cursor:pointer;transition:all 0.2s;">Upgrade Now →</div>
    `;
  }

  updateCreatorCanvas();
}

function updateCreatorCanvas() {
  const hInput = document.getElementById('creatorHeadlineInput').value;
  const sInput = document.getElementById('creatorSubtextInput').value;
  const ctaInput = document.getElementById('creatorCTAInput').value;
  const ctaColor = document.getElementById('creatorCTAColorInput').value;
  const bgTheme = document.getElementById('creatorBGInput').value;

  const hNode = document.getElementById('creatorPreviewHeadline');
  const sNode = document.getElementById('creatorPreviewSubtext');
  const ctaNode = document.getElementById('creatorPreviewCTA');
  const card = document.getElementById('creatorPreviewCard');

  if (hNode) hNode.textContent = hInput;
  if (sNode) sNode.textContent = sInput;
  if (ctaNode) {
    ctaNode.textContent = ctaInput;
    ctaNode.style.backgroundColor = ctaColor;
  }

  if (card) {
    if (creatorCustomBgUrl) {
      // Custom image takes full priority — theme is ignored
      card.style.backgroundImage = `url(${creatorCustomBgUrl})`;
      card.style.backgroundSize = 'cover';
      card.style.backgroundPosition = 'center';
      card.style.backgroundRepeat = 'no-repeat';
      card.style.border = '1px solid rgba(255,255,255,0.15)';
      // Readable text over photos
      if (hNode) {
        hNode.style.background = 'none';
        hNode.style.webkitTextFillColor = 'initial';
        hNode.style.color = '#fff';
        hNode.style.textShadow = '0 1px 4px rgba(0,0,0,0.8)';
      }
      if (sNode) {
        sNode.style.color = '#eee';
        sNode.style.textShadow = '0 1px 3px rgba(0,0,0,0.7)';
      }
    } else if (bgTheme === 'midnight') {
      card.style.background = 'linear-gradient(135deg, #0b1018, #131b28)';
      card.style.backgroundImage = '';
      card.style.border = '1px solid rgba(255,255,255,0.06)';
      if (hNode) {
        hNode.style.background = 'linear-gradient(135deg, #fff, var(--accent-teal))';
        hNode.style.webkitBackgroundClip = 'text';
        hNode.style.webkitTextFillColor = 'transparent';
        hNode.style.textShadow = '';
      }
      if (sNode) sNode.style.color = 'var(--text-muted)';
    } else if (bgTheme === 'slate') {
      card.style.background = '#2c3540';
      card.style.backgroundImage = '';
      card.style.border = '1px solid rgba(255,255,255,0.1)';
      if (hNode) {
        hNode.style.background = 'none';
        hNode.style.webkitTextFillColor = 'initial';
        hNode.style.color = '#ffffff';
        hNode.style.textShadow = '';
      }
      if (sNode) sNode.style.color = '#a0aec0';
    } else if (bgTheme === 'ultra') {
      card.style.background = 'linear-gradient(135deg, #050b14, #0b1c3a)';
      card.style.backgroundImage = '';
      card.style.border = '1px solid var(--accent-blue-dim)';
      if (hNode) {
        hNode.style.background = 'linear-gradient(135deg, #ffffff, #4d8df7)';
        hNode.style.webkitBackgroundClip = 'text';
        hNode.style.webkitTextFillColor = 'transparent';
        hNode.style.textShadow = '';
      }
      if (sNode) sNode.style.color = '#718096';
    } else if (bgTheme === 'light') {
      card.style.background = '#f4f5f7';
      card.style.backgroundImage = '';
      card.style.border = '1px solid #dcdfe4';
      if (hNode) {
        hNode.style.background = 'none';
        hNode.style.webkitTextFillColor = 'initial';
        hNode.style.color = '#0b1018';
        hNode.style.textShadow = '';
      }
      if (sNode) sNode.style.color = '#5a6578';
    }
  }

  // Sync product logo into the preview card (fixes missing logo in Creator Tool)
  const logoSel = document.getElementById('creatorProductLogo');
  const logoImg = document.getElementById('creatorPreviewLogo');
  if (logoImg && logoSel && logoSel.value) {
    const currentBase = (logoImg.src || '').split(/[?#]/)[0].split('/').pop() || '';
    const wanted = logoSel.value;
    if (currentBase !== wanted) {
      logoImg.src = wanted + '?v=' + Date.now();
    }
    // Size logos appropriately (wordmark/business larger), smaller on banner
    const isBig = wanted.includes('wordmark') || wanted.includes('business');
    const isBanner = !!(card && card.style.height && card.style.height.includes('120'));
    let h = isBig ? '38px' : '30px';
    if (isBanner) h = isBig ? '26px' : '22px';
    logoImg.style.height = h;
    logoImg.style.width = 'auto';
  }
}

// === Custom Background Image Support for Creator Tool ===

function handleCreatorBgUpload(input) {
  if (!input.files || !input.files[0]) return;

  const file = input.files[0];
  const reader = new FileReader();
  reader.onload = function(e) {
    creatorCustomBgUrl = e.target.result;
    const card = document.getElementById('creatorPreviewCard');
    if (card) {
      // Optional: auto-switch to a neutral theme label
      const bgSel = document.getElementById('creatorBGInput');
      if (bgSel) bgSel.value = 'midnight'; // visual hint
    }
    updateCreatorCanvas();
  };
  reader.readAsDataURL(file);
}

function clearCreatorBgImage() {
  creatorCustomBgUrl = null;
  const input = document.getElementById('creatorBgImageInput');
  if (input) input.value = '';
  updateCreatorCanvas();
}

function setCreatorBackgroundImage(src) {
  // Use images from Inspiration Gallery or any relative image
  creatorCustomBgUrl = src + '?t=' + Date.now(); // bust cache if needed, but for local files ok
  // Set a theme for contrast handling
  const bgSel = document.getElementById('creatorBGInput');
  if (bgSel) bgSel.value = 'midnight';
  updateCreatorCanvas();
}

function selectCreatorBgTheme(themeValue) {
  // Choosing a theme clears any custom image
  creatorCustomBgUrl = null;
  const input = document.getElementById('creatorBgImageInput');
  if (input) input.value = '';
  // Now let the normal update run with the theme
  updateCreatorCanvas();
}

// Remix template action
function remixTemplate(title, tags, logo) {
  switchTab('creator');
  
  const hInput = document.getElementById('creatorHeadlineInput');
  const sInput = document.getElementById('creatorSubtextInput');
  const logoSelect = document.getElementById('creatorProductLogo');
  const ctaInput = document.getElementById('creatorCTAInput');
  
  if (hInput) hInput.value = title;
  if (sInput) sInput.value = tags;
  if (logoSelect) logoSelect.value = logo || 'logo_wordmark_white.png';
  if (ctaInput) ctaInput.value = 'Get Started →';
  
  updateCreatorCanvas();
  showToast(`Remixed template "${title}" in Creator Tool!`, 'success');
}

// 4. Campaign Library state & functions
state.campaigns = [
  { id: 'cam-1', name: 'Spain Premium Launch', market: 'ES', status: 'Live', views: 124000, ctr: 3.9, conversions: 842, assets: ['ES_Banner_v1.png', 'ES_Video_Script.pdf'] },
  { id: 'cam-2', name: 'UK Metal Card Reveal', market: 'UK', status: 'Live', views: 89000, ctr: 4.2, conversions: 620, assets: ['UK_Metal_Card.png'] },
  { id: 'cam-3', name: 'ES Crypto Cashback', market: 'ES', status: 'Draft', views: 0, ctr: 0.0, conversions: 0, assets: [] }
];

// NOTE: Legacy renderCampaigns kept for reference but overridden later by the professional version below.
// The final function renderCampaigns (with rich cards + support for getCampaigns) is the active one.
function renderCampaigns() {
  // Intentionally empty stub — real implementation defined later in the file using getCampaigns()
  // This prevents old card format from taking over the Campaign Library tab.
}

function setCampaignStatus(camId, status) {
  const camps = getCampaigns();
  const cam = camps.find(c => c.id === camId);
  if (cam) {
    cam.status = status;
    setCampaigns(camps);
    renderCampaigns();
    showToast(`Campaign status updated to ${status}!`, status === 'Approved' ? 'success' : 'warning');
  }
}

function duplicateCampaign(camId) {
  // Legacy support (uses ID) — forwards to new system
  const camps = getCampaigns();
  const cam = camps.find(c => c.id === camId);
  if (cam) {
    const copy = JSON.parse(JSON.stringify(cam));
    copy.id = 'GRV-' + Date.now().toString(36).toUpperCase();
    copy.name = `${cam.name} (Copy)`;
    copy.status = 'Draft';
    copy.views = 0; copy.ctr = 0; copy.conversions = 0;
    copy.assets = Array.isArray(cam.assets) ? [...cam.assets] : [];
    copy.created = new Date().toISOString().split('T')[0];
    camps.unshift(copy);
    setCampaigns(camps);
    renderCampaigns();
    showToast(`Campaign duplicated as ${copy.name}!`, 'success');
  }
}

function exportCampaign(camId) {
  const camps = getCampaigns();
  const cam = camps.find(c => c.id === camId);
  if (cam) {
    const cnt = Array.isArray(cam.assets) ? cam.assets.length : (cam.assets || 0);
    showToast(`Exported campaign: ${cam.name} with ${cnt} assets.`, 'success');
  }
}

function openNewCampaignModal() {
  document.getElementById('newCampaignModal').style.display = 'flex';
}

function closeNewCampaignModal() {
  document.getElementById('newCampaignModal').style.display = 'none';
}

function submitNewCampaign() {
  const name = document.getElementById('campaignNameInput').value;
  const market = document.getElementById('campaignMarketInput').value;
  if (!name.trim()) {
    showToast('Please enter a campaign name.', 'warning');
    return;
  }
  const newCam = {
    id: `cam-${Date.now()}`,
    name: name,
    market: market,
    status: 'Draft',
    views: 0,
    ctr: 0.0,
    conversions: 0,
    assets: []
  };
  state.campaigns.push(newCam);
  renderCampaigns();
  closeNewCampaignModal();
  showToast(`Campaign "${name}" created in ${market} market!`, 'success');
}

// 5. Content Calendar schedule functions
function openScheduleModal(day) {
  document.getElementById('scheduleDayInput').value = day;
  document.getElementById('scheduleModal').style.display = 'flex';
}

function closeScheduleModal() {
  document.getElementById('scheduleModal').style.display = 'none';
}

function submitSchedulePost() {
  const day = parseInt(document.getElementById('scheduleDayInput').value);
  const title = document.getElementById('scheduleTitleInput').value;
  const market = document.getElementById('scheduleMarketInput').value;
  if (!title.trim()) {
    showToast('Please enter a title.', 'warning');
    return;
  }
  
  const cells = document.querySelectorAll('.calendar-cell');
  let targetCell = null;
  cells.forEach(cell => {
    const numDiv = cell.querySelector('.calendar-day-num');
    if (numDiv && parseInt(numDiv.textContent) === day) {
      targetCell = cell;
    }
  });

  if (targetCell) {
    const marketUpper = market.toUpperCase();
    const eventDiv = document.createElement('div');
    eventDiv.className = `calendar-event ${market.toLowerCase()}`;
    eventDiv.onclick = (e) => {
      e.stopPropagation();
      showToast(`${marketUpper} campaign event: ${title}`, 'info');
    };
    const flagMap = {
      UK: '🇬🇧', US: '🇺🇸', ES: '🇪🇸', MX: '🇲🇽', FR: '🇫🇷', DE: '🇩🇪', PT_PT: '🇵🇹', PT_BR: '🇧🇷',
      BG: '🇧🇬', HR: '🇭🇷', CS: '🇨🇿', DA: '🇩🇰', NL: '🇳🇱', EL: '🇬🇷', HU: '🇭🇺', IT: '🇮🇹',
      JA: '🇯🇵', LV: '🇱🇻', LT: '🇱🇹', NO: '🇳🇴', PL: '🇵🇱', RO: '🇷🇴', RU: '🇷🇺', SK: '🇸🇰',
      SV: '🇸🇪', UA: '🇺🇦'
    };
    const flag = flagMap[marketUpper] || '🌍';
    eventDiv.textContent = `${flag} ${title}`;
    targetCell.appendChild(eventDiv);
    closeScheduleModal();
    showToast(`Scheduled post on day ${day}!`, 'success');
  }
}

// 6. Team Workspace assign task selectors
state.teamTasks = [
  { id: 'task-1', text: 'Review Spanish legal compliance changes', priority: 'High Priority', priorityClass: 'badge-orange', assignee: '' },
  { id: 'task-2', text: 'Approve version 2.0 of Audi F1 F1 asset', priority: 'In Review', priorityClass: 'badge-cyan', assignee: '' }
];

function renderTeamTasks() {
  const container = document.getElementById('teamTasksContainer');
  if (!container) return;
  container.innerHTML = state.teamTasks.map(task => {
    return `
      <div style="display:flex; justify-content:space-between; align-items:center; padding:8px; background:rgba(255,255,255,0.01); border:1px solid var(--border-default); border-radius:6px; margin-bottom:8px;">
        <div style="display:flex; flex-direction:column; gap:4px;">
          <span class="text-xs" style="color:var(--text-secondary);">${task.text}</span>
          ${task.assignee ? `<span class="text-xs text-lime">Assigned to: ${task.assignee}</span>` : '<span class="text-xs text-muted">Unassigned</span>'}
        </div>
        <div class="flex gap-xs items-center">
          <span class="badge ${task.priorityClass}">${task.priority}</span>
          <select class="select-field text-xs" style="margin:0; max-width:110px; padding:4px;" onchange="assignTask('${task.id}', this.value)">
            <option value="">Assign...</option>
            <option value="Sarah Jenkins" ${task.assignee === 'Sarah Jenkins' ? 'selected' : ''}>Sarah Jenkins</option>
            <option value="David Miller" ${task.assignee === 'David Miller' ? 'selected' : ''}>David Miller</option>
            <option value="Juan Gomez" ${task.assignee === 'Juan Gomez' ? 'selected' : ''}>Juan Gomez</option>
          </select>
        </div>
      </div>
    `;
  }).join('');
}

function assignTask(taskId, assignee) {
  const task = state.teamTasks.find(t => t.id === taskId);
  if (task) {
    task.assignee = assignee;
    renderTeamTasks();
    if (assignee) {
      showToast(`Task assigned to ${assignee}!`, 'success');
      addCollabFeedEntry(`Sarah assigned "${task.text}" to ${assignee}`);
    } else {
      showToast(`Task unassigned.`, 'info');
    }
  }
}

function addCollabFeedEntry(message) {
  const feed = document.getElementById('collabFeed');
  if (!feed) return;
  const entry = document.createElement('div');
  entry.className = 'text-xs text-secondary';
  entry.style.cssText = 'animation:fadeSlideIn 0.3s ease-out; margin-bottom:8px;';
  entry.innerHTML = `<span class="text-lime font-bold">System</span>: ${message} (Just now)`;
  feed.prepend(entry);
}

function createTeamTask() {
  const input = document.getElementById('newTaskInput');
  const prioritySelect = document.getElementById('newTaskPriority');
  const text = input.value;
  const priority = prioritySelect.value;
  if (!text.trim()) {
    showToast('Please enter task text.', 'warning');
    return;
  }
  
  const priorityClass = priority === 'High Priority' ? 'badge-orange' : priority === 'In Review' ? 'badge-cyan' : 'badge-green';
  const newTask = {
    id: `task-${Date.now()}`,
    text: text,
    priority: priority,
    priorityClass: priorityClass,
    assignee: ''
  };
  state.teamTasks.push(newTask);
  renderTeamTasks();
  input.value = '';
  showToast('New team task created!', 'success');
  addCollabFeedEntry(`New task created: "${text}"`);
}

// 7. AI Agents completed task queue and review panel
state.agentQueue = [];

function assignAndRunAgent(agentName) {
  const card = document.getElementById(`agent-card-${agentName}`);
  const taskInput = document.getElementById(`agent-task-${agentName}`);
  const taskText = taskInput ? taskInput.value : '';
  if (!taskText.trim()) {
    showToast('Please specify a task brief for the agent.', 'warning');
    return;
  }

  const btn = card?.querySelector('.btn');
  if (btn) {
    btn.classList.add('loading');
    btn.disabled = true;
  }

  const logContainer = document.getElementById('agentLog');
  const ai = getEffectiveAI();
  const providerLabel = ai === 'simulated' ? '🧪 Simulated' : ai === 'gemini' ? '✦ Gemini' : ai === 'claude' ? '✦ Claude' : ai === 'chatgpt' ? '✦ ChatGPT' : '✦ Grok xAI';

  if (state.agentLogs.length === 0) {
    logContainer.innerHTML = '';
  }

  const delay = (getEffectiveAI() === 'gemini') ? 2200 : 1500;
  const processingId = `proc-${Date.now()}`;
  logContainer.innerHTML += `
    <div id="${processingId}" class="flex items-center gap-sm" style="padding:8px var(--space-md);color:var(--accent-lime);font-size:0.82rem;animation:fadeSlideIn 0.3s ease-out;">
      <div class="spinner" style="display:block;width:12px;height:12px;border:2px solid transparent;border-top-color:var(--accent-lime);border-radius:50%;animation:spin 0.6s linear infinite;"></div>
      Running ${agentName} agent on: "${taskText}" via ${providerLabel}...
    </div>
  `;
  logContainer.scrollTop = logContainer.scrollHeight;

  setTimeout(() => {
    if (btn) {
      btn.classList.remove('loading');
      btn.disabled = false;
    }
    const procEl = document.getElementById(processingId);
    if (procEl) procEl.remove();

    const timestamp = new Date().toLocaleTimeString();
    const langSelect = document.getElementById(`agent-lang-${agentName}`);
    const lang = langSelect ? langSelect.value : 'ES';

    let output = [];
    if (agentName === 'copywriter') {
      const copyContent = {
        UK: [
          '📝 Generated 3 headline variants for UK market:',
          '   1. "Your money, without borders. Revolut Premium."',
          '   2. "Real cashback. Unlimited transfers."',
          '   3. "The metal that transforms your finances."',
          '✓ All variants passed brand tone check (96% confidence)',
        ],
        US: [
          '📝 Generated 3 headline variants for US market:',
          '   1. "Your money, without borders. Revolut Premium."',
          '   2. "Real cashback. Unlimited transfers."',
          '   3. "The metal that transforms your finances."',
          '✓ All variants passed brand tone check (96% confidence)',
        ],
        ES: [
          '📝 Generated 3 headline variants for ES market:',
          '   1. "Tu dinero, sin fronteras. Revolut Premium."',
          '   2. "Cashback real. Transferencias sin límites."',
          '   3. "El metal que transforma tus finanzas."',
          '✓ All variants passed brand tone check (97% confidence)',
        ],
        MX: [
          '📝 Generated 3 headline variants for MX market:',
          '   1. "Tu dinero, sin fronteras. Revolut Premium."',
          '   2. "Cashback real. Transferencias sin fronteras."',
          '   3. "El metal que revoluciona tus finanzas."',
          '✓ All variants passed brand tone check (96% confidence)',
        ],
        FR: [
          '📝 Generated 3 headline variants for FR market:',
          '   1. "Votre argent, sans frontières. Revolut Premium."',
          '   2. "Du vrai cashback. Transferts illimités."',
          '   3. "Le métal qui transforme vos finances."',
          '✓ All variants passed brand tone check (98% confidence)',
        ],
        DE: [
          '📝 Generated 3 headline variants for DE market:',
          '   1. "Ihr Geld, grenzenlos. Revolut Premium."',
          '   2. "Echtes Cashback. Unbegrenzte Überweisungen."',
          '   3. "Das Metall, das Ihre Finanzen verwandelt."',
          '✓ All variants passed brand tone check (95% confidence)',
        ],
        PT_PT: [
          '📝 Generated 3 headline variants for PT-PT market:',
          '   1. "O seu dinheiro, sem fronteiras. Revolut Premium."',
          '   2. "Cashback real. Transferências ilimitadas."',
          '   3. "O metal que transforma as suas finanças."',
          '✓ All variants passed brand tone check (96% confidence)',
        ],
        PT_BR: [
          '📝 Generated 3 headline variants for PT-BR market:',
          '   1. "Seu dinheiro, sem fronteiras. Revolut Premium."',
          '   2. "Cashback real. Transferências ilimitadas."',
          '   3. "O metal que transforma suas finanças."',
          '✓ All variants passed brand tone check (96% confidence)',
        ],
        PT: [
          '📝 Generated 3 headline variants for PT market:',
          '   1. "Seu dinheiro, sem fronteiras. Revolut Premium."',
          '   2. "Cashback real. Transferências ilimitadas."',
          '   3. "O metal que transforma suas finanças."',
          '✓ All variants passed brand tone check (96% confidence)',
        ],
        BG: [
          '📝 Generated 3 headline variants for BG market:',
          '   1. "Вашите пари, без граници. Revolut Premium."',
          '   2. "Реален кешбек. Неограничени трансфери."',
          '   3. "Металът, който трансформира вашите финанси."',
          '✓ All variants passed brand tone check (94% confidence)',
        ],
        HR: [
          '📝 Generated 3 headline variants for HR market:',
          '   1. "Vaš novac, bez granica. Revolut Premium."',
          '   2. "Stvarni povrat novca. Neograničeni prijenosi."',
          '   3. "Metal koji transformira vaše financije."',
          '✓ All variants passed brand tone check (95% confidence)',
        ],
        CS: [
          '📝 Generated 3 headline variants for CS market:',
          '   1. "Vaše peníze bez hranic. Revolut Premium."',
          '   2. "Skutečný cashback. Neomezené převody."',
          '   3. "Kov, který promění vaše finance."',
          '✓ All variants passed brand tone check (95% confidence)',
        ],
        DA: [
          '📝 Generated 3 headline variants for DA market:',
          '   1. "Dine penge uden grænser. Revolut Premium."',
          '   2. "Rigtig cashback. Ubegrænsede overførsler."',
          '   3. "Metallet, der forandrer din økonomi."',
          '✓ All variants passed brand tone check (95% confidence)',
        ],
        NL: [
          '📝 Generated 3 headline variants for NL market:',
          '   1. "Je geld, zonder grenzen. Revolut Premium."',
          '   2. "Echte cashback. Onbeperkte overschrijvingen."',
          '   3. "Het metaal dat je financiën transformeert."',
          '✓ All variants passed brand tone check (96% confidence)',
        ],
        EL: [
          '📝 Generated 3 headline variants for EL market:',
          '   1. "Τα χρήματά σας, χωρίς σύνορα. Revolut Premium."',
          '   2. "Πραγματικό cashback. Απεριόριστες μεταφορές."',
          '   3. "Το μέταλλο που μεταμορφώνει τα οικονομικά σας."',
          '✓ All variants passed brand tone check (94% confidence)',
        ],
        HU: [
          '📝 Generated 3 headline variants for HU market:',
          '   1. "Pénze határok nélkül. Revolut Premium."',
          '   2. "Valódi cashback. Korlátlan utalások."',
          '   3. "A fém, amely átalakítja a pénzügyeit."',
          '✓ All variants passed brand tone check (94% confidence)',
        ],
        IT: [
          '📝 Generated 3 headline variants for IT market:',
          '   1. "Il tuo denaro, senza frontiere. Revolut Premium."',
          '   2. "Cashback reale. Trasferimenti illimitati."',
          '   3. "Il metallo che trasforma le tue finanze."',
          '✓ All variants passed brand tone check (97% confidence)',
        ],
        JA: [
          '📝 Generated 3 headline variants for JA market:',
          '   1. "境界のないあなたのお金。Revolut Premium。"',
          '   2. "リアルキャッシュバック。手数料無料の海外送金。"',
          '   3. "あなたの金融を変革するメタルカード。"',
          '✓ All variants passed brand tone check (93% confidence)',
        ],
        LV: [
          '📝 Generated 3 headline variants for LV market:',
          '   1. "Jūsu nauda bez robežām. Revolut Premium."',
          '   2. "Īsts naudas atmaksas bonuss. Neierobežoti pārskaitījumi."',
          '   3. "Metāls, kas maina jūsu finanses."',
          '✓ All variants passed brand tone check (94% confidence)',
        ],
        LT: [
          '📝 Generated 3 headline variants for LT market:',
          '   1. "Jūsų pinigai be sienų. Revolut Premium."',
          '   2. "Tikras pinigų grąžinimas. Neriboti pervedimai."',
          '   3. "Metalinis dizainas, kuris keičia jūsų finansus."',
          '✓ All variants passed brand tone check (94% confidence)',
        ],
        NO: [
          '📝 Generated 3 headline variants for NO market:',
          '   1. "Dine penger, uten grenser. Revolut Premium."',
          '   2. "Ekte cashback. Ubegrensede overføringer."',
          '   3. "Metallet som forvandler din økonomi."',
          '✓ All variants passed brand tone check (96% confidence)',
        ],
        PL: [
          '📝 Generated 3 headline variants for PL market:',
          '   1. "Twoje pieniądze bez granic. Revolut Premium."',
          '   2. "Prawdziwy cashback. Przelewy bez limitu."',
          '   3. "Metal, który odmienia Twoje finanse."',
          '✓ All variants passed brand tone check (97% confidence)',
        ],
        RO: [
          '📝 Generated 3 headline variants for RO market:',
          '   1. "Banii tăi, fără frontiere. Revolut Premium."',
          '   2. "Cashback real. Transferuri nelimitate."',
          '   3. "Metalul care îți transformă finanțele."',
          '✓ All variants passed brand tone check (95% confidence)',
        ],
        RU: [
          '📝 Generated 3 headline variants for RU market:',
          '   1. "Ваши деньги без границ. Revolut Premium."',
          '   2. "Реальный кэшбэк. Безлимитные переводы."',
          '   3. "Металл, который меняет ваши финансы."',
          '✓ All variants passed brand tone check (95% confidence)',
        ],
        SK: [
          '📝 Generated 3 headline variants for SK market:',
          '   1. "Vaše peniaze bez hraníc. Revolut Premium."',
          '   2. "Skutočný cashback. Neobmedzené prevody."',
          '   3. "Kov, ktorý premení vaše financie."',
          '✓ All variants passed brand tone check (95% confidence)',
        ],
        SV: [
          '📝 Generated 3 headline variants for SV market:',
          '   1. "Dina pengar, utan gränser. Revolut Premium."',
          '   2. "Riktig cashback. Obegränsade överföringar."',
          '   3. "Metallen som förvandlar din ekonomi."',
          '✓ All variants passed brand tone check (96% confidence)',
        ],
        UA: [
          '📝 Generated 3 headline variants for UA market:',
          '   1. "Ваші гроші без кордонів. Revolut Premium."',
          '   2. "Реальний кешбек. Безлімітні перекази."',
          '   3. "Метал, який трансформує ваші фінанси."',
          '✓ All variants passed brand tone check (94% confidence)',
        ]
      };
      output = copyContent[lang] || copyContent['UK'];
    } else if (agentName === 'compliance') {
      const regulatoryBodies = {
        UK: 'Financial Conduct Authority (FCA) directives',
        US: 'Consumer Financial Protection Bureau (CFPB) & SEC rules',
        ES: 'Banco de España (BdE) and CNMV guidelines',
        MX: 'Comisión Nacional Bancaria y de Valores (CNBV) regulations',
        FR: 'Autorité de Contrôle Prudentiel et de Résolution (ACPR) rules',
        DE: 'Bundesanstalt für Finanzdienstleistungsaufsicht (BaFin) standards',
        PT_PT: 'Banco de Portugal (BdP) guidelines',
        PT_BR: 'Banco Central do Brasil (BCB) and CVM regulations',
        PT: 'Banco de Portugal (BdP) guidelines',
        BG: 'Bulgarian National Bank (BNB) and FSC rules',
        HR: 'Croatian National Bank (HNB) and HANFA regulations',
        CS: 'Czech National Bank (ČNB) standards',
        DA: 'Danish Financial Supervisory Authority (Finanstilsynet) directives',
        NL: 'Authority for the Financial Markets (AFM) and DNB guidelines',
        EL: 'Bank of Greece and HCMC rules',
        HU: 'Magyar Nemzeti Bank (MNB) regulations',
        IT: 'Banca d\'Italia regulatory rules',
        JA: 'Financial Services Agency (FSA) and Kanto Finance Bureau rules',
        LV: 'Latvijas Banka (Bank of Latvia) standards',
        LT: 'Bank of Lithuania (Lietuvos bankas) guidelines',
        NO: 'Finanstilsynet (Financial Supervisory Authority of Norway) directives',
        PL: 'Polish Financial Supervision Authority (KNF) guidelines',
        RO: 'National Bank of Romania (BNR) and ASF guidelines',
        RU: 'Central Bank of the Russian Federation (CBR) directives',
        SK: 'National Bank of Slovakia (NBS) standards',
        SV: 'Swedish Financial Supervisory Authority (Finansinspektionen) rules',
        UA: 'National Bank of Ukraine (NBU) regulations'
      };
      const regBody = regulatoryBodies[lang] || regulatoryBodies['UK'];
      output = [
        `🛡️ Compliance scan completed for target market: ${lang}`,
        `   ✓ Disclaimers verified against ${regBody}`,
        '   ✓ No prohibited claims or misleading statements detected',
        '   ✓ Font contrast checks passed WCAG AA requirements',
        '   ✓ Brand guidelines v3.2 checked for typography & logos',
        `📊 Overall compliance score for ${lang}: 98.6%`
      ];
    } else if (agentName === 'localiser') {
      const locales = {
        UK: 'British English - local spelling (colour/optimise) and FCA compliance verified',
        US: 'American English - local spelling (color/optimize) and SEC compliance verified',
        ES: 'Spanish (Castilian) - informal "tú" tone adaptation applied',
        MX: 'Spanish (Mexico) - localized Latin American vocabulary and MX regulatory check applied',
        FR: 'French (France) - ACPR disclaimer translated and verified',
        DE: 'German (Germany) - formal/informal cultural check applied',
        PT_PT: 'Portuguese (Portugal) - European Portuguese tone and BdP compliance check applied',
        PT_BR: 'Portuguese (Brazil) - informal tone and localized vocabulary check applied',
        PT: 'Portuguese (Portugal) - BdP compliance check applied',
        BG: 'Bulgarian (Bulgaria) - Cyrillic typography check and local phrasing applied',
        HR: 'Croatian (Croatia) - local context check and proper orthography applied',
        CS: 'Czech (Czechia) - declension and target audience tone checks applied',
        DA: 'Danish (Denmark) - minimalist Nordic tone and style check applied',
        NL: 'Dutch (Netherlands) - natural sounding modern Dutch phrasing verified',
        EL: 'Greek (Greece) - Greek character set encoding and terminology verified',
        HU: 'Hungarian (Hungary) - agglutinative word structures check applied',
        IT: 'Italian (Italy) - translation tone adaptation applied',
        JA: 'Japanese (Japan) - Keigo level check and Katakana brand spelling verified',
        LV: 'Latvian (Latvia) - proper endings and local compliance checks applied',
        LT: 'Lithuanian (Lithuania) - grammatical checks and local compliance verified',
        NO: 'Norwegian (Norway) - Bokmål standards and style guidelines verified',
        PL: 'Polish (Poland) - polite tone adjustments and KNF compliance verified',
        RO: 'Romanian (Romania) - proper diacritics check and tone adaptation applied',
        RU: 'Russian (Russia) - proper grammatical case forms and brand terminology verified',
        SK: 'Slovakian (Slovakia) - Slovak diacritics and target market styling verified',
        SV: 'Swedish (Sweden) - Swedish spelling and clean modern brand tone verified',
        UA: 'Ukrainian (Ukraine) - Cyrillic font compatibility and gender-neutral phrasing verified'
      };
      output = [
        `🌍 Localisation complete for market: ${lang}`,
        `   ✓ ${locales[lang] || 'Localization successful'}`,
        `✓ All copy aligned with local regulatory rules for ${lang}`,
      ];
    } else if (agentName === 'analytics') {
      output = [
        `📊 Performance prediction analysis for ${lang} market:`,
        '   Predicted CTR: 4.5% (benchmark: 3.5%)',
        '   Predicted engagement rate: 7.2%',
        `   Recommended optimisation: Prioritise ${lang} specific lifestyle benefits`,
        '⚡ A/B test recommendation: Test local custom CTA buttons'
      ];
    } else if (agentName === 'designer') {
      output = [
        `🎨 Created visual composition (1080×1080) for ${lang}:`,
        '   - Background: Premium brand gradient theme',
        '   - Typography: Brand approved sans-serif font',
        `   - Visuals: On-brand assets aligned with ${lang} requirements`,
        '✓ Layout passes brand accessibility contrast checks'
      ];
    } else {
      output = [
        `🧠 Orchestration cycle complete for ${lang} market:`,
        `   1. Copywriter Agent → ${lang} copy variants generated ✓`,
        `   2. Visual Designer Agent → ${lang} composition created ✓`,
        `   3. Compliance Agent → ${lang} regulatory checks passed ✓`,
        `   4. Localiser Agent → ${lang} localization check complete ✓`,
        `   5. Performance Agent → CTR prediction: 4.5% for ${lang} ✓`,
        `📦 Pipeline complete — assets ready for ${lang} deployment`
      ];
    }
    
    logContainer.innerHTML += `
      <div style="padding:var(--space-sm) var(--space-md);border-bottom:1px solid var(--border-default);animation:fadeSlideIn 0.3s ease-out;">
        <div class="flex items-center justify-between mb-sm">
          <span class="badge badge-${agentName === 'compliance' ? 'purple' : agentName === 'copywriter' ? 'lime' : agentName === 'designer' ? 'blue' : agentName === 'localiser' ? 'cyan' : agentName === 'analytics' ? 'orange' : 'red'}">${agentName}</span>
          <span class="text-xs text-muted">${timestamp} • ${providerLabel}</span>
        </div>
        <div class="text-xs font-bold text-secondary mb-xs">Task: ${taskText}</div>
        <pre style="font-family:'JetBrains Mono',monospace;font-size:0.75rem;color:var(--text-secondary);white-space:pre-wrap;line-height:1.6;margin:0;">${output.join('\n')}</pre>
      </div>
    `;
    logContainer.scrollTop = logContainer.scrollHeight;

    const queueId = `q-${Date.now()}`;
    const cleanOutputText = output.join('\n');
    state.agentQueue.push({
      id: queueId,
      agentName: agentName,
      task: taskText,
      outputText: cleanOutputText,
      timestamp: timestamp
    });
    renderAgentQueue();
    showToast(`🤖 ${agentName} agent completed task for ${lang}! Added to Review Queue.`, 'success');
  }, delay);
}

function renderAgentQueue() {
  const container = document.getElementById('agentCompletedQueue');
  if (!container) return;
  if (state.agentQueue.length === 0) {
    container.innerHTML = `
      <div class="text-sm text-muted" style="padding:40px; text-align:center;">
        No items in completed review queue. Run agents to see results here.
      </div>
    `;
    return;
  }
  
  container.innerHTML = state.agentQueue.map(item => {
    return `
      <div class="card mt-sm" style="padding:12px; border-left:4px solid var(--accent-${item.agentName === 'compliance' ? 'purple' : item.agentName === 'copywriter' ? 'teal' : item.agentName === 'designer' ? 'blue' : item.agentName === 'localiser' ? 'cyan' : item.agentName === 'analytics' ? 'orange' : 'red'}); background:rgba(255,255,255,0.01); animation:fadeSlideIn 0.3s ease-out; margin-bottom:12px;">
        <div class="flex justify-between items-center mb-sm">
          <span class="badge badge-sm badge-secondary">${item.agentName.toUpperCase()}</span>
          <span class="text-xs text-muted">${item.timestamp}</span>
        </div>
        <div class="text-xs font-bold text-secondary mb-xs">Task: ${item.task}</div>
        <div style="background:rgba(0,0,0,0.2); padding:8px; border-radius:4px; margin-bottom:8px; max-height:120px; overflow-y:auto;">
          <pre style="font-family:monospace; font-size:0.7rem; color:var(--text-secondary); margin:0; white-space:pre-wrap;">${item.outputText}</pre>
        </div>
        <div class="flex gap-xs flex-wrap">
          <button class="btn btn-xs btn-primary" onclick="reviewAgentAction('${item.id}', 'approve')" style="font-size:0.7rem; padding:4px 8px;">✓ Approve</button>
          <button class="btn btn-xs btn-outline btn-orange" onclick="reviewAgentAction('${item.id}', 'reject')" style="font-size:0.7rem; padding:4px 8px;">✗ Reject</button>
          <button class="btn btn-xs btn-secondary" onclick="reviewAgentAction('${item.id}', 'feed')" style="font-size:0.7rem; padding:4px 8px;">✂️ Feed Creator</button>
          <button class="btn btn-xs btn-outline" onclick="reviewAgentAction('${item.id}', 'save')" style="font-size:0.7rem; padding:4px 8px;">💾 Save</button>
        </div>
      </div>
    `;
  }).join('');
}

function reviewAgentAction(itemId, action) {
  const item = state.agentQueue.find(i => i.id === itemId);
  if (!item) return;

  if (action === 'approve') {
    showToast(`✓ Approved ${item.agentName} output. Transferred to Campaign Library!`, 'success');
    if (state.campaigns && state.campaigns.length > 0) {
      state.campaigns[0].assets.push(`${item.agentName.toUpperCase()}_output.txt`);
      renderCampaigns();
    }
    state.agentQueue = state.agentQueue.filter(i => i.id !== itemId);
    renderAgentQueue();
  } else if (action === 'reject') {
    showToast(`✗ Output rejected. Agent queued to refine content.`, 'warning');
    state.agentQueue = state.agentQueue.filter(i => i.id !== itemId);
    renderAgentQueue();
  } else if (action === 'feed') {
    const creatorPrompt = document.getElementById('creatorPrompt');
    if (creatorPrompt) {
      creatorPrompt.value = item.outputText;
    }
    if (item.agentName === 'copywriter') {
      const hInput = document.getElementById('creatorHeadlineInput');
      const sInput = document.getElementById('creatorSubtextInput');
      if (hInput) hInput.value = 'Tu dinero, sin fronteras';
      if (sInput) sInput.value = 'Cashback real • Transferencias sin límites';
      updateCreatorCanvas();
    }
    showToast(`✂️ Transferred output to Creator Tool! Switched tab.`, 'success');
    switchTab('creator');
  } else if (action === 'save') {
    const textToSave = `Task: ${item.task}\nOutput:\n${item.outputText}`;
    saveArbitraryPrompt(textToSave);
  }
}

function saveArbitraryPrompt(text) {
  const saved = localStorage.getItem('savedPrompts');
  let prompts = saved ? JSON.parse(saved) : [];
  if (prompts.length >= 50) {
    showToast('Library full (50/50). Clear some prompts first.', 'warning');
    return;
  }
  prompts.push({
    id: `prompt-${Date.now()}`,
    text: text,
    timestamp: new Date().toLocaleString()
  });
  localStorage.setItem('savedPrompts', JSON.stringify(prompts));
  updateSavedPromptsUI();
  showToast('💾 Saved output to Saved Prompts Library!', 'success');
}

// 8. System Health service status monitoring latency updates
function updateServiceLatencies() {
  const gateway = document.getElementById('srv-lat-gateway');
  const gen = document.getElementById('srv-lat-generation');
  const comp = document.getElementById('srv-lat-compliance');
  const loc = document.getElementById('srv-lat-localisation');
  const db = document.getElementById('srv-lat-database');

  if (gateway) gateway.textContent = (35 + Math.floor(Math.random() * 15)) + 'ms';
  if (gen) gen.textContent = (1.1 + (Math.random() * 0.3)).toFixed(2) + 's';
  if (comp) comp.textContent = (160 + Math.floor(Math.random() * 40)) + 'ms';
  if (loc) loc.textContent = (180 + Math.floor(Math.random() * 50)) + 'ms';
  if (db) db.textContent = (8 + Math.floor(Math.random() * 8)) + 'ms';
}
setInterval(updateServiceLatencies, 3000);

// ═══════════════════════════════════════════
// TARGET MARKETS • FOCUS MODE
// ═══════════════════════════════════════════

const targetMarketsData = [
  // Tier 1 — Core (highest customers & full features)
  { code: 'UK', name: 'United Kingdom', flag: '🇬🇧', tier: 'core', customers: '13M', customersNum: 13000000, growth: 18, priority: 97, tam: 95, regulatory: 'green', competition: 'High', languages: ['English'], currency: 'GBP', regBody: 'FCA', campaigns: 24, compliance: 99.1, continent: 'Europe' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸', tier: 'core', customers: '6M', customersNum: 6000000, growth: 42, priority: 95, tam: 88, regulatory: 'green', competition: 'Medium', languages: ['Spanish (ES)'], currency: 'EUR', regBody: 'BdE / CNMV', campaigns: 18, compliance: 98.7, continent: 'Europe' },
  { code: 'FR', name: 'France', flag: '🇫🇷', tier: 'core', customers: '5M', customersNum: 5000000, growth: 38, priority: 94, tam: 90, regulatory: 'green', competition: 'High', languages: ['French'], currency: 'EUR', regBody: 'ACPR / AMF', campaigns: 16, compliance: 98.9, continent: 'Europe' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', tier: 'core', customers: '3.5M', customersNum: 3500000, growth: 35, priority: 93, tam: 92, regulatory: 'green', competition: 'High', languages: ['German'], currency: 'EUR', regBody: 'BaFin', campaigns: 14, compliance: 99.2, continent: 'Europe' },
  { code: 'IE', name: 'Ireland', flag: '🇮🇪', tier: 'core', customers: '2.8M', customersNum: 2800000, growth: 25, priority: 90, tam: 72, regulatory: 'green', competition: 'Medium', languages: ['English'], currency: 'EUR', regBody: 'CBI', campaigns: 8, compliance: 99.0, continent: 'Europe' },
  { code: 'PL', name: 'Poland', flag: '🇵🇱', tier: 'core', customers: '2.5M', customersNum: 2500000, growth: 45, priority: 91, tam: 78, regulatory: 'green', competition: 'Medium', languages: ['Polish'], currency: 'PLN', regBody: 'KNF', campaigns: 10, compliance: 98.4, continent: 'Europe' },
  { code: 'RO', name: 'Romania', flag: '🇷🇴', tier: 'core', customers: '2.2M', customersNum: 2200000, growth: 52, priority: 89, tam: 68, regulatory: 'green', competition: 'Low', languages: ['Romanian'], currency: 'RON', regBody: 'BNR / ASF', campaigns: 7, compliance: 97.8, continent: 'Europe' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹', tier: 'core', customers: '2M', customersNum: 2000000, growth: 40, priority: 92, tam: 86, regulatory: 'green', competition: 'High', languages: ['Italian'], currency: 'EUR', regBody: 'Consob / BdI', campaigns: 12, compliance: 98.5, continent: 'Europe' },
  { code: 'PT_PT', name: 'Portugal', flag: '🇵🇹', tier: 'core', customers: '1.8M', customersNum: 1800000, growth: 48, priority: 88, tam: 65, regulatory: 'green', competition: 'Medium', languages: ['Portuguese (PT-PT)'], currency: 'EUR', regBody: 'BdP / CMVM', campaigns: 6, compliance: 98.2, continent: 'Europe' },

  // Tier 2 — Growth (strong traction, scaling)
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱', tier: 'growth', customers: '1.2M', customersNum: 1200000, growth: 30, priority: 85, tam: 80, regulatory: 'green', competition: 'High', languages: ['Dutch'], currency: 'EUR', regBody: 'DNB / AFM', campaigns: 5, compliance: 98.8, continent: 'Europe' },
  { code: 'BG', name: 'Bulgaria', flag: '🇧🇬', tier: 'growth', customers: '1.1M', customersNum: 1100000, growth: 55, priority: 83, tam: 55, regulatory: 'green', competition: 'Low', languages: ['Bulgarian'], currency: 'BGN', regBody: 'BNB / FSC', campaigns: 4, compliance: 97.5, continent: 'Europe' },
  { code: 'EL', name: 'Greece', flag: '🇬🇷', tier: 'growth', customers: '900K', customersNum: 900000, growth: 50, priority: 82, tam: 58, regulatory: 'green', competition: 'Low', languages: ['Greek'], currency: 'EUR', regBody: 'BoG / HCMC', campaigns: 4, compliance: 97.9, continent: 'Europe' },
  { code: 'HU', name: 'Hungary', flag: '🇭🇺', tier: 'growth', customers: '850K', customersNum: 850000, growth: 47, priority: 81, tam: 60, regulatory: 'green', competition: 'Medium', languages: ['Hungarian'], currency: 'HUF', regBody: 'MNB', campaigns: 3, compliance: 97.6, continent: 'Europe' },
  { code: 'CS', name: 'Czech Republic', flag: '🇨🇿', tier: 'growth', customers: '800K', customersNum: 800000, growth: 38, priority: 80, tam: 62, regulatory: 'green', competition: 'Medium', languages: ['Czech'], currency: 'CZK', regBody: 'CNB', campaigns: 4, compliance: 98.0, continent: 'Europe' },
  { code: 'SV', name: 'Sweden', flag: '🇸🇪', tier: 'growth', customers: '750K', customersNum: 750000, growth: 28, priority: 79, tam: 70, regulatory: 'green', competition: 'High', languages: ['Swedish'], currency: 'SEK', regBody: 'Finansinspektionen', campaigns: 3, compliance: 99.0, continent: 'Europe' },
  { code: 'DA', name: 'Denmark', flag: '🇩🇰', tier: 'growth', customers: '600K', customersNum: 600000, growth: 26, priority: 78, tam: 68, regulatory: 'green', competition: 'High', languages: ['Danish'], currency: 'DKK', regBody: 'Finanstilsynet', campaigns: 3, compliance: 99.1, continent: 'Europe' },
  { code: 'HR', name: 'Croatia', flag: '🇭🇷', tier: 'growth', customers: '500K', customersNum: 500000, growth: 58, priority: 77, tam: 45, regulatory: 'green', competition: 'Low', languages: ['Croatian'], currency: 'EUR', regBody: 'HNB / HANFA', campaigns: 2, compliance: 97.3, continent: 'Europe' },
  { code: 'NO', name: 'Norway', flag: '🇳🇴', tier: 'growth', customers: '480K', customersNum: 480000, growth: 24, priority: 76, tam: 66, regulatory: 'green', competition: 'High', languages: ['Norwegian'], currency: 'NOK', regBody: 'Finanstilsynet', campaigns: 2, compliance: 99.2, continent: 'Europe' },
  { code: 'SK', name: 'Slovakia', flag: '🇸🇰', tier: 'growth', customers: '450K', customersNum: 450000, growth: 42, priority: 75, tam: 48, regulatory: 'green', competition: 'Low', languages: ['Slovak'], currency: 'EUR', regBody: 'NBS', campaigns: 2, compliance: 97.8, continent: 'Europe' },
  { code: 'LT', name: 'Lithuania', flag: '🇱🇹', tier: 'growth', customers: '420K', customersNum: 420000, growth: 35, priority: 74, tam: 40, regulatory: 'green', competition: 'Low', languages: ['Lithuanian'], currency: 'EUR', regBody: 'LB', campaigns: 2, compliance: 98.1, continent: 'Europe' },
  { code: 'LV', name: 'Latvia', flag: '🇱🇻', tier: 'growth', customers: '350K', customersNum: 350000, growth: 33, priority: 73, tam: 38, regulatory: 'green', competition: 'Low', languages: ['Latvian'], currency: 'EUR', regBody: 'FKTK', campaigns: 2, compliance: 98.0, continent: 'Europe' },

  // Tier 3 — Expansion (recently launched or early stage)
  { code: 'US', name: 'United States', flag: '🇺🇸', tier: 'expansion', customers: '1M', customersNum: 1000000, growth: 65, priority: 96, tam: 98, regulatory: 'amber', competition: 'Very High', languages: ['English'], currency: 'USD', regBody: 'OCC / FinCEN', campaigns: 8, compliance: 96.5, continent: 'North America' },
  { code: 'PT_BR', name: 'Brazil', flag: '🇧🇷', tier: 'expansion', customers: '800K', customersNum: 800000, growth: 72, priority: 87, tam: 85, regulatory: 'amber', competition: 'High', languages: ['Portuguese (PT-BR)'], currency: 'BRL', regBody: 'BCB / CVM', campaigns: 5, compliance: 96.0, continent: 'South America' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽', tier: 'expansion', customers: '500K', customersNum: 500000, growth: 68, priority: 84, tam: 82, regulatory: 'amber', competition: 'Medium', languages: ['Spanish (MX)'], currency: 'MXN', regBody: 'CNBV / Banxico', campaigns: 4, compliance: 95.8, continent: 'North America' },
  { code: 'JA', name: 'Japan', flag: '🇯🇵', tier: 'expansion', customers: '300K', customersNum: 300000, growth: 45, priority: 86, tam: 90, regulatory: 'amber', competition: 'Very High', languages: ['Japanese'], currency: 'JPY', regBody: 'FSA / JFSA', campaigns: 3, compliance: 97.5, continent: 'Asia' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', tier: 'expansion', customers: '250K', customersNum: 250000, growth: 55, priority: 82, tam: 75, regulatory: 'green', competition: 'High', languages: ['English'], currency: 'AUD', regBody: 'APRA / ASIC', campaigns: 3, compliance: 97.8, continent: 'Oceania' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', tier: 'expansion', customers: '180K', customersNum: 180000, growth: 60, priority: 80, tam: 62, regulatory: 'green', competition: 'High', languages: ['English'], currency: 'SGD', regBody: 'MAS', campaigns: 2, compliance: 98.5, continent: 'Asia' },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿', tier: 'expansion', customers: '120K', customersNum: 120000, growth: 48, priority: 72, tam: 45, regulatory: 'green', competition: 'Medium', languages: ['English'], currency: 'NZD', regBody: 'RBNZ / FMA', campaigns: 1, compliance: 98.2, continent: 'Oceania' },

  // Pipeline (announced or strategic)
  { code: 'IN', name: 'India', flag: '🇮🇳', tier: 'pipeline', customers: '—', customersNum: 0, growth: 0, priority: 92, tam: 97, regulatory: 'red', competition: 'Very High', languages: ['English', 'Hindi'], currency: 'INR', regBody: 'RBI / SEBI', campaigns: 0, compliance: 0, continent: 'Asia' },
  { code: 'AE', name: 'UAE', flag: '🇦🇪', tier: 'pipeline', customers: '—', customersNum: 0, growth: 0, priority: 85, tam: 72, regulatory: 'amber', competition: 'Medium', languages: ['English', 'Arabic'], currency: 'AED', regBody: 'CBUAE / SCA', campaigns: 0, compliance: 0, continent: 'Middle East' },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦', tier: 'pipeline', customers: '—', customersNum: 0, growth: 0, priority: 83, tam: 70, regulatory: 'red', competition: 'Medium', languages: ['Arabic'], currency: 'SAR', regBody: 'SAMA / CMA', campaigns: 0, compliance: 0, continent: 'Middle East' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷', tier: 'pipeline', customers: '—', customersNum: 0, growth: 0, priority: 84, tam: 78, regulatory: 'red', competition: 'Very High', languages: ['Korean'], currency: 'KRW', regBody: 'FSC / FSS', campaigns: 0, compliance: 0, continent: 'Asia' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦', tier: 'pipeline', customers: '—', customersNum: 0, growth: 0, priority: 78, tam: 65, regulatory: 'amber', competition: 'Medium', languages: ['English'], currency: 'ZAR', regBody: 'SARB / FSCA', campaigns: 0, compliance: 0, continent: 'Africa' },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬', tier: 'pipeline', customers: '—', customersNum: 0, growth: 0, priority: 76, tam: 72, regulatory: 'red', competition: 'Medium', languages: ['English'], currency: 'NGN', regBody: 'CBN / SEC', campaigns: 0, compliance: 0, continent: 'Africa' },
  { code: 'EG', name: 'Egypt', flag: '🇪🇬', tier: 'pipeline', customers: '—', customersNum: 0, growth: 0, priority: 74, tam: 68, regulatory: 'red', competition: 'Low', languages: ['Arabic'], currency: 'EGP', regBody: 'CBE / FRA', campaigns: 0, compliance: 0, continent: 'Africa' },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭', tier: 'pipeline', customers: '—', customersNum: 0, growth: 0, priority: 73, tam: 62, regulatory: 'amber', competition: 'Medium', languages: ['Thai'], currency: 'THB', regBody: 'BoT / SEC', campaigns: 0, compliance: 0, continent: 'Asia' },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭', tier: 'pipeline', customers: '—', customersNum: 0, growth: 0, priority: 72, tam: 65, regulatory: 'amber', competition: 'Medium', languages: ['English', 'Filipino'], currency: 'PHP', regBody: 'BSP / SEC', campaigns: 0, compliance: 0, continent: 'Asia' },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳', tier: 'pipeline', customers: '—', customersNum: 0, growth: 0, priority: 71, tam: 60, regulatory: 'red', competition: 'Low', languages: ['Vietnamese'], currency: 'VND', regBody: 'SBV / SSC', campaigns: 0, compliance: 0, continent: 'Asia' },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴', tier: 'pipeline', customers: '—', customersNum: 0, growth: 0, priority: 70, tam: 58, regulatory: 'amber', competition: 'Medium', languages: ['Spanish (CO)'], currency: 'COP', regBody: 'SFC / BanRep', campaigns: 0, compliance: 0, continent: 'South America' },
  { code: 'CL', name: 'Chile', flag: '🇨🇱', tier: 'pipeline', customers: '—', customersNum: 0, growth: 0, priority: 69, tam: 52, regulatory: 'amber', competition: 'Medium', languages: ['Spanish (CL)'], currency: 'CLP', regBody: 'CMF / BCCh', campaigns: 0, compliance: 0, continent: 'South America' },
  { code: 'UA', name: 'Ukraine', flag: '🇺🇦', tier: 'pipeline', customers: '—', customersNum: 0, growth: 0, priority: 68, tam: 50, regulatory: 'red', competition: 'Low', languages: ['Ukrainian'], currency: 'UAH', regBody: 'NBU / NSSMC', campaigns: 0, compliance: 0, continent: 'Europe' },
  { code: 'RU', name: 'Russia', flag: '🇷🇺', tier: 'pipeline', customers: '—', customersNum: 0, growth: 0, priority: 40, tam: 80, regulatory: 'red', competition: 'High', languages: ['Russian'], currency: 'RUB', regBody: 'CBR', campaigns: 0, compliance: 0, continent: 'Europe' },
];

// Current filter/sort state
let tmCurrentFilter = 'all';
let tmCurrentSort = 'priority';

// ── Tier Config ──
const tierConfig = {
  core: { label: 'Tier 1 — Core', badge: 'badge-lime', color: '#a3e635', icon: '🏆' },
  growth: { label: 'Tier 2 — Growth', badge: 'badge-cyan', color: '#22d3ee', icon: '📈' },
  expansion: { label: 'Tier 3 — Expansion', badge: 'badge-purple', color: '#a78bfa', icon: '🌱' },
  pipeline: { label: 'Pipeline', badge: 'badge-orange', color: '#fbbf24', icon: '🔮' }
};

// ── Render Market Cards ──
function renderTargetMarkets() {
  const grid = document.getElementById('tmMarketsGrid');
  if (!grid) return;

  const searchTerm = (document.getElementById('tmSearchInput')?.value || '').toLowerCase();
  let markets = [...targetMarketsData];

  // Filter by tier
  if (tmCurrentFilter !== 'all') {
    markets = markets.filter(m => m.tier === tmCurrentFilter);
  }

  // Filter by search
  if (searchTerm) {
    markets = markets.filter(m =>
      m.name.toLowerCase().includes(searchTerm) ||
      m.code.toLowerCase().includes(searchTerm) ||
      m.continent.toLowerCase().includes(searchTerm) ||
      m.languages.some(l => l.toLowerCase().includes(searchTerm))
    );
  }

  // Sort
  switch (tmCurrentSort) {
    case 'priority': markets.sort((a, b) => b.priority - a.priority); break;
    case 'customers': markets.sort((a, b) => b.customersNum - a.customersNum); break;
    case 'growth': markets.sort((a, b) => b.growth - a.growth); break;
    case 'name': markets.sort((a, b) => a.name.localeCompare(b.name)); break;
  }

  if (markets.length === 0) {
    grid.innerHTML = `<div class="tm-empty-state"><div class="tm-empty-icon">🔍</div><div>No markets found matching your criteria</div></div>`;
    return;
  }

  grid.innerHTML = markets.map(m => {
    const tc = tierConfig[m.tier];
    const regColor = m.regulatory === 'green' ? '#22c55e' : m.regulatory === 'amber' ? '#f59e0b' : '#ef4444';
    const regLabel = m.regulatory === 'green' ? '✓ Approved' : m.regulatory === 'amber' ? '⏳ In Progress' : '⏸ Pending';
    const growthDisplay = m.growth > 0 ? `+${m.growth}%` : '—';
    const isActive = state.activeMarketMode === m.code;

    return `
      <div class="tm-market-card ${isActive ? 'tm-card-active' : ''}" data-tier="${m.tier}" data-code="${m.code}">
        <div class="tm-card-top">
          <div class="tm-card-flag-row">
            <span class="tm-card-flag">${m.flag}</span>
            <div class="tm-card-name-col">
              <div class="tm-card-name">${m.name}</div>
              <div class="tm-card-code">${m.code} • ${m.continent}</div>
            </div>
            <span class="badge ${tc.badge} tm-card-tier">${tc.icon} ${tc.label}</span>
          </div>
        </div>
        <div class="tm-card-metrics">
          <div class="tm-metric">
            <div class="tm-metric-value">${m.customers}</div>
            <div class="tm-metric-label">Customers</div>
          </div>
          <div class="tm-metric">
            <div class="tm-metric-value" style="color:${m.growth > 40 ? '#a3e635' : m.growth > 20 ? '#22d3ee' : '#94a3b8'}">${growthDisplay}</div>
            <div class="tm-metric-label">YoY Growth</div>
          </div>
          <div class="tm-metric">
            <div class="tm-metric-value">${m.campaigns}</div>
            <div class="tm-metric-label">Campaigns</div>
          </div>
          <div class="tm-metric">
            <div class="tm-metric-value" style="color:${regColor}">${regLabel}</div>
            <div class="tm-metric-label">Regulatory</div>
          </div>
        </div>
        <div class="tm-card-details">
          <div class="tm-detail-row">
            <span class="tm-detail-label">Languages:</span>
            <span class="tm-detail-value">${m.languages.join(', ')}</span>
          </div>
          <div class="tm-detail-row">
            <span class="tm-detail-label">Currency:</span>
            <span class="tm-detail-value">${m.currency}</span>
          </div>
          <div class="tm-detail-row">
            <span class="tm-detail-label">Regulator:</span>
            <span class="tm-detail-value">${m.regBody}</span>
          </div>
          ${m.compliance > 0 ? `
          <div class="tm-detail-row">
            <span class="tm-detail-label">Compliance:</span>
            <div class="tm-compliance-bar-wrap">
              <div class="tm-compliance-bar">
                <div class="tm-compliance-fill" style="width:${m.compliance}%; background:${m.compliance > 98 ? '#22c55e' : m.compliance > 95 ? '#f59e0b' : '#ef4444'}"></div>
              </div>
              <span class="tm-compliance-val">${m.compliance}%</span>
            </div>
          </div>` : ''}
        </div>
        <div class="tm-card-actions">
          <button class="btn btn-sm ${isActive ? 'btn-outline' : 'btn-primary'} tm-activate-btn" onclick="activateMarketMode('${m.code}')">
            ${isActive ? '✓ Active' : '🎯 Activate Focus Mode'}
          </button>
          <button class="btn btn-sm btn-secondary" onclick="selectMarketForBrief('${m.code}')">📝 Brief</button>
        </div>
      </div>`;
  }).join('');
}

// ── Filter by Tier ──
function filterMarketTier(btn, tier) {
  document.querySelectorAll('.tm-filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  tmCurrentFilter = tier;
  renderTargetMarkets();
}

// ── Filter by Search ──
function filterTargetMarkets() {
  renderTargetMarkets();
}

// ── Sort Markets ──
function sortTargetMarkets() {
  tmCurrentSort = document.getElementById('tmSortSelect')?.value || 'priority';
  renderTargetMarkets();
}

// ── Activate Market Mode ──
function activateMarketMode(code) {
  const market = targetMarketsData.find(m => m.code === code);
  if (!market) return;

  // If already active, deactivate
  if (state.activeMarketMode === code) {
    deactivateMarketMode();
    return;
  }

  state.activeMarketMode = code;

  // Show the banner
  const banner = document.getElementById('marketModeBanner');
  const flagEl = document.getElementById('marketModeBannerFlag');
  const labelEl = document.getElementById('marketModeBannerLabel');

  if (banner && flagEl && labelEl) {
    flagEl.textContent = market.flag;
    labelEl.textContent = `${market.name} Mode Active — All tools locked to ${market.name} context`;
    banner.style.display = 'block';
    banner.classList.add('tm-banner-animate');
    setTimeout(() => banner.classList.remove('tm-banner-animate'), 600);
  }

  // Auto-select this market in the brief generator
  const briefSelect = document.getElementById('tmBriefMarket');
  if (briefSelect) briefSelect.value = code;

  // Update the main target market dropdown in Asset Generator
  const assetMarketSelect = document.getElementById('targetMarket');
  if (assetMarketSelect) {
    const opt = assetMarketSelect.querySelector(`option[value="${code}"]`);
    if (opt) assetMarketSelect.value = code;
  }

  // Re-render cards to show active state
  renderTargetMarkets();

  showToast(`✅ ${market.flag} ${market.name} Mode Active — All tools now locked to ${market.name} context`, 'success');
}

// ── Deactivate Market Mode ──
function deactivateMarketMode() {
  state.activeMarketMode = null;
  const banner = document.getElementById('marketModeBanner');
  if (banner) banner.style.display = 'none';
  renderTargetMarkets();
  showToast('🌐 Market Mode deactivated — Global context restored', 'info');
}

// ── Select Market for Brief ──
function selectMarketForBrief(code) {
  const briefSelect = document.getElementById('tmBriefMarket');
  if (briefSelect) briefSelect.value = code;

  // Scroll to the brief section
  const briefSection = document.querySelector('.tm-ai-section');
  if (briefSection) briefSection.scrollIntoView({ behavior: 'smooth', block: 'center' });

  const market = targetMarketsData.find(m => m.code === code);
  if (market) {
    showToast(`📝 ${market.flag} ${market.name} selected for campaign brief`, 'info');
  }
}

// ── AI Campaign Brief Generator ──
function generateMarketBrief() {
  const marketCode = document.getElementById('tmBriefMarket')?.value;
  const product = document.getElementById('tmBriefProduct')?.value;
  const objective = document.getElementById('tmBriefObjective')?.value;

  if (!marketCode) {
    showToast('⚠️ Please select a target market first', 'warning');
    return;
  }

  const market = targetMarketsData.find(m => m.code === marketCode);
  if (!market) return;

  const btn = document.getElementById('tmGenerateBriefBtn');
  if (btn) btn.classList.add('loading');

  const productNames = {
    premium: 'Revolut Premium', metal: 'Metal Card', ultra: 'Revolut Ultra',
    business: 'Revolut Business', crypto: 'Crypto Trading', stays: 'Revolut Stays',
    esim: 'Revolut eSIM', savings: 'Savings Vaults'
  };
  const objectiveNames = {
    acquisition: 'User Acquisition', activation: 'Feature Activation',
    retention: 'Retention & Re-engagement', upsell: 'Upsell / Cross-sell',
    brand: 'Brand Awareness'
  };

  setTimeout(() => {
    const briefHTML = generateBriefContent(market, productNames[product], objectiveNames[objective]);
    const output = document.getElementById('tmBriefOutput');
    const body = document.getElementById('tmBriefBody');
    const title = document.getElementById('tmBriefTitle');

    if (title) title.textContent = `${market.flag} ${market.name} — ${productNames[product]} ${objectiveNames[objective]} Brief`;
    if (body) body.innerHTML = briefHTML;
    if (output) output.style.display = 'block';
    if (btn) btn.classList.remove('loading');

    showToast(`🤖 Campaign brief generated for ${market.flag} ${market.name}`, 'success');
  }, 1500);
}

function generateBriefContent(market, product, objective) {
  const lang = market.languages[0] || 'English';
  const isPipeline = market.tier === 'pipeline';

  return `
    <div class="tm-brief-section">
      <div class="tm-brief-section-title">📋 CAMPAIGN OVERVIEW</div>
      <div class="tm-brief-kv"><span>Market:</span><span>${market.flag} ${market.name} (${market.code})</span></div>
      <div class="tm-brief-kv"><span>Product:</span><span>${product}</span></div>
      <div class="tm-brief-kv"><span>Objective:</span><span>${objective}</span></div>
      <div class="tm-brief-kv"><span>Primary Language:</span><span>${lang}</span></div>
      <div class="tm-brief-kv"><span>Currency:</span><span>${market.currency}</span></div>
      <div class="tm-brief-kv"><span>Regulatory Body:</span><span>${market.regBody}</span></div>
    </div>
    <div class="tm-brief-section">
      <div class="tm-brief-section-title">🎯 TARGET AUDIENCE</div>
      <div class="tm-brief-text">
        • <strong>Primary:</strong> ${market.name}-based millennials and Gen-Z (18–35) with mobile-first financial habits<br>
        • <strong>Secondary:</strong> Expatriates, digital nomads, and frequent travellers using multi-currency features<br>
        • <strong>Psychographic:</strong> Tech-savvy, value-conscious, early adopters who prioritise financial control and transparency<br>
        ${isPipeline ? '• <strong>Note:</strong> Pre-launch audience — focus on waitlist sign-ups and brand awareness' : `• <strong>Existing base:</strong> ${market.customers} customers — leverage lookalike modelling`}
      </div>
    </div>
    <div class="tm-brief-section">
      <div class="tm-brief-section-title">🌍 LOCALISATION REQUIREMENTS</div>
      <div class="tm-brief-text">
        • All copy must be in <strong>${lang}</strong> — native-speaker quality, not machine-translated<br>
        • Currency displays in <strong>${market.currency}</strong> with local formatting conventions<br>
        • Comply with <strong>${market.regBody}</strong> advertising regulations<br>
        • Use culturally relevant imagery: local landmarks, diverse representation matching ${market.name} demographics<br>
        • Include mandatory regulatory disclaimers per ${market.regBody} requirements
      </div>
    </div>
    <div class="tm-brief-section">
      <div class="tm-brief-section-title">🎨 CREATIVE DIRECTION</div>
      <div class="tm-brief-text">
        • <strong>Tone:</strong> Confident, modern, locally authentic — not a global template<br>
        • <strong>Visual style:</strong> Revolut's dark premium aesthetic with ${market.name}-specific cultural touches<br>
        • <strong>Formats required:</strong> Social (1080×1080), Stories (1080×1920), Display (728×90), Video (15s)<br>
        • <strong>Key message:</strong> "${product} gives you financial superpowers — right here in ${market.name}"<br>
        • <strong>CTA:</strong> Localised call-to-action in ${lang} driving to ${market.name}-specific landing page
      </div>
    </div>
    <div class="tm-brief-section">
      <div class="tm-brief-section-title">📊 KPIS & MEASUREMENT</div>
      <div class="tm-brief-text">
        • <strong>Primary KPI:</strong> ${objective === 'User Acquisition' ? 'New sign-ups & CPA' : objective === 'Feature Activation' ? 'Feature adoption rate' : objective === 'Retention & Re-engagement' ? 'DAU/MAU ratio & churn reduction' : objective === 'Upsell / Cross-sell' ? 'Upgrade conversion rate' : 'Brand recall & NPS lift'}<br>
        • <strong>Target:</strong> ${market.growth > 0 ? `Beat current ${market.growth}% YoY growth trajectory` : 'Establish baseline metrics for market entry'}<br>
        • <strong>Budget allocation:</strong> ${isPipeline ? 'Pre-launch / awareness budget tier' : market.tier === 'core' ? 'Tier 1 — Full production budget' : market.tier === 'growth' ? 'Tier 2 — Growth acceleration budget' : 'Tier 3 — Test & learn budget'}<br>
        • <strong>Compliance gate:</strong> All assets must pass Brand Guardian with ≥97% compliance before launch
      </div>
    </div>`;
}

// ── Copy Brief ──
function copyMarketBrief() {
  const body = document.getElementById('tmBriefBody');
  if (!body) return;
  const text = body.innerText;
  navigator.clipboard.writeText(text).then(() => {
    showToast('📋 Campaign brief copied to clipboard', 'success');
  }).catch(() => {
    showToast('⚠️ Could not copy — try selecting manually', 'warning');
  });
}

// ── Send Brief to Asset Generator ──
function sendBriefToGenerator() {
  const body = document.getElementById('tmBriefBody');
  if (!body) return;
  const promptField = document.getElementById('assetPrompt');
  if (promptField) {
    promptField.value = body.innerText.substring(0, 800);
  }
  switchTab('generator');
  showToast('🎨 Brief sent to Asset Generator — ready to create!', 'success');
}

// ── Populate Brief Market Dropdown ──
function populateBriefMarketDropdown() {
  const sel = document.getElementById('tmBriefMarket');
  if (!sel) return;
  sel.innerHTML = '<option value="">— Select a market —</option>';
  targetMarketsData.forEach(m => {
    const opt = document.createElement('option');
    opt.value = m.code;
    opt.textContent = `${m.flag} ${m.name} (${m.code})`;
    sel.appendChild(opt);
  });
}

// ── Render Priority Table ──
function renderPriorityTable() {
  const tbody = document.getElementById('tmPriorityBody');
  if (!tbody) return;

  const sorted = [...targetMarketsData].sort((a, b) => b.priority - a.priority);

  tbody.innerHTML = sorted.map((m, i) => {
    const tc = tierConfig[m.tier];
    const regColor = m.regulatory === 'green' ? '#22c55e' : m.regulatory === 'amber' ? '#f59e0b' : '#ef4444';
    const regIcon = m.regulatory === 'green' ? '✓' : m.regulatory === 'amber' ? '⏳' : '⏸';
    const compColor = m.competition === 'Very High' ? '#ef4444' : m.competition === 'High' ? '#f59e0b' : m.competition === 'Medium' ? '#22d3ee' : '#22c55e';
    const priorityColor = m.priority >= 90 ? '#a3e635' : m.priority >= 80 ? '#22d3ee' : m.priority >= 70 ? '#fbbf24' : '#94a3b8';

    return `<tr>
      <td><span class="tm-rank ${i < 3 ? 'tm-rank-top' : ''}">${i + 1}</span></td>
      <td><span class="tm-table-market">${m.flag} ${m.name}</span></td>
      <td><span class="badge ${tc.badge}" style="font-size:0.65rem; padding:2px 8px;">${tc.icon} ${tc.label}</span></td>
      <td>
        <div class="tm-score-bar-wrap">
          <div class="tm-score-bar"><div class="tm-score-fill" style="width:${m.tam}%; background:#a3e635;"></div></div>
          <span>${m.tam}/100</span>
        </div>
      </td>
      <td><span style="color:${regColor}; font-weight:600;">${regIcon} ${m.regulatory.charAt(0).toUpperCase() + m.regulatory.slice(1)}</span></td>
      <td><span style="color:${compColor};">${m.competition}</span></td>
      <td>${m.growth > 0 ? `<span style="color:#a3e635; font-weight:600;">+${m.growth}%</span>` : '<span style="color:#64748b;">—</span>'}</td>
      <td><span class="tm-priority-score" style="color:${priorityColor}; font-weight:800; font-size:1.1rem;">${m.priority}</span></td>
      <td><button class="btn btn-xs btn-outline" onclick="activateMarketMode('${m.code}')">🎯 Focus</button></td>
    </tr>`;
  }).join('');
}

// ── Init Target Markets (called on tab switch or DOMContentLoaded) ──
function initTargetMarkets() {
  populateBriefMarketDropdown();
  renderTargetMarkets();
  renderPriorityTable();
}

// Add to state
if (!state.activeMarketMode) state.activeMarketMode = null;

// Initialise on load
document.addEventListener('DOMContentLoaded', () => {
  // Delay to ensure DOM is fully ready
  setTimeout(initTargetMarkets, 100);
  setTimeout(initAnalyticsTab, 150);
});

// Re-init when switching to the tab (earlier hook; final override below handles everything)
const origSwitchTab = switchTab;
switchTab = function(tabId) {
  origSwitchTab(tabId);
  if (tabId === 'target-markets') {
    setTimeout(initTargetMarkets, 30);
  }
};

// ── Analytics & Insights Market Selector ──
function initAnalyticsTab() {
  populateAnalyticsMarkets();
  // Set default to ES if exists
  const select = document.getElementById('analyticsMarketSelect');
  if (select) {
    const defaultCode = 'ES';
    if ([...select.options].some(o => o.value === defaultCode)) {
      select.value = defaultCode;
    }
    updateAnalyticsForMarket(select.value);
  }
}

function populateAnalyticsMarkets() {
  const select = document.getElementById('analyticsMarketSelect');
  if (!select || typeof targetMarketsData === 'undefined') return;

  select.innerHTML = '';
  targetMarketsData.forEach(m => {
    const opt = document.createElement('option');
    opt.value = m.code;
    opt.textContent = `${m.flag} ${m.name} (${m.code})`;
    select.appendChild(opt);
  });
}

function updateAnalyticsForMarket(code) {
  if (typeof targetMarketsData === 'undefined') return;
  const market = targetMarketsData.find(m => m.code === code) || targetMarketsData.find(m => m.code === 'ES') || targetMarketsData[0];
  if (!market) return;

  const heatmapTitle = document.getElementById('analyticsHeatmapTitle');
  const insightsTitle = document.getElementById('analyticsInsightsTitle');
  const heatmapContent = document.getElementById('analyticsHeatmapContent');
  const insightsContent = document.getElementById('analyticsInsightsContent');
  const infoEl = document.getElementById('analyticsMarketInfo');
  const footerEl = document.getElementById('analyticsHeatmapFooter');

  if (heatmapTitle) heatmapTitle.innerHTML = `<span class="icon">${market.flag}</span> ${market.name} Market Heatmap`;
  if (insightsTitle) insightsTitle.innerHTML = `<span class="icon">💡</span> AI Audience Insights for ${market.name}`;
  if (infoEl) infoEl.textContent = `${market.customers} customers • ${market.continent || ''}`;

  // Demo heatmap data (cities vary by market, fallback generic)
  if (heatmapContent) {
    const heatmapData = getDemoHeatmapForMarket(code);
    heatmapContent.innerHTML = heatmapData.map(item => 
      `<div style="display:flex; justify-content:space-between; padding:4px 0; border-bottom:1px solid var(--border-default);"><span>${item.city}</span><span class="${parseFloat(item.ctr) > 4.5 ? 'text-lime' : 'text-blue'} font-bold">${item.ctr}% CTR</span></div>`
    ).join('');
  }

  if (insightsContent) {
    insightsContent.innerHTML = getDemoInsightsForMarket(market);
  }

  if (footerEl) {
    footerEl.textContent = market.tier === 'pipeline' 
      ? 'Pre-launch market — focus on awareness and waitlist building.' 
      : 'Highest response rate detected on vertical formats (1080×1920).';
  }
}

// Demo data helpers for analytics
function getDemoHeatmapForMarket(code) {
  const map = {
    'ES': [
      {city: 'Madrid', ctr: '5.1'},
      {city: 'Barcelona', ctr: '4.8'},
      {city: 'Alicante', ctr: '4.6'},
      {city: 'Seville', ctr: '3.9'}
    ],
    'UK': [
      {city: 'London', ctr: '5.8'},
      {city: 'Manchester', ctr: '4.2'},
      {city: 'Edinburgh', ctr: '3.7'},
      {city: 'Birmingham', ctr: '4.1'}
    ],
    'US': [
      {city: 'New York', ctr: '4.9'},
      {city: 'Los Angeles', ctr: '4.3'},
      {city: 'Chicago', ctr: '3.8'},
      {city: 'Miami', ctr: '5.2'}
    ],
    'DE': [
      {city: 'Berlin', ctr: '4.5'},
      {city: 'Munich', ctr: '5.0'},
      {city: 'Frankfurt', ctr: '3.6'},
      {city: 'Hamburg', ctr: '4.1'}
    ]
  };
  if (map[code]) return map[code];
  // Generic fallback
  return [
    {city: 'Capital City', ctr: (3.5 + Math.random()*1.5).toFixed(1)},
    {city: 'Major Metro', ctr: (4.0 + Math.random()*1.2).toFixed(1)},
    {city: 'Regional Hub', ctr: (3.2 + Math.random()*1.8).toFixed(1)},
    {city: 'Other', ctr: (2.8 + Math.random()*1.5).toFixed(1)}
  ];
}

function getDemoInsightsForMarket(market) {
  const name = market.name;
  const isCore = market.tier === 'core';
  const isPipeline = market.tier === 'pipeline';
  if (isPipeline) {
    return `${name} is a high-potential pipeline market. Focus on brand awareness and early adopter acquisition. Vertical video and influencer partnerships show strongest early signals.`;
  }
  const base = `${name} audience shows strong engagement with premium fintech messaging. `;
  if (market.code === 'ES' || market.code === 'PT_PT' || market.code === 'MX') {
    return base + `Strong preference for **lifestyle and travel benefits** (+38% vs average). Recommend 70% vertical video spend focused on cashback and experiences.`;
  }
  if (market.code === 'UK' || market.code === 'US' || market.code === 'DE') {
    return base + `High conversion on **metal card animations and premium status** cues (+52% engagement). Allocate heavily to short-form premium storytelling.`;
  }
  return base + `Digital natives respond best to **convenience and cashback** narratives. Vertical formats outperform static by 31%.`;
}

// Hook analytics init into existing DOM ready if needed
// (called via switchTab now, plus we call on load below)

// ═══════════════════════════════════════════════════════════════
// 🚀 AUTONOMOUS CREATIVE PRODUCTION ENGINE — ENHANCED
// ═══════════════════════════════════════════════════════════════

function runAutonomousPipeline() {
  const ai = getEffectiveAI();
  const providerName = ai === 'simulated' ? 'Simulated Engine' : ai === 'gemini' ? 'Gemini' : ai === 'claude' ? 'Claude' : ai === 'chatgpt' ? 'ChatGPT' : 'Grok (xAI)';

  showToast(`🚀 Starting autonomous production with ${providerName}...`, 'info');

  // Prepare timeline
  const timeline = [`Started with ${providerName}`];

  // Step 1: Go to Asset Generator
  switchTab('generator');

  // Prepare a strong demo brief (multi-market premium feel)
  const demoPrompt = `Create a premium Revolut Ultra metal card campaign targeting ambitious professionals aged 28-45 in Spain and UK. Focus on exclusive lifestyle benefits, priority support, high cashback tiers, and the prestige of the black metal card. Tone: confident, sophisticated, modern. Formats: Social square + vertical story.`;

  const promptEl = document.getElementById('assetPrompt');
  const marketEl = document.getElementById('targetMarket');
  const formatEl = document.getElementById('assetFormat');

  if (promptEl) promptEl.value = demoPrompt;
  if (marketEl) marketEl.value = 'ES';
  if (formatEl) formatEl.value = 'social';

  // Kick off generation
  setTimeout(() => {
    generateAsset();
    timeline.push('Asset generated from brief');

    // Chain the rest of the autonomous flow
    setTimeout(() => {
      showToast('✓ Asset generated. Running autonomous localisation + variants...', 'success');
      timeline.push('Localisation & variants executed');

      // Simulate localisation update
      state.currentLocale = 'ES';
      updateLocalisedCopy();

      // Auto show high compliance
      setTimeout(() => {
        const scoreEl = document.getElementById('complianceScore');
        if (scoreEl) scoreEl.textContent = '99%';
        showToast('✓ Brand compliance verified at 99%', 'success');
        timeline.push('Compliance verified at 99%');
      }, 600);

      // Step 2: Simulate A/B internally and pick winner
      setTimeout(() => {
        simulateAutonomousAB();
        timeline.push('A/B test completed — Version A wins');

        // Step 3: Create + populate a campaign
        setTimeout(() => {
          autoCreateCampaignFromGeneration(demoPrompt);
          timeline.push('Campaign created & published');

          // Final step: Celebrate + populate HUB
          setTimeout(() => {
            switchTab('auto-hub');

            // Populate AUTO HUB with everything
            updateAutoHubRun({
              timestamp: new Date().toLocaleTimeString(),
              provider: providerName,
              brief: demoPrompt.substring(0, 110) + '...',
              assetHeadline: 'Upgrade Your Financial Power',
              assetBody: 'Metal card • Unlimited transfers • Premium cashback',
              campaignName: 'Ultra Metal Launch — ES/UK Autonomous',
              timeline: timeline
            });

            showToast('🎉 Autonomous pipeline complete — all results in AUTO HUB!', 'success');

            // Bonus: update a KPI feel
            const kpi = document.getElementById('kpiVolume');
            if (kpi) kpi.textContent = (parseInt(kpi.textContent.replace(/,/g,'')) + 184 || 13031).toLocaleString();
          }, 900);
        }, 1100);
      }, 1400);
    }, 1600);
  }, 420);
}

function simulateAutonomousAB() {
  // Update the predicted numbers dramatically in favor of the "winner"
  const aCtr = document.getElementById('predictedCtrA');
  const bCtr = document.getElementById('predictedCtrB');
  const log = document.getElementById('abSimLog');

  if (aCtr) aCtr.textContent = '5.7%';
  if (bCtr) bCtr.textContent = '4.1%';

  if (log) {
    log.innerHTML = `Autonomous A/B run complete.<br>
    Winner: Version A (+39% lift)<br>
    Simulated 12,400 users • p=0.003`;
  }

  showToast('📈 Autonomous A/B complete — Version A wins decisively', 'success');
}

function autoCreateCampaignFromGeneration(promptText) {
  // Ensure we have campaign state
  if (!window.grovolutCampaigns) {
    try { window.grovolutCampaigns = JSON.parse(localStorage.getItem('grovolut_campaigns') || '[]'); } catch { window.grovolutCampaigns = []; }
  }

  const newCamp = {
    id: 'GRV-' + Date.now().toString(36).toUpperCase(),
    name: 'Ultra Metal Launch — ES/UK Autonomous',
    market: 'ES / UK',
    status: 'Live',
    assets: 4,
    created: new Date().toISOString(),
    prompt: promptText.substring(0, 120) + '...',
  };

  window.grovolutCampaigns.unshift(newCamp);
  try {
    localStorage.setItem('grovolut_campaigns', JSON.stringify(window.grovolutCampaigns));
  } catch {}

  // If campaigns tab is visible, re-render
  const container = document.getElementById('campaignsContainer');
  if (container && container.offsetParent !== null) {
    renderCampaigns();
  } else {
    showToast('📁 Campaign auto-created in library', 'info');
  }
}

// ── AUTO HUB helpers ──
let lastAutoRun = null;

function renderAutoHub() {
  const empty = document.getElementById('autoHubEmpty');
  const content = document.getElementById('autoHubContent');
  if (!lastAutoRun) {
    if (empty) empty.style.display = 'block';
    if (content) content.style.display = 'none';
    return;
  }
  if (empty) empty.style.display = 'none';
  if (content) content.style.display = 'block';

  // Timestamp & provider
  const ts = document.getElementById('autoHubTimestamp');
  const prov = document.getElementById('autoHubProvider');
  if (ts) ts.textContent = lastAutoRun.timestamp || 'Just now';
  if (prov) prov.textContent = `Provider: ${lastAutoRun.provider || 'Simulated'}`;

  // Brief
  const briefEl = document.getElementById('autoHubBrief');
  if (briefEl) briefEl.textContent = lastAutoRun.brief || '';

  // Asset preview (simple recreation for demo)
  const assetEl = document.getElementById('autoHubAsset');
  if (assetEl) {
    assetEl.innerHTML = `
      <div style="font-size:0.65rem; color:#b8f03e; margin-bottom:4px;">REVOLUT PREMIUM</div>
      <div style="font-size:1.15rem; font-weight:800; color:#fff; line-height:1.1;">${lastAutoRun.assetHeadline || 'Upgrade Your Financial Power'}</div>
      <div style="font-size:0.8rem; color:#a8b1c0; margin-top:4px;">${lastAutoRun.assetBody || 'Metal card • Unlimited transfers • Premium cashback'}</div>
      <div style="margin-top:10px; display:inline-block; background:#b8f03e; color:#0a1018; padding:4px 10px; border-radius:999px; font-size:0.7rem; font-weight:700;">Upgrade Now →</div>
    `;
  }

  // A/B
  const abEl = document.getElementById('autoHubAB');
  if (abEl) {
    abEl.innerHTML = `
      <div><strong>Winner:</strong> Version A <span style="color:#b8f03e;">(+39% lift)</span></div>
      <div>Predicted CTR A: <strong>5.7%</strong> • B: 4.1%</div>
      <div style="margin-top:4px; font-size:0.75rem;">Simulated 12,400 users • p=0.003</div>
    `;
  }

  // Campaign
  const campEl = document.getElementById('autoHubCampaign');
  if (campEl) {
    campEl.innerHTML = `
      <div><strong>${lastAutoRun.campaignName || 'Ultra Metal Launch — ES/UK Autonomous'}</strong></div>
      <div style="font-size:0.75rem; color:#888;">Status: <span style="color:#b8f03e;">Live</span> • 4 assets • Markets: ES / UK</div>
      <div style="margin-top:6px;"><button class="btn btn-xs btn-outline" onclick="switchTab('campaigns')">View in Campaign Library →</button></div>
    `;
  }

  // Timeline
  const logEl = document.getElementById('autoHubTimeline');
  if (logEl) {
    logEl.innerHTML = (lastAutoRun.timeline || []).map(step => 
      `<div style="margin-bottom:4px;">• ${step}</div>`
    ).join('');
  }
}

function updateAutoHubRun(data) {
  lastAutoRun = data;
  // If hub is visible, re-render
  const hub = document.getElementById('content-auto-hub');
  if (hub && hub.classList.contains('active')) {
    renderAutoHub();
  }
}

// ═══════════════════════════════════════════════════════════════
// CAMPAIGN LIBRARY — Fully functional (add, filter, status, persist)
// ═══════════════════════════════════════════════════════════════

function getCampaigns() {
  if (!window.grovolutCampaigns) {
    try {
      window.grovolutCampaigns = JSON.parse(localStorage.getItem('grovolut_campaigns') || '[]');
    } catch { window.grovolutCampaigns = []; }
  }
  if (typeof state !== 'undefined') state.campaigns = window.grovolutCampaigns;
  return window.grovolutCampaigns;
}

function setCampaigns(camps) {
  window.grovolutCampaigns = camps;
  // Mirror to legacy state for any add flows / other references
  if (typeof state !== 'undefined') state.campaigns = camps;
  try { localStorage.setItem('grovolut_campaigns', JSON.stringify(camps)); } catch {}
}

function renderCampaigns(filtered = null) {
  const container = document.getElementById('campaignsContainer');
  if (!container) return;

  const camps = filtered || getCampaigns();

  if (camps.length === 0) {
    container.innerHTML = `
      <div class="card" style="grid-column:1 / -1; text-align:center; padding:40px 20px;">
        <div style="font-size:2rem; opacity:.4;">📂</div>
        <div class="mt-sm text-sm text-muted">No campaigns yet.<br>Run Autonomous or click "+ New Campaign"</div>
      </div>`;
    return;
  }

  container.innerHTML = camps.map((c, idx) => {
    const assetCount = Array.isArray(c.assets) ? c.assets.length : (c.assets || 0);
    const statusClass = c.status === 'Live' ? 'badge-green' :
                        c.status === 'Approved' ? 'badge-lime' :
                        c.status === 'Review' ? 'badge-orange' :
                        c.status === 'Paused' ? 'badge-blue' :
                        c.status === 'Completed' ? 'badge-cyan' : 'badge-blue';

    const briefShort = (c.prompt || '').substring(0, 78) + ((c.prompt || '').length > 78 ? '…' : '');
    const perf = c.views ? `${Math.round(c.views/1000)}k views · ${c.ctr}% CTR` : 'No performance yet';

    return `
      <div class="card" style="padding:14px; font-size:0.82rem; border:1px solid var(--border-default); transition: transform .1s ease, box-shadow .1s ease;" onmouseover="this.style.transform='translateY(-1px)';this.style.boxShadow='0 6px 16px rgba(0,0,0,0.25)'" onmouseout="this.style.transform='';this.style.boxShadow=''">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px;">
          <div style="display:flex; gap:8px; align-items:flex-start;">
            ${c.image ? `<img src="${c.image}" style="width:55px; height:34px; object-fit:cover; border-radius:4px; border:1px solid #333; flex-shrink:0;" alt="Visual" />` : ''}
            <div style="flex:1; min-width:0;">
              <div style="font-weight:700; font-size:0.95rem; line-height:1.15; color:#f1f5f9;">${c.name}</div>
              <div class="text-xs text-muted" style="margin-top:2px;">${c.market} • ${assetCount} asset${assetCount===1?'':'s'} • ${c.startDate || ''}</div>
            </div>
          </div>
          <span class="badge ${statusClass}" style="font-size:0.68rem; padding:1px 8px; white-space:nowrap;">${c.status}</span>
        </div>

        <div class="text-xs mt-sm" style="color:#9aa4b8; line-height:1.25; min-height:30px;">${briefShort || '—'}</div>

        <div style="display:flex; align-items:center; gap:10px; margin-top:8px; font-size:0.7rem; color:#6b768a;">
          <span>📈 ${perf}</span>
          ${c.budget ? `<span style="margin-left:auto;">€${(c.budget/1000).toFixed(0)}k</span>` : ''}
        </div>

        <div class="flex gap-xs mt-md" style="flex-wrap:wrap; border-top:1px solid var(--border-default); padding-top:8px;">
          <button class="btn btn-xs btn-secondary" onclick="event.stopPropagation(); cycleCampaignStatus(${idx})" title="Cycle status">↻ Cycle</button>
          <button class="btn btn-xs btn-primary" onclick="event.stopPropagation(); viewCampaign(${idx})">View</button>
          <button class="btn btn-xs btn-outline" onclick="event.stopPropagation(); duplicateCampaignFromIdx(${idx})">Duplicate</button>
          <button class="btn btn-xs btn-danger" onclick="event.stopPropagation(); deleteCampaign(${idx})" style="margin-left:auto; color:#f66;">Delete</button>
        </div>
      </div>
    `;
  }).join('');
}

function filterCampaigns() {
  const q = (document.getElementById('campaignSearchInput')?.value || '').toLowerCase();
  const market = document.getElementById('campaignMarketFilter')?.value || 'all';
  const camps = getCampaigns();

  const filtered = camps.filter(c => {
    const matchQ = !q || c.name.toLowerCase().includes(q) || (c.prompt || '').toLowerCase().includes(q);
    const matchM = market === 'all' || c.market.includes(market);
    return matchQ && matchM;
  });

  renderCampaigns(filtered);
}

function openNewCampaignModal() {
  // Show the comprehensive modal
  const modal = document.getElementById('newCampaignModal');
  if (!modal) return;

  // Reset fields
  const nameEl = document.getElementById('campaignNameInput');
  const briefEl = document.getElementById('campaignBriefInput');
  const marketEl = document.getElementById('campaignMarketInput');
  const statusEl = document.getElementById('campaignStatusInput');
  const startEl = document.getElementById('campaignStartInput');
  const endEl = document.getElementById('campaignEndInput');
  const budgetEl = document.getElementById('campaignBudgetInput');
  const channelsEl = document.getElementById('campaignChannelsInput');
  const audienceEl = document.getElementById('campaignAudienceInput');
  const goalEl = document.getElementById('campaignGoalInput');

  if (nameEl) nameEl.value = 'Q3 Metal Card Acquisition';
  if (briefEl) briefEl.value = 'Drive Premium metal card upgrades with focus on cashback and airport lounge access benefits.';
  if (marketEl) marketEl.value = 'ES';
  if (statusEl) statusEl.value = 'Draft';
  if (startEl) startEl.value = '2026-07-15';
  if (endEl) endEl.value = '2026-09-30';
  if (budgetEl) budgetEl.value = '45000';
  if (channelsEl) channelsEl.value = 'story,social,banner';
  if (audienceEl) audienceEl.value = 'Urban professionals, 25-40, high income';
  if (goalEl) goalEl.value = '18% increase in metal sign-ups';

  modal.style.display = 'flex';
}

function closeNewCampaignModal() {
  const modal = document.getElementById('newCampaignModal');
  if (modal) modal.style.display = 'none';
}

function submitNewCampaign() {
  const name = (document.getElementById('campaignNameInput')?.value || '').trim();
  if (!name) {
    showToast('Campaign name is required.', 'warning');
    return;
  }

  const brief = document.getElementById('campaignBriefInput')?.value || '';
  const market = document.getElementById('campaignMarketInput')?.value || 'Multi';
  const status = document.getElementById('campaignStatusInput')?.value || 'Draft';
  const startDate = document.getElementById('campaignStartInput')?.value || '';
  const endDate = document.getElementById('campaignEndInput')?.value || '';
  const budget = parseInt(document.getElementById('campaignBudgetInput')?.value || '0', 10) || 0;
  const channelsRaw = document.getElementById('campaignChannelsInput')?.value || '';
  const channels = channelsRaw.split(',').map(s => s.trim()).filter(Boolean);
  const audience = document.getElementById('campaignAudienceInput')?.value || '';
  const goal = document.getElementById('campaignGoalInput')?.value || '';

  const camps = getCampaigns();

  const newCamp = {
    id: 'GRV-' + Date.now().toString(36).toUpperCase(),
    name,
    market,
    status,
    assets: [],
    created: new Date().toISOString().split('T')[0],
    prompt: brief,
    startDate,
    endDate,
    budget,
    channels,
    audience,
    goal,
    views: 0,
    ctr: 0,
    conversions: 0
  };

  camps.unshift(newCamp);
  setCampaigns(camps);
  renderCampaigns();
  closeNewCampaignModal();
  showToast(`📁 Campaign "${name}" created`, 'success');
}

function cycleCampaignStatus(idx) {
  const camps = getCampaigns();
  if (!camps[idx]) return;
  const order = ['Draft', 'Review', 'Approved', 'Live', 'Paused', 'Completed'];
  let i = order.indexOf(camps[idx].status);
  if (i === -1) i = 0;
  camps[idx].status = order[(i + 1) % order.length];
  setCampaigns(camps);
  renderCampaigns();
}

function viewCampaign(idx) {
  showCampaignDetail(idx);
}

function deleteCampaign(idx) {
  if (!confirm('Delete this campaign? This cannot be undone.')) return;
  const camps = getCampaigns();
  camps.splice(idx, 1);
  setCampaigns(camps);
  renderCampaigns();
  // Close detail if open
  const detail = document.getElementById('campaignDetailModal');
  if (detail) detail.style.display = 'none';
}

// Professional rich detail view (replaces the old alert box)
function showCampaignDetail(idx) {
  const camps = getCampaigns();
  const c = camps[idx];
  if (!c) return;

  const modal = document.getElementById('campaignDetailModal');
  const body = document.getElementById('campaignDetailBody');
  if (!modal || !body) return;

  const assetCount = Array.isArray(c.assets) ? c.assets.length : (c.assets || 0);
  const assetList = Array.isArray(c.assets) && c.assets.length
    ? c.assets.map((a, i) => `<div style="padding:4px 8px; background:#11161f; border-radius:4px; font-size:0.72rem; display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
        <span>📎 ${a}</span>
        <button onclick="removeAssetFromDetail(${idx}, ${i});" style="background:none; border:none; color:#f66; font-size:0.7rem; cursor:pointer;">✕</button>
      </div>`).join('')
    : `<div class="text-xs text-muted" style="padding:8px 0;">No assets added yet. Add from Asset Generator or Creator Tool.</div>`;

  const channels = (c.channels && c.channels.length) ? c.channels.join(' • ') : '—';
  const statusClass = c.status === 'Live' ? 'badge-green' : c.status === 'Approved' ? 'badge-lime' : c.status === 'Review' ? 'badge-orange' : c.status === 'Paused' ? 'badge-blue' : c.status === 'Completed' ? 'badge-cyan' : 'badge-blue';

  body.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; padding-bottom:10px; border-bottom:1px solid var(--border-default);">
      <div>
        <div style="font-size:1.15rem; font-weight:800; color:#f1f5f9;">${c.name}</div>
        <div style="font-size:0.78rem; color:#6b768a; margin-top:2px;">${c.id} • ${c.market}</div>
      </div>
      <div style="text-align:right;">
        <span class="badge ${statusClass}" style="font-size:0.85rem; padding:3px 12px;">${c.status}</span>
        <div style="font-size:0.65rem; color:#555; margin-top:3px;">${c.created || ''}</div>
      </div>
    </div>

    ${c.image ? `
    <div style="margin: 8px 0 16px; text-align:center;">
      <img src="${c.image}" style="max-width:100%; max-height:240px; object-fit:contain; border-radius:8px; border:1px solid #222; background:#0a0f1a;" alt="${c.name}" />
    </div>` : ''}

    <div style="display:grid; grid-template-columns: 1.15fr 1fr; gap:16px;">
      <!-- Left column: Brief + Meta -->
      <div>
        <div class="card-title text-xs" style="margin-bottom:6px; opacity:.75;">CREATIVE BRIEF</div>
        <div style="background:#0e131f; border:1px solid #222a3a; border-radius:8px; padding:10px; font-size:0.82rem; line-height:1.35; min-height:68px;">
          ${c.prompt || '<span class="text-muted">No brief provided.</span>'}
        </div>

        <div style="margin-top:14px; display:grid; grid-template-columns:1fr 1fr; gap:8px;">
          <div>
            <div class="text-xs text-muted">START / END</div>
            <div style="font-size:0.85rem;">${c.startDate || '—'} → ${c.endDate || '—'}</div>
          </div>
          <div>
            <div class="text-xs text-muted">BUDGET</div>
            <div style="font-size:0.85rem; font-weight:600;">${c.budget ? '€' + c.budget.toLocaleString() : '—'}</div>
          </div>
        </div>

        <div style="margin-top:10px;">
          <div class="text-xs text-muted">TARGET AUDIENCE</div>
          <div style="font-size:0.82rem;">${c.audience || '—'}</div>
        </div>
        <div style="margin-top:8px;">
          <div class="text-xs text-muted">GOAL / KPI</div>
          <div style="font-size:0.82rem;">${c.goal || '—'}</div>
        </div>
        <div style="margin-top:8px;">
          <div class="text-xs text-muted">CHANNELS</div>
          <div style="font-size:0.78rem; color:#a3bffa;">${channels}</div>
        </div>
      </div>

      <!-- Right column: Performance + Status + Assets -->
      <div>
        <div style="margin-bottom:8px;">
          <div class="card-title text-xs" style="margin-bottom:6px; opacity:.75;">PERFORMANCE</div>
          <div style="display:flex; gap:10px; flex-wrap:wrap;">
            <div style="flex:1; background:#0e131f; padding:8px 10px; border-radius:6px; border:1px solid #222a3a;">
              <div class="text-xs text-muted">Views</div>
              <input id="detailViews" type="number" value="${c.views || 0}" style="background:transparent; border:none; color:#fff; font-weight:700; width:100%; font-size:1rem;" onchange="updateCampaignField(${idx}, 'views', this.value)">
            </div>
            <div style="flex:1; background:#0e131f; padding:8px 10px; border-radius:6px; border:1px solid #222a3a;">
              <div class="text-xs text-muted">CTR %</div>
              <input id="detailCtr" type="number" step="0.1" value="${c.ctr || 0}" style="background:transparent; border:none; color:#fff; font-weight:700; width:100%; font-size:1rem;" onchange="updateCampaignField(${idx}, 'ctr', this.value)">
            </div>
            <div style="flex:1; background:#0e131f; padding:8px 10px; border-radius:6px; border:1px solid #222a3a;">
              <div class="text-xs text-muted">Conversions</div>
              <input id="detailConv" type="number" value="${c.conversions || 0}" style="background:transparent; border:none; color:#fff; font-weight:700; width:100%; font-size:1rem;" onchange="updateCampaignField(${idx}, 'conversions', this.value)">
            </div>
          </div>
        </div>

        <div>
          <div class="card-title text-xs" style="margin-bottom:6px; opacity:.75;">STATUS CYCLE</div>
          <div style="display:flex; gap:4px; flex-wrap:wrap;">
            ${['Draft','Review','Approved','Live','Paused','Completed'].map(s => {
              const active = c.status === s ? 'background:#132a1f; border-color:#22c55e; color:#86efac;' : '';
              return `<button onclick="setDetailStatus(${idx}, '${s}');" class="btn btn-xs" style="font-size:0.68rem; padding:2px 9px; border:1px solid #334; ${active}">${s}</button>`;
            }).join('')}
          </div>
          <div style="margin-top:4px;">
            <button onclick="cycleCampaignStatus(${idx}); showCampaignDetail(${idx});" class="btn btn-xs btn-secondary" style="font-size:0.68rem;">↻ Quick Cycle</button>
          </div>
        </div>

        <div style="margin-top:12px;">
          <div class="card-title text-xs" style="margin-bottom:6px; opacity:.75;">ASSETS (${assetCount})</div>
          <div style="max-height:122px; overflow:auto; border:1px solid #222a3a; border-radius:6px; padding:6px; background:#0b0f18;">
            ${assetList}
          </div>
          <div style="font-size:0.65rem; color:#555; margin-top:4px;">Add assets via "Add to Campaign" from Asset Generator / Creator Tool.</div>
        </div>
      </div>
    </div>

    <div style="margin-top:16px; padding-top:12px; border-top:1px solid var(--border-default); display:flex; gap:8px; flex-wrap:wrap; justify-content:space-between; align-items:center;">
      <div>
        <button onclick="duplicateCampaignFromIdx(${idx}); document.getElementById('campaignDetailModal').style.display='none';" class="btn btn-outline btn-sm">Duplicate</button>
        <button onclick="exportCampaignDetail(${idx});" class="btn btn-outline btn-sm">Export Summary</button>
      </div>
      <div>
        <button onclick="document.getElementById('campaignDetailModal').style.display='none'" class="btn btn-secondary">Close</button>
        <button onclick="saveDetailAndClose(${idx});" class="btn btn-primary">Save Changes</button>
      </div>
    </div>
  `;

  modal.style.display = 'flex';
}

// Helpers for detail modal
function setDetailStatus(idx, newStatus) {
  const camps = getCampaigns();
  if (!camps[idx]) return;
  camps[idx].status = newStatus;
  setCampaigns(camps);
  renderCampaigns();
  showCampaignDetail(idx); // refresh
}

function updateCampaignField(idx, field, val) {
  const camps = getCampaigns();
  if (!camps[idx]) return;
  if (['views','conversions'].includes(field)) {
    camps[idx][field] = parseInt(val) || 0;
  } else if (field === 'ctr') {
    camps[idx][field] = parseFloat(val) || 0;
  } else {
    camps[idx][field] = val;
  }
  setCampaigns(camps);
  // Do not re-render list immediately to avoid losing focus on inputs
}

function saveDetailAndClose(idx) {
  // Force a sync of numeric fields in case onchange didn't fire
  const camps = getCampaigns();
  const v = document.getElementById('detailViews');
  const ctr = document.getElementById('detailCtr');
  const conv = document.getElementById('detailConv');
  if (camps[idx] && v) camps[idx].views = parseInt(v.value) || 0;
  if (camps[idx] && ctr) camps[idx].ctr = parseFloat(ctr.value) || 0;
  if (camps[idx] && conv) camps[idx].conversions = parseInt(conv.value) || 0;
  setCampaigns(camps);
  renderCampaigns();
  document.getElementById('campaignDetailModal').style.display = 'none';
  showToast('Campaign details saved', 'success');
}

function removeAssetFromDetail(idx, assetIdx) {
  const camps = getCampaigns();
  if (!camps[idx] || !Array.isArray(camps[idx].assets)) return;
  camps[idx].assets.splice(assetIdx, 1);
  setCampaigns(camps);
  renderCampaigns();
  showCampaignDetail(idx); // refresh modal
}

function exportCampaignDetail(idx) {
  const camps = getCampaigns();
  const c = camps[idx];
  if (!c) return;
  const summary = `Campaign: ${c.name}\nID: ${c.id}\nMarket: ${c.market}\nStatus: ${c.status}\nBudget: ${c.budget || '—'}\nDates: ${c.startDate || '?'} → ${c.endDate || '?'}\nAssets: ${(c.assets||[]).length}\nBrief: ${c.prompt || ''}\nGoal: ${c.goal || ''}`;
  navigator.clipboard.writeText(summary).then(() => {
    showToast('Campaign summary copied to clipboard', 'success');
  }).catch(() => {
    alert(summary);
  });
}

function duplicateCampaignFromIdx(idx) {
  const camps = getCampaigns();
  const c = camps[idx];
  if (!c) return;
  const copy = JSON.parse(JSON.stringify(c));
  copy.id = 'GRV-' + Date.now().toString(36).toUpperCase();
  copy.name = c.name + ' (Copy)';
  copy.status = 'Draft';
  copy.views = 0;
  copy.ctr = 0;
  copy.conversions = 0;
  copy.assets = Array.isArray(c.assets) ? [...c.assets] : [];
  copy.created = new Date().toISOString().split('T')[0];
  camps.unshift(copy);
  setCampaigns(camps);
  renderCampaigns();
  showToast(`Duplicated as ${copy.name}`, 'success');
}

// Seed some demo campaigns on first run if empty
function seedDemoCampaignsIfNeeded() {
  const camps = getCampaigns();
  if (camps.length === 0) {
    const demo = [
      {
        id: 'GRV-DEMO1',
        name: 'Spain Premium Launch Q2',
        market: 'ES',
        status: 'Live',
        assets: ['ES_Story_Premium.png', 'ES_Banner_Metal.jpg', 'ES_Video_15s.mp4'],
        created: '2026-05-12',
        prompt: 'Premium metal card acquisition drive. Focus on cashback + airport perks.',
        startDate: '2026-05-20',
        endDate: '2026-07-10',
        budget: 62000,
        channels: ['story','banner','video'],
        audience: 'Spanish high-income 28-45',
        goal: '+22% Premium signups',
        views: 187400,
        ctr: 4.1,
        conversions: 1342
      },
      {
        id: 'GRV-DEMO2',
        name: 'UK Ultra Summer Stories',
        market: 'UK',
        status: 'Approved',
        assets: ['UK_Story_Summer1.png', 'UK_Carousel_Ultra.png'],
        created: '2026-06-01',
        prompt: 'Ultra lifestyle vertical creatives for summer holidays push.',
        startDate: '2026-06-15',
        endDate: '2026-08-25',
        budget: 38500,
        channels: ['story','social'],
        audience: 'UK urban professionals',
        goal: 'Increase app engagement',
        views: 94000,
        ctr: 3.7,
        conversions: 681
      }
    ];
    setCampaigns(demo);
  }
}

// Call seed early
setTimeout(seedDemoCampaignsIfNeeded, 120);

// Re-render campaigns when tab activated (extend switchTab)
const oldSwitch = switchTab;
switchTab = function(tab) {
  oldSwitch(tab);
  if (tab === 'campaigns') {
    setTimeout(() => renderCampaigns(), 30);
  }
  if (tab === 'target-markets') {
    setTimeout(() => initTargetMarkets && initTargetMarkets(), 50);
  }
  if (tab === 'analytics') {
    setTimeout(() => initAnalyticsTab && initAnalyticsTab(), 50);
  }
  if (tab === 'integrations') {
    setTimeout(() => {
      if (typeof loadAIKeysToHub === 'function') loadAIKeysToHub();
    }, 50);
  }
};

// ═══════════════════════════════════════════════════════════════
// A/B TEST ENHANCEMENTS
// ═══════════════════════════════════════════════════════════════

function simulateABTest() {
  const log = document.getElementById('abSimLog');
  if (!log) return;

  log.innerHTML = 'Simulating 10,000 users...';

  setTimeout(() => {
    const a = (4.1 + Math.random() * 1.8).toFixed(1);
    const b = (3.4 + Math.random() * 1.6).toFixed(1);
    abCurrentWinner = parseFloat(a) > parseFloat(b) ? 'A' : 'B';
    const lift = (Math.abs(parseFloat(a) - parseFloat(b)) / Math.min(parseFloat(a), parseFloat(b)) * 100).toFixed(0);

    log.innerHTML = `
      10k users simulated.<br>
      A: ${a}% &nbsp; | &nbsp; B: ${b}%<br>
      <strong style="color:var(--accent-teal)">Winner: Version ${abCurrentWinner} (+${lift}%)</strong>
    `;

    // Update live numbers
    const aEl = document.getElementById('predictedCtrA');
    const bEl = document.getElementById('predictedCtrB');
    if (aEl) aEl.textContent = a + '%';
    if (bEl) bEl.textContent = b + '%';

    // Update summary banner
    const summary = document.getElementById('abWinnerSummary');
    if (summary) summary.innerHTML = `<strong>Current Leader: Version ${abCurrentWinner}</strong> (+${lift}% lift)`;

    showToast(`🏆 Simulation complete — Version ${abCurrentWinner} wins by ${lift}%`, 'success');
  }, 950);
}

// resetABSimulation and voteAB logic is handled by the definitions above (cleaned duplicates)


function updateABVoteDisplays() {
  if (typeof abVotes === 'undefined' || abVotes === null) {
    abVotes = { A: { like: 0, dislike: 0 }, B: { like: 0, dislike: 0 } };
  }
  const aL = document.getElementById('abVotesALikes');
  const aD = document.getElementById('abVotesADislikes');
  const bL = document.getElementById('abVotesBLikes');
  const bD = document.getElementById('abVotesBDislikes');
  if (aL) aL.textContent = abVotes.A.like;
  if (aD) aD.textContent = abVotes.A.dislike;
  if (bL) bL.textContent = abVotes.B.like;
  if (bD) bD.textContent = abVotes.B.dislike;
}

function loadVariantFromLibrary(side) {
  const camps = getCampaigns();
  if (!camps || camps.length === 0) {
    showToast('No campaigns in library yet. Create some first!', 'warning');
    return;
  }
  // Pick different ones for A vs B if possible
  let idx = (side === 'A') ? 0 : Math.min(1, camps.length - 1);
  const camp = camps[idx] || camps[0];
  const text = `${camp.name}. ${camp.prompt || 'Premium benefits and seamless experience.'}`;
  const taId = side === 'A' ? 'abTextA' : 'abTextB';
  const ta = document.getElementById(taId);
  if (ta) {
    ta.value = text;
  }
  // Also optionally update the card title area if needed
  showToast(`Loaded Variant ${side} from Campaign Library`, 'success');
}

function declareWinnerAndDeploy() {
  if (!abCurrentWinner) {
    // fallback: use votes if any, else CTRs
    const aLikes = abVotes.A.like - abVotes.A.dislike;
    const bLikes = abVotes.B.like - abVotes.B.dislike;
    if (aLikes !== 0 || bLikes !== 0) {
      abCurrentWinner = aLikes >= bLikes ? 'A' : 'B';
    } else {
      const aEl = document.getElementById('predictedCtrA');
      const bEl = document.getElementById('predictedCtrB');
      const aVal = aEl ? parseFloat(aEl.textContent) : 4.0;
      const bVal = bEl ? parseFloat(bEl.textContent) : 3.5;
      abCurrentWinner = aVal >= bVal ? 'A' : 'B';
    }
  }

  const winnerSide = abCurrentWinner;
  const taId = winnerSide === 'A' ? 'abTextA' : 'abTextB';
  const ta = document.getElementById(taId);
  const winnerText = ta ? ta.value : `Version ${winnerSide} Creative`;

  // Create a real deployed campaign entry
  const camps = getCampaigns();
  const newCamp = {
    id: 'GRV-AB-' + Date.now().toString(36).toUpperCase(),
    name: `AB Winner: ${winnerText.substring(0, 50)}...`,
    market: 'ES',
    status: 'Live',
    assets: [winnerText.substring(0, 30) + '.png'],
    created: new Date().toISOString().split('T')[0],
    prompt: `Deployed winner from A/B Test. Variant ${winnerSide}: ${winnerText}`,
    views: Math.floor(Math.random() * 50000) + 20000,
    ctr: parseFloat((4.2 + Math.random() * 1.5).toFixed(1)),
    conversions: Math.floor(Math.random() * 1200) + 300
  };
  camps.unshift(newCamp);
  setCampaigns(camps);
  renderCampaigns();

  // Update summary
  const summary = document.getElementById('abWinnerSummary');
  if (summary) summary.innerHTML = `<span style="color:#22c55e">✅ Deployed: Version ${winnerSide}</span>`;

  // Add to past records dynamically (simple append)
  const tbody = document.querySelector('#content-ab-test table tbody');
  if (tbody) {
    const row = document.createElement('tr');
    row.style.borderBottom = '1px solid var(--border-default)';
    row.innerHTML = `
      <td class="text-sm font-mono" style="padding:8px;">AB-${Date.now().toString(36).toUpperCase().slice(-6)}</td>
      <td class="text-sm" style="padding:8px;">${winnerText.substring(0,35)}...</td>
      <td class="text-sm" style="padding:8px;">${winnerSide==='A' ? '4.8%' : '3.9%'}</td>
      <td class="text-sm" style="padding:8px;">${winnerSide==='A' ? '3.9%' : '4.8%'}</td>
      <td class="text-sm text-lime font-bold" style="padding:8px;">🥇 Version ${winnerSide}</td>
      <td class="text-sm" style="padding:8px;"><span class="badge badge-green">Deployed</span></td>
    `;
    tbody.prepend(row);
  }

  showToast(`Version ${winnerSide} declared winner & deployed as Live campaign.`, 'success');

  // Clear for next test
  setTimeout(() => {
    showToast('Next: Monitor performance in Campaign Library tab.', 'info');
  }, 1200);

  // Switch user to see the result
  setTimeout(() => {
    switchTab('campaigns');
  }, 1800);
}

// ═══════════════════════════════════════════════════════════════
// ENHANCED CREATOR TOOL — live preview updates
// ═══════════════════════════════════════════════════════════════

function wireCreatorLivePreview() {
  const canvas = document.getElementById('canvasBody');
  if (!canvas) return;

  // Make sure preview updates when user types in creator areas
  const headline = document.getElementById('creatorHeadline');
  const body = document.getElementById('creatorBody');
  const cta = document.getElementById('creatorCTA');

  const updatePreview = () => {
    if (!canvas) return;
    const h = headline ? headline.value : 'Premium Power';
    const b = body ? body.value : 'Unlock exclusive rewards';
    const c = cta ? cta.value : 'Upgrade Now';

    // Update any text inside the canvas preview if it exists
    const prevH = canvas.querySelector('.live-headline');
    const prevB = canvas.querySelector('.live-body');
    const prevC = canvas.querySelector('.live-cta');

    if (prevH) prevH.textContent = h;
    if (prevB) prevB.textContent = b;
    if (prevC) prevC.textContent = c;
  };

  [headline, body, cta].forEach(el => {
    if (el) el.addEventListener('input', updatePreview);
  });

  // Bonus: also allow direct canvas click to focus controls
  canvas.addEventListener('click', () => {
    if (headline) headline.focus();
  });
}

// Wire it after DOM ready
setTimeout(wireCreatorLivePreview, 650);

// Initialize AB vote displays
setTimeout(() => {
  if (typeof updateABVoteDisplays === 'function') updateABVoteDisplays();
  // ensure initial summary text
  const sum = document.getElementById('abWinnerSummary');
  if (sum && !abCurrentWinner) sum.textContent = 'Run simulation or vote to determine winner.';
}, 900);

// Export PNG removed (no real image generation in this prototype without APIs) 
// function stubbed
function exportAssetPNG() {
  showToast('Export PNG removed in this build (prototype only).', 'info');
}





function buildGeniusImagePrompt(brief, format, market, locale) {
  const b = (brief || '').trim();
  const hasMetal = /metal|card|premium/i.test(b);
  const hasCashback = /cashback|reward|cash back|cash-back/i.test(b);
  const hasCrypto = /crypto|bitcoin|eth|web3|blockchain/i.test(b);
  const hasOpen = /open.?banking|banking|seamless/i.test(b);
  const hasVideo = /video|reel|motion|story|animate/i.test(b);

  let prompt = `Ultra-premium cinematic production photograph for a Revolut ${format} marketing asset targeting ${market}. `;

  prompt += `Hero subject: a precision-engineered Revolut Premium metal card in brushed titanium black with razor-sharp engraved details, beveled edges and a luminous holographic chip element, positioned at a dynamic 35-degree angle. Dramatic cinematic lighting with a strong key light from the upper left creating beautiful specular highlights and soft gradient reflections across the metallic surface, subtle rim light separating the card from the background. `;

  if (hasMetal) {
    prompt += `The metal card dominates the composition with hyper-real material detail — brushed textures, micro-engravings, and authentic weight. `;
  }
  if (hasCashback) {
    prompt += `Graceful floating cashback reward graphics — crisp lime and emerald percentage callouts (e.g. "1%"), shimmering coin-like reward particles, and elegant benefit trails — arranged with perfect negative space around the card. `;
  }
  if (hasCrypto) {
    prompt += `Subtle holographic crypto elements and delicate real-time price tickers in electric purple-to-cyan gradients, floating ethereally in the mid-ground with soft glows and faint data lattice. `;
  }
  if (hasOpen) {
    prompt += `Faint elegant open-banking connectivity motifs — secure abstract node lines and trust signals — integrated tastefully deep in the background. `;
  }

  prompt += `${b} `;

  prompt += `Overall aesthetic: modern luxury fintech, deep rich navy (#0a1628) to absolute black gradient background, vibrant teal (#00d4aa) and lime accent highlights, impeccable typography hierarchy reserved in the lower and right thirds for clean overlay text. Sophisticated commercial studio photography fused with cinematic drama. Shot on large format, shallow depth of field, razor focus on card details, no people, zero clutter, generous breathing room. Hyper-detailed, 8K resolution, photoreal materials, confident aspirational mood, premium advertising quality, flawless composition.`;

  if (hasVideo) {
    prompt += ` Designed with motion in mind: strong focal point, smooth parallax-friendly layers, text safe zones.`;
  }

  return prompt;
}

function deepInlineStyles(sourceElement) {
  const clone = sourceElement.cloneNode(true);

  // Only the properties that actually affect how the ad looks
  const propsToCopy = [
    'background', 'background-color', 'background-image', 'background-size', 'background-position', 'background-repeat',
    'color', 'font-family', 'font-size', 'font-weight', 'font-style', 'line-height', 'letter-spacing', 'text-align', 'text-transform', 'white-space', 'text-shadow',
    'border', 'border-radius', 'border-color', 'border-style', 'border-width', 'box-shadow',
    'padding', 'margin', 'width', 'height', 'min-width', 'max-width', 'display', 'position',
    'flex-direction', 'flex-wrap', 'align-items', 'justify-content', 'gap', 'align-self',
    'box-sizing', 'overflow', 'opacity', 'transform', 'z-index', 'vertical-align'
  ];

  const walker = (original, cloned) => {
    if (!original || !cloned) return;

    const computed = window.getComputedStyle(original);
    let styleString = '';

    for (const prop of propsToCopy) {
      const value = computed.getPropertyValue(prop);
      if (value && value !== 'none' && value !== 'normal' && value !== 'auto' && value !== '0px') {
        styleString += `${prop}:${value};`;
      }
    }

    // Always keep the original inline styles that were already there (they are usually the important ones)
    if (original.style.cssText) {
      styleString = original.style.cssText + (styleString ? ';' + styleString : '');
    }

    cloned.style.cssText = styleString;

    const origChildren = original.children;
    const cloneChildren = cloned.children;
    for (let i = 0; i < origChildren.length; i++) {
      walker(origChildren[i], cloneChildren[i]);
    }
  };

  walker(sourceElement, clone);
  return clone;
}

function improvedFallbackExport(target, scale = 2) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const rect = target.getBoundingClientRect();

  canvas.width = Math.round(rect.width * scale);
  canvas.height = Math.round(rect.height * scale);

  ctx.fillStyle = '#0a0d14';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Strong fallback with inlined styles
  try {
    const styled = deepInlineStyles(target);
    styled.style.width = rect.width + 'px';
    styled.style.height = rect.height + 'px';

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', canvas.width);
    svg.setAttribute('height', canvas.height);

    const fo = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
    fo.setAttribute('width', '100%');
    fo.setAttribute('height', '100%');

    const div = document.createElementNS('http://www.w3.org/1999/xhtml', 'div');
    div.style.cssText = `width:${rect.width}px;height:${rect.height}px;transform:scale(${scale});transform-origin:top left;`;
    div.appendChild(styled);

    fo.appendChild(div);
    svg.appendChild(fo);

    const data = new XMLSerializer().serializeToString(svg);
    const url = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(data)));

    const tmp = new Image();
    tmp.onload = () => {
      ctx.drawImage(tmp, 0, 0, canvas.width, canvas.height);
      try {
        const dataUrl = canvas.toDataURL('image/png', 0.95);
        const fmt = document.getElementById('assetFormat')?.value || 'creative';
        const filename = `grovolut-export-${Date.now()}.png`;

        const btn = document.getElementById('exportAssetBtn');
        if (btn) {
          btn._pendingPng = { dataUrl, filename };
          btn.textContent = '💾 Save PNG';
          btn.style.opacity = '';
          btn.style.pointerEvents = '';

          const origText = btn.textContent; // will be overwritten
          const originalOnClick = btn.onclick;

          btn.onclick = function saveNow() {
            const pending = btn._pendingPng;
            if (pending) {
              const a = document.createElement('a');
              a.href = pending.dataUrl;
              a.download = pending.filename;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              showToast('📥 PNG exported (fallback) — matches screen', 'success');
              delete btn._pendingPng;
            }
            btn.textContent = '⬇️ Export PNG';
            btn.onclick = originalOnClick;
            if (typeof finishExport === 'function') finishExport();
          };

          showToast('Export ready — click "Save PNG" to download', 'info');
        } else {
          // ultimate fallback
          const a = document.createElement('a');
          a.href = dataUrl;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
      } catch (e) {
        console.warn('Fallback toDataURL failed', e);
      }
    };
    tmp.src = url;
    return;
  } catch (e) {}

  // Last resort - very basic but guaranteed
  ctx.fillStyle = '#fff';
  ctx.font = '14px Inter, sans-serif';
  ctx.fillText('Grovolut Creative Export', 20, 30);
  try {
    const dataUrl = canvas.toDataURL('image/png');
    const filename = `grovolut-basic-${Date.now()}.png`;
    const btn = document.getElementById('exportAssetBtn');
    if (btn) {
      btn._pendingPng = { dataUrl, filename };
      btn.textContent = '💾 Save PNG';
      btn.style.opacity = '';
      btn.style.pointerEvents = '';

      const originalOnClick = btn.onclick;
      btn.onclick = function saveNow() {
        const pending = btn._pendingPng;
        if (pending) {
          const a = document.createElement('a');
          a.href = pending.dataUrl;
          a.download = pending.filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          showToast('📥 Basic PNG exported', 'info');
          delete btn._pendingPng;
        }
        btn.textContent = '⬇️ Export PNG';
        btn.onclick = originalOnClick;
      };
      showToast('Basic export ready — click to save', 'info');
    } else {
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  } catch (e) {}
}

// (Old fallback removed - improvedFallbackExport is used instead)

// Export PNG button removed per request (prototype only, no real API image export)

// ═══════════════════════════════════════════════════════════════
// COMMAND PALETTE (Grok-style Ctrl+K / Cmd+K)
// ═══════════════════════════════════════════════════════════════

let paletteOpen = false;

function openCommandPalette() {
  if (paletteOpen) return;
  paletteOpen = true;

  const existing = document.getElementById('commandPalette');
  if (existing) existing.remove();

  const palette = document.createElement('div');
  palette.id = 'commandPalette';
  palette.style.cssText = `
    position:fixed; top:18%; left:50%; transform:translateX(-50%); z-index:99999;
    width: min(620px, 92vw); background:#0c1018; border:1px solid var(--border-hover);
    border-radius:14px; box-shadow:0 30px 80px rgba(0,0,0,0.6); overflow:hidden;
    font-family: Inter, system-ui, sans-serif;
  `;

  palette.innerHTML = `
    <div style="padding:10px 14px; border-bottom:1px solid var(--border-default); display:flex; gap:8px; align-items:center; background:rgba(255,255,255,0.02);">
      <span style="font-size:0.8rem; color:var(--text-muted);">Command Palette</span>
      <input id="paletteInput" placeholder="Type to search actions or tabs..." style="flex:1; background:transparent; border:none; outline:none; color:#fff; font-size:0.95rem;">
    </div>
    <div id="paletteResults" style="max-height:320px; overflow:auto; padding:4px 0;"></div>
    <div style="padding:8px 14px; font-size:0.68rem; color:var(--text-muted); border-top:1px solid var(--border-default);">Esc to close • Enter to run • Tab to navigate</div>
  `;

  document.body.appendChild(palette);

  const input = palette.querySelector('#paletteInput');
  const results = palette.querySelector('#paletteResults');

  const actions = [
    { label: 'Generate Asset', action: () => { switchTab('generator'); document.getElementById('assetPrompt')?.focus(); palette.remove(); paletteOpen=false; } },
    { label: '🚀 Run Autonomous Production Pipeline', action: () => { palette.remove(); paletteOpen=false; runAutonomousPipeline(); } },
    { label: 'Open Prompt Generator', action: () => { switchTab('prompt-generator'); palette.remove(); paletteOpen=false; } },
    { label: 'Open A/B Test Studio', action: () => { switchTab('ab-test'); palette.remove(); paletteOpen=false; } },
    { label: 'Open Campaigns', action: () => { switchTab('campaigns'); palette.remove(); paletteOpen=false; } },
    { label: 'Run Brand Guardian Scan', action: () => { switchTab('guardian'); setTimeout(() => document.getElementById('uploadArea')?.click?.(), 300); palette.remove(); paletteOpen=false; } },
    { label: 'Switch to Genius (Grok)', action: () => { state.mode='genius'; state.geniusAI='grok'; const ms=document.getElementById('modeSelect'); const gs=document.getElementById('geniusAISelect'); if(ms) ms.value='genius'; if(gs) gs.value='grok'; if(typeof updateModeUI==='function') updateModeUI(); palette.remove(); paletteOpen=false; showToast('Switched to Genius (Grok xAI)', 'info'); } },
    { label: 'Clear all state (local)', action: () => { localStorage.clear(); location.reload(); } },
  ];

  function renderResults(filter = '') {
    const f = filter.toLowerCase();
    const matches = actions.filter(a => a.label.toLowerCase().includes(f));
    results.innerHTML = matches.map((a, i) => `
      <div class="palette-item" data-idx="${i}" style="padding:9px 16px; cursor:pointer; font-size:0.9rem; display:flex; justify-content:space-between; align-items:center;">
        <span>${a.label}</span>
      </div>
    `).join('') || `<div style="padding:12px 16px; color:#666; font-size:0.85rem;">No matches</div>`;

    results.querySelectorAll('.palette-item').forEach(el => {
      el.onmousedown = (e) => {
        const idx = parseInt(el.dataset.idx);
        if (matches[idx]) matches[idx].action();
      };
    });
  }

  renderResults();

  input.oninput = (e) => renderResults(e.target.value);
  input.focus();

  const close = () => { palette.remove(); paletteOpen = false; };
  palette.onkeydown = (e) => {
    if (e.key === 'Escape') close();
    if (e.key === 'Enter') {
      const first = results.querySelector('.palette-item');
      if (first) first.dispatchEvent(new MouseEvent('mousedown'));
    }
  };

  // Click outside to close
  setTimeout(() => {
    document.addEventListener('click', function handler(ev) {
      if (!palette.contains(ev.target)) {
        close();
        document.removeEventListener('click', handler);
      }
    }, { once: true });
  }, 10);
}

// Global hotkey
document.addEventListener('keydown', function(e) {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    openCommandPalette();
  }
});

// Add a little hint button next to autonomous? (optional - already good)

// Final init touches
document.addEventListener('DOMContentLoaded', () => {
  // Initialize new mode UI (modeSelect + geniusAI)
  if (typeof initModeUI === 'function') {
    initModeUI();
  } else if (typeof updateModeUI === 'function') {
    updateModeUI();
  }

  // Seed campaigns UI if on that tab already (rare)
  setTimeout(() => {
    const campContainer = document.getElementById('campaignsContainer');
    if (campContainer) renderCampaigns();
  }, 300);

  // Add "Export PNG" hint to asset header if desired (already handled in generate override)
  console.log('%c[Grovolut] Enhanced prototype ready. Mode: Simulated / Genius + AI. Ctrl/Cmd+K for command palette.', 'color:#0d4');
});
