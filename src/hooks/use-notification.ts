import type { NotificationState } from "@/types"
import { useState } from "react"

export function useNotification() {
  const [notification, setNotification] = useState<NotificationState>({
    show: false,
    type: "info",
    message: "",
  })

  const showNotification = (type: "success" | "error" | "info", message: string) => {
    setNotification({ show: true, type, message })
    setTimeout(() => {
      setNotification((prev) => ({ ...prev, show: false }))
    }, 4000)
  }

  const hideNotification = () => {
    setNotification((prev) => ({ ...prev, show: false }))
  }

  return { notification, showNotification, hideNotification }
}
