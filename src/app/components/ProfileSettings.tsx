import { User, Heart, Target, ShieldAlert, Leaf, LogOut, Plus } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { useState } from 'react';
import { toast } from 'sonner';
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

  const hasChanges = JSON.stringify(editingProfile) !== JSON.stringify(profile);

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
      <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-30">
        <div className="flex items-center gap-3">
          <button onClick={handleBackClick} className="text-gray-600">
            ← Back
          </button>
          <h1 className="text-xl font-bold text-gray-900">Profile Settings</h1>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Personal Info */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-bold text-gray-900">Personal Information</h3>
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <Input
                type="email"
                value={editingProfile.email}
                onChange={(e) => setEditingProfile({ ...editingProfile, email: e.target.value })}
                className="rounded-xl border-gray-200"
              />
            </div>
          </div>
        </div>

        {/* Allergies */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
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
        <div className="bg-white rounded-2xl p-6 shadow-sm">
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

        {isAdmin && (
          <Button
            onClick={onAdminDashboard}
            className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg flex items-center justify-center gap-2"
          >
            <ShieldAlert className="w-5 h-5" />
            Admin Dashboard
          </Button>
        )}

        <Button
          onClick={handleSaveChanges}
          disabled={!hasChanges}
          className="w-full h-14 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Save Changes
        </Button>

        <AlertDialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
          <AlertDialogContent>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Do you want to save them before {pendingAction === 'back' ? 'going back' : 'logging out'}?
            </AlertDialogDescription>
            <div className="flex gap-3 justify-end">
              <AlertDialogCancel asChild>
                <Button 
                  onClick={() => {
                    setShowUnsavedDialog(false);
                    setPendingAction(null);
                  }}
                  variant="outline"
                >
                  Keep Editing
                </Button>
              </AlertDialogCancel>
              <Button onClick={handleDiscardChanges} variant="outline" className="text-red-600 border-red-200">
                Discard Changes
              </Button>
              <Button onClick={handleSaveAndContinue} className="bg-amber-500 hover:bg-amber-600">
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
            <div className="flex gap-3 justify-end">
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
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
  );
}