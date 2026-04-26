package hu.nutrismart.nutrismart.service;

import hu.nutrismart.nutrismart.dto.AuthRequest;
import hu.nutrismart.nutrismart.dto.AuthResponse;
import hu.nutrismart.nutrismart.dto.RegisterRequest;
import hu.nutrismart.nutrismart.entity.Role;
import hu.nutrismart.nutrismart.entity.User;
import hu.nutrismart.nutrismart.entity.UserProfile;
import hu.nutrismart.nutrismart.exception.BadRequestException;
import hu.nutrismart.nutrismart.exception.UnauthorizedException;
import hu.nutrismart.nutrismart.repository.UserProfileRepository;
import hu.nutrismart.nutrismart.repository.UserRepository;
import hu.nutrismart.nutrismart.security.JwtService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {
    @Mock UserRepository userRepository;
    @Mock UserProfileRepository userProfileRepository;
    @Mock PasswordEncoder passwordEncoder;
    @Mock AuthenticationManager authenticationManager;
    @Mock JwtService jwtService;
    @InjectMocks AuthService authService;

    @Test
    void registerNormalizesEmailCreatesDefaultProfileAndReturnsToken() {
        when(userRepository.existsByEmail("teszt@example.com")).thenReturn(false);
        when(passwordEncoder.encode("StrongPass1")).thenReturn("encoded");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setId(55L);
            return user;
        });
        when(jwtService.generateToken(any(User.class))).thenReturn("jwt-token");

        AuthResponse response = authService.register(new RegisterRequest(
                "  TESZT@EXAMPLE.COM  ", "StrongPass1", "StrongPass1", "Teszt Elek"
        ));

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        ArgumentCaptor<UserProfile> profileCaptor = ArgumentCaptor.forClass(UserProfile.class);
        verify(userRepository).save(userCaptor.capture());
        verify(userProfileRepository).save(profileCaptor.capture());

        assertThat(userCaptor.getValue().getEmail()).isEqualTo("teszt@example.com");
        assertThat(userCaptor.getValue().getPasswordHash()).isEqualTo("encoded");
        assertThat(userCaptor.getValue().getRole()).isEqualTo(Role.USER);
        assertThat(userCaptor.getValue().getActive()).isTrue();
        assertThat(profileCaptor.getValue().getFullName()).isEqualTo("Teszt Elek");
        assertThat(profileCaptor.getValue().getGoal()).isEqualTo("szintentartas");
        assertThat(profileCaptor.getValue().getActivityLevel()).isEqualTo("kozepes");
        assertThat(response.token()).isEqualTo("jwt-token");
        assertThat(response.user().email()).isEqualTo("teszt@example.com");
    }

    @Test
    void registerRejectsExistingEmailBeforeEncodingPassword() {
        when(userRepository.existsByEmail("taken@example.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(new RegisterRequest(
                "taken@example.com", "StrongPass1", "StrongPass1", "Taken User"
        ))).isInstanceOf(BadRequestException.class).hasMessageContaining("már regisztrálva");

        verify(passwordEncoder, never()).encode(any());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void loginAuthenticatesNormalizedEmailAndReturnsUser() {
        User user = new User("user@example.com", "hash", Role.USER);
        user.setId(4L);
        user.setActive(true);
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(jwtService.generateToken(user)).thenReturn("jwt-login");

        AuthResponse response = authService.login(new AuthRequest(" USER@EXAMPLE.COM ", "password123"));

        assertThat(response.token()).isEqualTo("jwt-login");
        assertThat(response.user().id()).isEqualTo(4L);
        verify(authenticationManager).authenticate(any());
    }

    @Test
    void loginWrapsBadCredentialsAndRejectsInactiveUser() {
        when(authenticationManager.authenticate(any())).thenThrow(new BadCredentialsException("bad"));
        assertThatThrownBy(() -> authService.login(new AuthRequest("user@example.com", "wrongpass")))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("Hibás email");

        User inactive = new User("inactive@example.com", "hash", Role.USER);
        inactive.setActive(false);
        doReturn(null).when(authenticationManager).authenticate(any());
        when(userRepository.findByEmail("inactive@example.com")).thenReturn(Optional.of(inactive));
        assertThatThrownBy(() -> authService.login(new AuthRequest("inactive@example.com", "password123")))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("inaktív");
    }
}
