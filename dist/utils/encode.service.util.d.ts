import type { EncodeSecretUserDto } from "./dto/encode-secret-user.dto";
export declare class EncodeUtilService {
    encodeUserSecret(dto: EncodeSecretUserDto): string;
    decodeUserSecret(encodeValueString: string, sedCode: string): {
        privateKey: string;
        sedCode: string;
    };
}
//# sourceMappingURL=encode.service.util.d.ts.map