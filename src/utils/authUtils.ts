// utils/authUtils.ts
export const validateEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? "" : "Enter valid email (example@gmail.com)";

export const validateFullName = (name: string) => {
  if (!name) return "Full name is required.";
  if (name.length < 3) return "Min 3 characters.";
  if (name.length > 25) return "Max 25 characters.";
  if (!/^[a-zA-Z\s]*$/.test(name)) return "Letters only.";
  return "";
};

export const validatePassword = (pass: string) => {
  if (!pass) return "Password is required.";
  if (pass.length < 8) return "Min 8 characters required.";
  if (!/(?=.*[A-Z])/.test(pass)) return "Uppercase required.";
  if (!/(?=.*[a-z])/.test(pass)) return "Lowercase required.";
  if (!/(?=.*\d)/.test(pass)) return "Number required.";
  if (!/(?=.*[@$!%*?&#])/.test(pass)) return "Special character required.";
  return "";
};