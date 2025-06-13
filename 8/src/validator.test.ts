import { Schema } from "./validator";

describe("Validation Library", () => {
  describe("Schema.string()", () => {
    test("should validate valid strings", () => {
      const validator = Schema.string();
      const result = validator.validate("hello");
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    test("should validate empty strings", () => {
      const validator = Schema.string();
      const result = validator.validate("");
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    test("should reject non-strings", () => {
      const validator = Schema.string();
      const testCases = [123, true, null, undefined, {}, []];

      testCases.forEach((testCase) => {
        const result = validator.validate(testCase);
        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0]).toContain("Expected string");
      });
    });

    test("should validate minimum length constraint", () => {
      const validator = Schema.string().minLength(3);

      expect(validator.validate("ab").isValid).toBe(false);
      expect(validator.validate("abc").isValid).toBe(true);
      expect(validator.validate("abcd").isValid).toBe(true);

      const result = validator.validate("ab");
      expect(result.errors[0]).toContain("at least 3");
    });

    test("should validate maximum length constraint", () => {
      const validator = Schema.string().maxLength(5);

      expect(validator.validate("hello").isValid).toBe(true);
      expect(validator.validate("hello world").isValid).toBe(false);

      const result = validator.validate("hello world");
      expect(result.errors[0]).toContain("at most 5");
    });

    test("should validate both min and max constraints", () => {
      const validator = Schema.string().minLength(2).maxLength(10);

      expect(validator.validate("a").isValid).toBe(false);
      expect(validator.validate("ab").isValid).toBe(true);
      expect(validator.validate("abcdefghij").isValid).toBe(true);
      expect(validator.validate("abcdefghijk").isValid).toBe(false);
    });

    test("should validate pattern constraint", () => {
      const validator = Schema.string().pattern(/^\d{5}$/);

      expect(validator.validate("12345").isValid).toBe(true);
      expect(validator.validate("123").isValid).toBe(false);
      expect(validator.validate("abc123").isValid).toBe(false);

      const result = validator.validate("abc");
      expect(result.errors[0]).toContain("does not match required pattern");
    });

    test("should support withMessage", () => {
      const validator = Schema.string()
        .minLength(5)
        .withMessage("Custom error message");

      const result = validator.validate("abc");
      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual(["Custom error message"]);
    });
  });

  describe("Schema.number()", () => {
    test("should validate valid numbers", () => {
      const validator = Schema.number();
      const testCases = [
        0,
        1,
        -1,
        3.14,
        -3.14,
        Number.MAX_VALUE,
        Number.MIN_VALUE,
      ];

      testCases.forEach((testCase) => {
        const result = validator.validate(testCase);
        expect(result.isValid).toBe(true);
        expect(result.errors).toEqual([]);
      });
    });

    test("should reject NaN", () => {
      const validator = Schema.number();
      const result = validator.validate(NaN);
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain("Expected number");
    });

    test("should reject non-numbers", () => {
      const validator = Schema.number();
      const testCases = ["123", true, null, undefined, {}, []];

      testCases.forEach((testCase) => {
        const result = validator.validate(testCase);
        expect(result.isValid).toBe(false);
        expect(result.errors[0]).toContain("Expected number");
      });
    });

    test("should validate minimum value constraint", () => {
      const validator = Schema.number().min(10);

      expect(validator.validate(9).isValid).toBe(false);
      expect(validator.validate(10).isValid).toBe(true);
      expect(validator.validate(11).isValid).toBe(true);

      const result = validator.validate(5);
      expect(result.errors[0]).toContain("at least 10");
    });

    test("should validate maximum value constraint", () => {
      const validator = Schema.number().max(100);

      expect(validator.validate(100).isValid).toBe(true);
      expect(validator.validate(101).isValid).toBe(false);

      const result = validator.validate(150);
      expect(result.errors[0]).toContain("at most 100");
    });

    test("should validate both min and max constraints", () => {
      const validator = Schema.number().min(0).max(10);

      expect(validator.validate(-1).isValid).toBe(false);
      expect(validator.validate(0).isValid).toBe(true);
      expect(validator.validate(5).isValid).toBe(true);
      expect(validator.validate(10).isValid).toBe(true);
      expect(validator.validate(11).isValid).toBe(false);
    });
  });

  describe("Schema.boolean()", () => {
    test("should validate valid booleans", () => {
      const validator = Schema.boolean();
      expect(validator.validate(true).isValid).toBe(true);
      expect(validator.validate(false).isValid).toBe(true);
    });

    test("should reject non-booleans", () => {
      const validator = Schema.boolean();
      const testCases = [0, 1, "true", "false", null, undefined, {}, []];

      testCases.forEach((testCase) => {
        const result = validator.validate(testCase);
        expect(result.isValid).toBe(false);
        expect(result.errors[0]).toContain("Expected boolean");
      });
    });
  });

  describe("Schema.date()", () => {
    test("should validate valid dates", () => {
      const validator = Schema.date();
      const validDates = [
        new Date(),
        new Date("2023-01-01"),
        new Date(2023, 0, 1),
      ];

      validDates.forEach((date) => {
        const result = validator.validate(date);
        expect(result.isValid).toBe(true);
        expect(result.errors).toEqual([]);
      });
    });

    test("should reject invalid dates", () => {
      const validator = Schema.date();
      const testCases = [
        "not a date",
        123,
        null,
        undefined,
        {},
        [],
        new Date("invalid"),
      ];

      testCases.forEach((testCase) => {
        const result = validator.validate(testCase);
        expect(result.isValid).toBe(false);
        expect(result.errors[0]).toContain("Expected valid date");
      });
    });
  });

  describe("Schema.array()", () => {
    test("should validate arrays with valid elements", () => {
      const validator = Schema.array(Schema.string());
      const result = validator.validate(["hello", "world"]);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    test("should validate empty arrays", () => {
      const validator = Schema.array(Schema.string());
      const result = validator.validate([]);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    test("should reject non-arrays", () => {
      const validator = Schema.array(Schema.string());
      const testCases = ["hello", 123, true, null, undefined, {}];

      testCases.forEach((testCase) => {
        const result = validator.validate(testCase);
        expect(result.isValid).toBe(false);
        expect(result.errors[0]).toContain("Expected array");
      });
    });

    test("should report errors with element indices", () => {
      const validator = Schema.array(Schema.number());
      const result = validator.validate([1, "invalid", 3, "also invalid"]);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.errors[0]).toContain("Error at index 1");
      expect(result.errors[1]).toContain("Error at index 3");
    });

    test("should validate nested arrays", () => {
      const validator = Schema.array(Schema.array(Schema.string()));
      const validData = [
        ["hello", "world"],
        ["foo", "bar"],
      ];
      const invalidData = [
        ["hello", 123],
        ["foo", "bar"],
      ];

      expect(validator.validate(validData).isValid).toBe(true);

      const result = validator.validate(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain("Error at index 0");
    });
  });

  describe("Schema.object()", () => {
    test("should validate objects with valid schema", () => {
      const validator = Schema.object({
        name: Schema.string(),
        age: Schema.number(),
        isActive: Schema.boolean(),
      });

      const validUser = {
        name: "John Doe",
        age: 30,
        isActive: true,
      };

      const result = validator.validate(validUser);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    test("should reject non-objects", () => {
      const validator = Schema.object({ name: Schema.string() });
      const testCases = ["hello", 123, true, null, undefined, []];

      testCases.forEach((testCase) => {
        const result = validator.validate(testCase);
        expect(result.isValid).toBe(false);
        expect(result.errors[0]).toContain("Expected object");
      });
    });

    test("should report errors with field names", () => {
      const validator = Schema.object({
        name: Schema.string(),
        age: Schema.number(),
      });

      const invalidData = {
        name: 123,
        age: "not a number",
      };

      const result = validator.validate(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(
        result.errors.some((error) => error.includes("Error in field 'name'"))
      ).toBe(true);
      expect(
        result.errors.some((error) => error.includes("Error in field 'age'"))
      ).toBe(true);
    });

    test("should validate nested objects", () => {
      const addressValidator = Schema.object({
        street: Schema.string(),
        city: Schema.string(),
        zipCode: Schema.string().minLength(5).maxLength(5),
      });

      const userValidator = Schema.object({
        name: Schema.string(),
        address: addressValidator,
      });

      const validUser = {
        name: "John Doe",
        address: {
          street: "123 Main St",
          city: "Anytown",
          zipCode: "12345",
        },
      };

      const invalidUser = {
        name: "John Doe",
        address: {
          street: "123 Main St",
          city: "Anytown",
          zipCode: "123", // Too short
        },
      };

      expect(userValidator.validate(validUser).isValid).toBe(true);

      const result = userValidator.validate(invalidUser);
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain("Error in field 'address'");
    });

    test("should handle missing properties as undefined", () => {
      const validator = Schema.object({
        required: Schema.string(),
        optional: Schema.string().optional(),
      });

      const dataWithMissingOptional = {
        required: "hello",
        // optional is missing
      };

      const result = validator.validate(dataWithMissingOptional);
      expect(result.isValid).toBe(true);
    });
  });

  describe("optional() modifier", () => {
    test("should allow null values", () => {
      const validator = Schema.string().optional();
      const result = validator.validate(null);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    test("should allow undefined values", () => {
      const validator = Schema.string().optional();
      const result = validator.validate(undefined);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    test("should validate non-null/undefined values with wrapped validator", () => {
      const validator = Schema.string().minLength(3).optional();

      expect(validator.validate("hello").isValid).toBe(true);
      expect(validator.validate("hi").isValid).toBe(false);
      expect(validator.validate(null).isValid).toBe(true);
      expect(validator.validate(undefined).isValid).toBe(true);
    });

    test("should work with complex validators", () => {
      const addressValidator = Schema.object({
        street: Schema.string(),
        city: Schema.string(),
      }).optional();

      expect(addressValidator.validate(null).isValid).toBe(true);
      expect(
        addressValidator.validate({ street: "123 Main St", city: "Anytown" })
          .isValid
      ).toBe(true);
      expect(
        addressValidator.validate({ street: 123, city: "Anytown" }).isValid
      ).toBe(false);
    });
  });

  describe("Complex nested validation scenarios", () => {
    test("should validate complex nested structures", () => {
      const contactValidator = Schema.object({
        email: Schema.string(),
        phone: Schema.string().optional(),
      });

      const addressValidator = Schema.object({
        street: Schema.string(),
        city: Schema.string(),
        country: Schema.string(),
        zipCode: Schema.string().minLength(5).maxLength(10),
      });

      const userValidator = Schema.object({
        id: Schema.string(),
        name: Schema.string().minLength(2).maxLength(50),
        age: Schema.number().min(0).max(150).optional(),
        contacts: Schema.array(contactValidator),
        addresses: Schema.array(addressValidator),
        tags: Schema.array(Schema.string()).optional(),
        isActive: Schema.boolean(),
      });

      const validUser = {
        id: "12345",
        name: "John Doe",
        age: 30,
        contacts: [
          { email: "john@example.com", phone: "555-1234" },
          { email: "john.doe@work.com" },
        ],
        addresses: [
          {
            street: "123 Main St",
            city: "Anytown",
            country: "USA",
            zipCode: "12345",
          },
        ],
        tags: ["developer", "manager"],
        isActive: true,
      };

      const result = userValidator.validate(validUser);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    test("should provide detailed error messages for complex structures", () => {
      const userValidator = Schema.object({
        name: Schema.string().minLength(2),
        contacts: Schema.array(
          Schema.object({
            email: Schema.string(),
            type: Schema.string(),
          })
        ),
      });

      const invalidUser = {
        name: "J", // Too short
        contacts: [
          { email: "valid@email.com", type: "work" },
          { email: 123, type: "personal" }, // Invalid email
          { email: "another@email.com", type: 456 }, // Invalid type
        ],
      };

      const result = userValidator.validate(invalidUser);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBe(3);
      expect(
        result.errors.some((error) => error.includes("Error in field 'name'"))
      ).toBe(true);
      expect(
        result.errors.some((error) => error.includes("Error at index 1"))
      ).toBe(true);
      expect(
        result.errors.some((error) => error.includes("Error at index 2"))
      ).toBe(true);
    });

    test("should recreate original schema.js example", () => {
      const addressSchema = Schema.object({
        street: Schema.string(),
        city: Schema.string(),
        postalCode: Schema.string()
          .pattern(/^\d{5}$/)
          .withMessage("Postal code must be 5 digits"),
        country: Schema.string(),
      });

      const userSchema = Schema.object({
        id: Schema.string().withMessage("ID must be a string"),
        name: Schema.string().minLength(2).maxLength(50),
        email: Schema.string().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
        age: Schema.number().optional(),
        isActive: Schema.boolean(),
        tags: Schema.array(Schema.string()),
        address: addressSchema.optional(),
        metadata: Schema.object({}).optional(),
      });

      const userData = {
        id: "12345",
        name: "John Doe",
        email: "john@example.com",
        isActive: true,
        tags: ["developer", "designer"],
        address: {
          street: "123 Main St",
          city: "Anytown",
          postalCode: "12345",
          country: "USA",
        },
      };

      const result = userSchema.validate(userData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });
  });
});
