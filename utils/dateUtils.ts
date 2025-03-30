/**
 * Formate une date en une chaîne relative (aujourd'hui, hier, il y a X jours, etc.)
 */
export function formatRelativeDate(date: Date): string {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);

  const diffTime = now.getTime() - targetDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    // Date future
    if (diffDays === -1) {
      return "demain";
    } else if (diffDays > -7) {
      return `dans ${Math.abs(diffDays)} jours`;
    } else {
      return formatDateToString(date);
    }
  } else if (diffDays === 0) {
    return "aujourd'hui";
  } else if (diffDays === 1) {
    return "hier";
  } else if (diffDays < 7) {
    return `il y a ${diffDays} jours`;
  } else {
    return formatDateToString(date);
  }
}

/**
 * Formate une date au format jj/mm/aaaa
 */
export function formatDateToString(date: Date): string {
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

/**
 * Vérifie si une date est aujourd'hui
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

/**
 * Vérifie si une date est dans le passé
 */
export function isPast(date: Date): boolean {
  const now = new Date();
  return date.getTime() < now.getTime();
}

/**
 * Retourne une date décalée d'un nombre spécifié de jours
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
