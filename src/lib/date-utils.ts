/**
 * Detecta el locale del navegador del usuario
 * @returns El locale preferido del usuario o 'en-US' como fallback
 */
function getUserLocale(): string {
  return Intl.DateTimeFormat().resolvedOptions().locale || 'en-US'
}

/**
 * Formatea una fecha para el usuario local sin la hora
 * @param date - Fecha a formatear (Date, string, timestamp o null/undefined)
 * @param options - Opciones de Intl.DateTimeFormat
 * @returns Fecha formateada o cadena vacía
 */
export function formatDate(date: Date | string | number | null | undefined, options?: Intl.DateTimeFormatOptions): string {
  if (!date) {
    return ''
  }

  const dateObj = new Date(date)
  if (isNaN(dateObj.getTime())) {
    return ''
  }

  return new Intl.DateTimeFormat(getUserLocale(), {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  }).format(dateObj)
}
