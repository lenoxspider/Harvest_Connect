import java.util.UUID;

public record NotificationRequest(
    UUID userId,
    String title,
    String message,
    String type
) {}