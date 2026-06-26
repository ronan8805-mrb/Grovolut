/* ========================================
   GROVOLUT — Interactive Application Logic
   Autonomous Creative Production Engine
   ======================================== */

// ── State ──
const state = {
  provider: 'simulated',
  activeTab: 'academy',
  currentLocale: 'ES',
  generatedAsset: null,
  wipMode: false,
  assemblyRunning: false,
  iterationCount: 1,
  agentLogs: [],
};

// ── Provider Selector ──
const providerSelect = document.getElementById('aiProvider');
const apiKeyField = document.getElementById('apiKeyField');
const providerBadge = document.getElementById('providerBadge');

providerSelect.addEventListener('change', function () {
  state.provider = this.value;
  const badges = {
    simulated: '🧪 Simulated Mode',
    gemini: '✦ Gemini Active',
    groq: '⚡ Groq Active',
  };
  const badgeClasses = {
    simulated: 'badge-lime',
    gemini: 'badge-blue',
    groq: 'badge-orange',
  };

  providerBadge.textContent = badges[state.provider];
  providerBadge.className = 'badge ' + badgeClasses[state.provider];

  // Update section-level badges
  ['genProviderBadge', 'guardianProviderBadge'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = state.provider === 'simulated' ? 'Simulated' : state.provider === 'gemini' ? 'Gemini' : 'Groq';
      el.className = 'badge ' + badgeClasses[state.provider];
    }
  });

  // Show/hide API key
  if (state.provider === 'simulated') {
    apiKeyField.style.display = 'none';
  } else {
    apiKeyField.style.display = 'flex';
  }

  showToast(`Provider switched to ${badges[state.provider]}`, 'info');
});

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

// ── Asset Format Change — update size live ──
const formatSelect = document.getElementById('assetFormat');
if (formatSelect) {
  formatSelect.addEventListener('change', function () {
    // Regenerate asset on format change regardless of prior generation
    generateAsset();
  });
}

// ── Test Connection ──
function testConnection() {
  const btn = document.getElementById('testConnectionBtn');
  btn.classList.add('loading');
  btn.disabled = true;

  setTimeout(() => {
    btn.classList.remove('loading');
    btn.disabled = false;
    showToast(`✅ Connection to ${state.provider === 'gemini' ? 'Gemini (Google)' : 'Groq'} successful!`, 'success');
  }, 1500);
}

// ── Tab Navigation ──
document.querySelectorAll('.tab-btn').forEach((btn) => {
  btn.addEventListener('click', () => switchTab(btn.dataset.tab));
});

function switchTab(tabId) {
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
      <div>Generating with <strong>${state.provider === 'simulated' ? 'Simulated Engine' : state.provider === 'gemini' ? 'Gemini (Google)' : 'Groq (Fast)'}</strong>...</div>
      <div class="text-xs text-muted mt-sm">Processing creative brief for ${market} market</div>
    </div>
  `;

  const delay = state.provider === 'groq' ? 800 : state.provider === 'gemini' ? 2000 : 1500;

  setTimeout(() => {
    btn.classList.remove('loading');
    btn.disabled = false;
    output.classList.remove('generating');

    const locale = localisedContent[market] || localisedContent['EN'];
    const providerNote = state.provider !== 'simulated'
      ? `<div class="badge badge-${state.provider === 'gemini' ? 'blue' : 'orange'}" style="margin-bottom:12px;">Generated via ${state.provider === 'gemini' ? 'Gemini API' : 'Groq API'}</div>`
      : '';

    let sizeStyles = getSizeStyles(format);
    let contentHTML = '';

    if (format === 'story') {
      contentHTML = `
        <div>
          <img src="${logoFile}?v=${Date.now()}" style="height: 36px; width: auto; object-fit: contain; margin-bottom: 24px; display: block;" alt="Revolut Logo" onerror="this.style.display='none'" />
          <div style="font-size:0.65rem;text-transform:uppercase;letter-spacing:0.18em;color:var(--accent-lime);margin-bottom:12px;font-weight:700;">Revolut Premium</div>
          <div style="font-size:1.6rem;font-weight:800;margin-bottom:16px;background:linear-gradient(135deg, #fff 30%, var(--accent-lime) 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;line-height:1.2;">${locale.headline}</div>
          <div style="font-size:0.85rem;color:var(--text-tertiary);line-height:1.5;">${locale.body}</div>
        </div>
        <div>
          <div style="display:block;text-align:center;background:var(--accent-lime);color:var(--bg-primary);padding:12px 24px;border-radius:var(--radius-full);font-weight:700;font-size:0.85rem;cursor:pointer;transition:all 0.2s;margin-bottom:20px;">${locale.cta}</div>
          <div style="font-size:0.55rem;color:var(--text-muted);padding-top:12px;border-top:1px solid var(--border-default);">${locale.disclaimer}</div>
        </div>
      `;
    } else if (format === 'banner') {
      // Display Banner (728×90) -
      sizeStyles = `width:728px;height:90px;max-width:100%;border-radius:var(--radius-lg);overflow:hidden;position:relative;`;
      contentHTML = `
        <div style="display: flex; align-items: center; gap: 16px; flex: 1; min-width: 0;">
          <img src="${logoFile}?v=${Date.now()}" style="height: 28px; width: auto; object-fit: contain; display: block;" alt="Revolut Logo" onerror="this.style.display='none'" />
          <div style="min-width: 0; flex: 1;">
            <div style="font-size:0.95rem;font-weight:800;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:1.2;">${locale.headline}</div>
            <div style="font-size:0.7rem;color:var(--text-tertiary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:2px;">${locale.body}</div>
          </div>
        </div>
        <div style="display: flex; flex-direction: column; align-items: flex-end; justify-content: center; flex-shrink: 0;">
          <div style="display:inline-block;background:var(--accent-lime);color:var(--bg-primary);padding:6px 16px;border-radius:var(--radius-full);font-weight:700;font-size:0.75rem;cursor:pointer;transition:all 0.2s;white-space:nowrap;">${locale.cta}</div>
          <div style="font-size:0.45rem;color:var(--text-muted);margin-top:4px;white-space:nowrap;text-align:right;">${locale.disclaimer}</div>
        </div>
      `;
    } else if (format === 'email') {
      // Email Header (600×200) -
      sizeStyles = `width:600px;height:200px;max-width:100%;border-radius:var(--radius-lg);overflow:hidden;position:relative;`;
      contentHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <div style="font-size:0.55rem;text-transform:uppercase;letter-spacing:0.18em;color:var(--accent-lime);margin-bottom:4px;font-weight:700;">Revolut Premium</div>
            <div style="font-size:1.2rem;font-weight:800;color:#fff;line-height:1.25;">${locale.headline}</div>
          </div>
          <img src="${logoFile}?v=${Date.now()}" style="height: 24px; width: auto; object-fit: contain;" alt="Revolut Logo" onerror="this.style.display='none'" />
        </div>
        <div style="font-size:0.75rem;color:var(--text-tertiary);line-height:1.4;margin: 8px 0;">${locale.body}</div>
        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-default); padding-top: 8px;">
          <div style="font-size:0.5rem;color:var(--text-muted);max-width: 65%;">${locale.disclaimer}</div>
          <div style="background:var(--accent-lime);color:var(--bg-primary);padding:6px 14px;border-radius:var(--radius-full);font-weight:700;font-size:0.75rem;cursor:pointer;">${locale.cta}</div>
        </div>
      `;
    } else if (format === 'video') {
      // Video Script (15s) -> Aspect ratio 16:9 widescreen
      sizeStyles = 'width: 100%; max-width: 480px; aspect-ratio: 16/9; display: flex; flex-direction: column; justify-content: space-between; padding: 20px; box-sizing: border-box;';
      contentHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 6px;">
          <div style="font-size:0.65rem; color:var(--accent-lime); font-weight:700; text-transform:uppercase; letter-spacing:0.1em;">🎬 Video Script (15s)</div>
          <img src="${logoFile}?v=${Date.now()}" style="height: 20px; width: auto; object-fit: contain;" alt="Revolut Logo" onerror="this.style.display='none'" />
        </div>
        <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; margin: 8px 0;">
          <div style="font-size:0.75rem; color:var(--text-secondary); line-height:1.45;">
            <span style="color:var(--accent-cyan); font-weight:bold;">[Visual]</span> Fast montage of metal card catching light.<br/>
            <span style="color:var(--accent-teal); font-weight:bold;">[Voiceover]</span> "${locale.headline}. ${locale.body}"
          </div>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.55rem; color: var(--text-muted);">
          <span>${locale.disclaimer}</span>
          <span style="color:var(--accent-lime); font-weight:bold;">CTA: ${locale.cta}</span>
        </div>
      `;
    } else {
      // Social Media (1080×1080) -
      sizeStyles = `width:1080px;height:1080px;max-width:100%;border-radius:var(--radius-lg);overflow:hidden;position:relative;`;
      contentHTML = `
        <div>
          <img src="${logoFile}?v=${Date.now()}" style="height: 32px; width: auto; object-fit: contain; margin-bottom: 12px; display: block;" alt="Revolut Logo" onerror="this.style.display='none'" />
          <div style="font-size:0.6rem;text-transform:uppercase;letter-spacing:0.18em;color:var(--accent-lime);margin-bottom:6px;font-weight:700;">Revolut Premium</div>
          <div style="font-size:1.35rem;font-weight:800;margin-bottom:8px;background:linear-gradient(135deg, #fff 30%, var(--accent-lime) 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;line-height:1.25;">${locale.headline}</div>
          <div style="font-size:0.8rem;color:var(--text-tertiary);line-height:1.4;margin-bottom:12px;">${locale.body}</div>
        </div>
        <div>
          <div style="display:inline-block;background:var(--accent-lime);color:var(--bg-primary);padding:8px 20px;border-radius:var(--radius-full);font-weight:700;font-size:0.8rem;cursor:pointer;transition:all 0.2s;margin-bottom:12px;">${locale.cta}</div>
          <div style="font-size:0.55rem;color:var(--text-muted);padding-top:8px;border-top:1px solid var(--border-default);">${locale.disclaimer}</div>
        </div>
      `;
    }

    output.innerHTML = `
      ${providerNote}
      <div style="background:linear-gradient(135deg, #0d0d1a 0%, #1a1a2e 50%, #16213e 100%);border-radius:16px;border:1px solid var(--border-hover);position:relative;overflow:hidden;margin:0 auto;${sizeStyles}">
        <div style="position:absolute;top:-40px;right:-40px;width:200px;height:200px;background:radial-gradient(circle,rgba(184,240,62,0.08),transparent);border-radius:50%;pointer-events:none;"></div>
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
    `;

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
      return 'width:360px;height:640px;max-width:100%;aspect-ratio:9/16;border-radius:var(--radius-lg);overflow:hidden;position:relative;display:flex;flex-direction:column;justify-content:space-between;padding:24px;box-sizing:border-box;';
    case 'banner':
      return 'width:728px;height:90px;max-width:100%;border-radius:var(--radius-lg);overflow:hidden;position:relative;';
    case 'email':
      return 'width:600px;height:200px;max-width:100%;border-radius:var(--radius-lg);overflow:hidden;position:relative;';
    case 'video':
      return 'width:100%;max-width:480px;aspect-ratio:16/9;display:flex;flex-direction:column;justify-content:space-between;padding:20px;box-sizing:border-box;';
    case 'social':
    default:
      return 'width:1080px;height:1080px;max-width:100%;border-radius:var(--radius-lg);overflow:hidden;position:relative;';
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
  const providerLabel = state.provider === 'simulated' ? '🧪 Simulated' : state.provider === 'gemini' ? '✦ Gemini' : '⚡ Groq';

  // Clear placeholder
  if (state.agentLogs.length === 0) {
    logContainer.innerHTML = '';
  }

  const delay = state.provider === 'groq' ? 600 : state.provider === 'gemini' ? 1800 : 1200;

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
    'AI generating assets via ' + (state.provider === 'simulated' ? 'Simulated Engine' : state.provider === 'gemini' ? 'Gemini' : 'Groq') + '...',
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
  // Init dashboard charts (they'll be re-built when tab opens)
  // Animate KPI values
  animateCounters();

  // ── Intro Video Logic ──
  const introOverlay = document.getElementById('introOverlay');
  const introVideo = document.getElementById('introVideo');
  const introSkipBtn = document.getElementById('introSkipBtn');

  function fadeOutIntro() {
    if (introOverlay && !introOverlay.classList.contains('fade-out')) {
      introOverlay.classList.add('fade-out');
      // After transition completes, remove elements to free resources
      setTimeout(() => {
        introOverlay.remove();
      }, 1200); // 1.2s matches CSS transition duration
    }
  }

  if (introVideo && introOverlay) {
    // Attempt playback immediately
    introVideo.play().catch(err => {
      console.log('Autoplay was prevented or video failed to play:', err);
      // Fallback: if browser blocks muted autoplay, fade out immediately so site is accessible
      fadeOutIntro();
    });

    // Fade out as soon as video ends
    introVideo.addEventListener('ended', fadeOutIntro);

    // Skip Button Event
    if (introSkipBtn) {
      introSkipBtn.addEventListener('click', fadeOutIntro);
    }

    // Safety fallback: if video is 6s but event doesn't fire, fade out at 7s
    setTimeout(fadeOutIntro, 7000);
  } else {
    // Standard page load transition fallback
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.6s ease-out';
    requestAnimationFrame(() => {
      document.body.style.opacity = '1';
    });
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
    
    const masterPrompt = enhancedSections.join('\n\n');
    
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

// 4. A/B Test Studio
let simInterval = null;
function simulateABTest() {
  if (simInterval) clearInterval(simInterval);
  
  const logDiv = document.getElementById('abSimLog');
  logDiv.innerHTML = "Initializing simulated user traffic...<br>";
  showToast('⚡ Running simulation on 10,000 virtual users...', 'info');
  
  let userCount = 0;
  let clickA = 0;
  let clickB = 0;
  
  simInterval = setInterval(() => {
    userCount += 1000;
    clickA += Math.floor(Math.random() * 52) + 20; // ~4.8% CTR
    clickB += Math.floor(Math.random() * 41) + 15; // ~3.9% CTR
    
    const ctrA = ((clickA / userCount) * 100).toFixed(2);
    const ctrB = ((clickB / userCount) * 100).toFixed(2);
    
    document.getElementById('predictedCtrA').textContent = ctrA + '%';
    document.getElementById('predictedCtrB').textContent = ctrB + '%';
    
    // Append to log
    logDiv.innerHTML += `Batch ${userCount/1000}: Processed ${userCount} users... (CTR A: ${ctrA}%, CTR B: ${ctrB}%)<br>`;
    logDiv.scrollTop = logDiv.scrollHeight;
    
    // Mutate chart line path points
    const pointsA = `0,80 50,60 100,50 150,${90 - ctrA*12} 200,${90 - ctrA*14} 250,${95 - ctrA*16} 300,${95 - ctrA*17}`;
    const pointsB = `0,85 50,75 100,65 150,${90 - ctrB*11} 200,${90 - ctrB*12} 250,${95 - ctrB*13} 300,${95 - ctrB*14}`;
    document.getElementById('ctrChartLineA').setAttribute('points', pointsA);
    document.getElementById('ctrChartLineB').setAttribute('points', pointsB);
    
    if (userCount >= 10000) {
      clearInterval(simInterval);
      simInterval = null;
      logDiv.innerHTML += `<span class="text-lime font-bold">Simulation complete. Winner: Version A (Confidence 99.4%)</span>`;
      logDiv.scrollTop = logDiv.scrollHeight;
      showToast('🏆 Simulation complete! Version A has won.', 'success');
    }
  }, 300);
}

function resetABSimulation() {
  if (simInterval) {
    clearInterval(simInterval);
    simInterval = null;
  }
  document.getElementById('predictedCtrA').textContent = '4.8%';
  document.getElementById('predictedCtrB').textContent = '3.9%';
  document.getElementById('abSimLog').textContent = 'Simulation reset. Ready for next run.';
  document.getElementById('ctrChartLineA').setAttribute('points', '0,80 50,60 100,50 150,30 200,20 250,15 300,10');
  document.getElementById('ctrChartLineB').setAttribute('points', '0,85 50,75 100,65 150,55 200,45 250,42 300,40');
  showToast('Simulation data cleared.', 'info');
}

function voteAB(version, isLike) {
  showToast(`Logged ${isLike ? 'like' : 'dislike'} vote for Version ${version}. Data fed to recommendation engine.`, 'success');
}

// 5. Campaign Library filtering (by name and market)
function filterCampaigns() {
  const query = (document.getElementById('campaignSearchInput')?.value || '').toLowerCase();
  const market = document.getElementById('campaignMarketFilter')?.value || 'all';
  const cards = document.querySelectorAll('#campaignsContainer .campaign-card');
  cards.forEach(card => {
    const title = card.querySelector('.font-bold').textContent.toLowerCase();
    const cardMarket = card.getAttribute('data-market') || '';
    const matchQuery = title.includes(query);
    const matchMarket = (market === 'all' || cardMarket === market);
    if (matchQuery && matchMarket) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
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
    select.innerHTML = state.campaigns.map(cam => `<option value="${cam.id}">${cam.name} (${cam.market})</option>`).join('');
  }
  document.getElementById('addToCampaignModal').style.display = 'flex';
}

function closeAddToCampaignModal() {
  document.getElementById('addToCampaignModal').style.display = 'none';
  pendingAssetToAdd = null;
}

function submitAddToCampaign() {
  const camId = document.getElementById('addToCampaignSelect').value;
  const cam = state.campaigns.find(c => c.id === camId);
  if (cam && pendingAssetToAdd) {
    cam.assets.push(pendingAssetToAdd);
    renderCampaigns();
    closeAddToCampaignModal();
    showToast(`Successfully added ${pendingAssetToAdd} to campaign: ${cam.name}`, 'success');
  }
}

// 3. Creator Tool Canvas templates & controls
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
      <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 4px;">
        <div style="font-size:0.5rem;text-transform:uppercase;letter-spacing:0.12em;color:var(--accent-teal);font-weight:700;">Revolut Premium</div>
        <h2 id="creatorPreviewHeadline" style="font-size:1.1rem;font-weight:800;margin:0;color:#fff;">Upgrade Your Financial Power</h2>
        <p id="creatorPreviewSubtext" style="font-size:0.7rem;color:var(--text-muted);margin:0;">Metal card • Unlimited transfers • Premium cashback</p>
      </div>
      <div id="creatorPreviewCTA" style="display:inline-block;background:var(--accent-teal);color:#0b1018;padding:6px 16px;border-radius:var(--radius-full);font-weight:700;font-size:0.75rem;white-space:nowrap;margin-left:12px;cursor:pointer;">Upgrade Now →</div>
    `;
  } else {
    card.innerHTML = `
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
    if (bgTheme === 'midnight') {
      card.style.background = 'linear-gradient(135deg, #0b1018, #131b28)';
      card.style.border = '1px solid rgba(255,255,255,0.06)';
      if (hNode) {
        hNode.style.background = 'linear-gradient(135deg, #fff, var(--accent-teal))';
        hNode.style.webkitBackgroundClip = 'text';
        hNode.style.webkitTextFillColor = 'transparent';
      }
      if (sNode) sNode.style.color = 'var(--text-muted)';
    } else if (bgTheme === 'slate') {
      card.style.background = '#2c3540';
      card.style.border = '1px solid rgba(255,255,255,0.1)';
      if (hNode) {
        hNode.style.background = 'none';
        hNode.style.webkitTextFillColor = 'initial';
        hNode.style.color = '#ffffff';
      }
      if (sNode) sNode.style.color = '#a0aec0';
    } else if (bgTheme === 'ultra') {
      card.style.background = 'linear-gradient(135deg, #050b14, #0b1c3a)';
      card.style.border = '1px solid var(--accent-blue-dim)';
      if (hNode) {
        hNode.style.background = 'linear-gradient(135deg, #ffffff, #4d8df7)';
        hNode.style.webkitBackgroundClip = 'text';
        hNode.style.webkitTextFillColor = 'transparent';
      }
      if (sNode) sNode.style.color = '#718096';
    } else if (bgTheme === 'light') {
      card.style.background = '#f4f5f7';
      card.style.border = '1px solid #dcdfe4';
      if (hNode) {
        hNode.style.background = 'none';
        hNode.style.webkitTextFillColor = 'initial';
        hNode.style.color = '#0b1018';
      }
      if (sNode) sNode.style.color = '#5a6578';
    }
  }
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

function renderCampaigns() {
  const container = document.getElementById('campaignsContainer');
  if (!container) return;
  container.innerHTML = state.campaigns.map(cam => {
    let badgeClass = cam.status === 'Live' ? 'badge-green' : cam.status === 'Draft' ? 'badge-cyan' : 'badge-orange';
    if (cam.status === 'Approved') badgeClass = 'badge-green';
    return `
      <div class="card campaign-card" style="padding:12px;" data-market="${cam.market}">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <span class="badge ${badgeClass}">${cam.status}</span>
          <span class="text-xs text-muted">${cam.market} market</span>
        </div>
        <div class="font-bold text-sm" style="color:var(--text-secondary);">${cam.name}</div>
        <div class="mt-sm text-xs text-muted" style="line-height:1.4;">
          <div>Views: <span class="font-bold text-secondary">${(cam.views / 1000).toFixed(0)}k</span></div>
          <div>CTR: <span class="font-bold text-lime">${cam.ctr.toFixed(1)}%</span></div>
          <div>Conversions: <span class="font-bold text-secondary">${cam.conversions}</span></div>
          <div style="margin-top:4px;">Assets (${cam.assets.length}): <span class="font-bold text-secondary" style="font-size:0.75rem; word-break:break-all;">${cam.assets.join(', ') || 'None'}</span></div>
        </div>
        <div class="flex gap-xs mt-md">
          <button class="btn btn-sm btn-outline" onclick="duplicateCampaign('${cam.id}')">Duplicate</button>
          <button class="btn btn-sm btn-secondary" onclick="exportCampaign('${cam.id}')">Export</button>
        </div>
        <div class="flex gap-xs mt-sm" style="border-top:1px solid var(--border-default); padding-top:8px;">
          <button class="btn btn-xs btn-outline btn-green" onclick="setCampaignStatus('${cam.id}', 'Approved')" style="flex:1; padding:4px 0; font-size:0.7rem;">✓ Approve</button>
          <button class="btn btn-xs btn-outline btn-orange" onclick="setCampaignStatus('${cam.id}', 'Changes Requested')" style="flex:1; padding:4px 0; font-size:0.7rem;">✗ Reject</button>
        </div>
      </div>
    `;
  }).join('');
}

function setCampaignStatus(camId, status) {
  const cam = state.campaigns.find(c => c.id === camId);
  if (cam) {
    cam.status = status;
    renderCampaigns();
    showToast(`Campaign status updated to ${status}!`, status === 'Approved' ? 'success' : 'warning');
  }
}

function duplicateCampaign(camId) {
  const cam = state.campaigns.find(c => c.id === camId);
  if (cam) {
    const newCam = {
      ...cam,
      id: `cam-${Date.now()}`,
      name: `${cam.name} (Copy)`,
      status: 'Draft',
      views: 0,
      ctr: 0.0,
      conversions: 0,
      assets: [...cam.assets]
    };
    state.campaigns.push(newCam);
    renderCampaigns();
    showToast(`Campaign duplicated as ${newCam.name}!`, 'success');
  }
}

function exportCampaign(camId) {
  const cam = state.campaigns.find(c => c.id === camId);
  if (cam) {
    showToast(`Exported campaign: ${cam.name} with ${cam.assets.length} assets.`, 'success');
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
  const providerLabel = state.provider === 'simulated' ? '🧪 Simulated' : state.provider === 'gemini' ? '✦ Gemini' : '⚡ Groq';

  if (state.agentLogs.length === 0) {
    logContainer.innerHTML = '';
  }

  const delay = state.provider === 'groq' ? 800 : state.provider === 'gemini' ? 2200 : 1500;
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
});

// Re-init when switching to the tab
const origSwitchTab = switchTab;
switchTab = function(tabId) {
  origSwitchTab(tabId);
  if (tabId === 'target-markets') {
    initTargetMarkets();
  }
};
