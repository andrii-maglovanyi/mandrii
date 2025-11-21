import { Alert, Button } from "~/components/ui";
import { useI18n } from "~/i18n/useI18n";
import { Status } from "~/types";

interface FormFooterProps {
  handleCancel(): void;
  hasChanges: boolean;
  isFormValid: boolean;
  status: Status;
}

export const FormFooter = ({ handleCancel, hasChanges, isFormValid, status }: FormFooterProps) => {
  const i18n = useI18n();

  const isBusy = status === "processing";

  return (
    <div className={`
      mt-2 flex grow flex-col gap-3
      md:mt-16 md:flex-row md:justify-end
    `}>
      {isFormValid ? "isFormValid" : "All OK"}
      {hasChanges ? "Has Changes" : "No Changes"}
      {isBusy ? "Busy" : "Not Busy"}
      {!isFormValid || !hasChanges ? "DISABLED" : "ENABLED"}
      <div className={`
        flex h-11 grow
        md:-mt-0.5
      `}>
        {status === "error" && (
          <Alert className="w-full" fadeAfter={10000} variant="error">
            {i18n("Failed to save data. Please try again.")}
          </Alert>
        )}
      </div>

      <div className={`
        flex flex-col-reverse gap-2
        md:flex-row md:space-x-3
      `}>
        <Button disabled={isBusy} onClick={handleCancel} variant="ghost">
          {i18n("Cancel")}
        </Button>
        <Button busy={isBusy} color="primary" disabled={!isFormValid || !hasChanges} type="submit" variant="filled">
          {isBusy ? i18n("Saving") : i18n("Save")}
        </Button>
      </div>
    </div>
  );
};
