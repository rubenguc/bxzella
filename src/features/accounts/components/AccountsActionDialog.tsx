import { z } from "zod";
import { IAccountModel } from "../model/accounts";
import { useForm } from "react-hook-form";
import { accountSchema } from "../schemas/accounts";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  createAccount,
  updateAccount,
} from "@/features/accounts/server/actions/accounts";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface AccountsActionDialogProps {
  currentRow?: IAccountModel;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type AccountForm = z.infer<typeof accountSchema>;

export function AccountsActionDialog({
  currentRow,
  open,
  onOpenChange,
}: AccountsActionDialogProps) {
  const queryClient = useQueryClient();

  const isEdit = !!currentRow;
  const form = useForm<AccountForm>({
    resolver: zodResolver(accountSchema),
    defaultValues: isEdit
      ? { ...currentRow, apiKey: "", secretKey: "" }
      : {
          name: "",
          apiKey: "",
          secretKey: "",
        },
  });

  const onSubmit = async (values: AccountForm) => {
    const response = isEdit
      ? await updateAccount(currentRow._id, values)
      : await createAccount(values);
    if (response?.error) {
      toast.error(response.message);

      return;
    }
    queryClient.invalidateQueries({
      queryKey: ["accounts"],
    });
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        form.reset();
        onOpenChange(state);
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="text-left">
          <DialogTitle>
            {isEdit ? "Edit Account" : "Add New Account"}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? "Update the user here. " : "Create new user here. "}
            Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className="-mr-4 h-[26.25rem] w-full overflow-y-auto py-1 pr-4">
          <Form {...form}>
            <form
              id="user-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 p-0.5"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input autoComplete="off" {...field} />
                    </FormControl>
                    <FormMessage className="" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="apiKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>API KEY</FormLabel>
                    <FormControl>
                      <Input
                        className="select-none"
                        type="password"
                        autoComplete="off"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="secretKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SECRET KEY</FormLabel>
                    <FormControl>
                      <Input
                        className="select-none"
                        type="password"
                        autoComplete="off"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="" />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
        <DialogFooter>
          <Button
            disabled={form.formState.isSubmitting}
            type="submit"
            form="user-form"
          >
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
