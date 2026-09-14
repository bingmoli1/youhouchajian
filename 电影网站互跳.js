// ==UserScript==
// @name         豆瓣电影快捷搜索跳转
// @namespace    http://tampermonkey.net/
// @version      1.4
// @description  在豆瓣电影页面的“在哪儿看这部电影”下方添加一个“楚门的世界”链接，点击跳转到指定搜索网站；若页面没有该版块则自动创建，放到 .ticket 上方并保持同宽
// @author       You
// @match        https://movie.douban.com/subject/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    window.addEventListener('load', function() {
        // 1. 获取电影名称
        var titleElement = document.querySelector('h1 span[property="v:itemreviewed"]');
        if (!titleElement) {
            console.log('未找到电影标题元素');
            return;
        }
        var movieName = titleElement.textContent.trim();
        console.log('电影名称:', movieName);

        // 2. 构造搜索链接
        var searchUrl = 'https://www.xn--rhqp87dfoiv9a830g.com/search?q=' + encodeURIComponent(movieName) + '&type=&mode=1';

        // 3. 定位“在哪儿看这部电影”区域
        var buyInfoContainer = document.querySelector('#buyinfo') || document.querySelector('.gray_ad');

        if (buyInfoContainer) {
            // ========== 原有逻辑：页面已有该区域，完全按你原来的代码处理 ==========
            var firstList = buyInfoContainer.querySelector('ul.bs') || buyInfoContainer.querySelector('ul');
            if (!firstList) {
                console.log('未找到播放源列表');
                return;
            }

            var sampleItem = firstList.querySelector('li');
            if (!sampleItem) {
                console.log('未找到示例列表项');
                return;
            }

            var newLi = document.createElement('li');
            newLi.className = sampleItem.className;

            var newLink = document.createElement('a');
            newLink.href = searchUrl;
            newLink.target = '_blank';
            newLink.textContent = '楚门的世界';

            var sampleLink = sampleItem.querySelector('a');
            if (sampleLink) {
                newLink.className = sampleLink.className;
            } else {
                newLink.className = 'playBtn';
            }

            newLi.appendChild(newLink);
            firstList.insertBefore(newLi, firstList.firstChild);
            console.log('“楚门的世界”链接已添加');

        } else {
            // ========== 没有该区域：搬到 .ticket 上方，宽度对齐 ==========
            console.log('未找到“在哪儿看这部电影”区域，创建新版块');

            // 找到 .ticket 元素
            var ticketEl = document.querySelector('.ticket');
            if (!ticketEl) {
                console.log('未找到 .ticket 元素，放弃创建');
                return;
            }

            // 创建外层容器
            var section = document.createElement('div');
            section.id = 'buyinfo';
            section.className = 'gray_ad';

            // 标题
            var h2 = document.createElement('h2');
            h2.textContent = '在哪儿看这部电影';
            section.appendChild(h2);

            // 列表
            var ul = document.createElement('ul');
            ul.className = 'bs';

            // 列表项
            var li = document.createElement('li');
            var a = document.createElement('a');
            a.href = searchUrl;
            a.target = '_blank';
            a.textContent = '楚门的世界';
            a.className = 'playBtn';

            li.appendChild(a);
            ul.appendChild(li);
            section.appendChild(ul);

            // 插入到 .ticket 上方（同级、紧邻前面）
            ticketEl.parentNode.insertBefore(section, ticketEl);

            // 宽度和 .ticket 保持一致
            // 用 requestAnimationFrame 等布局稳定后再量，保证拿到准确宽度
            requestAnimationFrame(function() {
                var rect = ticketEl.getBoundingClientRect();
                if (rect.width > 0) {
                    section.style.width = rect.width + 'px';
                } else {
                    // 拿不到实际像素时退回 CSS 方式
                    var computed = window.getComputedStyle(ticketEl);
                    section.style.width = computed.width;
                }
                console.log('.ticket 宽度:', section.style.width);
            });

            console.log('已创建新版块，插入到 .ticket 上方');
        }
    });
})();