// components/AuthInput.tsx
interface AuthInputProps {
  name: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
  children?: React.ReactNode; // For the Eye icon
}

export const AuthInput = ({
  name,
  type,
  placeholder,
  value,
  onChange,
  error,
  required,
  children,
}: AuthInputProps) => (
  <div className="input-group">
    <div className="password-field-wrapper">
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
      />
      {children}
    </div>
    {error && <p className="validation-error">{error}</p>}
  </div>
);
