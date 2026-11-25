import ProfileForm from '@/components/profile/profile-form';
import type { ProfileFormProps } from '@/components/profile/profile-form';

/** Onboarding step 2: fill in the profile (empty, or pre-filled by AI). */
export default function OnboardingProfile(props: ProfileFormProps) {
    return <ProfileForm {...props} mode="onboarding" />;
}
