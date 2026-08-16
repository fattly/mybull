/**
 * 今日你的牛 — 牛人格数据库
 * 24 种普通牛 + 5 种稀有牛 = 29 种
 * 每种牛包含：名称、分类、标签、牛气值、文案变体、稀有度、主题色
 */

const BULL_CATEGORIES = {
  money: { name: '搞钱类', color: '#D9482E' },
  work: { name: '工作类', color: '#6B7280' },
  study: { name: '学习类', color: '#3B82F6' },
  mood: { name: '情绪类', color: '#8B5CF6' },
  social: { name: '社交类', color: '#EC4899' },
  tech: { name: '科技类', color: '#06B6D4' },
};

const RARITY = {
  N: { name: 'N', label: '普通', color: '#9CA3AF', weight: 55 },
  R: { name: 'R', label: '稀有', color: '#3B82F6', weight: 25 },
  SR: { name: 'SR', label: '超稀有', color: '#8B5CF6', weight: 12 },
  SSR: { name: 'SSR', label: '传说', color: '#F59E0B', weight: 6 },
  UR: { name: 'UR', label: '神兽', color: 'rainbow', weight: 2 },
};

const BULLS = [
  // ===== 搞钱类 =====
  {
    id: 'baofu', name: '暴富牛', category: 'money', rarity: 'SSR',
    fortune: 96, tags: ['#搞钱', '#机会', '#敢冲'],
    color: '#D9482E', glow: '#FF6B35',
    variants: [
      ['今天你的搞钱雷达有点灵。', '有机会就接住，别光收藏。'],
      ['财运正在靠近你。', '今天适合做那个大胆的决定。'],
      ['钱在来的路上了。', '你只需要把口袋准备好。'],
    ],
  },
  {
    id: 'gaoqian', name: '搞钱牛', category: 'money', rarity: 'R',
    fortune: 72, tags: ['#赚钱', '#精明', '#算账'],
    color: '#E8753C', glow: '#FF8C42',
    variants: [
      ['今天适合盘一盘账。', '搞钱这件事，你从不含糊。'],
      ['精打细算的一天。', '小钱也是钱，积少成多。'],
    ],
  },
  {
    id: 'zhangting', name: '涨停牛', category: 'money', rarity: 'SR',
    fortune: 85, tags: ['#股市', '#红色', '#起飞'],
    color: '#DC2626', glow: '#EF4444',
    variants: [
      ['今天你的账户有点红。', '别急着卖，让子弹飞一会儿。'],
      ['涨停板在向你招手。', '今天适合做个乐观主义者。'],
    ],
  },
  {
    id: 'facai', name: '发财牛', category: 'money', rarity: 'R',
    fortune: 68, tags: ['#财运', '#亨通', '#数钱'],
    color: '#EA580C', glow: '#FB923C',
    variants: [
      ['今天财运亨通。', '记得接住每一个小机会。'],
      ['数钱数到手抽筋的那种。', '虽然现在还没开始数。'],
    ],
  },
  {
    id: 'shengqian', name: '省钱牛', category: 'money', rarity: 'N',
    fortune: 48, tags: ['#抠门', '#精打细算', '#不花'],
    color: '#CA8A04', glow: '#FACC15',
    variants: [
      ['今天看上的东西，先放购物车。', '放三天就不想要了。'],
      ['省钱，是另一种赚钱。', '你今天赚了不少。'],
    ],
  },
  {
    id: 'touzi', name: '投资牛', category: 'money', rarity: 'R',
    fortune: 74, tags: ['#理财', '#复利', '#眼光'],
    color: '#C2410C', glow: '#F97316',
    variants: [
      ['今天你的眼光，比K线还准。', '但准归准，别 all in。'],
      ['复利的奇迹，从今天开始。', '虽然要等很久才能看见。'],
    ],
  },
  {
    id: 'zhongjiang', name: '中奖牛', category: 'money', rarity: 'SR',
    fortune: 86, tags: ['#锦鲤', '#运气', '#躺赢'],
    color: '#B45309', glow: '#F59E0B',
    variants: [
      ['今天你被幸运女神盯上了。', '虽然她经常放鸽子。'],
      ['锦鲤附体的一天。', '记得买张彩票验证一下。'],
    ],
  },
  {
    id: 'fuye', name: '副业牛', category: 'money', rarity: 'N',
    fortune: 50, tags: ['#斜杠', '#搞副业', '#多管道'],
    color: '#A16207', glow: '#EAB308',
    variants: [
      ['主业糊口，副业养梦。', '今天两个都得顾。'],
      ['白天打工，晚上搞钱。', '这就是斜杠青年的日常。'],
    ],
  },

  // ===== 工作类 =====
  {
    id: 'dagong', name: '打工牛', category: 'work', rarity: 'N',
    fortune: 55, tags: ['#牛马本牛', '#想下班', '#工作'],
    color: '#6B7280', glow: '#9CA3AF',
    variants: [
      ['牛来了。', '但你还得上班。'],
      ['今天又是打工的一天。', '下班才是今天真正的开始。'],
      ['打工牛，打工魂。', '打工都是人上人（大概）。'],
    ],
  },
  {
    id: 'jiaban', name: '加班牛', category: 'work', rarity: 'N',
    fortune: 38, tags: ['#996', '#熬夜', '#打工人'],
    color: '#4B5563', glow: '#6B7280',
    variants: [
      ['今天的你，属于工位。', '明天的你，可能还是。'],
      ['加班不是你的选择。', '是加班选择了你。'],
    ],
  },
  {
    id: 'moyu', name: '摸鱼牛', category: 'work', rarity: 'N',
    fortune: 43, tags: ['#低电量', '#今天先活着', '#不想努力'],
    color: '#78716C', glow: '#A8A29E',
    variants: [
      ['今天不是不努力，', '是你的牛正在节能模式。'],
      ['摸鱼不是偷懒。', '是一种战略性休息。'],
      ['今天的工作KPI：活着。', '已达标，可以下班了。'],
    ],
  },
  {
    id: 'kaihui', name: '开会牛', category: 'work', rarity: 'N',
    fortune: 41, tags: ['#无聊', '#走神', '#会议'],
    color: '#57534E', glow: '#78716C',
    variants: [
      ['今天的会，又开麻了。', '你的灵魂在工位上飘。'],
      ['会议是工作的休息。', '虽然开会比工作还累。'],
    ],
  },
  {
    id: 'xiaban', name: '下班牛', category: 'work', rarity: 'N',
    fortune: 60, tags: ['#到点就走', '#自由', '#打卡'],
    color: '#525252', glow: '#737373',
    variants: [
      ['今天的最高成就：准时下班。', '已达成。'],
      ['六点一到，你比谁都快。', '这是你今天唯一的高光。'],
    ],
  },
  {
    id: 'chuchai', name: '出差牛', category: 'work', rarity: 'R',
    fortune: 64, tags: ['#飞来飞去', '#酒店', '#报销'],
    color: '#44403C', glow: '#78716C',
    variants: [
      ['今天你在另一个城市的酒店里。', '想家，但报销单更想哭。'],
      ['行李箱是你的第二故乡。', '虽然你也不想认这个故乡。'],
    ],
  },
  {
    id: 'huibao', name: '汇报牛', category: 'work', rarity: 'N',
    fortune: 45, tags: ['#PPT', '#演讲', '#紧张'],
    color: '#404040', glow: '#737373',
    variants: [
      ['今天你要上台汇报。', 'PPT做了80页，讲了8页。'],
      ['台下的领导在点头。', '你不确定是赞同还是睡着了。'],
    ],
  },
  {
    id: 'juanwang', name: '卷王牛', category: 'work', rarity: 'SR',
    fortune: 89, tags: ['#内卷', '#拼命', '#第一名'],
    color: '#1C1917', glow: '#57534E',
    variants: [
      ['别人下班你加班，别人加班你通宵。', '卷王，今日认证。'],
      ['卷不是目的，卷赢才是。', '今天你又赢了（大概）。'],
    ],
  },

  // ===== 学习类 =====
  {
    id: 'shang_an', name: '上岸牛', category: 'study', rarity: 'SR',
    fortune: 88, tags: ['#冲刺', '#上岸', '#别停'],
    color: '#2563EB', glow: '#3B82F6',
    variants: [
      ['岸已经能看见了。', '今天别停。'],
      ['再坚持一下，就快到了。', '上岸后的风景，值得这一程。'],
    ],
  },
  {
    id: 'zilv', name: '自律牛', category: 'study', rarity: 'R',
    fortune: 76, tags: ['#早起', '#计划', '#坚持'],
    color: '#1D4ED8', glow: '#2563EB',
    variants: [
      ['今天的你，自律得让人害怕。', '但你自己觉得还挺舒服。'],
      ['计划表已经排满了。', '完成率嘛……今天先不打扰你。'],
    ],
  },
  {
    id: 'baofojiao', name: '临时抱佛脚牛', category: 'study', rarity: 'N',
    fortune: 52, tags: ['#突击', '#慌', '#还来得及'],
    color: '#3B82F6', glow: '#60A5FA',
    variants: [
      ['还来得及。', '大概。可能。也许。'],
      ['临阵磨枪，不快也光。', '今天你信这句话。'],
    ],
  },
  {
    id: 'xueba', name: '学霸牛', category: 'study', rarity: 'SR',
    fortune: 82, tags: ['#满分', '#轻松', '#天赋'],
    color: '#1E40AF', glow: '#3B82F6',
    variants: [
      ['别人还在翻书。', '你已经合上了。'],
      ['今天的学习，像喝水一样自然。', '虽然你其实不太想喝。'],
    ],
  },
  {
    id: 'kaoyan', name: '考研牛', category: 'study', rarity: 'N',
    fortune: 54, tags: ['#刷题', '#图书馆', '#黑眼圈'],
    color: '#2563EB', glow: '#60A5FA',
    variants: [
      ['今天的你，和图书馆的灯一起亮。', '一起灭。'],
      ['刷完这套题就睡。', '然后刷到了凌晨三点。'],
    ],
  },
  {
    id: 'jiwa', name: '鸡娃牛', category: 'study', rarity: 'R',
    fortune: 67, tags: ['#家长', '#辅导班', '#焦虑'],
    color: '#1D4ED8', glow: '#3B82F6',
    variants: [
      ['今天你在给孩子报班。', '报着报着，自己想上了。'],
      ['别人家的孩子会弹琴。', '你家的会哭。'],
    ],
  },
  {
    id: 'taoke', name: '逃课牛', category: 'study', rarity: 'N',
    fortune: 49, tags: ['#旷课', '#游戏', '#堕落'],
    color: '#3B82F6', glow: '#60A5FA',
    variants: [
      ['今天你没去上课。', '去做了更重要的事——打游戏。'],
      ['逃课不是堕落。', '是对课程质量的一次用脚投票。'],
    ],
  },
  {
    id: 'boshi', name: '博士牛', category: 'study', rarity: 'SR',
    fortune: 83, tags: ['#科研', '#论文', '#脱发'],
    color: '#1E3A8A', glow: '#3B82F6',
    variants: [
      ['今天的你，离毕业又近了一篇论文。', '离头发又远了一寸。'],
      ['论文改了第十八版。', '导师说：再改改。'],
    ],
  },
  {
    id: 'beidanci', name: '背单词牛', category: 'study', rarity: 'N',
    fortune: 47, tags: ['#英语', '#abandon', '#背了忘'],
    color: '#60A5FA', glow: '#93C5FD',
    variants: [
      ['今天你从 abandon 开始背。', '背到 abandon 就 abandon 了。'],
      ['背了忘，忘了背。', '这就是你的英语学习闭环。'],
    ],
  },

  // ===== 情绪类 =====
  {
    id: 'tangping', name: '躺平牛', category: 'mood', rarity: 'N',
    fortune: 37, tags: ['#休息', '#放过自己', '#低功耗'],
    color: '#7C3AED', glow: '#A78BFA',
    variants: [
      ['今天最牛的事，', '可能是什么都不干。'],
      ['躺平不是放弃。', '是一种高级的生活态度。'],
    ],
  },
  {
    id: 'fafeng', name: '发疯牛', category: 'mood', rarity: 'R',
    fortune: 88, tags: ['#精神状态良好', '#随缘', '#别惹我'],
    color: '#9333EA', glow: '#C084FC',
    variants: [
      ['情绪稳定。', '稳定地想发疯。'],
      ['今天的精神状态：良好。', '良好地想掀桌子。'],
      ['我不是在发疯。', '我只是在用一种新的方式理解世界。'],
    ],
  },
  {
    id: 'didianliang', name: '低电量牛', category: 'mood', rarity: 'N',
    fortune: 29, tags: ['#没电', '#充不进', '#躺'],
    color: '#6D28D9', glow: '#8B5CF6',
    variants: [
      ['电量：3%。', '请尽快寻找充电桩（床）。'],
      ['今天的你，像一台充不进电的手机。', '重启也没用的那种。'],
    ],
  },
  {
    id: 'kaixin', name: '开心牛', category: 'mood', rarity: 'R',
    fortune: 79, tags: ['#今天真不错', '#心情好', '#哼歌'],
    color: '#A855F7', glow: '#D946EF',
    variants: [
      ['今天心情不错。', '连工位都觉得顺眼了一点。'],
      ['开心是一种超能力。', '今天你拥有它。'],
    ],
  },
  {
    id: 'jiaolv', name: '焦虑牛', category: 'mood', rarity: 'N',
    fortune: 35, tags: ['#内耗', '#想太多', '#失眠'],
    color: '#6D28D9', glow: '#A78BFA',
    variants: [
      ['今天你为还没发生的事，操碎了心。', '那件事大概率不会发生。'],
      ['焦虑是免费的，但很耗电。', '今天你又白耗了一天。'],
    ],
  },
  {
    id: 'shihuai', name: '释怀牛', category: 'mood', rarity: 'R',
    fortune: 78, tags: ['#看开了', '#放下', '#通透'],
    color: '#9333EA', glow: '#C084FC',
    variants: [
      ['今天你突然想通了。', '虽然明天可能又想不通。'],
      ['放下不是放弃。', '是不想再扛着了。'],
    ],
  },
  {
    id: 'huaijiu', name: '怀旧牛', category: 'mood', rarity: 'N',
    fortune: 53, tags: ['#回忆', '#当年', '#叹息'],
    color: '#7C3AED', glow: '#A78BFA',
    variants: [
      ['今天你翻到了旧照片。', '然后发现当年也没多好。'],
      ['回忆总是加了滤镜。', '所以当年才显得格外美。'],
    ],
  },
  {
    id: 'zhonger', name: '中二牛', category: 'mood', rarity: 'SR',
    fortune: 84, tags: ['#中二病', '#幻想', '#主角光环'],
    color: '#C026D3', glow: '#E879F9',
    variants: [
      ['今天你是世界的主角。', '虽然大家都在演自己的戏。'],
      ['封印解除。', '虽然没什么可解除的。'],
    ],
  },

  // ===== 社交类 =====
  {
    id: 'lianai', name: '恋爱牛', category: 'social', rarity: 'SR',
    fortune: 84, tags: ['#心动', '#桃花', '#主动一点'],
    color: '#DB2777', glow: '#EC4899',
    variants: [
      ['牛还没来，', '桃花可能先来了。'],
      ['今天适合主动一点。', '哪怕只是发个消息。'],
    ],
  },
  {
    id: 'shekong', name: '社恐牛', category: 'social', rarity: 'R',
    fortune: 61, tags: ['#不想说话', '#保持距离', '#在线隐身'],
    color: '#BE185D', glow: '#F472B6',
    variants: [
      ['今天适合：', '看消息，但不一定回。'],
      ['社交电量：已耗尽。', '请勿打扰，谢谢配合。'],
    ],
  },
  {
    id: 'sheniu', name: '社牛', category: 'social', rarity: 'SR',
    fortune: 90, tags: ['#外向', '#人群中心', '#谁都能聊'],
    color: '#E11D48', glow: '#FB7185',
    variants: [
      ['今天你不是来参加聚会的。', '你是来接管聚会的。'],
      ['社牛的一天：和所有人聊完。', '然后回家独自待着。'],
    ],
  },
  {
    id: 'chigua', name: '吃瓜牛', category: 'social', rarity: 'N',
    fortune: 58, tags: ['#前排', '#看戏', '#哈哈哈'],
    color: '#F43F5E', glow: '#FB7185',
    variants: [
      ['前排吃瓜。', '今天的瓜，特别甜。'],
      ['世界上最远的距离，', '是你在吃瓜，而我不知道瓜在哪。'],
    ],
  },
  {
    id: 'tuiqun', name: '退群牛', category: 'social', rarity: 'N',
    fortune: 52, tags: ['#退群', '#清净', '#社死'],
    color: '#DB2777', glow: '#F472B6',
    variants: [
      ['今天你退了三个群。', '世界突然安静了。'],
      ['退群一时爽。', '一直退一直爽。'],
    ],
  },
  {
    id: 'anlian', name: '暗恋牛', category: 'social', rarity: 'R',
    fortune: 65, tags: ['#暗恋', '#心事', '#不敢说'],
    color: '#BE185D', glow: '#EC4899',
    variants: [
      ['今天你想TA了很多次。', 'TA一次都没想你知道。'],
      ['暗恋最累的地方在于：', '你得假装不累。'],
    ],
  },
  {
    id: 'fanju', name: '饭局牛', category: 'social', rarity: 'N',
    fortune: 46, tags: ['#应酬', '#喝酒', '#客套'],
    color: '#9D174D', glow: '#EC4899',
    variants: [
      ['今天你参加了一个饭局。', '说了八百句客套话。'],
      ['酒过三巡，你开始思考人生。', '然后发现自己喝多了。'],
    ],
  },
  {
    id: 'jianpanxia', name: '键盘侠牛', category: 'social', rarity: 'N',
    fortune: 55, tags: ['#网上冲浪', '#正义', '#键盘'],
    color: '#831843', glow: '#F472B6',
    variants: [
      ['今天你在网上维护了正义。', '现实中没敢和人说话。'],
      ['键盘是你的武器。', '虽然它也只会打字。'],
    ],
  },
  {
    id: 'gewang', name: '鸽王牛', category: 'social', rarity: 'SR',
    fortune: 82, tags: ['#放鸽子', '#爽约', '#下次一定'],
    color: '#E11D48', glow: '#FB7185',
    variants: [
      ['今天你又放了一个鸽子。', '它已经不期待你了。'],
      ['"下次一定"。', '你说的下次，是哪次？'],
    ],
  },

  // ===== 科技类 =====
  {
    id: 'ainiu', name: 'AI牛', category: 'tech', rarity: 'SR',
    fortune: 87, tags: ['#AI', '#效率', '#未来'],
    color: '#0891B2', glow: '#22D3EE',
    variants: [
      ['别人还在干活，', '你的牛已经开始调 Agent 了。'],
      ['今天的你，效率拉满。', '因为 AI 替你干了一半。'],
    ],
  },
  {
    id: 'chengxuyuan', name: '程序员牛', category: 'tech', rarity: 'R',
    fortune: 66, tags: ['#代码', '#bug', '#咖啡'],
    color: '#0E7490', glow: '#06B6D4',
    variants: [
      ['今天的 bug，明天的 feature。', '你深信这一点。'],
      ['咖啡续命，代码续魂。', '今天两样都缺。'],
    ],
  },
  {
    id: 'agent', name: 'Agent牛', category: 'tech', rarity: 'SSR',
    fortune: 93, tags: ['#自动化', '#智能体', '#甩手'],
    color: '#155E75', glow: '#22D3EE',
    variants: [
      ['你已经不需要自己干活了。', '你的 Agent 在替你打工。'],
      ['别人在写代码。', '你在写能写代码的代码。'],
    ],
  },
  {
    id: 'saibo', name: '赛博牛', category: 'tech', rarity: 'SR',
    fortune: 81, tags: ['#未来感', '#霓虹', '#数字'],
    color: '#0D9488', glow: '#2DD4BF',
    variants: [
      ['你已经活在 2077 年了。', '虽然日历上还写着今天。'],
      ['赛博朋克不是一种风格。', '是你的日常。'],
    ],
  },
  {
    id: 'jike', name: '极客牛', category: 'tech', rarity: 'R',
    fortune: 70, tags: ['#折腾', '#命令行', '#开源'],
    color: '#0E7490', glow: '#22D3EE',
    variants: [
      ['今天的你，在终端里找到了快乐。', '虽然没人懂。'],
      ['你的人生信条：能用命令行解决的，绝不点鼠标。'],
    ],
  },
  {
    id: 'yuanuzhou', name: '元宇宙牛', category: 'tech', rarity: 'N',
    fortune: 57, tags: ['#VR', '#虚拟', '#头像'],
    color: '#0891B2', glow: '#67E8F9',
    variants: [
      ['今天你活在元宇宙里。', '虽然现实里还没吃晚饭。'],
      ['你的头像比本人好看。', '这是元宇宙最大的诚意。'],
    ],
  },
  {
    id: 'fuwuqi', name: '服务器牛', category: 'tech', rarity: 'N',
    fortune: 44, tags: ['#运维', '#宕机', '#重启'],
    color: '#155E75', glow: '#22D3EE',
    variants: [
      ['今天服务器宕了。', '你的心也宕了一下。然后重启了。'],
      ['运维三宝：备份、重启、求神拜佛。', '今天三样都用了。'],
    ],
  },

  // ===== 稀有牛 (UR) =====
  {
    id: 'huangjin', name: '黄金牛', category: 'money', rarity: 'UR',
    fortune: 99, tags: ['#传说', '#金光', '#好运'],
    color: '#D97706', glow: '#FBBF24', isRare: true,
    variants: [
      ['传说中百年一遇的黄金牛。', '今天，它选择了你。'],
      ['金光闪闪的一天。', '你被好运盯上了。'],
    ],
  },
  {
    id: 'niuwang', name: '牛王', category: 'work', rarity: 'UR',
    fortune: 99, tags: ['#王者', '#统领', '#霸气'],
    color: '#7C2D12', glow: '#DC2626', isRare: true,
    variants: [
      ['万牛之王，今日降临。', '所有牛都听你的。'],
      ['你不是在打工。', '你是在巡视你的领地。'],
    ],
  },
  {
    id: 'yuzhou', name: '宇宙牛', category: 'tech', rarity: 'UR',
    fortune: 99, tags: ['#星河', '#无限', '#超脱'],
    color: '#4C1D95', glow: '#8B5CF6', isRare: true,
    variants: [
      ['你已超越牛的形态。', '化作星河中的一缕光。'],
      ['宇宙很大，但你今天最大。', '这是宇宙牛告诉你的。'],
    ],
  },
  {
    id: 'tianxuan', name: '天选牛', category: 'mood', rarity: 'UR',
    fortune: 99, tags: ['#天命', '#唯一', '#传奇'],
    color: '#BE123C', glow: '#F43F5E', isRare: true,
    variants: [
      ['天选之子，今日确认。', '你就是那个被选中的人。'],
      ['命运选择了你。', '虽然你不太确定选来干嘛。'],
    ],
  },
  {
    id: 'saibo_shenniu', name: '赛博神牛', category: 'tech', rarity: 'UR',
    fortune: 99, tags: ['#数字神', '#未来', '#超越'],
    color: '#0F766E', glow: '#2DD4BF', isRare: true,
    variants: [
      ['数字世界的神牛降临。', '你的代码今天不会出 bug。'],
      ['超越了碳基和硅基。', '你是牛的终极形态。'],
    ],
  },
];

/**
 * 九宫格素材映射
 *
 * 每张原图都是 3 × 3 九宫格。row / col 从 0 开始，顺序与素材位置保持一致。
 */
const BULL_IMAGE_GRIDS = {
  money: {
    src: 'images/01_money_bulls_grid.png',
    ids: [
      'huangjin', 'baofu', 'zhongjiang',
      'zhangting', 'touzi', 'gaoqian',
      'facai', 'fuye', 'shengqian',
    ],
  },
  work: {
    src: 'images/02_work_bulls_grid.png',
    ids: [
      'niuwang', 'juanwang', 'chuchai',
      'xiaban', 'dagong', 'moyu',
      'huibao', 'kaihui', 'jiaban',
    ],
  },
  study: {
    src: 'images/03_study_bulls_grid.png',
    ids: [
      'shang_an', 'boshi', 'xueba',
      'zilv', 'jiwa', 'kaoyan',
      'baofojiao', 'taoke', 'beidanci',
    ],
  },
  mood: {
    src: 'images/04_emotion_bulls_grid.png',
    ids: [
      'tianxuan', 'zhonger', 'fafeng',
      'kaixin', 'shihuai', 'huaijiu',
      'tangping', 'jiaolv', 'didianliang',
    ],
  },
  social: {
    src: 'images/05_social_bulls_grid.png',
    ids: [
      'sheniu', 'lianai', 'gewang',
      'anlian', 'shekong', 'chigua',
      'jianpanxia', 'tuiqun', 'fanju',
    ],
  },
  tech: {
    src: 'images/06_tech_bulls_grid.png',
    ids: [
      'yuzhou', 'saibo_shenniu', 'agent',
      'ainiu', 'saibo', 'jike',
      'chengxuyuan', 'yuanuzhou', 'fuwuqi',
    ],
  },
};

// 把素材地址和切图坐标注入每个牛人格，供 DOM 和 Canvas 共用。
Object.keys(BULL_IMAGE_GRIDS).forEach(function (category) {
  const grid = BULL_IMAGE_GRIDS[category];
  grid.ids.forEach(function (id, index) {
    const bull = BULLS.find(function (item) { return item.id === id; });
    if (!bull) return;
    bull.image = {
      src: grid.src,
      row: Math.floor(index / 3),
      col: index % 3,
    };
  });
});

// 工作类原图的第 1 / 2 行分界处有少量上一格残像，下班牛使用清理后的独立切图。
const xiabanBull = BULLS.find(function (item) { return item.id === 'xiaban'; });
if (xiabanBull) {
  xiabanBull.image = {
    src: 'images/bulls/xiaban.png',
    row: 0,
    col: 0,
    gridSize: 1,
  };
}

// 生成牛编号（6位）
function generateBullNumber(seed) {
  const num = Math.abs(seed % 999999);
  return '#' + String(num + 100000).slice(-6);
}

// 获取稀有牛提示文案
function getRareHint(bull) {
  if (!bull.isRare) return '';
  const hints = {
    huangjin: '黄金牛出现！传说级好运降临。',
    niuwang: '牛王降临！万牛俯首。',
    yuzhou: '宇宙牛出现！你已超脱凡牛。',
    tianxuan: '天选牛出现！你就是被选中的人。',
    saibo_shenniu: '赛博神牛降临！数字世界的奇迹。',
  };
  return hints[bull.id] || '稀有牛出现！';
}

window.BULLS = BULLS;
window.BULL_CATEGORIES = BULL_CATEGORIES;
window.RARITY = RARITY;
window.generateBullNumber = generateBullNumber;
window.getRareHint = getRareHint;
