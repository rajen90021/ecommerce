import '../config/association.js'; // Ensure models are associated
import { connectDB } from '../config/db.js';
import { createRole } from '../helpers/createRole.js';

 export const seedRoles = async () => {
  await connectDB();
  await createRole();
  console.log('Roles seeded successfully.');
  process.exit(0);
};

seedRoles().catch(err => {
  console.error('Failed to seed roles:', err);
  process.exit(1);
});

