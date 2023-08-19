// Depends on jquery

var excludedKeyCodes = [
	8,   // Backspace
	9,   // Tab
	13,  // Enter
	16,  // Shift
	17,  // Ctrl
	18,  // Alt
	20,  // Caps Lock
	27,  // Escape
	33,  // Page Up
	34,  // Page Down
	35,  // End
	36,  // Home
	37,  // Left Arrow
	38,  // Up Arrow
	39,  // Right Arrow
	40,  // Down Arrow
	45,  // Insert
	46   // Delete
];

function confirmDataEntryOnTyping(url, minPressedKeysNum=2) {
	$(document).on('keydown', function(event) {
		var pressedKeys = $(document).data('pressedKeys') || [];

		// Add the pressed key to the array, unless it's an excluded key code
		if (!excludedKeyCodes.includes(event.keyCode || event.which)) {
			pressedKeys.push(event.keyCode || event.which);
			$(document).data('pressedKeys', pressedKeys);
		}

		if (pressedKeys.length >= minPressedKeysNum) {
			window.location.href=url;
		}
	});
}
