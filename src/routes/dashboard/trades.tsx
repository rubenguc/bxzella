import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/dashboard/trades")({
  component: Trades,
})

function Trades() {
  return null
}
