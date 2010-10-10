function drawMarker(info) {
    var markid = "marker"+info["id"];
    $("#markers").append("<div id=\""+markid+"\" class='mark'></div>");
    function fetch(event) { fetchOne(info["id"],event); } //currying
    $("#"+markid).click(fetch);
    var pos = $("#map").offset();
    var p = {"left":pos.left+info["x"]-24,
	     "top":pos.top+info["y"]-42};
    $("#"+markid).offset(p);
}

function fetchOne(id,event) {
    // fetch more info about one id
    function fetch(data) { useOne(data,event); } //currying again
    $.ajax({url:"/maps/show/"+id,success:fetch,dataType:"html"});
}
function useOne(data,event) {
    var d = JSON.parse(data);
    var txt = ["<b>Group Name: </b>"+d["group"],
	       "<b>Members: </b>"+d["members"],
	       "<b>Project Description: </b>"+d["project"],
	       "<b>Contact info:</b>"+d["contact"]].join("\n<br/>");
    $("#info").html(txt);
    $("#info_cont").css("left",event.pageX);
    $("#info_cont").css("top",event.pageY);
    $("#info_cont").show();
}

var haveid = [];
function getall() {
    // init get new id process
    $.ajax({url:"/maps/superindex",success:useall,dataType:"html"});
}
function useall(data) {
    // get ids, draw markers
    var d = JSON.parse(data);
    d = d.slice(0,-1);
    for(var i in d) {
	drawMarker(d[i]);
    }
}

var submitted = false;
$(document).ready(function() {
	$("#info_cont").hide();
	getall();
	$("#map").click(function(e){$("#info_cont").hide();});
	$("#map").dblclick(function(event) {
		if(submitted)
		    return;
		var x = event.pageX-this.offsetLeft;
		var y = event.pageY-this.offsetTop;
		var name = $("#group_name").val();
		var members = $("#group_mems").val();
		var proj = $("#group_idea").val();
		var contact = $("#group_cont").val();
		if(name=="" || members=="" || proj=="" || contact=="") {
		    alert("Please fill up all fields with something");
		    return
		}
		var info = {"map":{"group":name,
				   "project":proj,
				   "members":members,
				   "contact":contact,
				   "x":x,
				   "y":y},
			    authenticity_token:encodeURIComponent(AUTH_TOKEN)};
		$.post("/maps/create",info,getall,"json");
		submitted = true;
	    });
    });