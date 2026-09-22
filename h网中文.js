// ==UserScript==
// @name         h网中文
// @namespace    http://tampermonkey.net/
// @version      4.4
// @description  跳转中文版 + 标签中文翻译（前10页大幅扩充）
// @author       You
// @match        *://nhentai.net/*
// @match        *://*.nhentai.net/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
    'use strict';

    const supportedSites = ['nhentai.net'];
    function isSupportedSite() {
        const hostname = location.hostname.replace(/^www\./, '');
        return supportedSites.some(site => hostname.includes(site));
    }

    // ========== 标签中文翻译字典（前10页大幅扩充，压缩一行） ==========
    const tagTranslations = {"big breasts":"巨乳","sole female":"唯一女性","sole male":"唯一男性","anal":"肛交","nakadashi":"中出","blowjob":"口交","ahegao":"阿嘿颜","bondage":"束缚","multi-work series":"系列作品","x-ray":"透视","milf":"熟女","dark skin":"黑皮","sex toys":"性玩具","netorare":"寝取","impregnation":"受孕","big penis":"大鸡巴","hairy":"多毛","cheating":"出轨","muscle":"肌肉","big ass":"巨尻","mind break":"精神崩溃","rough translation":"生肉翻译","huge breasts":"超巨乳","big areolae":"大乳晕","drugs":"药物","squirting":"潮吹","bbw":"丰满","deepthroat":"深喉","scanmark":"扫描水印","humiliation":"羞辱","big nipples":"大乳头","hidden sex":"隐奸","leg lock":"腿锁","gyaru-oh":"辣妹男","burping":"打嗝","full color":"全彩","mosaic censorship":"有码","uncensored":"无码","lolicon":"萝莉","shotacon":"正太","yaoi":"耽美","yuri":"百合","futanari":"扶她","tentacles":"触手","monster":"怪物","rape":"强奸","mind control":"精神控制","hypnosis":"催眠","incest":"乱伦","mother":"母亲","daughter":"女儿","sister":"姐妹","teacher":"老师","student":"学生","schoolgirl":"女学生","glasses":"眼镜","stockings":"丝袜","pantyhose":"连裤袜","swimsuit":"泳装","lingerie":"内衣","uniform":"制服","maid":"女仆","nurse":"护士","pregnant":"孕妇","lactation":"泌乳","paizuri":"乳交","handjob":"手交","footjob":"足交","cum":"精液","bukkake":"颜射","gokkun":"饮精","double penetration":"双穴","triple penetration":"三穴","fisting":"拳交","prolapse":"脱垂","scat":"排泄","guro":"猎奇","snuff":"虐杀","blood":"出血","torture":"拷问","slave":"奴隶","petplay":"宠物玩法","collar":"项圈","leash":"牵引绳","public":"公开","exhibitionism":"露出","voyeurism":"偷窥","sleeping":"睡眠","drunk":"醉酒","aphrodisiac":"春药","eye-rolling":"翻白眼","tongue":"舌头","drooling":"流口水","sweating":"出汗","body writing":"身体写作","tattoo":"纹身","piercing":"穿孔","scar":"伤疤","amputee":"截肢","disabled":"残疾","old man":"老人","ugly bastard":"丑男","netori":"寝取反向","cuckold":"绿帽","swinging":"交换","prostitution":"卖淫","blackmail":"勒索","filming":"拍摄","camera":"相机","phone":"手机","computer":"电脑","vr":"虚拟现实","ai":"人工智能","robot":"机器人","android":"人造人","cyborg":"半机械人","monster girl":"怪物娘","kemonomimi":"兽耳","catgirl":"猫娘","dog girl":"狗娘","fox girl":"狐娘","bunny girl":"兔女郎","elf":"精灵","dark elf":"暗精灵","demon":"恶魔","angel":"天使","goddess":"女神","witch":"魔女","magical girl":"魔法少女","superhero":"超级英雄","villain":"反派","office lady":"OL","salaryman":"社畜","housewife":"人妻","widow":"寡妇","divorced":"离婚","single mother":"单亲妈妈","tomboy":"假小子","gyaru":"辣妹","ojou":"大小姐","kuudere":"酷娇","tsundere":"傲娇","yandere":"病娇","dandere":"安静","himedere":"公主病","imouto":"妹妹","oneesan":"姐姐","ojisan":"大叔","shota":"正太","loli":"萝莉","bishoujo":"美少女","bishounen":"美少年","trap":"伪娘","crossdressing":"女装","gender bender":"性转","shemale":"人妖","intersex":"双性","hermaphrodite":"雌雄同体","group":"群交","ffm threesome":"双飞","mmf threesome":"双男","small breasts":"贫乳","horns":"角","tail":"尾巴","demon girl":"女恶魔","gag":"口球","very long hair":"超长发","garter belt":"吊袜带","western":"西方","bald":"秃头","stomach deformation":"腹部变形","tanlines":"晒痕","blindfold":"眼罩","webtoon":"条漫","kimono":"和服","virginity":"处女性","rimjob":"舔肛","halo":"光环","inflation":"膨胀","sole dickgirl":"唯一扶她","no penetration":"无插入","nipple stimulation":"刺激乳头","3d":"3D","inseki":"姻亲","bloomers":"灯笼裤","eye-covering bang":"遮眼刘海","slut":"荡妇","business suit":"西装","inverted nipples":"凹陷乳头","breast feeding":"哺乳","leotard":"紧身衣","femdom":"女性主导","maledom":"男性主导","cunnilingus":"舔阴","facesitting":"颜面骑乘","armpit":"腋下","smell":"气味","sweat":"汗水","body odor":"体味","pubic hair":"阴毛","shaved":"剃毛","armpit hair":"腋毛","hairy armpit":"多毛腋下","muscle growth":"肌肉增长","breast expansion":"乳房膨胀","ass expansion":"臀部膨胀","penis growth":"阴茎增长","transformation":"变身","body modification":"身体改造","possession":"附身","corruption":"堕落","exhausted":"精疲力尽","orgasm denial":"禁止高潮","forced orgasm":"强制高潮","multiple orgasms":"多重高潮","female ejaculation":"潮吹","creampie":"中出","cum in mouth":"口内射精","cum on body":"身体射精","cum on face":"颜射","swallow":"吞精","spit":"吐出","cum play":"玩精液","public use":"公共使用","gangbang":"轮奸","train":"电车","chikan":"痴汉","molestation":"性骚扰","voyeur":"偷窥","hidden camera":"隐藏摄像头","recording":"录制","live streaming":"直播","hologram":"全息","ai generated":"AI生成","machine":"机器","tentacle":"触手","slime":"史莱姆","alien":"外星人","succubus":"魅魔","incubus":"男魅魔","fallen angel":"堕落天使","god":"神","sorceress":"女法师","superheroine":"女超级英雄","villainess":"女反派","princess":"公主","queen":"女王","empress":"女皇","noble":"贵族","butler":"管家","master":"主人","mistress":"女主人","pet":"宠物","bdsm":"BDSM","domination":"支配","submission":"服从","sadism":"施虐","masochism":"受虐","spanking":"打屁股","whip":"鞭子","paddle":"拍子","cane":"藤条","rope":"绳子","handcuffs":"手铐","hood":"头套","mask":"面具","choker":"颈圈","harness":"束具","strapon":"假阳具","dildo":"假阳具","vibrator":"振动器","anal beads":"肛珠","butt plug":"肛塞","cock ring":"阴茎环","chastity":"贞操","chastity belt":"贞操带","cage":"笼子","pillory":"枷锁","stocks":"足枷","cross":"十字架","suspension":"悬挂","mummification":"木乃伊","sensory deprivation":"感官剥夺","electricity":"电击","wax play":"滴蜡","needle":"针刺","blood play":"玩血","knife play":"玩刀","asphyxiation":"窒息","breath play":"玩呼吸","water sports":"圣水","urine":"尿液","feces":"粪便","vomit":"呕吐","gore":"血腥","death":"死亡","necrophilia":"恋尸","cannibalism":"食人","vore":"吞食","absorption":"吸收","digestion":"消化","unbirth":"逆生","birth":"分娩","cum inflation":"精液膨胀","belly expansion":"腹部膨胀","animal transformation":"动物变身","monster transformation":"怪物变身","plant transformation":"植物变身","inanimate transformation":"无生命变身","growth":"变大","shrinking":"变小","giant":"巨人","giantess":"女巨人","tiny":"微小","macro":"巨大","micro":"微型","size difference":"体型差","height difference":"身高差","age difference":"年龄差","older female":"年长女性","younger female":"年轻女性","older male":"年长男性","younger male":"年轻男性","mature":"成熟","dilf":"熟男","cougar":"熟女猎人","silver fox":"银狐","elderly":"老年","old woman":"老妇","ugly":"丑陋","handsome":"英俊","beautiful":"美丽","cute":"可爱","sexy":"性感","hot":"火辣","attractive":"有魅力","plain":"普通","average":"普通","fat":"肥胖","obese":"极度肥胖","skinny":"瘦弱","emaciated":"骨瘦如柴","muscular":"肌肉发达","ripped":"健美","toned":"结实","soft":"柔软","plump":"丰满","curvy":"曲线","hourglass":"沙漏型","pear shaped":"梨型","apple shaped":"苹果型","athletic":"运动型","fit":"健康","unfit":"不健康","ponytail":"马尾","twintails":"双马尾","braid":"辫子","long hair":"长发","short hair":"短发","bob cut":"波波头","ahoge":"呆毛","hair bun":"发髻","side ponytail":"侧马尾","drill hair":"钻头卷","curly hair":"卷发","straight hair":"直发","wavy hair":"波浪发","shaved head":"光头","multicolored hair":"多色发","gradient hair":"渐变发","colored inner hair":"内侧染色","unusual pupils":"异瞳","heterochromia":"异色瞳","slit pupils":"竖瞳","heart pupils":"心形瞳","star pupils":"星形瞳","empty eyes":"空洞眼","glowing eyes":"发光眼","closed eyes":"闭眼","one eye closed":"单眼闭","fangs":"尖牙","pointed ears":"尖耳朵","animal ears":"兽耳","cat ears":"猫耳","dog ears":"狗耳","fox ears":"狐耳","bunny ears":"兔耳","wolf ears":"狼耳","elf ears":"精灵耳","demon horns":"恶魔角","wings":"翅膀","angel wings":"天使翅膀","demon wings":"恶魔翅膀","cat tail":"猫尾","dog tail":"狗尾","fox tail":"狐尾","multiple tails":"多尾","lamia":"蛇女","centaur":"半人马","harpy":"鸟人","mermaid":"人鱼","dragon girl":"龙娘","spider girl":"蜘蛛娘","insect girl":"虫娘","plant girl":"植物娘","robot girl":"机器人娘","ghost":"幽灵","zombie":"僵尸","skeleton":"骷髅","undead":"不死","vampire":"吸血鬼","werewolf":"狼人","wizard":"巫师","mage":"法师","priestess":"女祭司","nun":"修女","miko":"巫女","shrine maiden":"巫女","idol":"偶像","singer":"歌手","dancer":"舞者","cheerleader":"啦啦队","athlete":"运动员","swimmer":"游泳选手","gymnast":"体操选手","ballerina":"芭蕾舞演员","model":"模特","actress":"女演员","celebrity":"名人","streamer":"主播","vtuber":"虚拟主播","cosplayer":"角色扮演者","otaku":"御宅族","nerd":"书呆子","geek":"极客","delinquent":"不良","yankee":"不良少女","gang":"帮派","yakuza":"黑帮","mafia":"黑手党","assassin":"刺客","ninja":"忍者","samurai":"武士","knight":"骑士","soldier":"士兵","officer":"军官","general":"将军","commander":"指挥官","pilot":"飞行员","captain":"船长","pirate":"海盗","thief":"小偷","spy":"间谍","detective":"侦探","police":"警察","guard":"守卫","security":"保安","bodyguard":"保镖","mercenary":"雇佣兵","hunter":"猎人","adventurer":"冒险者","explorer":"探险家","scientist":"科学家","researcher":"研究员","surgeon":"外科医生","dentist":"牙医","pharmacist":"药剂师","veterinarian":"兽医","professor":"教授","tutor":"家教","classmate":"同学","senpai":"前辈","kouhai":"后辈","club member":"社团成员","committee":"委员","president":"会长","vice president":"副会长","secretary":"秘书","treasurer":"财务","librarian":"图书管理员","cafeteria":"食堂","janitor":"清洁工","bus driver":"巴士司机","taxi driver":"出租车司机","delivery":"外卖员","waiter":"服务员","waitress":"女服务员","bartender":"调酒师","chef":"厨师","cook":"厨师","baker":"面包师","farmer":"农民","fisherman":"渔夫","miner":"矿工","construction":"建筑工人","office worker":"上班族","businessman":"商人","businesswoman":"女商人","ceo":"CEO","manager":"经理","boss":"老板","employee":"员工","intern":"实习生","part-timer":"兼职","freelancer":"自由职业者","unemployed":"失业","neet":"家里蹲","hikikomori":"家里蹲","homeless":"无家可归","beggar":"乞丐","prostitute":"妓女","sex worker":"性工作者","call girl":"应召女郎","escort":"伴游","stripper":"脱衣舞娘","av actress":"AV女优","porn star":"色情明星","cam girl":"摄像头女孩","sugar daddy":"金主爸爸","sugar mommy":"金主妈妈","kept woman":"包养女性","concubine":"小妾","wife":"妻子","husband":"丈夫","girlfriend":"女朋友","boyfriend":"男朋友","lover":"恋人","ex":"前任","crush":"暗恋对象","rival":"对手","enemy":"敌人","friend":"朋友","best friend":"最好的朋友","childhood friend":"青梅竹马","neighbor":"邻居","roommate":"室友","colleague":"同事","partner":"搭档","teammate":"队友","ally":"盟友","mentor":"导师","apprentice":"学徒","disciple":"弟子","servant":"仆人","owner":"主人","trainer":"训练师","breeder":"育种者","collector":"收藏家","hoarder":"囤积者","schoolgirl uniform":"女学生制服","schoolboy uniform":"男学生制服","school uniform":"校服","tankoubon":"单行本","bbm":"丰满男性","dilf":"熟男","defloration":"破处","full censorship":"全码","unusual pupils":"异瞳","bikini":"比基尼","ponytail":"马尾","twintails":"双马尾","long hair":"长发","short hair":"短发","ahoge":"呆毛","hair bun":"发髻","side ponytail":"侧马尾","drill hair":"钻头卷","curly hair":"卷发","straight hair":"直发","wavy hair":"波浪发","multicolored hair":"多色发","gradient hair":"渐变发","colored inner hair":"内侧染色","heterochromia":"异色瞳","slit pupils":"竖瞳","heart pupils":"心形瞳","star pupils":"星形瞳","empty eyes":"空洞眼","glowing eyes":"发光眼","closed eyes":"闭眼","one eye closed":"单眼闭","fangs":"尖牙","pointed ears":"尖耳朵","animal ears":"兽耳","cat ears":"猫耳","dog ears":"狗耳","fox ears":"狐耳","bunny ears":"兔耳","wolf ears":"狼耳","elf ears":"精灵耳","demon horns":"恶魔角","wings":"翅膀","angel wings":"天使翅膀","demon wings":"恶魔翅膀","cat tail":"猫尾","dog tail":"狗尾","fox tail":"狐尾","multiple tails":"多尾","lamia":"蛇女","centaur":"半人马","harpy":"鸟人","mermaid":"人鱼","dragon girl":"龙娘","spider girl":"蜘蛛娘","insect girl":"虫娘","plant girl":"植物娘","robot girl":"机器人娘","ghost":"幽灵","zombie":"僵尸","skeleton":"骷髅","undead":"不死","vampire":"吸血鬼","werewolf":"狼人","wizard":"巫师","mage":"法师","priestess":"女祭司","nun":"修女","miko":"巫女","shrine maiden":"巫女","idol":"偶像","singer":"歌手","dancer":"舞者","cheerleader":"啦啦队","athlete":"运动员","swimmer":"游泳选手","gymnast":"体操选手","ballerina":"芭蕾舞演员","model":"模特","actress":"女演员","celebrity":"名人","streamer":"主播","vtuber":"虚拟主播","cosplayer":"角色扮演者","otaku":"御宅族","nerd":"书呆子","geek":"极客","delinquent":"不良","yankee":"不良少女","gang":"帮派","yakuza":"黑帮","mafia":"黑手党","assassin":"刺客","ninja":"忍者","samurai":"武士","knight":"骑士","soldier":"士兵","officer":"军官","general":"将军","commander":"指挥官","pilot":"飞行员","captain":"船长","pirate":"海盗","thief":"小偷","spy":"间谍","detective":"侦探","police":"警察","guard":"守卫","security":"保安","bodyguard":"保镖","mercenary":"雇佣兵","hunter":"猎人","adventurer":"冒险者","explorer":"探险家","scientist":"科学家","researcher":"研究员","surgeon":"外科医生","dentist":"牙医","pharmacist":"药剂师","veterinarian":"兽医","professor":"教授","tutor":"家教","classmate":"同学","senpai":"前辈","kouhai":"后辈","club member":"社团成员","committee":"委员","president":"会长","vice president":"副会长","secretary":"秘书","treasurer":"财务","librarian":"图书管理员","cafeteria":"食堂","janitor":"清洁工","bus driver":"巴士司机","taxi driver":"出租车司机","delivery":"外卖员","waiter":"服务员","waitress":"女服务员","bartender":"调酒师","chef":"厨师","cook":"厨师","baker":"面包师","farmer":"农民","fisherman":"渔夫","miner":"矿工","construction":"建筑工人","office worker":"上班族","businessman":"商人","businesswoman":"女商人","ceo":"CEO","manager":"经理","boss":"老板","employee":"员工","intern":"实习生","part-timer":"兼职","freelancer":"自由职业者","unemployed":"失业","neet":"家里蹲","hikikomori":"家里蹲","homeless":"无家可归","beggar":"乞丐","prostitute":"妓女","sex worker":"性工作者","call girl":"应召女郎","escort":"伴游","stripper":"脱衣舞娘","av actress":"AV女优","porn star":"色情明星","cam girl":"摄像头女孩","sugar daddy":"金主爸爸","sugar mommy":"金主妈妈","kept woman":"包养女性","concubine":"小妾","wife":"妻子","husband":"丈夫","girlfriend":"女朋友","boyfriend":"男朋友","lover":"恋人","ex":"前任","crush":"暗恋对象","rival":"对手","enemy":"敌人","friend":"朋友","best friend":"最好的朋友","childhood friend":"青梅竹马","neighbor":"邻居","roommate":"室友","colleague":"同事","partner":"搭档","teammate":"队友","ally":"盟友","mentor":"导师","apprentice":"学徒","disciple":"弟子","servant":"仆人","owner":"主人","trainer":"训练师","breeder":"育种者","collector":"收藏家","hoarder":"囤积者","schoolgirl uniform":"女学生制服","schoolboy uniform":"男学生制服","school uniform":"校服","tankoubon":"单行本","bbm":"丰满男性","dilf":"熟男","defloration":"破处","full censorship":"全码","unusual pupils":"异瞳","bikini":"比基尼","ponytail":"马尾","twintails":"双马尾","long hair":"长发","short hair":"短发","ahoge":"呆毛","hair bun":"发髻","side ponytail":"侧马尾","drill hair":"钻头卷","curly hair":"卷发","straight hair":"直发","wavy hair":"波浪发","multicolored hair":"多色发","gradient hair":"渐变发","colored inner hair":"内侧染色","heterochromia":"异色瞳","slit pupils":"竖瞳","heart pupils":"心形瞳","star pupils":"星形瞳","empty eyes":"空洞眼","glowing eyes":"发光眼","closed eyes":"闭眼","one eye closed":"单眼闭","fangs":"尖牙","pointed ears":"尖耳朵","animal ears":"兽耳","cat ears":"猫耳","dog ears":"狗耳","fox ears":"狐耳","bunny ears":"兔耳","wolf ears":"狼耳","elf ears":"精灵耳","demon horns":"恶魔角","wings":"翅膀","angel wings":"天使翅膀","demon wings":"恶魔翅膀","cat tail":"猫尾","dog tail":"狗尾","fox tail":"狐尾","multiple tails":"多尾","lamia":"蛇女","centaur":"半人马","harpy":"鸟人","mermaid":"人鱼","dragon girl":"龙娘","spider girl":"蜘蛛娘","insect girl":"虫娘","plant girl":"植物娘","robot girl":"机器人娘","ghost":"幽灵","zombie":"僵尸","skeleton":"骷髅","undead":"不死","vampire":"吸血鬼","werewolf":"狼人","wizard":"巫师","mage":"法师","priestess":"女祭司","nun":"修女","miko":"巫女","shrine maiden":"巫女","idol":"偶像","singer":"歌手","dancer":"舞者","cheerleader":"啦啦队","athlete":"运动员","swimmer":"游泳选手","gymnast":"体操选手","ballerina":"芭蕾舞演员","model":"模特","actress":"女演员","celebrity":"名人","streamer":"主播","vtuber":"虚拟主播","cosplayer":"角色扮演者","otaku":"御宅族","nerd":"书呆子","geek":"极客","delinquent":"不良","yankee":"不良少女","gang":"帮派","yakuza":"黑帮","mafia":"黑手党","assassin":"刺客","ninja":"忍者","samurai":"武士","knight":"骑士","soldier":"士兵","officer":"军官","general":"将军","commander":"指挥官","pilot":"飞行员","captain":"船长","pirate":"海盗","thief":"小偷","spy":"间谍","detective":"侦探","police":"警察","guard":"守卫","security":"保安","bodyguard":"保镖","mercenary":"雇佣兵","hunter":"猎人","adventurer":"冒险者","explorer":"探险家","scientist":"科学家","researcher":"研究员","surgeon":"外科医生","dentist":"牙医","pharmacist":"药剂师","veterinarian":"兽医","professor":"教授","tutor":"家教","classmate":"同学","senpai":"前辈","kouhai":"后辈","club member":"社团成员","committee":"委员","president":"会长","vice president":"副会长","secretary":"秘书","treasurer":"财务","librarian":"图书管理员","cafeteria":"食堂","janitor":"清洁工","bus driver":"巴士司机","taxi driver":"出租车司机","delivery":"外卖员","waiter":"服务员","waitress":"女服务员","bartender":"调酒师","chef":"厨师","cook":"厨师","baker":"面包师","farmer":"农民","fisherman":"渔夫","miner":"矿工","construction":"建筑工人","office worker":"上班族","businessman":"商人","businesswoman":"女商人","ceo":"CEO","manager":"经理","boss":"老板","employee":"员工","intern":"实习生","part-timer":"兼职","freelancer":"自由职业者","unemployed":"失业","neet":"家里蹲","hikikomori":"家里蹲","homeless":"无家可归","beggar":"乞丐","prostitute":"妓女","sex worker":"性工作者","call girl":"应召女郎","escort":"伴游","stripper":"脱衣舞娘","av actress":"AV女优","porn star":"色情明星","cam girl":"摄像头女孩","sugar daddy":"金主爸爸","sugar mommy":"金主妈妈","kept woman":"包养女性","concubine":"小妾","wife":"妻子","husband":"丈夫","girlfriend":"女朋友","boyfriend":"男朋友","lover":"恋人","ex":"前任","crush":"暗恋对象","rival":"对手","enemy":"敌人","friend":"朋友","best friend":"最好的朋友","childhood friend":"青梅竹马","neighbor":"邻居","roommate":"室友","colleague":"同事","partner":"搭档","teammate":"队友","ally":"盟友","mentor":"导师","apprentice":"学徒","disciple":"弟子","servant":"仆人","owner":"主人","trainer":"训练师","breeder":"育种者","collector":"收藏家","hoarder":"囤积者"};

    // ========== 缓存（会话级） ==========
    const countCache = new Map();
    let globalAbortController = null;
    let updateTimer = null;
    const idle = window.requestIdleCallback || (cb => setTimeout(cb, 1));

    // ========== 按钮创建 ==========
    function createButton(id, text, top) {
        const btn = document.createElement('button');
        btn.id = id;
        btn.textContent = text;
        Object.assign(btn.style, {
            position: 'fixed',
            top: top,
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
        });
        btn.onmouseenter = () => {
            btn.style.backgroundColor = '#c0392b';
            btn.style.transform = 'scale(1.08)';
        };
        btn.onmouseleave = () => {
            btn.style.backgroundColor = '#e74c3c';
            btn.style.transform = 'scale(1)';
        };
        return btn;
    }

    // ========== 提取作者 ==========
    function getArtists() {
        let artists = [];
        const containers = document.querySelectorAll('.tag-container.field-name');
        for (const container of containers) {
            if (container.textContent.includes('Artists:')) {
                const nameEls = container.querySelectorAll('.name.svelte-mmywhv, .name');
                nameEls.forEach(el => {
                    const name = el.textContent.trim();
                    if (name) artists.push(name);
                });
                break;
            }
        }
        if (artists.length === 0) {
            document.querySelectorAll('a[href*="/artist/"] .name.svelte-mmywhv, a[href*="/artist/"] .name')
                .forEach(el => {
                    const name = el.textContent.trim();
                    if (name) artists.push(name);
                });
        }
        if (artists.length === 1 && (artists[0].includes('|') || artists[0].includes('∣'))) {
            artists = artists[0].split(/[|∣]/).map(s => s.trim()).filter(Boolean);
        }
        return [...new Set(artists)];
    }

    // ========== 提取标题 ==========
    function getTitle() {
        let title = null;
        const prettyEl = document.querySelector('h1.title .pretty, h1.title span.pretty');
        if (prettyEl) {
            title = prettyEl.textContent.trim();
        }
        if (!title) {
            const h1 = document.querySelector('h1.title');
            if (h1) {
                title = h1.textContent.trim();
                title = title.replace(/^\[.*?\]\s*/, '').replace(/\s*\[Chinese\].*$/i, '').trim();
            }
        }
        if (title && (title.includes('|') || title.includes('∣'))) {
            title = title.split(/[|∣]/)[0].trim();
        }
        return title;
    }

    // ========== 构造标准URL ==========
    function createSearchUrl(query) {
        const params = new URLSearchParams({ q: query });
        return `https://nhentai.net/search/?${params.toString()}`;
    }

    // ========== 获取搜索数量 ==========
    async function fetchSearchCount(query, signal, timeout = 5000) {
        if (countCache.has(query)) {
            return countCache.get(query);
        }
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        let onAbort = null;
        if (signal) {
            onAbort = () => controller.abort();
            signal.addEventListener('abort', onAbort, { once: true });
        }
        try {
            const searchUrl = createSearchUrl(query);
            const response = await fetch(searchUrl, { signal: controller.signal });
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const grid = doc.querySelector('.gallery-grid');
            const count = grid ? grid.querySelectorAll('.gallery').length : 0;
            countCache.set(query, count);
            return count;
        } catch (e) {
            if (e.name !== 'AbortError') {
                console.warn('[转中文] 获取数量失败:', e);
            }
            return null;
        } finally {
            clearTimeout(timeoutId);
            if (signal && onAbort) {
                signal.removeEventListener('abort', onAbort);
            }
        }
    }

    // ========== 更新按钮数字 ==========
    async function updateButtonCounts() {
        if (globalAbortController) globalAbortController.abort();
        globalAbortController = new AbortController();
        const { signal } = globalAbortController;

        const artists = getArtists();
        const title = getTitle();
        let artistQuery = null;
        let titleQuery = null;

        if (artists.length > 0) {
            artistQuery = `artist:"${artists[0]}" language:"chinese"`;
        }
        if (title) {
            titleQuery = `title:"${title}" language:"chinese"`;
        }

        const btnArtist = document.getElementById('tm-translate-btn');
        const btnTitle = document.getElementById('tm-translate-title-btn');

        if (artistQuery && countCache.has(artistQuery) && btnArtist) {
            btnArtist.textContent = `作者 (${countCache.get(artistQuery)})`;
        }
        if (titleQuery && countCache.has(titleQuery) && btnTitle) {
            btnTitle.textContent = `标题 (${countCache.get(titleQuery)})`;
        }

        if (artistQuery && titleQuery && artistQuery === titleQuery) {
            if (countCache.has(artistQuery)) return;
            const count = await fetchSearchCount(artistQuery, signal);
            if (count === null) return;
            if (btnArtist) btnArtist.textContent = `作者 (${count})`;
            if (btnTitle) btnTitle.textContent = `标题 (${count})`;
            return;
        }

        const tasks = [];
        if (artistQuery && !countCache.has(artistQuery)) {
            tasks.push(fetchSearchCount(artistQuery, signal).then(count => {
                if (count !== null && btnArtist) btnArtist.textContent = `作者 (${count})`;
            }));
        }
        if (titleQuery && !countCache.has(titleQuery)) {
            tasks.push(fetchSearchCount(titleQuery, signal).then(count => {
                if (count !== null && btnTitle) btnTitle.textContent = `标题 (${count})`;
            }));
        }
        if (tasks.length) await Promise.all(tasks);
    }

    function scheduleUpdateButtonCounts() {
        clearTimeout(updateTimer);
        updateTimer = setTimeout(() => {
            idle(() => updateButtonCounts());
        }, 300);
    }

    // ========== 跳转处理 ==========
    function handleNhentaiArtist() {
        const artists = getArtists();
        if (artists.length === 0) {
            alert('未找到 Artists 名称');
            return;
        }
        artists.forEach((artist, index) => {
            const query = `artist:"${artist}" language:"chinese"`;
            const searchUrl = createSearchUrl(query);
            if (index === 0) {
                window.location.href = searchUrl;
            } else {
                window.open(searchUrl, '_blank');
            }
        });
    }

    function handleNhentaiTitle() {
        const title = getTitle();
        if (!title) {
            alert('未找到标题');
            return;
        }
        const query = `title:"${title}" language:"chinese"`;
        const searchUrl = createSearchUrl(query);
        window.location.href = searchUrl;
    }

    // ========== 翻译标签 ==========
    function translateTags() {
        document.querySelectorAll('.tagchip .name, a.tag .name, .tag .name').forEach(el => {
            if (el.dataset.translated) return;
            const original = el.textContent.trim().toLowerCase();
            const translation = tagTranslations[original];
            if (translation) {
                el.dataset.translated = '1';
                el.dataset.original = el.textContent.trim();
                el.textContent = `${translation} (${el.dataset.original})`;
            }
        });
    }

    // ========== 插入按钮 ==========
    function ensureButtons() {
        if (!isSupportedSite()) return;

        const isGalleryPage = !!document.querySelector('h1.title') ||
                              !!document.querySelector('.tag-container.field-name');

        document.getElementById('tm-translate-btn')?.remove();
        document.getElementById('tm-translate-title-btn')?.remove();

        if (!isGalleryPage) return;

        const btnArtist = createButton('tm-translate-btn', '作者', '50px');
        btnArtist.onclick = handleNhentaiArtist;

        const btnTitle = createButton('tm-translate-title-btn', '标题', '105px');
        btnTitle.onclick = handleNhentaiTitle;

        document.body.appendChild(btnArtist);
        document.body.appendChild(btnTitle);

        scheduleUpdateButtonCounts();
        translateTags();
    }

    // ========== SPA 监听 ==========
    let lastUrl = location.href;
    let isEnsuring = false;
    let pendingCheck = false;

    function safeEnsureButtons() {
        if (isEnsuring) {
            pendingCheck = true;
            return;
        }
        isEnsuring = true;
        ensureButtons();
        isEnsuring = false;
        if (pendingCheck) {
            pendingCheck = false;
            idle(safeEnsureButtons);
        }
    }

    let lastCheck = 0;
    const THROTTLE = 200;
    const observer = new MutationObserver(() => {
        const now = Date.now();
        if (now - lastCheck < THROTTLE) return;
        lastCheck = now;

        if (location.href !== lastUrl) {
            lastUrl = location.href;
            idle(safeEnsureButtons);
        } else if (!document.getElementById('tm-translate-btn') &&
                   !document.getElementById('tm-translate-title-btn')) {
            idle(safeEnsureButtons);
        } else {
            idle(translateTags);
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    history.pushState = function (...args) {
        originalPushState.apply(this, args);
        idle(safeEnsureButtons);
    };
    history.replaceState = function (...args) {
        originalReplaceState.apply(this, args);
        idle(safeEnsureButtons);
    };
    window.addEventListener('popstate', () => idle(safeEnsureButtons));

    idle(safeEnsureButtons);
})();