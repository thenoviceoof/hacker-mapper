// current marker selected
var cur_mark;
// icon size
pvar size = 48;
// click keeps info around
var keep_info = false;

function displayInfo(id,p) {
    var index = haveid.indexOf(id);
    $("#info").html(builtinfo[index][2]);
    $("#info_cont").css("left",p[0]);
    $("#info_cont").css("top",p[1]);
    $("#info_cont").show();
    cur_mark.css("background-image","url('/images/marker_selected.png')");
    $("#delmarker"+id).click(function(e) {
	    deleteMarker(id);
	    e.stopPropagation();
	    e.preventDefault();
	    return false;
	});
}

function drawMarker(info) {
    var markid = "marker"+info["id"];
    $("#markers").append("<div id=\""+markid+"\" class='mark'></div>");
    function fetch() { 
	if(keep_info)
	    return;
	var x = Math.round(this.offsetLeft+size*0.6);
	var y = Math.round(this.offsetTop +size*0.6);
	cur_mark = $("#"+markid);
	displayInfo(info["id"],[x,y]); 
    } //currying
    $("#"+markid).hover(fetch,hideInfo);
    $("#"+markid).click(function(){
	    if(keep_info) {
		keep_info = false;
	    } else {
		keep_info = true;
		$("#info_cont").show();
	    }
	});
    var pos = $("#map").offset();
    var p = {"left":pos.left+info["x"]-size/2,
	     "top":pos.top+info["y"]-size};
    $("#"+markid).offset(p);
}

function deleteMarker(id) {
    if(!confirm("Sure you want to delete?"))
	return;
    $.get("/maps/destroy/"+id);
    $("#marker"+id).remove();
    keep_info = false;
    hideInfo();
    haveid.splice(haveid.indexOf(id),1);
    builtinfo.splice(haveid.indexOf(id),1);
    setTimeout('initUpdate();',500);
    return false;
}

//idlist
var haveid = [];
//infolist
var builtinfo = [];
function initUpdate() {
    $.get("/maps/superindex",{'id[]':haveid},update,"html");
}
function update(data) {
    // get ids, draw markers
    var d = JSON.parse(data);
    add = d["add"].slice(0,-1);
    del = d["del"].slice(0,-1);
    for(var i in add) {
	haveid.push(add[i]["id"]);
	builtinfo.push([d["x"],d["y"],buildInfo(add[i])]);
	drawMarker(add[i]);
    }
    for(var i in del) {
	$("#marker"+del[i]).remove();
	var id = haveid.indexOf(del[i]);
	haveid.splice(id,1);
	builtinfo.splice(id,1);
    }
}

function buildInfo(d) {
    //take info from update, build it
    var txt = ["<h3>Info</h3>",
	       "<b>Group Name: </b>"+d["group"],
	       "<b>Members: </b>"+d["members"],
	       "<b>Project Description: </b>"+d["project"],
	       "<b>Contact info: </b>"+d["contact"]].join("\n<br/>");
    txt = "<a href='#' id='delmarker"+d["id"]+"' class='del'>Delete</a>"+txt;
    return txt;
}

function hideAdd() {
    $("#add").hide();
    $("#backdrop").hide();
}

function hideInfo() {
    if(keep_info)
	return;
    $("#info_cont").hide();
    if(cur_mark)
	cur_mark.css("background-image","url('/images/marker.png')");
}

function handleSubmit() {
    if(submitted)
	return false;
    var x = pos[0];
    var y = pos[1];
    var name = $("#group_name").val();
    var members = $("#group_mems").val();
    var proj = $("#group_idea").val();
    var contact = $("#group_cont").val();
    if(name=="" || members=="" || proj=="" || contact=="") {
	alert("Please fill up all fields with something");
	return false;
    }
    var info = {"map":{"group":name,
		       "project":proj,
		       "members":members,
		       "contact":contact,
		       "x":x,
		       "y":y}};
    return info;
}

var pos = [0,0];
var submitted = false;
$(document).ready(function() {
	$("#info_cont").hide();
	hideAdd();
	$("#backdrop").click(hideAdd);
	$("#backdrop").css("height",$(document).height())
	$("#add_close").click(function(){hideAdd();});
	$("#map").click(hideInfo);
	$("#info_close").click(function(){hideInfo();});
	initUpdate();
	$("#map").dblclick(function(event) {
		$("#add").css("left",$(window).width()/2-$("#add").outerWidth()/2);
		$("#add").css("top",$(window).height()/2-$("#add").outerHeight()/2+$(window).scrollTop());
		pos = [event.pageX-this.offsetLeft,
		       event.pageY-this.offsetTop];
		$("#add").show();
		$("#group_name").focus();
		$("#backdrop").show();});
	$("#submit_group").click(function(event) {
		var info = sanitizeSubmit();
		info["authenticity_token"] = encodeURIComponent(AUTH_TOKEN);
		setTimeout('initUpdate()',1000);
		hideAdd();
		submitted = true;
		$.post("/maps/create",info);
		event.stopPropagation();
		event.preventDefault();
		return false;
	    });
	setInterval(initUpdate,15000);
    });