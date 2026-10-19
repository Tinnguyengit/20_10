/* =========================================================
   Món Quà 20/10 — qr-studio.js
   Draws a styled QR card on a canvas: frame (square, rounded,
   circle, heart), module style, finder ("eye") style, colours,
   centre icon and caption. Needs vendor/qrcode.js (global `qrcode`).
   Exposes window.QRStudio.render(canvas, text, options).
   ========================================================= */
(() => {
  'use strict';

  const W = 1080, H = 1320;          // exported card size (px)
  const ART = 940, ART_Y = 64;       // square area that holds the framed code

  /* ---------- small geometry helpers ---------- */
  function roundRectPath(p, x, y, w, h, r) {
    const [tl, tr, br, bl] = Array.isArray(r) ? r : [r, r, r, r];
    p.moveTo(x + tl, y);
    p.lineTo(x + w - tr, y); if (tr) p.arcTo(x + w, y, x + w, y + tr, tr); else p.lineTo(x + w, y);
    p.lineTo(x + w, y + h - br); if (br) p.arcTo(x + w, y + h, x + w - br, y + h, br); else p.lineTo(x + w, y + h);
    p.lineTo(x + bl, y + h); if (bl) p.arcTo(x, y + h, x, y + h - bl, bl); else p.lineTo(x, y + h);
    p.lineTo(x, y + tl); if (tl) p.arcTo(x, y, x + tl, y, tl); else p.lineTo(x, y);
    p.closePath();
  }
  // a plump heart filling a box of size s centred at (cx, cy)
  function heartPath(p, cx, cy, s) {
    const top = cy - s * 0.28;
    p.moveTo(cx, cy + s * 0.46);
    p.bezierCurveTo(cx - s * 0.08, cy + s * 0.36, cx - s * 0.52, cy + s * 0.08, cx - s * 0.52, top + s * 0.02);
    p.bezierCurveTo(cx - s * 0.52, cy - s * 0.52, cx - s * 0.06, cy - s * 0.56, cx, top + s * 0.02);
    p.bezierCurveTo(cx + s * 0.06, cy - s * 0.56, cx + s * 0.52, cy - s * 0.52, cx + s * 0.52, top + s * 0.02);
    p.bezierCurveTo(cx + s * 0.52, cy + s * 0.08, cx + s * 0.08, cy + s * 0.36, cx, cy + s * 0.46);
    p.closePath();
  }
  // classic parametric heart outline, scaled into a w×w box at (x, y)
  function bigHeartPoints(x, y, w) {
    const pts = [];
    const k = w / 34, cx = x + w / 2, cy = y + w * 0.47;
    for (let i = 0; i < 240; i++) {
      const t = (i / 240) * Math.PI * 2;
      const px = 16 * Math.pow(Math.sin(t), 3);
      const py = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
      pts.push([cx + px * k, cy - py * k]);
    }
    return pts;
  }
  // a full, rounded heart for the frame: wide shoulders and a soft point leave room for the code
  function frameHeart(p, x, y, w) {
    const cx = x + w / 2;
    p.moveTo(cx, y + w * 0.97);
    p.bezierCurveTo(cx - w * 0.16, y + w * 0.84, x - w * 0.005, y + w * 0.62, x, y + w * 0.36);
    p.bezierCurveTo(x, y + w * 0.08, cx - w * 0.07, y - w * 0.02, cx, y + w * 0.17);
    p.bezierCurveTo(cx + w * 0.07, y - w * 0.02, x + w, y + w * 0.08, x + w, y + w * 0.36);
    p.bezierCurveTo(x + w + w * 0.005, y + w * 0.62, cx + w * 0.16, y + w * 0.84, cx, y + w * 0.97);
    p.closePath();
  }
  const probeCtx = document.createElement('canvas').getContext('2d');
  function inPoly(pts, x, y) {
    if (pts instanceof Path2D) return probeCtx.isPointInPath(pts, x, y);
    let inside = false;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const [xi, yi] = pts[i], [xj, yj] = pts[j];
      if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  }
  // largest square (centred horizontally) that fits inside the polygon
  function fitSquare(pts, cx, yMin, yMax) {
    let best = { s: 0, cy: (yMin + yMax) / 2 };
    const fits = (s, cy) => {
      const h = s / 2, n = 24;
      for (let i = 0; i <= n; i++) {
        const u = -h + (s * i) / n;
        if (!inPoly(pts, cx + u, cy - h) || !inPoly(pts, cx + u, cy + h) || !inPoly(pts, cx - h, cy + u) || !inPoly(pts, cx + h, cy + u)) return false;
      }
      return true;
    };
    for (let cy = yMin; cy <= yMax; cy += 4) {
      let lo = best.s, hi = 2000;
      if (!fits(lo + 1, cy)) continue;
      while (hi - lo > 1) { const mid = (lo + hi) / 2; if (fits(mid, cy)) lo = mid; else hi = mid; }
      if (lo > best.s) best = { s: lo, cy };
    }
    return best;
  }
  // deterministic pseudo-random per cell so decorations don't flicker between renders
  function hash(i, j) { let h = (i * 374761393 + j * 668265263) ^ 0x5bd1e995; h = (h ^ (h >>> 13)) * 1274126177; return ((h ^ (h >>> 16)) >>> 0) / 4294967295; }

  function luminance(hex) {
    const v = hex.replace('#', '');
    const c = [0, 2, 4].map((i) => parseInt(v.substr(i, 2), 16) / 255).map((x) => (x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4)));
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  }
  function contrast(a, b) { const la = luminance(a), lb = luminance(b); return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05); }

  /* ---------- module shapes ---------- */
  function addModule(p, style, x, y, m, nb) {
    const cx = x + m / 2, cy = y + m / 2;
    switch (style) {
      case 'dots': p.moveTo(cx + m * 0.46, cy); p.arc(cx, cy, m * 0.46, 0, Math.PI * 2); break;
      case 'diamond':
        p.moveTo(cx, y - m * 0.16); p.lineTo(x + m * 1.16, cy); p.lineTo(cx, y + m * 1.16); p.lineTo(x - m * 0.16, cy); p.closePath(); break;
      case 'heart': heartPath(p, cx, cy + m * 0.03, m * 1.12); break;
      case 'rounded': {
        const r = m / 2, o = 0.35;
        const tl = !nb.t && !nb.l ? r : 0, tr = !nb.t && !nb.r ? r : 0, br = !nb.b && !nb.r ? r : 0, bl = !nb.b && !nb.l ? r : 0;
        roundRectPath(p, x - o, y - o, m + o * 2, m + o * 2, [tl, tr, br, bl]);
        break;
      }
      default: p.rect(x - 0.35, y - 0.35, m + 0.7, m + 0.7);
    }
  }

  /* ---------- finder patterns ---------- */
  function addEye(ring, dot, style, x, y, m, flipX, flipY) {
    const s7 = 7 * m, cx = x + s7 / 2, cy = y + s7 / 2;
    switch (style) {
      case 'circle':
        ring.moveTo(cx + 3.5 * m, cy); ring.arc(cx, cy, 3.5 * m, 0, Math.PI * 2);
        ring.moveTo(cx + 2.5 * m, cy); ring.arc(cx, cy, 2.5 * m, 0, Math.PI * 2);
        dot.moveTo(cx + 1.5 * m, cy); dot.arc(cx, cy, 1.5 * m, 0, Math.PI * 2);
        break;
      case 'rounded':
        // gentle corners: still read as squares by strict scanners
        roundRectPath(ring, x, y, s7, s7, 1.2 * m);
        roundRectPath(ring, x + m, y + m, 5 * m, 5 * m, 0.7 * m);
        roundRectPath(dot, x + 2 * m, y + 2 * m, 3 * m, 3 * m, 0.5 * m);
        break;
      case 'leaf': {
        // pointed corner faces the middle of the code
        const big = 3.2 * m, mid = 2.2 * m, small = 1.3 * m;
        const radii = (r) => {
          const a = [r, r, r, r];
          const point = flipX ? (flipY ? 0 : 3) : (flipY ? 1 : 2); // index of the corner pointing inward
          a[point] = r * 0.12;
          return a;
        };
        roundRectPath(ring, x, y, s7, s7, radii(big));
        roundRectPath(ring, x + m, y + m, 5 * m, 5 * m, radii(mid));
        roundRectPath(dot, x + 2 * m, y + 2 * m, 3 * m, 3 * m, radii(small));
        break;
      }
      case 'heart':
        // rounded ring keeps the 1:1:3:1:1 finder ratio; the heart sits in the core
        roundRectPath(ring, x, y, s7, s7, 2.3 * m);
        roundRectPath(ring, x + m, y + m, 5 * m, 5 * m, 1.5 * m);
        heartPath(dot, cx, cy + 0.12 * m, 3.9 * m);
        break;
      default:
        ring.rect(x, y, s7, s7);
        ring.rect(x + m, y + m, 5 * m, 5 * m);
        dot.rect(x + 2 * m, y + 2 * m, 3 * m, 3 * m);
    }
  }

  /* ---------- centre icon: a small rose drawn with canvas paths ---------- */
  function drawRose(g, cx, cy, size) {
    const k = size / 120;
    g.save();
    g.translate(cx - 60 * k, cy - 60 * k);
    g.scale(k, k);
    g.translate(60, 58);
    const rg = (c0, c1, fx, fy, r) => { const gr = g.createRadialGradient(fx, fy, 0, fx, fy, r); gr.addColorStop(0, c0); gr.addColorStop(1, c1); return gr; };
    const leaf = g.createLinearGradient(0, 20, 50, 60); leaf.addColorStop(0, '#f6e4bd'); leaf.addColorStop(1, '#b98a45');
    g.fillStyle = leaf;
    g.fill(new Path2D('M6 26 C 30 26 48 38 54 56 C 34 56 16 46 6 26 Z'));
    g.globalAlpha = 0.85; g.fill(new Path2D('M-6 26 C -30 26 -48 38 -54 56 C -34 56 -16 46 -6 26 Z')); g.globalAlpha = 1;
    const outer = rg('#ffe4ec', '#e9819e', 0, 10, 46);
    for (let i = 0; i < 5; i++) { g.save(); g.rotate((i * 72 * Math.PI) / 180); g.beginPath(); g.ellipse(0, -19, 22, 26, 0, 0, Math.PI * 2); g.fillStyle = outer; g.fill(); g.restore(); }
    const midG = rg('#f9adc1', '#cf4772', 0, 6, 28);
    [36, 126, 216, 306].forEach((d) => { g.save(); g.rotate((d * Math.PI) / 180); g.beginPath(); g.ellipse(0, -10, 15, 17, 0, 0, Math.PI * 2); g.fillStyle = midG; g.fill(); g.restore(); });
    g.beginPath(); g.arc(0, 0, 12, 0, Math.PI * 2); g.fillStyle = rg('#e5678a', '#94193f', -2, -3, 14); g.fill();
    g.strokeStyle = 'rgba(126,22,54,.5)'; g.lineWidth = 1.6; g.lineCap = 'round';
    g.stroke(new Path2D('M-3 1 a3 3 0 1 1 6 0 a6 6 0 1 1 -12 0 a9 9 0 1 1 18 0'));
    g.restore();
  }

  /* ---------- main render ---------- */
  function render(canvas, text, o) {
    if (typeof window.qrcode !== 'function') throw new Error('qrlib');
    const fancy = o.dot === 'heart' || o.dot === 'diamond' || o.dot === 'dots' || o.eye === 'heart';
    // the centre plate covers ~4% of the code, well inside what level Q repairs (25%)
    const levels = (o.icon !== 'none' || fancy) ? ['Q', 'M', 'L'] : ['M', 'L'];
    let qr = null, level = null;
    for (const lv of levels) {
      try { const q = window.qrcode(0, lv); q.addData(text, 'Byte'); q.make(); qr = q; level = lv; break; } catch (e) { /* too long for this level */ }
    }
    if (!qr) throw new Error('toolong');
    const n = qr.getModuleCount();

    canvas.width = W; canvas.height = H;
    const g = canvas.getContext('2d');
    g.clearRect(0, 0, W, H);

    /* card */
    g.fillStyle = o.cardBg;
    g.fillRect(0, 0, W, H);
    const cardDark = luminance(o.cardBg) < 0.25;
    // soft glow + inner hairline
    const glow = g.createRadialGradient(W / 2, ART_Y + ART / 2, 40, W / 2, ART_Y + ART / 2, ART * 0.75);
    glow.addColorStop(0, cardDark ? 'rgba(255,190,210,.18)' : 'rgba(255,255,255,.55)');
    glow.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = glow; g.fillRect(0, 0, W, H);
    g.save();
    g.strokeStyle = o.border; g.globalAlpha = 0.55; g.lineWidth = 2;
    const hair = new Path2D(); roundRectPath(hair, 26, 26, W - 52, H - 52, 44); g.stroke(hair);
    g.restore();

    /* frame geometry */
    const x0 = (W - ART) / 2, y0 = ART_Y;
    const shape = new Path2D();
    let qrSide, qrX, qrY, poly = null, decorate = false;
    const quiet = 3; // modules of clear space kept around the code inside decorated frames
    if (o.frame === 'circle') {
      shape.arc(W / 2, y0 + ART / 2, ART / 2, 0, Math.PI * 2);
      qrSide = ART * 0.6;
      qrX = W / 2 - qrSide / 2; qrY = y0 + ART / 2 - qrSide / 2;
      decorate = true;
      const R = ART / 2 - 10, ccx = W / 2, ccy = y0 + ART / 2;
      poly = { test: (x, y) => (x - ccx) * (x - ccx) + (y - ccy) * (y - ccy) <= R * R };
    } else if (o.frame === 'heart') {
      frameHeart(shape, x0, y0, ART);
      const best = fitSquare(shape, W / 2, y0 + ART * 0.3, y0 + ART * 0.6);
      const inner = best.s * (n / (n + quiet * 2 + 1));
      qrSide = Math.min(inner, ART * 0.6);
      qrX = W / 2 - qrSide / 2; qrY = best.cy - qrSide / 2;
      decorate = true;
      const shrink = new Path2D(); frameHeart(shrink, x0 + ART * 0.03, y0 + ART * 0.035, ART * 0.94);
      poly = { test: (x, y) => probeCtx.isPointInPath(shrink, x, y) };
    } else {
      const r = o.frame === 'rounded' ? 90 : 18;
      roundRectPath(shape, x0, y0, ART, ART, r);
      const pad = o.frame === 'rounded' ? 4.5 : 4;
      const m0 = ART / (n + pad * 2);
      qrSide = m0 * n; qrX = x0 + pad * m0; qrY = y0 + pad * m0;
    }
    const m = qrSide / n;

    // frame fill, shadow and border
    g.save();
    g.shadowColor = cardDark ? 'rgba(0,0,0,.45)' : 'rgba(120,30,60,.22)';
    g.shadowBlur = 40; g.shadowOffsetY = 14;
    g.fillStyle = o.qbg; g.fill(shape);
    g.restore();
    g.save(); g.lineWidth = 7; g.strokeStyle = o.border; g.stroke(shape); g.restore();

    /* paint for modules */
    let paint = o.c1;
    if (o.grad === 'linear') {
      const lg = g.createLinearGradient(qrX, qrY, qrX + qrSide, qrY + qrSide);
      lg.addColorStop(0, o.c1); lg.addColorStop(1, o.c2); paint = lg;
    } else if (o.grad === 'radial') {
      const rgd = g.createRadialGradient(qrX + qrSide / 2, qrY + qrSide / 2, qrSide * 0.05, qrX + qrSide / 2, qrY + qrSide / 2, qrSide * 0.75);
      rgd.addColorStop(0, o.c2); rgd.addColorStop(1, o.c1); paint = rgd;
    }

    const inEye = (r, c) => (r < 7 && c < 7) || (r < 7 && c >= n - 7) || (r >= n - 7 && c < 7);
    // centre plate
    let plate = 0;
    if (o.icon !== 'none') { plate = Math.round(n * 0.2); if (plate % 2 === 0) plate++; plate = Math.max(plate, 5); }
    const pStart = Math.floor((n - plate) / 2), pEnd = pStart + plate;
    const underPlate = (r, c) => plate && r >= pStart - 0.5 && r < pEnd && c >= pStart && c < pEnd;
    const dark = (r, c) => r >= 0 && c >= 0 && r < n && c < n && qr.isDark(r, c) && !inEye(r, c) && !underPlate(r, c);

    /* decorations around the code (circle / heart frames) */
    if (decorate) {
      const deco = new Path2D();
      const ext = Math.ceil(ART / m) + 2;
      for (let r = -ext; r < n + ext; r++) {
        for (let c = -ext; c < n + ext; c++) {
          if (r >= -quiet && r < n + quiet && c >= -quiet && c < n + quiet) continue;
          const x = qrX + c * m, y = qrY + r * m;
          if (!poly.test(x + m / 2, y + m / 2) || !poly.test(x, y) || !poly.test(x + m, y + m) || !poly.test(x + m, y) || !poly.test(x, y + m)) continue;
          if (hash(r + 999, c + 999) > 0.36) continue;
          addModule(deco, o.dot === 'rounded' ? 'dots' : o.dot, x, y, m, {});
        }
      }
      g.save(); g.globalAlpha = 0.3; g.fillStyle = paint; g.fill(deco); g.restore();
    }

    /* data modules */
    const mods = new Path2D();
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (!dark(r, c)) continue;
        const nb = o.dot === 'rounded' ? { t: dark(r - 1, c), b: dark(r + 1, c), l: dark(r, c - 1), r: dark(r, c + 1) } : null;
        addModule(mods, o.dot, qrX + c * m, qrY + r * m, m, nb);
      }
    }
    g.fillStyle = paint; g.fill(mods);

    /* eyes */
    const ring = new Path2D(), dotP = new Path2D();
    addEye(ring, dotP, o.eye, qrX, qrY, m, false, false);
    addEye(ring, dotP, o.eye, qrX + (n - 7) * m, qrY, m, true, false);
    addEye(ring, dotP, o.eye, qrX, qrY + (n - 7) * m, m, false, true);
    g.fillStyle = o.ce; g.fill(ring, 'evenodd'); g.fill(dotP);

    /* centre icon */
    if (plate) {
      const pcx = qrX + (pStart + plate / 2) * m, pcy = qrY + (pStart + plate / 2) * m;
      const ps = plate * m;
      const pl = new Path2D(); roundRectPath(pl, pcx - ps / 2 + m * 0.3, pcy - ps / 2 + m * 0.3, ps - m * 0.6, ps - m * 0.6, ps * 0.28);
      g.fillStyle = o.qbg; g.fill(pl);
      g.save(); g.strokeStyle = o.border; g.lineWidth = Math.max(2, m * 0.35); g.stroke(pl); g.restore();
      if (o.icon === 'heart') {
        const hp = new Path2D(); heartPath(hp, pcx, pcy + ps * 0.03, ps * 0.66);
        g.fillStyle = paint; g.fill(hp);
      } else if (o.icon === 'rose') {
        drawRose(g, pcx, pcy + ps * 0.02, ps * 0.88);
      } else if (o.icon === 'text') {
        g.fillStyle = o.ce; g.textAlign = 'center'; g.textBaseline = 'middle';
        let fs = ps * 0.34;
        g.font = `700 ${fs}px "Playfair Display", Georgia, serif`;
        while (g.measureText('20/10').width > ps * 0.78 && fs > 8) { fs -= 1; g.font = `700 ${fs}px "Playfair Display", Georgia, serif`; }
        g.fillText('20/10', pcx, pcy + fs * 0.04);
      }
    }

    /* caption */
    const capTop = y0 + ART + 70;
    const ink = cardDark ? '#fbe7ee' : o.ce;
    const sub = cardDark ? '#f4dfb6' : o.c1;
    g.textAlign = 'center'; g.textBaseline = 'alphabetic';
    if (o.caption1) {
      let fs = 104;
      g.font = `${fs}px "Great Vibes", "Dancing Script", cursive`;
      while (g.measureText(o.caption1).width > W - 140 && fs > 40) { fs -= 4; g.font = `${fs}px "Great Vibes", "Dancing Script", cursive`; }
      g.fillStyle = ink;
      g.fillText(o.caption1, W / 2, capTop + 62);
    }
    if (o.caption2) {
      g.font = '600 30px Inter, "Segoe UI", sans-serif';
      if ('letterSpacing' in g) g.letterSpacing = '6px';
      g.fillStyle = sub; g.globalAlpha = 0.9;
      g.fillText(o.caption2.toUpperCase(), W / 2, capTop + 138);
      g.globalAlpha = 1;
      if ('letterSpacing' in g) g.letterSpacing = '0px';
    }

    const worst = Math.min(contrast(o.qbg, o.c1), o.grad === 'none' ? 99 : contrast(o.qbg, o.c2), contrast(o.qbg, o.ce));
    return { modules: n, level, lowContrast: worst < 3.2 };
  }

  // tiny previews for the style buttons
  function sample(canvas, type, value, color) {
    const S = 56;
    canvas.width = S; canvas.height = S;
    const g = canvas.getContext('2d');
    g.clearRect(0, 0, S, S);
    g.fillStyle = color; g.strokeStyle = color;
    if (type === 'frame') {
      const p = new Path2D();
      if (value === 'heart') frameHeart(p, 5, 7, 46);
      else if (value === 'circle') p.arc(28, 28, 22, 0, Math.PI * 2);
      else roundRectPath(p, 6, 6, 44, 44, value === 'rounded' ? 14 : 3);
      g.globalAlpha = 0.18; g.fill(p); g.globalAlpha = 1; g.lineWidth = 3; g.stroke(p);
    } else if (type === 'dot') {
      const pat = [[1, 1, 0], [0, 1, 1], [1, 0, 1]];
      const on = (r, c) => r >= 0 && c >= 0 && r < 3 && c < 3 && pat[r][c] === 1;
      const m = 14, p = new Path2D();
      for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
        if (!on(r, c)) continue;
        addModule(p, value, 7 + c * m, 7 + r * m, m, { t: on(r - 1, c), b: on(r + 1, c), l: on(r, c - 1), r: on(r, c + 1) });
      }
      g.fill(p);
    } else if (type === 'eye') {
      const ring = new Path2D(), dot = new Path2D();
      addEye(ring, dot, value, 5.5, 5.5, 6.4, false, false);
      g.fill(ring, 'evenodd'); g.fill(dot);
    }
  }

  window.QRStudio = { render, sample, contrast, W, H };
})();
