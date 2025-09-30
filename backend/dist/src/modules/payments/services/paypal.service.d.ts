export declare class PaypalService {
    processPayment(data: any): Promise<any>;
    refundPayment(data: any): Promise<any>;
    handleWebhook(payload: any): Promise<any>;
}
