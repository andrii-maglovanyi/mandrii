import { Button } from "@react-email/components";

interface EmailActionButtonProps {
  children: React.ReactNode;
  url: string;
}

export const EmailActionButton = ({ children, url }: EmailActionButtonProps) => (
  <Button
    className={`bg-primary inline-block rounded-md px-6 py-3 text-lg font-semibold text-white`}
    href={url}
    style={{ color: "white" }}
  >
    {children}
  </Button>
);
