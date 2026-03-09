import { useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { z } from 'zod';
import { authService } from '../../src/services/auth';
import { useAuthStore } from '../../src/store/auth-store';
import { ApiRequestError } from '../../src/services/api';
import { Button } from '../../src/components/common/Button';
import { Input } from '../../src/components/common/Input';
import { colors } from '../../src/theme/colors';
import { spacing } from '../../src/theme/spacing';
import { radius } from '../../src/theme/radius';
import { typography } from '../../src/theme/typography';

const profileSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(100),
  phone: z.string().max(20, 'Phone too long').optional().or(z.literal('')),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
});

type ProfileErrors = Partial<Record<'fullName' | 'phone', string>>;
type PasswordErrors = Partial<Record<'currentPassword' | 'newPassword', string>>;

export default function ProfileScreen() {
  const { user, setUser, clearUser } = useAuthStore();
  const router = useRouter();

  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [profileErrors, setProfileErrors] = useState<ProfileErrors>({});
  const [profileServerError, setProfileServerError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordErrors, setPasswordErrors] = useState<PasswordErrors>({});
  const [passwordServerError, setPasswordServerError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  async function handleSaveProfile() {
    const result = profileSchema.safeParse({ fullName, phone: phone || undefined });
    if (!result.success) {
      const errs: ProfileErrors = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof ProfileErrors;
        if (!errs[key]) errs[key] = issue.message;
      }
      setProfileErrors(errs);
      return;
    }

    setSavingProfile(true);
    setProfileServerError('');
    setProfileSuccess('');
    try {
      const updated = await authService.updateProfile({
        fullName: result.data.fullName,
        phone: result.data.phone,
      });
      setUser(updated);
      setProfileSuccess('Profile updated successfully');
    } catch (err) {
      setProfileServerError(
        err instanceof ApiRequestError ? err.message : 'Failed to update profile.',
      );
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleChangePassword() {
    const result = passwordSchema.safeParse({ currentPassword, newPassword });
    if (!result.success) {
      const errs: PasswordErrors = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof PasswordErrors;
        if (!errs[key]) errs[key] = issue.message;
      }
      setPasswordErrors(errs);
      return;
    }

    setSavingPassword(true);
    setPasswordServerError('');
    setPasswordSuccess('');
    try {
      await authService.changePassword(result.data.currentPassword, result.data.newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setPasswordSuccess('Password changed successfully');
    } catch (err) {
      setPasswordServerError(
        err instanceof ApiRequestError ? err.message : 'Failed to change password.',
      );
    } finally {
      setSavingPassword(false);
    }
  }

  async function handleLogout() {
    const doLogout = async () => {
      await authService.logout();
      clearUser();
      router.replace('/(auth)/login');
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Log out of your account?')) doLogout();
    } else {
      Alert.alert('Log Out', 'Log out of your account?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log Out', style: 'destructive', onPress: doLogout },
      ]);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Account Info */}
      <View style={styles.avatarCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarInitial}>
            {user?.fullName?.charAt(0).toUpperCase() ?? '?'}
          </Text>
        </View>
        <Text style={styles.userName}>{user?.fullName}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
      </View>

      {/* Edit Profile */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Edit Profile</Text>

        {profileServerError ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{profileServerError}</Text>
          </View>
        ) : null}
        {profileSuccess ? (
          <View style={styles.successBanner}>
            <Text style={styles.successText}>{profileSuccess}</Text>
          </View>
        ) : null}

        <Input
          label="Full Name"
          value={fullName}
          onChangeText={v => { setFullName(v); setProfileErrors(e => ({ ...e, fullName: undefined })); setProfileSuccess(''); }}
          error={profileErrors.fullName}
          autoCapitalize="words"
        />
        <Input
          label="Phone (optional)"
          value={phone}
          onChangeText={v => { setPhone(v); setProfileErrors(e => ({ ...e, phone: undefined })); setProfileSuccess(''); }}
          error={profileErrors.phone}
          keyboardType="phone-pad"
        />
        <Button onPress={handleSaveProfile} loading={savingProfile}>
          Save Changes
        </Button>
      </View>

      {/* Change Password */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Change Password</Text>

        {passwordServerError ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{passwordServerError}</Text>
          </View>
        ) : null}
        {passwordSuccess ? (
          <View style={styles.successBanner}>
            <Text style={styles.successText}>{passwordSuccess}</Text>
          </View>
        ) : null}

        <Input
          label="Current Password"
          value={currentPassword}
          onChangeText={v => { setCurrentPassword(v); setPasswordErrors(e => ({ ...e, currentPassword: undefined })); setPasswordSuccess(''); }}
          error={passwordErrors.currentPassword}
          secureTextEntry
        />
        <Input
          label="New Password"
          value={newPassword}
          onChangeText={v => { setNewPassword(v); setPasswordErrors(e => ({ ...e, newPassword: undefined })); setPasswordSuccess(''); }}
          error={passwordErrors.newPassword}
          secureTextEntry
        />
        <Button onPress={handleChangePassword} loading={savingPassword} variant="secondary">
          Change Password
        </Button>
      </View>

      {/* Logout */}
      <View style={styles.section}>
        <Button onPress={handleLogout} variant="danger" accessibilityLabel="Log out">
          Log Out
        </Button>
      </View>

      <Text style={styles.memberSince}>
        Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundSecondary },
  content: { padding: spacing.base, paddingBottom: spacing.huge },
  avatarCard: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.base,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  avatarInitial: { ...typography.h1, color: '#fff' },
  userName: { ...typography.h3, color: colors.textPrimary },
  userEmail: { ...typography.body, color: colors.textSecondary, marginTop: spacing.xs },
  section: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.base,
  },
  sectionTitle: { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.base },
  errorBanner: {
    backgroundColor: '#FEF2F2',
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.base,
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
  },
  errorText: { ...typography.body, color: colors.error },
  successBanner: {
    backgroundColor: '#F0FDF4',
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.base,
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },
  successText: { ...typography.body, color: colors.success },
  memberSince: {
    ...typography.caption,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
