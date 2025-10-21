import { ChangeEvent, Dispatch, SetStateAction, useState } from "react";
import { z, ZodError, ZodObject, ZodRawShape, ZodType } from "zod";

import { isZodArray } from "~/lib/utils";

export type OnFormSubmitHandler = (data: FormData) => Promise<{ ok: boolean; errors?: ZodError["issues"] }>;

export type FormProps<T extends ZodRawShape> = {
  errors: Partial<Record<FieldKey<T>, string>>;
  getFieldProps: <K extends keyof z.infer<ZodObject<T>>>(field: K) => FieldProps<T, K>;
  getFieldsProps: <K extends keyof z.infer<ZodObject<T>>>(field: K) => FieldsProps<T, K>[];
  handleBlur: (field: FieldKey<T>) => (value?: unknown) => void;
  handleChange: (field: FieldKey<T>) => (value: unknown) => void;
  isFormValid: boolean;
  setErrors: Dispatch<SetStateAction<Partial<Record<FieldKey<T>, string>>>>;
  setFieldErrorsFromServer: (issues: ZodError["issues"]) => void;
  setValues: Dispatch<SetStateAction<Partial<z.infer<ZodObject<T>>>>>;
  touched: Partial<Record<FieldKey<T>, boolean>>;
  resetForm: () => void;
  validateForm: () => z.infer<ZodObject<T>> | false;
  values: Partial<z.infer<ZodObject<T>>>;
  useFormSubmit: (options: {
    onSubmit: OnFormSubmitHandler;
    onSuccess?: () => void | Promise<void>;
    onError?: (errors?: ZodError["issues"]) => void | Promise<void>;
  }) => {
    status: import("~/types").Status;
    setStatus: (status: import("~/types").Status) => void;
    handleSubmit: (e: import("react").FormEvent<HTMLFormElement>) => Promise<void>;
  };
};

type FormDataType<T extends ZodRawShape> = z.infer<z.ZodObject<T>>;

type FieldChangeEvent = ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>;
type FieldKey<T extends ZodRawShape> = keyof FormDataType<T>;
interface FieldProps<T extends ZodRawShape, K extends keyof z.infer<ZodObject<T>>> {
  error?: string;
  onBlur: (value?: unknown) => void;
  onChange: (e: FieldChangeEvent) => void;
  showErrorMessage: boolean;
  value: z.infer<ZodObject<T>>[K];
}

type FieldsProps<T extends ZodRawShape, K extends keyof z.infer<ZodObject<T>>> = {
  value: UnwrapArray<z.infer<ZodObject<T>>[K]>;
} & Omit<FieldProps<T, K>, "value">;

type UnwrapArray<T> = T extends (infer U)[] ? U : T;

export interface UseFormSubmitOptions<T extends ZodRawShape> {
  onSubmit: (data: z.infer<ZodObject<T>>) => Promise<{ ok: boolean; errors?: ZodError["issues"] }>;
  onSuccess?: () => void | Promise<void>;
  onError?: (errors?: ZodError["issues"]) => void | Promise<void>;
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
  initialValues?: Partial<z.infer<ZodObject<T>>>;
  schema: ZodObject<T>;
}): FormProps<T> {
  const { initialValues = {}, schema } = config;

  type Errors = Partial<Record<FieldKey<T>, string>>;
  type Touched = Partial<Record<FieldKey<T>, boolean>>;

  const [values, setValues] = useState<Partial<FormDataType<T>>>(initialValues);
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Touched>({});

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
      error: errors[field],
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
            error: errors[field],
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
        error: typeof errors[field] === "object" && errors[field] !== null ? errors[field][index] : errors[field],
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
        error: errors[field],
        onBlur: handleBlur(field),
        onChange: (e: FieldChangeEvent) => handleChange(field)(e.target.value),
        showErrorMessage: true,
        value: fieldValue,
      },
    ];
  }

  const validateForm = (): FormDataType<T> | false => {
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

  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  };

  /**
   * Factory function that returns a custom hook for form submission.
   * This allows optional submission handling while maintaining access to form context.
   */
  const useFormSubmit = (options: {
    onSubmit: (data: FormData) => Promise<{ ok: boolean; errors?: ZodError["issues"] }>;
    onSuccess?: () => void | Promise<void>;
    onError?: (errors?: ZodError["issues"]) => void | Promise<void>;
  }) => {
    const { onSubmit, onSuccess, onError } = options;
    const [status, setStatus] = useState<import("~/types").Status>("idle");

    const handleSubmit = async (e: import("react").FormEvent<HTMLFormElement>) => {
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
          await onSuccess?.();
        } else {
          setStatus("error");
          if (result.errors) {
            setFieldErrorsFromServer(result.errors);
          }
          await onError?.(result.errors);
        }
      } catch (error) {
        setStatus("error");
        await onError?.();
      }
    };

    return {
      status,
      setStatus,
      handleSubmit,
    };
  };

  return {
    errors,
    getFieldProps,
    getFieldsProps,
    handleBlur,
    handleChange,
    isFormValid,
    setErrors,
    setFieldErrorsFromServer,
    setValues,
    resetForm,
    touched,
    validateForm,
    values,
    useFormSubmit,
  };
}
