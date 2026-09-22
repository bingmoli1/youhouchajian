// ==UserScript==
// @name         豆瓣电影快捷搜索跳转
// @namespace    http://tampermonkey.net/
// @version      1.9
// @description  在豆瓣电影页面的“在哪儿看这部电影”下方添加“楚门的世界”、“bt之家”和“SeedHub”链接；若页面没有该版块则自动创建，放到 #subject-doulist 上方
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
        var searchUrl3 = 'https://www.seedhub.cc/s/' + encodeURIComponent(movieName) + '/';

        // 定义要添加的链接数据
        var linksToAdd = [
            { text: '楚门的世界', url: searchUrl1 },
            { text: 'bt之家', url: searchUrl2 },
            { text: 'SeedHub', url: searchUrl3 }
        ];

        // 3. 定位“在哪儿看这部电影”区域
        var buyInfoContainer = document.querySelector('#buyinfo') || document.querySelector('.gray_ad');

        if (buyInfoContainer) {
            // ========== 页面已有该区域：复用原样式，添加链接 ==========
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

            // 逐个插入到列表最前面（倒序插入以保持显示顺序）
            for (var i = linksToAdd.length - 1; i >= 0; i--) {
                var item = linksToAdd[i];
                var newLi = document.createElement('li');
                newLi.className = sampleItem.className;
                var newLink = document.createElement('a');
                newLink.href = item.url;
                newLink.target = '_blank';
                newLink.textContent = item.text;
                newLink.className = linkClass;
                newLi.appendChild(newLink);
                firstList.insertBefore(newLi, firstList.firstChild);
            }

            console.log('链接已添加到现有版块');

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

            // 添加所有链接
            linksToAdd.forEach(function(item) {
                var li = document.createElement('li');
                var a = document.createElement('a');
                a.href = item.url;
                a.target = '_blank';
                a.textContent = item.text;
                a.className = 'playBtn';
                li.appendChild(a);
                ul.appendChild(li);
            });

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