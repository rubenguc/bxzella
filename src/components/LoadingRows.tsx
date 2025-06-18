interface LoadingRowsProps {
  rows: number;
  columns: number;
}

export const LoadingRows = ({ rows, columns }: LoadingRowsProps) => {
  return (
    <>
      {Array(rows)
        .fill(null)
        .map((_, index) => (
          <tr
            key={index}
            className="hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors group/row"
          >
            <td
              className="p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]"
              colSpan={columns}
            >
              <div className="h-7 bg-gray-400/20  animate-pulse " />
            </td>
          </tr>
        ))}
    </>
  );
};
