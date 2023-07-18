$('.robot').hover(function () {
    $(this).css('transform', 'translateX(100px)');
}, function () {
    $(this).css('transform', 'translateX(118px)');
});

$(document).ready(function () {
    $(".robot").click(function () {
        $(".sidebar").show();
        $(".robot").hide();
    });
    $(".close-btn").click(function () {
        $(".sidebar").hide();
        $(".robot").show();
    });
});