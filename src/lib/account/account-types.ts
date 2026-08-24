export type SettingsSection =
  | "account"
  | "security";

export type SettingsFeedbackTone =
  | "success"
  | "error"
  | "info";

export type SettingsFeedbackMessage = {
  tone: SettingsFeedbackTone;
  text: string;
};

export type PasswordStrength = {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
  description: string;
};
