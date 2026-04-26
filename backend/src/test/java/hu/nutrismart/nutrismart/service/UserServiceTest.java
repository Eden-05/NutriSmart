package hu.nutrismart.nutrismart.service;

import hu.nutrismart.nutrismart.dto.AdminUserUpdateRequest;
import hu.nutrismart.nutrismart.dto.UserProfileDto;
import hu.nutrismart.nutrismart.dto.UserResponse;
import hu.nutrismart.nutrismart.entity.Role;
import hu.nutrismart.nutrismart.entity.User;
import hu.nutrismart.nutrismart.entity.UserProfile;
import hu.nutrismart.nutrismart.exception.BadRequestException;
import hu.nutrismart.nutrismart.exception.NotFoundException;
import hu.nutrismart.nutrismart.repository.UserProfileRepository;
import hu.nutrismart.nutrismart.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private UserProfileRepository userProfileRepository;
    @Mock
    private AuthService authService;

    @InjectMocks
    private UserService userService;

    @Test
    void updateProfileCreatesMissingProfileAndAppliesDefaults() {
        User user = user(1L, "bence@example.com", Role.USER, true);
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userProfileRepository.findByUserId(1L)).thenReturn(Optional.empty());
        when(userProfileRepository.save(any(UserProfile.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UserProfileDto result = userService.updateProfile(1L, new UserProfileDto(
                null,
                null,
                "Bence",
                "male",
                18,
                180,
                82.5,
                null,
                null,
                null,
                null,
                null,
                null,
                "maintain",
                "medium",
                true
        ));

        verify(userProfileRepository).save(any(UserProfile.class));
        assertThat(result.email()).isEqualTo("bence@example.com");
        assertThat(result.fullName()).isEqualTo("Bence");
        assertThat(result.startingWeightKg()).isEqualTo(82.5);
        assertThat(result.currentWeightKg()).isEqualTo(82.5);
        assertThat(result.targetWeightKg()).isEqualTo(82.5);
        assertThat(result.waterGoalMl()).isEqualTo(2500);
        assertThat(result.mealsPerDay()).isEqualTo(3);
        assertThat(result.sleepGoalHours()).isEqualTo(8.0);
        assertThat(result.vegetarianEnabled()).isTrue();
    }

    @Test
    void adminUpdateUserProtectsActingAdminFromSelfDemotionAndDisable() {
        User admin = user(7L, "admin@example.com", Role.ADMIN, true);
        when(userRepository.findById(7L)).thenReturn(Optional.of(admin));
        when(userRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(admin));

        assertThatThrownBy(() -> userService.adminUpdateUser(7L, new AdminUserUpdateRequest(Role.USER, true), "admin@example.com"))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("saját admin");

        assertThatThrownBy(() -> userService.adminUpdateUser(7L, new AdminUserUpdateRequest(Role.ADMIN, false), "admin@example.com"))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("önmagát");
    }

    @Test
    void adminUpdateUserSavesValidChangesAndReturnsMappedUser() {
        User admin = user(1L, "admin@example.com", Role.ADMIN, true);
        User target = user(2L, "user@example.com", Role.USER, true);
        UserResponse mapped = new UserResponse(2L, "user@example.com", "User", Role.ADMIN, false, LocalDateTime.now());
        when(userRepository.findById(2L)).thenReturn(Optional.of(target));
        when(userRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(admin));
        when(userRepository.save(target)).thenReturn(target);
        when(authService.toUserResponse(target)).thenReturn(mapped);

        UserResponse result = userService.adminUpdateUser(2L, new AdminUserUpdateRequest(Role.ADMIN, false), "admin@example.com");

        assertThat(target.getRole()).isEqualTo(Role.ADMIN);
        assertThat(target.getActive()).isFalse();
        assertThat(result).isSameAs(mapped);
    }

    @Test
    void findProfileEntityByUserIdThrowsWhenMissing() {
        when(userProfileRepository.findByUserId(44L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.findProfileEntityByUserId(44L))
                .isInstanceOf(NotFoundException.class)
                .hasMessageContaining("profilja");
    }

    private User user(Long id, String email, Role role, boolean active) {
        User user = new User(email, "hash", role);
        user.setId(id);
        user.setActive(active);
        return user;
    }
}
