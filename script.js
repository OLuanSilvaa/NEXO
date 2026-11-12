(() => {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const header = document.querySelector('.header');
  const progress = document.querySelector('.reading-progress');
  const menuButton = document.querySelector('.menu-toggle');
  const mobileMenu = document.querySelector('.mobile-nav');
  const year = document.getElementById('year');
  year.textContent = new Date().getFullYear();

  // The navigation stays usable without an animation library or a network connection.
  function setMenu(open) {
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    mobileMenu.classList.toggle('is-open', open);
    mobileMenu.inert = !open;
    document.body.classList.toggle('menu-open', open);
  }
  menuButton.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
  mobileMenu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', event => {
    if (menuButton.getAttribute('aria-expanded') !== 'true') return;
    if (event.key === 'Escape') { setMenu(false); menuButton.focus(); }
    if (event.key === 'Tab') {
      const focusable = [menuButton, ...mobileMenu.querySelectorAll('a')];
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  window.matchMedia('(min-width: 761px)').addEventListener('change', event => { if (event.matches) setMenu(false); });

  if (window.AOS) {
    window.AOS.init({ duration: 650, easing: 'ease-out-cubic', offset: 50, once: true, disable: () => reducedMotion.matches });
  } else {
    // A graceful fallback preserves every section if the optional AOS asset is unavailable.
    document.querySelectorAll('[data-aos]').forEach(element => { element.style.opacity = '1'; element.style.transform = 'none'; });
  }

  const industries = {
    consultoria: {
      label: 'CONSULTORIA',
      heading: 'Clareza para<br>apresentar<br>seu trabalho.',
      description: 'Um espaço para o seu método, suas especialidades e a primeira conversa com o cliente.',
      features: ['Apresentação profissional', 'Áreas de atuação', 'Agendamento de conversa'],
      brand: 'vértice', url: 'sua-consultoria.com.br', eyebrow: 'CONSULTORIA & ESTRATÉGIA',
      mockHeading: 'Um novo olhar.<br>Uma direção<br><em>mais clara.</em>',
      mockDescription: 'Estratégia para o próximo<br>passo do seu negócio.', button: 'Conheça nosso método ↗', bottom: 'ESTRATÉGIA COM PONTO DE VISTA.', message: 'Olá! Quero um site para minha consultoria.', index: '01 / 04'
    },
    gestao: {
      label: 'GESTÃO & NEGÓCIOS',
      heading: 'A empresa.<br>As pessoas.<br>O que vocês fazem.',
      description: 'Uma apresentação institucional organizada, com espaço para a história da empresa e suas frentes de atuação.',
      features: ['História e posicionamento', 'Equipe e áreas de atuação', 'Contato com clientes e parceiros'],
      brand: 'norte', url: 'sua-empresa.com.br', eyebrow: 'GESTÃO & NEGÓCIOS',
      mockHeading: 'Visão para<br>o que vem<br><em>pela frente.</em>',
      mockDescription: 'Pessoas, estratégia<br>e um caminho em comum.', button: 'Conheça a empresa ↗', bottom: 'UMA DIREÇÃO. NOVAS POSSIBILIDADES.', message: 'Olá! Quero um site institucional para minha empresa.', index: '02 / 04'
    },
    vendas: {
      label: 'VENDAS & MARCAS',
      heading: 'O produto<br>no centro<br>da página.',
      description: 'Imagens em destaque, detalhes bem apresentados e um caminho direto para pedir pelo WhatsApp.',
      features: ['Coleções e lançamentos', 'Detalhes dos produtos', 'Pedidos pelo WhatsApp'],
      brand: 'forma', url: 'sua-marca.com.br', eyebrow: 'DESIGN PARA O DIA A DIA',
      mockHeading: 'Objetos.<br>Novos<br><em>significados.</em>',
      mockDescription: 'Uma coleção para<br>acompanhar sua rotina.', button: 'Explore a coleção ↗', bottom: 'ESCOLHAS QUE FICAM.', message: 'Olá! Quero uma landing page para apresentar meus produtos.', index: '03 / 04'
    },
    servicos: {
      label: 'SERVIÇOS',
      heading: 'O que você faz.<br>Como funciona.<br>Como contratar.',
      description: 'Uma página para conhecer suas especialidades e encontrar, sem esforço, o próximo passo.',
      features: ['Serviços e especialidades', 'Sua forma de trabalhar', 'Orçamentos e agendamentos'],
      brand: 'essenza', url: 'seu-servico.com.br', eyebrow: 'TEMPO PARA O QUE IMPORTA',
      mockHeading: 'Cuidado<br>em cada<br><em>encontro.</em>',
      mockDescription: 'Conheça nossos serviços.<br>Encontre o seu momento.', button: 'Agende uma conversa ↗', bottom: 'PERTO DE VOCÊ.', message: 'Olá! Quero um site para apresentar meus serviços.', index: '04 / 04'
    }
  };

  const panel = document.getElementById('industry-panel');
  const tabs = [...document.querySelectorAll('[data-industry]')];
  function selectIndustry(tab) {
    const key = tab.dataset.industry;
    const industry = industries[key];
    if (!industry) return;
    tabs.forEach(item => { const selected = item === tab; item.setAttribute('aria-selected', String(selected)); item.tabIndex = selected ? 0 : -1; });
    panel.setAttribute('aria-labelledby', tab.id);
    panel.dataset.theme = key;
    document.querySelector('.industry-label').textContent = industry.label;
    document.getElementById('industry-title').innerHTML = industry.heading;
    document.getElementById('industry-description').textContent = industry.description;
    document.getElementById('industry-features').replaceChildren(...industry.features.map(text => { const li = document.createElement('li'); li.textContent = text; return li; }));
    document.querySelector('.industry-cta').href = `https://wa.me/5587988622426?text=${encodeURIComponent(industry.message)}`;
    document.getElementById('mockup-url').textContent = industry.url;
    const brand = document.getElementById('mockup-brand');
    brand.replaceChildren(document.createTextNode(industry.brand));
    const registered = document.createElement('span'); registered.textContent = '®'; brand.append(registered);
    document.getElementById('mockup-eyebrow').textContent = industry.eyebrow;
    document.getElementById('mockup-heading').innerHTML = industry.mockHeading;
    document.getElementById('mockup-description').innerHTML = industry.mockDescription;
    document.getElementById('mockup-button').textContent = industry.button;
    document.getElementById('mockup-bottom').textContent = industry.bottom;
    document.getElementById('mockup-index').textContent = industry.index;
    panel.classList.remove('panel-changing');
    void panel.offsetWidth;
    panel.classList.add('panel-changing');
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectIndustry(tab));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next !== undefined) { event.preventDefault(); selectIndustry(tabs[next]); tabs[next].focus(); }
    });
  });

  const viewportButtons = [...document.querySelectorAll('[data-viewport]')];
  const responsiveStage = document.querySelector('.responsive-stage');
  const responsiveCaption = document.querySelector('.responsive-caption');
  viewportButtons.forEach(button => button.addEventListener('click', () => {
    const view = button.dataset.viewport;
    responsiveStage.dataset.view = view;
    viewportButtons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    responsiveCaption.textContent = view === 'mobile' ? 'Visualização em celular' : 'Visualização em desktop';
  }));

  // Keep one answer open at a time without replacing the native details semantics.
  const questions = [...document.querySelectorAll('.faq details')];
  questions.forEach(question => question.addEventListener('toggle', () => {
    if (question.open) questions.forEach(other => { if (other !== question) other.open = false; });
  }));

  const reveal = document.querySelector('.reveal-words');
  const textWalker = document.createTreeWalker(reveal, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (textWalker.nextNode()) nodes.push(textWalker.currentNode);
  nodes.forEach(node => {
    const fragment = document.createDocumentFragment();
    node.textContent.split(/(\s+)/).forEach(word => {
      if (!word.trim()) fragment.append(document.createTextNode(word));
      else { const span = document.createElement('span'); span.className = 'word'; span.textContent = word; fragment.append(span); }
    });
    node.replaceWith(fragment);
  });
  const words = [...reveal.querySelectorAll('.word')];
  const parallaxElements = [...document.querySelectorAll('[data-parallax]')];
  let scheduled = false;
  function updateScroll() {
    scheduled = false;
    const scrollY = window.scrollY;
    header.classList.toggle('is-scrolled', scrollY > 70);
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${scrollable > 0 ? Math.min(1, scrollY / scrollable) : 0})`;
    const box = reveal.getBoundingClientRect();
    const reading = reducedMotion.matches ? 1 : Math.min(1, Math.max(0, (window.innerHeight * .88 - box.top) / (window.innerHeight * .42)));
    words.forEach((word, index) => word.classList.toggle('is-visible', index / words.length < reading));
    parallaxElements.forEach(element => {
      if (reducedMotion.matches) { element.style.transform = ''; return; }
      const rect = element.getBoundingClientRect();
      if (rect.bottom < -200 || rect.top > window.innerHeight + 200) return;
      const amount = (rect.top + rect.height / 2 - window.innerHeight / 2) * Number(element.dataset.parallax);
      element.style.transform = `translate3d(0,${amount}px,0)`;
    });
  }
  function scheduleScroll() { if (!scheduled) { scheduled = true; requestAnimationFrame(updateScroll); } }
  window.addEventListener('scroll', scheduleScroll, { passive: true });
  window.addEventListener('resize', scheduleScroll, { passive: true });
  reducedMotion.addEventListener('change', scheduleScroll);
  updateScroll();
})();
