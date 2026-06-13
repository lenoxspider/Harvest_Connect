@Data
public class RegisterRequest {
    @NotBlank String fullName;
    @NotBlank String phoneNumber;
    @NotBlank String password;
    @NotNull Role role;
    @NotBlank String region;
}