import { ChangeEvent, useState } from "react";
import { z, ZodIssue } from "zod";

export function useForm<T extends z.ZodRawShape>(config: {
  initialValues?: Partial<Record<keyof T, string>>;
  schema: z.ZodObject<T>;
}) {
  const { initialValues = {}, schema } = config;

  type FieldKey = keyof T;
  type FormData = Record<FieldKey, string>;
  type Errors = Partial<Record<FieldKey, string>>;
  type Touched = Partial<Record<FieldKey, boolean>>;

  const [values, setValues] = useState<FormData>(() => {
    const entries = Object.keys(schema.shape).map((key) => [key, (initialValues as Record<string, string>)[key] ?? ""]);
    return Object.fromEntries(entries) as FormData;
  });

  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Touched>({});

  const validateField = (field: FieldKey, value: string) => {
    const schemaField = schema.shape[field] as unknown as z.ZodTypeAny;
    const result = schemaField.safeParse(value);
    setErrors((prev) => ({
      ...prev,
      [field]: result.success ? undefined : (result.error.issues[0]?.message ?? "Invalid input"),
    }));
  };

  const handleChange = (field: FieldKey) => (value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) validateField(field, value);
  };

  const handleBlur = (field: FieldKey) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field, values[field]);
  };

  const getFieldProps = (field: FieldKey) => ({
    error: errors[field],
    onBlur: handleBlur(field),
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => handleChange(field)(e.target.value),
    showErrorMessage: true,
    value: values[field],
  });

  const validateForm = (): boolean => {
    const result = schema.safeParse(values);
    if (result.success) {
      setErrors({});
      return true;
    }

    const newErrors: Errors = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0] as FieldKey;
      newErrors[field] = issue.message;
    }
    setErrors(newErrors);

    const allTouched: Touched = {};
    Object.keys(schema.shape).forEach((key) => {
      allTouched[key as FieldKey] = true;
    });
    setTouched(allTouched);

    return false;
  };

  const setFieldErrorsFromServer = (issues: ZodIssue[]) => {
    const newErrors: Errors = {};
    issues.forEach((issue) => {
      const field = issue.path[0] as FieldKey;
      if (field) {
        newErrors[field] = issue.message;
      }
    });
    setErrors(newErrors);
  };

  const isFormValid = schema.safeParse(values).success && Object.keys(errors).every((key) => !errors[key as FieldKey]);

  return {
    errors,
    getFieldProps,
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
