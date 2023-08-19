$(document).ready(function () {
    var form = document.getElementById('form_id');
    if (form != null) {
        form.value = new URL(window.location.href).searchParams.get('id');
    }
})