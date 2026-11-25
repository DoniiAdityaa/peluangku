import ProfileForm from '@/components/profile/profile-form';
import type { ProfileFormProps } from '@/components/profile/profile-form';

/** "Profil & Dokumen": edit a profile that was filled in before. */
export default function AccountProfile(props: ProfileFormProps) {
    return <ProfileForm {...props} mode="edit" />;
}
