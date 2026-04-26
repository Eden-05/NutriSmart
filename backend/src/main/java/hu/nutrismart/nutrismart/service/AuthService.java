package hu.nutrismart.nutrismart.service;

import hu.nutrismart.nutrismart.dto.AuthRequest;
import hu.nutrismart.nutrismart.dto.AuthResponse;
import hu.nutrismart.nutrismart.dto.RegisterRequest;
import hu.nutrismart.nutrismart.dto.UserResponse;
import hu.nutrismart.nutrismart.entity.Role;
import hu.nutrismart.nutrismart.entity.User;
import hu.nutrismart.nutrismart.entity.UserProfile;
import hu.nutrismart.nutrismart.exception.BadRequestException;
import hu.nutrismart.nutrismart.exception.UnauthorizedException;
import hu.nutrismart.nutrismart.repository.UserProfileRepository;
import hu.nutrismart.nutrismart.repository.UserRepository;
import hu.nutrismart.nutrismart.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository,
                       UserProfileRepository userProfileRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtService jwtService) {
        this.userRepository = userRepository;
        this.userProfileRepository = userProfileRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase();
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new BadRequestException("Ez az email cím már regisztrálva van.");
        }

        User user = new User();
        user.setEmail(normalizedEmail);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(Role.USER);
        user.setActive(true);
        user = userRepository.save(user);

        UserProfile profile = new UserProfile();
        profile.setUser(user);
        profile.setFullName(request.fullName());
        profile.setGender("egyeb");
        profile.setAge(18);
        profile.setHeightCm(170);
        profile.setWeightKg(70.0);
        profile.setGoal("szintentartas");
        profile.setActivityLevel("kozepes");
        userProfileRepository.save(profile);

        String token = jwtService.generateToken(user);
        return new AuthResponse(token, toUserResponse(user));
    }

    public AuthResponse login(AuthRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase();
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(normalizedEmail, request.password())
            );
        } catch (Exception ex) {
            throw new UnauthorizedException("Hibás email vagy jelszó.");
        }

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new UnauthorizedException("Hibás email vagy jelszó."));

        if (!Boolean.TRUE.equals(user.getActive())) {
            throw new UnauthorizedException("A felhasználó inaktív.");
        }

        String token = jwtService.generateToken(user);
        return new AuthResponse(token, toUserResponse(user));
    }

    public boolean verifyPassword(User user, String rawPassword) {
        return passwordEncoder.matches(rawPassword, user.getPasswordHash());
    }

    public UserResponse toUserResponse(User user) {
        String fullName = user.getProfile() != null ? user.getProfile().getFullName() : null;
        return new UserResponse(user.getId(), user.getEmail(), fullName, user.getRole(), user.getActive(), user.getCreatedAt());
    }
}
