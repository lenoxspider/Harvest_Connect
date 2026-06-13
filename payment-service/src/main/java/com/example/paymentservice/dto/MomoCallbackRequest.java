public record MomoCallbackRequest(
    String externalId, // maps to our transaction ID
    String status,     // SUCCESSFUL or FAILED
    String financialTransactionId
) {}