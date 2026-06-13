@Data
public class LoginRequest {
    @NotBlank String phoneNumber;
    @NotBlank String password;
}