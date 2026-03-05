import { useState } from 'react';
import { ArrowRight, ShieldAlert, Leaf, Target, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';

interface RegistrationData {
  email: string;
  password: string;
  name: string;
  allergies: string[];
  dietaryPreferences: string[];
  healthGoal: string[];
}

interface RegistrationFlowProps {
  onComplete: (data: RegistrationData) => void;
  onCancel: () => void;
}

const commonAllergies = ['Peanuts', 'Tree Nuts', 'Dairy', 'Eggs', 'Soy', 'Wheat', 'Fish', 'Shellfish'];
const dietaryOptions = ['Vegan', 'Vegetarian', 'Gluten-Free', 'Dairy-Free', 'Low-Sodium', 'Keto', 'Paleo', 'High Protein', 'Low Carb', 'Low Sugar'];
const healthGoals = ['Weight Loss', 'Muscle Gain', 'Heart Health', 'Low Sugar', 'High Protein', 'Balanced Diet'];

export function RegistrationFlow({ onComplete, onCancel }: RegistrationFlowProps) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<RegistrationData>({
    email: '',
    password: '',
    name: '',
    allergies: [],
    dietaryPreferences: [],
    healthGoal: [],
  });
  const [newAllergy, setNewAllergy] = useState('');
  const [errors, setErrors] = useState({ email: '', password: '', name: '' });

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateStep1 = () => {
    const newErrors = { email: '', password: '', name: '' };
    let isValid = true;

    if (!data.name.trim()) {
      newErrors.name = 'Name is required';
      isValid = false;
    }

    if (!data.email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!validateEmail(data.email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    if (!data.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (data.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const toggleAllergy = (allergy: string) => {
    setData({
      ...data,
      allergies: data.allergies.includes(allergy)
        ? data.allergies.filter(a => a !== allergy)
        : [...data.allergies, allergy],
    });
  };

  const addCustomAllergy = () => {
    if (newAllergy.trim() && !data.allergies.includes(newAllergy.trim())) {
      setData({ ...data, allergies: [...data.allergies, newAllergy.trim()] });
      setNewAllergy('');
    }
  };

  const toggleDietaryPref = (pref: string) => {
    setData({
      ...data,
      dietaryPreferences: data.dietaryPreferences.includes(pref)
        ? data.dietaryPreferences.filter(p => p !== pref)
        : [...data.dietaryPreferences, pref],
    });
  };

  const toggleHealthGoal = (goal: string) => {
    setData({
      ...data,
      healthGoal: data.healthGoal.includes(goal)
        ? data.healthGoal.filter(g => g !== goal)
        : [...data.healthGoal, goal],
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <motion.img
            src="/rb_logo.png"
            alt="RecipeBuddy Logo"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="w-44 h-44 object-contain mb-2 mx-auto block"
          />
          <p className="text-gray-600">Step {step} of 4</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8 bg-white/50 rounded-full h-2 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-amber-500 to-orange-500"
            initial={{ width: '25%' }}
            animate={{ width: `${(step / 4) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Create Account</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <Input
                      value={data.name}
                      onChange={(e) => {
                        setData({ ...data, name: e.target.value });
                        setErrors({ ...errors, name: '' });
                      }}
                      placeholder="John Doe"
                      className={`h-12 rounded-xl border-gray-200 ${errors.name ? 'border-red-500 focus:border-red-500' : ''}`}
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <Input
                      type="email"
                      value={data.email}
                      onChange={(e) => {
                        setData({ ...data, email: e.target.value });
                        setErrors({ ...errors, email: '' });
                      }}
                      placeholder="your@email.com"
                      className={`h-12 rounded-xl border-gray-200 ${errors.email ? 'border-red-500 focus:border-red-500' : ''}`}
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                    <Input
                      type="password"
                      value={data.password}
                      onChange={(e) => {
                        setData({ ...data, password: e.target.value });
                        setErrors({ ...errors, password: '' });
                      }}
                      placeholder="••••••••"
                      className={`h-12 rounded-xl border-gray-200 ${errors.password ? 'border-red-500 focus:border-red-500' : ''}`}
                    />
                    {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                    <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
                  </div>
                </div>
              </div>
              <Button
                onClick={() => {
                  if (validateStep1()) {
                    setStep(2);
                  }
                }}
                disabled={!data.name || !data.email || !data.password}
                className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                onClick={onCancel}
                variant="ghost"
                className="w-full"
              >
                Already have an account? Sign In
              </Button>
            </motion.div>
          )}

          {/* Step 2: Allergies */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldAlert className="w-5 h-5 text-red-500" />
                  <h2 className="text-xl font-bold text-gray-900">Food Allergies</h2>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Select any allergies so we can warn you about recipes
                </p>
                {/* Add custom allergy input */}
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
                        data.allergies.includes(allergy)
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {allergy}
                    </Badge>
                  ))}
                  {/* Display custom allergies */}
                  {data.allergies
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
              <div className="flex gap-3">
                <Button
                  onClick={() => setStep(1)}
                  variant="outline"
                  className="flex-1 h-12 rounded-xl"
                >
                  Back
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  className="flex-1 h-12 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl"
                >
                  Next <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Dietary Preferences */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Leaf className="w-5 h-5 text-green-500" />
                  <h2 className="text-xl font-bold text-gray-900">Dietary Preferences</h2>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Choose your dietary preferences for personalized recipes
                </p>
                <div className="flex flex-wrap gap-2">
                  {dietaryOptions.map((option) => (
                    <Badge
                      key={option}
                      onClick={() => toggleDietaryPref(option)}
                      className={`cursor-pointer px-4 py-2 rounded-full transition-all ${
                        data.dietaryPreferences.includes(option)
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {option}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => setStep(2)}
                  variant="outline"
                  className="flex-1 h-12 rounded-xl"
                >
                  Back
                </Button>
                <Button
                  onClick={() => setStep(4)}
                  className="flex-1 h-12 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl"
                >
                  Next <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Health Goal */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-purple-500" />
                  <h2 className="text-xl font-bold text-gray-900">Health Goal</h2>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Select your primary health goal for tailored recommendations
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {healthGoals.map((goal) => (
                    <button
                      key={goal}
                      onClick={() => toggleHealthGoal(goal)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        data.healthGoal.includes(goal)
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <div className="font-semibold text-sm text-gray-900">{goal}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => setStep(3)}
                  variant="outline"
                  className="flex-1 h-12 rounded-xl"
                >
                  Back
                </Button>
                <Button
                  onClick={() => onComplete(data)}
                  disabled={data.healthGoal.length === 0}
                  className="flex-1 h-12 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl"
                >
                  Complete Setup
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}