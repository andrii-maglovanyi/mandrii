import { ChangeEvent, Dispatch, FormEvent, SetStateAction, useEffect, useMemo, useRef, useState } from "react";
import { z, ZodError, ZodObject, ZodRawShape, ZodType } from "zod";

import { createFileFromUrl } from "~/lib/forms";
import { areValuesEqual, isZodArray } from "~/lib/utils";
import { Status } from "~/types";

export type FormProps<T extends ZodRawShape> = {
  errors: Partial<Record<FieldKey<T>, string>>;
  getFieldProps: <K extends keyof z.infer<ZodObject<T>>>(field: K) => FieldProps<T, K>;
  getFieldsProps: <K extends keyof z.infer<ZodObject<T>>>(field: K) => FieldsProps<T, K>[];
  handleBlur: (field: FieldKey<T>) => (value?: unknown) => void;
  handleChange: (field: FieldKey<T>) => (value: unknown) => void;
  hasChanges: boolean;
  isFormValid: boolean;
  resetForm: () => void;
  setErrors: Dispatch<SetStateAction<Partial<Record<FieldKey<T>, string>>>>;
  setFieldErrorsFromServer: (issues: ZodError["issues"]) => void;
  setValues: Dispatch<SetStateAction<Partial<z.infer<ZodObject<T>>>>>;
  touched: Partial<Record<FieldKey<T>, boolean>>;
  useFormSubmit: (options: {
    onError?: (errors?: ZodError["issues"]) => Promise<void> | void;
    onSubmit: OnFormSubmitHandler;
    onSuccess?: () => Promise<void> | void;
  }) => {
    handleSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void>;
    setStatus: (status: Status) => void;
    status: Status;
  };
  useImagePreviews: <K extends FieldKey<T>>(
    field: K,
  ) => {
    previews: ImageFile[];
    removePreview: (index?: number) => void;
  };
  validateForm: () => false | z.infer<ZodObject<T>>;
  values: Partial<z.infer<ZodObject<T>>>;
};

/**
 * Helper type that allows string URLs for File fields during initialization.
 * This enables passing database URLs directly as initialValues, which will be
 * automatically converted to Files by useImagePreviews.
 */
export type InitialValuesType<T extends ZodRawShape> = {
  [K in keyof FormDataType<T>]?: FormDataType<T>[K] extends File | null | undefined
    ? File | null | string | undefined
    : FormDataType<T>[K] extends File[] | null | undefined
      ? (File | string)[] | null | undefined
      : FormDataType<T>[K];
};

export type OnFormSubmitHandler = (data: FormData) => Promise<{ errors?: ZodError["issues"]; ok: boolean }>;

type FieldChangeEvent = ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>;

type FieldKey<T extends ZodRawShape> = keyof FormDataType<T>;

interface FieldProps<T extends ZodRawShape, K extends keyof z.infer<ZodObject<T>>> {
  error?: string;
  name: string;
  onBlur: (value?: unknown) => void;
  onChange: (e: FieldChangeEvent) => void;
  showErrorMessage: boolean;
  value: z.infer<ZodObject<T>>[K];
}
type FieldsProps<T extends ZodRawShape, K extends keyof z.infer<ZodObject<T>>> = {
  value: UnwrapArray<z.infer<ZodObject<T>>[K]>;
} & Omit<FieldProps<T, K>, "value">;
type FormDataType<T extends ZodRawShape> = z.infer<z.ZodObject<T>>;

interface ImageFile {
  file: File;
  url: string;
}

type UnwrapArray<T> = T extends (infer U)[] ? U : T;

/**
 * Deep equality check for entire form state objects.
 */
const areFormValuesEqual = (
  left: Partial<Record<string, unknown>>,
  right: Partial<Record<string, unknown>>,
): boolean => {
  const allKeys = new Set([...Object.keys(left), ...Object.keys(right)]);

  for (const key of allKeys) {
    if (!areValuesEqual(left[key], right[key])) {
      return false;
    }
  }

  return true;
};

export interface UseFormSubmitOptions<T extends ZodRawShape> {
  onError?: (errors?: ZodError["issues"]) => Promise<void> | void;
  onSubmit: (data: z.infer<ZodObject<T>>) => Promise<{ errors?: ZodError["issues"]; ok: boolean }>;
  onSuccess?: () => Promise<void> | void;
}

export function buildFormData<T extends Record<string, unknown>>(data: T) {
  const body = new FormData();

  for (const [key, value] of Object.entries(data)) {
    if (Array.isArray(value)) {
      for (const val of value.filter(Boolean)) {
        body.append(key, val);
      }
      continue;
    }

    if (!value) continue;

    if (value instanceof File) {
      body.append(key, value);
    } else if (typeof value === "object") {
      body.append(key, JSON.stringify(value));
    } else {
      body.append(key, String(value));
    }
  }

  return body;
}

export function useForm<T extends ZodRawShape>(config: {
  initialValues?: Partial<InitialValuesType<T>>;
  schema: ZodObject<T>;
}): FormProps<T> {
  const { initialValues = {}, schema } = config;

  type Errors = Partial<Record<FieldKey<T>, string>>;
  type Touched = Partial<Record<FieldKey<T>, boolean>>;

  // Store the initial values in a ref to track what the "saved" state is
  const initialValuesRef = useRef<Partial<FormDataType<T>>>(initialValues as Partial<FormDataType<T>>);

  const [values, setValues] = useState<Partial<FormDataType<T>>>(initialValues);
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Touched>({});
  const [status, setStatus] = useState<Status>("idle");

  const validateField = (field: FieldKey<T>, value: unknown) => {
    const schemaField = schema.shape[field as keyof T] as unknown as ZodType;
    const result = schemaField.safeParse(value);

    const isArray = Array.isArray(value);
    const isFileArray = isArray && value.some((v) => v instanceof File);

    if (isArray && !isFileArray && !result.success) {
      const arrayErrors: (string | undefined)[] = [];

      for (const issue of result.error.issues) {
        const [index] = issue.path;
        if (typeof index === "number") {
          arrayErrors[index] = issue.message;
        }
      }

      setErrors((prev) => {
        const prevStr = JSON.stringify(prev[field]);
        const nextStr = JSON.stringify(arrayErrors);
        if (prevStr === nextStr) return prev;
        return { ...prev, [field]: arrayErrors };
      });

      return;
    }

    const nextError = result.success ? undefined : (result.error.issues[0]?.message ?? "Invalid input");

    setErrors((prev) => {
      if (prev[field] === nextError) return prev;
      return { ...prev, [field]: nextError };
    });
  };

  const handleChange = (field: FieldKey<T>) => (value: unknown) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      validateField(field, value);
    }
  };

  const handleBlur = (field: FieldKey<T>) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field, values[field]);
  };

  function getFieldProps<K extends FieldKey<T>>(field: K) {
    const fieldValue = values[field];

    return {
      disabled: status === "processing",
      error: errors[field],
      name: String(field),
      onBlur: handleBlur(field),
      onChange: (e: FieldChangeEvent) => {
        const inputElement = e.target as HTMLInputElement;
        const files = inputElement.files;

        if (files instanceof FileList) {
          const isMultiple = inputElement.hasAttribute("multiple");
          const newFiles = Array.from(files);

          if (isMultiple) {
            const existingFiles = Array.isArray(fieldValue) ? fieldValue : [];
            const existingFileIds = new Set(existingFiles.map((f: File) => `${f.name}-${f.size}-${f.lastModified}`));

            const uniqueNewFiles = newFiles.filter((file) => {
              const fileId = `${file.name}-${file.size}-${file.lastModified}`;
              return !existingFileIds.has(fileId);
            });

            if (uniqueNewFiles.length > 0) {
              handleChange(field)([...existingFiles, ...uniqueNewFiles]);
            }
          } else {
            handleChange(field)(newFiles[0] || null);
          }
        } else {
          handleChange(field)(e.target.value);
        }
      },
      showErrorMessage: true,
      value: fieldValue as FormDataType<T>[K],
    };
  }

  function getFieldsProps<K extends FieldKey<T>>(field: K) {
    const fieldValue = values[field];
    const schemaField = schema.shape[field as keyof T] as unknown as ZodType;

    if (isZodArray(schemaField) && Array.isArray(fieldValue)) {
      const arrayValue = fieldValue ?? [];

      if (arrayValue.length === 0) {
        handleChange(field)([""]);
        return [
          {
            disabled: status === "processing",
            error: errors[field],
            name: String(field),
            onBlur: handleBlur(field),
            onChange: (e: FieldChangeEvent) => {
              handleChange(field)([e.target.value]);
            },
            showErrorMessage: true,
            value: "",
          },
        ];
      }

      return arrayValue.map((item, index) => ({
        disabled: status === "processing",
        error: typeof errors[field] === "object" && errors[field] !== null ? errors[field][index] : errors[field],
        name: String(field),
        onBlur: handleBlur(field),
        onChange: (e: FieldChangeEvent) => {
          const newArray = [...arrayValue];
          newArray[index] = e.target.value;
          handleChange(field)(newArray);
        },
        showErrorMessage: true,
        value: item,
      }));
    }

    return [
      {
        disabled: status === "processing",
        error: errors[field],
        name: String(field),
        onBlur: handleBlur(field),
        onChange: (e: FieldChangeEvent) => handleChange(field)(e.target.value),
        showErrorMessage: true,
        value: fieldValue,
      },
    ];
  }

  const validateForm = (): false | FormDataType<T> => {
    const result = schema.safeParse(values);
    if (result.success) {
      setErrors({});
      setValues(result.data);
      return result.data;
    }

    const newErrors: Errors = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0] as FieldKey<T>;
      newErrors[field] = issue.message;
    }
    setErrors(newErrors);

    const allTouched: Touched = {};
    for (const key of Object.keys(schema.shape)) {
      allTouched[key as FieldKey<T>] = true;
    }
    setTouched(allTouched);

    return false;
  };

  const setFieldErrorsFromServer = (issues: ZodError["issues"]) => {
    const newErrors: Errors = {};
    for (const issue of issues) {
      const field = issue.path[0] as FieldKey<T>;
      if (field) {
        newErrors[field] = issue.message;
      }
    }
    setErrors(newErrors);
  };

  const isFormValid =
    schema.safeParse(values).success && Object.keys(errors).every((key) => !errors[key as FieldKey<T>]);

  const hasChanges = useMemo(() => !areFormValuesEqual(values, initialValuesRef.current), [values]);

  const resetForm = () => {
    setStatus("idle");
    setValues(initialValuesRef.current);
    setErrors({});
    setTouched({});
  };

  /**
   * Hook to manage multiple image previews.
   * Automatically creates and revokes object URLs.
   *
   * @param files - Array of files to preview
   * @returns Array of ImageFile with blob URLs
   */
  const useImagePreviews = <K extends FieldKey<T>>(field: K) => {
    const [previews, setPreviews] = useState<ImageFile[]>([]);
    const fieldValue = values[field];

    useEffect(() => {
      const valueArray = Array.isArray(fieldValue) ? fieldValue : fieldValue ? [fieldValue] : [];
      const containsString = valueArray.some((value) => typeof value === "string" && value);

      if (!containsString) return;

      const abortController = new AbortController();
      const signal = abortController.signal;

      (async () => {
        try {
          const convertedFiles = await Promise.all(
            // Todo: Promise.all ?
            valueArray.map(async (value) => {
              if (!value) return null;
              if (value instanceof File) return value;
              try {
                return await createFileFromUrl(String(value), { name: value.split("/").pop() });
              } catch (error) {
                console.error("Failed to convert image URL to File", error);
                return null;
              }
            }),
          );

          if (signal.aborted) return;

          const sanitizedFiles = convertedFiles.filter((file): file is File => file instanceof File);
          const nextValue = Array.isArray(fieldValue) ? sanitizedFiles : (sanitizedFiles[0] ?? undefined);

          setValues((prev) => ({
            ...prev,
            [field]: nextValue,
          }));

          initialValuesRef.current = {
            ...initialValuesRef.current,
            [field]: nextValue,
          };

          validateField(field, nextValue);
        } catch {
          if (!signal.aborted) {
            setStatus("error");
          }
        }
      })();

      return () => {
        abortController.abort();
      };
    }, [fieldValue, field]);

    useEffect(() => {
      const files: File[] = Array.isArray(fieldValue)
        ? (fieldValue as Array<unknown>).filter((value): value is File => value instanceof File)
        : fieldValue instanceof File
          ? [fieldValue]
          : [];

      if (!files.length) {
        setPreviews((prev) => {
          prev.forEach((preview) => URL.revokeObjectURL(preview.url));
          return [];
        });
        return;
      }

      const nextPreviews = files.map((file) => {
        const alreadyExistingPreview = previews.find((preview) => preview.file.name === file.name);
        if (alreadyExistingPreview) {
          return alreadyExistingPreview;
        }

        return { file, url: URL.createObjectURL(file) };
      });

      setPreviews((prev) => {
        prev.forEach((preview) => URL.revokeObjectURL(preview.url));
        return nextPreviews;
      });

      return () => {
        nextPreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
      };
    }, [fieldValue]); // eslint-disable-line react-hooks/exhaustive-deps

    const removePreview = (index = 0) => {
      setValues((prev) => ({
        ...prev,
        [field]: Array.isArray(prev[field]) ? prev[field].filter((_, i) => i !== index) : undefined,
      }));
    };

    return { previews, removePreview };
  };

  /**
   * Factory function that returns a custom hook for form submission.
   * This allows optional submission handling while maintaining access to form context.
   */
  const useFormSubmit = (options: {
    onError?: (errors?: ZodError["issues"]) => Promise<void> | void;
    onSubmit: (data: FormData) => Promise<{ errors?: ZodError["issues"]; ok: boolean }>;
    onSuccess?: () => Promise<void> | void;
  }) => {
    const { onError, onSubmit, onSuccess } = options;

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const validatedData = validateForm();
      if (!validatedData) {
        setStatus("idle");
        return;
      }

      setStatus("processing");

      try {
        const formData = buildFormData(validatedData);
        const result = await onSubmit(formData);

        if (result.ok) {
          setStatus("success");
          // Update baseline to current values so hasChanges becomes false
          initialValuesRef.current = validatedData;
          await onSuccess?.();
        } else {
          setStatus("error");
          if (result.errors) {
            setFieldErrorsFromServer(result.errors);
          }
          await onError?.(result.errors);
        }
      } catch {
        setStatus("error");
        await onError?.();
      }
    };

    return {
      handleSubmit,
      setStatus,
      status,
    };
  };

  return {
    errors,
    getFieldProps,
    getFieldsProps,
    handleBlur,
    handleChange,
    hasChanges,
    isFormValid,
    resetForm,
    setErrors,
    setFieldErrorsFromServer,
    setValues,
    touched,
    useFormSubmit,
    useImagePreviews,
    validateForm,
    values,
  };
}
