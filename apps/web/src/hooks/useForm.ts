import { ChangeEvent, Dispatch, SetStateAction, useState } from "react";
import { z, ZodError, ZodObject, ZodRawShape, ZodType } from "zod";

import { isZodArray } from "~/lib/utils";

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
  validateForm: () => boolean;
  values: Partial<z.infer<ZodObject<T>>>;
};
type FieldKey<T extends ZodRawShape> = keyof FormData<T>;
interface FieldProps<T extends ZodRawShape, K extends keyof z.infer<ZodObject<T>>> {
  error?: string;
  onBlur: (value?: unknown) => void;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  showErrorMessage: boolean;
  value: z.infer<ZodObject<T>>[K];
}

type FieldsProps<T extends ZodRawShape, K extends keyof z.infer<ZodObject<T>>> = {
  value: UnwrapArray<z.infer<ZodObject<T>>[K]>;
} & Omit<FieldProps<T, K>, "value">;

type FormData<T extends ZodRawShape> = z.infer<z.ZodObject<T>>;

type UnwrapArray<T> = T extends (infer U)[] ? U : T;

export function useForm<T extends ZodRawShape>(config: {
  initialValues?: Partial<z.infer<ZodObject<T>>>;
  schema: ZodObject<T>;
}): FormProps<T> {
  const { initialValues = {}, schema } = config;

  type Errors = Partial<Record<FieldKey<T>, string>>;
  type Touched = Partial<Record<FieldKey<T>, boolean>>;

  const [values, setValues] = useState<Partial<FormData<T>>>(initialValues);
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
      onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
      value: fieldValue as FormData<T>[K],
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
            onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
        onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
        onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
          handleChange(field)(e.target.value),
        showErrorMessage: true,
        value: fieldValue,
      },
    ];
  }

  const validateForm = (): boolean => {
    const result = schema.safeParse(values);
    if (result.success) {
      setErrors({});
      return true;
    }

    const newErrors: Errors = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0] as FieldKey<T>;
      newErrors[field] = issue.message;
    }
    setErrors(newErrors);

    const allTouched: Touched = {};
    Object.keys(schema.shape).forEach((key) => {
      allTouched[key as FieldKey<T>] = true;
    });
    setTouched(allTouched);

    return false;
  };

  const setFieldErrorsFromServer = (issues: ZodError["issues"]) => {
    const newErrors: Errors = {};
    issues.forEach((issue) => {
      const field = issue.path[0] as FieldKey<T>;
      if (field) {
        newErrors[field] = issue.message;
      }
    });
    setErrors(newErrors);
  };

  const isFormValid =
    schema.safeParse(values).success && Object.keys(errors).every((key) => !errors[key as FieldKey<T>]);

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
    touched,
    validateForm,
    values,
  };
}
