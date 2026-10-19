/* =========================================================
   Món Quà 20/10 — script.js
   Modules: content, FX (sky + particles), Music (Web Audio),
   scene transitions, form, greeting card sequence.
   ========================================================= */
(() => {
  'use strict';

  const $ = (s, root = document) => root.querySelector(s);
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.matchMedia('(max-width: 640px), (pointer: coarse)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const rand = (a, b) => a + Math.random() * (b - a);
  const POINTER = { x: 0, y: 0 }; // -0.5 … 0.5, desktop pointer only
  if (finePointer && !reduceMotion) {
    window.addEventListener('pointermove', (e) => {
      POINTER.x = e.clientX / window.innerWidth - 0.5;
      POINTER.y = e.clientY / window.innerHeight - 0.5;
    }, { passive: true });
  }

  /* ---------------------------------------------------------
     CONTENT
     --------------------------------------------------------- */
  const DEFAULT_WISH =
    'Nhân ngày 20/10, chúc bạn luôn xinh đẹp, luôn rạng rỡ và luôn được yêu thương theo cách mà bạn xứng đáng. Mong rằng mỗi ngày trong cuộc sống đều mang đến cho bạn thật nhiều niềm vui, bình an và những điều tuyệt vời nhất. Cảm ơn vì đã xuất hiện và làm cho thế giới này trở nên đẹp hơn.';

  const SUGGESTIONS = {
    'Mẹ': [
      'Mẹ yêu, cảm ơn mẹ vì tất cả những hy sinh thầm lặng suốt bao năm qua. Sau mỗi bữa cơm ấm áp là đôi bàn tay chưa từng biết nghỉ ngơi. Nhân ngày 20/10, con chúc mẹ thật nhiều sức khỏe, luôn bình an và luôn mỉm cười. Con yêu mẹ nhiều hơn những gì con có thể nói thành lời.',
      'Gửi người phụ nữ đầu tiên con yêu thương trong đời. Chúc mẹ một ngày 20/10 thật nhẹ nhàng, được nghỉ ngơi và được chiều chuộng như cách mẹ vẫn luôn chăm lo cho cả nhà. Mong mẹ mãi khỏe mạnh để con còn được làm con của mẹ thật lâu.'
    ],
    'Người yêu': [
      'Gửi em, người đã khiến những ngày bình thường trở nên thật đặc biệt. Cảm ơn em vì nụ cười, vì sự dịu dàng và vì đã luôn ở bên. Ngày 20/10 này, chúc em luôn xinh đẹp, luôn vui vẻ và luôn biết rằng mình đang được yêu thương rất nhiều.',
      'Có những điều không cần nói mỗi ngày, nhưng hôm nay mình muốn nói thật rõ: em là điều tuyệt vời nhất mà mình có. Chúc em một ngày 20/10 ngập tràn hoa và niềm vui, và mãi là cô gái hạnh phúc nhất.'
    ],
    'Vợ': [
      'Gửi vợ yêu, người giữ lửa cho tổ ấm của chúng mình. Cảm ơn em vì đã cùng đi qua những ngày nắng lẫn ngày mưa, vì những bữa cơm, những lời động viên và cả những hy sinh không lời. Chúc em ngày 20/10 thật hạnh phúc, mãi xinh đẹp và luôn được nâng niu.',
      'Mỗi ngày bên em là một ngày đáng biết ơn. Hôm nay hãy để mọi việc nhà sang một bên và cho phép mình được chiều chuộng nhé. Chúc vợ luôn khỏe mạnh, rạng rỡ và mãi là người phụ nữ hạnh phúc nhất trong ngôi nhà nhỏ của chúng mình.'
    ],
    'Chị': [
      'Gửi chị yêu, người luôn che chở và lắng nghe em vô điều kiện. Cảm ơn chị vì những lời khuyên, những cái ôm và cả những lần âm thầm đứng phía sau em. Nhân ngày 20/10, chúc chị luôn xinh đẹp, thành công và thật nhiều hạnh phúc.',
      'Có một người chị là có một người bạn thân suốt đời. Chúc chị ngày 20/10 thật vui, công việc thuận lợi, sức khỏe dồi dào và lúc nào cũng được yêu thương như cách chị vẫn thương mọi người.'
    ],
    'Em gái': [
      'Gửi cô em gái đáng yêu nhất. Dù em lớn đến đâu thì trong mắt anh chị, em vẫn là cô bé cần được che chở. Chúc em ngày 20/10 luôn tươi tắn, học tập và công việc suôn sẻ, và mãi giữ được nụ cười trong trẻo ấy.',
      'Chúc em gái một ngày 20/10 thật rực rỡ! Hãy cứ tự tin, cứ mơ ước thật lớn và nhớ rằng gia đình luôn ở đây ủng hộ em. Mong em luôn bình an và gặp thật nhiều điều tốt đẹp.'
    ],
    'Cô giáo': [
      'Kính gửi cô, người đã dành trọn tâm huyết để chắp cánh cho những ước mơ của chúng em. Cảm ơn cô vì từng bài giảng, từng lời dặn dò và cả sự kiên nhẫn dịu dàng. Nhân ngày 20/10, kính chúc cô luôn mạnh khỏe, hạnh phúc và mãi rạng rỡ trên bục giảng.',
      'Kính chúc cô một ngày 20/10 thật ý nghĩa. Những điều cô dạy không chỉ nằm trong trang vở mà còn theo chúng em suốt chặng đường dài. Chúc cô luôn bình an, tràn đầy niềm vui và luôn được yêu quý.'
    ],
    'Bạn thân': [
      'Gửi cô bạn thân của mình! Cảm ơn bạn vì đã ở đây trong những lúc vui nhất lẫn những ngày tệ nhất. Chúc bạn ngày 20/10 thật xinh, thật vui, ăn ngon ngủ kỹ và luôn gặp được những người đối xử dịu dàng với bạn.',
      'Có bạn là một may mắn lớn của mình. Nhân ngày 20/10, chúc bạn luôn tự tin tỏa sáng, đạt được mọi điều mong muốn và mãi giữ sự đáng yêu này nhé.'
    ],
    'Người đặc biệt': [
      DEFAULT_WISH,
      'Có những người xuất hiện và lặng lẽ làm cuộc sống của người khác đẹp hơn, và bạn là một người như thế. Nhân ngày 20/10, chúc bạn luôn bình yên, luôn hạnh phúc và luôn được trân trọng như bạn xứng đáng.'
    ]
  };

  /* ---------------------------------------------------------
     FX — two canvases.
     back:  stars, shooting stars, bokeh, drifting petals, hearts
     front: bursts and the cursor sparkle trail
     All sprites are pre-rendered once; each frame only blits.
     --------------------------------------------------------- */
  const FX = (() => {
    const back = $('#fxBack'), front = $('#fxFront');
    const bctx = back.getContext('2d'), fctx = front.getContext('2d');
    let W = 0, H = 0, DPR = 1, last = 0, t = 0, running = true;
    const scale = reduceMotion ? 0.3 : 1;
    const ambient = [];   // back layer
    const bursts = [];    // front layer
    let stars = [], bokeh = [], shooting = null, nextShoot = 240;
    const MAX_AMB = isMobile ? 60 : 120;
    const MAX_BURST = isMobile ? 160 : 320;

    const LEVELS = {
      intro:  { petals: isMobile ? 5 : 9,   hearts: 0 },
      shower: { petals: isMobile ? 22 : 44, hearts: 0.5 },
      calm:   { petals: isMobile ? 5 : 10,  hearts: 0 },
      card:   { petals: isMobile ? 10 : 18, hearts: isMobile ? 0.5 : 0.9 }
    };
    let level = LEVELS.intro;
    let ppx = 0, ppy = 0;            // smoothed pointer for parallax
    let nowMs = performance.now();   // real clock, so the name forms on time even at low frame rates
    let fwOn = false, fwNext = 0, fwQuick = 0;

    function sprite(size, draw) {
      const c = document.createElement('canvas');
      c.width = c.height = size;
      const g = c.getContext('2d');
      g.translate(size / 2, size / 2);
      draw(g, size);
      return c;
    }
    function petal(c1, c2, c3) {
      return sprite(64, (g) => {
        const grd = g.createRadialGradient(0, -8, 2, 0, 0, 30);
        grd.addColorStop(0, c1); grd.addColorStop(0.6, c2); grd.addColorStop(1, c3);
        g.fillStyle = grd;
        g.beginPath();
        g.moveTo(0, 26);
        g.bezierCurveTo(-24, 12, -26, -16, -9, -25);
        g.quadraticCurveTo(0, -19, 9, -25);
        g.bezierCurveTo(26, -16, 24, 12, 0, 26);
        g.closePath(); g.fill();
        g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 1;
        g.beginPath(); g.moveTo(0, 22); g.quadraticCurveTo(2, 0, 0, -16); g.stroke();
      });
    }
    function glow(color, size = 64) {
      return sprite(size, (g, s) => {
        const r = s / 2;
        const grd = g.createRadialGradient(0, 0, 0, 0, 0, r);
        // fade to the same colour at zero alpha (fading to black leaves grey fringes)
        grd.addColorStop(0, color); grd.addColorStop(0.45, color.replace(/[\d.]+\)$/, '0.35)')); grd.addColorStop(1, color.replace(/[\d.]+\)$/, '0)'));
        g.fillStyle = grd; g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); g.fill();
      });
    }
    function sparkle(core, halo) {
      return sprite(64, (g) => {
        const grd = g.createRadialGradient(0, 0, 0, 0, 0, 30);
        grd.addColorStop(0, halo); grd.addColorStop(1, 'rgba(255,240,220,0)');
        g.fillStyle = grd; g.beginPath(); g.arc(0, 0, 30, 0, Math.PI * 2); g.fill();
        g.fillStyle = core; g.beginPath();
        g.moveTo(0, -24); g.quadraticCurveTo(2, -2, 24, 0); g.quadraticCurveTo(2, 2, 0, 24);
        g.quadraticCurveTo(-2, 2, -24, 0); g.quadraticCurveTo(-2, -2, 0, -24); g.fill();
      });
    }
    const S = {
      petals: [
        petal('#ffe4ea', '#f5a3b8', '#d9587c'),
        petal('#ffd0da', '#ea7a98', '#b8335a'),
        petal('#fff4ee', '#f7cfd6', '#e7a0b2')
      ],
      sparks: [sparkle('#fffaf0', 'rgba(246,220,170,.8)'), sparkle('#fff5f8', 'rgba(248,150,185,.75)')],
      star: glow('rgba(255,246,232,1)', 24),
      starGold: glow('rgba(255,222,170,1)', 24),
      bokeh: [glow('rgba(243,113,152,.9)', 128), glow('rgba(244,210,160,.9)', 128), glow('rgba(255,190,215,.9)', 128)],
      dust: glow('rgba(255,236,200,1)', 16),
      dustPink: glow('rgba(255,160,195,1)', 16),
      heart: sprite(48, (g) => {
        const grd = g.createLinearGradient(-14, -14, 14, 14);
        grd.addColorStop(0, '#ffc2d2'); grd.addColorStop(1, '#e0446f');
        g.shadowColor = 'rgba(255,120,160,.8)'; g.shadowBlur = 8;
        g.fillStyle = grd; g.beginPath();
        g.moveTo(0, 14);
        g.bezierCurveTo(-22, 0, -14, -20, 0, -8);
        g.bezierCurveTo(14, -20, 22, 0, 0, 14);
        g.fill();
      })
    };

    function seedSky() {
      const nStars = Math.round((isMobile ? 70 : 150) * (reduceMotion ? 0.6 : 1));
      stars = Array.from({ length: nStars }, () => ({
        x: Math.random() * W, y: Math.random() * H * 0.92,
        r: Math.random() < 0.08 ? rand(5, 8) : rand(1.6, 4),
        gold: Math.random() < 0.3, phase: rand(0, 6.28), sp: rand(0.01, 0.04), base: rand(0.25, 0.8), d: rand(0.15, 1)
      }));
      const nBokeh = isMobile ? 7 : 13;
      bokeh = Array.from({ length: nBokeh }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        r: rand(40, isMobile ? 110 : 170), img: S.bokeh[(Math.random() * 3) | 0],
        a: rand(0.04, 0.12), vx: rand(-0.12, 0.12), vy: rand(-0.18, -0.04), phase: rand(0, 6.28)
      }));
    }

    function resize() {
      DPR = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2);
      W = window.innerWidth; H = window.innerHeight;
      for (const c of [back, front]) { c.width = Math.round(W * DPR); c.height = Math.round(H * DPR); }
      seedSky();
    }

    function addPetal(list, x, y, vx, vy, burst) {
      if (list.length >= (burst ? MAX_BURST : MAX_AMB)) return;
      list.push({
        k: 'p', x, y, vx, vy, burst,
        term: rand(0.6, 1.5), sway: rand(0.25, 0.8), phase: rand(0, 6.28),
        rot: rand(0, 6.28), vr: rand(-0.03, 0.03), flip: rand(0.02, 0.05),
        size: rand(13, isMobile ? 22 : 28), img: S.petals[(Math.random() * 3) | 0], a: burst ? 1 : rand(0.55, 0.85)
      });
    }
    function addSpark(list, x, y, vx, vy, life, burst, size) {
      if (list.length >= MAX_BURST) return;
      list.push({ k: 's', x, y, vx, vy, burst, life: 0, max: life, size: size || rand(8, 24), img: S.sparks[(Math.random() * 2) | 0], phase: rand(0, 6.28) });
    }
    function addDust(list, x, y, vx, vy, life) {
      if (list.length >= MAX_BURST) return;
      list.push({ k: 'd', x, y, vx, vy, life: 0, max: life, size: rand(3, 7) });
    }
    function addHeart(list, x, y, vx, vy, life, burst) {
      if (list.length >= (burst ? MAX_BURST : MAX_AMB)) return;
      list.push({ k: 'h', x, y, vx, vy, burst, life: 0, max: life, size: rand(12, 22), phase: rand(0, 6.28), sway: rand(0.2, 0.6), rot: rand(-0.3, 0.3) });
    }

    function burst(x, y, o = {}) {
      const n = (v) => Math.round((v || 0) * scale);
      for (let i = 0; i < n(o.petals); i++) {
        const ang = -Math.PI / 2 + rand(-1.3, 1.3), sp = rand(4, 11);
        addPetal(bursts, x + rand(-20, 20), y + rand(-10, 10), Math.cos(ang) * sp, Math.sin(ang) * sp, true);
      }
      for (let i = 0; i < n(o.sparks); i++) {
        const ang = rand(0, Math.PI * 2), sp = rand(1, o.spread || 7);
        addSpark(bursts, x, y, Math.cos(ang) * sp, Math.sin(ang) * sp, rand(50, 100), true);
      }
      for (let i = 0; i < n(o.dust); i++) {
        const ang = rand(0, Math.PI * 2), sp = rand(2, (o.spread || 7) * 1.6);
        addDust(bursts, x, y, Math.cos(ang) * sp, Math.sin(ang) * sp - 1, rand(60, 120));
      }
      for (let i = 0; i < n(o.hearts); i++) {
        const ang = -Math.PI / 2 + rand(-1.1, 1.1), sp = rand(2, 6);
        addHeart(bursts, x, y, Math.cos(ang) * sp, Math.sin(ang) * sp, rand(110, 170), true);
      }
    }
    function trail(x, y) {
      if (reduceMotion) return;
      addSpark(bursts, x + rand(-4, 4), y + rand(-4, 4), rand(-0.4, 0.4), rand(-0.2, 0.6), rand(28, 46), true, rand(6, 13));
      if (Math.random() < 0.6) addDust(bursts, x, y, rand(-0.6, 0.6), rand(0.2, 1), rand(30, 55));
    }

    /* rose-gold fireworks, drawn behind the content */
    function launch() {
      const wide = W > 760;
      const x = wide ? (Math.random() < 0.5 ? rand(W * 0.06, W * 0.3) : rand(W * 0.7, W * 0.94)) : rand(W * 0.12, W * 0.88);
      ambient.push({ k: 'r', x, y: H + 10, vx: rand(-0.5, 0.5), vy: -rand(8.5, 11) * Math.sqrt(H / 850), ty: rand(H * 0.1, H * 0.38), gold: Math.random() < 0.55 });
    }
    function explode(list, p) {
      const n = isMobile ? 46 : 72;
      const img = p.gold ? S.sparks[0] : S.sparks[1];
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + rand(-0.06, 0.06), sp = rand(2, 4.4);
        list.push({ k: 's', x: p.x, y: p.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, burst: true, drag: 0.962, grav: 0.032, life: 0, max: rand(70, 110), size: rand(6, 12), img, phase: rand(0, 6.28) });
      }
      for (let i = 0; i < n / 2; i++) {
        const a = rand(0, Math.PI * 2), sp = rand(0.5, 3);
        list.push({ k: 'd', x: p.x, y: p.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 0, max: rand(60, 110), size: rand(2, 5), img: p.gold ? S.dust : S.dustPink });
      }
    }

    /* the recipient's name drawn in light: particles fly out of the box
       and settle into the letters (plus a small heart), then scatter */
    function formText(text, cx, cy, ty) {
      if (reduceMotion || !text) return { release() {} };
      const font = (s) => `${s}px "Great Vibes", "Dancing Script", cursive`;
      const ow = Math.ceil(W);
      const probe = document.createElement('canvas').getContext('2d');
      let fs = Math.min(W * 0.19, 136);
      probe.font = font(fs);
      while (probe.measureText(text).width > W * 0.84 && fs > 26) { fs -= 3; probe.font = font(fs); }
      const off = document.createElement('canvas');
      const oh = Math.ceil(fs * 2.4);
      off.width = ow; off.height = oh;
      const g = off.getContext('2d', { willReadFrequently: true });
      g.font = font(fs); g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle';
      const lineY = fs * 0.78;
      g.fillText(text, ow / 2, lineY);
      const hs = fs * 0.17, hx = ow / 2, hy = lineY + fs * 0.98;
      g.beginPath();
      g.moveTo(hx, hy + hs);
      g.bezierCurveTo(hx - hs * 1.7, hy, hx - hs, hy - hs * 1.45, hx, hy - hs * 0.5);
      g.bezierCurveTo(hx + hs, hy - hs * 1.45, hx + hs * 1.7, hy, hx, hy + hs);
      g.fill();

      const data = g.getImageData(0, 0, ow, oh).data;
      const step = W < 520 ? 3 : 4;
      let pts = [];
      for (let y = 0; y < oh; y += step) for (let x = 0; x < ow; x += step) if (data[(y * ow + x) * 4 + 3] > 130) pts.push([x, y]);
      const cap = isMobile ? 480 : 950;
      if (pts.length > cap) {
        for (let i = pts.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [pts[i], pts[j]] = [pts[j], pts[i]]; }
        pts = pts.slice(0, cap);
      }
      const blockTop = lineY - fs * 0.6, blockBot = hy + hs;
      const dy = ty - (blockTop + blockBot) / 2;
      const parts = [];
      for (const [x, y] of pts) {
        const tx = x, tyy = y + dy;
        const p = {
          k: 'f', x: cx, y: cy, sx: cx + rand(-24, 24), sy: cy + rand(-14, 14), tx, ty: tyy,
          qx: (cx + tx) / 2 + rand(-170, 170), qy: Math.min(cy, tyy) - rand(30, 190),
          born: nowMs + rand(0, 560), dur: rand(950, 1500), size: rand(4.5, 7.5) * (step / 3.6),
          img: Math.random() < 0.62 ? S.dust : S.dustPink, phase: rand(0, 6.28)
        };
        bursts.push(p); parts.push(p);
      }
      return {
        release() {
          const mx = W / 2;
          for (const p of parts) {
            if (p.k !== 'f') continue;
            p.k = 'd'; p.vx = (p.x - mx) * 0.012 + rand(-1.6, 1.6); p.vy = rand(-2.8, 0.6);
            p.life = 0; p.max = rand(50, 95); p.size *= 1.5;
          }
        }
      };
    }

    function draw(ctx, img, x, y, size, rot, sx, sy, alpha) {
      const c = Math.cos(rot), s = Math.sin(rot);
      ctx.globalAlpha = alpha;
      ctx.setTransform(DPR * c * sx, DPR * s * sx, -DPR * s * sy, DPR * c * sy, DPR * x, DPR * y);
      ctx.drawImage(img, -size / 2, -size / 2, size, size);
    }

    function spawnAmbient(dt) {
      let p = 0;
      for (const q of ambient) if (q.k === 'p') p++;
      if (p < level.petals * scale && Math.random() < 0.07 * dt) addPetal(ambient, rand(-20, W + 20), -30, rand(-0.3, 0.3), rand(0.4, 1.1), false);
      if (level.hearts && Math.random() < (level.hearts * scale / 60) * dt) addHeart(ambient, rand(W * 0.08, W * 0.92), H + 20, rand(-0.2, 0.2), rand(-1.2, -0.5), rand(420, 560), false);
    }

    function stepList(ctx, list, dt) {
      for (let i = list.length - 1; i >= 0; i--) {
        const p = list[i];
        let dead = false;
        ctx.globalCompositeOperation = (p.k === 'p' || p.k === 'h') ? 'source-over' : 'lighter';
        if (p.k === 'f') { // particle travelling to its place in the name
          if (nowMs >= p.born) {
            const k = Math.min(1, (nowMs - p.born) / p.dur);
            const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
            const u = 1 - e;
            p.x = u * u * p.sx + 2 * u * e * p.qx + e * e * p.tx;
            p.y = u * u * p.sy + 2 * u * e * p.qy + e * e * p.ty;
            const a = k < 1 ? Math.min(1, k * 2.5) : 0.72 + 0.28 * Math.sin(t * 0.16 + p.phase);
            draw(ctx, p.img, p.x, p.y, p.size * (k < 1 ? 2.4 - 1.4 * e : 1), 0, 1, 1, a);
          }
        } else if (p.k === 'r') { // firework rocket
          p.vy += 0.11 * dt;
          p.x += p.vx * dt; p.y += p.vy * dt;
          draw(ctx, S.dust, p.x, p.y, 7, 0, 1, 1, 0.95);
          if (Math.random() < 0.7) list.push({ k: 'd', x: p.x, y: p.y, vx: rand(-0.3, 0.3), vy: rand(0, 0.6), life: 0, max: rand(18, 34), size: rand(2, 4), img: S.dust });
          if (p.y <= p.ty || p.vy >= -1.4) { explode(list, p); dead = true; }
        } else if (p.k === 'p') {
          p.vy = Math.min(p.vy + 0.07 * dt, p.term);
          p.vx *= Math.pow(0.975, dt);
          p.x += (p.vx + Math.sin(t * 0.02 + p.phase) * p.sway) * dt;
          p.y += p.vy * dt;
          p.rot += p.vr * dt;
          if (p.y > H + 40) dead = true;
          const sx = 0.3 + 0.7 * Math.abs(Math.sin(t * p.flip + p.phase));
          draw(ctx, p.img, p.x, p.y, p.size, p.rot, sx, 1, p.a);
        } else if (p.k === 's') {
          p.life += dt;
          if (p.burst) { const dr = Math.pow(p.drag || 0.94, dt); p.vx *= dr; p.vy = p.vy * dr + (p.grav || 0.02) * dt; }
          p.x += p.vx * dt; p.y += p.vy * dt;
          const k = p.life / p.max;
          if (k >= 1) dead = true;
          const sz = p.size * (0.5 + 0.5 * Math.sin(Math.min(1, k) * Math.PI));
          draw(ctx, p.img, p.x, p.y, sz, t * 0.012 + p.phase, 1, 1, Math.max(0, 1 - k));
        } else if (p.k === 'd') {
          p.life += dt;
          p.vx *= Math.pow(0.95, dt); p.vy = p.vy * Math.pow(0.95, dt) + 0.035 * dt;
          p.x += p.vx * dt; p.y += p.vy * dt;
          const k = p.life / p.max;
          if (k >= 1) dead = true;
          draw(ctx, p.img || S.dust, p.x, p.y, p.size, 0, 1, 1, Math.max(0, (1 - k) * (0.7 + 0.3 * Math.sin(t * 0.5 + p.x))));
        } else {
          p.life += dt;
          if (p.burst) { p.vx *= Math.pow(0.95, dt); p.vy = p.vy * Math.pow(0.95, dt) - 0.015 * dt; }
          p.x += (p.vx + Math.sin(t * 0.03 + p.phase) * p.sway) * dt;
          p.y += p.vy * dt;
          const k = p.life / p.max;
          if (k >= 1 || p.y < -40) dead = true;
          const a = Math.min(1, k * 6) * (1 - k) * 0.85;
          draw(ctx, S.heart, p.x, p.y, p.size, p.rot, 1, 1, Math.max(0, a));
        }
        if (dead) list.splice(i, 1);
      }
    }

    function drawSky(dt) {
      // bokeh
      for (const b of bokeh) {
        b.x += b.vx * dt; b.y += b.vy * dt;
        if (b.y < -b.r) { b.y = H + b.r; b.x = Math.random() * W; }
        if (b.x < -b.r) b.x = W + b.r; else if (b.x > W + b.r) b.x = -b.r;
        draw(bctx, b.img, b.x - ppx * 70, b.y - ppy * 50, b.r * 2, 0, 1, 1, b.a * (0.75 + 0.25 * Math.sin(t * 0.01 + b.phase)));
      }
      // stars
      for (const s of stars) {
        const tw = s.base * (0.55 + 0.45 * Math.sin(t * s.sp + s.phase));
        draw(bctx, s.gold ? S.starGold : S.star, s.x - ppx * 34 * s.d, s.y - ppy * 24 * s.d, s.r * 2.4, 0, 1, 1, tw);
      }
      // shooting star
      if (!reduceMotion) {
        nextShoot -= dt;
        if (!shooting && nextShoot <= 0) {
          const fromLeft = Math.random() < 0.5;
          shooting = { x: fromLeft ? rand(-50, W * 0.4) : rand(W * 0.6, W + 50), y: rand(-20, H * 0.3), vx: (fromLeft ? 1 : -1) * rand(9, 13), vy: rand(3.5, 5.5), life: 0, max: rand(55, 80) };
          nextShoot = rand(420, 800);
        }
        if (shooting) {
          const s = shooting;
          s.life += dt; s.x += s.vx * dt; s.y += s.vy * dt;
          const k = s.life / s.max;
          const a = Math.sin(Math.min(1, k) * Math.PI);
          const len = 16;
          bctx.setTransform(DPR, 0, 0, DPR, 0, 0);
          bctx.globalAlpha = a;
          const g = bctx.createLinearGradient(s.x, s.y, s.x - s.vx * len, s.y - s.vy * len);
          g.addColorStop(0, 'rgba(255,248,236,1)'); g.addColorStop(0.3, 'rgba(255,200,215,.5)'); g.addColorStop(1, 'rgba(255,200,215,0)');
          bctx.strokeStyle = g; bctx.lineWidth = 1.6; bctx.lineCap = 'round';
          bctx.beginPath(); bctx.moveTo(s.x, s.y); bctx.lineTo(s.x - s.vx * len, s.y - s.vy * len); bctx.stroke();
          draw(bctx, S.star, s.x, s.y, 12, 0, 1, 1, a);
          if (k >= 1) shooting = null;
        }
      }
    }

    function frame(now) {
      if (!running) return;
      const dt = Math.min(3, last ? (now - last) / 16.667 : 1);
      last = now; t += dt; nowMs = now;
      spawnAmbient(dt);
      ppx += (POINTER.x - ppx) * Math.min(1, 0.05 * dt);
      ppy += (POINTER.y - ppy) * Math.min(1, 0.05 * dt);
      if (fwOn && !reduceMotion) {
        fwNext -= dt;
        if (fwNext <= 0) {
          launch();
          if (fwQuick > 0) { fwQuick--; fwNext = rand(22, 40); } else fwNext = rand(230, 400);
        }
      }

      bctx.setTransform(1, 0, 0, 1, 0, 0); bctx.globalAlpha = 1;
      bctx.clearRect(0, 0, back.width, back.height);
      fctx.setTransform(1, 0, 0, 1, 0, 0); fctx.globalAlpha = 1;
      fctx.clearRect(0, 0, front.width, front.height);

      drawSky(dt);
      stepList(bctx, ambient, dt);
      stepList(fctx, bursts, dt);
      fctx.globalCompositeOperation = 'source-over';

      bctx.globalAlpha = 1; fctx.globalAlpha = 1;
      requestAnimationFrame(frame);
    }

    resize();
    let rT = 0;
    window.addEventListener('resize', () => { clearTimeout(rT); rT = setTimeout(resize, 120); });
    document.addEventListener('visibilitychange', () => {
      running = !document.hidden;
      if (running) { last = 0; requestAnimationFrame(frame); }
    });
    requestAnimationFrame(frame);

    // sparkle trail behind the cursor (desktop only)
    if (finePointer && !reduceMotion) {
      let lx = 0, ly = 0, lt = 0;
      window.addEventListener('pointermove', (e) => {
        const now = performance.now();
        const d = Math.hypot(e.clientX - lx, e.clientY - ly);
        if (now - lt < 28 || d < 6) return;
        lt = now; lx = e.clientX; ly = e.clientY;
        trail(e.clientX, e.clientY);
      }, { passive: true });
    }

    return {
      burst,
      setLevel: (name) => { level = LEVELS[name] || LEVELS.calm; },
      formText,
      fireworks: (on) => { fwOn = on; fwNext = on ? 18 : 0; fwQuick = on ? 2 : 0; },
      // move falling petals behind the content (so they never cover the card text)
      sendBack: () => {
        for (let i = bursts.length - 1; i >= 0; i--) {
          if (bursts[i].k === 'p') { ambient.push(bursts[i]); bursts.splice(i, 1); }
        }
      }
    };
  })();

  /* ---------------------------------------------------------
     MUSIC — three modes chosen by the sender:
       box  : a soft music-box lullaby generated with Web Audio
       file : a song the sender uploaded (or a URL on self-hosted sites)
       none : silence (tap sounds stay)
     A song that fails to load falls back to the music box.
     --------------------------------------------------------- */
  const Music = (() => {
    const btn = $('#musicBtn');
    let ac = null, master, wet, sfx, playing = false, timer = null, nextTime = 0, step = 0;
    let mode = 'box', el = null, startAt = 0, startedOnce = false, fadeT = null, onFail = null;
    // YouTube (self-hosted only): a visible mini player driven through the IFrame API
    let yt = null, ytReady = null, ytApi = null, ytGen = 0;
    let userMuted = false, armed = false, onState = null;
    const dock = $('#ytDock'), ytTitle = $('#ytTitle'), ytHint = $('#ytHint'), ytPill = $('#ytPill');
    const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
    const PROG = [[60, 64, 67, 72], [57, 60, 64, 69], [53, 57, 60, 65], [55, 59, 62, 67]];
    const PAT_A = [0, 1, 2, 3, 2, 1, 2, 3];
    const PAT_B = [0, 2, 1, 3, 2, 3, 1, 2];
    const EIGHTH = 0.34;

    function init() {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      ac = new AC();
      const comp = ac.createDynamicsCompressor();
      comp.connect(ac.destination);
      master = ac.createGain(); master.gain.value = 0; master.connect(comp);
      sfx = ac.createGain(); sfx.gain.value = 0.9; sfx.connect(comp);
      // gentle echo for the music box
      const delay = ac.createDelay(2); delay.delayTime.value = EIGHTH * 3;
      const fb = ac.createGain(); fb.gain.value = 0.3;
      const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2300;
      wet = ac.createGain(); wet.gain.value = 0.3;
      wet.connect(delay); delay.connect(lp); lp.connect(fb); fb.connect(delay); lp.connect(master);
      return true;
    }
    function ensureAC() {
      if (!ac && !init()) return false;
      if (ac.state === 'suspended') ac.resume().catch(() => {});
      return true;
    }
    function bell(freq, time, vel, out) {
      const o = ac.createOscillator(), o2 = ac.createOscillator();
      const g = ac.createGain(), g2 = ac.createGain();
      o.type = 'sine'; o.frequency.value = freq;
      o2.type = 'sine'; o2.frequency.value = freq * 3.01; g2.gain.value = 0.1;
      g.gain.setValueAtTime(0.0001, time);
      g.gain.exponentialRampToValueAtTime(vel, time + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, time + 1.9);
      o.connect(g); o2.connect(g2); g2.connect(g);
      if (out) g.connect(out); else { g.connect(master); g.connect(wet); }
      o.start(time); o2.start(time); o.stop(time + 2); o2.stop(time + 2);
    }
    function pad(notes, time, dur) {
      notes.forEach((m) => {
        const o = ac.createOscillator(), f = ac.createBiquadFilter(), g = ac.createGain();
        o.type = 'triangle'; o.frequency.value = mtof(m - 12); o.detune.value = rand(-5, 5);
        f.type = 'lowpass'; f.frequency.value = 850;
        g.gain.setValueAtTime(0.0001, time);
        g.gain.linearRampToValueAtTime(0.03, time + 1.2);
        g.gain.setValueAtTime(0.03, time + dur - 0.5);
        g.gain.linearRampToValueAtTime(0.0001, time + dur + 0.5);
        o.connect(f); f.connect(g); g.connect(master);
        o.start(time); o.stop(time + dur + 0.6);
      });
    }
    function tick() {
      while (nextTime < ac.currentTime + 0.3) {
        const bar = Math.floor(step / 8) % 4, i = step % 8, chord = PROG[bar];
        if (i === 0) pad(chord.slice(0, 3), nextTime, EIGHTH * 8);
        const pat = Math.floor(step / 32) % 2 ? PAT_B : PAT_A;
        const vel = (i === 0 ? 0.1 : 0.065) * rand(0.85, 1.15);
        bell(mtof(chord[pat[i]] + 12), nextTime, vel);
        nextTime += EIGHTH; step++;
      }
    }
    function ui() {
      document.body.classList.toggle('yt-playing', mode === 'yt' && playing);
      btn.hidden = mode === 'none';
      btn.classList.toggle('playing', playing);
      btn.setAttribute('aria-pressed', String(playing));
      btn.setAttribute('aria-label', playing ? 'Tắt nhạc nền' : 'Bật nhạc nền');
    }
    function fadeVol(target, ms, done) {
      clearInterval(fadeT);
      if (!el) { if (done) done(); return; }
      const from = el.volume, t0 = performance.now();
      fadeT = setInterval(() => {
        const k = Math.min(1, (performance.now() - t0) / ms);
        try { el.volume = from + (target - from) * k; } catch (e) { /* iOS: volume is fixed */ }
        if (k >= 1) { clearInterval(fadeT); if (done) done(); }
      }, 40);
    }

    function synthStart() {
      const now = ac.currentTime;
      nextTime = now + 0.12;
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(master.gain.value, now);
      master.gain.linearRampToValueAtTime(0.55, now + 2.5);
      if (timer) clearInterval(timer);
      timer = setInterval(tick, 60);
    }
    function synthStop() {
      const now = ac.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(master.gain.value, now);
      master.gain.linearRampToValueAtTime(0, now + 0.8);
      setTimeout(() => { if (!(playing && mode === 'box') && timer) { clearInterval(timer); timer = null; } }, 900);
    }

    function fileFailed() {
      if (mode !== 'file') return;
      const was = playing;
      if (el) { try { el.pause(); } catch (e) { /* ignore */ } }
      el = null; mode = 'box'; playing = false;
      if (onFail) onFail();
      if (was) start(); else ui();
    }

    function loadYTApi() {
      if (window.YT && window.YT.Player) return Promise.resolve();
      if (ytApi) return ytApi;
      ytApi = new Promise((res, rej) => {
        const prev = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = () => { if (prev) { try { prev(); } catch (e) { /* ignore */ } } res(); };
        const sc = document.createElement('script');
        sc.src = 'https://www.youtube.com/iframe_api';
        sc.onerror = () => rej(new Error('yt'));
        document.head.appendChild(sc);
        setTimeout(() => rej(new Error('timeout')), 12000);
      });
      ytApi.catch(() => { ytApi = null; });
      return ytApi;
    }
    function showDock(on) {
      dock.hidden = !on; ytPill.hidden = true; ytHint.hidden = true;
      document.body.classList.toggle('has-dock', on);
    }
    function teardownYT() {
      ytGen++;
      if (yt) { try { yt.destroy(); } catch (e) { /* ignore */ } }
      yt = null; ytReady = null;
      const frame = dock.querySelector('.yt-frame');
      frame.innerHTML = '<div id="ytPlayer"></div>';
      showDock(false);
      document.body.classList.remove('has-dock');
      ytPill.hidden = true;
    }
    function ytFail() {
      if (mode !== 'yt') return;
      const was = playing;
      teardownYT();
      mode = 'box'; playing = false;
      if (onFail) onFail();
      if (was) start(); else ui();
    }
    function setupYT(spec) {
      const gen = ++ytGen;
      showDock(true);
      ytTitle.textContent = 'Đang phát từ YouTube';
      ytReady = loadYTApi().then(() => new Promise((res, rej) => {
        if (gen !== ytGen) return rej(new Error('stale'));
        yt = new window.YT.Player('ytPlayer', {
          width: '200', height: '200', videoId: spec.v,
          playerVars: { start: spec.s || 0, playsinline: 1, rel: 0, loop: 1, playlist: spec.v, controls: 1 },
          events: {
            onReady: () => { if (gen === ytGen) res(); },
            onError: () => { if (gen === ytGen) { rej(new Error('ytplay')); ytFail(); } },
            onStateChange: (e) => {
              if (gen !== ytGen) return;
              if (e.data === 1) {           // playing
                ytHint.hidden = true;
                if (!playing) { playing = true; ui(); }
                try { const t = yt.getVideoData && yt.getVideoData().title; if (t) ytTitle.textContent = t; } catch (err) { /* ignore */ }
              } else if (e.data === 2 && playing) { playing = false; ui(); }  // paused from the player itself
            }
          }
        });
      }));
      ytReady.catch(() => { if (gen === ytGen) ytFail(); });
    }
    $('#ytMin').addEventListener('click', () => {   // minimising pauses: the player is never hidden while playing
      userMuted = true; stop();
      dock.hidden = true; ytPill.hidden = false;
      document.body.classList.remove('has-dock');
    });
    ytPill.addEventListener('click', () => {
      showDock(true);
      userMuted = false; start();
    });

    function setTrack(spec, opts = {}) {
      stop(true);
      if (el) { try { el.pause(); el.removeAttribute('src'); el.load(); } catch (e) { /* ignore */ } }
      el = null; startedOnce = false; onFail = opts.onFail || null;
      if (mode === 'yt' || yt) teardownYT();
      if (!spec || spec.k === 'box') mode = 'box';
      else if (spec.k === 'n') mode = 'none';
      else if (spec.k === 'y') { mode = 'yt'; startAt = spec.s || 0; setupYT(spec); }
      else {
        mode = 'file';
        startAt = spec.s || 0;
        el = new Audio();
        el.loop = true; el.preload = 'auto';
        el.addEventListener('error', fileFailed);
        el.src = spec.k === 'a' ? '/_blob/' + spec.i : spec.u;
      }
      ui();
    }

    function start() {
      if (!ensureAC()) return;
      if (mode === 'none' || playing) return;
      playing = true; ui();
      if (mode === 'yt') {
        if (ytReady) ytReady.then(() => {
          if (!playing || mode !== 'yt' || !yt) return;
          try { yt.unMute(); yt.setVolume(90); yt.playVideo(); } catch (e) { /* ignore */ }
        }).catch(() => {});
        return;
      }
      if (mode === 'file') {
        if (!startedOnce) {
          startedOnce = true;
          const seek = () => { try { if (startAt > 0 && el.currentTime < startAt - 0.5) el.currentTime = Math.min(startAt, (el.duration || startAt + 1) - 1); } catch (e) { /* ignore */ } };
          if (el.readyState >= 1) seek(); else el.addEventListener('loadedmetadata', seek, { once: true });
        }
        try { el.volume = 0; } catch (e) { /* ignore */ }
        const p = el.play();
        if (p && p.catch) p.catch((err) => {
          if (err && err.name === 'NotAllowedError') { playing = false; ui(); }
          else fileFailed();
        });
        fadeVol(0.9, 2200);
      } else {
        synthStart();
      }
    }
    function stop(quiet) {
      if (!playing) { if (!quiet) ui(); return; }
      playing = false; ui();
      if (mode === 'yt') { if (yt) { try { yt.pauseVideo(); } catch (e) { /* ignore */ } } }
      else if (mode === 'file' && el) { const e0 = el; fadeVol(0, 600, () => { try { e0.pause(); } catch (e) { /* ignore */ } }); }
      else if (ac) synthStop();
    }
    btn.addEventListener('click', () => {
      if (playing) { userMuted = true; stop(); } else { userMuted = false; start(); }
      if (onState) onState(playing ? 'playing' : 'muted');
    });

    // Browsers only allow sound after the viewer touches the page. Try right
    // away; if refused, start on the very first touch or key press anywhere.
    const GESTURES = ['pointerdown', 'pointerup', 'touchend', 'keydown', 'click'];
    function onGesture(e) {
      if (e && e.target && e.target.closest && e.target.closest('#musicBtn')) return; // the button handles itself
      disarm();
      if (!userMuted && !playing) start();
      if (onState) onState(playing ? 'playing' : 'blocked');
      if (mode === 'yt') checkYT(1600);
    }
    async function checkYT(ms) {
      await wait(ms);
      if (mode !== 'yt' || userMuted) return;
      let st = -1;
      try { st = yt ? yt.getPlayerState() : -1; } catch (e) { /* ignore */ }
      if (st !== 1) { playing = false; ui(); ytHint.hidden = dock.hidden; }
    }
    function arm() {
      if (armed) return;
      armed = true;
      GESTURES.forEach((ev) => window.addEventListener(ev, onGesture, { capture: true, passive: true }));
    }
    function disarm() {
      if (!armed) return;
      armed = false;
      GESTURES.forEach((ev) => window.removeEventListener(ev, onGesture, { capture: true }));
    }
    async function autoplay(cb) {
      onState = cb || null;
      if (mode === 'none') return 'none';
      if (!ensureAC()) { arm(); return 'blocked'; }
      if (mode === 'yt') {
        start();
        try { await Promise.race([ytReady, wait(6000)]); } catch (e) { /* handled by ytFail */ }
        await wait(1300);
        let st = -1;
        try { st = yt ? yt.getPlayerState() : -1; } catch (e) { /* ignore */ }
        if (mode === 'yt' && st === 1) { if (onState) onState('playing'); return 'playing'; }
        if (mode === 'yt') { playing = false; ui(); arm(); if (onState) onState('blocked'); return 'blocked'; }
      }
      if (mode === 'file') {
        start();
        await wait(450);
        if (mode === 'file' && el && !el.paused) { if (onState) onState('playing'); return 'playing'; }
      }
      if (mode === 'box') {
        try { await Promise.race([ac.resume(), wait(450)]); } catch (e) { /* refused */ }
        if (ac.state === 'running') { if (!playing) start(); if (onState) onState('playing'); return 'playing'; }
      }
      // refused: reset quietly and wait for the first touch
      playing = false;
      if (el) { try { el.pause(); } catch (e) { /* ignore */ } }
      if (timer) { clearInterval(timer); timer = null; }
      ui();
      arm();
      if (onState) onState('blocked');
      return 'blocked';
    }
    document.addEventListener('visibilitychange', () => {
      if (mode === 'file' && el) {
        if (document.hidden) el.pause();
        else if (playing) el.play().catch(() => {});
      }
      if (!ac) return;
      if (document.hidden) ac.suspend().catch(() => {});
      else { ac.resume().catch(() => {}); if (playing && mode === 'box') nextTime = Math.max(nextTime, ac.currentTime + 0.1); }
    });

    // short music-box sparkles for key moments (quiet over a song, silent when muted)
    const sfxOk = () => ac && (playing || mode === 'none');
    function chime(kind) {
      if (!sfxOk()) return;
      const now = ac.currentTime + 0.03;
      const seq = kind === 'open' ? [84, 88, 91, 96, 100, 103] : kind === 'seal' ? [91, 96] : [79, 84, 88, 91];
      const v = (mode === 'file' || mode === 'yt') ? 0.05 : 0.075;
      seq.forEach((m, i) => bell(mtof(m), now + i * 0.085, v, sfx));
    }
    // one rising note per tap on the gift
    function note(i) {
      if (!sfxOk()) return;
      const now = ac.currentTime + 0.01;
      const m = [76, 79, 83, 86, 88][Math.max(0, Math.min(4, i))];
      const v = (mode === 'file' || mode === 'yt') ? 0.06 : 0.09;
      bell(mtof(m), now, v, sfx);
      bell(mtof(m + 12), now + 0.06, v * 0.5, sfx);
    }
    ui();
    // callers in the recipient flow respect a viewer who muted; the sender's preview forces
    const startFor = (force) => { if (force) userMuted = false; if (!userMuted) start(); };
    return { setTrack, start: startFor, stop, chime, note, autoplay, isPlaying: () => playing };
  })();

  /* ---------------------------------------------------------
     BUTTON RIPPLE (clipped inside the pill so the halo can glow)
     --------------------------------------------------------- */
  document.addEventListener('pointerdown', (e) => {
    const b = e.target.closest('.btn');
    if (!b) return;
    let clip = b.querySelector(':scope > .btn-clip');
    if (!clip) { clip = document.createElement('span'); clip.className = 'btn-clip'; b.prepend(clip); }
    const r = b.getBoundingClientRect();
    const d = Math.max(r.width, r.height) * 2.2;
    const s = document.createElement('span');
    s.className = 'ripple';
    s.style.cssText = `width:${d}px;height:${d}px;left:${e.clientX - r.left - d / 2}px;top:${e.clientY - r.top - d / 2}px`;
    clip.appendChild(s);
    setTimeout(() => s.remove(), 800);
  });

  /* ---------------------------------------------------------
     SCENE TRANSITIONS
     goTo   — letterbox bars + a line of light across the screen
     irisTo — light opens from a point (used when the gift opens)
     --------------------------------------------------------- */
  const cine = $('#cine');
  const iris = $('#iris');
  let transitioning = false;

  function activate(next) {
    document.querySelectorAll('.screen.is-active').forEach((el) => { if (el !== next) el.classList.remove('is-active', 'exiting'); });
    next.classList.add('entering', 'is-active');
    next.scrollTop = 0;
    void next.offsetWidth;
    next.classList.remove('entering');
  }

  async function goTo(sel) {
    const next = $(sel);
    const cur = document.querySelector('.screen.is-active');
    if (!next || next === cur || transitioning) return;
    transitioning = true;
    cine.classList.add('on');
    if (cur) cur.classList.add('exiting');
    await wait(reduceMotion ? 200 : 780);
    activate(next);
    await wait(reduceMotion ? 50 : 200);
    cine.classList.remove('on');
    await wait(reduceMotion ? 100 : 520);
    transitioning = false;
  }

  async function irisTo(sel, x, y) {
    const next = $(sel);
    if (!next || transitioning) return;
    if (reduceMotion) { await goTo(sel); return; }
    transitioning = true;
    iris.classList.remove('fade', 'grow');
    iris.style.setProperty('--ix', `${x}px`);
    iris.style.setProperty('--iy', `${y}px`);
    void iris.offsetWidth;
    iris.classList.add('grow');
    await wait(1180);
    activate(next);
    iris.classList.remove('grow');
    iris.classList.add('fade');
    await wait(1150);
    iris.classList.remove('fade');
    transitioning = false;
  }

  function showNow(sel) {
    document.querySelectorAll('.screen.is-active').forEach((el) => el.classList.remove('is-active'));
    $(sel).classList.add('is-active');
  }

  /* ---------------------------------------------------------
     GIFT LINK — the wish is packed into the link itself
     (#g.<data>), so the site needs no server or database.
     --------------------------------------------------------- */
  const CONFIG = Object.assign({ ADMIN_PASSWORD_HASH: '', SHARE_BASE_URL: '' }, window.GIFT_CONFIG || {});

  const b64u = {
    enc(bytes) {
      let s = '';
      for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
      return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    },
    dec(str) {
      let b = str.replace(/-/g, '+').replace(/_/g, '/');
      while (b.length % 4) b += '=';
      const bin = atob(b);
      return Uint8Array.from(bin, (c) => c.charCodeAt(0));
    }
  };

  async function pipeBytes(bytes, stream) {
    const out = new Blob([bytes]).stream().pipeThrough(stream);
    return new Uint8Array(await new Response(out).arrayBuffer());
  }

  async function encodeGift(d) {
    const payload = { t: d.to, f: d.from, r: d.rel };
    if (d.msg !== DEFAULT_WISH) payload.m = d.msg;
    if (d.music && d.music.k !== 'box') payload.a = d.music;
    const json = new TextEncoder().encode(JSON.stringify(payload));
    if ('CompressionStream' in window) {
      try { return 'g.z.' + b64u.enc(await pipeBytes(json, new CompressionStream('deflate-raw'))); } catch (e) { /* fall through */ }
    }
    return 'g.u.' + b64u.enc(json);
  }

  async function decodeGift(token) {
    const kind = token.slice(0, 4);
    let bytes = b64u.dec(token.slice(4));
    if (kind === 'g.z.') bytes = await pipeBytes(bytes, new DecompressionStream('deflate-raw'));
    else if (kind !== 'g.u.') throw new Error('unknown');
    const o = JSON.parse(new TextDecoder().decode(bytes));
    const to = String(o.t || '').trim().slice(0, 40);
    if (!to) throw new Error('empty');
    return {
      to,
      from: String(o.f || '').trim().slice(0, 40) || 'Một người thương bạn',
      rel: String(o.r || '').slice(0, 30),
      msg: String(o.m || '').trim().slice(0, 600) || DEFAULT_WISH,
      music: cleanMusic(o.a)
    };
  }

  // accept only the music shapes this page writes
  function cleanMusic(a) {
    if (!a || typeof a !== 'object') return { k: 'box' };
    const s = Math.max(0, Math.min(900, Math.floor(Number(a.s) || 0)));
    if (a.k === 'n') return { k: 'n' };
    if (a.k === 'a' && typeof a.i === 'string' && /^[A-Za-z0-9_-]{16,64}$/.test(a.i)) return { k: 'a', i: a.i, s };
    if (a.k === 'y' && typeof a.v === 'string' && /^[A-Za-z0-9_-]{11}$/.test(a.v)) return { k: 'y', v: a.v, s };
    if (a.k === 'u' && typeof a.u === 'string' && a.u.length < 600 && (/^https?:\/\/[^\s"'<>]+$/i.test(a.u) || /^[\w\-./%]+$/.test(a.u))) return { k: 'u', u: a.u, s };
    return { k: 'box' };
  }

  function shareUrl(token) {
    const base = (CONFIG.SHARE_BASE_URL || location.href).split('#')[0];
    return base + '#' + token;
  }

  /* ---------------------------------------------------------
     SENDER LOGIN — password checked as a SHA-256 hash
     --------------------------------------------------------- */
  const SHA_K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];
  // Pure-JS fallback for pages opened where crypto.subtle is unavailable (e.g. plain http)
  function sha256Fallback(bytes) {
    const rotr = (x, n) => (x >>> n) | (x << (32 - n));
    const len = bytes.length;
    const buf = new Uint8Array(((len + 9 + 63) >> 6) << 6);
    buf.set(bytes); buf[len] = 0x80;
    const dv = new DataView(buf.buffer);
    dv.setUint32(buf.length - 4, (len * 8) >>> 0);
    dv.setUint32(buf.length - 8, Math.floor((len * 8) / 4294967296));
    let H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
    const w = new Uint32Array(64);
    for (let i = 0; i < buf.length; i += 64) {
      for (let t = 0; t < 16; t++) w[t] = dv.getUint32(i + t * 4);
      for (let t = 16; t < 64; t++) {
        const s0 = rotr(w[t - 15], 7) ^ rotr(w[t - 15], 18) ^ (w[t - 15] >>> 3);
        const s1 = rotr(w[t - 2], 17) ^ rotr(w[t - 2], 19) ^ (w[t - 2] >>> 10);
        w[t] = (w[t - 16] + s0 + w[t - 7] + s1) >>> 0;
      }
      let [a, b, c, d, e, f, g, h] = H;
      for (let t = 0; t < 64; t++) {
        const t1 = (h + (rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25)) + ((e & f) ^ (~e & g)) + SHA_K[t] + w[t]) >>> 0;
        const t2 = ((rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22)) + ((a & b) ^ (a & c) ^ (b & c))) >>> 0;
        h = g; g = f; f = e; e = (d + t1) >>> 0; d = c; c = b; b = a; a = (t1 + t2) >>> 0;
      }
      H = [H[0] + a, H[1] + b, H[2] + c, H[3] + d, H[4] + e, H[5] + f, H[6] + g, H[7] + h].map((v) => v >>> 0);
    }
    return H.map((v) => v.toString(16).padStart(8, '0')).join('');
  }
  async function sha256Hex(str) {
    const bytes = new TextEncoder().encode(String(str).normalize('NFC'));
    if (window.crypto && crypto.subtle) {
      try {
        const h = new Uint8Array(await crypto.subtle.digest('SHA-256', bytes));
        return Array.from(h, (b) => b.toString(16).padStart(2, '0')).join('');
      } catch (e) { /* fall through */ }
    }
    return sha256Fallback(bytes);
  }
  // Helper for changing the password: run hashPassword('...') in the browser console
  window.hashPassword = async (pw) => { const h = await sha256Hex(pw); console.log(h); return h; };

  const store = {
    get(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { sessionStorage.setItem(k, v); } catch (e) { /* ignore */ } },
    del(k) { try { sessionStorage.removeItem(k); } catch (e) { /* ignore */ } }
  };
  let loggedIn = store.get('mq_sender') === CONFIG.ADMIN_PASSWORD_HASH;


  /* ---------------------------------------------------------
     MODE — 'guest' (link with a gift) or 'sender'
     --------------------------------------------------------- */
  let MODE = 'sender';
  let guestGift = null;   // gift decoded from the link
  let lastGift = null;    // gift the sender just created
  let activeGift = null;  // gift currently shown in the intro / card
  const exitPreview = $('#exitPreview');

  /* ---------------------------------------------------------
     0. GATE — "lights off": the recipient's name, one typed line,
        then a tap that starts the music and opens into the sky
     --------------------------------------------------------- */
  const gateScreen = $('#gate');
  const gateBtn = $('#gateBtn');
  const gateTo = $('#gateTo');
  const gateLine = $('#gateLine');
  let gateRun = 0;
  let gateLeaving = false;

  function prepareGate() {
    gateRun++;
    gateLeaving = false;
    gateBtn.classList.remove('show-to', 'typing', 'ready', 'leaving');
    gateTo.textContent = '';
    gateLine.textContent = '';
  }

  async function runGate(d) {
    const my = gateRun;
    const fontsReady = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();
    await Promise.race([fontsReady, wait(2500)]);
    await wait(reduceMotion ? 100 : 700);
    if (my !== gateRun) return;
    gateTo.textContent = `Gửi ${d.to},`;
    gateBtn.classList.add('show-to');
    await wait(reduceMotion ? 100 : 1500);
    if (my !== gateRun) return;
    const fromDefault = d.from === 'Một người thương bạn';
    const line = fromDefault
      ? 'Có một món quà nhỏ đang chờ bạn mở…'
      : `Có một món quà nhỏ từ ${d.from} đang chờ bạn mở…`;
    if (reduceMotion) { gateLine.textContent = line; }
    else {
      gateBtn.classList.add('typing');
      const chars = Array.from(line);
      for (let i = 1; i <= chars.length; i++) {
        if (my !== gateRun) return;
        gateLine.textContent = chars.slice(0, i).join('');
        const c = chars[i - 1];
        await wait(c === ',' ? 220 : c === '…' ? 300 : 46);
      }
      gateBtn.classList.remove('typing');
    }
    if (my !== gateRun) return;
    gateBtn.classList.add('ready');
  }

  async function leaveGate() {
    if (gateLeaving || transitioning || !gateScreen.classList.contains('is-active')) return;
    gateLeaving = true;
    gateRun++;
    Music.start();
    Music.chime('soft');
    gateBtn.classList.add('leaving');
    const orb = gateBtn.querySelector('.gate-orb').getBoundingClientRect();
    const x = orb.left + orb.width / 2, y = orb.top + orb.height / 2;
    FX.burst(x, y, { sparks: isMobile ? 20 : 34, dust: isMobile ? 40 : 70, spread: 7 });
    await wait(reduceMotion ? 50 : 380);
    FX.setLevel('intro');
    await irisTo('#intro', x, y);
  }
  gateScreen.addEventListener('click', leaveGate);
  gateBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); leaveGate(); }
  });

  /* ---------------------------------------------------------
     1. INTRO — open the gift
     --------------------------------------------------------- */
  const giftScene = $('#giftScene');
  const giftBox = $('#box');
  const flash = $('#flash');
  const giftTag = $('#giftTag');
  let opened = false;

  const introInner = $('#introInner');
  const introScreen = $('#intro');
  const flare = $('#flare');

  /* the gift opens in five taps: loosen the bow, pull it off, slide the
     ribbon away, lift the lid, open */
  const STEPS = 5;
  const HINTS = [
    'Chạm vào hộp quà để gỡ nơ',
    'Chạm thêm lần nữa, nơ sắp bung rồi',
    'Giờ tháo dải ruy băng ra nhé',
    'Hé nắp hộp xem nào…',
    'Chạm lần cuối để mở quà ✨'
  ];
  const unwrapHint = $('#unwrapHint');
  const pips = Array.from(document.querySelectorAll('#unwrap .pips i'));
  let unwrapStep = 0, tapLock = false, hintT = 0;

  function showProgress(i, animate) {
    clearTimeout(hintT);
    const apply = () => { unwrapHint.textContent = HINTS[i] || ''; unwrapHint.classList.remove('swap'); };
    if (animate) { unwrapHint.classList.add('swap'); hintT = setTimeout(apply, 230); } else apply();
    pips.forEach((p, k) => { p.classList.toggle('on', k < i); p.classList.toggle('next', k === i); });
  }

  function tapRing(x, y) {
    const r = document.createElement('span');
    r.className = 'tap-ring';
    r.style.left = `${x}px`; r.style.top = `${y}px`;
    document.body.appendChild(r);
    setTimeout(() => r.remove(), 750);
  }

  function poke(strength) {
    if (reduceMotion || !giftBox.animate) return;
    const a = 0.05 + strength * 0.012;
    giftBox.animate([
      { scale: '1' }, { scale: `${1 + a} ${1 - a}` }, { scale: `${1 - a * 0.6} ${1 + a * 0.7}` }, { scale: `${1 + a * 0.2} ${1 - a * 0.15}` }, { scale: '1' }
    ], { duration: 520, easing: 'ease-out' });
  }

  function tapGift(e) {
    if (opened || !activeGift || transitioning || tapLock) return;
    if (!introScreen.classList.contains('is-active')) return;
    tapLock = true;
    setTimeout(() => { tapLock = false; }, 420);
    Music.start();
    unwrapStep++;

    const r = giftScene.getBoundingClientRect();
    const bx = r.left + r.width / 2, by = r.top + r.height * 0.52;
    const px = e && e.clientX ? e.clientX : bx, py = e && e.clientY ? e.clientY : by;
    tapRing(px, py);
    poke(unwrapStep);
    try { if (navigator.vibrate) navigator.vibrate(unwrapStep === STEPS ? [18, 40, 28] : 12); } catch (err) { /* not allowed here */ }

    if (unwrapStep < STEPS) {
      Music.note(unwrapStep - 1);
      giftScene.classList.add('s' + unwrapStep);
      FX.burst(px, py, { sparks: 8 + unwrapStep * 4, dust: 14 + unwrapStep * 7, spread: 3 + unwrapStep });
      if (unwrapStep === 2) FX.burst(bx, r.top + r.height * 0.32, { sparks: 18, dust: 34, hearts: 3, spread: 6 });
      if (unwrapStep === 3) FX.burst(bx, by, { petals: isMobile ? 6 : 10, sparks: 12, spread: 5 });
      showProgress(unwrapStep, true);
    } else {
      pips.forEach((p) => { p.classList.add('on'); p.classList.remove('next'); });
      openGift();
    }
  }

  function resetIntro(d) {
    opened = false;
    unwrapStep = 0; tapLock = false;
    showProgress(0, false);
    giftScene.classList.remove('open', 'shake', 's1', 's2', 's3', 's4');
    introInner.classList.remove('opening');
    document.body.classList.remove('opened');
    $('#tagName').textContent = d ? d.to : '';
    giftTag.hidden = !d;
    // restart the entrance choreography
    introInner.classList.add('no-anim'); void introInner.offsetWidth; introInner.classList.remove('no-anim');
  }

  // pointer parallax on the intro (box turns toward the cursor, rays drift)
  if (finePointer && !reduceMotion) {
    let sx = 0, sy = 0, lastX = 9, lastY = 9;
    const loop = () => {
      sx += (POINTER.x - sx) * 0.07; sy += (POINTER.y - sy) * 0.07;
      if (introScreen.classList.contains('is-active') && (Math.abs(sx - lastX) > 0.0008 || Math.abs(sy - lastY) > 0.0008)) {
        lastX = sx; lastY = sy;
        introScreen.style.setProperty('--px', sx.toFixed(4));
        introScreen.style.setProperty('--py', sy.toFixed(4));
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  async function openGift() {
    if (opened || !activeGift || transitioning) return;
    opened = true;
    Music.start();

    if (!reduceMotion) {
      giftScene.classList.add('shake');
      await wait(620);
      giftScene.classList.remove('shake');
    }
    giftScene.classList.add('open');
    introInner.classList.add('opening');
    document.body.classList.add('opened');
    Music.chime('open');

    const r = giftScene.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height * 0.48;
    flash.style.setProperty('--fx', `${cx}px`);
    flash.style.setProperty('--fy', `${cy}px`);
    flash.classList.remove('go'); void flash.offsetWidth; flash.classList.add('go');
    flare.style.setProperty('--fy', `${cy}px`);
    flare.classList.remove('go'); void flare.offsetWidth; flare.classList.add('go');

    await wait(200);
    FX.burst(cx, cy, { petals: isMobile ? 14 : 24, sparks: isMobile ? 36 : 70, dust: isMobile ? 50 : 110, hearts: isMobile ? 5 : 10, spread: 9 });
    FX.setLevel('shower');

    if (!reduceMotion) {
      // the recipient's name forms in light above the open box
      await wait(420);
      const top = $('.intro-top').getBoundingClientRect();
      const ty = Math.max(top.top + top.height * 0.5, 120);
      const fxFront = $('#fxFront');
      fxFront.classList.add('glow');
      const word = FX.formText(activeGift.to, cx, cy - 20, ty);
      await wait(3100);
      word.release();
      setTimeout(() => fxFront.classList.remove('glow'), 1400);
      Music.chime('soft');
      await wait(120);
    } else {
      await wait(300);
    }
    showCard(activeGift, { iris: { x: cx, y: cy } });
  }

  giftScene.addEventListener('click', tapGift);
  giftScene.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tapGift(null); }
  });

  /* ---------------------------------------------------------
     LOGIN
     --------------------------------------------------------- */
  const loginForm = $('#loginForm');
  const password = $('#password');
  const pwField = $('#pwField');
  const pwError = $('#pwError');
  const pwToggle = $('#pwToggle');

  pwToggle.addEventListener('click', () => {
    const show = password.type === 'password';
    password.type = show ? 'text' : 'password';
    pwToggle.textContent = show ? 'Ẩn' : 'Hiện';
    pwToggle.setAttribute('aria-label', show ? 'Ẩn mật khẩu' : 'Hiện mật khẩu');
  });
  password.addEventListener('input', () => { pwError.textContent = ''; pwField.classList.remove('invalid'); });

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const pw = password.value;
    const fail = (msg) => {
      pwError.textContent = msg;
      pwField.classList.remove('invalid'); void pwField.offsetWidth; pwField.classList.add('invalid');
      password.focus();
    };
    if (!pw) return fail('Hãy nhập mật khẩu.');
    const h = await sha256Hex(pw);
    if (h !== CONFIG.ADMIN_PASSWORD_HASH) return fail('Mật khẩu chưa đúng. Hãy thử lại.');
    loggedIn = true;
    store.set('mq_sender', h);
    password.value = '';
    const r = loginForm.getBoundingClientRect();
    FX.burst(r.left + r.width / 2, r.top + 60, { sparks: 26, dust: 40, spread: 6 });
    loadMusicCaps();
    await goTo('#compose');
    if (finePointer) $('#recipient').focus({ preventScroll: true });
  });

  $('#logoutBtn').addEventListener('click', async () => {
    stopPreview();
    loggedIn = false;
    store.del('mq_sender');
    await goTo('#login');
  });

  /* ---------------------------------------------------------
     2. COMPOSE
     --------------------------------------------------------- */
  const form = $('#wishForm');
  const recipient = $('#recipient');
  const sender = $('#sender');
  const relation = $('#relation');
  const message = $('#message');
  const useSuggest = $('#useSuggest');
  const shuffleBtn = $('#shuffle');
  const count = $('#count');
  const recipientField = $('#recipientField');
  const recipientError = $('#recipientError');

  let savedUserText = '';
  let suggestIdx = 0;
  let currentSuggestion = '';

  function updateCount() { count.textContent = `${message.value.length}/600`; }

  function fillSuggestion() {
    const list = SUGGESTIONS[relation.value] || SUGGESTIONS['Người đặc biệt'];
    currentSuggestion = list[suggestIdx % list.length];
    message.value = currentSuggestion;
    message.classList.remove('flashed'); void message.offsetWidth; message.classList.add('flashed');
    updateCount();
  }

  useSuggest.addEventListener('change', () => {
    if (useSuggest.checked) {
      savedUserText = message.value;
      suggestIdx = 0;
      fillSuggestion();
      shuffleBtn.hidden = false;
    } else {
      if (message.value === currentSuggestion) message.value = savedUserText;
      shuffleBtn.hidden = true;
      updateCount();
    }
  });
  relation.addEventListener('change', () => { if (useSuggest.checked) { suggestIdx = 0; fillSuggestion(); } });
  shuffleBtn.addEventListener('click', () => { suggestIdx++; fillSuggestion(); });
  message.addEventListener('input', updateCount);

  function setError(msg) {
    recipientError.textContent = msg;
    recipientField.classList.remove('invalid');
    if (msg) {
      void recipientField.offsetWidth;
      recipientField.classList.add('invalid');
      recipient.setAttribute('aria-invalid', 'true');
    } else {
      recipient.removeAttribute('aria-invalid');
    }
  }
  recipient.addEventListener('input', () => { if (recipient.value.trim()) setError(''); });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!loggedIn) { goTo('#login'); return; }
    const to = recipient.value.trim().replace(/\s+/g, ' ');
    if (!to) { setError('Hãy nhập tên người nhận để lời chúc đến đúng người nhé.'); recipient.focus(); return; }
    if (to.length < 2) { setError('Tên người nhận cần ít nhất 2 ký tự.'); recipient.focus(); return; }
    setError('');
    const music = currentMusic();
    if (!music) {
      musicNote.textContent = musicSel.value === '__upload'
        ? 'Hãy tải bài hát lên trước, hoặc chọn một bài khác.'
        : musicSel.value === '__yt' ? 'Link YouTube chưa hợp lệ. Hãy dán link video YouTube.'
        : 'Đường dẫn nhạc chưa hợp lệ. Hãy dán link bắt đầu bằng https://';
      musicSel.focus();
      return;
    }
    stopPreview();
    lastGift = {
      to,
      from: sender.value.trim().replace(/\s+/g, ' ') || 'Một người thương bạn',
      rel: relation.value,
      msg: message.value.trim() || DEFAULT_WISH,
      music
    };
    await fillShare(lastGift);
    const btn = form.querySelector('button[type=submit]').getBoundingClientRect();
    FX.burst(btn.left + btn.width / 2, btn.top + btn.height / 2, { sparks: 30, dust: 50, hearts: 6, spread: 7 });
    goTo('#share');
  });

  function resetForm() {
    form.reset();
    relation.value = 'Người đặc biệt';
    shuffleBtn.hidden = true;
    musicStart.value = '0';
    renderMusicOptions('box');
    savedUserText = ''; currentSuggestion = '';
    setError('');
    updateCount();
  }

  /* ---------------------------------------------------------
     MUSIC PICKER — the sender chooses what plays for the recipient.
     On Claude: upload a song into the page's own storage (mp3/wav/…
     are converted to WebM in the browser first, since the store takes
     mp4/webm). Self-hosted: list files in config.js or paste a link.
     --------------------------------------------------------- */
  const musicSel = $('#musicSel');
  const musicPreview = $('#musicPreview');
  const musicPreviewLabel = musicPreview.querySelector('.btn-label');
  const urlBox = $('#urlBox'), musicUrl = $('#musicUrl');
  const uploadBox = $('#uploadBox'), musicFile = $('#musicFile'), dropZone = $('#dropZone'), dropText = $('#dropText');
  const musicName = $('#musicName'), musicUpload = $('#musicUpload'), uploadCancel = $('#uploadCancel');
  const uploadProgress = $('#uploadProgress'), uploadBar = $('#uploadBar'), uploadStatus = $('#uploadStatus');
  const musicExtra = $('#musicExtra'), musicStart = $('#musicStart'), musicDelete = $('#musicDelete'), musicNote = $('#musicNote');

  const inClaude = !!(window.claude && typeof window.claude.use === 'function');
  let assetsCap = null, dbCap = null, capsLoaded = false;
  let pendingFile = null, previewing = false, lastPick = 'box', deleteArmT = 0;
  const library = (Array.isArray(CONFIG.MUSIC_LIBRARY) ? CONFIG.MUSIC_LIBRARY : [])
    .filter((t) => t && typeof t.url === 'string' && t.name)
    .map((t, i) => ({ key: 'u:' + i, name: String(t.name).slice(0, 60), spec: cleanMusic({ k: 'u', u: t.url }) }))
    .filter((t) => t.spec.k === 'u');

  const LOCAL_LIB = 'mq_music_lib';
  function saveLocalLib() {
    try { localStorage.setItem(LOCAL_LIB, JSON.stringify(library.filter((t) => t.spec.k === 'a').map((t) => ({ name: t.name, id: t.spec.i })))); } catch (e) { /* ignore */ }
  }

  function opt(value, label) { const o = document.createElement('option'); o.value = value; o.textContent = label; return o; }

  function renderMusicOptions(selectKey) {
    const keep = selectKey || musicSel.value || 'box';
    musicSel.innerHTML = '';
    musicSel.appendChild(opt('box', '🎐 Hộp nhạc nhẹ nhàng (mặc định)'));
    if (library.length) {
      const g = document.createElement('optgroup');
      g.label = 'Thư viện nhạc của bạn';
      library.forEach((t) => g.appendChild(opt(t.key, '♪ ' + t.name)));
      musicSel.appendChild(g);
    }
    musicSel.appendChild(opt('none', '🔇 Không phát nhạc'));
    if (assetsCap) musicSel.appendChild(opt('__upload', '＋ Tải bài hát mới lên…'));
    const ytOpt = opt('__yt', inClaude ? '▶ Link YouTube (chỉ dùng khi tự đưa web lên mạng)' : '▶ Dán link YouTube…');
    if (inClaude) ytOpt.disabled = true;
    musicSel.appendChild(ytOpt);
    if (!inClaude) musicSel.appendChild(opt('__url', '🔗 Dán link file nhạc…'));
    musicSel.value = Array.from(musicSel.options).some((o) => o.value === keep) ? keep : 'box';
    updateMusicUI();
  }

  function trackFor(key) { return library.find((t) => t.key === key) || null; }

  function stopPreview() {
    if (previewing) { Music.stop(); Music.setTrack({ k: 'box' }); }
    previewing = false;
    musicPreviewLabel.textContent = '▶ Nghe thử';
  }

  function disarmDelete() {
    clearTimeout(deleteArmT);
    musicDelete.classList.remove('armed');
    musicDelete.textContent = 'Xóa bài này khỏi thư viện';
  }

  function updateMusicUI() {
    const v = musicSel.value;
    stopPreview();
    disarmDelete();
    urlBox.hidden = v !== '__url';
    uploadBox.hidden = v !== '__upload';
    ytBox.hidden = v !== '__yt';
    const isSong = v.startsWith('a:') || v.startsWith('u:') || v === '__url' || v === '__yt';
    musicExtra.hidden = !isSong;
    musicDelete.hidden = !(v.startsWith('a:') && assetsCap);
    musicPreview.hidden = v === 'none' || v === '__upload';
    if (v !== '__upload' && v !== '__url' && v !== '__yt') lastPick = v;
    musicNote.textContent =
      v === 'box' ? 'Giai điệu hộp nhạc được tạo ngay trên trình duyệt, không cần file.' :
      v === 'none' ? 'Người nhận vẫn nghe tiếng chuông nhỏ mỗi lần chạm vào hộp quà.' :
      (v === '__upload' && !library.some((t) => t.spec.k === 'a')) ? 'Bài hát được lưu trong trang này và phát cho người nhận khi họ mở hộp quà.' : '';
  }

  // the music spec that goes into the link; null means "not ready yet"
  function currentMusic() {
    const v = musicSel.value;
    const s = Math.max(0, Math.min(900, Math.floor(Number(musicStart.value) || 0)));
    if (v === 'box') return { k: 'box' };
    if (v === 'none') return { k: 'n' };
    if (v === '__url') {
      const spec = cleanMusic({ k: 'u', u: musicUrl.value.trim(), s });
      return spec.k === 'u' ? spec : null;
    }
    if (v === '__yt') {
      const y = parseYouTube(ytUrl.value);
      return y ? { k: 'y', v: y.id, s } : null;
    }
    if (v === '__upload') return null;
    const t = trackFor(v);
    return t ? Object.assign({}, t.spec, { s }) : { k: 'box' };
  }
  function musicLabel(spec) {
    if (!spec || spec.k === 'box') return 'Hộp nhạc nhẹ nhàng';
    if (spec.k === 'y') return 'Bài hát từ YouTube';
    if (spec.k === 'n') return 'Không phát nhạc';
    const t = library.find((x) => (spec.k === 'a' ? x.spec.i === spec.i : x.spec.u === spec.u));
    return t ? t.name : 'Bài hát từ đường dẫn';
  }

  const ytBox = $('#ytBox'), ytUrl = $('#ytUrl'), ytNote = $('#ytNote');
  const YT_NOTE = ytNote.textContent;
  // youtu.be/ID, youtube.com/watch?v=ID, /shorts/ID, /embed/ID, /live/ID, music.youtube.com; reads ?t= as the start
  function parseYouTube(raw) {
    try {
      const u = new URL(String(raw || '').trim());
      const host = u.hostname.replace(/^(www|m|music)\./, '');
      let id = null;
      if (host === 'youtu.be') id = u.pathname.slice(1).split('/')[0];
      else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
        if (u.pathname === '/watch') id = u.searchParams.get('v');
        else { const m = u.pathname.match(/^\/(shorts|embed|live|v)\/([^/?#]+)/); if (m) id = m[2]; }
      }
      if (!id || !/^[A-Za-z0-9_-]{11}$/.test(id)) return null;
      const t = u.searchParams.get('t') || u.searchParams.get('start') || '';
      const m = String(t).match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s?)?$/);
      const sec = m ? (Number(m[1] || 0) * 3600 + Number(m[2] || 0) * 60 + Number(m[3] || 0)) : 0;
      return { id, s: sec };
    } catch (e) { return null; }
  }
  ytUrl.addEventListener('input', () => {
    stopPreview();
    const raw = ytUrl.value.trim();
    if (!raw) { ytNote.textContent = YT_NOTE; ytNote.classList.remove('err', 'ok'); return; }
    const y = parseYouTube(raw);
    if (y) {
      if (y.s && !Number(musicStart.value)) musicStart.value = String(y.s);
      ytNote.textContent = '✓ Đã nhận video YouTube. Bấm “Nghe thử” để kiểm tra video có cho phát trên trang khác không.';
      ytNote.classList.add('ok'); ytNote.classList.remove('err');
    } else {
      ytNote.textContent = 'Link này chưa phải link video YouTube. Hãy mở video, bấm Chia sẻ rồi sao chép link.';
      ytNote.classList.add('err'); ytNote.classList.remove('ok');
    }
  });

  musicSel.addEventListener('change', updateMusicUI);
  musicStart.addEventListener('change', stopPreview);
  musicUrl.addEventListener('input', () => { stopPreview(); musicNote.textContent = ''; });

  musicPreview.addEventListener('click', () => {
    if (previewing) { stopPreview(); return; }
    const spec = currentMusic();
    if (!spec) {
      musicNote.textContent = musicSel.value === '__url' ? 'Đường dẫn chưa hợp lệ. Hãy dán link bắt đầu bằng https://'
        : musicSel.value === '__yt' ? 'Hãy dán link video YouTube trước.' : '';
      return;
    }
    Music.setTrack(spec, { onFail: () => { previewing = false; Music.stop(); musicPreviewLabel.textContent = '▶ Nghe thử'; musicNote.textContent = spec.k === 'y' ? 'Video này không phát được trên trang khác (chủ video tắt nhúng, video bị xóa hoặc giới hạn). Hãy chọn video khác.' : 'Không phát được bài này. Hãy kiểm tra lại đường dẫn hoặc định dạng file.'; } });
    Music.start(true);
    previewing = true;
    musicPreviewLabel.textContent = '■ Dừng';
  });

  /* --- upload --- */
  function pickFile(file) {
    if (!file) return;
    pendingFile = file;
    const mb = (file.size / 1048576).toFixed(1);
    dropText.textContent = `${file.name} · ${mb} MB`;
    if (!musicName.value.trim()) musicName.value = file.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim().slice(0, 60);
    musicUpload.disabled = false;
    setUploadStatus('', '');
  }
  function setUploadStatus(text, kind) {
    uploadStatus.textContent = text;
    uploadStatus.classList.toggle('err', kind === 'err');
    uploadStatus.classList.toggle('ok', kind === 'ok');
  }
  function setBar(p) { uploadBar.style.width = `${Math.round(Math.max(0, Math.min(1, p)) * 100)}%`; }

  musicFile.addEventListener('change', () => pickFile(musicFile.files && musicFile.files[0]));
  ['dragenter', 'dragover'].forEach((ev) => dropZone.addEventListener(ev, (e) => { e.preventDefault(); dropZone.classList.add('drag'); }));
  ['dragleave', 'drop'].forEach((ev) => dropZone.addEventListener(ev, () => dropZone.classList.remove('drag')));
  dropZone.addEventListener('drop', (e) => { e.preventDefault(); pickFile(e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]); });

  uploadCancel.addEventListener('click', () => {
    pendingFile = null; musicFile.value = ''; musicName.value = '';
    dropText.textContent = 'Chọn file nhạc trên máy (mp3, m4a, wav…)';
    musicUpload.disabled = true; setUploadStatus('', '');
    musicSel.value = lastPick; updateMusicUI();
  });

  function loadScript(src) {
    return new Promise((res, rej) => {
      const el = document.createElement('script');
      el.src = src; el.onload = res; el.onerror = () => rej(new Error('muxer'));
      document.head.appendChild(el);
    });
  }

  // mp4/m4a/webm upload as they are; anything else is re-encoded to WebM/Opus
  async function toUploadable(file, onProgress) {
    const name = (file.name || '').toLowerCase();
    const ext = name.includes('.') ? name.split('.').pop() : '';
    if (['mp4', 'm4a', 'm4v'].includes(ext) || /^(audio|video)\/(mp4|x-m4a|m4a)$/.test(file.type)) return { blob: file, type: 'video/mp4' };
    if (['webm', 'weba'].includes(ext) || /^(audio|video)\/webm$/.test(file.type)) return { blob: file, type: 'video/webm' };
    if (!('AudioEncoder' in window) || !('AudioData' in window) || !('OfflineAudioContext' in window)) throw new Error('noenc');
    if (!window.WebMMuxer) await loadScript('vendor/webm-muxer.js');

    let audio;
    try { audio = await new OfflineAudioContext(2, 48000, 48000).decodeAudioData(await file.arrayBuffer()); }
    catch (e) { throw new Error('decode'); }
    if (audio.duration > 900) throw new Error('toolong');
    const ch = Math.min(2, audio.numberOfChannels), sr = audio.sampleRate;
    const cfg = { codec: 'opus', sampleRate: sr, numberOfChannels: ch, bitrate: 128000 };
    const sup = await AudioEncoder.isConfigSupported(cfg).catch(() => ({ supported: false }));
    if (!sup.supported) throw new Error('noenc');

    const target = new WebMMuxer.ArrayBufferTarget();
    const muxer = new WebMMuxer.Muxer({ target, audio: { codec: 'A_OPUS', sampleRate: sr, numberOfChannels: ch } });
    let encErr = null;
    const enc = new AudioEncoder({ output: (c, m) => muxer.addAudioChunk(c, m), error: (e) => { encErr = e; } });
    enc.configure(cfg);
    const CHUNK = 24000;
    for (let off = 0, n = 0; off < audio.length; off += CHUNK, n++) {
      if (encErr) break;
      const len = Math.min(CHUNK, audio.length - off);
      const data = new Float32Array(len * ch);
      for (let c = 0; c < ch; c++) data.set(audio.getChannelData(c).subarray(off, off + len), c * len);
      const frame = new AudioData({ format: 'f32-planar', sampleRate: sr, numberOfFrames: len, numberOfChannels: ch, timestamp: Math.round(off / sr * 1e6), data });
      enc.encode(frame); frame.close();
      if (n % 8 === 0) { onProgress(off / audio.length); await wait(0); }
    }
    await enc.flush();
    if (encErr) throw new Error('encode');
    muxer.finalize();
    onProgress(1);
    return { blob: new Blob([target.buffer], { type: 'video/webm' }), type: 'video/webm' };
  }

  const UPLOAD_ERRORS = {
    noenc: 'Trình duyệt này chưa tự chuyển được file mp3/wav. Hãy dùng Chrome hoặc Edge bản mới, hoặc chọn file .m4a, .mp4, .webm.',
    decode: 'Không đọc được file này. Hãy thử một file nhạc khác.',
    toolong: 'Bài hát dài hơn 15 phút. Hãy chọn bài ngắn hơn.',
    encode: 'Chuyển định dạng bị lỗi giữa chừng. Hãy thử lại.',
    muxer: 'Không tải được công cụ chuyển định dạng. Kiểm tra mạng rồi thử lại.',
    too_large: 'File sau khi xử lý vẫn lớn hơn 20 MB. Hãy chọn bài ngắn hơn hoặc file nhẹ hơn.',
    unsupported_type: 'Định dạng này không lưu được. Hãy dùng mp3, m4a hoặc wav.',
    quota_or_state: 'Thư viện đã đầy. Hãy xóa bớt bài cũ rồi thử lại.',
    rate_limited: 'Bạn thao tác hơi nhanh. Đợi một lát rồi thử lại nhé.',
    not_granted: 'Trang chưa được cấp quyền lưu file. Hãy mở trang khi đã đăng nhập Claude bằng tài khoản chủ trang.'
  };

  musicUpload.addEventListener('click', async () => {
    if (!pendingFile || !assetsCap) return;
    const name = (musicName.value.trim() || pendingFile.name.replace(/\.[^.]+$/, '')).slice(0, 60);
    musicUpload.disabled = true; uploadCancel.disabled = true;
    uploadProgress.hidden = false; setBar(0.02);
    setUploadStatus('Đang chuẩn bị bài hát…', '');
    try {
      const out = await toUploadable(pendingFile, (p) => { setBar(p * 0.8); setUploadStatus(`Đang chuyển định dạng… ${Math.round(p * 100)}%`, ''); });
      setBar(0.85); setUploadStatus('Đang lưu vào thư viện…', '');
      const res = await assetsCap.upload(out.blob, { type: out.type });
      let docId = null;
      if (dbCap) {
        try { const ref = await dbCap.collection('music').add({ name, assetId: res.id, contentType: res.contentType, sizeBytes: res.sizeBytes, createdAt: Date.now() }); docId = ref.id; }
        catch (e) { /* kept locally below */ }
      }
      const key = 'a:' + res.id;
      library.push({ key, name, spec: { k: 'a', i: res.id }, docId });
      saveLocalLib();
      setBar(1);
      setUploadStatus('', '');
      pendingFile = null; musicFile.value = ''; musicName.value = '';
      dropText.textContent = 'Chọn file nhạc trên máy (mp3, m4a, wav…)';
      renderMusicOptions(key);
      musicNote.textContent = `Đã thêm “${name}” vào thư viện và chọn làm nhạc nền.`;
    } catch (e) {
      const code = (e && (e.code || e.message)) || '';
      setUploadStatus(UPLOAD_ERRORS[code] || `Chưa tải lên được (${code || 'lỗi không rõ'}). Hãy thử lại.`, 'err');
      musicUpload.disabled = !pendingFile;
    } finally {
      uploadCancel.disabled = false;
      setTimeout(() => { uploadProgress.hidden = true; setBar(0); }, 900);
    }
  });

  musicDelete.addEventListener('click', async () => {
    const t = trackFor(musicSel.value);
    if (!t || t.spec.k !== 'a') return;
    if (!musicDelete.classList.contains('armed')) {
      musicDelete.classList.add('armed');
      musicDelete.textContent = 'Bấm lần nữa để xóa hẳn';
      deleteArmT = setTimeout(disarmDelete, 4000);
      return;
    }
    disarmDelete();
    stopPreview();
    try { await assetsCap.delete(t.spec.i); } catch (e) { /* already gone */ }
    if (dbCap && t.docId) { try { await dbCap.doc('music/' + t.docId).delete(); } catch (e) { /* ignore */ } }
    library.splice(library.indexOf(t), 1);
    saveLocalLib();
    renderMusicOptions('box');
    musicNote.textContent = `Đã xóa “${t.name}”. Những link đã gửi có bài này sẽ phát hộp nhạc thay thế.`;
  });

  // on Claude, the uploader and the song list (sender only; recipients never ask)
  async function loadMusicCaps() {
    if (capsLoaded || !inClaude) return;
    capsLoaded = true;
    try { assetsCap = await window.claude.use('assets'); } catch (e) { assetsCap = null; }
    try { dbCap = await window.claude.use('db'); } catch (e) { dbCap = null; }
    const seen = new Set(library.map((t) => t.key));
    const addTrack = (id, name, docId) => {
      const key = 'a:' + id;
      if (!id || seen.has(key)) return;
      seen.add(key);
      library.push({ key, name: String(name || 'Bài hát').slice(0, 60), spec: { k: 'a', i: id }, docId: docId || null });
    };
    if (dbCap) {
      try {
        const snap = await dbCap.collection('music').orderBy('createdAt').get();
        snap.docs.forEach((d) => { const x = d.data(); if (x && typeof x.assetId === 'string') addTrack(x.assetId, x.name, d.id); });
      } catch (e) { /* fall back to this browser's list */ }
    }
    try { (JSON.parse(localStorage.getItem(LOCAL_LIB) || '[]') || []).forEach((t) => addTrack(t.id, t.name)); } catch (e) { /* ignore */ }
    renderMusicOptions(musicSel.value || 'box');
  }

  renderMusicOptions('box');

  /* ---------------------------------------------------------
     SHARE
     --------------------------------------------------------- */
  const shareLink = $('#shareLink');
  const copyBtn = $('#copyBtn');
  const copyLabel = copyBtn.querySelector('.btn-label');
  const copyStatus = $('#copyStatus');
  const openLink = $('#openLink');

  async function fillShare(d) {
    const url = shareUrl(await encodeGift(d));
    shareLink.value = url;
    openLink.href = url;
    $('#shareName').textContent = d.to;
    $('#sumRel').textContent = d.rel;
    $('#sumFrom').textContent = d.from;
    $('#sumMsg').textContent = '“' + d.msg + '”';
    $('#sumMusic').textContent = '♫ ' + musicLabel(d.music);
    qrUrl = url;
    if (!qrCap1Touched) qrCap1.value = `Gửi ${d.to}`;
    if (!qrCap2.value.trim()) qrCap2.value = 'Quét mã để mở quà 20/10';
    renderQR();
    copyStatus.textContent = '';
    copyLabel.textContent = 'Sao chép';
  }

  copyBtn.addEventListener('click', () => {
    const url = shareLink.value;
    const done = () => {
      copyLabel.textContent = 'Đã sao chép ✓';
      copyStatus.textContent = 'Link đã nằm trong bộ nhớ tạm, dán vào tin nhắn để gửi đi.';
      const r = copyBtn.getBoundingClientRect();
      FX.burst(r.left + r.width / 2, r.top + r.height / 2, { sparks: 18, dust: 30, spread: 5 });
    };
    const fallback = () => {
      shareLink.focus(); shareLink.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      if (ok) done(); else copyStatus.textContent = 'Link đã được chọn sẵn, hãy nhấn giữ (hoặc Ctrl+C) để sao chép.';
    };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(done, fallback);
    else fallback();
  });
  shareLink.addEventListener('focus', () => shareLink.select());

  /* ---------------------------------------------------------
     QR STUDIO — the gift link drawn as a styled QR card. Every change
     re-renders and the result is scanned back with jsQR, so the sender
     sees at once whether a style is still readable.
     --------------------------------------------------------- */
  const qrCanvas = $('#qrCanvas'), qrLoading = $('#qrLoading'), qrCheck = $('#qrCheck'), qrStatusEl = $('#qrStatus');
  const qrCap1 = $('#qrCap1'), qrCap2 = $('#qrCap2');
  let qrUrl = '', qrCap1Touched = false, qrTimer = 0, qrScanTimer = 0, qrLibs = null, qrRun = 0;

  const QR_PALETTES = [
    { id: 'wine', name: 'Rượu vang & vàng', c1: '#7a1c3e', c2: '#c2416a', ce: '#a37a3c', qbg: '#fffaf3', cardBg: '#2a0a18', border: '#d9b26f', grad: 'linear' },
    { id: 'blush', name: 'Hồng đào', c1: '#b0174e', c2: '#d6336c', ce: '#a61e4d', qbg: '#fff5f8', cardBg: '#ffe3ec', border: '#f4a7bf', grad: 'linear' },
    { id: 'champagne', name: 'Champagne', c1: '#7a4f17', c2: '#9c6a26', ce: '#5f3a0e', qbg: '#fffbf2', cardBg: '#f4e6cc', border: '#d9b26f', grad: 'linear' },
    { id: 'lilac', name: 'Tím mộng mơ', c1: '#5f3dc4', c2: '#c2255c', ce: '#4c2fa0', qbg: '#fbf8ff', cardBg: '#ece3ff', border: '#c3b1ff', grad: 'linear' },
    { id: 'sunset', name: 'Hoàng hôn', c1: '#b0174e', c2: '#d9480f', ce: '#a61e4d', qbg: '#fff9f2', cardBg: '#ffe6d5', border: '#ffb27a', grad: 'radial' },
    { id: 'classic', name: 'Đen cổ điển', c1: '#1c1b1f', c2: '#1c1b1f', ce: '#1c1b1f', qbg: '#ffffff', cardBg: '#ffffff', border: '#1c1b1f', grad: 'none' }
  ];
  const QR_KEY = 'mq_qr_style';
  const qrState = Object.assign({ frame: 'heart', dot: 'rounded', eye: 'rounded', icon: 'heart', palette: 'wine' }, QR_PALETTES[0]);
  try { Object.assign(qrState, JSON.parse(localStorage.getItem(QR_KEY) || '{}')); } catch (e) { /* ignore */ }
  delete qrState.id; delete qrState.name;
  const saveQR = () => { try { const { ...st } = qrState; localStorage.setItem(QR_KEY, JSON.stringify(st)); } catch (e) { /* ignore */ } };

  // palette swatches
  const palWrap = $('#qrPalettes');
  QR_PALETTES.forEach((p) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'swatch'; b.dataset.pal = p.id;
    b.innerHTML = `<span class="swatch-dots" aria-hidden="true"><i style="background:${p.cardBg}"></i><i style="background:${p.qbg}"></i><b style="background:${p.c1}"></b></span><span></span>`;
    b.lastChild.textContent = p.name;
    b.addEventListener('click', () => {
      const { id, name, ...colors } = p;
      Object.assign(qrState, colors, { palette: id });
      syncQRControls(); saveQR(); renderQR();
    });
    palWrap.appendChild(b);
  });

  // style chips (with drawn previews for frame / dot / eye)
  document.querySelectorAll('#share .chips').forEach((group) => {
    const key = group.dataset.key;
    group.querySelectorAll('button').forEach((b) => {
      if (['frame', 'dot', 'eye'].includes(key) && window.QRStudio) {
        const cv = document.createElement('canvas');
        cv.setAttribute('aria-hidden', 'true');
        window.QRStudio.sample(cv, key, b.dataset.v, '#f4dfb6');
        b.prepend(cv);
      }
      b.addEventListener('click', () => { qrState[key] = b.dataset.v; syncQRControls(); saveQR(); renderQR(); });
    });
  });

  // custom colours
  document.querySelectorAll('#qrCustom input[type="color"]').forEach((inp) => {
    inp.addEventListener('input', () => { qrState[inp.dataset.c] = inp.value; qrState.palette = 'custom'; syncQRControls(); saveQR(); renderQR(); });
  });
  qrCap1.addEventListener('input', () => { qrCap1Touched = true; renderQR(); });
  qrCap2.addEventListener('input', renderQR);

  function syncQRControls() {
    document.querySelectorAll('#share .chips').forEach((group) => {
      const v = qrState[group.dataset.key];
      group.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.v === v)));
    });
    palWrap.querySelectorAll('.swatch').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.pal === qrState.palette)));
    document.querySelectorAll('#qrCustom input[type="color"]').forEach((inp) => { inp.value = qrState[inp.dataset.c]; });
  }
  syncQRControls();

  async function ensureQRLibs() {
    if (!qrLibs) {
      qrLibs = (async () => {
        if (typeof window.qrcode !== 'function') await loadScript('vendor/qrcode.js');
        const fontsReady = document.fonts ? Promise.all([
          document.fonts.load('100px "Great Vibes"'), document.fonts.load('700 40px "Playfair Display"'), document.fonts.load('600 30px Inter')
        ]).catch(() => {}) : Promise.resolve();
        await Promise.race([fontsReady, wait(2500)]);
      })();
      qrLibs.catch(() => { qrLibs = null; });
    }
    return qrLibs;
  }

  function renderQR() {
    clearTimeout(qrTimer);
    qrTimer = setTimeout(async () => {
      if (!qrUrl) return;
      const my = ++qrRun;
      try { await ensureQRLibs(); } catch (e) { qrLoading.textContent = 'Không tải được công cụ vẽ mã. Hãy tải lại trang.'; return; }
      if (my !== qrRun) return;
      let info;
      try {
        info = window.QRStudio.render(qrCanvas, qrUrl, Object.assign({}, qrState, {
          caption1: qrCap1.value.trim(), caption2: qrCap2.value.trim()
        }));
      } catch (e) {
        qrCheck.className = 'qr-check warn';
        qrCheck.textContent = e.message === 'toolong' ? 'Lời chúc quá dài để đưa vào mã QR. Hãy rút ngắn lời chúc.' : 'Chưa vẽ được mã QR. Hãy thử lại.';
        return;
      }
      qrLoading.classList.add('done');
      qrCheck.className = 'qr-check';
      qrCheck.textContent = 'Đang quét thử mã…';
      clearTimeout(qrScanTimer);
      qrScanTimer = setTimeout(() => scanQR(my, info), 120);
    }, 70);
  }

  async function scanQR(my, info) {
    try { if (typeof window.jsQR !== 'function') await loadScript('vendor/jsQR.js'); } catch (e) { qrCheck.textContent = ''; return; }
    if (my !== qrRun) return;
    const tryAt = (w) => {
      const t = document.createElement('canvas');
      t.width = w; t.height = Math.round(qrCanvas.height * (w / qrCanvas.width));
      const g = t.getContext('2d', { willReadFrequently: true });
      g.drawImage(qrCanvas, 0, 0, t.width, t.height);
      const img = g.getImageData(0, 0, t.width, t.height);
      const r = window.jsQR(img.data, t.width, t.height, { inversionAttempts: 'dontInvert' });
      return !!(r && r.data === qrUrl);
    };
    let ok = false;
    try { ok = tryAt(720) || tryAt(1080); } catch (e) { ok = false; }
    if (my !== qrRun) return;
    if (ok && !info.lowContrast) {
      qrCheck.className = 'qr-check ok';
      qrCheck.textContent = '✓ Đã quét thử: mã đọc tốt';
    } else if (ok) {
      qrCheck.className = 'qr-check warn';
      qrCheck.textContent = '⚠ Quét được, nhưng màu chấm hơi nhạt so với nền. Chọn màu đậm hơn để chắc chắn.';
    } else {
      qrCheck.className = 'qr-check warn';
      qrCheck.textContent = '⚠ Kiểu này khó quét. Hãy thử kiểu chấm “Bo liền” hoặc “Vuông”, hoặc màu đậm hơn.';
    }
  }

  function qrFileName() {
    const name = (lastGift ? lastGift.to : 'qua').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
    return `qr-qua-20-10-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'qua'}.png`;
  }
  const qrBlob = () => new Promise((res, rej) => qrCanvas.toBlob((b) => (b ? res(b) : rej(new Error('blob'))), 'image/png'));
  const setQRStatus = (t) => { qrStatusEl.textContent = t; };

  $('#qrDownload').addEventListener('click', async () => {
    if (!qrUrl) return;
    let blob;
    try { blob = await qrBlob(); } catch (e) { setQRStatus('Chưa tạo được ảnh. Hãy thử lại.'); return; }
    const filename = qrFileName();
    if (inClaude) {
      let dl = null;
      try { dl = await window.claude.use('downloads'); } catch (e) { dl = null; }
      if (dl) {
        try { await dl.save({ filename, data: blob }); setQRStatus('Đã lưu ảnh QR.'); }
        catch (e) {
          if (e && e.code === 'declined') setQRStatus('');
          else if (e && e.code === 'rate_limited') setQRStatus('Đang có một hộp thoại lưu file. Hãy hoàn tất nó trước.');
          else setQRStatus('Không lưu được ảnh ở đây. Hãy dùng “Sao chép ảnh”, hoặc nhấn giữ vào mã để lưu.');
        }
        return;
      }
    }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    setQRStatus('Đã tải ảnh QR xuống máy.');
  });

  $('#qrCopy').addEventListener('click', () => {
    if (!qrUrl) return;
    const fail = () => setQRStatus('Trình duyệt chưa cho sao chép ảnh. Hãy dùng nút “Tải ảnh QR”.');
    try {
      if (!navigator.clipboard || !window.ClipboardItem) { fail(); return; }
      navigator.clipboard.write([new ClipboardItem({ 'image/png': qrBlob() })])
        .then(() => setQRStatus('Đã sao chép ảnh. Dán vào tin nhắn để gửi đi.'), fail);
    } catch (e) { fail(); }
  });

  // Preview runs the full recipient experience, starting from the gift box
  $('#previewBtn').addEventListener('click', async () => {
    if (!lastGift) return;
    activeGift = lastGift;
    Music.setTrack(lastGift.music);
    resetIntro(lastGift);
    prepareGate();
    FX.setLevel('calm');
    exitPreview.hidden = false;
    await goTo('#gate');
    runGate(lastGift);
  });
  async function leavePreview() {
    run++; clearTimers(); gateRun++;
    FX.fireworks(false);
    exitPreview.hidden = true;
    Music.stop();
    Music.setTrack({ k: 'box' });
    await goTo('#share');
    FX.setLevel('calm');
  }
  exitPreview.addEventListener('click', leavePreview);

  $('#editBtn').addEventListener('click', () => goTo('#compose'));
  $('#newBtn').addEventListener('click', async () => {
    resetForm();
    qrCap1Touched = false;
    lastGift = null;
    await goTo('#compose');
    if (finePointer) recipient.focus({ preventScroll: true });
  });

  /* ---------------------------------------------------------
     3. GREETING CARD
     --------------------------------------------------------- */
  const stage = $('#cardStage');
  const tilt = $('#cardTilt');
  const cover = $('#cover');
  const seal = $('#seal');
  const bloom = $('#bloom');
  const tapHint = $('#tapHint');
  const gHead = $('#gHead'), gTo = $('#gTo'), gMsg = $('#gMsg'), gSign = $('#gSign');
  const toName = $('#toName'), fromName = $('#fromName'), coverName = $('#coverName');
  const msgText = $('#msgText'), msgGhost = $('#msgGhost'), caret = $('#caret');
  const outro = $('#outro');
  const replayBtn = $('#replayBtn');
  const backShareBtn = $('#backShareBtn');

  let timers = [];
  let run = 0;
  let typing = null;
  let coverOpened = false;
  let current = null;

  const later = (fn, ms) => { timers.push(setTimeout(fn, ms)); };
  function clearTimers() { timers.forEach(clearTimeout); timers = []; typing = null; }

  function prepareCard(d) {
    clearTimers();
    current = d;
    coverOpened = false;
    toName.textContent = d.to;
    coverName.textContent = d.to;
    fromName.textContent = d.from;
    msgGhost.textContent = d.msg;
    msgText.textContent = '';
    caret.classList.remove('done');
    [gHead, gTo, gMsg, gSign].forEach((el) => el.classList.remove('show'));
    outro.classList.remove('show');
    tapHint.classList.remove('show');
    cover.classList.remove('open');
    seal.classList.remove('glow', 'broken');
    bloom.classList.remove('play');
    stage.classList.remove('in', 'done');
    FX.fireworks(false);
    tilt.style.setProperty('--rx', '0deg');
    tilt.style.setProperty('--ry', '0deg');
    const sender = MODE === 'sender';
    backShareBtn.hidden = !sender;
    replayBtn.hidden = sender;
    $('#outroAsk').textContent = sender ? 'Đây là những gì người nhận sẽ thấy.' : 'Cảm ơn vì đã luôn là chính mình.';
  }

  function centerOf(el) {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }

  // keep the line being typed on screen (mostly matters on phones)
  const cardScreen = $('#card');
  function keepInView(el, margin = 90) {
    const r = el.getBoundingClientRect();
    const limit = window.innerHeight - margin;
    if (r.bottom > limit) cardScreen.scrollBy({ top: r.bottom - limit + 40, behavior: reduceMotion ? 'auto' : 'smooth' });
  }

  function typeMessage(text, myRun) {
    const chars = Array.from(text);
    let i = 0;
    const base = chars.length > 320 ? 14 : chars.length > 180 ? 20 : 28;
    gMsg.classList.add('show');
    tapHint.classList.add('show');

    const finish = () => {
      if (myRun !== run || !typing) return;
      typing = null;
      msgText.textContent = text;
      caret.classList.add('done');
      tapHint.classList.remove('show');
      afterMessage(myRun);
    };
    typing = { finish };

    const step = () => {
      if (myRun !== run || !typing) return;
      i++;
      const ch0 = chars[i - 1];
      if (reduceMotion || ch0 === ' ' || ch0 === '\n') msgText.appendChild(document.createTextNode(ch0));
      else { const sp = document.createElement('span'); sp.className = 'ink'; sp.textContent = ch0; msgText.appendChild(sp); }
      if (i % 14 === 0) keepInView(caret);
      if (i >= chars.length) { finish(); return; }
      const ch = chars[i - 1];
      let delay = base;
      if ('.!?…'.includes(ch)) delay += 320;
      else if (',;:'.includes(ch)) delay += 140;
      else if (ch === '\n') delay += 220;
      later(step, delay);
    };
    later(step, 200);
  }

  function afterMessage(myRun) {
    later(() => { if (myRun === run) { gSign.classList.add('show'); keepInView(gSign, 40); } }, 450);
    later(() => {
      if (myRun !== run) return;
      const p = centerOf(gSign);
      FX.burst(p.x, p.y, { hearts: isMobile ? 10 : 16, sparks: isMobile ? 20 : 36, dust: isMobile ? 30 : 60, spread: 6 });
      stage.classList.add('done');
      Music.chime('soft');
      FX.fireworks(true);
    }, 950);
    later(() => { if (myRun === run) outro.classList.add('show'); }, 1600);
  }

  function breakSeal() {
    seal.classList.add('broken');
    Music.chime('seal');
    const p = centerOf(seal);
    FX.burst(p.x, p.y, { sparks: isMobile ? 18 : 30, dust: isMobile ? 40 : 70, spread: 6 });
  }
  function openCover() {
    coverOpened = true;
    cover.classList.add('open');
    bloom.classList.add('play');
    const c = centerOf(tilt);
    FX.burst(c.x, c.y, { sparks: isMobile ? 30 : 56, dust: isMobile ? 40 : 90, spread: 10 });
  }

  function runCardSequence(d) {
    const myRun = ++run;
    FX.setLevel('card');
    stage.classList.add('in');

    if (reduceMotion) {
      seal.classList.add('broken');
      cover.classList.add('open'); coverOpened = true;
      [gHead, gTo, gMsg, gSign].forEach((el) => el.classList.add('show'));
      msgText.textContent = d.msg;
      caret.classList.add('done');
      outro.classList.add('show');
      stage.classList.add('done');
      return;
    }

    later(() => seal.classList.add('glow'), 1000);
    later(breakSeal, 2000);
    later(openCover, 2250);
    later(() => gHead.classList.add('show'), 3350);
    later(() => gTo.classList.add('show'), 3950);
    later(() => typeMessage(d.msg, myRun), 4700);
  }

  // Tap the card: skip ahead (open the cover, or finish typing)
  tilt.addEventListener('click', () => {
    if (typing) { typing.finish(); return; }
    if (!coverOpened && current && stage.classList.contains('in')) {
      clearTimers();
      const myRun = ++run;
      breakSeal();
      openCover();
      later(() => gHead.classList.add('show'), 500);
      later(() => gTo.classList.add('show'), 900);
      later(() => typeMessage(current.msg, myRun), 1400);
    }
  });

  async function showCard(d, opts = {}) {
    prepareCard(d);
    if (opts.iris) await irisTo('#card', opts.iris.x, opts.iris.y);
    else await goTo('#card');
    FX.sendBack();
    runCardSequence(d);
  }

  if (finePointer && !reduceMotion) {
    let raf = 0;
    tilt.addEventListener('pointermove', (e) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const r = tilt.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        tilt.classList.add('tracking');
        tilt.style.setProperty('--ry', `${(px - 0.5) * 12}deg`);
        tilt.style.setProperty('--rx', `${(0.5 - py) * 9}deg`);
        tilt.style.setProperty('--mx', `${px * 100}%`);
        tilt.style.setProperty('--my', `${py * 100}%`);
      });
    });
    tilt.addEventListener('pointerleave', () => {
      tilt.classList.remove('tracking');
      tilt.style.setProperty('--rx', '0deg');
      tilt.style.setProperty('--ry', '0deg');
      tilt.style.setProperty('--mx', '50%');
      tilt.style.setProperty('--my', '0%');
    });
  }

  replayBtn.addEventListener('click', () => {
    if (!current) return;
    prepareCard(current);
    $('#card').scrollTo({ top: 0, behavior: 'auto' });
    void stage.offsetWidth;
    runCardSequence(current);
  });
  backShareBtn.addEventListener('click', leavePreview);

  /* ---------------------------------------------------------
     START
     --------------------------------------------------------- */
  async function boot() {
    const hash = decodeURIComponent(location.hash.slice(1));
    if (hash.startsWith('g.')) {
      MODE = 'guest';
      document.body.classList.add('mode-guest');
      try {
        guestGift = await decodeGift(hash);
        activeGift = guestGift;
        Music.setTrack(guestGift.music);
        // try to play straight away; otherwise the first touch anywhere starts it
        Music.autoplay((state) => {
          document.body.classList.toggle('sound-blocked', state === 'blocked');
        });
        resetIntro(guestGift);
        document.title = `Món quà 20/10 cho ${guestGift.to}`;
        FX.setLevel('calm');
        prepareGate();
        showNow('#gate');
        runGate(guestGift);
      } catch (e) {
        FX.setLevel('calm');
        showNow('#broken');
      }
      return;
    }

    MODE = 'sender';
    document.body.classList.add('mode-sender');
    FX.setLevel('calm');
    showNow(loggedIn ? '#compose' : '#login');
    if (loggedIn) loadMusicCaps();
  }

  // Opening a gift link in the same tab switches to the recipient view
  window.addEventListener('hashchange', () => {
    if (location.hash.slice(1).startsWith('g.') || MODE === 'guest') location.reload();
  });

  updateCount();
  boot();
})();
