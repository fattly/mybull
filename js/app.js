/**
 * 今日你的牛 — 应用核心逻辑
 * 前端优先 · LocalStorage 存储 · Canvas 生成牛卡
 */

(function () {
  'use strict';

  /* ========== 工具函数 ========== */

  // 简单字符串哈希（djb2 变体）
  function hash(str) {
    let h = 5381;
    for (let i = 0; i < str.length; i++) {
      h = ((h << 5) + h) + str.charCodeAt(i);
      h = h & 0xffffffff;
    }
    return Math.abs(h);
  }

  // 基于种子的伪随机数 [0, 1)
  function seededRandom(seed) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }

  // 获取/生成设备 ID
  function getDeviceId() {
    let id = localStorage.getItem('niu_device_id');
    if (!id) {
      id = 'd' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
      localStorage.setItem('niu_device_id', id);
    }
    return id;
  }

  // 获取今日日期字符串 yyyyMMdd
  function getTodayKey() {
    const d = new Date();
    return d.getFullYear() + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0');
  }

  // 获取今日日期显示格式
  function getTodayDisplay() {
    const d = new Date();
    return d.getFullYear() + '.' + String(d.getMonth() + 1).padStart(2, '0') + '.' + String(d.getDate()).padStart(2, '0');
  }

  /* ========== 九宫格牛图切片 ========== */

  function createBullImage(bull, size) {
    size = size || 120;
    if (!bull || !bull.image) return '';
    const gridSize = bull.image.gridSize || 3;
    return '<span class="bull-art" role="img" aria-label="' + bull.name +
      '" style="--bull-art-size:' + size + 'px">' +
      '<img src="' + bull.image.src + '" alt="" draggable="false" ' +
      'style="width:' + (gridSize * 100) + '%;height:' + (gridSize * 100) +
      '%;left:-' + (bull.image.col * 100) + '%;top:-' + (bull.image.row * 100) + '%">' +
      '</span>';
  }

  const MYBULL_URL = 'https://mybull.fattly.cn';
  const MYBULL_QR_IMAGE = 'images/mybull-qrcode.png';
  const DAILY_SWAP_LIMIT = 5;
  const imageAssetCache = {};

  function loadImageAsset(src) {
    if (!imageAssetCache[src]) {
      imageAssetCache[src] = new Promise(function (resolve, reject) {
        const image = new Image();
        image.onload = function () { resolve(image); };
        image.onerror = function () { reject(new Error('图片素材加载失败：' + src)); };
        image.src = src;
      });
    }
    return imageAssetCache[src];
  }

  function loadBullImage(bull) {
    return loadImageAsset(bull.image.src);
  }

  // hex 转 rgba（用于标签背景半透明色）
  function hexToRgba(hex, alpha) {
    hex = hex.replace('#', '');
    var r = parseInt(hex.substr(0, 2), 16);
    var g = parseInt(hex.substr(2, 2), 16);
    var b = parseInt(hex.substr(4, 2), 16);
    return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
  }

  // 生成标签 HTML（去掉 # 前缀，注入牛主题色）
  function renderTags(tags, bull, cls) {
    return tags.map(function (t) {
      var text = t.replace(/^#/, '');
      return '<span class="' + cls + '" style="--tag-bg:' + hexToRgba(bull.color, 0.1) + ';--tag-color:' + bull.color + '">' + text + '</span>';
    }).join('');
  }

  /* ========== 每日固定结果算法 ========== */

  // 情境加权：根据当前时间调整牛的权重
  function getContextWeights() {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay(); // 0=周日, 6=周六
    const isWeekend = day === 0 || day === 6;
    const isFriday = day === 5;
    const boosts = {};

    // 工作日上午：打工/开会
    if (!isWeekend && hour >= 9 && hour < 12) {
      boosts.dagong = 2; boosts.kaihui = 1.5; boosts.moyu = 1.3;
    }
    // 工作日下午：摸鱼/加班
    if (!isWeekend && hour >= 14 && hour < 18) {
      boosts.moyu = 1.5; boosts.jiaban = 1.3; boosts.dagong = 1.2;
    }
    // 周五下午：摸鱼/下班心情
    if (isFriday && hour >= 15) {
      boosts.moyu = 2; boosts.kaixin = 1.5; boosts.tangping = 1.3;
    }
    // 深夜：低电量/发疯/失眠
    if (hour >= 0 && hour < 6) {
      boosts.didianliang = 2; boosts.fafeng = 1.8; boosts.jiaban = 1.5;
    }
    // 周末：躺平/开心/吃瓜
    if (isWeekend && hour >= 9 && hour < 22) {
      boosts.tangping = 1.5; boosts.kaixin = 1.4; boosts.chigua = 1.3; boosts.lianai = 1.2;
    }
    // 早高峰
    if (!isWeekend && hour >= 7 && hour < 9) {
      boosts.dagong = 1.8; boosts.didianliang = 1.3;
    }
    return boosts;
  }

  // 根据种子选择牛
  function pickBull(seed, resummonCount) {
    resummonCount = resummonCount || 0;
    const fullSeed = seed + resummonCount * 99991;
    const rand = seededRandom(fullSeed);
    const contextBoosts = getContextWeights();

    // 构建加权池
    const pool = [];
    BULLS.forEach(bull => {
      const rarityWeight = RARITY[bull.rarity].weight;
      let weight = rarityWeight;
      // 情境加权
      if (contextBoosts[bull.id]) {
        weight *= contextBoosts[bull.id];
      }
      // 偷偷换一头时降低已抽到牛的权重
      if (resummonCount > 0) {
        const lastBullId = localStorage.getItem('niu_last_bull_' + getTodayKey());
        if (bull.id === lastBullId) weight *= 0.1;
      }
      const count = Math.max(1, Math.round(weight));
      for (let i = 0; i < count; i++) pool.push(bull);
    });

    const idx = Math.floor(rand * pool.length);
    return pool[idx];
  }

  // 获取今日结果（固定）
  function getTodayBull() {
    const todayKey = getTodayKey();
    const deviceId = getDeviceId();
    const swapCount = parseInt(localStorage.getItem('niu_swap_count_' + todayKey) || '0', 10);

    // 检查是否已有今日结果
    let stored = localStorage.getItem('niu_today_' + todayKey);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        if (data.swapCount === swapCount) return data;
      } catch (e) {}
    }

    // 生成新结果
    const seed = hash(deviceId + todayKey);
    const bull = pickBull(seed, swapCount);
    const copyIdx = seed % bull.variants.length;
    const bullNumber = generateBullNumber(seed);

    const data = {
      bullId: bull.id,
      swapCount: swapCount,
      copyIdx: copyIdx,
      number: bullNumber,
      timestamp: Date.now(),
    };

    localStorage.setItem('niu_today_' + todayKey, JSON.stringify(data));
    localStorage.setItem('niu_last_bull_' + todayKey, bull.id);

    // 记录牛历
    saveToHistory(todayKey, bull.id);

    return data;
  }

  // 牛历记录
  function saveToHistory(dateKey, bullId) {
    let history = [];
    try {
      history = JSON.parse(localStorage.getItem('niu_history') || '[]');
    } catch (e) {}
    // 去重（同一天只记一次）
    history = history.filter(h => h.date !== dateKey);
    history.push({ date: dateKey, bullId: bullId });
    // 只保留最近 30 天
    if (history.length > 30) history = history.slice(-30);
    localStorage.setItem('niu_history', JSON.stringify(history));
  }

  // 根据 ID 查找牛
  function findBull(id) {
    return BULLS.find(b => b.id === id);
  }

  /* ========== 页面切换 ========== */

  function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    window.scrollTo(0, 0);
  }

  /* ========== 首页渲染 ========== */

  function renderHome() {
    // 首页默认展示一头有代表性的暴富牛
    document.getElementById('home-bull').innerHTML = createBullImage(findBull('baofu'), 120);

    // 社会证明数字 — 基于日期生成一个看起来在增长的数
    const base = 128631;
    const dayHash = hash(getTodayKey()) % 2000;
    const count = base + dayHash;
    document.getElementById('proof-count').textContent = count.toLocaleString();

    // 检查是否已有今日牛
    const todayKey = getTodayKey();
    const stored = localStorage.getItem('niu_today_' + todayKey);
    if (stored) {
      // 今天已抽过，直接显示结果
      const btn = document.getElementById('btn-summon');
      btn.textContent = '看看今天的牛';
    }

    // 检查是否好友入口
    checkFriendEntry();
  }

  /* ========== 抽取动画 ========== */

  function startDraw() {
    showScreen('screen-draw');

    const screen = document.getElementById('screen-draw');
    const stage = document.getElementById('summon-stage');
    const hint = document.getElementById('draw-hint');
    const content = document.getElementById('summon-content');
    const particles = document.getElementById('summon-particles');
    const progress = document.getElementById('draw-progress');

    // 重置所有阶段状态和自定义属性
    screen.classList.remove('s--active', 's--sense', 's--roll', 's--reveal');
    screen.style.removeProperty('--reveal-color');
    screen.style.removeProperty('--reveal-glow');
    screen.style.removeProperty('--reveal-glow-strong');
    screen.style.removeProperty('--reveal-color-light');

    // 生成 12 个轨道粒子
    var particleHTML = '';
    for (var i = 0; i < 12; i++) {
      var angle = (360 / 12) * i;
      var delay = (1.8 / 12) * i;
      particleHTML += '<div class="particle" style="--p-angle:' + angle + 'deg;--p-delay:' + delay + 's"></div>';
    }
    particles.innerHTML = particleHTML;

    // 获取最终结果
    var todayData = getTodayBull();
    var finalBull = findBull(todayData.bullId);

    // 初始内容
    content.innerHTML = '<p class="summon-content__text">正在感应今日气场…</p>';
    hint.textContent = '正在召唤你的今日牛…';
    hint.style.opacity = '';

    // 进度点更新
    function updateProgress(activeIdx) {
      var dots = progress.querySelectorAll('.draw__progress-dot');
      dots.forEach(function (dot, i) {
        dot.classList.remove('is-active', 'is-done');
        if (i < activeIdx) dot.classList.add('is-done');
        else if (i === activeIdx) dot.classList.add('is-active');
      });
    }

    // 生成滚动序列（9 个随机 + 1 个最终牛 = 10 次）
    var rollSequence = [];
    for (var j = 0; j < 9; j++) {
      rollSequence.push(BULLS[Math.floor(Math.random() * BULLS.length)]);
    }
    rollSequence.push(finalBull);

    // 提前缓存本次动画可能用到的九宫格，避免快速滚动时闪空。
    rollSequence.forEach(function (bull) {
      loadBullImage(bull).catch(function () {});
    });

    // 减速间隔（从 60ms 递增到 280ms，制造"减速停下"感）
    var intervals = [60, 80, 105, 135, 165, 190, 210, 225, 250, 280];

    // 定时器管理
    var timers = [];
    function schedule(fn, delay) {
      var t = setTimeout(fn, delay);
      timers.push(t);
      return t;
    }
    function clearTimers() {
      timers.forEach(function (t) { clearTimeout(t); });
      timers = [];
    }

    // === 阶段 0：召唤阵出现（0 → 0.6s）===
    requestAnimationFrame(function () {
      screen.classList.add('s--active');
    });

    // === 阶段 1：感应气场（0.6s → 1.6s）===
    schedule(function () {
      screen.classList.add('s--sense');
      updateProgress(1);
      hint.textContent = '正在感应今日气场…';

      schedule(function () {
        hint.textContent = '牛正在赶来…';
      }, 500);
    }, 600);

    // === 阶段 2：能量流滚动（1.6s → ~3.3s）===
    schedule(function () {
      screen.classList.add('s--roll');
      updateProgress(2);
      hint.textContent = '即将出现…';

      var rollIdx = 0;
      function rollStep() {
        if (rollIdx >= rollSequence.length) return;

        var bull = rollSequence[rollIdx];

        // 更新中心内容：牛图标 + 牛名
        content.innerHTML =
          '<div class="summon-content__bull-icon">' + createBullImage(bull, 64) + '</div>' +
          '<span class="summon-content__bull-name">' + bull.name + '</span>';

        // 触发翻转动画
        content.classList.remove('summon-content--flip');
        void content.offsetWidth;
        content.classList.add('summon-content--flip');

        rollIdx++;
        if (rollIdx < rollSequence.length) {
          schedule(rollStep, intervals[rollIdx - 1] || 280);
        }
      }
      rollStep();
    }, 1600);

    // === 阶段 3：光环爆发揭晓（3.4s → 4.3s）===
    schedule(function () {
      clearTimers(); // 清除可能残留的滚动定时器

      screen.classList.add('s--reveal');
      updateProgress(3);
      hint.style.opacity = '0';

      // 设置最终牛的颜色变量，驱动整个召唤阵变色
      screen.style.setProperty('--reveal-color', finalBull.color);
      screen.style.setProperty('--reveal-glow', finalBull.glow + '44');
      screen.style.setProperty('--reveal-glow-strong', finalBull.glow + '99');
      screen.style.setProperty('--reveal-color-light', finalBull.glow + '55');

      // 中心显示最终牛（更大的图标）
      content.innerHTML =
        '<div class="summon-content__bull-icon">' + createBullImage(finalBull, 72) + '</div>' +
        '<span class="summon-content__bull-name">' + finalBull.name + '</span>';

      // clearTimers 已清除之前的安排，这里重新安排进入结果页
      schedule(function () {
        renderResult(finalBull, todayData);
      }, 900); // 3.4s + 0.9s = 4.3s 进入结果页
    }, 3400);
  }

  /* ========== 结果页渲染 ========== */

  function renderResult(bull, todayData) {
    showScreen('screen-result');

    // 稀有牛横幅
    const banner = document.getElementById('rare-banner');
    if (bull.isRare) {
      banner.textContent = getRareHint(bull);
      banner.style.display = 'block';
    } else {
      banner.style.display = 'none';
    }

    // 牛图标
    document.getElementById('result-bull-icon').innerHTML = createBullImage(bull, 140);

    // 光晕颜色
    document.getElementById('result-glow').style.background = bull.glow;

    // 牛名
    document.getElementById('result-name').textContent = bull.name;

    // 稀有度
    const rarityEl = document.getElementById('result-rarity');
    rarityEl.textContent = bull.rarity;
    rarityEl.setAttribute('data-rarity', bull.rarity);

    // 牛气值
    const fortuneEl = document.getElementById('result-fortune-value');
    const fortuneFill = document.getElementById('result-fortune-fill');
    fortuneEl.textContent = '0%';
    fortuneFill.style.width = '0%';

    // 动画填充牛气值
    setTimeout(() => {
      fortuneEl.textContent = bull.fortune + '%';
      fortuneFill.style.width = bull.fortune + '%';
    }, 700);

    // 标签
    document.getElementById('result-tags').innerHTML = renderTags(bull.tags, bull, 'result__tag');

    // 文案
    const copy = bull.variants[todayData.copyIdx] || bull.variants[0];
    document.getElementById('result-copy').innerHTML =
      copy.map(line => `<p>${line}</p>`).join('');

    // 储存当前牛信息供牛卡使用
    currentBull = bull;
    currentData = todayData;

    // 按钮始终在结果页展示；次数用完后仅切换为不可用视觉。
    const swapCount = parseInt(localStorage.getItem('niu_swap_count_' + getTodayKey()) || '0', 10);
    const resummonBtn = document.getElementById('btn-resummon');
    const swapLimitReached = swapCount >= DAILY_SWAP_LIMIT;
    resummonBtn.style.display = '';
    resummonBtn.textContent = '偷偷换牛卡';
    resummonBtn.classList.toggle('is-limit-reached', swapLimitReached);
    resummonBtn.setAttribute('aria-disabled', String(swapLimitReached));
    resummonBtn.title = swapLimitReached ? '今天的换牛次数用完啦' : '';
  }

  /* ========== 牛卡 ========== */

  function showCard() {
    if (!currentBull) return;
    const bull = currentBull;
    const data = currentData;
    const card = document.getElementById('bull-card');

    // 注入牛主题色变量（驱动顶部色带、牛气值、标签等）
    card.style.setProperty('--card-color', bull.color);
    card.style.setProperty('--card-glow', bull.glow);

    // 填充牛卡内容
    document.getElementById('card-icon').innerHTML = createBullImage(bull, 100);
    document.getElementById('card-name').textContent = bull.name;
    document.getElementById('card-date').textContent = getTodayDisplay();

    const rarityEl = document.getElementById('card-rarity');
    rarityEl.textContent = bull.rarity;
    rarityEl.className = 'bull-card__rarity result__rarity';
    rarityEl.setAttribute('data-rarity', bull.rarity);

    document.getElementById('card-fortune').textContent = bull.fortune + '%';
    document.getElementById('card-tags').innerHTML = renderTags(bull.tags, bull, 'bull-card__tag');

    const copy = bull.variants[data.copyIdx] || bull.variants[0];
    document.getElementById('card-copy').innerHTML = '「' + copy.join('') + '」';

    document.getElementById('card-number').textContent = data.number;

    // 背景光晕
    document.getElementById('card-bg').style.background =
      'radial-gradient(circle at 50% 25%, ' + bull.glow + ', transparent 65%)';

    // 预览和导出牛卡共用同一张可真实扫码的二维码。
    document.getElementById('card-qr').innerHTML =
      '<img src="' + MYBULL_QR_IMAGE + '" alt="扫码访问 ' + MYBULL_URL + '" draggable="false">';

    document.getElementById('card-modal').classList.add('active');
    document.body.classList.add('modal-open');
  }

  /* ========== Canvas 保存牛卡图片 ========== */

  async function saveCardImage() {
    if (!currentBull) return;
    var bull = currentBull;
    var data = currentData;

    var W = 1080, H = 1440;
    var canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    var ctx = canvas.getContext('2d');

    // === 背景 ===
    var bgGrad = ctx.createLinearGradient(0, 0, 0, H);
    bgGrad.addColorStop(0, '#FFFFFF');
    bgGrad.addColorStop(1, '#FBF7F0');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // === 顶部主题色带 ===
    var bandGrad = ctx.createLinearGradient(0, 0, W, 0);
    bandGrad.addColorStop(0, bull.color);
    bandGrad.addColorStop(1, bull.glow);
    ctx.fillStyle = bandGrad;
    ctx.fillRect(0, 0, W, 12);

    // === 顶部光晕 ===
    var glowGrad = ctx.createRadialGradient(W / 2, 400, 0, W / 2, 400, 450);
    glowGrad.addColorStop(0, hexToRgba(bull.glow, 0.15));
    glowGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = glowGrad;
    ctx.fillRect(0, 0, W, 700);

    // === 品牌名 ===
    ctx.fillStyle = '#6B5D52';
    ctx.font = 'bold 38px "Noto Serif SC", serif';
    ctx.textAlign = 'left';
    ctx.fillText('今日我的牛', 80, 110);

    // === 日期 ===
    ctx.fillStyle = '#A89B8E';
    ctx.font = '34px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(getTodayDisplay(), W - 80, 110);

    // === 稀有牛横幅 ===
    if (bull.isRare) {
      ctx.fillStyle = bull.glow;
      ctx.font = 'bold 36px "Noto Serif SC", serif';
      ctx.textAlign = 'center';
      ctx.fillText('★ ' + getRareHint(bull) + ' ★', W / 2, 175);
    }

    // === 从九宫格原图裁切当前牛 ===
    var qrCodeImage;
    try {
      var bullGridImage = await loadBullImage(bull);
      qrCodeImage = await loadImageAsset(MYBULL_QR_IMAGE);
      drawBullImageOnCanvas(ctx, bullGridImage, bull, W / 2, 400, 360);
    } catch (error) {
      showToast('牛卡素材加载失败，请稍后再试');
      return;
    }

    // === 牛名 ===
    ctx.fillStyle = '#2B2420';
    ctx.font = 'bold 88px "Noto Serif SC", serif';
    ctx.textAlign = 'center';
    ctx.fillText(bull.name, W / 2, 640);

    // === 稀有度药丸 ===
    var rarityColors = { N: '#9CA3AF', R: '#3B82F6', SR: '#8B5CF6', SSR: '#F59E0B', UR: '#8B5CF6' };
    var rColor = rarityColors[bull.rarity] || '#9CA3AF';
    ctx.font = 'bold 34px monospace';
    var rarityW = ctx.measureText(bull.rarity).width;
    var rPillW = rarityW + 48;
    var rPillH = 54;
    var rPillX = W / 2 - rPillW / 2;
    var rPillY = 665;
    ctx.fillStyle = hexToRgba(rColor, 0.15);
    drawRoundRect(ctx, rPillX, rPillY, rPillW, rPillH, rPillH / 2);
    ctx.fill();
    ctx.fillStyle = rColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(bull.rarity, W / 2, rPillY + rPillH / 2 + 2);
    ctx.textBaseline = 'alphabetic';

    // === 牛气值 ===
    ctx.fillStyle = '#6B5D52';
    ctx.font = '36px "Noto Serif SC", serif';
    ctx.textAlign = 'left';
    ctx.fillText('牛气值', W / 2 - 180, 810);

    ctx.fillStyle = bull.color;
    ctx.font = 'bold 52px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(bull.fortune + '%', W / 2 + 180, 810);

    // 进度条
    ctx.fillStyle = '#F5EFE3';
    drawRoundRect(ctx, W / 2 - 180, 830, 360, 14, 7);
    ctx.fill();
    ctx.fillStyle = bull.color;
    drawRoundRect(ctx, W / 2 - 180, 830, 360 * bull.fortune / 100, 14, 7);
    ctx.fill();

    // === 标签（药丸 + 小圆点）===
    var tags = bull.tags.map(function (t) { return t.replace(/^#/, ''); });
    ctx.font = '32px "Noto Serif SC", serif';
    ctx.textBaseline = 'middle';
    var tagGap = 16;
    var tagPillH = 48;
    var tagPad = 20;
    var dotR = 3.5;
    var dotGap = 8;
    var tagWidths = tags.map(function (t) { return ctx.measureText(t).width; });
    var totalTagW = tagWidths.reduce(function (sum, w) { return sum + w + tagPad * 2 + dotR * 2 + dotGap; }, 0) + tagGap * (tags.length - 1);
    var tagX = W / 2 - totalTagW / 2;
    tags.forEach(function (t, idx) {
      var tw = tagWidths[idx];
      var pW = tw + tagPad * 2 + dotR * 2 + dotGap;
      ctx.fillStyle = hexToRgba(bull.color, 0.1);
      drawRoundRect(ctx, tagX, 890, pW, tagPillH, tagPillH / 2);
      ctx.fill();
      ctx.fillStyle = bull.color;
      ctx.beginPath();
      ctx.arc(tagX + tagPad + dotR, 890 + tagPillH / 2, dotR, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = bull.color;
      ctx.textAlign = 'left';
      ctx.fillText(t, tagX + tagPad + dotR * 2 + dotGap, 890 + tagPillH / 2 + 2);
      tagX += pW + tagGap;
    });
    ctx.textBaseline = 'alphabetic';

    // === 文案 ===
    ctx.fillStyle = '#6B5D52';
    ctx.font = '40px "Noto Serif SC", serif';
    ctx.textAlign = 'center';
    var copy = bull.variants[data.copyIdx] || bull.variants[0];
    ctx.fillText(copy[0], W / 2, 1010);
    ctx.fillText(copy[1], W / 2, 1070);

    // === 分割线 ===
    var divGrad = ctx.createLinearGradient(80, 0, W - 80, 0);
    divGrad.addColorStop(0, 'transparent');
    divGrad.addColorStop(0.15, '#E8E0D5');
    divGrad.addColorStop(0.85, '#E8E0D5');
    divGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = divGrad;
    ctx.fillRect(80, 1170, W - 160, 1.5);

    // === 底部：左侧编号+声明 ===
    ctx.fillStyle = '#A89B8E';
    ctx.font = '32px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(data.number, 80, 1255);
    ctx.fillStyle = '#A89B8E';
    ctx.font = '26px "Noto Serif SC", serif';
    ctx.fillText('今日你的牛 · 仅供娱乐', 80, 1295);

    // === 底部：右侧二维码+扫码提示 ===
    // 33 个模块（25 内容 + 四周各 4 格留白）× 4px，保持整数像素倍率。
    var qrSize = 132;
    var qrX = W - 80 - qrSize;
    var qrY = 1200;
    // 二维码白底边框
    ctx.fillStyle = '#FFFFFF';
    drawRoundRect(ctx, qrX - 8, qrY - 8, qrSize + 16, qrSize + 16, 10);
    ctx.fill();
    ctx.strokeStyle = '#E8E0D5';
    ctx.lineWidth = 1;
    drawRoundRect(ctx, qrX - 8, qrY - 8, qrSize + 16, qrSize + 16, 10);
    ctx.stroke();
    // 绘制指向正式域名的真实二维码
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(qrCodeImage, qrX, qrY, qrSize, qrSize);
    ctx.imageSmoothingEnabled = true;
    // 扫码提示
    ctx.fillStyle = '#A89B8E';
    ctx.font = '26px "Noto Serif SC", serif';
    ctx.textAlign = 'right';
    ctx.fillText('扫码看看', qrX - 16, 1255);
    ctx.fillText('今天你是哪头牛', qrX - 16, 1295);

    // === 下载 ===
    canvas.toBlob(function (blob) {
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = '今日你的牛_' + bull.name + '_' + getTodayKey() + '.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('牛卡已保存到相册');
    }, 'image/png');
  }

  // Canvas 圆角矩形辅助函数
  function drawRoundRect(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  // Canvas 按 row / col 精确裁切 3 × 3 九宫格中的当前牛。
  function drawBullImageOnCanvas(ctx, image, bull, cx, cy, size) {
    const gridSize = bull.image.gridSize || 3;
    const cellWidth = image.naturalWidth / gridSize;
    const cellHeight = image.naturalHeight / gridSize;
    ctx.drawImage(
      image,
      bull.image.col * cellWidth,
      bull.image.row * cellHeight,
      cellWidth,
      cellHeight,
      cx - size / 2,
      cy - size / 2,
      size,
      size
    );
  }

  function generateShareLink() {
    if (!currentBull) return '';
    const bull = currentBull;
    const base = window.location.origin + window.location.pathname;
    return base + '?friend=' + encodeURIComponent(bull.id);
  }

  function shareCard() {
    if (!currentBull || !currentData) {
      showToast('请先召唤你的牛');
      return;
    }

    const link = generateShareLink();
    if (!link) {
      showToast('生成分享链接失败，请刷新重试');
      return;
    }

    const bull = currentBull;
    const copy = bull.variants[currentData.copyIdx] || bull.variants[0];
    const shareText = generateShareText(bull, copy);

    // 尝试使用 Web Share API（移动端体验好，桌面端可能不支持）
    if (navigator.share && typeof navigator.share === 'function') {
      try {
        const result = navigator.share({
          title: '今日你的牛',
          text: shareText,
          url: link,
        });
        // navigator.share 返回 Promise，捕获 rejection（如用户取消）
        if (result && typeof result.catch === 'function') {
          result.catch(function () {
            // 用户取消或分享失败，回退到复制链接
            copyToClipboard(link);
          });
        }
      } catch (e) {
        // 同步异常（部分浏览器在桌面端会抛出），回退到复制链接
        copyToClipboard(link);
      }
    } else {
      copyToClipboard(link);
    }
  }

  function generateShareText(bull, copy) {
    const templates = {
      baofu: '我今天居然是暴富牛，牛气 ' + bull.fortune + '%。你是什么牛？',
      moyu: '系统说我今天是摸鱼牛……好像还挺准。',
      fafeng: '今日身份确认：发疯牛。你也来看看。',
      shang_an: '今天抽到上岸牛，先借个好兆头。',
    };
    if (templates[bull.id]) return templates[bull.id];
    return '我今天是' + bull.name + '，牛气 ' + bull.fortune + '%。你是什么牛？';
  }

  function copyToClipboard(text) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () {
          showToast('分享链接已复制，去发给朋友吧');
        }).catch(function () {
          fallbackCopy(text);
        });
      } else {
        fallbackCopy(text);
      }
    } catch (e) {
      fallbackCopy(text);
    }
  }

  function fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      showToast('分享链接已复制，去发给朋友吧');
    } catch (e) {
      showToast('请手动复制链接分享');
    }
    document.body.removeChild(ta);
  }

  /* ========== 好友入口 ========== */

  function checkFriendEntry() {
    const params = new URLSearchParams(window.location.search);
    const friendBullId = params.get('friend');
    if (friendBullId) {
      const friendBull = findBull(decodeURIComponent(friendBullId));
      if (friendBull) {
        renderFriendPage(friendBull);
        return true;
      }
    }
    return false;
  }

  function renderFriendPage(bull) {
    showScreen('screen-friend');
    document.getElementById('friend-bull-icon').innerHTML = createBullImage(bull, 100);
    document.getElementById('friend-bull-name').textContent = bull.name;

    const rarityEl = document.getElementById('friend-rarity');
    rarityEl.textContent = bull.rarity;
    rarityEl.setAttribute('data-rarity', bull.rarity);

    const copy = bull.variants[0];
    document.getElementById('friend-copy').textContent = '「' + copy.join('') + '」';
  }

  /* ========== 偷偷换一头 ========== */

  function handleResummon() {
    const todayKey = getTodayKey();
    const swapCount = parseInt(localStorage.getItem('niu_swap_count_' + todayKey) || '0', 10);

    if (swapCount >= DAILY_SWAP_LIMIT) {
      showToast('今天的换牛次数用完啦');
      return;
    }

    const desc = document.getElementById('confirm-desc');
    const remainingSwaps = DAILY_SWAP_LIMIT - swapCount;
    if (swapCount === 0) {
      desc.textContent = '真要换吗？它已经认定你了。';
    } else if (remainingSwaps === 1) {
      desc.textContent = '这是今天最后一次机会了，确定要换吗？';
    } else {
      desc.textContent = '今天还能换 ' + remainingSwaps + ' 次，确定要换吗？';
    }

    document.getElementById('confirm-modal').classList.add('active');
  }

  function confirmResummon() {
    const todayKey = getTodayKey();
    const swapCount = parseInt(localStorage.getItem('niu_swap_count_' + todayKey) || '0', 10);

    if (swapCount >= DAILY_SWAP_LIMIT) {
      document.getElementById('confirm-modal').classList.remove('active');
      showToast('今天的换牛次数用完啦');
      return;
    }

    // 增加换牛次数
    localStorage.setItem('niu_swap_count_' + todayKey, String(swapCount + 1));
    // 清除今日结果，重新抽取
    localStorage.removeItem('niu_today_' + todayKey);

    document.getElementById('confirm-modal').classList.remove('active');
    showToast('正在偷偷换牛卡…');
    setTimeout(() => {
      startDraw();
    }, 600);
  }

  /* ========== Toast ========== */

  let toastTimer = null;
  function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2500);
  }

  /* ========== 状态变量 ========== */

  let currentBull = null;
  let currentData = null;

  /* ========== 事件绑定 ========== */

  function bindEvents() {
    // 首页召唤按钮
    document.getElementById('btn-summon').addEventListener('click', function() {
      const todayKey = getTodayKey();
      const stored = localStorage.getItem('niu_today_' + todayKey);
      if (stored) {
        // 今天已抽过，直接显示结果
        try {
          const data = JSON.parse(stored);
          const bull = findBull(data.bullId);
          if (bull) {
            renderResult(bull, data);
            return;
          }
        } catch (e) {}
      }
      startDraw();
    });

    // 生成牛卡
    document.getElementById('btn-card').addEventListener('click', showCard);

    // 关闭牛卡
    document.getElementById('btn-card-close').addEventListener('click', function() {
      document.getElementById('card-modal').classList.remove('active');
      document.body.classList.remove('modal-open');
    });

    // 保存牛卡图片
    document.getElementById('btn-card-save').addEventListener('click', saveCardImage);

    // 偷偷换一头
    document.getElementById('btn-resummon').addEventListener('click', handleResummon);
    document.getElementById('btn-confirm-cancel').addEventListener('click', function() {
      document.getElementById('confirm-modal').classList.remove('active');
    });
    document.getElementById('btn-confirm-ok').addEventListener('click', confirmResummon);

    // 好友页召唤
    document.getElementById('btn-friend-summon').addEventListener('click', function() {
      // 清除 URL 参数
      window.history.replaceState({}, '', window.location.pathname);
      // 检查是否今天已抽过
      const todayKey = getTodayKey();
      const stored = localStorage.getItem('niu_today_' + todayKey);
      if (stored) {
        try {
          const data = JSON.parse(stored);
          const bull = findBull(data.bullId);
          if (bull) {
            renderResult(bull, data);
            return;
          }
        } catch (e) {}
      }
      startDraw();
    });

    // 点击模态框背景关闭
    document.getElementById('card-modal').addEventListener('click', function(e) {
      if (e.target === this) {
        this.classList.remove('active');
        document.body.classList.remove('modal-open');
      }
    });
    document.getElementById('confirm-modal').addEventListener('click', function(e) {
      if (e.target === this) this.classList.remove('active');
    });
  }

  /* ========== 初始化 ========== */

  function init() {
    bindEvents();

    // 检查好友入口
    if (checkFriendEntry()) return;

    // 检查是否今天已抽过
    const todayKey = getTodayKey();
    const stored = localStorage.getItem('niu_today_' + todayKey);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        const bull = findBull(data.bullId);
        if (bull) {
          renderHome();
          // 直接显示结果页
          renderResult(bull, data);
          return;
        }
      } catch (e) {}
    }

    renderHome();
  }

  // DOM 就绪后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
