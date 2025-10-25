import { join } from "path";
import { DataSource } from "typeorm";
import * as dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env['DB_HOST'],
    port: Number.parseInt(process.env['DB_PORT'] as string, 10),
    username: process.env['DB_USERNAME'],
    password: process.env['DB_PASSWORD'],
    database: process.env['DB_NAME'],
    entities: [join(__dirname, '/../lib/entities/**/*.entity.{ts,js}')],
    migrations: [join(__dirname, '/../lib/migrations/**/*.migration.{ts,js}')],
    migrationsTableName: 'migrations_history',
    synchronize: process.env['NODE_ENV'] !== 'production',
    logging: false,
});