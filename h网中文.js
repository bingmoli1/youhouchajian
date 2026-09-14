// ==UserScript==
// @name         跳转到中文（优化版）
// @namespace    http://tampermonkey.net/
// @version      3.3
// @description  修复308重定向及重复请求问题，增加防抖和请求取消
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

    // ========== 缓存（会话级） ==========
    const countCache = new Map();

    // 全局控制器，用于取消上一次未完成的请求
    let globalAbortController = null;

    // 防抖计时器
    let updateTimer = null;

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

    // ========== 使用 URLSearchParams 构造标准URL，防止308重定向 ==========
    function createSearchUrl(query) {
        const params = new URLSearchParams({ q: query });
        // 默认参数格式正确的 URL 如下：
        return `https://nhentai.net/search/?${params.toString()}`;
    }

    // ========== 获取搜索数量（带超时、取消和缓存） ==========
    async function fetchSearchCount(query, signal, timeout = 5000) {
        if (countCache.has(query)) {
            return countCache.get(query);
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        // 将外部的 signal 传递进去
        if (signal) {
            signal.addEventListener('abort', () => controller.abort());
        }

        try {
            const searchUrl = createSearchUrl(query);
            const response = await fetch(searchUrl, { signal: controller.signal });
            clearTimeout(timeoutId);
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const grid = doc.querySelector('.gallery-grid');
            let count = 0;
            if (grid) {
                count = grid.querySelectorAll('.gallery').length;
            }
            countCache.set(query, count);
            return count;
        } catch (e) {
            clearTimeout(timeoutId);
            if (e.name === 'AbortError') {
                console.warn('[转中文] 请求已取消或超时:', query);
            } else {
                console.warn('[转中文] 获取数量失败:', e);
            }
            return null;
        }
    }

    // ========== 更新按钮数字（增加防抖与取消逻辑） ==========
    async function updateButtonCounts() {
        // 取消上一次未完成的请求，确保不会并发重叠
        if (globalAbortController) {
            globalAbortController.abort();
        }
        globalAbortController = new AbortController();
        const { signal } = globalAbortController;

        const artists = getArtists();
        const title = getTitle();

        const promises = [];

        let artistQuery = null;
        let titleQuery = null;
        if (artists.length > 0) {
            artistQuery = `artist:"${artists[0]}" language:"chinese"`;
        }
        if (title) {
            titleQuery = `title:"${title}" language:"chinese"`;
        }

        // 如果两个查询相同，只请求一次
        if (artistQuery && titleQuery && artistQuery === titleQuery) {
            const count = await fetchSearchCount(artistQuery, signal);
            const btnArtist = document.getElementById('tm-translate-btn');
            const btnTitle = document.getElementById('tm-translate-title-btn');
            if (btnArtist && count !== null) btnArtist.textContent = `中文(作者) (${count})`;
            if (btnTitle && count !== null) btnTitle.textContent = `中文(标题) (${count})`;
            return;
        }

        // 并行请求
        if (artistQuery) promises.push(fetchSearchCount(artistQuery, signal));
        if (titleQuery) promises.push(fetchSearchCount(titleQuery, signal));

        if (promises.length === 0) return;

        const results = await Promise.all(promises);

        let idx = 0;
        if (artistQuery) {
            const count = results[idx++];
            const btn = document.getElementById('tm-translate-btn');
            if (btn && count !== null) btn.textContent = `中文(作者) (${count})`;
        }
        if (titleQuery) {
            const count = results[idx++];
            const btn = document.getElementById('tm-translate-title-btn');
            if (btn && count !== null) btn.textContent = `中文(标题) (${count})`;
        }
    }

    // 防抖包装函数
    function scheduleUpdateButtonCounts() {
        clearTimeout(updateTimer);
        updateTimer = setTimeout(updateButtonCounts, 500); // 500毫秒后执行
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

    // ========== 插入按钮 ==========
    function ensureButtons() {
        if (!isSupportedSite()) return;
        const isGalleryPage = !!document.querySelector('h1.title') ||
                              !!document.querySelector('.tag-container.field-name');
        // 移除旧按钮
        document.getElementById('tm-translate-btn')?.remove();
        document.getElementById('tm-translate-title-btn')?.remove();
        if (!isGalleryPage) return;

        const btnArtist = createButton('tm-translate-btn', '中文(作者)', '50px');
        btnArtist.onclick = handleNhentaiArtist;
        const btnTitle = createButton('tm-translate-title-btn', '中文(标题)', '105px');
        btnTitle.onclick = handleNhentaiTitle;

        document.body.appendChild(btnArtist);
        document.body.appendChild(btnTitle);

        // 使用防抖调用
        scheduleUpdateButtonCounts();
    }

    // ========== 监听 SPA 变化（优化逻辑） ==========
    let lastUrl = location.href;
    let isEnsuring = false; // 防止重入

    function safeEnsureButtons() {
        if (isEnsuring) return;
        isEnsuring = true;
        setTimeout(() => {
            ensureButtons();
            isEnsuring = false;
        }, 300);
    }

    const observer = new MutationObserver(() => {
        if (location.href !== lastUrl) {
            lastUrl = location.href;
            setTimeout(safeEnsureButtons, 400);
        } else if (!document.getElementById('tm-translate-btn') &&
                   !document.getElementById('tm-translate-title-btn')) {
            // 如果按钮意外消失，延迟执行一次，避免死循环
            setTimeout(safeEnsureButtons, 1000);
        }
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });

    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    history.pushState = function (...args) {
        originalPushState.apply(this, args);
        setTimeout(safeEnsureButtons, 400);
    };
    history.replaceState = function (...args) {
        originalReplaceState.apply(this, args);
        setTimeout(safeEnsureButtons, 400);
    };
    window.addEventListener('popstate', () => {
        setTimeout(safeEnsureButtons, 400);
    });

    setTimeout(safeEnsureButtons, 600);
})();