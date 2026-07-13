(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer: fine)').matches;
  const q = (selector, context = document) => context.querySelector(selector);
  const qa = (selector, context = document) => [...context.querySelectorAll(selector)];

  addEventListener('load', () => setTimeout(() => q('.loader')?.classList.add('is-hidden'), 450));

  const menu = q('.menu-panel');
  const menuButton = q('.menu-toggle');
  const setMenu = open => {
    menu?.classList.toggle('is-open', open);
    menu?.setAttribute('aria-hidden', String(!open));
    menuButton?.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('menu-open', open);
  };
  menuButton?.addEventListener('click', () => setMenu(!menu.classList.contains('is-open')));
  qa('.menu-panel a').forEach(link => link.addEventListener('click', () => setMenu(false)));

  if (fine) {
    const cursor = q('.cursor');
    addEventListener('pointermove', event => {
      cursor.style.left = `${event.clientX}px`;
      cursor.style.top = `${event.clientY}px`;
    });
    qa('a,button,[data-cursor]').forEach(element => {
      element.addEventListener('pointerenter', () => {
        cursor.classList.add('is-active');
        q('span', cursor).textContent = element.dataset.cursor || 'OPEN';
      });
      element.addEventListener('pointerleave', () => cursor.classList.remove('is-active'));
    });
    qa('.magnetic').forEach(element => {
      element.addEventListener('pointermove', event => {
        if (!window.gsap) return;
        const rect = element.getBoundingClientRect();
        gsap.to(element, { x:(event.clientX-rect.left-rect.width/2)*.14, y:(event.clientY-rect.top-rect.height/2)*.14, duration:.35 });
      });
      element.addEventListener('pointerleave', () => window.gsap && gsap.to(element, { x:0, y:0, duration:.55, ease:'power3.out' }));
    });
    const reactor = q('.hero__reactor');
    reactor?.addEventListener('pointermove', event => {
      if (!window.gsap) return;
      const rect = reactor.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - .5;
      const y = (event.clientY - rect.top) / rect.height - .5;
      gsap.to('.reactor-core', { rotateY:x*10, rotateX:-y*8, x:x*16, y:y*12, duration:.75, ease:'power3.out' });
      gsap.to('.reactor-card--one,.reactor-card--three', { x:x*-22, y:y*-18, duration:.8 });
      gsap.to('.reactor-card--two', { x:x*24, y:y*18, duration:.8 });
    });
    reactor?.addEventListener('pointerleave', () => window.gsap && gsap.to('.reactor-core,.reactor-card', { rotateX:0, rotateY:0, x:0, y:0, duration:.9, ease:'power3.out' }));
  }

  const dispatchData = {
    generation: { value:'84.7', title:'Store northern surplus', copy:'Shift 4.2 GW into battery clusters before the evening demand ramp.' },
    storage: { value:'79.3', title:'Release western reserve', copy:'Discharge 2.8 GW for 24 minutes to protect the industrial corridor.' },
    demand: { value:'76.1', title:'Reduce non-critical demand', copy:'Delay flexible loads across three districts and preserve network headroom.' }
  };
  qa('.asset-toggle').forEach(button => button.addEventListener('click', () => {
    qa('.asset-toggle').forEach(item => item.classList.remove('is-active'));
    button.classList.add('is-active');
    const data = dispatchData[button.dataset.mode];
    q('.power-value').textContent = data.value;
    q('.dispatch-title').textContent = data.title;
    q('.dispatch-copy').textContent = data.copy;
    if (window.gsap) gsap.fromTo('.dispatch-card strong,.dispatch-card p',{y:12,opacity:0},{y:0,opacity:1,duration:.45,stagger:.06});
  }));
  q('.dispatch-button')?.addEventListener('click', event => {
    event.currentTarget.textContent = 'Scenario queued ✓';
    setTimeout(() => event.currentTarget.textContent = 'Apply scenario ↗', 1700);
  });

  let profileFactor = 1;
  const capacity = q('#capacity');
  const updateImpact = () => {
    const value = Number(capacity.value);
    const energy = value * 3.12 * profileFactor / 1000;
    const homes = Math.round(value * 624 * profileFactor / 1000);
    const carbon = Math.round(value * 1248 * profileFactor / 1000);
    const peak = Math.round(value * .3 * profileFactor);
    q('.capacity-value').textContent = value;
    q('.output-energy').textContent = energy.toFixed(2);
    q('.output-homes').textContent = homes;
    q('.output-carbon').textContent = carbon;
    q('.output-peak').textContent = peak;
    const ratio = (value - 100) / 1100;
    qa('.impact-bars i').forEach((bar,index) => bar.style.height = `${28 + ratio*48 + index*3}%`);
  };
  capacity?.addEventListener('input', updateImpact);
  qa('.impact-tab').forEach(button => button.addEventListener('click', () => {
    qa('.impact-tab').forEach(item => { item.classList.remove('is-active'); item.setAttribute('aria-selected','false'); });
    button.classList.add('is-active');
    button.setAttribute('aria-selected','true');
    profileFactor = Number(button.dataset.factor);
    updateImpact();
  }));
  updateImpact();

  q('.contact-form')?.addEventListener('submit', async event => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const text = `VOLTERRA system brief\nName: ${form.get('name')}\nEmail: ${form.get('email')}\nProject: ${form.get('type')}\nScale: ${form.get('scale')}\nChallenge: ${form.get('message') || '—'}`;
    try { await navigator.clipboard.writeText(text); } catch {}
    const button = q('.submit-button', event.currentTarget);
    button.innerHTML = '<span>System brief copied</span><b>✓</b>';
  });

  if (!reduced && window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    if (window.Lenis) {
      const lenis = new Lenis({ duration:1.15, smoothWheel:true });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(time => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    }
    gsap.to('.page-progress span',{scaleY:1,ease:'none',scrollTrigger:{trigger:document.body,start:'top top',end:'bottom bottom',scrub:true}});
    gsap.from('.hero__copy,.hero__title-line,.hero__reactor,.hero__footer',{y:70,opacity:0,duration:1.15,stagger:.09,ease:'power4.out',delay:.2});
    gsap.to('.hero__title',{yPercent:-16,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}});
    gsap.to('.hero__reactor',{scale:.9,rotate:5,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}});
    gsap.from('.manifest h2,.manifest__copy',{y:65,opacity:0,stagger:.14,scrollTrigger:{trigger:'.manifest',start:'top 70%'}});
    gsap.to('.manifest__rule span',{scaleX:1,ease:'none',scrollTrigger:{trigger:'.manifest__rule',start:'top 85%',end:'top 35%',scrub:true}});

    const steps = qa('.journey-step');
    const stage = q('.energy-scene');
    const pulse = q('.energy-pulse');
    const positions = [{left:'8%',top:'67%'},{left:'41%',top:'64%'},{left:'61%',top:'48%'},{left:'88%',top:'44%'}];
    const activateJourney = index => {
      steps.forEach((item,i) => item.classList.toggle('is-active',i===index));
      stage.dataset.stage = String(index);
      gsap.to(pulse,{left:positions[index].left,top:positions[index].top,duration:.8,ease:'power3.inOut'});
      gsap.to('.journey__rail span',{height:`${25*(index+1)}%`,duration:.5});
    };
    if (matchMedia('(min-width:900px)').matches) {
      steps.forEach((step,index) => ScrollTrigger.create({trigger:step,start:'top 58%',end:'bottom 58%',onEnter:()=>activateJourney(index),onEnterBack:()=>activateJourney(index)}));
    }

    gsap.from('.control-panel',{clipPath:'inset(8% 8% 8% 8%)',scrollTrigger:{trigger:'.control-panel',start:'top 80%',end:'top 28%',scrub:true}});
    gsap.fromTo('.chart-line',{strokeDasharray:900,strokeDashoffset:900},{strokeDashoffset:0,duration:1.4,ease:'power2.out',scrollTrigger:{trigger:'.power-chart',start:'top 75%'}});
    const media = gsap.matchMedia();
    media.add('(min-width:900px)', () => {
      const rail = q('.platform-rail');
      gsap.to(rail,{x:()=>-(rail.scrollWidth-innerWidth+80),ease:'none',scrollTrigger:{trigger:'.platforms',start:'top top',end:()=>`+=${rail.scrollWidth-innerWidth}`,pin:true,scrub:1,invalidateOnRefresh:true}});
    });
    gsap.from('.impact-model',{scale:.95,opacity:0,scrollTrigger:{trigger:'.impact-model',start:'top 75%',end:'top 30%',scrub:true}});
    qa('[data-count]').forEach(element => {
      const target = Number(element.dataset.count);
      const proxy = {value:0};
      gsap.to(proxy,{value:target,duration:1.7,ease:'power2.out',scrollTrigger:{trigger:element,start:'top 85%',once:true},onUpdate:()=>element.textContent=Math.round(proxy.value)});
    });
    gsap.from('.contact-form label,.submit-button',{y:35,opacity:0,stagger:.07,scrollTrigger:{trigger:'.contact-form',start:'top 75%'}});
  }
})();
