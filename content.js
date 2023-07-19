// content.js
function injectHtml() {
    // 创建一个div，用于包含robot.html的内容
    const container = document.createElement('div');
    container.id = 'robot-button';

    // 获取robot.html的内容
    fetch(chrome.runtime.getURL('robot.html'))
        .then((response) => response.text())
        .then((html) => {
            let parser = new DOMParser();
            let doc = parser.parseFromString(html, 'text/html');
            let images = doc.querySelectorAll('img');
            for (let img of images) {
                img.src = chrome.runtime.getURL(img.getAttribute('src'));
                console.log(img.src);
            }
            // 将robot.html的内容插入到container中
            container.innerHTML = doc.body.innerHTML;
            // 将container插入到页面中
            document.body.appendChild(container);
        });
}


function injectJs(jsFiles) {
    jsFiles.forEach((jsFile) => {
        // 创建一个script标签
        const script = document.createElement('script');

        // 设置script标签的src属性
        script.src = chrome.runtime.getURL(jsFile);

        // 将script标签插入到页面的body中
        document.body.appendChild(script);
    });
}

// 在页面上注入robot.html
injectHtml();

// 在页面上注入多个JavaScript文件
injectJs([
    "lib/highlight.min.js",
    "lib/jquery.min.js",
    "lib/marked.min.js",
    "script.js"
]);



