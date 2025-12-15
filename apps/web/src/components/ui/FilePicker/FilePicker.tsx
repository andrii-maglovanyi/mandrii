"use client";

import clsx from "clsx";
import { Upload } from "lucide-react";
import { useEffect, useRef } from "react";

import { FieldErrorMessage } from "../FieldErrorMessage/FieldErrorMessage";

interface FilePickerProps {
  className?: string;
  disabled?: boolean;
  error?: string;
  isMultiple?: boolean;
  label?: string;
  name?: string;
  onBlur?: (value: Array<File> | File | null) => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  showErrorMessage?: boolean;
  value?: Array<File> | File | null;
}

const filePickerClass =
  "hover:bg-neutral/10 flex w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed p-8 transition";

export const FilePicker = ({
  className,
  disabled,
  error,
  isMultiple = false,
  label,
  name,
  onBlur,
  onChange,
  placeholder,
  showErrorMessage,
  value,
}: FilePickerProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (onBlur && value) {
      onBlur(value);
    }
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  const inputClass = clsx(error ? "border-red-500" : "border-neutral", filePickerClass, className);

  return (
    <>
      <label className={inputClass}>
        <div className="text-center">
          <Upload className="mx-auto mb-2 h-8 w-8 text-neutral-disabled" />
          {label}
          {placeholder && <span className="mt-1 block text-sm text-neutral">{placeholder}</span>}
        </div>
        <input
          accept="image/*"
          className="hidden"
          disabled={disabled}
          multiple={isMultiple}
          name={name}
          onChange={onChange}
          ref={inputRef}
          type="file"
        />
      </label>
      {showErrorMessage && <FieldErrorMessage error={error} />}
    </>
  );
};
