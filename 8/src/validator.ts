/**
 * Represents the result of a validation operation
 */
export interface ValidationResult {
  /** Whether the validation passed */
  isValid: boolean;
  /** Array of error messages if validation failed */
  errors: string[];
}

/**
 * Creates a successful validation result
 */
function success(): ValidationResult {
  return { isValid: true, errors: [] };
}

/**
 * Creates a failed validation result with error messages
 */
function failure(errors: string[]): ValidationResult {
  return { isValid: false, errors };
}

/**
 * Base validator class that provides common validation functionality
 */
export abstract class BaseValidator<T> {
  protected _isOptional = false;
  protected _customMessage?: string;

  /**
   * Validates the given data
   */
  abstract validate(data: unknown): ValidationResult;

  /**
   * Makes this validator optional (allows null/undefined)
   */
  optional(): BaseValidator<T | null | undefined> {
    const validator = this.clone();
    validator._isOptional = true;
    return validator;
  }

  /**
   * Sets a custom error message
   */
  withMessage(message: string): this {
    this._customMessage = message;
    return this;
  }

  /**
   * Creates a copy of this validator
   */
  protected abstract clone(): BaseValidator<T>;

  /**
   * Helper method to handle optional validation
   */
  protected validateOptional(
    data: unknown,
    validateFn: () => ValidationResult
  ): ValidationResult {
    if (this._isOptional && (data === null || data === undefined)) {
      return success();
    }
    const result = validateFn();
    if (!result.isValid && this._customMessage) {
      return failure([this._customMessage]);
    }
    return result;
  }
}

/**
 * String validator with chainable methods
 */
export class StringValidator extends BaseValidator<string> {
  private _minLength?: number;
  private _maxLength?: number;
  private _pattern?: RegExp;

  validate(data: unknown): ValidationResult {
    return this.validateOptional(data, () => {
      if (typeof data !== "string") {
        return failure(["Expected string, got " + typeof data]);
      }

      const errors: string[] = [];

      if (this._minLength !== undefined && data.length < this._minLength) {
        errors.push(
          `String length must be at least ${this._minLength}, got ${data.length}`
        );
      }

      if (this._maxLength !== undefined && data.length > this._maxLength) {
        errors.push(
          `String length must be at most ${this._maxLength}, got ${data.length}`
        );
      }

      if (this._pattern && !this._pattern.test(data)) {
        errors.push(`String does not match required pattern`);
      }

      return errors.length === 0 ? success() : failure(errors);
    });
  }

  /**
   * Sets minimum length constraint
   */
  minLength(min: number): this {
    this._minLength = min;
    return this;
  }

  /**
   * Sets maximum length constraint
   */
  maxLength(max: number): this {
    this._maxLength = max;
    return this;
  }

  /**
   * Sets a pattern constraint
   */
  pattern(pattern: RegExp): this {
    this._pattern = pattern;
    return this;
  }

  protected clone(): StringValidator {
    const validator = new StringValidator();
    validator._isOptional = this._isOptional;
    validator._customMessage = this._customMessage;
    validator._minLength = this._minLength;
    validator._maxLength = this._maxLength;
    validator._pattern = this._pattern;
    return validator;
  }
}

/**
 * Number validator with chainable methods
 */
export class NumberValidator extends BaseValidator<number> {
  private _min?: number;
  private _max?: number;

  validate(data: unknown): ValidationResult {
    return this.validateOptional(data, () => {
      if (typeof data !== "number" || isNaN(data)) {
        return failure(["Expected number, got " + typeof data]);
      }

      const errors: string[] = [];

      if (this._min !== undefined && data < this._min) {
        errors.push(`Number must be at least ${this._min}, got ${data}`);
      }

      if (this._max !== undefined && data > this._max) {
        errors.push(`Number must be at most ${this._max}, got ${data}`);
      }

      return errors.length === 0 ? success() : failure(errors);
    });
  }

  /**
   * Sets minimum value constraint
   */
  min(min: number): this {
    this._min = min;
    return this;
  }

  /**
   * Sets maximum value constraint
   */
  max(max: number): this {
    this._max = max;
    return this;
  }

  protected clone(): NumberValidator {
    const validator = new NumberValidator();
    validator._isOptional = this._isOptional;
    validator._customMessage = this._customMessage;
    validator._min = this._min;
    validator._max = this._max;
    return validator;
  }
}

/**
 * Boolean validator
 */
export class BooleanValidator extends BaseValidator<boolean> {
  validate(data: unknown): ValidationResult {
    return this.validateOptional(data, () => {
      if (typeof data !== "boolean") {
        return failure(["Expected boolean, got " + typeof data]);
      }
      return success();
    });
  }

  protected clone(): BooleanValidator {
    const validator = new BooleanValidator();
    validator._isOptional = this._isOptional;
    validator._customMessage = this._customMessage;
    return validator;
  }
}

/**
 * Date validator
 */
export class DateValidator extends BaseValidator<Date> {
  validate(data: unknown): ValidationResult {
    return this.validateOptional(data, () => {
      if (!(data instanceof Date) || isNaN(data.getTime())) {
        return failure(["Expected valid date, got " + typeof data]);
      }
      return success();
    });
  }

  protected clone(): DateValidator {
    const validator = new DateValidator();
    validator._isOptional = this._isOptional;
    validator._customMessage = this._customMessage;
    return validator;
  }
}

/**
 * Array validator
 */
export class ArrayValidator<T> extends BaseValidator<T[]> {
  constructor(private elementValidator: BaseValidator<T>) {
    super();
  }

  validate(data: unknown): ValidationResult {
    return this.validateOptional(data, () => {
      if (!Array.isArray(data)) {
        return failure(["Expected array, got " + typeof data]);
      }

      const errors: string[] = [];

      data.forEach((element, index) => {
        const result = this.elementValidator.validate(element);
        if (!result.isValid) {
          result.errors.forEach((error) => {
            errors.push(`Error at index ${index}: ${error}`);
          });
        }
      });

      return errors.length === 0 ? success() : failure(errors);
    });
  }

  protected clone(): ArrayValidator<T> {
    const validator = new ArrayValidator(this.elementValidator);
    validator._isOptional = this._isOptional;
    validator._customMessage = this._customMessage;
    return validator;
  }
}

/**
 * Object validator
 */
export class ObjectValidator<
  T extends Record<string, any>
> extends BaseValidator<T> {
  constructor(
    private schema: { [K in keyof T]: BaseValidator<T[K]> } = {} as any
  ) {
    super();
  }

  validate(data: unknown): ValidationResult {
    return this.validateOptional(data, () => {
      if (typeof data !== "object" || data === null || Array.isArray(data)) {
        return failure([
          "Expected object, got " + (data === null ? "null" : typeof data),
        ]);
      }

      const errors: string[] = [];
      const obj = data as Record<string, unknown>;

      // Validate each property in the schema
      for (const [key, validator] of Object.entries(this.schema)) {
        const result = validator.validate(obj[key]);
        if (!result.isValid) {
          result.errors.forEach((error) => {
            errors.push(`Error in field '${key}': ${error}`);
          });
        }
      }

      return errors.length === 0 ? success() : failure(errors);
    });
  }

  protected clone(): ObjectValidator<T> {
    const validator = new ObjectValidator(this.schema);
    validator._isOptional = this._isOptional;
    validator._customMessage = this._customMessage;
    return validator;
  }
}

/**
 * Schema builder class with static factory methods
 */
export class Schema {
  /**
   * Creates a string validator
   */
  static string(): StringValidator {
    return new StringValidator();
  }

  /**
   * Creates a number validator
   */
  static number(): NumberValidator {
    return new NumberValidator();
  }

  /**
   * Creates a boolean validator
   */
  static boolean(): BooleanValidator {
    return new BooleanValidator();
  }

  /**
   * Creates a date validator
   */
  static date(): DateValidator {
    return new DateValidator();
  }

  /**
   * Creates an object validator with the given schema
   */
  static object<T extends Record<string, any>>(schema: {
    [K in keyof T]: BaseValidator<T[K]>;
  }): ObjectValidator<T> {
    return new ObjectValidator<T>(schema);
  }

  /**
   * Creates an array validator with the given element validator
   */
  static array<T>(elementValidator: BaseValidator<T>): ArrayValidator<T> {
    return new ArrayValidator<T>(elementValidator);
  }
}
