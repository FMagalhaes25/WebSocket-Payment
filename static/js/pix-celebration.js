/*
 * pix-celebration.js
 * Anima a transição "pagamento pendente" -> "pagamento confirmado" sem reload.
 *
 * Uso na tela pendente (payment.html):
 *   <script src="/static/js/pix-celebration.js"
 *           data-check="/static/template_img/check.svg"
 *           data-currency="/static/template_img/currency.svg"></script>
 *   ...e chamar celebratePayment() no evento do socket.
 *
 * Uso na tela confirmada (confirmed_payment.html): mesma tag + data-auto="true"
 *
 * Não depende de nenhuma alteração no styles.css nem na estrutura do HTML.
 */
(function () {
  "use strict";

  var script = document.currentScript;
  var data = (script && script.dataset) || {};
  var CHECK = data.check || "/static/template_img/check.svg";
  var COIN = data.currency || "/static/template_img/currency.svg";

  var reduce =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var TITLE_TEXT = "Pedido confirmado!";
  var DESC_TEXT =
    "Tudo certo com o seu pedido. O pagamento no pix foi confirmado pelo seu banco.";
  var FOOTER_TEXT = "Recebemos a confirmação do pagamento do seu pedido via pix!";

  var GREEN = "#56A92F";
  var COLORS = ["#56A92F", "#8BD45F", "#4551E6", "#8E97FF", "#FFC93C", "#FFFFFF"];

  /* ---------------------------------------------------------------
     CSS injetado (nada disso precisa entrar no styles.css)
     --------------------------------------------------------------- */

  var CSS = `
  #qr-code { position: relative; }

  /* o QR ocupa 14.5rem + 2rem de margem: o centro real fica 1rem à esquerda */
  #confirmed-icon {
    position: absolute;
    top: 50%;
    left: calc(50% - 1rem);
    width: 4.93rem;
    height: 4.93rem;
    max-width: 4.93rem;
    max-height: 4.93rem;
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.2);
    z-index: 2;
  }

  #confirmed-icon.pix-pop {
    animation: pix-check-pop 0.75s cubic-bezier(0.2, 1.5, 0.35, 1) 0.2s forwards;
  }

  @keyframes pix-check-pop {
    0%   { opacity: 0; transform: translate(-50%, -50%) scale(0.2) rotate(-22deg); }
    55%  { opacity: 1; transform: translate(-50%, -50%) scale(1.16) rotate(5deg); }
    100% { opacity: 1; transform: translate(-50%, -50%) scale(1) rotate(0deg); }
  }

  /* QR vira fantasma atrás do check */
  .pix-qr-out { animation: pix-qr-dissolve 0.7s cubic-bezier(0.4, 0, 0.2, 1) forwards; }

  @keyframes pix-qr-dissolve {
    to { opacity: 0.14; filter: blur(4px) grayscale(1); transform: scale(0.9); }
  }

  /* ondas concêntricas */
  .pix-rings { position: absolute; inset: 0; pointer-events: none; }

  .pix-rings span {
    position: absolute;
    top: 50%;
    left: calc(50% - 1rem);
    width: 4.93rem;
    height: 4.93rem;
    margin: -2.465rem 0 0 -2.465rem;
    border: 2px solid ${GREEN};
    border-radius: 50%;
    opacity: 0;
    animation: pix-ring 1.5s cubic-bezier(0.16, 0.8, 0.3, 1) forwards;
  }

  .pix-rings span:nth-child(2) { animation-delay: 0.14s; }
  .pix-rings span:nth-child(3) { animation-delay: 0.28s; }

  @keyframes pix-ring {
    0%   { opacity: 0.5; transform: scale(0.55); }
    100% { opacity: 0;   transform: scale(2.9); }
  }

  /* brilho varrendo o card + borda pulsando */
  .pix-glow {
    position: relative;
    overflow: hidden;
    animation: pix-border-glow 1.6s ease 0.15s;
  }

  .pix-glow::after {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: linear-gradient(115deg, transparent 34%, rgba(86,169,47,0.16) 50%, transparent 66%);
    transform: translateX(-100%);
    animation: pix-sweep 1.25s cubic-bezier(0.3, 0, 0.2, 1) 0.1s;
  }

  @keyframes pix-sweep { to { transform: translateX(100%); } }

  @keyframes pix-border-glow {
    0%   { border-color: #e3e3e3; box-shadow: 0 0 0 0 rgba(86,169,47,0); }
    35%  { border-color: #8BD45F; box-shadow: 0 0 0 6px rgba(86,169,47,0.10); }
    100% { border-color: #e3e3e3; box-shadow: 0 0 0 0 rgba(86,169,47,0); }
  }

  /* troca de texto */
  .pix-out { animation: pix-out 0.26s cubic-bezier(0.4, 0, 1, 1) forwards; }
  .pix-in  { animation: pix-in 0.45s cubic-bezier(0, 0.6, 0.3, 1) forwards; }

  @keyframes pix-out {
    to { opacity: 0; transform: translateY(-10px); filter: blur(3px); }
  }

  @keyframes pix-in {
    from { opacity: 0; transform: translateY(12px); filter: blur(3px); }
    to   { opacity: 1; transform: none; filter: none; }
  }

  .pix-success-text { color: ${GREEN}; transition: color 0.6s ease; }

  /* valor da compra piscando */
  .pix-flash { animation: pix-flash 1.4s ease 0.35s; }

  @keyframes pix-flash {
    0%, 100% { background-color: #f5f5f5; color: #575757; }
    30%, 60% { background-color: rgba(86,169,47,0.12); color: ${GREEN}; }
  }

  /* card do prazo trocando de conteúdo */
  .pix-morph { position: relative; overflow: hidden; }

  .pix-ripple {
    position: absolute;
    left: 2.7rem;
    top: 50%;
    width: 12px;
    height: 12px;
    margin: -6px 0 0 -6px;
    border-radius: 50%;
    background: rgba(86,169,47,0.16);
    pointer-events: none;
    animation: pix-ripple 0.9s cubic-bezier(0.16, 0.8, 0.3, 1) forwards;
  }

  @keyframes pix-ripple {
    0%   { opacity: 1; transform: scale(1); }
    100% { opacity: 0; transform: scale(90); }
  }

  #expiration-time > img { width: 2.5rem; height: 2.5rem; flex-shrink: 0; }

  /* confete */
  .pix-confetti-layer {
    position: fixed;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
    z-index: 100;
  }

  .pix-confetti {
    position: absolute;
    animation: pix-pop var(--dur) cubic-bezier(0.12, 0.85, 0.3, 1) forwards;
  }

  .pix-confetti i {
    display: block;
    width: 8px;
    height: 13px;
    animation: pix-fall var(--dur) cubic-bezier(0.4, -0.1, 0.75, 1) forwards;
  }

  @keyframes pix-pop {
    0%   { transform: translate(-50%, -50%); }
    100% { transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))); }
  }

  @keyframes pix-fall {
    0%   { transform: translateY(0) rotate(0deg); opacity: 1; }
    65%  { opacity: 1; }
    100% { transform: translateY(var(--fall)) rotate(var(--spin)); opacity: 0; }
  }

  @media (prefers-reduced-motion: reduce) {
    #confirmed-icon { opacity: 1; transform: translate(-50%, -50%); }
    .pix-pop, .pix-qr-out, .pix-rings span, .pix-glow, .pix-glow::after,
    .pix-out, .pix-in, .pix-flash, .pix-ripple { animation: none !important; }
    .pix-qr-out { opacity: 0.14; filter: grayscale(1); }
  }
  `;

  var styleTag = document.createElement("style");
  styleTag.setAttribute("data-pix-celebration", "");
  styleTag.textContent = CSS;
  document.head.appendChild(styleTag);

  /* ---------------------------------------------------------------
     Peças da animação
     --------------------------------------------------------------- */

  function $(selector) {
    return document.querySelector(selector);
  }

  function swapText(el, text, delay) {
    if (!el) return;
    el.classList.add("pix-success-text");
    if (reduce) {
      el.textContent = text;
      return;
    }
    el.classList.add("pix-out");
    setTimeout(function () {
      el.textContent = text;
      el.classList.remove("pix-out");
      el.classList.add("pix-in");
    }, delay);
  }

  function morphFooterCard() {
    var card = document.getElementById("expiration-time");
    if (!card) return;

    var startHeight = card.offsetHeight;

    function fill() {
      card.innerHTML =
        '<img src="' + COIN + '" alt="Ícone moeda" />' +
        "<span>" + FOOTER_TEXT + "</span>";
    }

    if (reduce) {
      fill();
      return;
    }

    card.classList.add("pix-morph");
    card.style.height = startHeight + "px";

    Array.prototype.forEach.call(card.children, function (child) {
      child.classList.add("pix-out");
    });

    setTimeout(function () {
      fill();

      var ripple = document.createElement("span");
      ripple.className = "pix-ripple";
      card.appendChild(ripple);

      Array.prototype.forEach.call(card.children, function (child) {
        if (child !== ripple) child.classList.add("pix-in");
      });

      // mede a altura final e transiciona até ela
      card.style.height = "auto";
      var endHeight = card.offsetHeight;
      card.style.height = startHeight + "px";
      void card.offsetHeight;
      card.style.transition = "height 0.45s cubic-bezier(0.4, 0, 0.2, 1)";
      card.style.height = endHeight + "px";

      setTimeout(function () {
        card.style.height = "";
        card.style.transition = "";
        card.classList.remove("pix-morph");
        if (ripple.parentNode) ripple.remove();
      }, 900);
    }, 280);
  }

  function burst(origin) {
    if (!origin || reduce) return;

    var rect = origin.getBoundingClientRect();
    var x = rect.left + rect.width / 2;
    var y = rect.top + rect.height / 2;

    var layer = document.createElement("div");
    layer.className = "pix-confetti-layer";
    layer.setAttribute("aria-hidden", "true");
    document.body.appendChild(layer);

    for (var i = 0; i < 70; i++) {
      var angle = Math.random() * Math.PI * 2;
      var distance = 80 + Math.random() * 230;
      var duration = 1.2 + Math.random() * 1;

      var particle = document.createElement("span");
      particle.className = "pix-confetti";
      particle.style.left = x + "px";
      particle.style.top = y + "px";
      particle.style.setProperty("--tx", Math.cos(angle) * distance + "px");
      particle.style.setProperty("--ty", Math.sin(angle) * distance * 0.65 - 70 + "px");
      particle.style.setProperty("--fall", window.innerHeight - y + 160 + "px");
      particle.style.setProperty("--dur", duration + "s");

      var flake = document.createElement("i");
      flake.style.background = COLORS[i % COLORS.length];
      flake.style.setProperty("--spin", Math.random() * 900 - 450 + "deg");
      if (Math.random() > 0.6) flake.style.borderRadius = "50%";
      if (Math.random() > 0.75) flake.style.height = "8px";

      particle.appendChild(flake);
      layer.appendChild(particle);
    }

    setTimeout(function () {
      layer.remove();
    }, 2800);
  }

  /* ---------------------------------------------------------------
     Coreografia
     --------------------------------------------------------------- */

  var done = false;

  function celebrate(options) {
    if (done) return;
    done = true;
    options = options || {};

    var qrBox = document.getElementById("qr-code");
    var qrImage = qrBox && qrBox.querySelector("img:not(#confirmed-icon)");
    var headerCard = $("main > header");
    var title = document.getElementById("title-text") || $("main > header aside h1");
    var desc = document.getElementById("description") || $("main > header aside p");
    var value = document.getElementById("purchase-value");

    if (qrImage) qrImage.classList.add("pix-qr-out");

    if (qrBox && !reduce) {
      var rings = document.createElement("div");
      rings.className = "pix-rings";
      rings.setAttribute("aria-hidden", "true");
      rings.innerHTML = "<span></span><span></span><span></span>";
      qrBox.appendChild(rings);
      setTimeout(function () {
        rings.remove();
      }, 2000);
    }

    // o check pode já existir (tela confirmada) ou não (tela pendente)
    var check = document.getElementById("confirmed-icon");
    if (!check && qrBox) {
      check = document.createElement("img");
      check.id = "confirmed-icon";
      check.src = CHECK;
      check.alt = "Ícone de pagamento confirmado";
      qrBox.appendChild(check);
    }
    if (check) {
      void check.offsetWidth;
      check.classList.add("pix-pop");
    }

    if (headerCard) headerCard.classList.add("pix-glow");
    if (value) value.classList.add("pix-flash");

    if (options.swapText !== false) {
      swapText(title, TITLE_TEXT, 260);
      swapText(desc, DESC_TEXT, 310);
    } else if (title) {
      title.classList.add("pix-success-text");
    }

    setTimeout(morphFooterCard, 320);
    setTimeout(function () {
      burst(check);
    }, 340);

    document.title = "Pagamento confirmado";
  }

  // Chamado pelo socket. Também dá para testar no console: celebratePayment()
  window.celebratePayment = function () {
    celebrate({ swapText: true });
  };

  // Na tela já confirmada: roda a mesma celebração no load, sem trocar textos
  if (data.auto === "true") {
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        celebrate({ swapText: false });
      });
    });
  }
})();