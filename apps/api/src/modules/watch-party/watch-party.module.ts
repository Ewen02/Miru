import { Module } from "@nestjs/common";
import { WatchPartyGateway } from "./watch-party.gateway";

/**
 * Watch party is a pure real-time feature: no persistence, no REST surface.
 * The gateway holds ephemeral room state in memory, so the module only needs
 * to register the gateway as a provider.
 */
@Module({
  providers: [WatchPartyGateway],
})
export class WatchPartyModule {}
