// Depends on jquery

function createClickEvent(url, should_create_security_training_event){
	$(document).ready(function() {
		$.ajax({
			type: "POST",
			url: url,
			data: JSON.stringify(
				{
					should_create_security_training_event: should_create_security_training_event
				}
			),
			contentType: "application/json; charset=utf-8",
			dataType: "json",
		});
	});
}
