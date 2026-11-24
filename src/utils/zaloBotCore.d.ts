export const DEFAULT_WEB_APP_URL: string
export const DEFAULT_TASK_LINK_MODE: 'day_week' | 'per_task' | 'off'
export function normalizeWebAppUrl(raw?: string): string
export function normalizeTaskLinkMode(raw?: string): 'day_week' | 'per_task' | 'off'
export function splitZaloMessages(text: string, maxChars?: number, maxParts?: number): string[]
export function isZaloHeaderLine(line: string): boolean
export function buildZaloHeaderTextStyles(text: string): Array<{ start: number; len: number; st: string[] }>
export function resolveShortReportRedirect(pathname: string): string | null
export function buildReportShortLinks(webAppUrl?: string): {
  base: string
  dayUrl(isoDate: string, statusCode?: string): string
  weekUrl(shortWeek: string, statusCode?: string): string
  prevWeeksUrl(): string
  allPendingUrl(): string
  taskUrl(taskId: string): string
}
