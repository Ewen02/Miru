import { Global, Module } from "@nestjs/common";
import { RunContextService } from "./run-context.service";

@Global()
@Module({
  providers: [RunContextService],
  exports: [RunContextService],
})
export class ContextModule {}
