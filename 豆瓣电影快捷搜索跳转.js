// ==UserScript==
// @name         豆瓣电影快捷搜索跳转
// @namespace    http://tampermonkey.net/
// @version      1.8
// @description  在豆瓣电影页面的“在哪儿看这部电影”下方添加“楚门的世界”和“bt之家”链接；若页面没有该版块则自动创建，放到 #subject-doulist 上方
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
        var rawTitle = titleElement.textContent.trim();
        // 只取第一个：先按 / 拆分，再按空格拆分，取第一段
        var movieName = rawTitle.split('/')[0].trim().split(/\s+/)[0].trim();
        console.log('原始标题:', rawTitle);
        console.log('电影名称:', movieName);

        // 2. 构造搜索链接
        var searchUrl1 = 'https://www.xn--rhqp87dfoiv9a830g.com/search?q=' + encodeURIComponent(movieName) + '&type=&mode=1';
        var searchUrl2 = 'https://www.1lou.me/search/?q=' + encodeURIComponent(movieName);

        // 3. 定位“在哪儿看这部电影”区域
        var buyInfoContainer = document.querySelector('#buyinfo') || document.querySelector('.gray_ad');

        if (buyInfoContainer) {
            // ========== 页面已有该区域：复用原样式，添加两个链接 ==========
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

            var sampleLink = sampleItem.querySelector('a');
            var linkClass = sampleLink ? sampleLink.className : 'playBtn';

            // 添加第一个链接（楚门的世界）
            var newLi1 = document.createElement('li');
            newLi1.className = sampleItem.className;
            var newLink1 = document.createElement('a');
            newLink1.href = searchUrl1;
            newLink1.target = '_blank';
            newLink1.textContent = '楚门的世界';
            newLink1.className = linkClass;
            newLi1.appendChild(newLink1);
            firstList.insertBefore(newLi1, firstList.firstChild);

            // 添加第二个链接（bt之家）
            var newLi2 = document.createElement('li');
            newLi2.className = sampleItem.className;
            var newLink2 = document.createElement('a');
            newLink2.href = searchUrl2;
            newLink2.target = '_blank';
            newLink2.textContent = 'bt之家';
            newLink2.className = linkClass;
            newLi2.appendChild(newLink2);
            firstList.insertBefore(newLi2, newLi1.nextSibling);

            console.log('两个链接已添加到现有版块');

        } else {
            // ========== 没有该区域：搬到 #subject-doulist 上方 ==========
            console.log('未找到“在哪儿看这部电影”区域，创建新版块');

            var targetEl = document.querySelector('#subject-doulist');
            if (!targetEl) {
                console.log('未找到 #subject-doulist 元素，放弃创建');
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

            // 第一个链接：楚门的世界
            var li1 = document.createElement('li');
            var a1 = document.createElement('a');
            a1.href = searchUrl1;
            a1.target = '_blank';
            a1.textContent = '楚门的世界';
            a1.className = 'playBtn';
            li1.appendChild(a1);
            ul.appendChild(li1);

            // 第二个链接：bt之家
            var li2 = document.createElement('li');
            var a2 = document.createElement('a');
            a2.href = searchUrl2;
            a2.target = '_blank';
            a2.textContent = 'bt之家';
            a2.className = 'playBtn';
            li2.appendChild(a2);
            ul.appendChild(li2);

            section.appendChild(ul);

            // 插入到 #subject-doulist 上方（同级、紧邻前面）
            targetEl.parentNode.insertBefore(section, targetEl);

            // 宽度和 #subject-doulist 保持一致
            requestAnimationFrame(function() {
                var rect = targetEl.getBoundingClientRect();
                if (rect.width > 0) {
                    section.style.width = rect.width + 'px';
                } else {
                    var computed = window.getComputedStyle(targetEl);
                    section.style.width = computed.width;
                }
                console.log('#subject-doulist 宽度:', section.style.width);
            });

            console.log('已创建新版块，插入到 #subject-doulist 上方');
        }
    });
})();