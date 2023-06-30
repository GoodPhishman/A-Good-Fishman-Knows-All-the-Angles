(function () {
  var domain;
  var tenantGlobalId;
  var assignmentId;
  var learnerId;
  var urlRe = /(.*)\/([a-zA-Z-0-9]{36})\/a\/([a-zA-Z-0-9]{36})\/ccp\?lid=([a-zA-Z-0-9]{36})/gi;
  var result = urlRe.exec(window.location.href);
  if (result) {
    exist = true;
    domain = result[1];
    tenantGlobalId = result[2];
    assignmentId = result[3];
    learnerId = result[4];
  }
  if (!domain || !tenantGlobalId || !assignmentId || !learnerId) {
    console.error("Unable to get url parameters");
    return;
  }
  var isDev = domain.indexOf("-dev") !== -1;
  var url = "https://outthink-api" + (isDev ? "-dev" : "") + ".azure-api.net/phishing/telemetryInput/" + tenantGlobalId;
  var params = { domain: domain, assignmentId: assignmentId, learnerId: learnerId };

  var credentialEntered = false;

  $.ajaxSetup({
    type: "POST",
    url: url,
    contentType: "application/json; charset=utf-8",
    crossDomain: true,
    timeout: 5000,
    retryAfter: 2000,
  });
  // function sendPageVisitedEvent() {
  //   $.ajax({
  //     data: JSON.stringify($.extend({}, params, { eventType: "CredentialsCapturePageVisited" })),
  //   }).fail(function () {
  //     console.log("Sending telemetry failed...");
  //     setTimeout(function () {
  //       sendPageVisitedEvent();
  //     }, $.ajaxSetup().retryAfter);
  //   });
  // }
  function sendCredentialsEnteredEvent() {
    $.ajax({
      data: JSON.stringify($.extend({}, params, { eventType: "CredentialsEntered" })),
    }).fail(function () {
      console.log("Sending telemetry failed...");
      setTimeout(function () {
        sendCredentialsEnteredEvent();
      }, $.ajaxSetup().retryAfter);
    });
  }
  function sendCredentialsCapturedEvent(lpUrl) {
    $.ajax({
      data: JSON.stringify($.extend({}, params, { eventType: "CredentialsCaptured" })),
    })
      .done(function () {
        window.location.href = lpUrl;
      })
      .fail(function () {
        console.log("Sending telemetry failed...");
        setTimeout(function () {
          sendCredentialsCapturedEvent(lpUrl);
        }, $.ajaxSetup().retryAfter);
      });
  }

  // sendPageVisitedEvent();

  $(document).ready(function () {
    $("#email, #password").on("input", function () {
      if ($(this).val() && !credentialEntered) {
        credentialEntered = true;
        sendCredentialsEnteredEvent();
      }
    });
    $("#form").on("submit", function (e) {
      e.preventDefault();
      var lpUrl = $("#form").data("lp");
      sendCredentialsCapturedEvent(lpUrl);
    });
  });
})();
