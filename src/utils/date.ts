import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import 'dayjs/locale/zh-cn'

dayjs.extend(relativeTime)
dayjs.extend(localizedFormat)
dayjs.locale('zh-cn')

export function formatRelativeTime(dateStr: string | Date | undefined): string {
  if (!dateStr) return ''
  return dayjs(dateStr).fromNow()
}

export function formatDateTime(dateStr: string | Date | undefined): string {
  if (!dateStr) return ''
  return dayjs(dateStr).format('YYYY年MM月DD日 HH:mm')
}

export function formatDateOnly(dateStr: string | Date | undefined): string {
  if (!dateStr) return ''
  return dayjs(dateStr).format('YYYY-MM-DD')
}

export default dayjs
