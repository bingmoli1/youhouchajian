// ==UserScript==
// @name         h网中文
// @namespace    http://tampermonkey.net/
// @version      4.5
// @description  跳转中文版 + 标签中文翻译（逻辑重构，功能不变）
// @author       You
// @match        *://nhentai.net/*
// @match        *://*.nhentai.net/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
    'use strict';

    // ========== 常量配置 ==========
    const SITE_HOST = 'nhentai.net';
    const BASE_URL = `https://${SITE_HOST}`;
    const SPLIT_RE = /[|∣]/;
    const SELECTORS = {
        title: 'h1.title',
        prettyTitle: 'h1.title .pretty, h1.title span.pretty',
        tagContainer: '.tag-container.field-name',
        artistName: '.name.svelte-mmywhv, .name',
        artistLink: 'a[href*="/artist/"] .name.svelte-mmywhv, a[href*="/artist/"] .name',
        tagName: '.tagchip .name, .tag .name',
        galleryGrid: '.gallery-grid',
        gallery: '.gallery',
    };
    const BUTTONS = {
        artist: { id: 'tm-translate-btn',       label: '作者', top: '50px'  },
        title:  { id: 'tm-translate-title-btn', label: '标题', top: '105px' },
    };
    const FETCH_TIMEOUT_MS = 5000;
    const DEBOUNCE_MS = 300;
    const THROTTLE_MS = 200;
    const IDLE_OPTIONS = { timeout: 300 };

    const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);
    const idle = window.requestIdleCallback
        ? (cb, options = IDLE_OPTIONS) => window.requestIdleCallback(cb, options)
        : cb => setTimeout(cb, 1);
    const isSupportedSite = () => {
        const host = location.hostname.replace(/^www\./, '');
        return host === SITE_HOST || host.endsWith(`.${SITE_HOST}`);
    };

    // ========== 标签中文翻译字典（前10页大幅扩充，压缩一行） ==========
    const tagTranslations = {
        "big breasts": "巨乳", "sole female": "唯一女性", "sole male": "唯一男性", "anal": "肛交", "nakadashi": "中出",
        "blowjob": "口交", "ahegao": "阿嘿颜", "bondage": "束缚", "multi-work series": "系列作品", "x-ray": "透视",
        "milf": "熟女", "dark skin": "黑皮", "sex toys": "性玩具", "netorare": "寝取", "impregnation": "受孕",
        "big penis": "大鸡巴", "hairy": "多毛", "cheating": "出轨", "muscle": "肌肉", "big ass": "巨尻",
        "mind break": "精神崩溃", "rough translation": "生肉翻译", "huge breasts": "超巨乳", "big areolae": "大乳晕", "drugs": "药物",
        "squirting": "潮吹", "bbw": "丰满", "deepthroat": "深喉", "scanmark": "扫描水印", "humiliation": "羞辱",
        "big nipples": "大乳头", "hidden sex": "隐奸", "leg lock": "腿锁", "gyaru-oh": "辣妹男", "burping": "打嗝",
        "full color": "全彩", "mosaic censorship": "有码", "uncensored": "无码", "lolicon": "萝莉", "shotacon": "正太",
        "yaoi": "耽美", "yuri": "百合", "futanari": "扶她", "tentacles": "触手", "monster": "怪物",
        "rape": "强奸", "mind control": "精神控制", "hypnosis": "催眠", "incest": "乱伦", "mother": "母亲",
        "daughter": "女儿", "sister": "姐妹", "teacher": "老师", "student": "学生", "schoolgirl": "女学生",
        "glasses": "眼镜", "stockings": "丝袜", "pantyhose": "连裤袜", "swimsuit": "泳装", "lingerie": "内衣",
        "uniform": "制服", "maid": "女仆", "nurse": "护士", "pregnant": "孕妇", "lactation": "泌乳",
        "paizuri": "乳交", "handjob": "手交", "footjob": "足交", "cum": "精液", "bukkake": "颜射",
        "gokkun": "饮精", "double penetration": "双穴", "triple penetration": "三穴", "fisting": "拳交", "prolapse": "脱垂",
        "scat": "排泄", "guro": "猎奇", "snuff": "虐杀", "blood": "出血", "torture": "拷问",
        "slave": "奴隶", "petplay": "宠物玩法", "collar": "项圈", "leash": "牵引绳", "public": "公开",
        "exhibitionism": "露出", "voyeurism": "偷窥", "sleeping": "睡眠", "drunk": "醉酒", "aphrodisiac": "春药",
        "eye-rolling": "翻白眼", "tongue": "舌头", "drooling": "流口水", "sweating": "出汗", "body writing": "身体写作",
        "tattoo": "纹身", "piercing": "穿孔", "scar": "伤疤", "amputee": "截肢", "disabled": "残疾",
        "old man": "老人", "ugly bastard": "丑男", "netori": "寝取反向", "cuckold": "绿帽", "swinging": "交换",
        "prostitution": "卖淫", "blackmail": "勒索", "filming": "拍摄", "camera": "相机", "phone": "手机",
        "computer": "电脑", "vr": "虚拟现实", "ai": "人工智能", "robot": "机器人", "android": "人造人",
        "cyborg": "半机械人", "monster girl": "怪物娘", "kemonomimi": "兽耳", "catgirl": "猫娘", "dog girl": "狗娘",
        "fox girl": "狐娘", "bunny girl": "兔女郎", "elf": "精灵", "dark elf": "暗精灵", "demon": "恶魔",
        "angel": "天使", "goddess": "女神", "witch": "魔女", "magical girl": "魔法少女", "superhero": "超级英雄",
        "villain": "反派", "office lady": "OL", "salaryman": "社畜", "housewife": "人妻", "widow": "寡妇",
        "divorced": "离婚", "single mother": "单亲妈妈", "tomboy": "假小子", "gyaru": "辣妹", "ojou": "大小姐",
        "kuudere": "酷娇", "tsundere": "傲娇", "yandere": "病娇", "dandere": "安静", "himedere": "公主病",
        "imouto": "妹妹", "oneesan": "姐姐", "ojisan": "大叔", "shota": "正太", "loli": "萝莉",
        "bishoujo": "美少女", "bishounen": "美少年", "trap": "伪娘", "crossdressing": "女装", "gender bender": "性转",
        "shemale": "人妖", "intersex": "双性", "hermaphrodite": "雌雄同体", "group": "群交", "ffm threesome": "双飞",
        "mmf threesome": "双男", "small breasts": "贫乳", "horns": "角", "tail": "尾巴", "demon girl": "女恶魔",
        "gag": "口球", "very long hair": "超长发", "garter belt": "吊袜带", "western": "西方", "bald": "秃头",
        "stomach deformation": "腹部变形", "tanlines": "晒痕", "blindfold": "眼罩", "webtoon": "条漫", "kimono": "和服",
        "virginity": "处女性", "rimjob": "舔肛", "halo": "光环", "inflation": "膨胀", "sole dickgirl": "唯一扶她",
        "no penetration": "无插入", "nipple stimulation": "刺激乳头", "3d": "3D", "inseki": "姻亲", "bloomers": "灯笼裤",
        "eye-covering bang": "遮眼刘海", "slut": "荡妇", "business suit": "西装", "inverted nipples": "凹陷乳头", "breast feeding": "哺乳",
        "leotard": "紧身衣", "femdom": "女性主导", "maledom": "男性主导", "cunnilingus": "舔阴", "facesitting": "颜面骑乘",
        "armpit": "腋下", "smell": "气味", "sweat": "汗水", "body odor": "体味", "pubic hair": "阴毛",
        "shaved": "剃毛", "armpit hair": "腋毛", "hairy armpit": "多毛腋下", "muscle growth": "肌肉增长", "breast expansion": "乳房膨胀",
        "ass expansion": "臀部膨胀", "penis growth": "阴茎增长", "transformation": "变身", "body modification": "身体改造", "possession": "附身",
        "corruption": "堕落", "exhausted": "精疲力尽", "orgasm denial": "禁止高潮", "forced orgasm": "强制高潮", "multiple orgasms": "多重高潮",
        "female ejaculation": "潮吹", "creampie": "中出", "cum in mouth": "口内射精", "cum on body": "身体射精", "cum on face": "颜射",
        "swallow": "吞精", "spit": "吐出", "cum play": "玩精液", "public use": "公共使用", "gangbang": "轮奸",
        "train": "电车", "chikan": "痴汉", "molestation": "性骚扰", "voyeur": "偷窥", "hidden camera": "隐藏摄像头",
        "recording": "录制", "live streaming": "直播", "hologram": "全息", "ai generated": "AI生成", "machine": "机器",
        "tentacle": "触手", "slime": "史莱姆", "alien": "外星人", "succubus": "魅魔", "incubus": "男魅魔",
        "fallen angel": "堕落天使", "god": "神", "sorceress": "女法师", "superheroine": "女超级英雄", "villainess": "女反派",
        "princess": "公主", "queen": "女王", "empress": "女皇", "noble": "贵族", "butler": "管家",
        "master": "主人", "mistress": "女主人", "pet": "宠物", "bdsm": "BDSM", "domination": "支配",
        "submission": "服从", "sadism": "施虐", "masochism": "受虐", "spanking": "打屁股", "whip": "鞭子",
        "paddle": "拍子", "cane": "藤条", "rope": "绳子", "handcuffs": "手铐", "hood": "头套",
        "mask": "面具", "choker": "颈圈", "harness": "束具", "strapon": "假阳具", "dildo": "假阳具",
        "vibrator": "振动器", "anal beads": "肛珠", "butt plug": "肛塞", "cock ring": "阴茎环", "chastity": "贞操",
        "chastity belt": "贞操带", "cage": "笼子", "pillory": "枷锁", "stocks": "足枷", "cross": "十字架",
        "suspension": "悬挂", "mummification": "木乃伊", "sensory deprivation": "感官剥夺", "electricity": "电击", "wax play": "滴蜡",
        "needle": "针刺", "blood play": "玩血", "knife play": "玩刀", "asphyxiation": "窒息", "breath play": "玩呼吸",
        "water sports": "圣水", "urine": "尿液", "feces": "粪便", "vomit": "呕吐", "gore": "血腥",
        "death": "死亡", "necrophilia": "恋尸", "cannibalism": "食人", "vore": "吞食", "absorption": "吸收",
        "digestion": "消化", "unbirth": "逆生", "birth": "分娩", "cum inflation": "精液膨胀", "belly expansion": "腹部膨胀",
        "animal transformation": "动物变身", "monster transformation": "怪物变身", "plant transformation": "植物变身", "inanimate transformation": "无生命变身", "growth": "变大",
        "shrinking": "变小", "giant": "巨人", "giantess": "女巨人", "tiny": "微小", "macro": "巨大",
        "micro": "微型", "size difference": "体型差", "height difference": "身高差", "age difference": "年龄差", "older female": "年长女性",
        "younger female": "年轻女性", "older male": "年长男性", "younger male": "年轻男性", "mature": "成熟", "dilf": "熟男",
        "cougar": "熟女猎人", "silver fox": "银狐", "elderly": "老年", "old woman": "老妇", "ugly": "丑陋",
        "handsome": "英俊", "beautiful": "美丽", "cute": "可爱", "sexy": "性感", "hot": "火辣",
        "attractive": "有魅力", "plain": "普通", "average": "普通", "fat": "肥胖", "obese": "极度肥胖",
        "skinny": "瘦弱", "emaciated": "骨瘦如柴", "muscular": "肌肉发达", "ripped": "健美", "toned": "结实",
        "soft": "柔软", "plump": "丰满", "curvy": "曲线", "hourglass": "沙漏型", "pear shaped": "梨型",
        "apple shaped": "苹果型", "athletic": "运动型", "fit": "健康", "unfit": "不健康", "ponytail": "马尾",
        "twintails": "双马尾", "braid": "辫子", "long hair": "长发", "short hair": "短发", "bob cut": "波波头",
        "ahoge": "呆毛", "hair bun": "发髻", "side ponytail": "侧马尾", "drill hair": "钻头卷", "curly hair": "卷发",
        "straight hair": "直发", "wavy hair": "波浪发", "shaved head": "光头", "multicolored hair": "多色发", "gradient hair": "渐变发",
        "colored inner hair": "内侧染色", "unusual pupils": "异瞳", "heterochromia": "异色瞳", "slit pupils": "竖瞳", "heart pupils": "心形瞳",
        "star pupils": "星形瞳", "empty eyes": "空洞眼", "glowing eyes": "发光眼", "closed eyes": "闭眼", "one eye closed": "单眼闭",
        "fangs": "尖牙", "pointed ears": "尖耳朵", "animal ears": "兽耳", "cat ears": "猫耳", "dog ears": "狗耳",
        "fox ears": "狐耳", "bunny ears": "兔耳", "wolf ears": "狼耳", "elf ears": "精灵耳", "demon horns": "恶魔角",
        "wings": "翅膀", "angel wings": "天使翅膀", "demon wings": "恶魔翅膀", "cat tail": "猫尾", "dog tail": "狗尾",
        "fox tail": "狐尾", "multiple tails": "多尾", "lamia": "蛇女", "centaur": "半人马", "harpy": "鸟人",
        "mermaid": "人鱼", "dragon girl": "龙娘", "spider girl": "蜘蛛娘", "insect girl": "虫娘", "plant girl": "植物娘",
        "robot girl": "机器人娘", "ghost": "幽灵", "zombie": "僵尸", "skeleton": "骷髅", "undead": "不死",
        "vampire": "吸血鬼", "werewolf": "狼人", "wizard": "巫师", "mage": "法师", "priestess": "女祭司",
        "nun": "修女", "miko": "巫女", "shrine maiden": "巫女", "idol": "偶像", "singer": "歌手",
        "dancer": "舞者", "cheerleader": "啦啦队", "athlete": "运动员", "swimmer": "游泳选手", "gymnast": "体操选手",
        "ballerina": "芭蕾舞演员", "model": "模特", "actress": "女演员", "celebrity": "名人", "streamer": "主播",
        "vtuber": "虚拟主播", "cosplayer": "角色扮演者", "otaku": "御宅族", "nerd": "书呆子", "geek": "极客",
        "delinquent": "不良", "yankee": "不良少女", "gang": "帮派", "yakuza": "黑帮", "mafia": "黑手党",
        "assassin": "刺客", "ninja": "忍者", "samurai": "武士", "knight": "骑士", "soldier": "士兵",
        "officer": "军官", "general": "将军", "commander": "指挥官", "pilot": "飞行员", "captain": "船长",
        "pirate": "海盗", "thief": "小偷", "spy": "间谍", "detective": "侦探", "police": "警察",
        "guard": "守卫", "security": "保安", "bodyguard": "保镖", "mercenary": "雇佣兵", "hunter": "猎人",
        "adventurer": "冒险者", "explorer": "探险家", "scientist": "科学家", "researcher": "研究员", "surgeon": "外科医生",
        "dentist": "牙医", "pharmacist": "药剂师", "veterinarian": "兽医", "professor": "教授", "tutor": "家教",
        "classmate": "同学", "senpai": "前辈", "kouhai": "后辈", "club member": "社团成员", "committee": "委员",
        "president": "会长", "vice president": "副会长", "secretary": "秘书", "treasurer": "财务", "librarian": "图书管理员",
        "cafeteria": "食堂", "janitor": "清洁工", "bus driver": "巴士司机", "taxi driver": "出租车司机", "delivery": "外卖员",
        "waiter": "服务员", "waitress": "女服务员", "bartender": "调酒师", "chef": "厨师", "cook": "厨师",
        "baker": "面包师", "farmer": "农民", "fisherman": "渔夫", "miner": "矿工", "construction": "建筑工人",
        "office worker": "上班族", "businessman": "商人", "businesswoman": "女商人", "ceo": "CEO", "manager": "经理",
        "boss": "老板", "employee": "员工", "intern": "实习生", "part-timer": "兼职", "freelancer": "自由职业者",
        "unemployed": "失业", "neet": "家里蹲", "hikikomori": "家里蹲", "homeless": "无家可归", "beggar": "乞丐",
        "prostitute": "妓女", "sex worker": "性工作者", "call girl": "应召女郎", "escort": "伴游", "stripper": "脱衣舞娘",
        "av actress": "AV女优", "porn star": "色情明星", "cam girl": "摄像头女孩", "sugar daddy": "金主爸爸", "sugar mommy": "金主妈妈",
        "kept woman": "包养女性", "concubine": "小妾", "wife": "妻子", "husband": "丈夫", "girlfriend": "女朋友",
        "boyfriend": "男朋友", "lover": "恋人", "ex": "前任", "crush": "暗恋对象", "rival": "对手",
        "enemy": "敌人", "friend": "朋友", "best friend": "最好的朋友", "childhood friend": "青梅竹马", "neighbor": "邻居",
        "roommate": "室友", "colleague": "同事", "partner": "搭档", "teammate": "队友", "ally": "盟友",
        "mentor": "导师", "apprentice": "学徒", "disciple": "弟子", "servant": "仆人", "owner": "主人",
        "trainer": "训练师", "breeder": "育种者", "collector": "收藏家", "hoarder": "囤积者", "schoolgirl uniform": "女学生制服",
        "schoolboy uniform": "男学生制服", "school uniform": "校服", "tankoubon": "单行本", "bbm": "丰满男性", "defloration": "破处",
        "full censorship": "全码", "bikini": "比基尼"
    };

    // ========== 会话级状态 ==========
    const countCache = new Map();
    let countController = null;
    let updateTimer = null;
    let ensureScheduled = false;
    let lastCheck = 0;
    let lastUrl = location.href;
    let lastCountKey = '';

    // ========== 按钮 ==========
    const BUTTON_STYLE = {
        position: 'fixed',
        right: '15px',
        zIndex: '2147483647',
        padding: '10px 18px',
        fontSize: '15px',
        fontWeight: 'bold',
        color: '#ffffff',
        backgroundColor: '#e74c3c',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        transition: 'all 0.2s ease',
        fontFamily: 'system-ui, sans-serif',
        userSelect: 'none',
    };
    const HOVER_ON = { backgroundColor: '#c0392b', transform: 'scale(1.08)' };
    const HOVER_OFF = { backgroundColor: '#e74c3c', transform: 'scale(1)' };

    function createButton({ id, label, top }, onClick) {
        const btn = document.createElement('button');
        btn.id = id;
        btn.textContent = label;
        Object.assign(btn.style, BUTTON_STYLE, { top });
        btn.addEventListener('mouseenter', () => Object.assign(btn.style, HOVER_ON));
        btn.addEventListener('mouseleave', () => Object.assign(btn.style, HOVER_OFF));
        btn.addEventListener('click', onClick);
        return btn;
    }

    function setButtonCount({ id, label }, count) {
        const btn = document.getElementById(id);
        if (btn) btn.textContent = `${label} (${count})`;
    }

    // ========== 页面信息提取 ==========
    function collectNames(root, selector) {
        return [...root.querySelectorAll(selector)]
            .map(el => el.textContent.trim())
            .filter(Boolean);
    }

    function getArtists() {
        const container = [...document.querySelectorAll(SELECTORS.tagContainer)]
            .find(el => el.textContent.includes('Artists:'));
        let artists = container ? collectNames(container, SELECTORS.artistName) : [];
        if (artists.length === 0) {
            artists = collectNames(document, SELECTORS.artistLink);
        }
        if (artists.length === 1 && SPLIT_RE.test(artists[0])) {
            artists = artists[0].split(SPLIT_RE).map(s => s.trim()).filter(Boolean);
        }
        return [...new Set(artists)];
    }

    function getTitle() {
        const pretty = document.querySelector(SELECTORS.prettyTitle);
        let title = pretty ? pretty.textContent.trim() : '';
        if (!title) {
            const heading = document.querySelector(SELECTORS.title);
            if (heading) {
                title = heading.textContent.trim()
                    .replace(/^\[.*?\]\s*/, '')
                    .replace(/\s*\[Chinese\].*$/i, '')
                    .trim();
            }
        }
        if (title && SPLIT_RE.test(title)) {
            title = title.split(SPLIT_RE)[0].trim();
        }
        return title;
    }

    // ========== 查询与计数 ==========
    const buildQuery = (field, value) => `${field}:"${value}" language:"chinese"`;
    const createSearchUrl = query =>
        `${BASE_URL}/search/?${new URLSearchParams({ q: query })}`;

    async function fetchSearchCount(query, signal, timeout = FETCH_TIMEOUT_MS) {
        if (countCache.has(query)) return countCache.get(query);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        const onAbort = () => controller.abort();
        signal?.addEventListener('abort', onAbort, { once: true });

        try {
            const response = await fetch(createSearchUrl(query), { signal: controller.signal });
            const doc = new DOMParser().parseFromString(await response.text(), 'text/html');
            const grid = doc.querySelector(SELECTORS.galleryGrid);
            const count = grid ? grid.querySelectorAll(SELECTORS.gallery).length : 0;
            countCache.set(query, count);
            return count;
        } catch (err) {
            if (err.name !== 'AbortError') console.warn('[转中文] 获取数量失败:', err);
            return null;
        } finally {
            clearTimeout(timeoutId);
            signal?.removeEventListener('abort', onAbort);
        }
    }

    async function updateButtonCounts() {
        countController?.abort();
        const controller = new AbortController();
        countController = controller;
        const { signal } = controller;

        const artists = getArtists();
        const title = getTitle();
        const targets = [];
        if (artists.length) {
            targets.push({ ...BUTTONS.artist, query: buildQuery('artist', artists[0]) });
        }
        if (title) {
            targets.push({ ...BUTTONS.title, query: buildQuery('title', title) });
        }

        // 先用缓存即时回填，避免按钮文案回退
        for (const target of targets) {
            if (countCache.has(target.query)) {
                setButtonCount(target, countCache.get(target.query));
            }
        }

        // 相同 query 合并为一次请求；按 Map 去重后并发获取
        const pending = new Map();
        for (const target of targets) {
            if (countCache.has(target.query)) continue;
            if (!pending.has(target.query)) pending.set(target.query, []);
            pending.get(target.query).push(target);
        }

        const tasks = [...pending].map(async ([query, list]) => {
            const count = await fetchSearchCount(query, signal);
            if (count === null || signal.aborted) return;   // 丢弃过期结果
            for (const target of list) setButtonCount(target, count);
        });
        if (tasks.length) await Promise.all(tasks);
    }

    function scheduleUpdateButtonCounts() {
        clearTimeout(updateTimer);
        updateTimer = setTimeout(() => idle(updateButtonCounts), DEBOUNCE_MS);
    }

    // ========== 跳转 ==========
    function handleNhentaiArtist() {
        const artists = getArtists();
        if (artists.length === 0) return alert('未找到 Artists 名称');
        artists.forEach((artist, index) => {
            const url = createSearchUrl(buildQuery('artist', artist));
            if (index === 0) window.location.href = url;
            else window.open(url, '_blank');
        });
    }

    function handleNhentaiTitle() {
        const title = getTitle();
        if (!title) return alert('未找到标题');
        window.location.href = createSearchUrl(buildQuery('title', title));
    }

    // ========== 标签翻译 ==========
    function translateOne(el) {
        if (el.dataset.translated) return;
        const original = el.textContent.trim();
        const key = original.toLowerCase();
        if (!hasOwn(tagTranslations, key)) return;
        el.dataset.translated = '1';
        el.dataset.original = original;
        el.textContent = `${tagTranslations[key]} (${original})`;
    }

    // root 可为 document，也可为新增的 DOM 节点，避免每次全文档重扫
    function translateTags(root = document) {
        const type = root.nodeType;
        if (type !== 1 && type !== 9) return;
        if (type === 1 && root.matches(SELECTORS.tagName)) translateOne(root);
        for (const el of root.querySelectorAll(SELECTORS.tagName)) translateOne(el);
    }

    // ========== 按钮挂载 ==========
    function ensureButtons() {
        if (!isSupportedSite()) return;

        const isGalleryPage = !!document.querySelector(SELECTORS.title) ||
                              !!document.querySelector(SELECTORS.tagContainer);
        const configs = [BUTTONS.artist, BUTTONS.title];
        const handlers = [handleNhentaiArtist, handleNhentaiTitle];

        if (!isGalleryPage) {
            configs.forEach(({ id }) => document.getElementById(id)?.remove());
            return;
        }

        let created = false;
        configs.forEach((config, index) => {
            if (document.getElementById(config.id)) return;   // 已挂载则不重建
            document.body.appendChild(createButton(config, handlers[index]));
            created = true;
        });

        // 作者/标题都没变时不再重复发请求
        const countKey = `${getArtists()[0] || ''}|${getTitle() || ''}`;
        if (created || countKey !== lastCountKey) {
            lastCountKey = countKey;
            scheduleUpdateButtonCounts();
        }
        translateTags();
    }

    // ========== SPA / DOM 变化监听 ==========
    function scheduleEnsure() {
        if (ensureScheduled) return;                 // 同一空闲帧内合并重复请求
        ensureScheduled = true;
        idle(() => {
            ensureScheduled = false;
            ensureButtons();
        });
    }

    const observer = new MutationObserver(mutations => {
        const now = Date.now();
        if (now - lastCheck < THROTTLE_MS) return;
        lastCheck = now;

        if (location.href !== lastUrl) {
            lastUrl = location.href;
            scheduleEnsure();
            return;
        }
        const hasButton = [BUTTONS.artist, BUTTONS.title]
            .some(({ id }) => document.getElementById(id));
        if (!hasButton) {
            scheduleEnsure();
            return;
        }

        // 只翻译新增的子树；整页首次翻译由 ensureButtons 负责
        const added = [];
        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
                if (node.nodeType === 1) added.push(node);
            }
        }
        if (added.length) idle(() => added.forEach(node => translateTags(node)));
    });
    observer.observe(document.body, { childList: true, subtree: true });

    for (const method of ['pushState', 'replaceState']) {
        const original = history[method];
        history[method] = function (...args) {
            const result = original.apply(this, args);
            scheduleEnsure();
            return result;
        };
    }
    window.addEventListener('popstate', scheduleEnsure);

    scheduleEnsure();
})();
