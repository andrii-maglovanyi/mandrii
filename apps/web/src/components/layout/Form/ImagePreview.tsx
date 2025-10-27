import { X } from "lucide-react";
import Image from "next/image";

import { ActionButton } from "../../ui/Button/ActionButton";

interface PreviewBox {
  isBusy?: boolean;
  number?: number;
  onRemove: () => void;
  previewAlt: string;
  previewUrl: string;
  removeLabel: string;
}

export const ImagePreview = ({ isBusy, number, onRemove, previewAlt, previewUrl, removeLabel }: PreviewBox) => {
  return (
    <div className={`group bg-neutral-disabled relative aspect-square overflow-hidden rounded-lg border`}>
      <div className="absolute right-0 z-10 mt-2 mr-2">
        <ActionButton
          aria-label={removeLabel}
          className={`transition group-hover:opacity-100 lg:opacity-0`}
          color="danger"
          disabled={isBusy}
          icon={<X className="h-4 w-4" />}
          onClick={onRemove}
          size="sm"
          variant="filled"
        />
      </div>
      <Image alt={previewAlt} className="z-0 h-full w-full object-cover" height={400} src={previewUrl} width={400} />
      {number ? (
        <div
          className={`bg-surface/75 text-on-surface absolute bottom-2 left-2 h-6 w-6 rounded px-2 py-1 text-xs font-bold`}
        >
          {number}
        </div>
      ) : null}
    </div>
  );
};
