const forest900 = "#0d3327";
const forest800 = "#11402f";
const mint500 = "#34c277";
const cream50 = "#f6f2e9";
const cream100 = "#faf7ef";
const cream200 = "#ede8d9";
const ink900 = "#0a1f1a";
const ink500 = "#4a5955";
const ink400 = "#7a8a85";
const ink200 = "#cfd6d3";

export const clerkAppearance = {
  variables: {
    colorPrimary: forest900,
    colorBackground: "#ffffff",
    colorInputBackground: cream100,
    colorInputText: ink900,
    colorText: ink900,
    colorTextSecondary: ink500,
    colorTextOnPrimaryBackground: "#ffffff",
    colorDanger: "#dc2626",
    colorSuccess: mint500,
    colorNeutral: ink500,
    colorShimmer: cream200,
    fontFamily:
      "var(--font-inter), ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
    fontFamilyButtons:
      "var(--font-inter), ui-sans-serif, system-ui, sans-serif",
    fontSize: "14px",
    borderRadius: "0.625rem",
    spacingUnit: "1rem",
  },
  elements: {
    rootBox: {
      fontFamily:
        "var(--font-inter), ui-sans-serif, system-ui, sans-serif",
    },
    card: {
      boxShadow:
        "0 24px 48px -12px rgba(10, 31, 26, 0.25), 0 0 0 1px rgba(10, 31, 26, 0.04)",
      borderRadius: "1rem",
      overflow: "hidden",
    },
    cardBox: {
      width: "100%",
    },
    logoBox: {
      display: "flex",
      justifyContent: "flex-start",
      paddingTop: "0.5rem",
    },
    logoImage: {
      width: "3rem",
      height: "3.25rem",
    },
    header: {
      backgroundColor: forest900,
      padding: "1.25rem 1.5rem 1.5rem",
      gap: "0.75rem",
      alignItems: "flex-start",
    },
    headerBackLink: {
      color: "rgba(255,255,255,0.7)",
      "&:hover": { color: "#ffffff" },
    },
    headerTitle: {
      color: "#ffffff",
      fontSize: "1.5rem",
      fontWeight: "600",
      letterSpacing: "-0.01em",
      lineHeight: "1.2",
    },
    headerSubtitle: {
      color: "rgba(255,255,255,0.7)",
      fontSize: "0.875rem",
      lineHeight: "1.5",
      fontWeight: "400",
    },
    main: {
      padding: "1.5rem",
      gap: "1rem",
    },
    form: {
      gap: "1rem",
    },
    formFieldRow: { gap: "0.375rem" },
    formFieldLabel: {
      color: ink900,
      fontSize: "0.875rem",
      fontWeight: "500",
    },
    formFieldInput: {
      backgroundColor: cream100,
      border: `1px solid ${ink200}`,
      borderRadius: "0.625rem",
      padding: "0.75rem 0.875rem",
      fontSize: "0.9375rem",
      color: ink900,
      "&:focus": {
        borderColor: forest900,
        boxShadow: "0 0 0 3px rgba(13, 51, 39, 0.12)",
        backgroundColor: "#ffffff",
      },
      "&::placeholder": { color: ink400 },
    },
    formFieldInputGroup: { borderRadius: "0.625rem" },
    formButtonPrimary: {
      backgroundColor: forest900,
      color: "#ffffff",
      fontSize: "0.9375rem",
      fontWeight: "600",
      padding: "0.75rem 1.25rem",
      borderRadius: "0.625rem",
      textTransform: "none",
      boxShadow: "0 1px 2px rgba(10, 31, 26, 0.1)",
      "&:hover": {
        backgroundColor: forest800,
        boxShadow: "0 4px 12px rgba(10, 31, 26, 0.15)",
      },
      "&:active": { backgroundColor: forest900 },
    },
    socialButtons: { gap: "0.5rem" },
    socialButtonsBlockButton: {
      backgroundColor: "#ffffff",
      color: ink900,
      border: `1px solid ${ink200}`,
      borderRadius: "0.625rem",
      padding: "0.75rem 1rem",
      fontSize: "0.9375rem",
      fontWeight: "500",
      textTransform: "none",
      boxShadow: "0 1px 2px rgba(10, 31, 26, 0.04)",
      "&:hover": {
        backgroundColor: cream50,
        borderColor: ink400,
      },
    },
    socialButtonsBlockButtonText: { color: ink900, fontWeight: "500" },
    socialButtonsIconButton: {
      backgroundColor: "#ffffff",
      border: `1px solid ${ink200}`,
      borderRadius: "0.625rem",
      "&:hover": { backgroundColor: cream50 },
    },
    dividerRow: { marginTop: "0.5rem", marginBottom: "0.5rem" },
    dividerLine: { backgroundColor: ink200, height: "1px" },
    dividerText: {
      color: ink400,
      fontSize: "0.8125rem",
      textTransform: "lowercase",
      padding: "0 0.75rem",
    },
    footer: { padding: "0 1.5rem 1.5rem" },
    footerAction: { paddingTop: "0.25rem" },
    footerActionText: { color: ink500, fontSize: "0.875rem" },
    footerActionLink: {
      color: forest900,
      fontWeight: "600",
      "&:hover": { color: forest800, textDecoration: "underline" },
    },
    formFieldCheckboxLabel: { color: ink500, fontSize: "0.875rem" },
    formFieldAction: { color: forest900, fontSize: "0.875rem", fontWeight: "500" },
    identityPreview: {
      backgroundColor: cream50,
      border: `1px solid ${ink200}`,
      borderRadius: "0.625rem",
    },
    identityPreviewEditButton: { color: forest900 },
    otpCodeFieldInput: {
      backgroundColor: cream100,
      border: `1px solid ${ink200}`,
      borderRadius: "0.5rem",
    },
    formResendCodeLink: { color: forest900 },
    alert: { borderRadius: "0.625rem", fontSize: "0.875rem" },
    alertText: { fontSize: "0.875rem" },
  },
  layout: {
    logoPlacement: "inside",
    logoImageUrl: "/luna-mascot.svg",
    socialButtonsPlacement: "bottom",
    socialButtonsVariant: "blockButton",
    showOptionalFields: false,
  },
};

export const clerkLocalization = {
  locale: "en-PK",
  socialButtonsBlockButton: "Continue with {{provider|titleize}}",
  dividerText: "or",
  formFieldLabel__emailAddress: "Email address",
  formFieldLabel__phoneNumber: "Phone number",
  formFieldLabel__username: "Username",
  formFieldLabel__emailAddress_username: "Email or username",
  formFieldLabel__password: "Password",
  formFieldLabel__firstName: "First name",
  formFieldLabel__lastName: "Last name",
  formFieldLabel__confirmPassword: "Confirm password",
  formFieldInputPlaceholder__emailAddress: "you@example.com",
  formFieldInputPlaceholder__phoneNumber: "+92 300 0000000",
  formFieldInputPlaceholder__password: "Enter your password",
  formFieldInputPlaceholder__firstName: "Your first name",
  formFieldInputPlaceholder__lastName: "Your last name",
  formFieldInputPlaceholder__emailAddress_username: "you@example.com",
  formFieldAction__forgotPassword: "Forgot password?",
  signIn: {
    start: {
      title: "Welcome back",
      subtitle: "Luna missed you. Let's pick up where you left off.",
      actionText: "New here?",
      actionLink: "Create account",
    },
    password: {
      title: "Enter your password",
      subtitle: "to continue to Luna's Academy",
    },
    forgotPassword: {
      title: "Reset your password",
      subtitle: "We'll email you a link to get back into your account.",
    },
    resetPassword: {
      title: "Set a new password",
      subtitle: "Choose something strong this time.",
    },
    emailLink: {
      title: "Check your email",
      subtitle: "We've sent a magic link to your inbox.",
    },
    emailCode: {
      title: "Check your email",
      subtitle: "Enter the code we just sent you.",
    },
    phoneCode: {
      title: "Check your phone",
      subtitle: "Enter the code we just sent you.",
    },
    saml: { title: "Continue with SSO" },
    oauth: { title: "Continue with {{provider}}" },
    verifications: {
      phoneCode: {
        title: "Verify your phone",
        subtitle: "Enter the 6-digit code we sent to your phone.",
      },
      emailCode: {
        title: "Verify your email",
        subtitle: "Enter the 6-digit code we sent to your email.",
      },
      emailLink: {
        title: "Verify your email",
        subtitle: "Click the link in the email we sent you.",
      },
    },
  },
  signUp: {
    start: {
      title: "Join Luna's Academy",
      subtitle: "Start your journey into the mineral sector.",
      actionText: "Already have an account?",
      actionLink: "Sign in",
    },
    continue: {
      title: "Almost there",
      subtitle: "Just a few more details to set up your account.",
    },
    emailLink: {
      title: "Verify your email",
      subtitle: "Click the link in the email we sent you.",
    },
    emailCode: {
      title: "Verify your email",
      subtitle: "Enter the 6-digit code we sent to your email.",
    },
    phoneCode: {
      title: "Verify your phone",
      subtitle: "Enter the code we just sent you.",
    },
    saml: { title: "Continue with SSO" },
    oauth: { title: "Continue with {{provider}}" },
    verifications: {
      phoneCode: {
        title: "Verify your phone",
        subtitle: "Enter the 6-digit code we sent to your phone.",
      },
      emailCode: {
        title: "Verify your email",
        subtitle: "Enter the 6-digit code we sent to your email.",
      },
      emailLink: {
        title: "Verify your email",
        subtitle: "Click the link in the email we sent you.",
      },
    },
  },
};
