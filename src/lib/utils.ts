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
    days += new Date(today.getFullYear(), today.getMonth(), 0).getDate(); // Days in previous month
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  if (years < 0) {
    return null; // Birthdate is in the future
  }

  let ageString = "";
  if (years > 0) {
    ageString += `${years}歳`;
  }
  if (months > 0) {
    ageString += `${months}ヶ月`;
  }
  if (days > 0 || ageString === "") { // If no years or months, always show days if > 0, or if it's 0 days and no other unit, show 0日
    if (ageString === "" && days === 0) {
      ageString += "0日";
    } else if (days > 0) {
      ageString += `${days}日`;
    }
  }

  return ageString.trim() || null;
}
