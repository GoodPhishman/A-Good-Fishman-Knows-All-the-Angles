














exports.EventIds =
{
    Unknown: 0,
    
    Event_PaginationControl_ViewSwitch: 10000,
    
    Api_GetOneTimeCode: 20000,
    Api_GetOneTimeToken: 20001,
    Api_CanaryValidation: 20002,
    Api_GetCustomCss: 20003,
    Api_GetCredentialType: 20004,
    Api_CheckSessionState: 20005,
    Api_GetIwaSsoToken: 20006,
    Api_OtcAuthentication: 20007,
    Api_DeviceAuthentication: 20008,
    Api_BeginOtcAuthentication: 20009,
    Api_ConfirmOneTimeCode: 20010,
    Api_BeginSessionApproval: 20011,
    Api_EndSessionApproval: 20012,
    Api_Forget: 20013,
    Api_GetRecoveryCredentialType: 20014,
    
    Redirect_Unknown: 40000,
    Redirect_MSASignUpPage: 40001,
    Redirect_AADSignUpPage: 40002,
    Redirect_SkipZeroTouch: 40003,
    Redirect_ResetPasswordPage: 40004,
    Redirect_MSAUserRecoveryPage: 40005,
    Redirect_OtherIdpRedirection: 40006,
    Redriect_SwitchUser: 40007
    
    
};


exports.EventLevel =
{
    None: 0x0,
    Critical: 0x0001,
    Info: 0x0002,
    ApiRequest: 0x0004,
    CXH: 0x0008,
    Debug: 0x0010,
    Verbose: 0x0020,
    All: 0xFFFF
};


exports.HidingMode =
{
    
    None: 0,
    
    Hide: 1,
    
    Mask: 2
};


exports.DataPointScope =
{
    ClientEvent: 1,
    Global: 2
};


exports.EventStage =
{
    None: 0,
    Begin: 1,
    End: 2
};
