export { cn } from "cn"

export function toPlain<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}
