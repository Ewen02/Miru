import { Global, Module } from "@nestjs/common";
import { ResendMailAdapter } from "./adapters/resend.adapter";
import { MAIL_PORT } from "./mail.port";
import { MailService } from "./mail.service";

/**
 * Global so any module can inject MailService without re-importing this one.
 * MailPort is hidden — consumers go through MailService for templated sends.
 */
@Global()
@Module({
  providers: [
    { provide: MAIL_PORT, useClass: ResendMailAdapter },
    MailService,
  ],
  exports: [MailService],
})
export class MailModule {}
