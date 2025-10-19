import { useQuery } from "@tanstack/react-query";
import { getAllPlaybooks } from "../services/playbooks-services";

export const useGetAllPlaybooks = ({
  page = 1,
  limit = 10,
  accountId,
}: {
  page?: number;
  limit?: number;
  accountId: string;
}) => {
  const data = useQuery({
    queryKey: ["all-playbooks", page, limit, accountId],
    queryFn: () =>
      getAllPlaybooks({
        page,
        limit,
        accountId,
      }),
  });

  return data;
};