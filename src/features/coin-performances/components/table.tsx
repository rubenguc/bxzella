import { Link } from "@tanstack/react-router";
import {
	createColumnHelper,
	flexRender,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { Pagination } from "#/components/pagination";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";
import { Skeleton } from "#/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "#/components/ui/table";
import { fetchCoinPerformances } from "#/features/coin-performances/service";
import type {
	CoinPerformance,
	CoinPerformanceMinTrades,
	CoinPerformanceSort,
} from "#/features/coin-performances/types";
import type { Coin } from "#/features/exchange-providers/types";
import { transformSymbol } from "#/features/trades/helpers";
import { usePagination } from "#/lib/use-pagination";
import { cn } from "#/lib/utils.ts";
import { m } from "#/paraglide/messages";

const columnHelper = createColumnHelper<CoinPerformance>();

interface Props {
	accountId: string;
	coin: Coin;
}

/** Tint per group so General / Long / Short read as separate sections. */
const GROUP_HEADER_CLASS: Record<string, string> = {
	general: "bg-muted/50 text-foreground",
	long: "bg-green-500/10 text-green-700 dark:text-green-400",
	short: "bg-red-500/10 text-red-700 dark:text-red-400",
};

function columnClassName(meta: unknown, fallback = "text-center") {
	return (meta as { className?: string })?.className ?? fallback;
}

function winRateClassName(rate: number) {
	if (rate >= 50) return "text-green-500";
	if (rate >= 30) return "text-orange-500";
	return "text-red-500";
}

function winRateCell(rate: number) {
	return (
		<span className={cn("tabular-nums font-medium", winRateClassName(rate))}>
			{rate.toFixed(1)}%
		</span>
	);
}

function groupColumns(
	id: string,
	header: () => string,
	tradesAccessor: "longTrades" | "shortTrades",
	rateAccessor: "longWinRate" | "shortWinRate",
) {
	return columnHelper.group({
		id,
		header,
		columns: [
			columnHelper.accessor(tradesAccessor, {
				id: `${id}-trades`,
				header: () => m["coin_performances.total_trades"](),
				cell: (info) => <span className="tabular-nums">{info.getValue()}</span>,
				meta: { className: "text-center" } as const,
			}),
			columnHelper.accessor(rateAccessor, {
				id: `${id}-win-rate`,
				header: () => m["coin_performances.win_rate"](),
				cell: (info) => winRateCell(info.getValue()),
				meta: { className: "text-center" } as const,
			}),
		],
	});
}

export function CoinPerformancesTable({ accountId, coin }: Props) {
	const [sortBy, setSortBy] = useState<CoinPerformanceSort>("trades");
	const [minTrades, setMinTrades] = useState<CoinPerformanceMinTrades>("all");

	const {
		items,
		page,
		totalPages,
		isLoading,
		hasNext,
		hasPrev,
		nextPage,
		prevPage,
		goToPage,
		firstPage,
		lastPage,
	} = usePagination<CoinPerformance>({
		queryKey: [
			"coin-performances",
			accountId,
			coin,
			sortBy,
			minTrades,
		] as const,
		queryFn: (p, limit) =>
			fetchCoinPerformances(accountId, coin, p, limit, sortBy, minTrades),
		limit: 20,
		enabled: !!accountId,
	});

	function handleSortChange(value: string) {
		setSortBy(value as CoinPerformanceSort);
		// Ordering is global, so a page offset from the previous ordering is meaningless.
		firstPage();
	}

	function handleMinTradesChange(value: string) {
		setMinTrades(value as CoinPerformanceMinTrades);
		// The filtered set shrinks, so the current offset may no longer exist.
		firstPage();
	}

	const columns = useMemo(
		() => [
			columnHelper.accessor("symbol", {
				header: () => m["coin_performances.symbol"](),
				cell: (info) => {
					const symbol = transformSymbol(info.getValue());

					return (
						<Link
							to="/dashboard/trades"
							search={{ symbol }}
							className="font-medium hover:underline underline-offset-4"
						>
							{symbol}
						</Link>
					);
				},
				meta: { className: "text-left" } as const,
			}),
			columnHelper.group({
				id: "general",
				header: () => m["coin_performances.general"](),
				columns: [
					columnHelper.accessor("totalTrades", {
						id: "general-trades",
						header: () => m["coin_performances.total_trades"](),
						cell: (info) => (
							<span className="tabular-nums">{info.getValue()}</span>
						),
						meta: { className: "text-center" } as const,
					}),
					columnHelper.accessor("winRate", {
						id: "general-win-rate",
						header: () => m["coin_performances.win_rate"](),
						cell: (info) => winRateCell(info.getValue()),
						meta: { className: "text-center" } as const,
					}),
				],
			}),
			groupColumns(
				"long",
				() => m["coin_performances.long"](),
				"longTrades",
				"longWinRate",
			),
			groupColumns(
				"short",
				() => m["coin_performances.short"](),
				"shortTrades",
				"shortWinRate",
			),
		],
		[],
	);

	const stableData = useMemo(() => items, [items]);

	const table = useReactTable({
		data: stableData,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	const filters = (
		<div className="flex flex-wrap items-center justify-end gap-3">
			<div className="flex items-center gap-2">
				<span className="text-muted-foreground text-sm">
					{m["coin_performances.sort_by"]()}
				</span>
				<Select value={sortBy} onValueChange={handleSortChange}>
					<SelectTrigger className="w-[170px]">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="trades">
							{m["coin_performances.total_trades"]()}
						</SelectItem>
						<SelectItem value="winRate">
							{m["coin_performances.win_rate"]()}
						</SelectItem>
					</SelectContent>
				</Select>
			</div>
			<div className="flex items-center gap-2">
				<span className="text-muted-foreground text-sm">
					{m["coin_performances.min_trades"]()}
				</span>
				<Select value={minTrades} onValueChange={handleMinTradesChange}>
					<SelectTrigger className="w-[110px]">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">
							{m["coin_performances.min_trades_all"]()}
						</SelectItem>
						<SelectItem value="10">10</SelectItem>
						<SelectItem value="20">20</SelectItem>
						<SelectItem value="30">30</SelectItem>
					</SelectContent>
				</Select>
			</div>
		</div>
	);

	if (isLoading) {
		return (
			<div className="space-y-4">
				{filters}
				<div className="space-y-2">
					<Skeleton className="h-10 w-full" />
					<Skeleton className="h-10 w-full" />
					<Skeleton className="h-10 w-full" />
				</div>
			</div>
		);
	}

	if (items.length === 0) {
		return (
			<div className="space-y-4">
				{filters}
				<p className="text-muted-foreground text-sm py-8 text-center">
					{m["coin_performances.no_data"]()}
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{filters}
			<div className="rounded-xl border bg-card shadow-sm overflow-hidden">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => {
									const isGroupRow = header.subHeaders.length > 0;
									const groupId = header.column.parent?.id ?? header.column.id;

									return (
										<TableHead
											key={header.id}
											colSpan={header.colSpan}
											className={cn(
												columnClassName(header.column.columnDef.meta),
												isGroupRow && "font-semibold border-l",
												isGroupRow && GROUP_HEADER_CLASS[groupId],
												!isGroupRow &&
													header.column.id.endsWith("-trades") &&
													"border-l",
											)}
										>
											{header.isPlaceholder
												? null
												: flexRender(
														header.column.columnDef.header,
														header.getContext(),
													)}
										</TableHead>
									);
								})}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows.map((row) => (
							<TableRow key={row.id}>
								{row.getVisibleCells().map((cell) => (
									<TableCell
										key={cell.id}
										className={cn(
											columnClassName(cell.column.columnDef.meta),
											cell.column.id.endsWith("-trades") && "border-l",
										)}
									>
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</TableCell>
								))}
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>

			<Pagination
				page={page}
				totalPages={totalPages}
				hasNext={hasNext}
				hasPrev={hasPrev}
				onNext={nextPage}
				onPrev={prevPage}
				onFirst={firstPage}
				onLast={lastPage}
				onGoTo={goToPage}
			/>
		</div>
	);
}
