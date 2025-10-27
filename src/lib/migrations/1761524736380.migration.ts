import { MigrationInterface, QueryRunner } from "typeorm";

export class InitMigration1761524736380 implements MigrationInterface {
    name = 'InitMigration1761524736380'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "drones" ("serial" character varying(100) NOT NULL, "model" "public"."drones_model_enum" NOT NULL, "weight_limit" integer NOT NULL, "battery_capacity" integer NOT NULL, "state" "public"."drones_state_enum" NOT NULL DEFAULT 'IDLE', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_e324ea0c441b3bbb62cd62d81a0" PRIMARY KEY ("serial"))`);
        await queryRunner.query(`CREATE INDEX "IDX_9246c32b7681954c672e6834a4" ON "drones" ("state") `);
        await queryRunner.query(`CREATE INDEX "IDX_6402b9201ef58510af9ca5598a" ON "drones" ("battery_capacity") `);
        await queryRunner.query(`CREATE INDEX "IDX_1fd6b3f27937a564d33c591fa8" ON "drones" ("model") `);
        await queryRunner.query(`CREATE TABLE "drone_medications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "pickup_number" character varying(14) NOT NULL, "delivery_number" character varying(14) NOT NULL, "address" text NOT NULL, "status" "public"."drone_medications_status_enum" NOT NULL DEFAULT 'IDLE', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "droneSerial" character varying(100), "medicationId" uuid, CONSTRAINT "PK_8fde64cacc91402ceeb54c82a13" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_f9062227a381ea016f0f3bbca0" ON "drone_medications" ("delivery_number") `);
        await queryRunner.query(`CREATE INDEX "IDX_c8959d5f919d838526987f4b01" ON "drone_medications" ("pickup_number") `);
        await queryRunner.query(`CREATE INDEX "IDX_db749cc3080a619b10d22d7670" ON "drone_medications" ("status") `);
        await queryRunner.query(`CREATE TABLE "medications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "weight" integer NOT NULL, "code" character varying NOT NULL, "medication_image" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_cdee49fe7cd79db13340150d356" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_e7d083f0778f731c0bd1a6fc78" ON "medications" ("code") `);
        await queryRunner.query(`CREATE INDEX "IDX_4c71a8a6de0a811702d1ef8d73" ON "medications" ("name") `);
        await queryRunner.query(`CREATE TABLE "battery_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "drone_serial" character varying NOT NULL, "battery_level" integer NOT NULL, "description" character varying(100), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_0f1adc495e15b78684461a42198" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_39620b3e41b4cb8ee9f9f65530" ON "battery_logs" ("battery_level") `);
        await queryRunner.query(`CREATE INDEX "IDX_439b114be3c51a5237849c3950" ON "battery_logs" ("drone_serial") `);
        await queryRunner.query(`ALTER TABLE "drone_medications" ADD CONSTRAINT "FK_dd9185f67f2b04bce40e188ca48" FOREIGN KEY ("droneSerial") REFERENCES "drones"("serial") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "drone_medications" ADD CONSTRAINT "FK_0106c1387d3b858cd20328702d2" FOREIGN KEY ("medicationId") REFERENCES "medications"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "drone_medications" DROP CONSTRAINT "FK_0106c1387d3b858cd20328702d2"`);
        await queryRunner.query(`ALTER TABLE "drone_medications" DROP CONSTRAINT "FK_dd9185f67f2b04bce40e188ca48"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_439b114be3c51a5237849c3950"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_39620b3e41b4cb8ee9f9f65530"`);
        await queryRunner.query(`DROP TABLE "battery_logs"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4c71a8a6de0a811702d1ef8d73"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e7d083f0778f731c0bd1a6fc78"`);
        await queryRunner.query(`DROP TABLE "medications"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_db749cc3080a619b10d22d7670"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c8959d5f919d838526987f4b01"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f9062227a381ea016f0f3bbca0"`);
        await queryRunner.query(`DROP TABLE "drone_medications"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1fd6b3f27937a564d33c591fa8"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_6402b9201ef58510af9ca5598a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9246c32b7681954c672e6834a4"`);
        await queryRunner.query(`DROP TABLE "drones"`);
    }

}
