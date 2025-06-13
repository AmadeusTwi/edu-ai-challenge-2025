# Data Validation Library

A comprehensive, type-safe data validation library for TypeScript and JavaScript applications. This library provides composable validators for primitive types, complex structures, and optional fields with detailed error reporting.

## Installation

```bash
npm install
```

## Running Tests

To run the test suite and generate a coverage report:

```bash
npm test
```

To build the TypeScript code:

```bash
npm run build
```

## Quick Start

```typescript
import { Schema } from './src/validator';

// Simple validation
const nameValidator = Schema.string().minLength(2).maxLength(50);
const result = nameValidator.validate("John Doe");

if (result.isValid) {
  console.log("Valid name!");
} else {
  console.log("Errors:", result.errors);
}
```

## API Reference

### Core Types

#### `ValidationResult`
```typescript
interface ValidationResult {
  isValid: boolean;    // Whether validation passed
  errors: string[];    // Array of error messages
}
```

#### `BaseValidator<T>`
```typescript
abstract class BaseValidator<T> {
  abstract validate(data: unknown): ValidationResult;
  optional(): BaseValidator<T | null | undefined>;
  withMessage(message: string): this;
}
```

### Primitive Validators

#### `Schema.string()`

Creates a string validator with chainable methods.

```typescript
import { Schema } from './src/validator';

// Basic string validation
const basicValidator = Schema.string();
console.log(basicValidator.validate("hello")); // { isValid: true, errors: [] }
console.log(basicValidator.validate(123)); // { isValid: false, errors: ["Expected string, got number"] }

// With length constraints
const nameValidator = Schema.string().minLength(2).maxLength(50);
console.log(nameValidator.validate("John")); // { isValid: true, errors: [] }
console.log(nameValidator.validate("J")); // { isValid: false, errors: ["String length must be at least 2, got 1"] }

// With pattern and custom message
const zipCodeValidator = Schema.string()
  .pattern(/^\d{5}$/)
  .withMessage("ZIP code must be 5 digits");
```

**Chainable Methods:**
- `.minLength(min: number)` - Sets minimum string length
- `.maxLength(max: number)` - Sets maximum string length
- `.pattern(regex: RegExp)` - Sets pattern constraint
- `.optional()` - Makes the field optional
- `.withMessage(message: string)` - Sets custom error message

#### `Schema.number()`

Creates a number validator with chainable methods.

```typescript
import { Schema } from './src/validator';

// Basic number validation
const basicValidator = Schema.number();
console.log(basicValidator.validate(42)); // { isValid: true, errors: [] }
console.log(basicValidator.validate("42")); // { isValid: false, errors: ["Expected number, got string"] }

// With range constraints
const ageValidator = Schema.number().min(0).max(150);
console.log(ageValidator.validate(25)); // { isValid: true, errors: [] }
console.log(ageValidator.validate(-5)); // { isValid: false, errors: ["Number must be at least 0, got -5"] }
```

**Chainable Methods:**
- `.min(min: number)` - Sets minimum numeric value
- `.max(max: number)` - Sets maximum numeric value
- `.optional()` - Makes the field optional
- `.withMessage(message: string)` - Sets custom error message

#### `Schema.boolean()`

Creates a boolean validator.

```typescript
import { Schema } from './src/validator';

const validator = Schema.boolean();
console.log(validator.validate(true)); // { isValid: true, errors: [] }
console.log(validator.validate(false)); // { isValid: true, errors: [] }
console.log(validator.validate("true")); // { isValid: false, errors: ["Expected boolean, got string"] }
```

#### `Schema.date()`

Creates a date validator.

```typescript
import { Schema } from './src/validator';

const validator = Schema.date();
console.log(validator.validate(new Date())); // { isValid: true, errors: [] }
console.log(validator.validate("2023-01-01")); // { isValid: false, errors: ["Expected valid date, got string"] }
```

### Complex Validators

#### `Schema.array(elementValidator)`

Creates an array validator where each element must pass the provided validator.

```typescript
import { Schema } from './src/validator';

// Array of strings
const stringArrayValidator = Schema.array(Schema.string());
console.log(stringArrayValidator.validate(["hello", "world"])); // { isValid: true, errors: [] }
console.log(stringArrayValidator.validate(["hello", 123])); 
// { isValid: false, errors: ["Error at index 1: Expected string, got number"] }

// Array of numbers with constraints
const scoreArrayValidator = Schema.array(Schema.number().min(0).max(100));
console.log(scoreArrayValidator.validate([85, 92, 78])); // { isValid: true, errors: [] }

// Nested arrays
const matrixValidator = Schema.array(Schema.array(Schema.number()));
console.log(matrixValidator.validate([[1, 2], [3, 4]])); // { isValid: true, errors: [] }
```

#### `Schema.object(schema)`

Creates an object validator against a provided schema where each property has its own validator.

```typescript
import { Schema } from './src/validator';

// Simple object validation
const userValidator = Schema.object({
  name: Schema.string().minLength(2),
  age: Schema.number().min(0),
  isActive: Schema.boolean()
});

const validUser = {
  name: "John Doe",
  age: 30,
  isActive: true
};

console.log(userValidator.validate(validUser)); // { isValid: true, errors: [] }

const invalidUser = {
  name: "J", // Too short
  age: -5,   // Below minimum
  isActive: "yes" // Wrong type
};

console.log(userValidator.validate(invalidUser));
// {
//   isValid: false,
//   errors: [
//     "Error in field 'name': String length must be at least 2, got 1",
//     "Error in field 'age': Number must be at least 0, got -5",
//     "Error in field 'isActive': Expected boolean, got string"
//   ]
// }
```

### Modifier Validators

#### `.optional()` modifier

Makes any validator optional to allow `null` or `undefined` values.

```typescript
import { Schema } from './src/validator';

// Optional string field
const optionalNameValidator = Schema.string().minLength(2).optional();
console.log(optionalNameValidator.validate(null)); // { isValid: true, errors: [] }
console.log(optionalNameValidator.validate(undefined)); // { isValid: true, errors: [] }
console.log(optionalNameValidator.validate("John")); // { isValid: true, errors: [] }
console.log(optionalNameValidator.validate("J")); // { isValid: false, errors: [...] }

// Object with optional fields
const profileValidator = Schema.object({
  name: Schema.string(),
  email: Schema.string().optional(),
  phone: Schema.string().optional()
});

console.log(profileValidator.validate({
  name: "John Doe"
  // email and phone are optional, can be missing
})); // { isValid: true, errors: [] }
```

### Utility Functions

#### Direct Usage Example

```typescript
import { Schema } from './src/validator';

// Create validators
const nameValidator = Schema.string();
const ageValidator = Schema.number();

// Validate individual values
const nameResult = nameValidator.validate("John");
const ageResult = ageValidator.validate(30);

console.log(nameResult); // { isValid: true, errors: [] }
console.log(ageResult); // { isValid: true, errors: [] }
```

## Complex Examples

### Nested Object Validation

```typescript
import { Schema } from './src/validator';

// Define nested validators
const addressValidator = Schema.object({
  street: Schema.string().minLength(5),
  city: Schema.string().minLength(2),
  zipCode: Schema.string().minLength(5).maxLength(10),
  country: Schema.string().minLength(2)
});

const contactValidator = Schema.object({
  email: Schema.string(),
  phone: Schema.string().optional()
});

// Main user validator
const userValidator = Schema.object({
  id: Schema.string(),
  name: Schema.string().minLength(2).maxLength(100),
  age: Schema.number().min(0).max(150).optional(),
  addresses: Schema.array(addressValidator),
  contacts: Schema.array(contactValidator),
  tags: Schema.array(Schema.string()).optional(),
  isActive: Schema.boolean()
});

// Example usage
const userData = {
  id: "user123",
  name: "John Doe",
  age: 30,
  addresses: [
    {
      street: "123 Main Street",
      city: "Anytown",
      zipCode: "12345",
      country: "USA"
    }
  ],
  contacts: [
    { email: "john@example.com", phone: "555-1234" },
    { email: "john.work@company.com" } // phone is optional
  ],
  tags: ["developer", "typescript", "validation"],
  isActive: true
};

const result = userValidator.validate(userData);
if (result.isValid) {
  console.log("User data is valid!");
} else {
  console.log("Validation errors:", result.errors);
}
```

### API Response Validation

```typescript
import { Schema } from './src/validator';

// API response structure
const apiResponseValidator = Schema.object({
  status: Schema.string(),
  code: Schema.number(),
  data: Schema.object({
    users: Schema.array(Schema.object({
      id: Schema.string(),
      name: Schema.string(),
      email: Schema.string()
    })),
    totalCount: Schema.number(),
    hasMore: Schema.boolean()
  }).optional(),
  errors: Schema.array(Schema.string()).optional()
});

// Validate API response
const response = {
  status: "success",
  code: 200,
  data: {
    users: [
      { id: "1", name: "John", email: "john@example.com" },
      { id: "2", name: "Jane", email: "jane@example.com" }
    ],
    totalCount: 2,
    hasMore: false
  }
};

const validationResult = apiResponseValidator.validate(response);
```

## Error Handling Best Practices

The library provides detailed error messages that include:

- **Field names** for object validation errors
- **Array indices** for array validation errors  
- **Nested paths** for complex structures
- **Constraint details** for range/length violations

```typescript
// Example of detailed error reporting
const result = userValidator.validate({
  name: "J", // Too short
  contacts: [
    { email: "valid@email.com" },
    { email: 123 } // Wrong type
  ]
});

console.log(result.errors);
// [
//   "Error in field 'name': String length must be at least 2, got 1",
//   "Error in field 'contacts': Error at index 1: Error in field 'email': Expected string, got number"
// ]
```

## TypeScript Integration

The library is built with TypeScript and provides full type safety:

```typescript
// Type inference works automatically
const userValidator = Schema.object({
  name: Schema.string(),
  age: Schema.number()
});

// TypeScript knows the expected type
type User = {
  name: string;
  age: number;
};

// Type-safe validation
function validateUser(data: unknown): User | null {
  const result = userValidator.validate(data);
  if (result.isValid) {
    return data as User; // Safe cast after validation
  }
  return null;
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass with `npm test`
6. Submit a pull request

## License

MIT License - see LICENSE file for details. 