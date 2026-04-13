import { User, Heart, Target, ShieldAlert, Leaf, LogOut, Plus, Camera as CameraIcon, ArrowLeft, Trash2, Lock } from 'lucide-react';
import { useAppStore } from '../../lib/store';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { storage, auth } from '../../lib/firebase';
import { ref, uploadBytes, uploadString, getDownloadURL } from 'firebase/storage';
import { updatePassword, updateEmail, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './ui/alert-dialog';

interface ProfileData {
  name: string;
  email: string;
  avatar?: string;
  allergies: string[];
  dietaryPreferences: string[];
  healthGoal: string[];
}

interface ProfileSettingsProps {
  profile: ProfileData;
  isAdmin?: boolean;
  onUpdateProfile: (profile: ProfileData) => void;
  onBack: () => void;
  onLogout: () => void;
  onAdminDashboard?: () => void;
}

const commonAllergies = ['Peanuts', 'Tree Nuts', 'Dairy', 'Eggs', 'Soy', 'Wheat', 'Fish', 'Shellfish'];
const dietaryOptions = ['Vegan', 'Vegetarian', 'Gluten-Free', 'Dairy-Free', 'Low-Sodium', 'Keto', 'Paleo', 'Halal'];
const healthGoals = ['Weight Loss', 'Muscle Gain', 'Heart Health', 'Low Sugar', 'High Protein', 'Balanced Diet'];

export function ProfileSettings({ 
  profile, 
  isAdmin, 
  onUpdateProfile, 
  onBack, 
  onLogout,
  onAdminDashboard
}: ProfileSettingsProps) {
  const [editingProfile, setEditingProfile] = useState<ProfileData>(profile);
  const [newAllergy, setNewAllergy] = useState('');
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<'back' | 'logout' | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Security States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingSecurity, setIsUpdatingSecurity] = useState(false);

  const hasChanges = JSON.stringify(editingProfile) !== JSON.stringify(profile);

  const handleAvatarUpload = async () => {
    let toastId;
    try {
      const photo = await Camera.getPhoto({
        resultType: CameraResultType.Base64,
        source: CameraSource.Prompt,
        allowEditing: true, // Enables native zoom/crop on mobile
        quality: 90,        // High quality setting to avoid pixelation
        width: 800,         // A good balance for avatars without losing detail
        height: 800,
      });

      if (!photo.base64String) {
        throw new Error('No image context returned');
      }

      setIsUploading(true);
      toastId = toast.loading('Uploading avatar photo...');
      
      const extension = photo.format || 'jpeg';
      const imageRef = ref(storage, `avatars/${editingProfile.email}_${Date.now()}.${extension}`);
      
      const downloadUrl = `data:image/${extension};base64,${photo.base64String}`;
      
      setEditingProfile({ ...editingProfile, avatar: downloadUrl });
      onUpdateProfile({ ...editingProfile, avatar: downloadUrl });
      toast.success('Avatar uploaded successfully!', { id: toastId });
    } catch (err: any) {
      if (err.message !== 'User cancelled photos app') {
        toast.error(`Avatar upload failed: ${err.message || 'Unknown error'}`, { id: toastId });
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveChanges = () => {
    onUpdateProfile(editingProfile);
    toast.success('Profile updated successfully!', {
      description: 'Your preferences have been saved.',
      duration: 3000,
    });
    // Optionally, navigate back after a delay
    setTimeout(() => {
      onBack();
    }, 1500);
  };

  const handleBackClick = () => {
    if (hasChanges) {
      setPendingAction('back');
      setShowUnsavedDialog(true);
    } else {
      onBack();
    }
  };

  const handleLogoutClick = () => {
    if (hasChanges) {
      setPendingAction('logout');
      setShowUnsavedDialog(true);
    } else {
      setShowLogoutDialog(true);
    }
  };

  const handleDiscardChanges = () => {
    setShowUnsavedDialog(false);
    if (pendingAction === 'back') {
      onBack();
    } else if (pendingAction === 'logout') {
      setShowLogoutDialog(true);
    }
    setPendingAction(null);
  };

  const handleSaveAndContinue = () => {
    onUpdateProfile(editingProfile);
    setShowUnsavedDialog(false);
    if (pendingAction === 'back') {
      onBack();
    } else if (pendingAction === 'logout') {
      setShowLogoutDialog(true);
    }
    setPendingAction(null);
  };

  const handleUpdateSecurity = async () => {
    if (!auth.currentUser) {
      toast.error('You must be logged in to update security settings.');
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      toast.error('New passwords do not match!');
      return;
    }

    if (!currentPassword) {
      toast.error('Please enter your current password to confirm changes.');
      return;
    }

    setIsUpdatingSecurity(true);
    const toastId = toast.loading('Updating security settings...');

    try {
      // 1. Re-authenticate
      const credential = EmailAuthProvider.credential(auth.currentUser.email!, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);

      // 2. Update Password if provided
      if (newPassword) {
        await updatePassword(auth.currentUser, newPassword);
      }

      // 3. Update Email if changed
      if (editingProfile.email !== profile.email) {
        await updateEmail(auth.currentUser, editingProfile.email);
      }

      toast.success('Security settings updated successfully!', { id: toastId });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      onUpdateProfile(editingProfile);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update security settings.', { id: toastId });
    } finally {
      setIsUpdatingSecurity(false);
    }
  };

  const toggleAllergy = (allergy: string) => {
    const newAllergies = editingProfile.allergies.includes(allergy)
      ? editingProfile.allergies.filter(a => a !== allergy)
      : [...editingProfile.allergies, allergy];
    setEditingProfile({ ...editingProfile, allergies: newAllergies });
  };

  const addCustomAllergy = () => {
    if (newAllergy.trim() && !editingProfile.allergies.includes(newAllergy.trim())) {
      setEditingProfile({ ...editingProfile, allergies: [...editingProfile.allergies, newAllergy.trim()] });
      setNewAllergy('');
      toast.success('Allergy added!');
    }
  };

  const toggleDietaryPref = (pref: string) => {
    const newPrefs = editingProfile.dietaryPreferences.includes(pref)
      ? editingProfile.dietaryPreferences.filter(p => p !== pref)
      : [...editingProfile.dietaryPreferences, pref];
    setEditingProfile({ ...editingProfile, dietaryPreferences: newPrefs });
  };

  const toggleHealthGoal = (goal: string) => {
    const newGoals = editingProfile.healthGoal.includes(goal)
      ? editingProfile.healthGoal.filter(g => g !== goal)
      : [...editingProfile.healthGoal, goal];
    setEditingProfile({ ...editingProfile, healthGoal: newGoals });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <div className="sticky top-0 bg-white/80 backdrop-blur-xl border-b border-gray-100/50 px-6 py-4 z-30 transition-all duration-300">
        <div className="flex items-center gap-3">
          <button onClick={handleBackClick} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 text-gray-700 hover:bg-gray-50 hover:text-[#FF6B35] transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-gray-900 flex-1 ml-2">Profile Settings</h1>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Personal Info */}
        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
          <div className="flex items-center gap-2 mb-6">
            <User className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-bold text-gray-900">Personal Information</h3>
          </div>

          <div className="mb-6 flex flex-col items-center">
            <div className="relative group cursor-pointer" onClick={handleAvatarUpload}>
              <div className={`w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-lg flex items-center justify-center bg-gray-50 ${isUploading ? 'opacity-50' : 'hover:scale-105 transition-transform'}`}>
                {editingProfile.avatar ? (
                  <img src={editingProfile.avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-gray-300" />
                )}
              </div>
              <div className="absolute bottom-0 right-0 bg-blue-500 text-white p-2.5 rounded-full shadow-lg border-2 border-white hover:bg-blue-600 transition-colors">
                <CameraIcon className="w-4 h-4" />
              </div>
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></span>
                </div>
              )}
            </div>
            <div className="flex flex-col items-center gap-3">
              <p className="text-xs text-gray-500 font-medium tracking-wide uppercase">Tap to update photo</p>
              {editingProfile.avatar && (
                <Button 
                  onClick={() => setEditingProfile({ ...editingProfile, avatar: '' })}
                  variant="ghost" 
                  size="sm" 
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 text-xs px-3 h-8 rounded-full"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                  Remove Avatar
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <Input
                value={editingProfile.name}
                onChange={(e) => setEditingProfile({ ...editingProfile, name: e.target.value })}
                className="rounded-xl border-gray-200"
              />
            </div>
          </div>
        </div>

        {/* Security / Account Details */}
        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
          <div className="flex items-center gap-2 mb-6">
            <Lock className="w-5 h-5 text-gray-700" />
            <h3 className="text-lg font-bold text-gray-900">Account Security</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <Input
                type="email"
                value={editingProfile.email}
                onChange={(e) => setEditingProfile({ ...editingProfile, email: e.target.value })}
                className="rounded-xl border-gray-200"
              />
            </div>

            {auth.currentUser?.providerData.some(p => p.providerId === 'google.com') ? (
              <div className="pt-4 border-t border-gray-100">
                <p className="text-sm font-bold text-gray-900 mb-2">Account Security</p>
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
                  <p>You are signed in securely using Google Auth.</p>
                  <p className="mt-1 opacity-80">Your password and email can only be changed via your Google Account settings.</p>
                </div>
              </div>
            ) : (
              <div className="pt-4 border-t border-gray-100">
                <p className="text-sm font-bold text-gray-900 mb-4">Change Password</p>
                <div className="space-y-3">
                  <Input
                    type="password"
                    placeholder="Current Password (Required for changes)"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="rounded-xl border-gray-200"
                  />
                  <Input
                    type="password"
                    placeholder="New Password (Optional)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="rounded-xl border-gray-200"
                  />
                  {newPassword && (
                    <Input
                      type="password"
                      placeholder="Confirm New Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="rounded-xl border-gray-200"
                    />
                  )}
                </div>
              </div>
            )}

            {(newPassword || editingProfile.email !== profile.email) && !auth.currentUser?.providerData.some(p => p.providerId === 'google.com') && (
              <Button
                onClick={handleUpdateSecurity}
                disabled={isUpdatingSecurity || !currentPassword}
                className="w-full mt-4 bg-gray-900 hover:bg-black text-white font-semibold rounded-xl transition-all"
              >
                {isUpdatingSecurity ? 'Updating...' : 'Update Security Settings'}
              </Button>
            )}
          </div>
        </div>

        {/* Allergies */}
        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
          <div className="flex items-center gap-2 mb-4">
            <ShieldAlert className="w-5 h-5 text-red-500" />
            <h3 className="text-lg font-bold text-gray-900">Food Allergies</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Select any allergies to receive warnings when viewing recipes
          </p>
          
          {/* Add custom allergy */}
          <div className="mb-4 flex gap-2">
            <Input
              value={newAllergy}
              onChange={(e) => setNewAllergy(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addCustomAllergy()}
              placeholder="Add custom allergy..."
              className="rounded-xl border-gray-200 flex-1"
            />
            <Button
              onClick={addCustomAllergy}
              className="h-10 w-10 p-0 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 rounded-xl"
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {commonAllergies.map((allergy) => (
              <Badge
                key={allergy}
                onClick={() => toggleAllergy(allergy)}
                className={`cursor-pointer px-4 py-2 rounded-full transition-all ${
                  editingProfile.allergies.includes(allergy)
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {allergy}
              </Badge>
            ))}
            {/* Display custom allergies */}
            {editingProfile.allergies
              .filter(allergy => !commonAllergies.includes(allergy))
              .map((allergy) => (
                <Badge
                  key={allergy}
                  onClick={() => toggleAllergy(allergy)}
                  className="cursor-pointer px-4 py-2 rounded-full transition-all bg-red-500 text-white hover:bg-red-600"
                >
                  {allergy}
                </Badge>
              ))}
          </div>
        </div>

        {/* Dietary Preferences */}
        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
          <div className="flex items-center gap-2 mb-4">
            <Leaf className="w-5 h-5 text-green-500" />
            <h3 className="text-lg font-bold text-gray-900">Dietary Preferences</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Filter recipes based on your dietary needs (select multiple)
          </p>
          <div className="flex flex-wrap gap-2">
            {dietaryOptions.map((option) => (
              <Badge
                key={option}
                onClick={() => toggleDietaryPref(option)}
                className={`cursor-pointer px-4 py-2 rounded-full transition-all ${
                  editingProfile.dietaryPreferences.includes(option)
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {option}
              </Badge>
            ))}
          </div>
        </div>

        {/* Health Goals */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-purple-500" />
            <h3 className="text-lg font-bold text-gray-900">Health Goals</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Get personalized recipe recommendations (select multiple)
          </p>
          <div className="flex flex-wrap gap-2">
            {healthGoals.map((goal) => (
              <Badge
                key={goal}
                onClick={() => toggleHealthGoal(goal)}
                className={`cursor-pointer px-4 py-2 rounded-full transition-all ${
                  editingProfile.healthGoal.includes(goal)
                    ? 'bg-purple-500 text-white hover:bg-purple-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {goal}
              </Badge>
            ))}
          </div>
        </div>


        <div className="mt-8 space-y-4 pb-8">
          {isAdmin && (
            <Button
              onClick={onAdminDashboard}
              className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_12px_40px_rgba(37,99,235,0.3)] hover:-translate-y-1 hover:scale-[1.02]"
            >
              <ShieldAlert className="w-5 h-5" />
              Admin Dashboard
            </Button>
          )}

          <Button
            onClick={handleSaveChanges}
            disabled={!hasChanges}
            className="w-full h-14 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_12px_40px_rgba(249,115,22,0.3)] hover:-translate-y-1 hover:scale-[1.02]"
          >
            Save Changes
          </Button>

          <AlertDialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
            <AlertDialogContent>
              <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
              <AlertDialogDescription>
                You have unsaved changes. Do you want to save them before {pendingAction === 'back' ? 'going back' : 'logging out'}?
              </AlertDialogDescription>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:justify-end mt-4 w-full">
                <AlertDialogCancel asChild>
                  <Button 
                    onClick={() => {
                      setShowUnsavedDialog(false);
                      setPendingAction(null);
                    }}
                    variant="outline"
                    className="w-full sm:w-auto"
                  >
                    Keep Editing
                  </Button>
                </AlertDialogCancel>
                <Button onClick={handleDiscardChanges} variant="outline" className="w-full sm:w-auto text-red-600 border-red-200">
                  Discard Changes
                </Button>
                <Button onClick={handleSaveAndContinue} className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600">
                  Save Changes
                </Button>
              </div>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
            <AlertDialogTrigger asChild>
              <Button 
                onClick={handleLogoutClick}
                variant="outline"
                className="w-full h-14 border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 font-semibold rounded-xl flex items-center justify-center gap-2"
              >
                <LogOut className="w-5 h-5" />
                Log Out
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogTitle>Log Out?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to log out? You'll need to sign in again to access your profile and bookmarked recipes.
              </AlertDialogDescription>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:justify-end mt-4 w-full">
                <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white"
                  onClick={(event) => {
                    event.preventDefault();
                    setShowLogoutDialog(false);
                    onLogout();
                  }}
                >
                  Log Out
                </AlertDialogAction>
              </div>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}