package hu.nutrismart.nutrismart.service;

import hu.nutrismart.nutrismart.dto.*;
import hu.nutrismart.nutrismart.entity.*;
import hu.nutrismart.nutrismart.exception.*;
import hu.nutrismart.nutrismart.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final AuthService authService;
    public UserService(UserRepository userRepository, UserProfileRepository userProfileRepository, AuthService authService) {
        this.userRepository = userRepository;
        this.userProfileRepository = userProfileRepository;
        this.authService = authService;
    }
    public User findUserByEmail(String email) { return userRepository.findByEmail(email).orElseThrow(() -> new NotFoundException("Felhasználó nem található.")); }
    public User findUserById(Long id) { return userRepository.findById(id).orElseThrow(() -> new NotFoundException("Felhasználó nem található: " + id)); }
    public List<UserResponse> getAllUsers() { return userRepository.findAll().stream().map(authService::toUserResponse).toList(); }
    public UserResponse getUserResponse(Long id) { return authService.toUserResponse(findUserById(id)); }
    public UserProfileDto getProfileByUserId(Long userId) {
        User user = findUserById(userId);
        UserProfile profile = userProfileRepository.findByUserId(userId).orElseThrow(() -> new NotFoundException("A felhasználó profilja nem található."));
        return toProfileDto(user, profile);
    }
    @Transactional
    public UserProfileDto updateProfile(Long userId, UserProfileDto dto) {
        User user = findUserById(userId);
        UserProfile profile = userProfileRepository.findByUserId(userId).orElseGet(() -> { UserProfile created = new UserProfile(); created.setUser(user); return created; });
        profile.setFullName(dto.fullName());
        profile.setGender(dto.gender());
        profile.setAge(dto.age());
        profile.setHeightCm(dto.heightCm());
        double currentWeight = dto.currentWeightKg() != null ? dto.currentWeightKg() : dto.weightKg();
        profile.setWeightKg(currentWeight);
        profile.setStartingWeightKg(dto.startingWeightKg() != null ? dto.startingWeightKg() : currentWeight);
        profile.setCurrentWeightKg(currentWeight);
        profile.setTargetWeightKg(dto.targetWeightKg() != null ? dto.targetWeightKg() : currentWeight);
        profile.setWaterGoalMl(dto.waterGoalMl() != null ? dto.waterGoalMl() : 2500);
        profile.setMealsPerDay(dto.mealsPerDay() != null ? dto.mealsPerDay() : 3);
        profile.setSleepGoalHours(dto.sleepGoalHours() != null ? dto.sleepGoalHours() : 8.0);
        profile.setGoal(dto.goal());
        profile.setActivityLevel(dto.activityLevel());
        profile.setVegetarianEnabled(Boolean.TRUE.equals(dto.vegetarianEnabled()));
        userProfileRepository.save(profile);
        return toProfileDto(user, profile);
    }
    @Transactional
    public UserResponse adminUpdateUser(Long id, AdminUserUpdateRequest request, String actingAdminEmail) {
        User user = findUserById(id); User actingAdmin = findUserByEmail(actingAdminEmail);
        if (actingAdmin.getId().equals(id)) {
            if (!Role.ADMIN.equals(request.role())) throw new BadRequestException("Az admin nem veheti el a saját admin jogosultságát.");
            if (!Boolean.TRUE.equals(request.active())) throw new BadRequestException("Az admin nem tilthatja le önmagát.");
        }
        user.setRole(request.role()); user.setActive(request.active());
        return authService.toUserResponse(userRepository.save(user));
    }
    @Transactional
    public void adminDeleteUser(Long id, String actingAdminEmail) {
        User actingAdmin = findUserByEmail(actingAdminEmail);
        if (actingAdmin.getId().equals(id)) throw new BadRequestException("Az admin nem törölheti önmagát.");
        userRepository.delete(findUserById(id));
    }
    public UserProfile findProfileEntityByUserId(Long userId) { return userProfileRepository.findByUserId(userId).orElseThrow(() -> new NotFoundException("A felhasználó profilja nem található.")); }
    private UserProfileDto toProfileDto(User user, UserProfile profile) {
        return new UserProfileDto(
                profile.getId(),
                user.getEmail(),
                profile.getFullName(),
                profile.getGender(),
                profile.getAge(),
                profile.getHeightCm(),
                profile.getWeightKg(),
                profile.getStartingWeightKg() != null ? profile.getStartingWeightKg() : profile.getWeightKg(),
                profile.getCurrentWeightKg() != null ? profile.getCurrentWeightKg() : profile.getWeightKg(),
                profile.getTargetWeightKg() != null ? profile.getTargetWeightKg() : profile.getWeightKg(),
                profile.getWaterGoalMl() != null ? profile.getWaterGoalMl() : 2500,
                profile.getMealsPerDay() != null ? profile.getMealsPerDay() : 3,
                profile.getSleepGoalHours() != null ? profile.getSleepGoalHours() : 8.0,
                profile.getGoal(),
                profile.getActivityLevel(),
                Boolean.TRUE.equals(profile.getVegetarianEnabled())
        );
    }
}
