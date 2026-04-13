const fs = require('fs');

let code = fs.readFileSync('src/app/components/AddRecipeForm.tsx', 'utf8');

// 1. Add imports
code = code.replace(
  "import { useState } from 'react';",
  "import { useState } from 'react';\nimport { useForm, Controller } from 'react-hook-form';\nimport { yupResolver } from '@hookform/resolvers/yup';\nimport * as yup from 'yup';"
);

// 2. Define schema
const schemaStr = `
const recipeSchema = yup.object().shape({
  title: yup.string().required('Title is required').min(3, 'Title too short'),
  description: yup.string().required('Description is required').min(10, 'Please add more detail'),
  image: yup.string(),
  time: yup.string(),
  servings: yup.string().required('Servings is required'),
  prepTime: yup.number().positive().required(),
  cookTime: yup.number().min(0).required(),
  category: yup.string(),
  categories: yup.array().of(yup.string().required()).min(1, 'Select at least one category'),
  dietaryTags: yup.array().of(yup.string().required()),
  allergens: yup.array().of(yup.string().required()),
  calories: yup.string().required(),
  protein: yup.string().required(),
  carbs: yup.string().required(),
  fat: yup.string().required(),
  fiber: yup.string(),
  sugar: yup.string()
});
`;

code = code.replace("const STORE_OPTIONS = [", schemaStr + '\nconst STORE_OPTIONS = [');

// 3. Inject useForm inside the component
code = code.replace(
  "const [expandedIngredient, setExpandedIngredient] = useState<number | null>(null);",
  `const [expandedIngredient, setExpandedIngredient] = useState<number | null>(null);
  
  const { register, handleSubmit: rxSubmit, trigger, formState: { errors, isValid } } = useForm({
    resolver: yupResolver(recipeSchema as any),
    mode: 'all'
  });`
);

// 4. Change steps validation to RHF
code = code.replace(
  "const isStep1Valid = formData.title && formData.description && formData.image && formData.categories.length > 0;",
  "const isStep1Valid = formData.title && formData.description && formData.image && formData.categories.length > 0;"
);

// 5. Submit Handle
code = code.replace(
  "const handleSubmit = () => {",
  `const handleSubmit = async () => {
    try {
      await recipeSchema.validate(formData, { abortEarly: false });
    } catch (err: any) {
      if (err.inner && err.inner.length > 0) {
        alert("Validation error: " + err.inner[0].message);
        return;
      }
    }
    rxSubmit(() => {})();
`
);

fs.writeFileSync('src/app/components/AddRecipeForm.tsx', code);
console.log("Rewrite complete.");
