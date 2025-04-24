// ==UserScript==
// @name         quake 增强
// @namespace    http://tampermonkey.net/
// @version      2025-04-23 v2.0
// @description  quake 增强
// @author       Tajang
// @match        https://quake.360.net/quake/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=360.net
// @grant        GM_xmlhttpRequest
// @connect      *
// @license      GPL-3.0
// ==/UserScript==

(function() {
    'use strict';
    window.addEventListener('load', function() {
        console.log("开始启动");
        const outputButton = document.querySelector('.picker-box button');
        const preposition = document.querySelector('.model-box');

        if (outputButton) {
            const openButton = outputButton.cloneNode(true);
            openButton.innerHTML = '打开全部资产';
            openButton.type = 'button';
            openButton.style.marginLeft = '1em';
            openButton.style.display = 'block';  // 设置为块级元素
            openButton.style.marginBottom = '8px';  // 添加下边距

            // 添加探测存活按钮
            function addCheckAliveButton() {
                if (document.querySelector('.check-alive-btn')) return;

                // 创建按钮容器
                const buttonContainer = document.createElement('div');
                buttonContainer.className = 'custom-buttons';
                buttonContainer.style.display = 'inline-block';
                buttonContainer.style.marginLeft = '10px';
                buttonContainer.style.verticalAlign = 'middle';

                // 创建打开全部按钮
                const openButton = document.createElement('button');
                openButton.className = 'el-button el-button--primary el-button--small';
                openButton.innerHTML = '打开全部';
                openButton.style.marginRight = '10px';

                // 创建探测存活按钮
                const aliveButton = document.createElement('button');
                aliveButton.className = 'el-button el-button--primary el-button--small check-alive-btn';
                aliveButton.style.marginRight = '10px';

                // 添加CSS样式
                const style = document.createElement('style');
                style.textContent = `
                    @keyframes rotate {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                    .custom-buttons {
                        display: inline-block;
                        vertical-align: middle;
                    }
                    .custom-buttons button {
                        margin-right: 10px;
                    }
                    .custom-buttons button:last-child {
                        margin-right: 0;
                    }
                    .check-alive-btn.checking {
                        opacity: 0.8;
                        cursor: not-allowed;
                    }
                `;
                document.head.appendChild(style);

                // 添加loading状态的span
                const loadingSpan = document.createElement('span');
                loadingSpan.className = 'loading-icon';
                loadingSpan.style.display = 'none';
                loadingSpan.style.marginRight = '5px';
                loadingSpan.innerHTML = '⌛';
                loadingSpan.style.animation = 'rotate 1s infinite linear';

                const textSpan = document.createElement('span');
                textSpan.innerHTML = '探测存活';

                aliveButton.appendChild(loadingSpan);
                aliveButton.appendChild(textSpan);

                // 添加点击事件
                openButton.addEventListener('click', function() {
                    //查找两种模式下含有跳转按钮的div
                    var ClassElements = document.querySelectorAll('.item-top-line');
                    var TableElements = document.querySelectorAll('.el-table__fixed-right');

                    // 遍历每个 大类元素，查找所有<a>标签，打开所有<a>里的链接

                    //经典模式
                    if (ClassElements){
                        ClassElements.forEach(function(itemTopLine) {
                            var aElements = itemTopLine.querySelectorAll('a');
                            aElements.forEach(function(a) {
                                console.log(a);
                                window.open(a.href, '_blank');
                            });
                        });
                    }

                    //列表模式
                    if (TableElements){
                        TableElements.forEach(function(rightLine) {
                            var bElements = rightLine.querySelectorAll('a');
                            bElements.forEach(function(a) {
                                console.log(a);
                                window.open(a.href, '_blank');
                            });
                        });
                    }
                });

                // 添加探测存活点击事件
                aliveButton.addEventListener('click', async function() {
                    // 如果正在检测中，则返回
                    if (aliveButton.classList.contains('checking')) {
                        return;
                    }

                    // 设置检测中状态
                    aliveButton.classList.add('checking');
                    loadingSpan.style.display = 'inline-block';
                    textSpan.innerHTML = '检测中...';

                    const topLeftElements = document.querySelectorAll('.top-left');
                    let checkedCount = 0;
                    const totalCount = topLeftElements.length;

                    for (const topLeft of topLeftElements) {
                        const visitButton = topLeft.querySelector('.visit-domain-btn');
                        if (!visitButton) {
                            checkedCount++;
                            continue;
                        }

                        // 清除之前的检测标记
                        const oldTag = visitButton.querySelector('span');
                        if (oldTag) {
                            oldTag.remove();
                        }

                        const domainSpan = topLeft.querySelector('.copy_btn');
                        if (!domainSpan) {
                            checkedCount++;
                            continue;
                        }

                        const getFullUrl = () => {
                            const domain = domainSpan.getAttribute('data-clipboard-text').split(':')[0];
                            const protocolElement = topLeft.closest('.item-container').querySelector('.server-protocol');
                            let protocol = protocolElement ? protocolElement.textContent.trim() : 'http';
                            const portElement = topLeft.closest('.item-container').querySelector('.port.common-tag');
                            const port = portElement ? portElement.textContent.replace(/[^0-9]/g, '') : '';

                            // 如果是非HTTP/HTTPS协议，返回null
                            if (!protocol.includes('http') && !protocol.includes('https') &&
                                !protocol.includes('ssl') && port !== '80' && port !== '443') {
                                return null;
                            }

                            if (protocol.includes('ssl') || protocol.includes('https') || port === '443') {
                                protocol = 'https';
                            } else {
                                protocol = 'http';
                            }

                            const showPort = !((protocol === 'http' && port === '80') || (protocol === 'https' && port === '443'));
                            return `${protocol}://${domain}${showPort && port ? ':' + port : ''}`;
                        };

                        try {
                            const url = getFullUrl();
                            // 如果不是HTTP/HTTPS协议，跳过检测
                            if (!url) {
                                checkedCount++;
                                // 更新进度
                                textSpan.innerHTML = `检测中 ${Math.floor((checkedCount/totalCount) * 100)}%`;

                                // 检测完成后重置按钮状态
                                if (checkedCount === totalCount) {
                                    aliveButton.classList.remove('checking');
                                    loadingSpan.style.display = 'none';
                                    textSpan.innerHTML = '探测存活';
                                }
                                continue;
                            }

                            // 使用GM_xmlhttpRequest发送GET请求
                            GM_xmlhttpRequest({
                                method: "GET",
                                url: url,
                                timeout: 5000,  // 5秒超时
                                onload: function(response) {
                                    checkedCount++;
                                    // 更新进度
                                    textSpan.innerHTML = `检测中 ${Math.floor((checkedCount/totalCount) * 100)}%`;

                                    const aliveTag = document.createElement('span');
                                    aliveTag.style.marginLeft = '5px';
                                    aliveTag.style.fontWeight = 'bold';

                                    // 根据状态码显示不同的图标和颜色
                                    if (response.status >= 200 && response.status < 400) {
                                        // 200-400 绿钩
                                        aliveTag.innerHTML = '✓';
                                        aliveTag.style.color = '#4CAF50';
                                    } else if (response.status >= 400 && response.status < 500) {
                                        // 400-500 红钩
                                        aliveTag.innerHTML = '✓';
                                        aliveTag.style.color = '#FF0000';
                                    } else {
                                        // 其他状态码 感叹号
                                        aliveTag.innerHTML = '!';
                                        aliveTag.style.color = '#FFA500';
                                    }

                                    aliveTag.title = `状态码: ${response.status}`;
                                    visitButton.appendChild(aliveTag);

                                    // 检测完成后重置按钮状态
                                    if (checkedCount === totalCount) {
                                        aliveButton.classList.remove('checking');
                                        loadingSpan.style.display = 'none';
                                        textSpan.innerHTML = '探测存活';
                                    }
                                },
                                onerror: function(error) {
                                    checkedCount++;
                                    // 更新进度
                                    textSpan.innerHTML = `检测中 ${Math.floor((checkedCount/totalCount) * 100)}%`;

                                    console.log(`Failed to check ${url}:`, error);
                                    const failTag = document.createElement('span');
                                    failTag.innerHTML = '✗';  // 无响应显示叉号
                                    failTag.style.color = '#FF0000';
                                    failTag.style.marginLeft = '5px';
                                    failTag.style.fontWeight = 'bold';
                                    failTag.title = '请求失败';
                                    visitButton.appendChild(failTag);

                                    // 检测完成后重置按钮状态
                                    if (checkedCount === totalCount) {
                                        aliveButton.classList.remove('checking');
                                        loadingSpan.style.display = 'none';
                                        textSpan.innerHTML = '探测存活';
                                    }
                                },
                                ontimeout: function() {
                                    checkedCount++;
                                    // 更新进度
                                    textSpan.innerHTML = `检测中 ${Math.floor((checkedCount/totalCount) * 100)}%`;

                                    console.log(`Timeout checking ${url}`);
                                    const timeoutTag = document.createElement('span');
                                    timeoutTag.innerHTML = '!';
                                    timeoutTag.style.color = '#FFA500';
                                    timeoutTag.style.marginLeft = '5px';
                                    timeoutTag.style.fontWeight = 'bold';
                                    timeoutTag.title = '请求超时';
                                    visitButton.appendChild(timeoutTag);

                                    // 检测完成后重置按钮状态
                                    if (checkedCount === totalCount) {
                                        aliveButton.classList.remove('checking');
                                        loadingSpan.style.display = 'none';
                                        textSpan.innerHTML = '探测存活';
                                    }
                                }
                            });
                        } catch (error) {
                            checkedCount++;
                            console.log(`Error checking ${url}:`, error);

                            // 检测完成后重置按钮状态
                            if (checkedCount === totalCount) {
                                aliveButton.classList.remove('checking');
                                loadingSpan.style.display = 'none';
                                textSpan.innerHTML = '探测存活';
                            }
                        }
                    }
                });

                // 将按钮添加到容器中
                buttonContainer.appendChild(openButton);
                buttonContainer.appendChild(aliveButton);

                // 找到目标位置并插入按钮容器
                const targetDiv = document.querySelector('.des-container div[style="display: inline-block;"]');
                if (targetDiv) {
                    targetDiv.parentNode.insertBefore(buttonContainer, targetDiv.nextSibling);
                }

                return {button: aliveButton, container: buttonContainer};
            }

            // 初始化时添加按钮
            const aliveButtonComponents = addCheckAliveButton();

            // 监听DOM变化，确保按钮始终存在
            const observer = new MutationObserver(function(mutations) {
                if (!document.querySelector('.check-alive-btn')) {
                    addCheckAliveButton();
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });

            openButton.addEventListener('click', function() {
                //查找两种模式下含有跳转按钮的div
                var ClassElements = document.querySelectorAll('.item-top-line');
                var TableElements = document.querySelectorAll('.el-table__fixed-right');

                // 遍历每个 大类元素，查找所有<a>标签，打开所有<a>里的链接

                //经典模式
                if (ClassElements){
                    ClassElements.forEach(function(itemTopLine) {
                        var aElements = itemTopLine.querySelectorAll('a');
                        aElements.forEach(function(a) {
                            console.log(a);
                            window.open(a.href, '_blank');
                        });
                    });
                }

                //列表模式
                if (TableElements){
                    TableElements.forEach(function(rightLine) {
                        var bElements = rightLine.querySelectorAll('a');
                        bElements.forEach(function(a) {
                            console.log(a);
                            window.open(a.href, '_blank');
                        });
                    });
                }
            });
        }

        // 添加复制域名功能
        function addCopyButton() {
            // 移除页脚
            const footer = document.querySelector('.home-main-footer');
            if (footer) {
                footer.remove();
            }

            const topLeftElements = document.querySelectorAll('.top-left');
            topLeftElements.forEach(function(topLeft) {
                // 检查是否已经添加过按钮
                if (!topLeft.querySelector('.copy-domain-btn')) {
                    // 获取域名元素
                    const domainSpan = topLeft.querySelector('.copy_btn');
                    if (domainSpan) {
                        // 创建复制按钮
                        const copyButton = document.createElement('button');
                        copyButton.className = 'copy-domain-btn';
                        copyButton.innerHTML = '复制访问域名';
                        copyButton.style.marginLeft = '10px';
                        copyButton.style.padding = '2px 8px';
                        copyButton.style.fontSize = '12px';
                        copyButton.style.borderRadius = '3px';
                        copyButton.style.border = '1px solid #dcdfe6';
                        copyButton.style.backgroundColor = '#ffffff';
                        copyButton.style.cursor = 'pointer';

                        // 创建访问按钮
                        const visitButton = document.createElement('button');
                        visitButton.className = 'visit-domain-btn';
                        visitButton.innerHTML = '访问网站';
                        visitButton.style.marginLeft = '10px';
                        visitButton.style.padding = '2px 8px';
                        visitButton.style.fontSize = '12px';
                        visitButton.style.borderRadius = '3px';
                        visitButton.style.border = '1px solid #dcdfe6';
                        visitButton.style.backgroundColor = '#ffffff';
                        visitButton.style.cursor = 'pointer';

                        // 获取URL的函数
                        const getFullUrl = () => {
                            // 获取域名或IP
                            const domain = domainSpan.getAttribute('data-clipboard-text').split(':')[0];

                            // 获取协议
                            const protocolElement = topLeft.closest('.item-container').querySelector('.server-protocol');
                            let protocol = protocolElement ? protocolElement.textContent.trim() : 'http';

                            // 获取端口号
                            const portElement = topLeft.closest('.item-container').querySelector('.port.common-tag');
                            const port = portElement ? portElement.textContent.replace(/[^0-9]/g, '') : '';

                            // 根据协议和端口判断最终使用的协议
                            if (protocol.includes('ssl') || protocol.includes('https') || port === '443') {
                                protocol = 'https';
                            } else {
                                protocol = 'http';
                            }

                            // 判断是否需要显示端口号
                            const showPort = !(
                                (protocol === 'http' && port === '80') ||
                                (protocol === 'https' && port === '443')
                            );

                            // 获取网站路径
                            const items = topLeft.closest('.item-container').querySelectorAll('.item');
                            let path = '';
                            items.forEach(item => {
                                const label = item.querySelector('.label');
                                const ellipseText = item.querySelector('.ellipse-text');
                                if (label && label.textContent.includes('网站路径') && ellipseText) {
                                    path = ellipseText.textContent.trim();
                                }
                            });

                            return `${protocol}://${domain}${showPort && port ? ':' + port : ''}${path}`;
                        };

                        // 添加复制点击事件
                        copyButton.addEventListener('click', function() {
                            const fullUrl = getFullUrl();
                            navigator.clipboard.writeText(fullUrl).then(function() {
                                copyButton.innerHTML = '已复制！';
                                setTimeout(function() {
                                    copyButton.innerHTML = '复制访问域名';
                                }, 1000);
                            });
                        });

                        // 添加访问点击事件
                        visitButton.addEventListener('click', function() {
                            const fullUrl = getFullUrl();
                            const protocol = fullUrl.split('://')[0];
                            // 只打开http或https链接
                            if (protocol === 'http' || protocol === 'https') {
                                window.open(fullUrl, '_blank');
                            }
                        });

                        // 将按钮添加到top-left div中
                        topLeft.appendChild(copyButton);
                        topLeft.appendChild(visitButton);
                    }
                }
            });
        }

        // 监听DOM变化，动态添加复制按钮
        const observer = new MutationObserver(function(mutations) {
            addCopyButton();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // 初始化时添加按钮
        addCopyButton();
    });
})();
