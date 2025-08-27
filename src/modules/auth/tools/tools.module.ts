import { Module } from "@nestjs/common";
import { CookieService } from "./cookie.service";
import { HashService } from "./hash.service";

@Module({
    providers:[CookieService, HashService],
    exports:[CookieService, HashService]
})
export class ToolsModule{}