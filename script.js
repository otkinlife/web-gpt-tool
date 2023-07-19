var openaiApiKey = ''
var queue = {
    items: [],
    maxLength: 2048,

    enqueue: function (item) {
        this.items.push(item);

        // 检查总字符数是否超过限制
        while (this.getTotalLength() > this.maxLength) {
            // 如果超过限制，删除最早的元素
            this.items.shift();
        }
    },

    getTotalLength: function () {
        return this.items.join('').length;
    },

    joinItems: function () {
        return this.items.join('');
    }
};

$(document).ready(function () {
    var timeout;

    function hideFunctions() {
        timeout = setTimeout(function () {
            $(".robot-functions").hide();
            $('.robot').css('transform', 'translateX(118px)');
        }, 300);
    }

    function showFunctions() {
        clearTimeout(timeout);
        $(".robot-functions").show();
        $('.robot').css('transform', 'translateX(100px)');
    }

    $('.robot, .robot-functions').hover(showFunctions, hideFunctions);

    $(".robot").click(function () {
        $(".sidebar").show();
        $(".robot").hide();
    });
    $(".close-btn").click(function () {
        $(".sidebar").hide();
        $(".robot").show();
    });
    $("#summary").click(function () {
        var currentUrl = $(location).attr('href');
        inputText = currentUrl + '基于该地址的页面生成总结'
        $(".sidebar").show();
        streamResponse(inputText);
    });
        // 按回车键提交
    $(".input-area input").keypress(function (e) {
        if (e.which == 13) {
            $(".input-area button").click();
        }
    });
    $(".input-area button").click(function () {
        var inputText = $(".input-area input").val();
        if (inputText != '') {
            // 将用户输入的消息添加到聊天记录展示区
            $(".chat-history").append('<div class="message user-message"><p>' + inputText + '</p></div>');
            streamResponse(inputText);
            $(".input-area input").val(''); // 清空输入框
        }
    });
});


async function streamResponse(inputText) {
    queue.enqueue(inputText);
    ctxMsg = queue.joinItems();
    const timestamp = new Date().getTime();
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [{ role: "user", content: ctxMsg }],
            temperature: 0.7,
            max_tokens: 2048,
            n: 1,
            stream: true,
        }),
    });
    const reader = response.body.getReader();
    $(".chat-history").append(`<div class="message assistant-message" id="amsg-${timestamp}"><p></p></div>`);
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const lines = new TextDecoder("utf-8")
            .decode(value)
            .split("\n")
            .filter((line) => line.trim() !== "");
        for (const line of lines) {
            const msg = line.replace(/^data: /, "");
            if (msg === "[DONE]") {
                break;
            } else {
                let token;
                try {
                    const parsedMessage = JSON.parse(msg);
                    token = parsedMessage?.choices?.[0]?.delta?.content;
                } catch {
                    console.log("ERROR", msg);
                }
                if (token) { // 修改：检查index是否已存在于Map中
                    $(`#amsg-${timestamp} p`).append(token); // 修改：将新的token添加到消息中
                }
            }
        }
    }
    var markdownText = $(`#amsg-${timestamp} p`).html();
    queue.enqueue(markdownText);
    $(`#amsg-${timestamp}`).html("");
    var htmlText = marked(markdownText);
    $(`#amsg-${timestamp}`).html(htmlText);
    hljs.highlightAll();
}
