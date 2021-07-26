(function ($) {

    $(document).ready(() => {

        $("#birthday").datepicker();

        var sidebarUserActions;

        $("#publication-image-upload").change(() => {
            $("#post-publication").ajaxSubmit({
                url: "/api/upload",
                success: (response) => {
                    $("#post-publication-image").attr("src", response);
                    $("#post-image").val(response);
                }
            });
        })

        $("#make-publication-modal").on("hidden.bs.modal", function () {
            $(this).find("input, textarea").val("");
            $(this).find("img").attr("src", "");
        })

    })

    $("#message-to").select2({
        placeholder: "Send to"
    });


    $("#search").on("input propertychange", function () {
        $.post({
            url: "/api/load-users",
            data: {
                s: $(this).val()
            },
            success: (response) => {
                $(this).siblings("#load-users").html(response || `<a href='javascript:void(0)' class="dropdown-item">No users found!</a>`);
            }
        })
    })

    $(".check-second-password").click(function () {
        if ($("#new-password").val() != $("#repeat-new-password").val()) {
            event.preventDefault();
            $(".alert").addClass("show");
        }
    })


})(jQuery);




function removeItem(item, id, el) {
    $.post({
        url: `/api/remove?item=${item}&id=${id}`,
        success: (response) => {
            if (response) {
                $(el).parents(".remove-item:eq(0)").fadeOut().promise().then(function () {
                    $(this).remove();
                    if(item == "Comments") updateCommentsCount(-1);
                    if(item == "Publications") onDeletePublication && onDeletePublication(); 
                })
            }
        }
    })
}
var activeButton;

$('#comments-modal').on('show.bs.modal', function (event) {
    activeButton = $(event.relatedTarget);
    var recipient = activeButton.data('whatever')
    let $form = $(this).find("form:eq(0)");
    $form.attr("action", `/api/post-comment/${recipient}`);

    $.post({
        url: `/api/load-comments/${recipient}`,
        success: (response) => {
            if (response) {
                $("#comments-container .empty").hide();
                $("#comments-container").append(response);
            }
        }
    })
})

$('#comments-modal').on('hidden.bs.modal', function (event) {
    $("#comments-container .empty").show();
    $("#comments-container>*:not(.empty)").remove();
})

$("#post-comment").click(function () {
    event.preventDefault();
    $commentField = $(this).siblings("#comment-field");
    if ($commentField.val())
        $(this).parents("form:eq(0)").ajaxSubmit({
            success: (response) => {
                $commentField.val("");
                $("#comments-container .empty").hide();
                $("#comments-container").append(response);
                updateCommentsCount(1);
            }
        });
})

function updateCommentsCount(n) {
    let $el = $(activeButton).children(".comments-count:eq(0)");
    $el.text(+$el.text() + n);
}

$(".likes-btn").click(function(){
    let $el = $(this).siblings(".likes-text:eq(0)").find(".likes-count:eq(0)");
    let action;
    let likes;
    if($(this).hasClass("l")){
        action = "remove";
        likes = +$el.text() - 1;
    } else {
        action = "add";
        likes = +$el.text() + 1;
    }
    
     
    $.post({
        url: "/api/like",
        data: {
            id: $(this).data("id"),
            action: action
        },
        success: (response) => {
            $(this).toggleClass("l");
            $el.text(likes);
        }
    })
})


$('#likes-modal').on('show.bs.modal', function (event) {
    activeButton = $(event.relatedTarget);
    var recipient = activeButton.data('whatever');

    $.post({
        url: `/api/load-likes/${recipient}`,
        success: (response) => {
            if (response) {
                $("#likes-container .empty").hide();
                $("#likes-container").append(response);
            }
        }
    })
})

$('#likes-modal').on('hidden.bs.modal', function (event) {
    $("#likes-container .empty").show();
    $("#likes-container>*:not(.empty)").remove();
})

function sendMessage(partnerId){
    if(partnerId){
        let message = $("#chat-field").val();
        $("#chat-field").val("");
        if(message){
            $.ajax({
                type: "POST",
                url: "/api/send-message",
                data: {
                    partnerId,
                    message
                },
                success: (response) => {
                    if(response){
                        $("#chat-body").append(response).animate({
                            scrollTop: $("#chat-body")[0].scrollHeight
                        });
                    }
                }
            })
        }
    }
}