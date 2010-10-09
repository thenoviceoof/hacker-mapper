$(document).ready(function() {
	$("#map").dblclick(function(event) {
		var x = event.pageX-this.offsetLeft;
		var y = event.pageY-this.offsetTop;
		var name = $("#group_name").val();
		var members = $("#group_mems").val();
		var proj = $("#group_idea").val();
		$.post("/maps",{group:name,project:proj,members:members,x:x,y:y,authenticity_token:encodeURIComponent(AUTH_TOKEN)});
	    });
    });