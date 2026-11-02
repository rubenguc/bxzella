import { createFileRoute } from "@tanstack/react-router";
import { CoinPerformancesTable } from "#/features/coin-performances/components/table";
import { m } from "#/paraglide/messages";
import { useUserConfig } from "#/store/user-config";

export const Route = createFileRoute("/dashboard/coin-performances")({
	component: CoinPerformances,
});

function CoinPerformances() {
	const { selectedAccount, coin } = useUserConfig();

	if (!selectedAccount) {
		return (
			<p className="text-center text-xl text-muted-foreground">
				{m["accounts.select_account"]()}
			</p>
		);
	}

	return <CoinPerformancesTable accountId={selectedAccount.id} coin={coin} />;
}
