'use client';

import { ReactNode, ChangeEvent } from 'react';
import { cn } from '@/lib/utils';

type InputChangeEvent = ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>;

interface FormFieldProps {
  label: string;
  name?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select' | 'file' | 'date' | 'datetime-local' | 'time' | 'url' | 'tel';
  value?: string | number;
  /** Value-based change handler - receives the new value directly */
  onChange?: (value: string) => void;
  /** Event-based change handler for forms using e.target.name pattern */
  onChangeEvent?: (e: InputChangeEvent) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  hint?: string;
  options?: { value: string; label: string }[];
  className?: string;
  children?: ReactNode;
  accept?: string;
  multiple?: boolean;
  min?: number;
  max?: number;
  step?: number;
  rows?: number;
}

export function FormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onChangeEvent,
  placeholder,
  required,
  disabled,
  error,
  hint,
  options,
  className,
  children,
  accept,
  multiple,
  min,
  max,
  step,
  rows = 4,
}: FormFieldProps) {
  const handleChange = (e: InputChangeEvent) => {
    if (onChangeEvent) {
      onChangeEvent(e);
    } else if (onChange) {
      onChange(e.target.value);
    }
  };

  const inputClasses = cn(
    "w-full px-4 py-2 border rounded-lg bg-background transition-colors",
    "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary",
    error && "border-red-500 focus:ring-red-500/50 focus:border-red-500",
    disabled && "opacity-50 cursor-not-allowed",
    className
  );

  const renderInput = () => {
    if (type === 'textarea') {
      return (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          rows={rows}
          className={inputClasses}
        />
      );
    }

    if (type === 'select') {
      return (
        <select
          id={name}
          name={name}
          value={value}
          onChange={handleChange}
          required={required}
          disabled={disabled}
          className={inputClasses}
        >
          <option value="">{placeholder || 'Select...'}</option>
          {options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      );
    }

    if (type === 'file') {
      return (
        <input
          id={name}
          name={name}
          type="file"
          onChange={handleChange}
          required={required}
          disabled={disabled}
          accept={accept}
          multiple={multiple}
          className={cn(inputClasses, "file:mr-4 file:py-2 file:px-4 file:border-0 file:bg-primary file:text-primary-foreground file:rounded-lg file:cursor-pointer")}
        />
      );
    }

    return (
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        min={min}
        max={max}
        step={step}
        className={inputClasses}
      />
    );
  };

  return (
    <div className={cn("space-y-2", className)}>
      <label htmlFor={name} className="block text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {children || renderInput()}
      
      {hint && !error && (
        <p className="text-sm text-muted-foreground">{hint}</p>
      )}
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}

interface FormSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function FormSection({ title, description, children, className }: FormSectionProps) {
  return (
    <div className={cn("space-y-4 p-6 border rounded-xl bg-card", className)}>
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}

interface FormActionsProps {
  onCancel?: () => void;
  cancelHref?: string;
  cancelLabel?: string;
  submitLabel?: string;
  isSubmitting?: boolean;
  isLoading?: boolean;
  children?: ReactNode;
}

export function FormActions({ 
  onCancel, 
  cancelHref,
  cancelLabel = 'Cancel', 
  submitLabel = 'Save',
  isSubmitting,
  isLoading,
  children 
}: FormActionsProps) {
  const loading = isSubmitting ?? isLoading ?? false;
  
  const cancelButton = cancelHref ? (
    <a
      href={cancelHref}
      className="px-6 py-2 border rounded-lg hover:bg-muted"
    >
      {cancelLabel}
    </a>
  ) : onCancel ? (
    <button
      type="button"
      onClick={onCancel}
      disabled={loading}
      className="px-6 py-2 border rounded-lg hover:bg-muted disabled:opacity-50"
    >
      {cancelLabel}
    </button>
  ) : null;
  
  return (
    <div className="flex items-center justify-end gap-4 pt-6 border-t">
      {children}
      {cancelButton}
      <button
        type="submit"
        disabled={loading}
        className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
      >
        {loading && (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {submitLabel}
      </button>
    </div>
  );
}
