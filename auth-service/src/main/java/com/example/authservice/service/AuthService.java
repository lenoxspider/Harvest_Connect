@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {
        var user = User.builder()
                .fullName(request.getFullName())
                .phoneNumber(request.getPhoneNumber())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .region(request.getRegion())
                .build();
        repository.save(user);
        
        var jwtToken = jwtService.generateAccessToken(user);
        var refreshToken = jwtService.generateRefreshToken(user);
        return AuthResponse.builder().accessToken(jwtToken).refreshToken(refreshToken).build();
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getPhoneNumber(), request.getPassword())
        );
        var user = repository.findByPhoneNumber(request.getPhoneNumber()).orElseThrow();
        var jwtToken = jwtService.generateAccessToken(user);
        var refreshToken = jwtService.generateRefreshToken(user);
        return AuthResponse.builder().accessToken(jwtToken).refreshToken(refreshToken).build();
    }

    public AuthResponse refreshToken(RefreshTokenRequest request) {
        String phoneNumber = jwtService.extractPhoneNumber(request.getRefreshToken());
        if (phoneNumber != null) {
            var user = repository.findByPhoneNumber(phoneNumber).orElseThrow();
            if (jwtService.isTokenValid(request.getRefreshToken(), user)) {
                var accessToken = jwtService.generateAccessToken(user);
                return AuthResponse.builder()
                        .accessToken(accessToken)
                        .refreshToken(request.getRefreshToken()) // Return same or new refresh token
                        .build();
            }
        }
        throw new RuntimeException("Invalid refresh token");
    }
}