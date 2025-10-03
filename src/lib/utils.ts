import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateAge(birthday: string | undefined): string | null {
  if (!birthday) {
    return null;
  }
  const birthDate = new Date(birthday);
  const today = new Date();

  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();
  let days = today.getDate() - birthDate.getDate();

  if (days < 0) {
    months--;
    days += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  if (years < 0) {
    return null;
  }

  let ageString = "";
  if (years > 0) {
    ageString += `${years}歳`;
  }
  if (months > 0) {
    ageString += `${months}ヶ月`;
  }
  if (days > 0 || ageString === "") {
    if (ageString === "" && days === 0) {
      ageString += "0日";
    } else if (days > 0) {
      ageString += `${days}日`;
    }
  }

  return ageString.trim() || null;
}
