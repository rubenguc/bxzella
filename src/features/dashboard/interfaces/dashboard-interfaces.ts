export interface CalendarCell {
  date: number | null;
  amount: number | null;
  trades: number | null;
  type?: "profit" | "loss";
}
