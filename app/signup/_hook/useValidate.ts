import { useState, useCallback, useMemo } from "react";

// 유효성 검사 규칙 타입
export type ValidationType =
  | "name"
  | "phone"
  | "email"
  | "id"
  | "password"
  | "custom";

// 유효성 검사 규칙 인터페이스
export interface ValidationRule {
  type: ValidationType;
  pattern?: RegExp;
  minLength?: number;
  maxLength?: number;
  message?: string;
  validate?: (value: string) => boolean;
}

// 필드별 검증 결과
export interface FieldValidation {
  isValid: boolean;
  isDirty: boolean;
  error: string;
}

// 기본 정규식 패턴
export const PATTERNS = {
  name: /^[가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z\s]+$/, // 이름: 한글(완성형+자모), 영문만 허용 (공백 포함)
  phone: /^01[0-9]-\d{3,4}-\d{4}$/, // 전화번호: 010-1234-5678 형식
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, // 이메일: 기본 이메일 형식
  id: /^[a-zA-Z0-9]+$/, // 아이디: 영문, 숫자만 허용
  password:
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).+$/, // 비밀번호: 영문 대소문자, 숫자, 특수문자 포함
} as const;

// 기본 에러 메시지 타입
interface ValidationMessages {
  empty: string;
  invalid: string;
  minLength?: string;
  maxLength?: string;
}

// 기본 에러 메시지 (프로젝트 말투에 맞춤)
export const DEFAULT_MESSAGES: Record<
  Exclude<ValidationType, "custom">,
  ValidationMessages
> = {
  name: {
    empty: "이름을 입력해주세요",
    invalid: "이름은 한글 또는 영문만 입력 가능해요",
    minLength: "이름을 2자 이상 입력해주세요",
  },
  phone: {
    empty: "전화번호를 입력해주세요",
    invalid: "올바른 전화번호 형식이 아니에요",
    minLength: "전화번호를 정확히 입력해주세요",
  },
  email: {
    empty: "이메일을 입력해주세요",
    invalid: "올바른 이메일 형식이 아니에요",
    minLength: "올바른 이메일 형식이 아니에요",
  },
  id: {
    empty: "아이디를 입력해주세요",
    invalid: "아이디는 영문, 숫자만 입력 가능해요",
    minLength: "아이디는 4자 이상 입력해주세요",
  },
  password: {
    empty: "비밀번호를 입력해주세요",
    invalid: "영문 대소문자, 숫자, 특수문자를 포함해주세요",
    minLength: "비밀번호는 8자 이상 입력해주세요",
    maxLength: "비밀번호는 32자 이하로 입력해주세요",
  },
};

// 기본 길이 제한
const DEFAULT_LENGTHS = {
  name: { min: 2, max: 50 },
  phone: { min: 8, max: 13 }, // 010-1234-5678 = 13자
  email: { min: 5, max: 100 },
  id: { min: 4, max: 20 },
  password: { min: 8, max: 32 },
} as const;

interface UseValidateOptions {
  validateOnChange?: boolean; // 실시간 검증 여부 (기본: true)
  validateOnBlur?: boolean; // blur 시 검증 여부 (기본: true)
}

/**
 * 폼 유효성 검사 훅
 *
 * @example
 * const { fields, handleChange, handleBlur, isAllValid } = useValidate({
 *   name: { type: 'name' },
 *   phone: { type: 'phone' },
 *   email: { type: 'email' },
 * });
 *
 * // 커스텀 규칙 사용
 * const { fields } = useValidate({
 *   nickname: {
 *     type: 'custom',
 *     pattern: /^[a-zA-Z0-9_]+$/,
 *     minLength: 3,
 *     message: '닉네임은 영문, 숫자, 밑줄만 가능해요',
 *   },
 * });
 */
export function useValidate<T extends string>(
  rules: Record<T, ValidationRule>,
  options: UseValidateOptions = {},
) {
  const { validateOnChange = true, validateOnBlur = true } = options;

  // 초기 필드 상태 생성
  const initialFields = useMemo(() => {
    const fields = {} as Record<T, FieldValidation>;
    (Object.keys(rules) as T[]).forEach((key) => {
      fields[key] = { isValid: false, isDirty: false, error: "" };
    });
    return fields;
  }, []);

  const [fields, setFields] =
    useState<Record<T, FieldValidation>>(initialFields);
  const [values, setValues] = useState<Record<T, string>>(() => {
    const v = {} as Record<T, string>;
    (Object.keys(rules) as T[]).forEach((key) => {
      v[key] = "";
    });
    return v;
  });

  // 단일 필드 검증
  const validate = useCallback(
    (field: T, value: string): FieldValidation => {
      const rule = rules[field];
      const trimmedValue = value.trim();

      // 결과를 state에 반영하는 헬퍼
      const updateAndReturn = (result: FieldValidation) => {
        setFields((prev) => ({ ...prev, [field]: result }));
        return result;
      };

      // 빈 값 체크
      if (!trimmedValue) {
        const emptyMsg =
          rule.message ||
          (rule.type !== "custom"
            ? DEFAULT_MESSAGES[rule.type]?.empty
            : "값을 입력해주세요");
        return updateAndReturn({
          isValid: false,
          isDirty: true,
          error: emptyMsg || "",
        });
      }

      // 최소 길이 체크
      const minLength =
        rule.minLength ||
        (rule.type !== "custom" ? DEFAULT_LENGTHS[rule.type]?.min : undefined);
      if (minLength && trimmedValue.length < minLength) {
        const minMsg =
          rule.message ||
          (rule.type !== "custom"
            ? DEFAULT_MESSAGES[rule.type]?.minLength
            : `${minLength}자 이상 입력해주세요`);
        return updateAndReturn({
          isValid: false,
          isDirty: true,
          error: minMsg || "",
        });
      }

      // 최대 길이 체크
      const maxLength =
        rule.maxLength ||
        (rule.type !== "custom" ? DEFAULT_LENGTHS[rule.type]?.max : undefined);
      if (maxLength && trimmedValue.length > maxLength) {
        const maxMsg =
          rule.message ||
          (rule.type !== "custom"
            ? DEFAULT_MESSAGES[rule.type]?.maxLength
            : `${maxLength}자 이하로 입력해주세요`);
        return updateAndReturn({
          isValid: false,
          isDirty: true,
          error: maxMsg || "",
        });
      }

      // 정규식 패턴 체크
      const pattern =
        rule.pattern ||
        (rule.type !== "custom" ? PATTERNS[rule.type] : undefined);
      if (pattern && !pattern.test(trimmedValue)) {
        const invalidMsg =
          rule.message ||
          (rule.type !== "custom"
            ? DEFAULT_MESSAGES[rule.type]?.invalid
            : "올바른 형식이 아니에요");
        return updateAndReturn({
          isValid: false,
          isDirty: true,
          error: invalidMsg || "",
        });
      }

      // 커스텀 검증 함수
      if (rule.validate && !rule.validate(trimmedValue)) {
        return updateAndReturn({
          isValid: false,
          isDirty: true,
          error: rule.message || "올바른 형식이 아니에요",
        });
      }

      return updateAndReturn({ isValid: true, isDirty: true, error: "" });
    },
    [rules],
  );

  // 값 변경 핸들러
  const handleChange = useCallback(
    (field: T, value: string) => {
      setValues((prev) => ({ ...prev, [field]: value }));

      if (validateOnChange) {
        const result = validate(field, value);
        setFields((prev) => ({ ...prev, [field]: result }));
      }
    },
    [validate, validateOnChange],
  );

  // blur 핸들러
  const handleBlur = useCallback(
    (field: T) => {
      if (validateOnBlur) {
        const result = validate(field, values[field]);
        setFields((prev) => ({ ...prev, [field]: result }));
      }
    },
    [validate, validateOnBlur, values],
  );

  // 전체 검증
  const validateAll = useCallback(
    (valuesToValidate: Record<T, string>): boolean => {
      let allValid = true;
      const newFields = { ...fields };

      (Object.keys(rules) as T[]).forEach((field) => {
        const result = validate(field, valuesToValidate[field]);
        newFields[field] = result;
        if (!result.isValid) {
          allValid = false;
        }
      });

      setFields(newFields);
      return allValid;
    },
    [fields, rules, validate],
  );

  // 필드 초기화
  const resetField = useCallback((field: T) => {
    setFields((prev) => ({
      ...prev,
      [field]: { isValid: false, isDirty: false, error: "" },
    }));
    setValues((prev) => ({ ...prev, [field]: "" }));
  }, []);

  // 전체 초기화
  const resetAll = useCallback(() => {
    setFields(initialFields);
    const v = {} as Record<T, string>;
    (Object.keys(rules) as T[]).forEach((key) => {
      v[key] = "";
    });
    setValues(v);
  }, [initialFields, rules]);

  // 에러 직접 설정
  const setError = useCallback((field: T, error: string) => {
    setFields((prev) => ({
      ...prev,
      [field]: { ...prev[field], isValid: false, isDirty: true, error },
    }));
  }, []);

  // 전체 유효성 계산
  const isAllValid = useMemo(() => {
    return (Object.keys(fields) as T[]).every((field) => fields[field].isValid);
  }, [fields]);

  return {
    fields,
    isAllValid,
    handleChange,
    handleBlur,
    validate,
    validateAll,
    resetField,
    resetAll,
    setError,
  };
}

export default useValidate;
