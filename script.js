{\rtf1\ansi\ansicpg1252\cocoartf1038\cocoasubrtf360
{\fonttbl\f0\fmodern\fcharset0 Courier;}
{\colortbl;\red255\green255\blue255;}
\margl1440\margr1440\vieww9000\viewh8400\viewkind0
\deftab720
\pard\pardeftab720\ql\qnatural

\f0\fs24 \cf0 $().ready(function () \{\
\
    $("#HomePage").live('pagecreate', HomePage);\
\
    $("#CreateRoomPage").live('pagecreate', CreateRoomPage);\
\
    $("#ChatRoomPage").live('pagecreate', ChatRoomPage);\
\
    window.scrollTo(0, 1); //hide android toolbar\
\
    $("#signOut").live("click", function () \{ ServerCyde.User.SignOut(function () \{ alert("logged out"); \}) \});\
\
\
\
\});\
\
var roomid; \
\
function ChatRoomPage(event) \{\
\
    var divScroll = new chatscroll.Pane('Posts');\
\
    $("#Posts").height($(window).height() - $("#postBox").height() - $("#notification_bar").height() - $("#logoHeader").height() - 9);\
\
    roomid = $.mobile.path.parseUrl(window.location).search.split("=")[1]; \
\
    function AdjustForUser(user) \{\
        if (user.id == 0) \{\
            $.mobile.changePage("/m/");\
        \} \
    \} \
    ServerCyde.User.Details(AdjustForUser);\
\
    ServerCyde.SimpleDB.Select.GetRoomMessages(\{ roomid: roomid \}, ShowMessages);\
\
    var runonce = true;\
\
    // Display Messages\
    function ShowMessages(data) \{\
        $("div#Posts ul").remove();\
        var messages = $("<ul data-role='listview' />");\
        messages.find("li").remove();\
        $.each(data.Result, function (i, item) \{\
            var li = $("#messageItem li").clone().attr("rel", item.Name); \
            $.each(item.Attributes, function (a, attribute) \{\
\
                switch (attribute.Name.toLowerCase()) \{\
                    case ("name"): $(".name", li).text(attribute.Value); break;\
                    case ("userid"): $(".name", li).attr("rel", attribute.Value); break;\
                    case ("message"): $(".message", li).text(attribute.Value); break;\
                    case ("time"): $(".time", li).text(new Date(parseInt(attribute.Value)).toRelativeTime()); break;\
                    default: break;\
                \}\
            \});\
\
            messages.prepend(li.show()).show(); \
        \});\
\
        $("div#Posts").append(messages);\
        messages.find("li:first").hide().fadeIn();\
\
       $(".ui-page").trigger("create");\
       function sctop() \{  //$.mobile.silentScroll( $(document).height() / 2 );\
\
           divScroll.activeScroll();\
           if (runonce) \{\
               var objDiv = document.getElementById("divExample");\
               objDiv.scrollTop = objDiv.scrollHeight;\
               runonce = false;\
           \}\
       \}\
       \
       $("#Posts").height($(window).height() - $("#postBox").height() - $("#notification_bar").height() - $("#logoHeader").height() -9);\
        setTimeout(sctop, 12);\
\
      \
    \}\
\
    //get room name\
    //notification_bar\
    ServerCyde.SimpleDB.Get.GetRoom(\{"ItemName": roomid\}, RoomInfo);\
    function RoomInfo(data) \{\
        $.each(data.Result, function (i, item) \{\
            $.each(item.Attributes, function (a, attribute) \{\
                switch (attribute.Name.toLowerCase()) \{\
                    case ("name"): $("#roomName").text(attribute.Value); break;\
                    case ("userid"): break;\
                    case ("description"): break;\
                    default: break;\
                \}\
            \});\
        \});\
        \
    \}\
\
    //subscribe\
    ServerCyde.Comet.Subscribe(roomid, function (data) \{ ServerCyde.SimpleDB.Select.GetRoomMessages(\{ roomid: roomid \}, ShowMessages); \}); //temporary way to refresh page \
\
    function postError(data) \{ alert(data.val.Errors.join(", ")); $("input#postMessageBtn").button('enable'); \}\
\
    //publish\
    $("#postMessageBtn").click(function () \{\
        $("#message").textinput('disable');\
        //save to DB\
        ServerCyde.SimpleDB.Modify.UpSertChat(\{ "Item.1.message": $("input#message").val(), "Item.1.roomid": roomid \}, function () \{\
            ServerCyde.Comet.Publish(roomid, $("input#message").val(), function () \{ $("input#message").val(""); $("#message").textinput('enable'); \}, postError)//publish\
        \}, postError);\
    \});\
    $("#message").keydown(function (event) \{ if (event.keyCode == 13) \{ $("#postMessageBtn").trigger("click"); return false; \} \});\
\
\}\
\
function CreateRoomPage(event) \{\
\
    $("#roomname").keydown(function (event) \{ if (event.keyCode == 32) return false; \});\
\
    $("#addNewRoomBtn").click(function () \{  //create room then go to it\
        $("#roomname").val($("#roomname").val().replace(" ", ""));\
        ServerCyde.SimpleDB.Modify.UpSertRoom($("#newRoomForm").serialize(), RoomCreated);\
    \});\
\
    function RoomCreated(data) \{\
        window.location.href = "/?=" + data.ItemName[0]; \
    \}\
\}\
\
function HomePage(event) \{\
\
    if ($.mobile.path.parseUrl(window.location).search.indexOf("?=") == 0) \{\
        roomid = $.mobile.path.parseUrl(window.location).search.split("=")[1];\
    \}\
\
    function userCreated(data) \{\
        if (roomid)\
            $.mobile.changePage("/r/", "slide", false, false);\
        else\
            ServerCyde.User.Details(HandleRecognisedUser);\
    \}\
\
    $("#GoToNewRoom").click(function () \{  $.mobile.changePage("/c/");  \});\
    $("#signUpBtn").click(function () \{ ServerCyde.User.SignUp($("#newUser").serialize(), userCreated); \});\
    \
    function HandleRecognisedUser(user) \{\
        if (userExists = user.id > 0) \{\
            if (roomid)\
                $.mobile.changePage("/r/", "slide", false, false);\
            else \{\
                $("#username").text(user.name).fadeIn();\
                $("#newUser, #recognised").slideToggle();\
            \}\
        \} \
    \}\
    ServerCyde.User.Details(HandleRecognisedUser);\
\}\
\
\
//    ServerCyde.SimpleDB.Select.SelectAllChats(null, delchats);\
//    function delchats(data) \{\
//        $.each(data.Result, function (i, item) \{\
//           // ServerCyde.SimpleDB.Modify.DeleteMessages(\{ "Item.1.ItemName": item.Name \});\
//        \});\
//    \}\
\
\
}