/*!
 * ------------------------------------------- START OF THIRD PARTY NOTICE -----------------------------------------
 * 
 * This file is based on or incorporates material from the projects listed below (Third Party IP). The original copyright notice and the license under which Microsoft received such Third Party IP, are set forth below. Such licenses and notices are provided for informational purposes only. Microsoft licenses the Third Party IP to you under the licensing terms for the Microsoft product. Microsoft reserves all other rights not expressly granted under this agreement, whether by implication, estoppel or otherwise.
 * 
 *   json2.js (2016-05-01)
 *   https://github.com/douglascrockford/JSON-js
 *   License: Public Domain
 * 
 * Provided for Informational Purposes Only
 * 
 * ----------------------------------------------- END OF THIRD PARTY NOTICE ------------------------------------------
 */
(window.webpackJsonp=window.webpackJsonp||[]).push([[24],{453:function(e,n,t){var i=t(2),o=t(0),r=t(1),a=t(4),s=t(557),d=t(3),c=t(28),l=t(31),u=t(11).getInstance(window.ServerData),p=t(7),w=t(6),v=t(14),f=t(5),h=t(9),_=t(16),x=t(19);var g=window,T=d.String,b=o.PaginatedState,C=o.LoginMode,k=o.CredentialType,P=o.EstsError,m=r.Helper,S=s.GrctResultAction;function R(e){var n=this,o=e.serverData,r=e.serverError,d=e.isInitialView,c=e.username,g=e.displayName||"",R=e.hipRequiredForUsername,y=e.passwordBrowserPrefill,D=e.availableCreds||[],L=e.evictedCreds||[],E=e.defaultKmsiValue,I=e.userTenantBranding,B=e.sessions,F=e.callMetadata,V=e.flowToken,A=e.useEvictedCredentials,W=e.showCredViewBrandingDesc,O=e.supportsNativeCredentialRecovery,U=o.str,H=o.iLoginMode,N=o.urlHIPScript,M=o.sRemoteConnectAppName,q=o.fAllowCancel,K=o.urlSwitch,G=o.urlSkipZtd,Z=o.fLockUsername,j=o.fShowSwitchUser,J=o.fPOST_ForceSignin,z=o.sZtdFriendlyName,$=o.sZtdTenantName,X=o.sZtdUpnHint,Y=o.fShowButtons,Q=o.sErrorCode,ee=o.fShowHipOnNewView,ne=(o.fLogSkipToOfflineAccountAction,o.fHideOfflineAccountWithNoSkipString,o.sUnauthSessionID),te=o.iRequestLCID,ie=o.sSiteId,oe=o.sClientId,re=o.sForwardedClientId,ae=o.sNoPaBubbleVersion,se=!1,de=null,ce=!1,le=!1,ue={},pe=null,we={},ve=!1,fe=i.observable(!1),he=i.observable();function _e(){n.onSubmitReady()}function xe(e){n.isBackButtonVisible(e),n.onSetBackButtonState(Y&&e)}function ge(e){return e.getResponseJson&&(e=e.getResponseJson()),{success:!0,userCode:e.UserCode,deviceCode:e.SessionLookupKey}}function Te(){return n.setDefaultFocus(),{success:!1}}n.onSwitchView=a.create(),n.onSubmitReady=a.create(),n.onResetPassword=a.create(u.getDefaultEventTracingOptions(w.ClientTracingEventIds.ComponentEvent_LoginPaginatedPasswordView_onResetPassword,!0)),n.onRedirect=a.create(),n.onSetBackButtonState=a.create(),n.onSetPendingRequest=a.create(),n.onUpdateFlowToken=a.create(),n.onRestoreIsRecoveryAttemptPost=a.create(),n.passwordTextbox=new l(i.pureComputed((function(){var e;if(he())return he();if(!fe())return e=r||null,r=null,e;return n.passwordTextbox.value()?null:U.CT_PWD_STR_Error_MissingPassword})),y),n.passwordTextbox.value.extend({logValue:u.getPasswordTextBoxPropertyLogOption(n,{eventId:w.ClientTracingEventIds.PropertyValue_LoginPaginatedPasswordView_Password})}),n.passwordTextbox.error.extend({logValue:u.getPropertyLogOption(n,{eventId:w.ClientTracingEventIds.PropertyValue_LoginPaginatedPasswordView_ClientError})}),n.hipInterface=i.observable(),n.isKmsiChecked=i.observable(E).extend({logValue:u.getPropertyLogOption(n,{eventId:w.ClientTracingEventIds.PropertyValue_LoginPaginatedPasswordView_KMSI})}),n.isRequestPending=i.observable(!1),n.unsafe_username=i.observable(),n.showTileLogo=i.observable(!1),n.isBackButtonVisible=i.observable(!1),n.secondaryButtonText=i.observable(),n.useEvictedCredentials=i.observable(A),n.showPassword=i.observable(!1),n.shouldHipInit=i.observable(!1),n.tenantBranding=null,n.unsafe_displayName=null,n.username=c,n.unsafe_passwordAriaLabel=null,n.hasRemoteNgc=!1,n.availableCreds=D,n.evictedCreds=L,n.allowPhoneDisambiguation=!1,n.unsafe_pageDescription=null,n.unsafe_pageTitle=null,n.unsafe_skipZTDLinkText=null,n.isInitialView=d,n.showHipOnPasswordView=!1,n.showChangeUserLink=!1,n.callMetadata=F,n.flowToken=V,n.showCredViewBrandingDesc=W,n.supportsNativeCredentialRecovery=O,n.hideForgotMyPassword=!1,n.unsafe_forgotPasswordText=U.STR_SSSU_ForgotPassword||U.CT_PWD_STR_ForgotPwdLink_Text,n.hidePasswordReset=!1,n.accessRecoveryLink=null,u.attachViewLoadClientTracingOptions(n,{eventId:w.ClientTracingEventIds.Event_LoginPaginatedPasswordView_onLoad}),n.saveSharedData=function(e){var t=ue.result;e.remoteNgcParams.requestSent=!1,e.useEvictedCredentials=ce||n.useEvictedCredentials(),e.password=n.passwordTextbox.value(),e.showCredViewBrandingDesc=!1,e.remoteLoginUserCode=t?t.userCode:null,e.remoteLoginDeviceCode=t?t.deviceCode:null,e.isRecoveryAttemptPost=ve,de&&(e.otcCredential=de),ve&&(e.recoveryCredentialsData=we)},n.getState=function(){return{isKmsiChecked:n.isKmsiChecked(),useEvictedCredentials:n.useEvictedCredentials(),grctRequestHelperState:O?pe.getState():null}},n.restoreState=function(e){e&&(n.isKmsiChecked(e.isKmsiChecked),n.useEvictedCredentials(e.useEvictedCredentials),O&&pe.restoreState(e.grctRequestHelperState))},n.setDefaultFocus=function(){n.passwordTextbox.focused(!0)},n.primaryButton_onClick=function(){var e=n.hipInterface();if(!se&&!n.isRequestPending())if(fe(!0),e&&e.enableValidation(),null===n.passwordTextbox.error())if(e){if(null!==e.getError())return void e.focus();se=!0,e.verify((function(){se=!1,_e()}))}else le&&ee?n.onSwitchView(b.Hip):_e();else n.setDefaultFocus()},n.secondaryButton_onClick=function(){n.onSwitchView(b.Previous)},n.phoneDisambiguation_onClick=function(){n.onSwitchView(b.PhoneDisambiguation)},n.resetPassword_onClick=function(){if(O){var e=m.htmlUnescape(g);n.isRequestPending(!0),n.onSetPendingRequest(!0),h.throwUnhandledExceptionOnRejection(pe.sendAsync(e,V,k.Password).then((function(e){switch(n.isRequestPending(!1),n.onSetPendingRequest(!1),e.flowToken&&(V=e.flowToken,n.onUpdateFlowToken(e.flowToken)),e.action){case S.ShowError:he(e.error),n.setDefaultFocus();break;case S.SwitchView:we=i.utils.extend(e.sharedData,e.viewParams||{}),ve=!0,n.onSwitchView(e.viewId)}})))}else n.onResetPassword(g)},n.selectAccount_onClick=function(){Z&&K?n.onRedirect({url:K,eventOptions:{eventId:p.EventIds.Redriect_SwitchUser}}):n.onSwitchView(B.length?b.Tiles:b.Username)},n.hip_onHipLoad=function(){n.isRequestPending(!1),null!==n.passwordTextbox.error()&&n.setDefaultFocus()},n.skip_onClick=function(){null},n.switchToRemoteNGC_onClick=function(){n.onSwitchView(b.RemoteNGC)},n.skipZtd_onClick=function(){n.onRedirect({url:G,eventOptions:{eventId:p.EventIds.Redirect_SkipZeroTouch}})},n.privacy_onClick=function(){n.onSwitchView(b.ViewAgreement)},n.tileLogo_onLoad=function(){n.showTileLogo(!0)},n.desktopSso_onSuccess=function(){n.onSubmitReady()},n.switchToEvictedCredPicker_onClick=function(){ce=!0,n.onSwitchView(b.CredentialPicker)},n.credSwitchLink_onSwitchView=function(e,t,i){i&&(de=i),n.onSwitchView(e,t)},n.credSwitchLink_onSetPendingRequest=function(e){n.onSetPendingRequest(e),n.isRequestPending(e)},n.credSwitchLink_onUpdateFlowToken=function(e){e&&(V=e,n.onUpdateFlowToken(e))},n.remoteLogin_onClick=function(){var e;h.throwUnhandledExceptionOnRejection((e=_.Purpose.XboxRemoteConnect,function(e){return new f((function(n,t){new x({purpose:e,flowToken:V,unauthSessionId:ne,lcid:te,siteId:ie,clientId:oe,forwardedClientId:re,noPaBubbleVersion:ae,successCallback:n,failureCallback:t}).sendRequest()}))}(e).then(ge,Te)).then((function(e){e.success&&(ue.result=e,n.onSwitchView(b.RemoteLoginPolling))})))},function(){var e=m.htmlUnescape(g);if(n.unsafe_username(m.htmlUnescape(c)),n.unsafe_displayName=i.observable(e).extend({preventExternalWrite:null}),n.allowPhoneDisambiguation=!Z&&!T.isEmailAddress(g)&&!T.isSkypeName(g)&&T.isPhoneNumber(g),n.hasRemoteNgc=!!i.utils.arrayFirst(D,(function(e){return e.credType===k.RemoteNGC})),le=!!N&&c===R,n.showHipOnPasswordView=le&&!ee,n.showChangeUserLink=j&&(Z&&K||d),n.tenantBranding=I,M&&d?n.unsafe_pageDescription=T.format(U.CT_PWD_STR_RemoteConnect_PasswordPage_Desc,M,e):H===C.ForceSignin||H===C.ForceSigninMobile||H===C.ForceSigninHost||J?n.unsafe_pageDescription=function(e,n){switch(e){case P.SsoArtifactExpiredDueToConditionalAccess:return U.WF_STR_ASLP_Info;case P.SsoArtifactExpiredDueToConditionalAccessReAuth:return U.WF_STR_ReAuth_Info;default:return T.format(U.WF_STR_ForceSI_Info,n)}}(Q,e):U.CT_PWD_STR_EnterPassword_Desc&&(n.unsafe_pageDescription=T.format(U.CT_PWD_STR_EnterPassword_Desc,e)),X&&$){var r=m.htmlUnescape($);n.unsafe_pageTitle=z?T.format(U.CT_Win10_PwdWithOrgDomain_AndFriendlyName,m.htmlUnescape(z),r):T.format(U.CT_Win10_STR_Pwd_Title_WithOrgDomain,r),n.unsafe_skipZTDLinkText=T.format(U.CT_Win10_STR_Pwd_StartOver_WithOrgDomain,r)}else n.unsafe_pageTitle=U.CT_PWD_STR_EnterYourPassword_Title,n.unsafe_skipZTDLinkText=U.CT_Win10_STR_StartOver;if(n.unsafe_passwordAriaLabel=T.format(U.CT_PWD_STR_PwdTB_AriaLabel,e),n.showHipOnPasswordView&&n.isRequestPending(!0),n.unsafe_displayName.subscribe((function(){setTimeout((function(){n.passwordTextbox.value(null)}),0)})),d?q&&xe(!0):xe(!0),N&&n.showHipOnPasswordView&&t.e(1).then(function(){t(686),n.shouldHipInit(!0)}.bind(null,t))["catch"](t.oe),I){var a=v.getLayoutTemplateConfig(I);I.ForgotPasswordText&&(n.unsafe_forgotPasswordText=m.htmlUnescape(I.ForgotPasswordText)),n.accessRecoveryLink=I.AccessRecoveryLink,n.hideForgotMyPassword=a.hideForgotMyPassword||a.hideAccountResetCredentials,n.hidePasswordReset=a.hideResetItNow||a.hideAccountResetCredentials}O&&(pe=new s(o),n.onRestoreIsRecoveryAttemptPost())}()}c.applyExtenders(i),i.components.register("login-paginated-password-view",{viewModel:R,template:t(558),synchronous:!g.ServerData.iMaxStackForKnockoutAsyncComponents||r.Helper.isStackSizeGreaterThan(g.ServerData.iMaxStackForKnockoutAsyncComponents),enableExtensions:!0}),e.exports=R},557:function(e,n,t){var i=t(0),o=t(5),r=t(3),a=t(12),s=t(7),d=r.String,c=r.Object,l=i.CredentialType,u=i.ApiErrorCodes,p=i.EstsError,w=i.PaginatedState,v=h.GrctResultAction={ShowError:1,SwitchView:2},f=h.GrctRequestHelperFlags={DisableAutoSend:1};function h(e,n){var t=this,h={},_=e,x=0!=(n&f.DisableAutoSend),g=_.str,T=_.fCheckApiCanary,b=_.urlGetRecoveryCredentialType,C=_.arrProofData||{},k=_.fIsRestrictedWsi;function P(e){e.proof.str={},c.extend(e.proof.str,C[e.proof.type]||{})}function m(e){var n={};if(e&&e.error)switch(e.error.code){case u.AuthFailure:n=y(g.CT_PWD_STR_Error_FlowTokenExpired);break;case p.TenantDoesNotSupportNativeCredentialRecovery:case p.UserDoesNotSupportNativeCredentialRecovery:case p.CredentialDoesNotSupportNativeRecovery:n=y(g.CT_PWD_STR_Error_CredentialDoesNotSupportNativeRecovery);break;default:n=y(g.CT_PWD_STR_Error_GetRecoveryCredentialTypeError)}else n=y(g.CT_PWD_STR_Error_GetRecoveryCredentialTypeError);return n.flowToken=e.FlowToken||null,n}function S(e){var n=e.Credentials,t=null;return n&&(t=n.PrefCredential),t}function R(e,n){return{action:v.SwitchView,viewId:e,viewParams:n}}function y(e,n,t){return{action:v.ShowError,error:e,isBlockingError:n,bypassCache:t}}t.sendAsync=function(e,n,r){var c=d.cleanseUsername(e,!0),u=h[c]?h[c]:null,p=u||function(e,n){return new o((function(t,o){new a({checkApiCanary:T}).Json({url:b,eventId:s.EventIds.Api_GetRecoveryCredentialType},{targetCredential:e,flowToken:n},t,o,i.DefaultRequestTimeout)}))}(r,n);return o.all([p]).then((function(e){var n=e[0];return function(e,n){var i={},o=t.getGrctSharedData(e,n);(i=function(e){var n=S(e);if(k&&!(e.Credentials.HasPassword||e.Credentials.HasGoogleFed||e.Credentials.HasCertAuth||e.Credentials.HasFido||e.Credentials.HasRemoteNGC||e.Credentials.HasPhone||e.Credentials.HasFacebookFed)&&n!==l.AccessPass)return R(w.MoreInfo);switch(n){case l.OneTimeCode:var t=w.OneTimeCodeRecovery;return x&&(t=w.ConfirmSend),R(t);default:return y(g.CT_PWD_STR_Error_GetRecoveryCredentialTypeError,!1,!0)}}(n)).flowToken=n.FlowToken||null,i.bypassCache||(h[e]=n,h[e].FlowToken=null);return i.sharedData=o,i}(c,n)}),m)},t.getState=function(){return{cache:h}},t.restoreState=function(e){e&&(h=e.cache||{})},t.getGrctSharedData=function(e,n){var t={},i=S(n);return t.preferredCredential=i,t.availableRecoveryCreds=function(e,n){var t=[];if(C[PROOF.Type.Email]){var i=function(e,n){var t=[];if(S(n)===l.OneTimeCode){var i={credType:l.OneTimeCode,proof:{display:e,data:d.cleanseUsername(e),otcSent:!0,isEncrypted:!1,isDefault:!0,isNopa:!0,type:PROOF.Type.Email}};t.push(i)}return t}(e,n);i.length>0&&(r.Array.forEach(i,P),t=t.concat(i))}return t}(e,n),i===l.OneTimeCode&&(t.otcCredential=r.Array.first(t.availableRecoveryCreds,(function(e){return e.credType===l.OneTimeCode&&e.proof.otcSent}))),t.otcParams={requestSent:i===l.OneTimeCode},t}}e.exports=h},558:function(e,n,t){e.exports="\x3c!-- "+(t(32),t(13),t(29),' --\x3e\n\n\x3c!--  --\x3e\n\n<div aria-hidden="true">\n    <input type="hidden" name="i13" data-bind="value: isKmsiChecked() ? 1 : 0" />\n    <input type="hidden" name="login" data-bind="value: unsafe_username" />\n    \x3c!-- The loginfmt input type is different as some password managers require it to be of type text.\n        Since screen readers might not hide this input, a parent div with aria-hidden true has been added. --\x3e\n    <input type="text" name="loginfmt" data-bind="moveOffScreen, value: unsafe_displayName" />\n    <input type="hidden" name="type"\n        data-bind="value: svr.fUseWizardBehavior ? ')+t(0).PostType.PasswordInline+" : "+t(0).PostType.Password+'" />\n    <input type="hidden" name="LoginOptions"\n        data-bind="value: isKmsiChecked() ? '+t(6).LoginOption.RememberPWD+" : "+t(6).LoginOption.NothingChecked+'" />\n    <input type="hidden" name="lrt" data-bind="value: callMetadata.IsLongRunningTransaction" />\n    <input type="hidden" name="lrtPartition" data-bind="value: callMetadata.LongRunningTransactionPartition" />\n    <input type="hidden" name="hisRegion" data-bind="value: callMetadata.HisRegion" />\n    <input type="hidden" name="hisScaleUnit" data-bind="value: callMetadata.HisScaleUnit" />\n</div>\n\n<div id="loginHeader" class="row" data-bind="externalCss: { \'title\': true }">\n    <div role="heading" aria-level="1" data-bind="text: str[\'CT_PWD_STR_EnterPassword_Title\']"></div>\n</div>\n\n\x3c!-- ko if: showCredViewBrandingDesc --\x3e\n<div class="row text-body">\n    <div id="credViewBrandingDesc" class="wrap-content" data-bind="text: str[\'WF_STR_Default_Desc\']"></div>\n</div>\n\x3c!-- /ko --\x3e\n\n\x3c!-- ko if: unsafe_pageDescription --\x3e\n<div class="row text-body">\n    <div id="passwordDesc" class="wrap-content" data-bind="text: unsafe_pageDescription"></div>\n</div>\n\x3c!-- /ko --\x3e\n\n<div class="row">\n    <div class="form-group col-md-24">\n        <div role="alert" aria-live="assertive">\n            \x3c!-- ko if: passwordTextbox.error --\x3e\n            <div id="passwordError" data-bind="\n                externalCss: { \'error\': true },\n                htmlWithBindings: passwordTextbox.error,\n                childBindings: {\n                    \'idA_IL_ForgotPassword0\': {\n                        href: accessRecoveryLink || svr.urlResetPassword,\n                        attr: {\n                            target: accessRecoveryLink && \'_blank\',\n                            role: supportsNativeCredentialRecovery ? \'button\' : \'link\'\n                        },\n                        click: accessRecoveryLink ? null : resetPassword_onClick } }"></div>\n            \x3c!-- /ko --\x3e\n        </div>\n\n        <div class="placeholderContainer" data-bind="component: { name: \'placeholder-textbox-field\',\n            publicMethods: passwordTextbox.placeholderTextboxMethods,\n            params: {\n                serverData: svr,\n                hintText: str[\'CT_PWD_STR_PwdTB_Label\'] },\n            event: {\n                updateFocus: passwordTextbox.textbox_onUpdateFocus } }">\n\n            <input name="passwd" type="password" id="i0118" autocomplete="off" class="form-control" aria-required="true" data-bind="\n                textInput: passwordTextbox.value,\n                ariaDescribedBy: [\n                    \'loginHeader passwordError\',\n                    showCredViewBrandingDesc ? \'credViewBrandingDesc\' : \'\',\n                    unsafe_pageDescription ? \'passwordDesc\' : \'\'].join(\' \'),\n                hasFocusEx: passwordTextbox.focused() && !showPassword(),\n                placeholder: $placeholderText,\n                ariaLabel: unsafe_passwordAriaLabel,\n                moveOffScreen: showPassword,\n                externalCss: {\n                    \'input\': true,\n                    \'text-box\': true,\n                    \'has-error\': passwordTextbox.error }" />\n\n            \x3c!-- ko if: svr.fUsePasswordPeek && showPassword() --\x3e\n            <input type="text" autocomplete="off" class="form-control" aria-required="true" data-bind="\n                textInput: passwordTextbox.value,\n                ariaDescribedBy: [\n                    \'loginHeader\',\n                    showCredViewBrandingDesc ? \'credViewBrandingDesc\' : \'\',\n                    unsafe_pageDescription ? \'passwordDesc\' : \'\'].join(\' \'),\n                hasFocusEx: true,\n                placeholder: $placeholderText,\n                ariaLabel: unsafe_passwordAriaLabel,\n                externalCss: {\n                    \'input\': true,\n                    \'text-box\': true,\n                    \'has-error\': passwordTextbox.error }" />\n            \x3c!-- /ko --\x3e\n        </div>\n\n        \x3c!-- ko if: svr.fUsePasswordPeek --\x3e\n        <div class="checkbox no-margin-bottom">\n            <label>\n                <input id="ShowHidePasswordCheckbox" type="checkbox" data-bind="checked: showPassword, ariaLabel: str[\'CT_PWD_STR_ShowPasswordAriaLabel\']" />\n                <span id="ShowHidePasswordLabel" data-bind="text: str[\'CT_PWD_STR_ShowPasswordLabel\']"></span>\n            </label>\n        </div>\n        \x3c!-- /ko --\x3e\n    </div>\n</div>\n\n\x3c!-- ko if: shouldHipInit --\x3e\n<div data-bind="component: { name: \'hip-field\',\n    publicMethods: hipInterface,\n    params: {\n        str: str,\n        onDemandVerify: true,\n        hasServerError: svr.fHIPError,\n        useFake: svr.fUseFakeHIP },\n    event: {\n        hipLoad: hip_onHipLoad } }">\n</div>\n\x3c!-- /ko --\x3e\n\n<div data-bind="css: { \'position-buttons\': !tenantBranding.BoilerPlateText }, externalCss: { \'password-reset-links-container\': true }">\n    <div>\n        \x3c!-- ko if: svr.fShowPersistentCookiesWarning --\x3e\n        <div class="row text-body">\n            <div id="swv-warning" class="wrap-content" data-bind="text: str[\'CT_PWD_STR_PersistentCookies_Warning\']"></div>\n        </div>\n        \x3c!-- /ko --\x3e\n        \x3c!-- ko if: svr.fKMSIEnabled !== false && !svr.fShowPersistentCookiesWarning && !tenantBranding.KeepMeSignedInDisabled --\x3e\n        <div id="idTd_PWD_KMSI_Cb" class="form-group checkbox text-block-body no-margin-top" data-bind="visible: !svr.fLockUsername && !showHipOnPasswordView">\n            <label id="idLbl_PWD_KMSI_Cb">\n                <input name="KMSI" id="idChkBx_PWD_KMSI0Pwd" type="checkbox" data-bind="checked: isKmsiChecked, ariaLabel: str[\'CT_PWD_STR_KeepMeSignedInCB_Text\']" />\n                <span data-bind="text: str[\'CT_PWD_STR_KeepMeSignedInCB_Text\']"></span>\n            </label>\n        </div>\n        \x3c!-- /ko --\x3e\n\n        <div class="row">\n            <div class="col-md-24">\n                <div class="text-13">\n                    \x3c!-- ko if: svr.urlSkipZtd && svr.sZtdUpnHint --\x3e\n                    <div class="form-group">\n                        <a id="idSkipZtdLink" name="switchToOfflineAccount" href="#" data-bind="\n                            text: unsafe_skipZTDLinkText,\n                            click: skipZtd_onClick"></a>\n                    </div>\n                    \x3c!-- /ko --\x3e\n                    \x3c!-- ko ifnot: hideForgotMyPassword --\x3e\n                    <div class="form-group">\n                        <a id="idA_PWD_ForgotPassword" role="link" href="#" data-bind="\n                            text: unsafe_forgotPasswordText,\n                            href: accessRecoveryLink || svr.urlResetPassword,\n                            attr: { target: accessRecoveryLink && \'_blank\' },\n                            click: accessRecoveryLink ? null : resetPassword_onClick"></a>\n                    </div>\n                    \x3c!-- /ko --\x3e\n                    \x3c!-- ko if: allowPhoneDisambiguation --\x3e\n                    <div class="form-group">\n                        <a id="switchToPhoneDisambiguation" href="#" data-bind="text: str[\'WF_STR_ThisIsntMyNumber_Text\'], click: phoneDisambiguation_onClick"></a>\n                    </div>\n                    \x3c!-- /ko --\x3e\n                    \x3c!-- ko ifnot: useEvictedCredentials --\x3e\n                        \x3c!-- ko component: { name: "cred-switch-link-control",\n                            params: {\n                                serverData: svr,\n                                username: username,\n                                availableCreds: availableCreds,\n                                flowToken: flowToken,\n                                currentCred: { credType: '+t(0).CredentialType.Password+' } },\n                            event: {\n                                switchView: credSwitchLink_onSwitchView,\n                                redirect: onRedirect,\n                                setPendingRequest: credSwitchLink_onSetPendingRequest,\n                                updateFlowToken: credSwitchLink_onUpdateFlowToken } } --\x3e\n                        \x3c!-- /ko --\x3e\n\n                        \x3c!-- ko if: evictedCreds.length > 0 --\x3e\n                        <div class="form-group">\n                            <a id="evictedAccount" href="#" data-bind="text: str[\'CT_PWD_STR_SwitchToCredPicker_Link_EvictedAcct\'], click: switchToEvictedCredPicker_onClick"></a>\n                        </div>\n                        \x3c!-- /ko --\x3e\n                    \x3c!-- /ko --\x3e\n                    \x3c!-- ko if: showChangeUserLink --\x3e\n                    <div class="form-group">\n                        <a id="i1668" href="#" data-bind="text: str[\'CT_FED_STR_ChangeUserLink_Text\'], click: selectAccount_onClick"></a>\n                    </div>\n                    \x3c!-- /ko --\x3e\n                </div>\n            </div>\n        </div>\n    </div>\n\n    <div class="win-button-pin-bottom" data-bind="css : { \'boilerplate-button-bottom\': tenantBranding.BoilerPlateText }">\n        <div class="row" data-bind="css: { \'move-buttons\': tenantBranding.BoilerPlateText }">\n            <div data-bind="component: { name: \'footer-buttons-field\',\n                params: {\n                    serverData: svr,\n                    primaryButtonText: str[\'CT_PWD_STR_SignIn_Button\'],\n                    isPrimaryButtonEnabled: !isRequestPending(),\n                    isPrimaryButtonVisible: svr.fShowButtons,\n                    isSecondaryButtonEnabled: true,\n                    isSecondaryButtonVisible: false },\n                event: {\n                    primaryButtonClick: primaryButton_onClick } }">\n            </div>\n        </div>\n    </div>\n</div>\n\n\x3c!-- ko if: tenantBranding.BoilerPlateText --\x3e\n<div id="idBoilerPlateText" class="wrap-content" data-bind="\n    htmlWithMods: tenantBranding.BoilerPlateText,\n    htmlMods: { filterLinks: svr.fIsHosted },\n    css: { \'transparent-lightbox\': tenantBranding.UseTransparentLightBox },\n    externalCss: { \'boilerplate-text\': true }"></div>\n\x3c!-- /ko --\x3e\n'}}]),window.__convergedlogin_ppassword_d4aa6f34855682e39ee8=!0;
//# sourceMappingURL=../d4aa6f34855682e39ee8.map