"use client";

import { RichText } from "~/components/ui";

interface ReturnPolicyProps {
  content: string;
  title?: string;
}

export const ReturnPolicy = ({ content, title }: ReturnPolicyProps) => {
  return (
    <div className="space-y-3">
      <RichText className="text-sm">{content}</RichText>
    </div>
  );
};

export default ReturnPolicy;
