import { useQuery } from "@tanstack/react-query";
import { getAllPlaybooks } from "../services/playbooks-services";

export const useGetAllPlaybooks = ({
  page = 1,
  limit = 10,
}: {
  page?: number;
  limit?: number;
}) => {
  const data = useQuery({
    queryKey: ["all-playbooks", page, limit],
    queryFn: () =>
      getAllPlaybooks({
        page,
        limit,
      }),
  });

  return data;
};