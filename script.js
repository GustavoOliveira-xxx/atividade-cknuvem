// CK · Aula 19 — interações da página

// 1) Detecta onde a página está rodando (EC2, GitHub Pages ou local)
(function ambiente() {
  const host = location.hostname || "arquivo local";
  const ehIP = /^\d{1,3}(\.\d{1,3}){3}$/.test(host);
  const ehEC2 = (ehIP && !host.startsWith("127.")) || host.endsWith("amazonaws.com");
  const ponto = document.getElementById("status-ponto");
  const txt = document.getElementById("status-txt");

  if (ehEC2) {
    ponto.classList.add("on");
    txt.textContent = "Online · Amazon EC2";
  } else if (host.endsWith("github.io")) {
    ponto.classList.add("demo");
    txt.textContent = "Versão portfólio · GitHub Pages";
  } else {
    ponto.classList.add("demo");
    txt.textContent = "Execução local";
  }

  const porta = location.port || (location.protocol === "https:" ? "443" : location.protocol === "http:" ? "80" : "—");
  document.getElementById("info-host").textContent = host;
  document.getElementById("info-proto").textContent = location.protocol.replace(":", "").toUpperCase() + " · " + porta;
  document.getElementById("info-data").textContent = new Date().toLocaleString("pt-BR");

  window.addEventListener("load", () => {
    const nav = performance.getEntriesByType("navigation")[0];
    const ms = nav ? Math.round(nav.duration || nav.loadEventStart) : Math.round(performance.now());
    document.getElementById("info-tempo").textContent = ms + " ms";
  });
})();

// 2) Cabeçalho muda ao rolar
const topo = document.getElementById("topo");
window.addEventListener("scroll", () => topo.classList.toggle("rolou", scrollY > 20), { passive: true });

// 3) Abas Parte 1 / Parte 2
document.querySelectorAll(".aba").forEach((aba) => {
  aba.addEventListener("click", () => {
    document.querySelectorAll(".aba").forEach((a) => {
      a.classList.toggle("ativa", a === aba);
      a.setAttribute("aria-selected", a === aba);
    });
    document.querySelectorAll(".linha").forEach((l) => {
      l.hidden = l.dataset.parte !== aba.dataset.parte;
      if (!l.hidden) l.querySelectorAll("li").forEach((li) => li.classList.add("visivel"));
    });
  });
});

// 4) Etapas aparecem ao rolar
const obs = new IntersectionObserver((entradas) => {
  entradas.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("visivel"); obs.unobserve(e.target); } });
}, { threshold: .2 });
document.querySelectorAll(".linha li").forEach((li, i) => { li.style.transitionDelay = (i % 8) * 60 + "ms"; obs.observe(li); });

// 5) Botões "copiar"
document.querySelectorAll(".copiar").forEach((btn) => {
  btn.addEventListener("click", async () => {
    const texto = btn.parentElement.querySelector("code").innerText;
    try { await navigator.clipboard.writeText(texto); btn.textContent = "copiado!"; }
    catch { btn.textContent = "selecione e copie"; }
    setTimeout(() => (btn.textContent = "copiar"), 1800);
  });
});

// 6) Terminal animado com os comandos da prática
const linhas = [
  ["cmd", "sudo apt update"],
  ["out", "Reading package lists... Done"],
  ["cmd", "sudo apt install apache2 -y"],
  ["out", "Setting up apache2 ... Done"],
  ["cmd", "sudo systemctl status apache2"],
  ["ok",  "● apache2.service - The Apache HTTP Server\n     Active: active (running)"],
  ["cmd", "sudo nano /var/www/html/index.html"],
  ["out", "[ arquivo salvo ]"],
  ["ok",  "Página publicada em http://" + (location.hostname || "IP-PUBLICO")],
];
const corpo = document.getElementById("term-corpo");
let iniciou = false;

function esc(s) { return s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c])); }

async function digitar() {
  const reduzido = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let html = "";
  for (const [tipo, texto] of linhas) {
    if (tipo === "cmd") {
      const prefixo = '<span class="p">ubuntu@ec2:~$</span> ';
      for (let i = 1; i <= texto.length; i++) {
        corpo.innerHTML = html + prefixo + esc(texto.slice(0, i)) + '<span class="cur"> </span>';
        if (!reduzido) await new Promise((r) => setTimeout(r, 28));
      }
      html += prefixo + esc(texto) + "\n";
    } else {
      html += (tipo === "ok" ? '<span class="ok">' + esc(texto) + "</span>" : esc(texto)) + "\n";
      corpo.innerHTML = html;
      if (!reduzido) await new Promise((r) => setTimeout(r, 320));
    }
  }
  corpo.innerHTML = html + '<span class="p">ubuntu@ec2:~$</span> <span class="cur"> </span>';
}

new IntersectionObserver((e, o) => {
  if (e[0].isIntersecting && !iniciou) { iniciou = true; digitar(); o.disconnect(); }
}, { threshold: .3 }).observe(corpo);
