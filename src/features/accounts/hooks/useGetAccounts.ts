import { useQuery } from "@tanstack/react-query";
import { getAccounts } from "../services/accounts-services";

export const useGetAccounts = ({
  limit = 10,
  page = 0,
}: {
  limit?: number;
  page?: number;
}) => {
  const data = useQuery({
    queryKey: ["accounts"],
    queryFn: () =>
      getAccounts({
        limit,
        page,
      }),
  });

  return data;
};
