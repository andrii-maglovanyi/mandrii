import { Button } from "@react-email/components";

interface EmailActionButtonProps {
  children: React.ReactNode;
  url: string;
}

export const EmailActionButton = ({ children, url }: EmailActionButtonProps) => (
  <Button
    className={`bg-primary text-neutral-0 inline-block rounded-md px-6 py-3 text-lg font-semibold`}
    href={url}
    style={{ color: "white" }}
  >
    {children}
  </Button>
);
