import { plainToInstance, Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString, validateSync } from 'class-validator';

export class EnvironmentVariables {
  @IsString()
  @IsNotEmpty()
  DATABASE_URL!: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  PORT?: number = 4000;

  @IsString()
  @IsNotEmpty()
  R2_ACCOUNT_ID!: string;

  @IsString()
  @IsNotEmpty()
  R2_ACCESS_KEY_ID!: string;

  @IsString()
  @IsNotEmpty()
  R2_SECRET_ACCESS_KEY!: string;

  @IsString()
  @IsNotEmpty()
  R2_BUCKET_NAME!: string;

  @IsString()
  @IsNotEmpty()
  R2_PUBLIC_URL!: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(`Environment validation failed:\n${errors.toString()}`);
  }

  return validatedConfig;
}
