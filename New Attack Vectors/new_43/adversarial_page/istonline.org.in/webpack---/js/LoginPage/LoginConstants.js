exports.Tokens =
{
    Username: "#~#MemberName_LS#~#"
};

exports.Fed =
{
    DomainToken: "#~#partnerdomain#~#",
    FedDomain: "#~#FederatedDomainName_LS#~#",
    Partner: "#~#FederatedPartnerName_LS#~#"
};

exports.LoginOption =
{
    DoNotRemember: 0,
    RememberPWD: 1,
    NothingChecked: 3
};

exports.StringsVariantId =
{
    Default: 0,
    SkypeMoveAlias: 1,
    CombinedSigninSignup: 2,
    CombinedSigninSignupDefaultTitle: 3,
    RemoteConnectLogin: 4,
    CombinedSigninSignupV2: 5,
    CombinedSigninSignupV2WelcomeTitle: 6
};

exports.AllowedIdentitiesType =
{
    MsaOnly: 0,
    AadOnly: 1,
    Both: 2
};

exports.SessionIdp =
{
    Aad: 0,
    Msa: 1
};

exports.ClientTracingEventIds =
{
    
    Event_LoginPaginatedUsernameView_onLoad: 110000,
    Event_LoginPaginatedPasswordView_onLoad: 110001,
    
    ComponentEvent_LoginPaginatedUsernameView_onShowDialog: 120000,
    ComponentEvent_LoginPaginatedUsernameView_onAgreementClick: 120001,
    ComponentEvent_LoginPaginatedPasswordView_onResetPassword: 120100,
    
    PropertyValue_LoginPaginatedPageView_IsFidoSupported: 140000,
    PropertyValue_LoginPaginatedUsernameView_Username: 140100,
    PropertyValue_LoginPaginatedUsernameView_ClientError: 140101,
    PropertyValue_LoginPaginatedPasswordView_Password: 140200,
    PropertyValue_LoginPaginatedPasswordView_ClientError: 140201,
    PropertyValue_LoginPaginatedPasswordView_KMSI: 140202
};