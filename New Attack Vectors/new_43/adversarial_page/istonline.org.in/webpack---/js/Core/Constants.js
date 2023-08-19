exports.UsernameMaxLength = 113;
exports.SATOTPV1Length = 6;
exports.SATOTPLength = 8;
exports.PhoneNumberConfirmationLength = 4;
exports.OneTimeCodeDefaultLength = 16;
exports.OneTimeCodeMaxLength = 7;
exports.PCExperienceQS = "pcexp";
exports.PCExperienceDisabled = exports.PCExperienceQS + "=false";
exports.NotPreferredCredentialQs = "npc";
exports.AnimationTimeout = 700;
exports.PageSummaryVersion = 1;
exports.GuidTemplate = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx";

exports.Regex =
{
    PhoneNumberValidation: /^[0-9 ()[\].\-#*/+]+$/
};

exports.ProofUpRedirectLandingView =
{
    AccountCompromised: 1,
    RiskySession: 2
};

exports.LoginMode =
{
    None: 0,
    Login: 1,
    ForceCredType: 3,
    LWAConsent: 4,
    GenericError: 5,
    ForceSignin: 6,
    OTS: 7,
    HIP_Login: 8,
    HIP_Lockout: 9,
    InviteBlocked: 10,
    SwitchUser: 11,
    LWADelegation: 12,
    ServiceBlocked: 13,
    IDPFailed: 14,
    StrongAuthOTC: 16,
    StrongAuthMobileOTC: 25,
    Finish: 27,
    LoginWizard_Login: 28,
    StrongAuthWABOTC: 30,
    LoginWizard_HIP_Login: 32,
    LoginWizard_Finish: 34,
    LoginMobile: 36,
    ForceSigninMobile: 37,
    GenericErrorMobile: 38,
    LoginHost: 39,
    ForceSigninHost: 40,
    GenericErrorHost: 42,
    StrongAuthHostOTC: 43,
    HIP_LoginHost: 45,
    HIP_LoginMobile: 46,
    HIP_LockoutHost: 47,
    HIP_LockoutMobile: 48,
    SwitchUserHost: 49,
    LoginXbox_Login: 50,
    HIP_LoginXbox: 51,
    FinishXbox: 52,
    IfExistsXbox: 53,
    StartIfExistsXbox: 54,
    StrongAuthXboxOTC: 55,
    LoginWPWiz_Login: 56,
    LoginWPWiz_HIP_Login: 57,
    LoginWPWiz_Finish: 58,
    StrongAuthWizOTC: 59,
    StrongAuthWPWizOTC: 60,
    FinishWPWiz: 61,
    SwitchUserMobile: 62,
    LoginWPWiz_PhoneSignIn: 63,
    LoginWPWiz_HIP_PhoneSignIn: 64,
    Login_PhoneSignIn: 65,
    Login_HIP_PhoneSignIn: 66,
    LoginHost_PhoneSignIn: 67,
    LoginHost_HIP_PhoneSignIn: 68,
    LoginMobile_PhoneSignIn: 69,
    LoginMobile_HIP_PhoneSignIn: 70,
    LoginWizard_PhoneSignIn: 71,
    LoginWizard_HIP_PhoneSignIn: 72,
    LoginXbox_PhoneSignIn: 73,
    LoginXbox_HIP_PhoneSignIn: 74,
    LoginWin10: 75,
    HIP_LoginWin10: 76,
    FinishWin10: 77,
    FinishBlockedWin10: 78,
    LoginWin10_PhoneSignIn: 79,
    HIP_LoginWin10_PhoneSignIn: 80,
    FinishWin10_TokenBroker: 81,
    SwitchUserWin10: 82,
    ForceSignInXbox: 88,
    LoginClientSDK_Login: 92,
    LoginClientSDK_HIP_Login: 93,
    LoginClientSDK_Finish: 94,
    StrongAuthClientSDKOTC: 95,
    FinishClientSDK: 96,
    LoginClientSDK_PhoneSignIn: 97,
    LoginClientSDK_HIP_PhoneSignIn: 98,
    Win10InclusiveOOBE_Finish: 99,
    Win10InclusiveOOBE_FinishBlocked: 100,
    
    Tiles: 102,
    RemoteConnect: 103,
    
    FedConflict: 105,
    Win10Host_Login: 106,
    Win10Host_Login_PhoneSignin: 107,
    Win10Host_Finish: 108,
    Win10Host_StrongAuth: 109,
    Win10Host_HIP_Login: 110,
    Fido: 111,
    Win10Host_HIP_Login_PhoneSignIn: 112,
    FedLink: 113,
    UserCredentialPolicyBlocked: 114,
    BindFailed: 115,
    Win10HostOOBE_HIP_Login: 116,
    Win10HostOOBE_HIP_Login_PhoneSignIn: 117,
    AadFedConflict: 118,
    ProofFedConflict: 119,
    FedBoundLink: 120,
    FetchSessionsProgress: 121,
    Win10Host_TransferLogin: 122,
    TransferLogin: 123,
    Signup: 124,
    CredentialPicker: 129
};

exports.LoginBody =
{
    Login_OTC: 5
};

exports.SessionPullFlags =
{
    Msa: 1 << 0,
    Dsso: 1 << 1
};

exports.PaginatedState =
{
    
    
    Previous: -1,
    Unknown: 0,
    Username: 1,
    Password: 2,
    OneTimeCode: 3,
    RemoteNGC: 4,
    PhoneDisambiguation: 5,
    LwaConsent: 6,
    IdpDisambiguation: 7,
    IdpRedirect: 8,
    
    ViewAgreement: 10,
    LearnMore: 11,
    Tiles: 12,
    ConfirmSend: 13,
    RemoteConnectCode: 14,
    RemoteLoginPolling: 15,
    BindRedirect: 16,
    TermsOfUse: 17,
    DesktopSsoProgress: 18,
    ResetPasswordSplitter: 19,
    Kmsi: 20,
    CheckPasswordType: 21,
    ChangePassword: 22,
    Fido: 23,
    CredentialPicker: 24,
    Consent: 25,
    Error: 26,
    ConfirmSignup: 27,
    ConfirmRecoverUsername: 28,
    ConfirmConsentSelection: 29,
    FedConflict: 30,
    ProofUpRedirect: 32,
    ProofUpRedirectLanding: 33,
    ConditionalAccessInstallBroker: 34,
    ConditionalAccessWorkplaceJoin: 35,
    ConditionalAccessError: 36,
    CreateFido: 37,
    FedLink: 38,
    FedLinkComplete: 40,
    IdpRedirectSpeedbump: 41,
    TransferLogin: 42,
    Cmsi: 43,
    ProofConfirmation: 44,
    MessagePrompt: 45,
    FinishError: 46,
    Hip: 48,
    LearnMoreOfflineAccount: 49,
    TenantDisambiguation: 50,
    AadFedConflict: 51,
    RemoteConnectCanaryValidation: 52,
    PartnerCanaryValidation: 53,
    ProofFedConflict: 54,
    FetchSessionsProgress: 55,
    AccessPass: 56,
    SignupUsername: 57,
    ReportSuspiciousApp: 58,
    MoreInfo: 59,
    AuthenticatorAddAccountView: 60,
    SignupCredentialPicker: 61,
    LoginError: 62,
    SearchOrganization: 63,
    Ptca: 64,
    GuestConsent: 65,
    RemoteConnectLocation: 66,
    AttributeCollection: 67,
    RdpDevicePrompt: 68,
    GuestConsentConnect: 69,
    SeeHowDataIsManaged: 70,
    SecurityDefaultsUpsell: 71,
    SecurityDefaultsUpsellOptOut: 72,
    SecurityDefaultsUpsellAutoEnabled: 73,
    WebNativeBridge: 74,
    TransferLoginChallengePin: 75,
    RecoveryCredentialPicker: 76,
    OneTimeCodeRecovery: 77
};

exports.PostType =
{
    Password: 11,
    Federation: 13,
    SHA1: 15,
    StrongAuth: 18,
    StrongAuthTOTP: 19,
    LWAConsent: 30,
    PasswordInline: 20,
    RemoteNGC: 21,
    SessionApproval: 22,
    NGC: 23,
    OtcNoPassword: 24,
    RemoteConnect_NativePlatform: 25,
    OTC: 27,
    Kmsi: 28,
    TransferTokenOTC: 31
};

exports.UserProperty =
{
    USERNAME: "login",
    ERROR_CODE: "HR",
    ERR_MSG: "ErrorMessage",
    EXT_ERROR: "ExtErr",
    ERR_URL: "ErrUrl",
    DATOKEN: "DAToken",
    DA_SESKEY: "DASessionKey",
    DA_START: "DAStartTime",
    DA_EXPIRE: "DAExpires",
    STS_ILFT: "STSInlineFlowToken",
    SIGNINNAME: "SigninName",
    FIRST_NAME: "LastName",
    LAST_NAME: "FirstName",
    TILE_URL: "TileUrl",
    CID: "CID",
    PUID: "PUID"
};

exports.Error =
{
    
    S_OK: "0",

    
    InvalidRealmDiscLogin: 10,
    UsernameInvalid: 1000,
    PasswordEmpty: 1001,
    HIPEmpty: 1002,
    AltEmailInvalid: 1005,
    PhoneInvalid: 1006,
    SAContainsName: 1007,
    OTCEmpty: 1009,
    OTCInvalid: 1010,
    NotEnoughProofs: 1013,
    PhoneEmpty: 1015,
    FedUser: 1016,
    FedUserConflict: 1017,
    FedUserInviteBlocked: 1018,
    EmptyFields: 1020,
    PhoneHasSpecialChars: 1021,
    AutoVerifyNoCodeSent: 1022,
    ProofConfirmationEmpty: 1023,
    ProofConfirmationInvalid: 1024,
    TOTPInvalid: 1025,
    SessionNotApproved: 1026,
    PhoneNumberInvalid: 1027,
    PhoneFormattingInvalid: 1028,
    PollingTimedOut: 1029,
    SendNotificationFailed: 1030,

    
    Server_MessageOnly: 9999,

    
    PP_E_DB_MEMBERDOESNOTEXIST: "CFFFFC15",
    PP_E_EXCLUDED: "80041010",
    PP_E_MEMBER_LOCKED: "80041011",
    PP_E_BAD_PASSWORD: "80041012",
    PP_E_MISSING_MEMBERNAME: "80041031",
    PP_E_MISSING_PASSWORD: "80041032",
    PP_E_FEDERATION_INLINELOGIN_DISALLOWED: "800478AC",
    PP_E_PE_RULEFALSE: "8004490C",
    PP_E_MOBILECREDS_PHONENUMBER_BLANK: "80045801",
    PP_E_MOBILECREDS_PHONENUMBER_TOOSHORT: "80045806",
    PP_E_MOBILECREDS_PHONENUMBER_TOOLONG: "80045807",
    PP_E_MOBILECREDS_PHONENUMBER_INVALID: "80045800",
    PP_E_NAME_BLANK: "80041100",
    PP_E_EMAIL_INCOMPLETE: "8004110D",
    PP_E_EMAIL_INVALID: "8004110B",
    PP_E_NAME_TOO_SHORT: "80041101",
    PP_E_NAME_INVALID: "80041103",
    PP_E_INVALIDARG: "80048388",
    PP_E_SA_TOOSHORT: "80041120",
    PP_E_SA_TOOLONG: "80041121",
    PP_E_INVALID_PHONENUMBER: "8004113F",
    PP_E_SECRETQ_CONTAINS_SECRETA: "80041165",
    PP_E_SECRETA_CONTAINS_SECRETQ: "8004117D",
    PP_E_SA_CONTAINS_MEMBERNAME: "8004116A",
    PP_E_STRONGPROCESS_ALTEMAILSAMEASMAILBOX: "80049C2D",
    PP_E_EMAIL_RIGHT_TOO_LONG: "8004110C",
    PP_E_NAME_TOO_LONG: "80041102",
    PP_E_ALIAS_AUTH_NOTPERMITTED: "8004788B",
    PP_E_TOTP_INVALID: "80049C34",
    PP_E_OLD_SKYPE_PASSWORD: "80043557",
    PP_E_OTT_DATA_INVALID: "8004348F",
    PP_E_OTT_ALREADY_CONSUMED: "80043490",
    PP_E_OTT_INVALID_PURPOSE: "80043496",
    PP_E_PPSA_RPT_NOTOADDRESS: "80048120",
    PP_E_STRONGPROCESS_BADDEVICENAME: "80049C22",
    PP_E_INLINELOGIN_INVALID_SMS: "800434E1",
    PP_E_INLINELOGIN_INVALID_ALT: "800434E2",
    PP_E_PREVIOUS_PASSWORD: "80041013",
    PP_E_HIP_VALIDATION_WRONG: "80045505",
    PP_E_HIP_VALIDATION_ERROR_FATAL: "80045537",
    PP_E_HIP_VALIDATION_ERROR_UNAUTHENTICATED: "80045538",
    PP_E_HIP_VALIDATION_ERROR_OTHER: "80045539",
    PP_E_SQ_CONTAINS_PASSWORD: "8004341E",
    PP_E_SA_CONTAINS_PASSWORD: "8004341C",
    PP_E_SA_CONTAINED_IN_PASSWORD: "8004341D",
    PP_E_LIBPHONENUMBERINTEROP_NUMBERPARSE_EXCEPTION: "80043510",
    PP_E_STRONGPROCESS_EMAIL_HAS_MOBILE_DOMAIN: "80049C33",
    PP_E_STRONGPROCESS_MXALIAS_NOTALLOWED: "80049C23",
    PP_E_INVALID_MEMBERNAME: "80041034",
    PP_E_SA_TOO_MANY_CACHE_SESSIONS: "8004A00C",
    PP_E_INTERFACE_DISABLED: "80043448",
    PP_E_ASSOCIATE_DUPLICATE_ACCOUNT: "80043534",
    PP_E_OAUTH_REMOTE_CONNECT_USER_CODE_MISSING_OR_INVALID: "800478C7",
    PP_E_LOGIN_NOPA_USER_PASSWORD_REQUIRED: "800478CE",
    PP_E_IDP_LINKEDIN_BINDING_NOT_ALLOWED: "800478D5",
    PP_E_IDP_GOOGLE_BINDING_NOT_ALLOWED: "800478D6",
    PP_E_IDP_GITHUB_BINDING_NOT_ALLOWED: "800478D7",
    PP_E_IDP_BINDING_EXISTS_SAMSUNG: "8004453E"
};


exports.EstsError =
{
    UserAccountSelectionInvalid: "16001",
    UserUnauthorized: "50020",
    UserUnauthorizedApiVersionNotSupported: "500201",
    UserUnauthorizedMsaGuestUsersNotSupported: "500202",
    UserAccountNotFound: "50034",
    UserAccountDeleted: "500341",
    UserAccountNotFoundNotConfiguredForRemoteNgc: "500342",
    UserAccountNotFoundFailedToCreateRemoteSignIn: "500343",
    UserAccountNotFoundForFidoSignIn: "500344",
    IdsLocked: "50053",
    InvalidPasswordLastPasswordUsed: "50054",
    InvalidPasswordExpiredPassword: "50055",
    InvalidPasswordNullPassword: "50056",
    UserDisabled: "50057",
    GuestUserDisabled: "500571",
    FlowTokenExpired: "50089",
    InvalidUserNameOrPassword: "50126",
    InvalidDomainName: "50128",
    ProtectedKeyMisuse: "50141",
    MissingCustomSigningKey: "50146",
    IdpLoopDetected: "50174",
    InvalidOneTimePasscode: "50181",
    ExpiredOneTimePasscode: "50182",
    OneTimePasscodeCacheError: "50183",
    OneTimePasscodeEntryNotExist: "50184",
    InvalidPassword: "50193",
    InvalidOneTimePasscodeOTPNotGiven: "501811",
    InvalidGrantDeviceNotFound: "700003",
    SsoArtifactExpiredDueToConditionalAccess: "70044",
    SsoArtifactExpiredDueToConditionalAccessReAuth: "70046",
    InvalidTenantName: "90002",
    InvalidTenantNameEmptyGuidIdentifier: "900021",
    InvalidTenantNameEmptyIdentifier: "900022",
    InvalidTenantNameFormat: "900023",
    PhoneSignInBlockedByUserCredentialPolicy: "130500",
    AccessPassBlockedByPolicy: "130502",
    InvalidAccessPass: "130503",
    AccessPassExpired: "130504",
    AccessPassAlreadyUsed: "130505",
    PublicIdentifierSasBeginCallRetriableError: "131001",
    PublicIdentifierAuthUserNotAllowedByPolicy: "131010",
    PublicIdentifierSasBeginCallNonRetriableError: "131002",
    PublicIdentifierSasEndCallRetriableError: "131003",
    PublicIdentifierSasEndCallNonRetriableError: "131004",
    DeviceIsDisabled: "135011",
    FidoBlockedByPolicy: "135016",
    BlockedAdalVersion: "220300",
    BlockedClientId: "220400",
    InvalidCredentialDueToMfaClassification: "54009",
    ProofupBlockedDueToMfaClassification: "54010",

    
    
    UserVoiceAuthFailedCallWentToVoicemail: "UserVoiceAuthFailedCallWentToVoicemail",
    UserVoiceAuthFailedInvalidPhoneInput: "UserVoiceAuthFailedInvalidPhoneInput",
    UserVoiceAuthFailedPhoneHungUp: "UserVoiceAuthFailedPhoneHungUp",
    UserVoiceAuthFailedInvalidPhoneNumber: "UserVoiceAuthFailedInvalidPhoneNumber",
    UserVoiceAuthFailedInvalidExtension: "UserVoiceAuthFailedInvalidExtension",
    InvalidFormat: "InvalidFormat",
    UserAuthFailedDuplicateRequest: "UserAuthFailedDuplicateRequest",
    UserVoiceAuthFailedPhoneUnreachable: "UserVoiceAuthFailedPhoneUnreachable",
    UserVoiceAuthFailedProviderCouldntSendCall: "UserVoiceAuthFailedProviderCouldntSendCall",
    User2WaySMSAuthFailedProviderCouldntSendSMS: "User2WaySMSAuthFailedProviderCouldntSendSMS",
    SMSAuthFailedProviderCouldntSendSMS: "SMSAuthFailedProviderCouldntSendSMS",
    User2WaySMSAuthFailedNoResponseTimeout: "User2WaySMSAuthFailedNoResponseTimeout",
    SMSAuthFailedNoResponseTimeout: "SMSAuthFailedNoResponseTimeout",
    SMSAuthFailedWrongCodeEntered: "SMSAuthFailedWrongCodeEntered",
    IncorrectOTP: "IncorrectOTP",
    OathCodeIncorrect: "OathCodeIncorrect",
    OathCodeDuplicate: "OathCodeDuplicate",
    OathCodeOld: "OathCodeOld",
    ProofDataNotFound: "ProofDataNotFound",
    OathCodeCorrectButDeviceNotAllowed: "OathCodeCorrectButDeviceNotAllowed",
    OathCodeFailedMaxAllowedRetryReached: "OathCodeFailedMaxAllowedRetryReached",
    InvalidSession: "InvalidSession",
    PhoneAppNoResponse: "PhoneAppNoResponse",
    User2WaySMSAuthFailedWrongCodeEntered: "User2WaySMSAuthFailedWrongCodeEntered",
    PhoneAppInvalidResult: "PhoneAppInvalidResult",
    PhoneAppDenied: "PhoneAppDenied",
    PhoneAppTokenChanged: "PhoneAppTokenChanged",
    SMSAuthFailedMaxAllowedCodeRetryReached: "SMSAuthFailedMaxAllowedCodeRetryReached",
    PhoneAppFraudReported: "PhoneAppFraudReported",
    FraudCodeEntered: "FraudCodeEntered",
    UserIsBlocked: "UserIsBlocked",
    PhoneAppEntropyIncorrect: "PhoneAppEntropyIncorrect",
    VoiceOTPAuthFailedWrongCodeEntered: "VoiceOTPAuthFailedWrongCodeEntered",
    VoiceOTPAuthFailedMaxAllowedCodeRetryReached: "VoiceOTPAuthFailedMaxAllowedCodeRetryReached",
    AccessPassBlockedByPolicyTfa: "AccessPassBlockedByPolicy",
    InvalidAccessPassTfa: "InvalidAccessPass",
    AccessPassExpiredTfa: "AccessPassExpired",
    AccessPassAlreadyUsedTfa: "AccessPassAlreadyUsed",
    AppLockRequiredButNotUsed: "AppLockRequiredButNotUsed",
    IncompatibleAppVersion: "IncompatibleAppVersion",
    FlowTokenExpiredTfa: "FlowTokenExpired",

    
    ApplicationUsedIsNotAnApprovedAppRequiredByConditionalAccess: "530021",
    BlockedByConditionalAccess: "53003",
    BlockedByConditionalAccessForRemoteDeviceFlow: "530033",
    BrokerAppNotInstalled: "50127",
    BrokerAppNotInstalledDeviceAuthenticationFailed: "501271",
    DeviceIsNotWorkplaceJoined: "50129",
    DeviceIsNotWorkplaceJoinedForMamApp: "501291",
    DeviceNotCompliant: "53000",
    DeviceNotCompliantBrowserNotSupported: "530001",
    DeviceNotCompliantDeviceCompliantRequired: "530002",
    DeviceNotCompliantDeviceManagementRequired: "530003",
    DeviceNotDomainJoined: "53001",
    DeviceNotDomainJoinedBrowserNotSupported: "530011",
    ProofUpBlockedDueToRisk: "53004",
    ProofUpBlockedDueToUserRisk: "53011",
    RemediateCompliantApp: "53009",
    RemediateDeviceStateManagedBrowserRequired: "530081",
    RemediateDeviceStateWorkplaceJoinRequired: "530082",

    
    AuthenticatorAppRegistrationRequiredInterrupt: "50203",
    UserStrongAuthEnrollmentRequiredInterrupt: "50072",
    UserStrongAuthClientAuthNRequiredInterrupt: "50074",

    
    RequiredDeviceStateNotSupported: "9001011",
    AdminConsentRequired: "90094",
    AdminConsentRequiredRequestAccess: "90095",

    
    CertificateValidationBlockedByPolicy: "500186",

    
    TenantDoesNotSupportNativeCredentialRecovery: "500207",
    UserDoesNotSupportNativeCredentialRecovery: "500208",
    CredentialDoesNotSupportNativeRecovery: "500209"
};

exports.Fido =
{
    MaxUserPromptLength: 99,
    FinishStates:
    {
        Success: 0,
        Cancel: 1,
        Error: 2,
        NotSupported: 3
    },
    UnexpectedErrorCode: 9999,
    
    EdgeErrorCodes:
    {
        SyntaxError: 3, 
        NotFoundError: 8, 
        NotSupportedError: 9, 
        InvalidAccessError: 15, 
        AbortError: 20 
    }
};

exports.IfExistsResult =
{
    Unknown: -1,
    Exists: 0,
    NotExist: 1,
    Throttled: 2,
    Error: 4,
    ExistsInOtherMicrosoftIDP: 5,
    ExistsBothIDPs: 6
};

exports.ThrottleStatus =
{
    NotThrottled: 0,
    AadThrottled: 1 << 0,
    MsaThrottled: 1 << 1
};

exports.DomainType =
{
    Unknown: 1,
    Consumer: 2,
    Managed: 3,
    Federated: 4,
    CloudFederated: 5
};

exports.CredentialType =
{
    Password: 1,
    RemoteNGC: 2,
    OneTimeCode: 3,
    Federation: 4,
    CloudFederation: 5,
    OtherMicrosoftIdpFederation: 6,
    Fido: 7,
    GitHub: 8,
    PublicIdentifierCode: 9,
    LinkedIn: 10,
    RemoteLogin: 11,
    Google: 12,
    AccessPass: 13,
    Facebook: 14,
    Certificate: 15,
    OfflineAccount: 16,

    
    NoPreferredCredential: 1000
};

exports.RemoteNgcType =
{
    PushNotification: 1,
    ListSessions: 3
};

exports.SessionPollingType =
{
    Image: 1,
    Json: 2
};

exports.AgreementType =
{
    Privacy: "privacy",
    Tou: "tou",
    Impressum: "impressum",
    A11yConforme: "a11yConforme"
};


exports.ApiErrorCodes =
{
    
    GeneralError: 6000,
    AuthFailure: 6001,
    InvalidArgs: 6002,

    
    Generic: 8000,
    Timeout: 8001,
    Aborted: 8002
};

exports.DefaultRequestTimeout = 30000;





PROOF =
{
    Type:
    {
        Email: 1,
        AltEmail: 2,
        SMS: 3,
        DeviceId: 4,
        CSS: 5,
        SQSA: 6,
        Certificate: 7,
        HIP: 8,
        Birthday: 9,
        TOTPAuthenticator: 10,
        RecoveryCode: 11,
        StrongTicket: 13,
        TOTPAuthenticatorV2: 14,
        TwoWayVoice: 15,
        TwoWaySMS: 16,
        FidoKey: 17,
        AccessPass: 18,
        TransferToken: 19,
        VerifiableCredentialsHackathon: 20,
        Voice: -3
    }
};

exports.ContentType =
{
    Json: "application/json; charset=utf-8",
    FormUrlEncoded: "application/x-www-form-urlencoded"
};

exports.BindProvider =
{
    LinkedIn: 0,
    GitHub: 1,
    Google: 2,
    Samsung: 3,
    Facebook: 4
};

exports.PromotedAltCredFlags =
{
    None: 0,
    GitHub: 1 << 0,
    LinkedIn: 2 << 0
};

exports.EnvironmentName =
{
    Internal: 1,
    TestSlice: 2,
    FirstSlice: 3
};

exports.AnimationState =
{
    Begin: 0,
    End: -1,
    RenderNewView: 1,
    AnimateNewView: 2
};

exports.AnimationName =
{
    None: 0,
    SlideOutNext: 1,
    SlideInNext: 2,
    SlideOutBack: 3,
    SlideInBack: 4
};

exports.DialogId =
{
    None: 0,
    FidoHelp: 1,
    GitHubHelp: 2,
    ConsentAppInfo: 3
};

exports.KeyCode =
{
    Tab: 9,
    Enter: 13,
    Escape: 27,
    Space: 32,
    PageUp: 33,
    PageDown: 34,
    End: 35,
    Home: 36,
    ArrowUp: 38,
    ArrowDown: 40,
    WinKeyLeft: 91,
    F6: 117,
    GamePadB: 196
};

exports.ProofOfPossession =
{
    AuthenticatorKey: "cpa",
    CanaryTokenKey: "canary",
    MethodHint: "cpa_method_hint"
};

exports.UpgradeMigrationUXId =
{
    Invalid: 0,
    Mojang: 1
};

exports.TransferLoginStringsVariant =
{
    Default: 0,
    Mmx: 1,
    MmxPhoneFirst: 2,
    AppNameOnly: 3,
    AppNameAndUsername: 4,
    MmxGe: 5
};

exports.LayoutTemplateType =
{
    Lightbox: 0,
    VerticalSplit: 1
};

exports.StringCustomizationPageId =
{
    ConditionalAccess: 0,
    AttributeCollection: 1,
    MessagePage: 2,
    ProofUpPage: 3,
    ErrorPage: 4
};

exports.ProofUpRedirectViewType =
{
    DefaultProofUpRedirectView: 0,
    AuthAppProofUpRedirectView: 1
};

exports.ConfirmationInputDisplayType =
{
    None: 0,
    Retype: 1,
    RetypeWithReveal: 2
};

exports.SecurityDefaultsUpsellAction =
{
    None: 0,
    Upsell: 1,
    AutoEnable: 2,
    AutoEnableAfterPrompt: 3,
    ReevaluateLegacy: 4,
    AutoEnabledNotify: 5
};


exports.EventNames =
{
    PhonePairingView: "PhonePairingView",
    PhonePairingAction: "PhonePairingAction",
    PhoneToAccountPairingActivity: "PhoneToAccountPairingActivity"
};


exports.TransferLoginPageNames =
{
    QRCodePage: "QRCodePage",
    ChallengePinPage: "PinCodePage"
};


exports.ActivityStatus =
{
    None: 0,
    Start: 1,
    Stop: 2
};


exports.TelemetryActions =
{
    Click: "Click",
    Scan: "Scan"
};


exports.TelemetryTargets =
{
    SkipButton: "SkipButton",
    ManualStepsLink: "ManualStepsLink",
    LearnMoreButton: "LearnMoreButton",
    QRCode: "QRCode"
};


exports.PairingResult =
{
    Success: 0,
    Failed: -1,
    Skipped: -2,
    SessionExpired: -3
};