// ==UserScript==
// @name         quake-增强
// @namespace    http://tampermonkey.net/
// @version      2025-08-27 v2.0
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

                // 创建复制全部按钮
                const copyAllButton = document.createElement('button');
                copyAllButton.className = 'el-button el-button--success el-button--small';
                copyAllButton.innerHTML = '复制全部';
                copyAllButton.style.marginRight = '10px';

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
                    // 添加延迟确保DOM完全加载
                    setTimeout(function() {
                        // 查找两种模式下含有跳转按钮的div
                    var ClassElements = document.querySelectorAll('.item-top-line');
                    var TableElements = document.querySelectorAll('.el-table__fixed-right');

                        console.log("找到经典模式元素:", ClassElements.length);
                        console.log("找到列表模式元素:", TableElements.length);

                        // 检查是否找到任何元素
                        if (ClassElements.length === 0 && TableElements.length === 0) {
                            alert("未找到资产链接，请确保资产已加载完成");
                            return;
                        }

                        // 存储所有要打开的链接
                        let allLinks = [];

                        // 经典模式
                        if (ClassElements.length > 0) {
                        ClassElements.forEach(function(itemTopLine) {
                            var aElements = itemTopLine.querySelectorAll('a');
                            aElements.forEach(function(a) {
                                    if (a.href && !allLinks.includes(a.href)) {
                                        allLinks.push(a.href);
                                    }
                                });
                            });
                        }

                        // 列表模式
                        if (TableElements.length > 0) {
                        TableElements.forEach(function(rightLine) {
                            var bElements = rightLine.querySelectorAll('a');
                            bElements.forEach(function(a) {
                                    if (a.href && !allLinks.includes(a.href)) {
                                        allLinks.push(a.href);
                                    }
                                });
                            });
                        }

                        // 如果没有找到链接，尝试从访问按钮获取链接
                        if (allLinks.length === 0) {
                            const visitButtons = document.querySelectorAll('.visit-domain-btn');
                            if (visitButtons.length > 0) {
                                visitButtons.forEach(button => {
                                    const topLeft = button.closest('.top-left');
                                    if (topLeft) {
                                        const domainSpan = topLeft.querySelector('.copy_btn');
                                        if (domainSpan) {
                                            // 使用现有的getFullUrl函数逻辑
                                            const domain = domainSpan.getAttribute('data-clipboard-text').split(':')[0];
                                            const protocolElement = topLeft.closest('.item-container').querySelector('.server-protocol');
                                            let protocol = protocolElement ? protocolElement.textContent.trim() : 'http';
                                            const portElement = topLeft.closest('.item-container').querySelector('.port.common-tag');
                                            const port = portElement ? portElement.textContent.replace(/[^0-9]/g, '') : '';

                                            if (protocol.includes('ssl') || protocol.includes('https') || port === '443') {
                                                protocol = 'https';
                                            } else {
                                                protocol = 'http';
                                            }

                                            const showPort = !((protocol === 'http' && port === '80') || (protocol === 'https' && port === '443'));
                                            const url = `${protocol}://${domain}${showPort && port ? ':' + port : ''}`;

                                            if (!allLinks.includes(url)) {
                                                allLinks.push(url);
                                            }
                                        }
                                    }
                                });
                            }
                        }

                        console.log("找到链接总数:", allLinks.length);

                        // 顺序打开链接，每次间隔2秒
                        if (allLinks.length > 0) {
                            let currentIndex = 0;

                            // 创建一个提示元素
                            const statusDiv = document.createElement('div');
                            statusDiv.style.position = 'fixed';
                            statusDiv.style.bottom = '20px';
                            statusDiv.style.right = '20px';
                            statusDiv.style.padding = '10px';
                            statusDiv.style.backgroundColor = 'rgba(0,0,0,0.7)';
                            statusDiv.style.color = 'white';
                            statusDiv.style.borderRadius = '5px';
                            statusDiv.style.zIndex = '10000';
                            statusDiv.style.fontWeight = 'bold';
                            statusDiv.textContent = `正在打开资产 (1/${allLinks.length})`;
                            document.body.appendChild(statusDiv);

                            // 打开第一个链接
                            window.open(allLinks[0], '_blank');

                            // 设置定时器依次打开其余链接
                            const openInterval = setInterval(() => {
                                currentIndex++;
                                if (currentIndex < allLinks.length) {
                                    window.open(allLinks[currentIndex], '_blank');
                                    statusDiv.textContent = `正在打开资产 (${currentIndex+1}/${allLinks.length})`;
                                } else {
                                    clearInterval(openInterval);
                                    statusDiv.textContent = `全部资产已打开 (${allLinks.length}/${allLinks.length})`;
                                    // 3秒后移除状态提示
                                    setTimeout(() => {
                                        document.body.removeChild(statusDiv);
                                    }, 3000);
                                }
                            }, 2000); // 每2秒打开一个新链接
                        } else {
                            alert("未找到任何可打开的链接");
                        }
                    }, 500); // 延迟500毫秒确保DOM加载完成
                });

                // 添加复制全部点击事件
                copyAllButton.addEventListener('click', function() {
                    // 延迟确保DOM完全加载
                    setTimeout(function() {
                        // 查找两种模式下含有跳转按钮的div
                        var ClassElements = document.querySelectorAll('.item-top-line');
                        var TableElements = document.querySelectorAll('.el-table__fixed-right');

                        console.log("找到经典模式元素:", ClassElements.length);
                        console.log("找到列表模式元素:", TableElements.length);

                        // 检查是否找到任何元素
                        if (ClassElements.length === 0 && TableElements.length === 0) {
                            alert("未找到资产链接，请确保资产已加载完成");
                            return;
                        }

                        // 存储所有要复制的链接
                        let allLinks = [];

                        // 经典模式
                        if (ClassElements.length > 0) {
                            ClassElements.forEach(function(itemTopLine) {
                                var aElements = itemTopLine.querySelectorAll('a');
                                aElements.forEach(function(a) {
                                    if (a.href && !allLinks.includes(a.href)) {
                                        allLinks.push(a.href);
                                    }
                                });
                            });
                        }

                        // 列表模式
                        if (TableElements.length > 0) {
                            TableElements.forEach(function(rightLine) {
                                var bElements = rightLine.querySelectorAll('a');
                                bElements.forEach(function(a) {
                                    if (a.href && !allLinks.includes(a.href)) {
                                        allLinks.push(a.href);
                                    }
                                });
                            });
                        }

                        // 如果没有找到链接，尝试从访问按钮获取链接
                        if (allLinks.length === 0) {
                            const visitButtons = document.querySelectorAll('.visit-domain-btn');
                            if (visitButtons.length > 0) {
                                visitButtons.forEach(button => {
                                    const topLeft = button.closest('.top-left');
                                    if (topLeft) {
                                        const domainSpan = topLeft.querySelector('.copy_btn');
                                        if (domainSpan) {
                                            // 使用现有的getFullUrl函数逻辑
                                            const domain = domainSpan.getAttribute('data-clipboard-text').split(':')[0];
                                            const protocolElement = topLeft.closest('.item-container').querySelector('.server-protocol');
                                            let protocol = protocolElement ? protocolElement.textContent.trim() : 'http';
                                            const portElement = topLeft.closest('.item-container').querySelector('.port.common-tag');
                                            const port = portElement ? portElement.textContent.replace(/[^0-9]/g, '') : '';

                                            if (protocol.includes('ssl') || protocol.includes('https') || port === '443') {
                                                protocol = 'https';
                                            } else {
                                                protocol = 'http';
                                            }

                                            const showPort = !((protocol === 'http' && port === '80') || (protocol === 'https' && port === '443'));
                                            const url = `${protocol}://${domain}${showPort && port ? ':' + port : ''}`;

                                            if (!allLinks.includes(url)) {
                                                allLinks.push(url);
                                            }
                                        }
                                    }
                                });
                            }
                        }

                        console.log("找到链接总数:", allLinks.length);

                        // 复制所有链接到剪贴板
                        if (allLinks.length > 0) {
                            const urlsText = allLinks.join('\n');
                            navigator.clipboard.writeText(urlsText).then(function() {
                                // 显示成功提示
                                const originalText = copyAllButton.innerHTML;
                                copyAllButton.innerHTML = `已复制${allLinks.length}个链接`;
                                copyAllButton.style.backgroundColor = '#67C23A';

                                setTimeout(function() {
                                    copyAllButton.innerHTML = originalText;
                                    copyAllButton.style.backgroundColor = '';
                                }, 2000);
                            }).catch(function(err) {
                                console.error('复制失败:', err);
                                alert('复制失败，请手动复制');
                            });
                        } else {
                            alert("未找到任何可复制的链接");
                        }
                    }, 500); // 延迟500毫秒确保DOM加载完成
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
                buttonContainer.appendChild(copyAllButton);
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

                         // 创建查询资产路径按钮
                         const queryAssetsButton = document.createElement('button');
                         queryAssetsButton.className = 'query-asset-btn';
                         queryAssetsButton.innerHTML = '查询资产路径';
                         queryAssetsButton.style.marginLeft = '10px';
                         queryAssetsButton.style.padding = '2px 8px';
                         queryAssetsButton.style.fontSize = '12px';
                         queryAssetsButton.style.borderRadius = '3px';
                         queryAssetsButton.style.border = '1px solid #dcdfe6';
                         queryAssetsButton.style.backgroundColor = '#ffffff';
                         queryAssetsButton.style.cursor = 'pointer';

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

                         // 工具函数：创建/显示资产输出框（表格形式）
                         function showAssetOutput(urls, searchUrl) {
                             let modal = document.getElementById('asset-output-modal');
                             if (!modal) {
                                 modal = document.createElement('div');
                                 modal.id = 'asset-output-modal';
                                 modal.style.position = 'fixed';
                                 modal.style.top = '0';
                                 modal.style.left = '0';
                                 modal.style.right = '0';
                                 modal.style.bottom = '0';
                                 modal.style.background = 'rgba(0,0,0,0.45)';
                                 modal.style.zIndex = '100000';
                                 modal.style.display = 'flex';
                                 modal.style.alignItems = 'center';
                                 modal.style.justifyContent = 'center';

                                 const panel = document.createElement('div');
                                 panel.style.width = '80%';
                                 panel.style.maxWidth = '1200px';
                                 panel.style.maxHeight = '80%';
                                 panel.style.background = '#fff';
                                 panel.style.borderRadius = '8px';
                                 panel.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)';
                                 panel.style.display = 'flex';
                                 panel.style.flexDirection = 'column';

                                 const header = document.createElement('div');
                                 header.style.display = 'flex';
                                 header.style.alignItems = 'center';
                                 header.style.justifyContent = 'space-between';
                                 header.style.padding = '12px 16px';
                                 header.style.borderBottom = '1px solid #eee';
                                 const title = document.createElement('div');
                                 title.textContent = '资产列表';
                                 title.style.fontWeight = 'bold';
                                 const actions = document.createElement('div');

                                 const copyBtn = document.createElement('button');
                                 copyBtn.textContent = '复制全部';
                                 copyBtn.style.marginRight = '10px';
                                 copyBtn.className = 'el-button el-button--primary el-button--small';
                                 copyBtn.addEventListener('click', () => {
                                     const text = urls.join('\n');
                                     navigator.clipboard.writeText(text).then(() => {
                                         copyBtn.textContent = '已复制';
                                         setTimeout(() => (copyBtn.textContent = '复制全部'), 1500);
                                     });
                                 });

                                 const bingBtn = document.createElement('button');
                                 bingBtn.textContent = '跳转Bing查询';
                                 bingBtn.style.marginRight = '10px';
                                 bingBtn.className = 'el-button el-button--warning el-button--small';
                                 bingBtn.addEventListener('click', () => {
                                     if (searchUrl) {
                                         window.open(searchUrl, '_blank');
                                     }
                                 });

                                 const closeBtn = document.createElement('button');
                                 closeBtn.textContent = '关闭';
                                 closeBtn.className = 'el-button el-button--default el-button--small';
                                 closeBtn.addEventListener('click', () => {
                                     modal.remove();
                                 });

                                 actions.appendChild(copyBtn);
                                 actions.appendChild(bingBtn);
                                 actions.appendChild(closeBtn);
                                 header.appendChild(title);
                                 header.appendChild(actions);

                                 const content = document.createElement('div');
                                 content.style.padding = '12px 16px';
                                 content.style.overflow = 'auto';
                                 content.id = 'asset-table-container';

                                 panel.appendChild(header);
                                 panel.appendChild(content);
                                 modal.appendChild(panel);
                                 document.body.appendChild(modal);
                             }

                             const container = document.getElementById('asset-table-container');
                             if (container) {
                                 if (!urls || urls.length === 0) {
                                     container.innerHTML = '<div style="text-align:center;padding:40px;color:#999;">未提取到任何资产</div>';
                                 } else {
                                     // 创建表格
                                     const table = document.createElement('table');
                                     table.style.width = '100%';
                                     table.style.borderCollapse = 'collapse';
                                     table.style.fontSize = '14px';

                                     // 表头
                                     const thead = document.createElement('thead');
                                     const headerRow = document.createElement('tr');
                                     headerRow.style.backgroundColor = '#f5f7fa';

                                     const indexHeader = document.createElement('th');
                                     indexHeader.textContent = '序号';
                                     indexHeader.style.padding = '12px 8px';
                                     indexHeader.style.border = '1px solid #ebeef5';
                                     indexHeader.style.textAlign = 'center';
                                     indexHeader.style.width = '60px';

                                     const urlHeader = document.createElement('th');
                                     urlHeader.textContent = 'URL地址';
                                     urlHeader.style.padding = '12px 8px';
                                     urlHeader.style.border = '1px solid #ebeef5';
                                     urlHeader.style.textAlign = 'left';

                                     const actionHeader = document.createElement('th');
                                     actionHeader.textContent = '操作';
                                     actionHeader.style.padding = '12px 8px';
                                     actionHeader.style.border = '1px solid #ebeef5';
                                     actionHeader.style.textAlign = 'center';
                                     actionHeader.style.width = '80px';

                                     headerRow.appendChild(indexHeader);
                                     headerRow.appendChild(urlHeader);
                                     headerRow.appendChild(actionHeader);
                                     thead.appendChild(headerRow);
                                     table.appendChild(thead);

                                     // 表体
                                     const tbody = document.createElement('tbody');
                                     urls.forEach((url, index) => {
                                         const row = document.createElement('tr');
                                         row.style.borderBottom = '1px solid #ebeef5';
                                         if (index % 2 === 1) {
                                             row.style.backgroundColor = '#fafafa';
                                         }

                                         const indexCell = document.createElement('td');
                                         indexCell.textContent = index + 1;
                                         indexCell.style.padding = '12px 8px';
                                         indexCell.style.border = '1px solid #ebeef5';
                                         indexCell.style.textAlign = 'center';

                                         const urlCell = document.createElement('td');
                                         urlCell.textContent = url;
                                         urlCell.style.padding = '12px 8px';
                                         urlCell.style.border = '1px solid #ebeef5';
                                         urlCell.style.wordBreak = 'break-all';
                                         urlCell.style.maxWidth = '500px';

                                         const actionCell = document.createElement('td');
                                         actionCell.style.padding = '12px 8px';
                                         actionCell.style.border = '1px solid #ebeef5';
                                         actionCell.style.textAlign = 'center';

                                         const jumpBtn = document.createElement('button');
                                         jumpBtn.textContent = '跳转';
                                         jumpBtn.className = 'el-button el-button--primary el-button--mini';
                                         jumpBtn.style.fontSize = '12px';
                                         jumpBtn.style.padding = '5px 8px';
                                         jumpBtn.addEventListener('click', () => {
                                             window.open(url, '_blank');
                                         });

                                         actionCell.appendChild(jumpBtn);
                                         row.appendChild(indexCell);
                                         row.appendChild(urlCell);
                                         row.appendChild(actionCell);
                                         tbody.appendChild(row);
                                     });
                                     table.appendChild(tbody);
                                     container.innerHTML = '';
                                     container.appendChild(table);
                                 }
                             }
                         }

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

                         // 从cn.bing.com的cookie中提取SID
                         function extractSidFromCookie() {
                             return new Promise((resolve) => {
                                 // 先尝试访问cn.bing.com获取cookie
                                 GM_xmlhttpRequest({
                                     method: 'GET',
                                     url: 'https://cn.bing.com/',
                                     timeout: 5000,
                                     onload: function(response) {
                                         try {
                                             // 从响应头中获取Set-Cookie
                                             const responseHeaders = response.responseHeaders || '';
                                             let sid = null; // 不使用默认值

                                             // 解析响应头中的Set-Cookie
                                             const cookieLines = responseHeaders.split('\n');
                                             for (const line of cookieLines) {
                                                 if (line.toLowerCase().startsWith('set-cookie:')) {
                                                     const cookieValue = line.substring(11).trim();
                                                     // 查找SID cookie
                                                     const sidMatch = cookieValue.match(/\bSID=([^;]+)/i);
                                                     if (sidMatch) {
                                                         sid = sidMatch[1];
                                                         console.log('从cookie中提取到SID:', sid);
                                                         break;
                                                     }
                                                 }
                                             }

                                             // 如果响应头中没有找到，尝试从响应内容中查找
                                             if (!sid && response.responseText) {
                                                 const scriptMatches = response.responseText.matchAll(/"SID":"([^"]+)"/g);
                                                 for (const match of scriptMatches) {
                                                     sid = match[1];
                                                     console.log('从响应内容中提取到SID:', sid);
                                                     break;
                                                 }

                                                 // 尝试其他可能的SID格式
                                                 if (!sid) {
                                                     const sidMatches = response.responseText.matchAll(/sid['":\s=]+([A-Za-z0-9\-_]+)/gi);
                                                     for (const match of sidMatches) {
                                                         if (match[1] && match[1].length > 4) {
                                                             sid = match[1];
                                                             console.log('从内容匹配中提取到SID:', sid);
                                                             break;
                                                         }
                                                     }
                                                 }
                                             }

                                             resolve(sid);
                                         } catch (e) {
                                             console.error('解析SID失败:', e);
                                             resolve(null);
                                         }
                                     },
                                     onerror: function() {
                                         console.log('获取cn.bing.com失败');
                                         resolve(null);
                                     },
                                     ontimeout: function() {
                                         console.log('获取cn.bing.com超时');
                                         resolve(null);
                                     }
                                 });
                             });
                         }

                         // SID存储管理
                         const SID_STORAGE_KEY = 'quake_bing_sid';

                         function saveSid(sid) {
                             try {
                                 localStorage.setItem(SID_STORAGE_KEY, sid);
                                 console.log('SID已保存到本地存储');
                             } catch (e) {
                                 console.warn('保存SID失败:', e);
                             }
                         }

                         function getSavedSid() {
                             try {
                                 return localStorage.getItem(SID_STORAGE_KEY);
                             } catch (e) {
                                 console.warn('获取保存的SID失败:', e);
                                 return null;
                             }
                         }

                         // 手动输入SID的函数
                         function promptForSid() {
                             return new Promise((resolve) => {
                                 // 先检查是否有保存的SID
                                 const savedSid = getSavedSid();

                                 // 创建自定义输入对话框
                                 const modal = document.createElement('div');
                                 modal.style.position = 'fixed';
                                 modal.style.top = '0';
                                 modal.style.left = '0';
                                 modal.style.right = '0';
                                 modal.style.bottom = '0';
                                 modal.style.background = 'rgba(0,0,0,0.5)';
                                 modal.style.zIndex = '100001';
                                 modal.style.display = 'flex';
                                 modal.style.alignItems = 'center';
                                 modal.style.justifyContent = 'center';

                                 const dialog = document.createElement('div');
                                 dialog.style.background = '#fff';
                                 dialog.style.padding = '20px';
                                 dialog.style.borderRadius = '8px';
                                 dialog.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
                                 dialog.style.maxWidth = '500px';
                                 dialog.style.width = '90%';

                                 const title = document.createElement('div');
                                 title.textContent = '需要手动输入SID';
                                 title.style.fontSize = '16px';
                                 title.style.fontWeight = 'bold';
                                 title.style.marginBottom = '10px';

                                 const message = document.createElement('div');
                                 if (savedSid) {
                                     message.innerHTML = `检测到已保存的SID值。<br>您可以直接使用或输入新的SID值：`;
                                 } else {
                                     message.innerHTML = '无法自动获取cn.bing.com的SID参数。<br>请手动输入SID值（可在浏览器开发者工具的Cookie中找到）：';
                                 }
                                 message.style.marginBottom = '15px';
                                 message.style.color = '#666';

                                 const input = document.createElement('input');
                                 input.type = 'text';
                                 input.placeholder = '请输入SID值（如：1234567890）';
                                 input.value = savedSid || ''; // 预填充保存的SID
                                 input.style.width = '100%';
                                 input.style.padding = '8px';
                                 input.style.border = '1px solid #ddd';
                                 input.style.borderRadius = '4px';
                                 input.style.marginBottom = '15px';
                                 input.style.fontSize = '14px';

                                 const buttonContainer = document.createElement('div');
                                 buttonContainer.style.textAlign = 'right';

                                 const cancelBtn = document.createElement('button');
                                 cancelBtn.textContent = '取消';
                                 cancelBtn.style.marginRight = '10px';
                                 cancelBtn.style.padding = '8px 16px';
                                 cancelBtn.style.border = '1px solid #ddd';
                                 cancelBtn.style.borderRadius = '4px';
                                 cancelBtn.style.backgroundColor = '#fff';
                                 cancelBtn.style.cursor = 'pointer';

                                 const clearBtn = document.createElement('button');
                                 clearBtn.textContent = '清除保存';
                                 clearBtn.style.marginRight = '10px';
                                 clearBtn.style.padding = '8px 16px';
                                 clearBtn.style.border = '1px solid #ddd';
                                 clearBtn.style.borderRadius = '4px';
                                 clearBtn.style.backgroundColor = '#f56c6c';
                                 clearBtn.style.color = '#fff';
                                 clearBtn.style.cursor = 'pointer';
                                 clearBtn.style.display = savedSid ? 'inline-block' : 'none';

                                 const confirmBtn = document.createElement('button');
                                 confirmBtn.textContent = '确定';
                                 confirmBtn.style.padding = '8px 16px';
                                 confirmBtn.style.border = 'none';
                                 confirmBtn.style.borderRadius = '4px';
                                 confirmBtn.style.backgroundColor = '#409eff';
                                 confirmBtn.style.color = '#fff';
                                 confirmBtn.style.cursor = 'pointer';

                                 // 事件处理
                                 cancelBtn.addEventListener('click', () => {
                                     document.body.removeChild(modal);
                                     resolve(null);
                                 });

                                 clearBtn.addEventListener('click', () => {
                                     if (confirm('确定要清除保存的SID吗？')) {
                                         try {
                                             localStorage.removeItem(SID_STORAGE_KEY);
                                             input.value = '';
                                             clearBtn.style.display = 'none';
                                             message.innerHTML = '无法自动获取cn.bing.com的SID参数。<br>请手动输入SID值（可在浏览器开发者工具的Cookie中找到）：';
                                             console.log('已清除保存的SID');
                                         } catch (e) {
                                             console.warn('清除SID失败:', e);
                                         }
                                     }
                                 });

                                 confirmBtn.addEventListener('click', () => {
                                     const sidValue = input.value.trim();
                                     if (sidValue) {
                                         // 保存SID到本地存储
                                         saveSid(sidValue);
                                         document.body.removeChild(modal);
                                         resolve(sidValue);
                                     } else {
                                         alert('请输入有效的SID值');
                                     }
                                 });

                                 // 回车确认
                                 input.addEventListener('keypress', (e) => {
                                     if (e.key === 'Enter') {
                                         confirmBtn.click();
                                     }
                                 });

                                 // 组装对话框
                                 buttonContainer.appendChild(cancelBtn);
                                 buttonContainer.appendChild(clearBtn);
                                 buttonContainer.appendChild(confirmBtn);
                                 dialog.appendChild(title);
                                 dialog.appendChild(message);
                                 dialog.appendChild(input);
                                 dialog.appendChild(buttonContainer);
                                 modal.appendChild(dialog);
                                 document.body.appendChild(modal);

                                 // 自动聚焦输入框
                                 setTimeout(() => input.focus(), 100);
                             });
                         }

                         // 添加查询资产路径点击事件
                         queryAssetsButton.addEventListener('click', async function() {
                             // 若已完成提取，则再次点击显示输出框
                             if (queryAssetsButton.dataset.done === '1') {
                                 const urls = topLeft.__assetUrls || [];
                                 const searchUrl = topLeft.__searchUrl || '';
                                 showAssetOutput(urls, searchUrl);
                                 return;
                             }

                             // 解析 host 与 port
                             const host = domainSpan.getAttribute('data-clipboard-text').split(':')[0];
                             const protocolElement = topLeft.closest('.item-container').querySelector('.server-protocol');
                             let protocol = protocolElement ? protocolElement.textContent.trim() : 'http';
                             const portElement = topLeft.closest('.item-container').querySelector('.port.common-tag');
                             let port = portElement ? portElement.textContent.replace(/[^0-9]/g, '') : '';
                             if (!port) {
                                 if (protocol.includes('ssl') || protocol.includes('https')) {
                                     port = '443';
                                 } else {
                                     port = '80';
                                 }
                             }

                             // UI: 查询中（先保存原始文本）
                             const originalText = queryAssetsButton.innerHTML;
                             queryAssetsButton.innerHTML = '查询中...';
                             queryAssetsButton.disabled = true;

                             // 动态获取SID
                             let sid = await extractSidFromCookie();

                             // 如果无法自动获取SID，提示手动输入
                             if (!sid) {
                                 sid = await promptForSid();
                                 if (!sid) {
                                     // 用户取消了输入，恢复按钮状态并退出
                                     queryAssetsButton.innerHTML = originalText;
                                     queryAssetsButton.disabled = false;
                                     return;
                                 }
                             }

                             console.log('使用SID:', sid);

                             // 构造查询 URL（使用动态获取或手动输入的SID）
                             const query = `site:"${host}" ${port}`;
                             const searchUrl = `https://cn.bing.com/search?q=${encodeURIComponent(query)}&sid=${sid}&format=snrjson&jsoncbid=0`;
                             // 跳转用的简化URL（只保留基本搜索参数）
                             const jumpUrl = `https://cn.bing.com/search?q=${encodeURIComponent(query)}`;

                             // 发送请求
                             GM_xmlhttpRequest({
                                 method: 'GET',
                                 url: searchUrl,
                                 timeout: 10000,
                                 headers: {
                                     'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                                     'Accept-Language': 'zh-CN,zh;q=0.9',
                                     'Referer': 'https://cn.bing.com/'
                                 },
                                  onload: function(response) {
                                      try {
                                          const text = response.responseText || '';
                                          const urls = (function extractUrls(responseText, labelHost) {
                                              const collected = new Set();

                                              // 处理包含多个 <script> 标签的 JSONP 回调格式
                                              let html = responseText;

                                              // 提取所有 script 标签，找到包含 Content 字段的那个
                                              const scriptMatches = responseText.matchAll(/<script[^>]*>(.*?)<\/script>/gs);
                                              for (const scriptMatch of scriptMatches) {
                                                  const scriptContent = scriptMatch[1];
                                                  // 检查是否包含 Content 字段的 JSONP 回调
                                                  const jsonpMatch = scriptContent.match(/window\.parent\.AjaxCB\[\d+\]\((.+)\);?\s*$/s);
                                                  if (jsonpMatch) {
                                                      try {
                                                          const jsonData = JSON.parse(jsonpMatch[1]);
                                                          if (jsonData.Content) {
                                                              html = jsonData.Content;
                                                              break; // 找到包含 Content 的就停止
                                                          }
                                                      } catch (e) {
                                                          // 忽略解析失败的 script，继续下一个
                                                          continue;
                                                      }
                                                  }
                                              }

                                              // 基于 redirecturl 标记提取所有 href（兼容 href=\"...\"）
                                              const lower = html.toLowerCase();
                                              let pos = 0;
                                              while (true) {
                                                  const at = lower.indexOf('redirecturl', pos);
                                                  if (at === -1) break;

                                                  const segment = html.slice(at, Math.min(html.length, at + 500));
                                                  // 优先匹配转义形式 href=\"...\"
                                                  let m = segment.match(/href=\\\"([^\\\"]+)\\\"/i);
                                                  if (!m) {
                                                      // 再匹配普通 HTML 形式 href="..." 或 href='...'
                                                      m = segment.match(/href=["']([^"']+)["']/i);
                                                  }
                                                  if (m && m[1]) {
                                                      let u = m[1].replace(/\\\//g, '/'); // \/ -> /
                                                      if (/^https?:\/\//i.test(u)) {
                                                          collected.add(u);
                                                      }
                                                  }

                                                  pos = at + 11; // 'redirecturl'.length
                                              }

                                              return Array.from(collected);
                                          })(text, host);

                                          const uniqueUrls = Array.from(new Set(urls));

                                          // 保存结果和查询URL（跳转用简化URL）
                                          topLeft.__assetUrls = uniqueUrls;
                                          topLeft.__searchUrl = jumpUrl;
                                          queryAssetsButton.dataset.done = '1';
                                          queryAssetsButton.innerHTML = `提取完成(${uniqueUrls.length})`;
                                          queryAssetsButton.disabled = false;
                                      } catch (e) {
                                          console.error('解析搜索结果失败:', e);
                                          queryAssetsButton.innerHTML = originalText;
                                          queryAssetsButton.disabled = false;
                                          alert('解析搜索结果失败');
                                      }
                                  },
                                 onerror: function(err) {
                                     console.error('搜索请求失败:', err);
                                     queryAssetsButton.innerHTML = originalText;
                                     queryAssetsButton.disabled = false;
                                     alert('搜索请求失败');
                                 },
                                 ontimeout: function() {
                                     console.error('搜索请求超时');
                                     queryAssetsButton.innerHTML = originalText;
                                     queryAssetsButton.disabled = false;
                                     alert('搜索请求超时');
                                 }
                             });
                         });

                        // 将按钮添加到top-left div中
                        topLeft.appendChild(copyButton);
                        topLeft.appendChild(visitButton);
                         topLeft.appendChild(queryAssetsButton);
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

        // 添加URL跳转按钮功能
        function addUrlJumpButtons() {
            // 查找所有包含URL的表格项
            const urlTableItems = document.querySelectorAll('.json-table-item');

            urlTableItems.forEach(function(item) {
                const tableKey = item.querySelector('.table-key');
                const tableValue = item.querySelector('.table-value');
                const existingBtn = item.querySelector('.url-jump-btn');

                if (!tableKey || !tableValue) {
                    if (existingBtn) existingBtn.remove();
                    return;
                }

                const keyText = tableKey.textContent.trim();
                const isUrlKey = /^link\.[^.]+\.[^.]+\.url$/.test(keyText);
                const urlSpan = tableValue.querySelector('span');
                const rawUrl = urlSpan ? urlSpan.textContent.trim() : '';
                const isValidUrl = !!rawUrl && (rawUrl.startsWith('http://') || rawUrl.startsWith('https://'));

                // 条件不满足时，移除残留按钮
                if (!isUrlKey || !isValidUrl) {
                    if (existingBtn) existingBtn.remove();
                    return;
                }

                // 满足条件：创建或复用按钮
                let jumpButton = existingBtn;
                if (!jumpButton) {
                    jumpButton = document.createElement('button');
                    jumpButton.className = 'url-jump-btn';
                    jumpButton.textContent = '跳转';
                    jumpButton.style.marginLeft = '10px';
                    jumpButton.style.padding = '2px 8px';
                    jumpButton.style.fontSize = '12px';
                    jumpButton.style.borderRadius = '3px';
                    jumpButton.style.border = '1px solid #409eff';
                    jumpButton.style.backgroundColor = '#409eff';
                    jumpButton.style.color = '#ffffff';
                    jumpButton.style.cursor = 'pointer';
                    jumpButton.style.transition = 'all 0.3s';

                    jumpButton.addEventListener('mouseenter', function() {
                        jumpButton.style.backgroundColor = '#66b1ff';
                    });
                    jumpButton.addEventListener('mouseleave', function() {
                        jumpButton.style.backgroundColor = '#409eff';
                    });

                    tableValue.appendChild(jumpButton);
                }

                // 始终以“当前行内的最新URL”作为跳转目标
                jumpButton.onclick = function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    const latestSpan = tableValue.querySelector('span');
                    const latestUrl = latestSpan ? latestSpan.textContent.trim() : '';
                    if (latestUrl && (latestUrl.startsWith('http://') || latestUrl.startsWith('https://'))) {
                        window.open(latestUrl, '_blank');
                    } else {
                        alert('无效的URL地址: ' + latestUrl);
                    }
                };
            });
        }

        // 监听DOM变化，动态添加跳转按钮
        const urlObserver = new MutationObserver(function(mutations) {
            addUrlJumpButtons();
        });

        urlObserver.observe(document.body, {
            childList: true,
            subtree: true
        });

        // 初始化时添加跳转按钮
        addUrlJumpButtons();
    });
})();
