import User from 'src/user/entities/user.entity';
import * as bcrypt from 'bcryptjs';

export const recursivelyStripNullValues = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(recursivelyStripNullValues);
  }

  if (value !== null && typeof value === 'object') {
    return (Object as any).fromEntries(
      Object.entries(value).map(([key, value]) => [
        key,
        recursivelyStripNullValues(value),
      ]),
    );
  }

  if (value instanceof Date) {
    return value;
  }

  if (value !== null) {
    return value;
  }
};

export const mockedConfigService = {
  get(key: string) {
    switch (key) {
      case 'JWT_EXPIRATION_TIME':
        return '3600';
    }
  },
};

export const mockedJwtService = {
  sign: () => '',
};

export const mockedUser: User = {
  id: 1,
  email: 'user@email.com',
  name: 'John',
  password: 'hash',
  address: {
    id: 1,
    street: 'streetName',
    city: 'cityName',
    country: 'countryName',
  },
};

export { bcrypt };
