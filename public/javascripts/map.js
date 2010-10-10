var cur_mark;
var size = 48;
var keep_info = false;
function drawMarker(info) {
    var markid = "marker"+info["id"];
    $("#markers").append("<div id=\""+markid+"\" class='mark'></div>");
    function fetch() { 
	if(keep_info)
	    return;
	var x = Math.round(this.offsetLeft+size*0.6);
	var y = Math.round(this.offsetTop +size*0.6);
	cur_mark = $("#"+markid);
	getInfo(info["id"],[x,y]); 
    } //currying
    $("#"+markid).hover(fetch,hide_info);
    $("#"+markid).click(function(){
	    if(keep_info)
		$("#info_cont").hide();
	    else
		$("#info_cont").show();
	    keep_info=toggle(keep_info);
	});
    var pos = $("#map").offset();
    var p = {"left":pos.left+info["x"]-size/2,
	     "top":pos.top+info["y"]-size};
    $("#"+markid).offset(p);
}

function toggle(something) {
    return something ? false : true;
}

function getInfo(id,p) {
    var index = haveid.indexOf(id);
    $("#info").html(builtinfo[index][2]);
    $("#info_cont").css("left",p[0]);
    $("#info_cont").css("top",p[1]);
    $("#info_cont").show();
    cur_mark.css("background-image","url('/images/marker_selected.png')");
    $("#delmarker"+id).click(function(e) {
	    delete_marker(id);
	    e.stopPropagation();
	    e.preventDefault();
	    return false;
	});
}

function delete_marker(id) {
    if(!confirm("Sure you want to delete?"))
	return;
    $.get("/maps/destroy/"+id);
    $("#marker"+id).remove();
    keep_info = false;
    hide_info();
    haveid.splice(haveid.indexOf(id),1);
    setTimeout('getAll();',500);
    return false;
}

function build_info(d) {
    var txt = ["<h3>Info</h3>",
	       "<b>Group Name: </b>"+d["group"],
	       "<b>Members: </b>"+d["members"],
	       "<b>Project Description: </b>"+d["project"],
	       "<b>Contact info: </b>"+d["contact"]].join("\n<br/>");
    txt = "<a href='#' id='delmarker"+d["id"]+"' class='del'>Delete</a>"+txt;
    return txt;
}

var haveid = [];
var builtinfo = [];
function getAll() {
    // init get new id process
    $.get("/maps/superindex",{'id[]':haveid},useall,"html");
}
function useall(data) {
    // get ids, draw markers
    var d = JSON.parse(data);
    add = d["add"].slice(0,-1);
    del = d["del"].slice(0,-1);
    for(var i in add) {
	haveid.push(add[i]["id"]);
	builtinfo.push([d["x"],d["y"],build_info(add[i])]);
	drawMarker(add[i]);
    }
    for(var i in del) {
	$("#marker"+del[i]).remove();
	var id = haveid.indexOf(del[i]);
	haveid.splice(id,1);
	builtinfo.splice(id,1);
    }
}

function checkstatus(data) {
    // get ids, draw markers
    if(data=="failure")
	alert("did not update!");
}

function hide_add() {
    $("#add").hide();
    $("#backdrop").hide();
}

function show_info() {
    if(keep_info)
	return;
    $("#info_cont").show();
    cur_mark.css("background-image","url('/images/marker_selected.png')");
}

function hide_info() {
    if(keep_info)
	return;
    $("#info_cont").hide();
    if(cur_mark)
	cur_mark.css("background-image","url('/images/marker.png')");
}

var pos = [0,0];
var submitted = false;
$(document).ready(function() {
	$("#info_cont").hide();
	hide_add();
	$("#backdrop").click(hide_add);
	//setTimeout('$("#backdrop").css("height",$(document).height())',1000)	
	$("#backdrop").css("height",$(document).height())
	$("#add_close").click(function(){hide_add();});
	$("#map").click(hide_info);
	$("#info_close").click(function(){hide_info();});
	getAll();
	$("#map").dblclick(function(event) {
		$("#add").css("left",$(window).width()/2-$("#add").outerWidth()/2);
		$("#add").css("top",$(window).height()/2-$("#add").outerHeight()/2+$(window).scrollTop());
		pos = [event.pageX-this.offsetLeft,
		       event.pageY-this.offsetTop];
		$("#add").show();
		$("#group_name").focus();
		$("#backdrop").show();});
	//$("#add_form").submit(function(event) {
	$("#submit_group").click(function(event) {
		if(submitted)
		    return;
		var x = pos[0];
		var y = pos[1];
		var name = $("#group_name").val();
		var members = $("#group_mems").val();
		var proj = $("#group_idea").val();
		var contact = $("#group_cont").val();
		if(name=="" || members=="" || proj=="" || contact=="") {
		    alert("Please fill up all fields with something");
		    return;
		}
		var info = {"map":{"group":name,
				   "project":proj,
				   "members":members,
				   "contact":contact,
				   "x":x,
				   "y":y},
			    authenticity_token:encodeURIComponent(AUTH_TOKEN)};
		$.post("/maps/create",info,checkStatus,"json");
		submitted = true;
		event.preventDefault();
		event.stopPropagation();
		hide_add();
		setTimeout('getAll()',1000);
		return;
	    });
	setInterval(getAll,15000);
    });