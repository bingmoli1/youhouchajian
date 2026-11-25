// ==UserScript==
// @name         豆瓣电影快捷搜索跳转
// @namespace    http://tampermonkey.net/
// @version      2.1
// @description  在豆瓣电影页面的“在哪儿看这部电影”下方添加“楚门的世界”、“bt之家”、“SeedHub”、“低端影视”和“比特大雄”链接；若页面没有该版块则自动创建，放到 #subject-doulist 上方
// @author       You
// @match        https://movie.douban.com/subject/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const LOG_PREFIX = '[豆瓣跳转]';
    const LINK_MARK = 'data-tm-link';
    const MAX_TITLE_RETRY = 10;
    const log = (...args) => console.log(LOG_PREFIX, ...args);

    // 搜索站配置：新增站点只需在这里加一行
    const SEARCH_SITES = [
        { text: '楚门的世界', url: name => `https://www.xn--rhqp87dfoiv9a830g.com/search?q=${encodeURIComponent(name)}&type=&mode=1` },
        { text: 'bt之家',     url: name => `https://www.1lou.me/search/?q=${encodeURIComponent(name)}` },
        { text: 'SeedHub',    url: name => `https://www.seedhub.cc/s/${encodeURIComponent(name)}/` },
        { text: '低端影视',   url: name => `https://ddys.io/search?q=${encodeURIComponent(name)}` },
        { text: '比特大雄',   url: name => `https://www.btdx8.net/?s=${encodeURIComponent(name)}` },
    ];

    const HAS_CJK = /[\u4e00-\u9fa5]/;
    const HAS_FOREIGN = /[\u3040-\u30ff\uac00-\ud7af\u0400-\u04ffA-Za-z]/;

    // 优先取片名的中文部分：「肖申克的救赎 The Shawshank Redemption」→「肖申克的救赎」；
    // 纯外文片名（如 The Matrix）保留整段，避免被截成一个单词。
    function extractMovieName(rawTitle) {
        const first = rawTitle.split('/')[0].trim();
        if (!HAS_CJK.test(first)) return first;

        const chinese = [];
        for (const part of first.split(/\s+/)) {
            // 碰到日文假名、韩文、西里尔或拉丁字母的段落就停
            if (HAS_FOREIGN.test(part) || !HAS_CJK.test(part)) break;
            chinese.push(part);
        }
        return chinese.join(' ') || first;
    }

    function createAnchor(site, movieName, className) {
        const a = document.createElement('a');
        a.href = site.url(movieName);
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.textContent = site.text;
        a.className = className;
        return a;
    }

    function createItem(site, movieName, template) {
        const li = document.createElement('li');
        li.setAttribute(LINK_MARK, '1');
        if (template) li.className = template.className;
        li.appendChild(createAnchor(site, movieName, template?.linkClass || 'playBtn'));
        return li;
    }

    // 已有版块：复用原样式，一次性插入到列表最前面
    function insertIntoExistingList(list, sampleItem, sampleLink, movieName) {
        const template = {
            className: sampleItem.className,
            linkClass: sampleLink ? sampleLink.className : 'playBtn',
        };
        const frag = document.createDocumentFragment();
        for (const site of SEARCH_SITES) {
            frag.appendChild(createItem(site, movieName, template));
        }
        list.insertBefore(frag, list.firstChild);
        log('链接已添加到现有版块');
    }

    // 没有可用版块：自建一个，放到 #subject-doulist 上方
    function createSection(movieName) {
        const target = document.querySelector('#subject-doulist');
        if (!target) {
            log('未找到 #subject-doulist，放弃创建');
            return;
        }

        const section = document.createElement('div');
        section.className = 'gray_ad';
        // #buyinfo 已存在（但结构不可用）时不重复使用同名 id
        section.id = document.getElementById('buyinfo') ? 'tm-buyinfo' : 'buyinfo';

        const h2 = document.createElement('h2');
        h2.textContent = '在哪儿看这部电影';
        section.appendChild(h2);

        const ul = document.createElement('ul');
        ul.className = 'bs';
        for (const site of SEARCH_SITES) {
            ul.appendChild(createItem(site, movieName, null));
        }
        section.appendChild(ul);

        target.parentNode.insertBefore(section, target);
        log('已创建新版块，插入到 #subject-doulist 上方');

        // 宽度和 #subject-doulist 保持一致
        requestAnimationFrame(() => {
            const rect = target.getBoundingClientRect();
            section.style.width = rect.width > 0 ? `${rect.width}px` : getComputedStyle(target).width;
        });
    }

    function init(attempt = 0) {
        // 已经注入过就退出，避免脚本重复执行造成重复链接
        if (document.querySelector(`li[${LINK_MARK}]`)) return;

        const titleEl = document.querySelector('h1 span[property="v:itemreviewed"]');
        if (!titleEl) {
            if (attempt < MAX_TITLE_RETRY) {
                setTimeout(() => init(attempt + 1), 300);
            } else {
                log('未找到电影标题元素');
            }
            return;
        }

        const movieName = extractMovieName(titleEl.textContent.trim());
        if (!movieName) {
            log('标题为空，跳过');
            return;
        }
        log('电影名称:', movieName);

        const container = document.querySelector('#buyinfo, .gray_ad');
        const list = container?.querySelector('ul.bs, ul');
        const sampleItem = list?.querySelector('li');

        if (list && sampleItem) {
            insertIntoExistingList(list, sampleItem, sampleItem.querySelector('a'), movieName);
            return;
        }

        // 页面没有该版块，或版块结构不可用时，降级为自建
        createSection(movieName);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => init(), { once: true });
    } else {
        init();
    }
})();
