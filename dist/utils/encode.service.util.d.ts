import type { EncodeSecretUserDto } from "./dto/encode-secret-user.dto";
import type { EncodeTransactionDataDto } from "./dto/encode-transaction-data.dto";
export declare class EncodeUtilService {
    encodeUserSecret(dto: EncodeSecretUserDto): string;
    decodeUserSecret(encodeValueString: string, sedCode: string): {
        privateKey: string;
        sedCode: string;
    };
    encodeTransactionData(dto: EncodeTransactionDataDto): string;
    decodeTransactionData(encodeValueString: string, blockHash: string): {
        readonly sender: string;
        readonly to: string;
        readonly amount: string;
        readonly indexBlock: string;
        readonly timestamp: string;
        blockHash: string;
    };
}
//# sourceMappingURL=encode.service.util.d.ts.map